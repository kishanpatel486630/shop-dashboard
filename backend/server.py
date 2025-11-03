from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import stripe
from twilio.rest import Client
import phonenumbers

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Stripe
stripe.api_key = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")

# Twilio
twilio_account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
twilio_auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "")
twilio_phone_number = os.environ.get("TWILIO_PHONE_NUMBER", "")
twilio_client = None
if twilio_account_sid and twilio_auth_token:
    twilio_client = Client(twilio_account_sid, twilio_auth_token)

# Models
class Branch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    contactNumber: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BranchCreate(BaseModel):
    name: str
    address: str
    contactNumber: str

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fullName: str
    username: str
    role: str
    branchId: str
    commissionRate: float = 0.05
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmployeeCreate(BaseModel):
    fullName: str
    username: str
    password: str
    role: str
    branchId: str
    commissionRate: float = 0.05

class LoginRequest(BaseModel):
    username: str
    password: str

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phoneNumber: str
    name: Optional[str] = None
    loyaltyPoints: float = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    phoneNumber: str
    name: Optional[str] = None

class ProductVariant(BaseModel):
    sku: str
    barcode: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    price: float
    stock: List[Dict[str, Any]] = []

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category: str
    brand: Optional[str] = None
    variants: List[ProductVariant] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    brand: Optional[str] = None
    variants: List[ProductVariant]

class BillItem(BaseModel):
    productId: str
    variantSku: str
    productName: str
    quantity: int
    unitPrice: float
    lineTotal: float

class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    billNumber: str
    branchId: str
    employeeId: str
    customerId: str
    items: List[BillItem]
    subtotal: float
    discountAmount: float = 0
    totalAmount: float
    paymentMethod: str
    status: str = "completed"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BillCreate(BaseModel):
    customerPhoneNumber: str
    items: List[Dict[str, Any]]
    discount: float = 0
    paymentMethod: str

class Commission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employeeId: str
    billId: str
    saleAmount: float
    commissionRate: float
    commissionAmount: float
    status: str = "pending"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StockInRequest(BaseModel):
    branchId: str
    sku: str
    quantity: int

class StockTransferRequest(BaseModel):
    fromBranchId: str
    toBranchId: str
    sku: str
    quantity: int

class ReturnRequest(BaseModel):
    originalBillId: str
    items: List[Dict[str, Any]]  # [{"sku": "...", "quantity": 1}]
    reason: Optional[str] = None

class CommissionPayoutRequest(BaseModel):
    commissionIds: List[str]

class PaymentIntentRequest(BaseModel):
    amount: float
    currency: str = "usd"

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.employees.find_one({"username": username, "isActive": True}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def send_sms(to_number: str, message: str) -> bool:
    """Send SMS via Twilio"""
    if not twilio_client or not twilio_phone_number:
        logging.warning("Twilio not configured, SMS not sent")
        return False
    try:
        # Parse and format phone number
        parsed = phonenumbers.parse(to_number, None)
        formatted_number = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        
        message = twilio_client.messages.create(
            body=message,
            from_=twilio_phone_number,
            to=formatted_number
        )
        logging.info(f"SMS sent successfully: {message.sid}")
        return True
    except Exception as e:
        logging.error(f"Failed to send SMS: {str(e)}")
        return False

def format_bill_sms(bill_data: dict, branch_data: dict) -> str:
    """Format bill data into SMS message"""
    items_text = "\n".join([f"  {item['productName']}: ${item['lineTotal']:.2f}" for item in bill_data['items'][:3]])
    if len(bill_data['items']) > 3:
        items_text += f"\n  ... and {len(bill_data['items']) - 3} more items"
    
    return f"""{branch_data['name']}
Bill #{bill_data['billNumber']}
{items_text}
Total: ${bill_data['totalAmount']:.2f}
Thank you for shopping with us!"""

# Auth Routes
@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.employees.find_one({"username": request.username, "isActive": True}, {"_id": 0})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    user_data = {k: v for k, v in user.items() if k != "password"}
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

# Branch Routes
@api_router.post("/branches", response_model=Branch)
async def create_branch(branch: BranchCreate, current_user: dict = Depends(get_admin_user)):
    branch_dict = branch.model_dump()
    branch_obj = Branch(**branch_dict)
    doc = branch_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.branches.insert_one(doc)
    return branch_obj

@api_router.get("/branches", response_model=List[Branch])
async def get_branches(current_user: dict = Depends(get_current_user)):
    branches = await db.branches.find({"isActive": True}, {"_id": 0}).to_list(1000)
    for branch in branches:
        if isinstance(branch['createdAt'], str):
            branch['createdAt'] = datetime.fromisoformat(branch['createdAt'])
    return branches

@api_router.get("/branches/{branch_id}", response_model=Branch)
async def get_branch(branch_id: str, current_user: dict = Depends(get_current_user)):
    branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    if isinstance(branch['createdAt'], str):
        branch['createdAt'] = datetime.fromisoformat(branch['createdAt'])
    return branch

# Employee Routes
@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, current_user: dict = Depends(get_admin_user)):
    existing = await db.employees.find_one({"username": employee.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    employee_dict = employee.model_dump()
    password = employee_dict.pop("password")
    employee_dict["password"] = hash_password(password)
    
    employee_obj = Employee(**{k: v for k, v in employee_dict.items() if k != "password"})
    doc = employee_obj.model_dump()
    doc['password'] = employee_dict["password"]
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.employees.insert_one(doc)
    return employee_obj

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(current_user: dict = Depends(get_admin_user)):
    employees = await db.employees.find({"isActive": True}, {"_id": 0, "password": 0}).to_list(1000)
    for emp in employees:
        if isinstance(emp['createdAt'], str):
            emp['createdAt'] = datetime.fromisoformat(emp['createdAt'])
    return employees

# Customer Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.customers.find_one({"phoneNumber": customer.phoneNumber}, {"_id": 0})
    if existing:
        if isinstance(existing['createdAt'], str):
            existing['createdAt'] = datetime.fromisoformat(existing['createdAt'])
        return existing
    
    customer_obj = Customer(**customer.model_dump())
    doc = customer_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.customers.insert_one(doc)
    return customer_obj

@api_router.get("/customers/search/{phone}")
async def search_customer(phone: str, current_user: dict = Depends(get_current_user)):
    customer = await db.customers.find_one({"phoneNumber": phone}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if isinstance(customer['createdAt'], str):
        customer['createdAt'] = datetime.fromisoformat(customer['createdAt'])
    return customer

@api_router.get("/customers/{customer_id}/bills")
async def get_customer_bills(customer_id: str, current_user: dict = Depends(get_current_user)):
    bills = await db.bills.find({"customerId": customer_id}, {"_id": 0}).to_list(1000)
    for bill in bills:
        if isinstance(bill['createdAt'], str):
            bill['createdAt'] = datetime.fromisoformat(bill['createdAt'])
    return bills

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_admin_user)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(current_user: dict = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product['createdAt'], str):
            product['createdAt'] = datetime.fromisoformat(product['createdAt'])
    return products

@api_router.get("/products/search/barcode/{code}")
async def search_by_barcode(code: str, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"variants.barcode": code}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['createdAt'], str):
        product['createdAt'] = datetime.fromisoformat(product['createdAt'])
    return product

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['createdAt'], str):
        product['createdAt'] = datetime.fromisoformat(product['createdAt'])
    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, current_user: dict = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}

# Inventory Routes
@api_router.post("/inventory/stock-in")
async def stock_in(request: StockInRequest, current_user: dict = Depends(get_admin_user)):
    product = await db.products.find_one({"variants.sku": request.sku}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product variant not found")
    
    for i, variant in enumerate(product["variants"]):
        if variant["sku"] == request.sku:
            stock_found = False
            for j, stock_entry in enumerate(variant["stock"]):
                if stock_entry["branchId"] == request.branchId:
                    variant["stock"][j]["quantity"] += request.quantity
                    stock_found = True
                    break
            
            if not stock_found:
                variant["stock"].append({"branchId": request.branchId, "quantity": request.quantity})
            
            await db.products.update_one(
                {"id": product["id"]},
                {"$set": {f"variants.{i}": variant}}
            )
            return {"message": "Stock added successfully", "newQuantity": sum(s["quantity"] for s in variant["stock"])}
    
    raise HTTPException(status_code=404, detail="Variant not found")

@api_router.post("/inventory/transfer")
async def transfer_stock(request: StockTransferRequest, current_user: dict = Depends(get_admin_user)):
    product = await db.products.find_one({"variants.sku": request.sku}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product variant not found")
    
    for i, variant in enumerate(product["variants"]):
        if variant["sku"] == request.sku:
            from_stock_idx = None
            to_stock_idx = None
            
            for j, stock_entry in enumerate(variant["stock"]):
                if stock_entry["branchId"] == request.fromBranchId:
                    from_stock_idx = j
                if stock_entry["branchId"] == request.toBranchId:
                    to_stock_idx = j
            
            if from_stock_idx is None:
                raise HTTPException(status_code=400, detail="Source branch has no stock")
            
            if variant["stock"][from_stock_idx]["quantity"] < request.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock at source branch")
            
            variant["stock"][from_stock_idx]["quantity"] -= request.quantity
            
            if to_stock_idx is not None:
                variant["stock"][to_stock_idx]["quantity"] += request.quantity
            else:
                variant["stock"].append({"branchId": request.toBranchId, "quantity": request.quantity})
            
            await db.products.update_one(
                {"id": product["id"]},
                {"$set": {f"variants.{i}": variant}}
            )
            
            # Log transfer
            await db.stock_transfers.insert_one({
                "id": str(uuid.uuid4()),
                "sku": request.sku,
                "fromBranchId": request.fromBranchId,
                "toBranchId": request.toBranchId,
                "quantity": request.quantity,
                "transferredBy": current_user["id"],
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
            
            return {"message": "Stock transferred successfully"}
    
    raise HTTPException(status_code=404, detail="Variant not found")

@api_router.get("/inventory/low-stock")
async def get_low_stock(current_user: dict = Depends(get_admin_user), threshold: int = 10):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    low_stock_items = []
    
    for product in products:
        for variant in product["variants"]:
            total_stock = sum(s["quantity"] for s in variant["stock"])
            if total_stock < threshold:
                low_stock_items.append({
                    "productId": product["id"],
                    "productName": product["name"],
                    "sku": variant["sku"],
                    "color": variant.get("color"),
                    "size": variant.get("size"),
                    "currentStock": total_stock
                })
    
    return low_stock_items

# Billing Routes
@api_router.post("/billing", response_model=Bill)
async def create_bill(bill_request: BillCreate, current_user: dict = Depends(get_current_user)):
    # Find or create customer
    customer = await db.customers.find_one({"phoneNumber": bill_request.customerPhoneNumber}, {"_id": 0})
    if not customer:
        customer_obj = Customer(phoneNumber=bill_request.customerPhoneNumber)
        customer_doc = customer_obj.model_dump()
        customer_doc['createdAt'] = customer_doc['createdAt'].isoformat()
        await db.customers.insert_one(customer_doc)
        customer = customer_doc
    
    # Process items and calculate totals
    bill_items = []
    subtotal = 0
    
    for item in bill_request.items:
        product = await db.products.find_one({"variants.sku": item["sku"]}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with SKU {item['sku']} not found")
        
        variant = next((v for v in product["variants"] if v["sku"] == item["sku"]), None)
        if not variant:
            raise HTTPException(status_code=404, detail=f"Variant {item['sku']} not found")
        
        # Check stock
        stock_entry = next((s for s in variant["stock"] if s["branchId"] == current_user["branchId"]), None)
        if not stock_entry or stock_entry["quantity"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        line_total = variant["price"] * item["quantity"]
        subtotal += line_total
        
        bill_items.append(BillItem(
            productId=product["id"],
            variantSku=variant["sku"],
            productName=f"{product['name']} ({variant.get('color', '')}, {variant.get('size', '')})",
            quantity=item["quantity"],
            unitPrice=variant["price"],
            lineTotal=line_total
        ))
    
    # Generate bill number
    bill_count = await db.bills.count_documents({"branchId": current_user["branchId"]})
    bill_number = f"BR-{current_user['branchId'][:4]}-{str(bill_count + 1).zfill(5)}"
    
    # Create bill
    total_amount = subtotal - bill_request.discount
    bill_obj = Bill(
        billNumber=bill_number,
        branchId=current_user["branchId"],
        employeeId=current_user["id"],
        customerId=customer["id"],
        items=[item.model_dump() for item in bill_items],
        subtotal=subtotal,
        discountAmount=bill_request.discount,
        totalAmount=total_amount,
        paymentMethod=bill_request.paymentMethod
    )
    
    bill_doc = bill_obj.model_dump()
    bill_doc['createdAt'] = bill_doc['createdAt'].isoformat()
    
    # Update inventory
    for item in bill_request.items:
        product = await db.products.find_one({"variants.sku": item["sku"]}, {"_id": 0})
        for i, variant in enumerate(product["variants"]):
            if variant["sku"] == item["sku"]:
                for j, stock_entry in enumerate(variant["stock"]):
                    if stock_entry["branchId"] == current_user["branchId"]:
                        product["variants"][i]["stock"][j]["quantity"] -= item["quantity"]
                        await db.products.update_one(
                            {"id": product["id"]},
                            {"$set": {f"variants.{i}.stock.{j}.quantity": product["variants"][i]["stock"][j]["quantity"]}}
                        )
                        break
    
    # Create commission
    employee = await db.employees.find_one({"id": current_user["id"]}, {"_id": 0})
    commission_amount = total_amount * employee.get("commissionRate", 0.05)
    commission_obj = Commission(
        employeeId=current_user["id"],
        billId=bill_obj.id,
        saleAmount=total_amount,
        commissionRate=employee.get("commissionRate", 0.05),
        commissionAmount=commission_amount
    )
    commission_doc = commission_obj.model_dump()
    commission_doc['createdAt'] = commission_doc['createdAt'].isoformat()
    await db.commissions.insert_one(commission_doc)
    
    # Save bill
    await db.bills.insert_one(bill_doc)
    
    # Send SMS notification
    branch = await db.branches.find_one({"id": current_user["branchId"]}, {"_id": 0})
    if branch and customer["phoneNumber"]:
        sms_message = format_bill_sms(bill_doc, branch)
        send_sms(customer["phoneNumber"], sms_message)
    
    return bill_obj

@api_router.get("/billing")
async def get_bills(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "admin":
        bills = await db.bills.find({}, {"_id": 0}).to_list(1000)
    else:
        bills = await db.bills.find({"employeeId": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    for bill in bills:
        if isinstance(bill['createdAt'], str):
            bill['createdAt'] = datetime.fromisoformat(bill['createdAt'])
    return bills

@api_router.get("/billing/{bill_id}")
async def get_bill(bill_id: str, current_user: dict = Depends(get_current_user)):
    bill = await db.bills.find_one({"id": bill_id}, {"_id": 0})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if isinstance(bill['createdAt'], str):
        bill['createdAt'] = datetime.fromisoformat(bill['createdAt'])
    return bill

@api_router.post("/billing/return")
async def process_return(return_request: ReturnRequest, current_user: dict = Depends(get_current_user)):
    # Get original bill
    original_bill = await db.bills.find_one({"id": return_request.originalBillId}, {"_id": 0})
    if not original_bill:
        raise HTTPException(status_code=404, detail="Original bill not found")
    
    if original_bill["status"] == "returned":
        raise HTTPException(status_code=400, detail="Bill already returned")
    
    # Process return items
    return_items = []
    return_total = 0
    
    for return_item in return_request.items:
        # Find item in original bill
        original_item = next((item for item in original_bill["items"] if item["variantSku"] == return_item["sku"]), None)
        if not original_item:
            raise HTTPException(status_code=404, detail=f"Item {return_item['sku']} not found in original bill")
        
        if return_item["quantity"] > original_item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Return quantity exceeds original quantity for {return_item['sku']}")
        
        return_total += original_item["unitPrice"] * return_item["quantity"]
        return_items.append({
            "variantSku": return_item["sku"],
            "productName": original_item["productName"],
            "quantity": return_item["quantity"],
            "unitPrice": original_item["unitPrice"],
            "lineTotal": original_item["unitPrice"] * return_item["quantity"]
        })
        
        # Restore inventory
        product = await db.products.find_one({"variants.sku": return_item["sku"]}, {"_id": 0})
        for i, variant in enumerate(product["variants"]):
            if variant["sku"] == return_item["sku"]:
                for j, stock_entry in enumerate(variant["stock"]):
                    if stock_entry["branchId"] == original_bill["branchId"]:
                        product["variants"][i]["stock"][j]["quantity"] += return_item["quantity"]
                        await db.products.update_one(
                            {"id": product["id"]},
                            {"$set": {f"variants.{i}.stock.{j}.quantity": product["variants"][i]["stock"][j]["quantity"]}}
                        )
                        break
    
    # Create return bill
    bill_count = await db.bills.count_documents({"branchId": original_bill["branchId"]})
    return_bill_number = f"RET-{original_bill['branchId'][:4]}-{str(bill_count + 1).zfill(5)}"
    
    return_bill = {
        "id": str(uuid.uuid4()),
        "billNumber": return_bill_number,
        "branchId": original_bill["branchId"],
        "employeeId": current_user["id"],
        "customerId": original_bill["customerId"],
        "items": return_items,
        "subtotal": -return_total,
        "discountAmount": 0,
        "totalAmount": -return_total,
        "paymentMethod": "Return",
        "status": "returned",
        "relatedBillId": return_request.originalBillId,
        "returnReason": return_request.reason,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bills.insert_one(return_bill)
    
    # Reverse commission
    commission = await db.commissions.find_one({"billId": return_request.originalBillId}, {"_id": 0})
    if commission:
        reverse_commission_amount = (return_total / original_bill["totalAmount"]) * commission["commissionAmount"]
        reverse_commission = {
            "id": str(uuid.uuid4()),
            "employeeId": original_bill["employeeId"],
            "billId": return_bill["id"],
            "saleAmount": -return_total,
            "commissionRate": commission["commissionRate"],
            "commissionAmount": -reverse_commission_amount,
            "status": "pending",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        await db.commissions.insert_one(reverse_commission)
    
    # Update original bill status
    full_return = all(return_item["quantity"] == next(item["quantity"] for item in original_bill["items"] if item["variantSku"] == return_item["sku"]) for return_item in return_request.items)
    status = "returned" if full_return else "partial-return"
    await db.bills.update_one({"id": return_request.originalBillId}, {"$set": {"status": status}})
    
    return {"message": "Return processed successfully", "returnBillId": return_bill["id"], "refundAmount": return_total}

# Commission Routes
@api_router.get("/commissions/my")
async def get_my_commissions(current_user: dict = Depends(get_current_user)):
    commissions = await db.commissions.find({"employeeId": current_user["id"]}, {"_id": 0}).to_list(1000)
    for comm in commissions:
        if isinstance(comm['createdAt'], str):
            comm['createdAt'] = datetime.fromisoformat(comm['createdAt'])
    return commissions

@api_router.get("/commissions/all")
async def get_all_commissions(current_user: dict = Depends(get_admin_user)):
    commissions = await db.commissions.find({}, {"_id": 0}).to_list(1000)
    for comm in commissions:
        if isinstance(comm['createdAt'], str):
            comm['createdAt'] = datetime.fromisoformat(comm['createdAt'])
    return commissions

@api_router.post("/commissions/payout")
async def payout_commissions(request: CommissionPayoutRequest, current_user: dict = Depends(get_admin_user)):
    for comm_id in request.commissionIds:
        await db.commissions.update_one(
            {"id": comm_id},
            {"$set": {"status": "paid", "paidAt": datetime.now(timezone.utc).isoformat()}}
        )
    return {"message": "Commissions marked as paid"}

# Payment Routes
@api_router.post("/payments/create-intent")
async def create_payment_intent(request: PaymentIntentRequest, current_user: dict = Depends(get_current_user)):
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(request.amount * 100),  # Convert to cents
            currency=request.currency,
            metadata={"employee_id": current_user["id"], "branch_id": current_user["branchId"]}
        )
        return {"clientSecret": intent.client_secret, "paymentIntentId": intent.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Dashboard Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "admin":
        bills = await db.bills.find({"status": {"$ne": "returned"}}, {"_id": 0}).to_list(10000)
    else:
        bills = await db.bills.find({"employeeId": current_user["id"], "status": {"$ne": "returned"}}, {"_id": 0}).to_list(10000)
    
    total_sales = sum(bill["totalAmount"] for bill in bills)
    total_transactions = len(bills)
    avg_bill_value = total_sales / total_transactions if total_transactions > 0 else 0
    
    return {
        "totalSales": total_sales,
        "totalTransactions": total_transactions,
        "avgBillValue": avg_bill_value
    }

@api_router.get("/reports/sales")
async def get_sales_report(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    branch_id: Optional[str] = None,
    employee_id: Optional[str] = None
):
    query = {"status": {"$ne": "returned"}}
    
    if start_date:
        query["createdAt"] = {"$gte": start_date}
    if end_date:
        if "createdAt" in query:
            query["createdAt"]["$lte"] = end_date
        else:
            query["createdAt"] = {"$lte": end_date}
    
    if branch_id:
        query["branchId"] = branch_id
    if employee_id:
        query["employeeId"] = employee_id
    elif current_user["role"] != "admin":
        query["employeeId"] = current_user["id"]
    
    bills = await db.bills.find(query, {"_id": 0}).to_list(10000)
    
    total_sales = sum(bill["totalAmount"] for bill in bills)
    total_discount = sum(bill["discountAmount"] for bill in bills)
    payment_methods = {}
    
    for bill in bills:
        method = bill["paymentMethod"]
        if method not in payment_methods:
            payment_methods[method] = {"count": 0, "total": 0}
        payment_methods[method]["count"] += 1
        payment_methods[method]["total"] += bill["totalAmount"]
    
    return {
        "totalSales": total_sales,
        "totalTransactions": len(bills),
        "totalDiscount": total_discount,
        "avgBillValue": total_sales / len(bills) if bills else 0,
        "paymentMethods": payment_methods,
        "bills": bills
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create default admin if not exists
    admin = await db.employees.find_one({"username": "admin"})
    if not admin:
        admin_obj = Employee(
            fullName="System Admin",
            username="admin",
            role="admin",
            branchId="default-branch",
            commissionRate=0
        )
        doc = admin_obj.model_dump()
        doc["password"] = hash_password("admin123")
        doc['createdAt'] = doc['createdAt'].isoformat()
        await db.employees.insert_one(doc)
        logger.info("Default admin created: username=admin, password=admin123")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
