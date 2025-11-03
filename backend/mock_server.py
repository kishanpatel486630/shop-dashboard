# Mock Backend Server - Works WITHOUT MongoDB
# This allows you to see the frontend working immediately!

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="ClothPOS Mock Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
class LoginRequest(BaseModel):
    username: str
    password: str

mock_user = {
    "id": "admin-123",
    "username": "admin",
    "fullName": "System Admin",
    "role": "admin",
    "branchId": "branch-1"
}

mock_branches = [
    {"id": "branch-1", "name": "Main Store", "address": "123 Main St", "contactNumber": "+1234567890", "isActive": True},
    {"id": "branch-2", "name": "Downtown Store", "address": "456 Downtown Ave", "contactNumber": "+0987654321", "isActive": True}
]

mock_employees = [
    {"id": "emp-1", "fullName": "John Doe", "username": "john", "role": "cashier", "branchId": "branch-1", "commissionRate": 0.05, "isActive": True},
    {"id": "emp-2", "fullName": "Jane Smith", "username": "jane", "role": "manager", "branchId": "branch-1", "commissionRate": 0.07, "isActive": True}
]

mock_products = [
    {
        "id": "prod-1", 
        "name": "T-Shirt", 
        "category": "Clothing", 
        "brand": "Fashion Co",
        "description": "Comfortable cotton t-shirt",
        "variants": [
            {"sku": "TSH-RED-S", "color": "Red", "size": "S", "price": 29.99, "barcode": "1234567890", 
             "stock": [{"branchId": "branch-1", "quantity": 30}, {"branchId": "branch-2", "quantity": 20}]},
            {"sku": "TSH-RED-M", "color": "Red", "size": "M", "price": 29.99, "barcode": "1234567891",
             "stock": [{"branchId": "branch-1", "quantity": 15}, {"branchId": "branch-2", "quantity": 15}]},
            {"sku": "TSH-BLU-S", "color": "Blue", "size": "S", "price": 29.99, "barcode": "1234567892",
             "stock": [{"branchId": "branch-1", "quantity": 10}, {"branchId": "branch-2", "quantity": 10}]},
            {"sku": "TSH-BLU-M", "color": "Blue", "size": "M", "price": 29.99, "barcode": "1234567893",
             "stock": [{"branchId": "branch-1", "quantity": 15}, {"branchId": "branch-2", "quantity": 10}]}
        ]
    },
    {
        "id": "prod-2", 
        "name": "Jeans", 
        "category": "Clothing", 
        "brand": "Denim Plus",
        "description": "Classic blue jeans",
        "variants": [
            {"sku": "JNS-BLU-30", "color": "Blue", "size": "30", "price": 59.99, "barcode": "2234567890",
             "stock": [{"branchId": "branch-1", "quantity": 15}, {"branchId": "branch-2", "quantity": 10}]},
            {"sku": "JNS-BLU-32", "color": "Blue", "size": "32", "price": 59.99, "barcode": "2234567891",
             "stock": [{"branchId": "branch-1", "quantity": 15}, {"branchId": "branch-2", "quantity": 10}]},
            {"sku": "JNS-BLK-30", "color": "Black", "size": "30", "price": 64.99, "barcode": "2234567892",
             "stock": [{"branchId": "branch-1", "quantity": 8}, {"branchId": "branch-2", "quantity": 7}]},
            {"sku": "JNS-BLK-32", "color": "Black", "size": "32", "price": 64.99, "barcode": "2234567893",
             "stock": [{"branchId": "branch-1", "quantity": 12}, {"branchId": "branch-2", "quantity": 8}]}
        ]
    },
    {
        "id": "prod-3", 
        "name": "Sneakers", 
        "category": "Footwear", 
        "brand": "SportWear",
        "description": "Comfortable running sneakers",
        "variants": [
            {"sku": "SNK-WHT-9", "color": "White", "size": "9", "price": 89.99, "barcode": "3234567890",
             "stock": [{"branchId": "branch-1", "quantity": 8}, {"branchId": "branch-2", "quantity": 7}]},
            {"sku": "SNK-WHT-10", "color": "White", "size": "10", "price": 89.99, "barcode": "3234567891",
             "stock": [{"branchId": "branch-1", "quantity": 8}, {"branchId": "branch-2", "quantity": 7}]},
            {"sku": "SNK-BLK-9", "color": "Black", "size": "9", "price": 94.99, "barcode": "3234567892",
             "stock": [{"branchId": "branch-1", "quantity": 5}, {"branchId": "branch-2", "quantity": 5}]},
            {"sku": "SNK-BLK-10", "color": "Black", "size": "10", "price": 94.99, "barcode": "3234567893",
             "stock": [{"branchId": "branch-1", "quantity": 6}, {"branchId": "branch-2", "quantity": 6}]}
        ]
    }
]

mock_customers = [
    {"id": "cust-1", "name": "Alice Johnson", "phoneNumber": "+1111111111", "loyaltyPoints": 150},
    {"id": "cust-2", "name": "Bob Williams", "phoneNumber": "+2222222222", "loyaltyPoints": 200}
]

@app.get("/")
async def root():
    return {"message": "ClothPOS Mock Backend - Running!", "status": "healthy"}

@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    if credentials.username == "admin" and credentials.password == "admin123":
        return {
            "access_token": "mock-jwt-token-12345",
            "token_type": "bearer",
            "user": mock_user
        }
    return {"error": "Invalid credentials"}, 401

@app.get("/api/branches")
async def get_branches():
    return mock_branches

@app.get("/api/employees")
async def get_employees():
    return mock_employees

@app.get("/api/products")
async def get_products():
    return mock_products

@app.get("/api/customers")
async def get_customers():
    return mock_customers

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return {
        "totalSales": 15234.50,
        "totalTransactions": 45,
        "avgBillValue": 338.54,
        "totalCustomers": 128,
        "todaySales": 3456.78
    }

@app.get("/api/analytics/sales")
async def get_sales_analytics():
    return {
        "totalSales": 15234.50,
        "totalTransactions": 45,
        "avgBillValue": 338.54,
        "paymentMethods": {
            "cash": {"count": 20, "total": 6789.00},
            "card": {"count": 15, "total": 5234.50},
            "upi": {"count": 10, "total": 3211.00}
        }
    }

# Search product by barcode
@app.get("/api/products/search/barcode/{barcode}")
async def search_product_by_barcode(barcode: str):
    for product in mock_products:
        for variant in product.get("variants", []):
            if variant.get("barcode") == barcode:
                return product
    return {"error": "Product not found"}, 404

# Create billing
@app.post("/api/billing")
async def create_billing(data: dict):
    return {
        "id": "bill-123",
        "billNumber": "INV-2025-001",
        "totalAmount": data.get("totalAmount", 0),
        "status": "completed",
        "message": "Billing successful"
    }

# Search products by SKU or query
@app.get("/api/products/search")
async def search_products(q: str = ""):
    if not q:
        return mock_products
    results = []
    for product in mock_products:
        if q.lower() in product["name"].lower():
            results.append(product)
        else:
            for variant in product.get("variants", []):
                if q.lower() in variant.get("sku", "").lower():
                    results.append(product)
                    break
    return results

# Get product by ID
@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    for product in mock_products:
        if product["id"] == product_id:
            return product
    return {"error": "Product not found"}, 404

# Create product
@app.post("/api/products")
async def create_product(product: dict):
    return {"id": "prod-new", "message": "Product created successfully", **product}

# Stock in
@app.post("/api/inventory/stock-in")
async def stock_in(data: dict):
    return {"message": "Stock added successfully"}

# Transfer stock
@app.post("/api/inventory/transfer")
async def transfer_stock(data: dict):
    return {"message": "Stock transferred successfully"}

# Get low stock items
@app.get("/api/inventory/low-stock")
async def get_low_stock(threshold: int = 20):
    low_stock_items = []
    for product in mock_products:
        for variant in product.get("variants", []):
            # Calculate total stock across all branches
            total_stock = sum(s.get("quantity", 0) for s in variant.get("stock", []))
            if total_stock < threshold:
                low_stock_items.append({
                    "productName": product["name"],
                    "sku": variant["sku"],
                    "color": variant["color"],
                    "size": variant["size"],
                    "currentStock": total_stock,
                    "threshold": threshold
                })
    return low_stock_items

# Search customers
@app.get("/api/customers/search")
async def search_customers(q: str = ""):
    if not q:
        return mock_customers
    results = [c for c in mock_customers if q in c.get("phoneNumber", "") or q.lower() in c.get("name", "").lower()]
    return results

# Search customer by phone
@app.get("/api/customers/search/{phone}")
async def search_customer_by_phone(phone: str):
    for customer in mock_customers:
        if customer.get("phoneNumber") == phone:
            return customer
    return {"error": "Customer not found"}, 404

# Get customer bills
@app.get("/api/customers/{customer_id}/bills")
async def get_customer_bills(customer_id: str):
    return [
        {
            "id": "bill-1",
            "billNumber": "INV-2025-001",
            "totalAmount": 89.98,
            "date": "2025-11-01",
            "items": 2
        },
        {
            "id": "bill-2",
            "billNumber": "INV-2025-002",
            "totalAmount": 154.99,
            "date": "2025-11-02",
            "items": 3
        }
    ]

# Create employee
@app.post("/api/employees")
async def create_employee(employee: dict):
    return {"id": "emp-new", "message": "Employee created successfully", **employee}

# Mock commissions data
mock_commissions = [
    {
        "id": "comm-1",
        "employeeId": "emp-1",
        "employeeName": "John Doe",
        "billId": "bill-001-2025-11-01",
        "saleAmount": 299.99,
        "commissionRate": 0.05,
        "commissionAmount": 15.00,
        "status": "pending",
        "date": "2025-11-01"
    },
    {
        "id": "comm-2",
        "employeeId": "emp-2",
        "employeeName": "Jane Smith",
        "billId": "bill-002-2025-11-02",
        "saleAmount": 459.99,
        "commissionRate": 0.05,
        "commissionAmount": 23.00,
        "status": "paid",
        "date": "2025-11-02"
    },
    {
        "id": "comm-3",
        "employeeId": "emp-1",
        "employeeName": "John Doe",
        "billId": "bill-003-2025-11-03",
        "saleAmount": 189.99,
        "commissionRate": 0.05,
        "commissionAmount": 9.50,
        "status": "pending",
        "date": "2025-11-03"
    }
]

# Get all commissions (admin)
@app.get("/api/commissions/all")
async def get_all_commissions():
    return mock_commissions

# Get my commissions (employee)
@app.get("/api/commissions/my")
async def get_my_commissions():
    # For demo, return all commissions
    # In real app, filter by employee ID from JWT token
    return mock_commissions

# Get commissions (legacy endpoint)
@app.get("/api/commissions")
async def get_commissions(status: str = "all"):
    if status == "all":
        return mock_commissions
    return [c for c in mock_commissions if c["status"] == status]

# Sales report
@app.get("/api/reports/sales")
async def get_sales_report():
    return {
        "totalSales": 15234.50,
        "totalTransactions": 45,
        "avgBillValue": 338.54,
        "totalDiscount": 523.00,
        "salesByCategory": [
            {"name": "Clothing", "value": 8500.00},
            {"name": "Footwear", "value": 4234.50},
            {"name": "Accessories", "value": 2500.00}
        ],
        "topProducts": [
            {"name": "T-Shirt", "quantity": 45, "revenue": 1349.55},
            {"name": "Jeans", "quantity": 32, "revenue": 1919.68},
            {"name": "Sneakers", "quantity": 28, "revenue": 2519.72}
        ],
        "bills": [
            {
                "billNumber": "INV-2025-001",
                "customerName": "Alice Johnson",
                "totalAmount": 89.98,
                "date": "2025-11-01",
                "items": 2
            },
            {
                "billNumber": "INV-2025-002",
                "customerName": "Bob Williams",
                "totalAmount": 154.99,
                "date": "2025-11-02",
                "items": 3
            }
        ]
    }

if __name__ == "__main__":
    print("=" * 50)
    print("  🚀 MOCK BACKEND SERVER")
    print("=" * 50)
    print("")
    print("✅ This is a MOCK backend that works WITHOUT MongoDB!")
    print("✅ You can test the frontend immediately!")
    print("")
    print("🌐 Server running on: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("")
    print("🔐 Login credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("")
    print("=" * 50)
    print("")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
