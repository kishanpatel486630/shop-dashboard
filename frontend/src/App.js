import { useState, useEffect } from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  BarChart,
  LogOut,
  Store,
  UserPlus,
  Plus,
  Search,
  Scan,
  ArrowLeftRight,
  TrendingDown,
  FileText,
  Package2,
} from "lucide-react";
// import { Scanner } from "react-qr-barcode-scanner"; // Disabled due to import issues
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API}/auth/login`, {
      username,
      password,
    });
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getToken: () => localStorage.getItem("token"),
  getUser: () => {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined" || user === "null") {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem("token"),
};

axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(username, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Store className="w-16 h-16 text-violet-600" />
          </div>
          <CardTitle className="text-3xl font-bold">ClothPOS</CardTitle>
          <CardDescription>Retail Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              Default: admin / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const user = authService.getUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    avgBillValue: 0,
  });

  useEffect(() => {
    // Check if user is valid, if not, clear localStorage and redirect to login
    if (!user || !user.username) {
      authService.logout();
      navigate("/");
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch statistics");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b" data-testid="dashboard-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-violet-600" />
              <span className="text-xl font-bold text-gray-900">ClothPOS</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.fullName}</span>
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                {user?.role}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="stat-total-sales">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sales
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stats.totalSales.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-transactions">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Transactions
              </CardTitle>
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalTransactions}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-avg-bill">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Bill Value
              </CardTitle>
              <BarChart className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stats.avgBillValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pos" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="pos" data-testid="tab-pos">
              <ShoppingBag className="w-4 h-4 mr-2" />
              POS
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Package2 className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="customers" data-testid="tab-customers">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="employees" data-testid="tab-employees">
                <UserPlus className="w-4 h-4 mr-2" />
                Employees
              </TabsTrigger>
            )}
            <TabsTrigger value="commissions" data-testid="tab-commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos">
            <POSTab user={user} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab user={user} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTab user={user} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>

          {user?.role === "admin" && (
            <TabsContent value="employees">
              <EmployeesTab />
            </TabsContent>
          )}

          <TabsContent value="commissions">
            <CommissionsTab user={user} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const POSTab = ({ user }) => {
  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [searchSku, setSearchSku] = useState("");
  const [products, setProducts] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleScan = async (err, result) => {
    if (result) {
      const barcode = result.text;
      setShowScanner(false);
      try {
        const response = await axios.get(
          `${API}/products/search/barcode/${barcode}`
        );
        const product = response.data;
        const variant = product.variants.find((v) => v.barcode === barcode);
        if (variant) {
          addToCart(variant, product);
        }
      } catch (error) {
        toast.error("Product not found");
      }
    }
  };

  const handleManualBarcodeEntry = async (barcode) => {
    setShowScanner(false);
    setSearchSku("");
    try {
      const response = await axios.get(
        `${API}/products/search/barcode/${barcode}`
      );
      const product = response.data;
      const variant = product.variants.find((v) => v.barcode === barcode);
      if (variant) {
        addToCart(variant, product);
      } else {
        toast.error("Barcode not found in product variants");
      }
    } catch (error) {
      toast.error("Product not found");
    }
  };

  const addToCart = (variant, product) => {
    const existingItem = cart.find((item) => item.sku === variant.sku);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.sku === variant.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          sku: variant.sku,
          name: `${product.name} (${variant.color}, ${variant.size})`,
          price: variant.price,
          quantity: 1,
        },
      ]);
    }
    toast.success("Added to cart");
  };

  const removeFromCart = (sku) => {
    setCart(cart.filter((item) => item.sku !== sku));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (!customerPhone) {
      toast.error("Please enter customer phone number");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const items = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));
      await axios.post(`${API}/billing`, {
        customerPhoneNumber: customerPhone,
        items,
        discount,
        paymentMethod,
      });
      toast.success("Bill created successfully! SMS sent to customer.");
      setCart([]);
      setCustomerPhone("");
      setDiscount(0);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create bill");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card data-testid="pos-cart">
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Customer Phone</Label>
              <Input
                data-testid="customer-phone-input"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.sku}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  data-testid="cart-item"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      ${item.price} x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.sku)}
                      data-testid="remove-cart-item"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div>
                <Label>Discount</Label>
                <Input
                  data-testid="discount-input"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="payment-method-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span data-testid="cart-total">${total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                onClick={handleCheckout}
                data-testid="checkout-btn"
              >
                Complete Sale
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="product-search">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Products</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              data-testid="scan-barcode-btn"
            >
              <Scan className="w-4 h-4 mr-2" /> Scan Barcode
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {showScanner && (
              <div className="border rounded p-4 bg-gray-50">
                <Label>Enter Barcode Manually</Label>
                <Input
                  type="text"
                  placeholder="Scan or type barcode"
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchSku) {
                      handleManualBarcodeEntry(searchSku);
                    }
                  }}
                  autoFocus
                />
                <Button
                  className="mt-2 w-full"
                  onClick={() => {
                    if (searchSku) handleManualBarcodeEntry(searchSku);
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  onClick={() => setShowScanner(false)}
                >
                  Close
                </Button>
              </div>
            )}

            <Input
              data-testid="search-sku-input"
              placeholder="Search by SKU or name"
              value={searchSku}
              onChange={(e) => setSearchSku(e.target.value)}
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products
                .filter(
                  (p) =>
                    !searchSku ||
                    p.name.toLowerCase().includes(searchSku.toLowerCase()) ||
                    p.variants.some((v) =>
                      v.sku.toLowerCase().includes(searchSku.toLowerCase())
                    )
                )
                .map((product) => (
                  <div
                    key={product.id}
                    className="border rounded p-3"
                    data-testid="product-item"
                  >
                    <div className="font-medium text-lg">{product.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {product.category}
                    </div>
                    <div className="space-y-1">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.sku}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                          <div className="text-sm">
                            {variant.color} / {variant.size} - ${variant.price}
                            <span className="text-xs text-gray-500 ml-2">
                              SKU: {variant.sku}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(variant, product)}
                            data-testid="add-to-cart-btn"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProductsTab = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    variants: [{ sku: "", barcode: "", size: "", color: "", price: 0 }],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(`${API}/products`, formData);
      toast.success("Product added successfully");
      fetchProducts();
      setShowDialog(false);
      setFormData({
        name: "",
        category: "",
        brand: "",
        description: "",
        variants: [{ sku: "", barcode: "", size: "", color: "", price: 0 }],
      });
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  return (
    <Card data-testid="products-list">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        {user?.role === "admin" && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button data-testid="add-product-btn">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter product details and variants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      data-testid="product-name"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      data-testid="product-category"
                    />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      data-testid="product-brand"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    data-testid="product-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Variants</Label>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border p-4 rounded space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].sku = e.target.value;
                              setFormData({
                                ...formData,
                                variants: newVariants,
                              });
                            }}
                            data-testid={`variant-sku-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Barcode</Label>
                          <Input
                            value={variant.barcode}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].barcode = e.target.value;
                              setFormData({
                                ...formData,
                                variants: newVariants,
                              });
                            }}
                            data-testid={`variant-barcode-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Size</Label>
                          <Input
                            value={variant.size}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].size = e.target.value;
                              setFormData({
                                ...formData,
                                variants: newVariants,
                              });
                            }}
                            data-testid={`variant-size-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Input
                            value={variant.color}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].color = e.target.value;
                              setFormData({
                                ...formData,
                                variants: newVariants,
                              });
                            }}
                            data-testid={`variant-color-${index}`}
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[index].price = Number(e.target.value);
                              setFormData({
                                ...formData,
                                variants: newVariants,
                              });
                            }}
                            data-testid={`variant-price-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        variants: [
                          ...formData.variants,
                          {
                            sku: "",
                            barcode: "",
                            size: "",
                            color: "",
                            price: 0,
                          },
                        ],
                      })
                    }
                    data-testid="add-variant-btn"
                  >
                    Add Variant
                  </Button>
                </div>

                <Button
                  onClick={handleAddProduct}
                  className="w-full"
                  data-testid="submit-product-btn"
                >
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded p-4"
              data-testid="product-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.category} • {product.brand}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-sm font-medium">Variants:</div>
                {product.variants.map((variant) => (
                  <div
                    key={variant.sku}
                    className="text-sm bg-gray-50 p-2 rounded flex justify-between"
                  >
                    <span>
                      {variant.color} / {variant.size} - ${variant.price} (SKU:{" "}
                      {variant.sku})
                    </span>
                    <span className="text-gray-600">
                      Stock:{" "}
                      {variant.stock.reduce((sum, s) => sum + s.quantity, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InventoryTab = ({ user }) => {
  const [lowStock, setLowStock] = useState([]);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [branches, setBranches] = useState([]);
  const [stockInData, setStockInData] = useState({
    branchId: "",
    sku: "",
    quantity: 0,
  });
  const [transferData, setTransferData] = useState({
    fromBranchId: "",
    toBranchId: "",
    sku: "",
    quantity: 0,
  });

  useEffect(() => {
    fetchLowStock();
    fetchBranches();
  }, []);

  const fetchLowStock = async () => {
    try {
      const response = await axios.get(
        `${API}/inventory/low-stock?threshold=20`
      );
      setLowStock(response.data);
    } catch (error) {
      toast.error("Failed to fetch low stock items");
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`);
      setBranches(response.data);
    } catch (error) {
      toast.error("Failed to fetch branches");
    }
  };

  const handleStockIn = async () => {
    try {
      await axios.post(`${API}/inventory/stock-in`, stockInData);
      toast.success("Stock added successfully");
      setShowStockIn(false);
      setStockInData({ branchId: "", sku: "", quantity: 0 });
      fetchLowStock();
    } catch (error) {
      toast.error("Failed to add stock");
    }
  };

  const handleTransfer = async () => {
    try {
      await axios.post(`${API}/inventory/transfer`, transferData);
      toast.success("Stock transferred successfully");
      setShowTransfer(false);
      setTransferData({
        fromBranchId: "",
        toBranchId: "",
        sku: "",
        quantity: 0,
      });
      fetchLowStock();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to transfer stock");
    }
  };

  return (
    <div className="space-y-6">
      {user?.role === "admin" && (
        <div className="flex space-x-4">
          <Dialog open={showStockIn} onOpenChange={setShowStockIn}>
            <DialogTrigger asChild>
              <Button data-testid="stock-in-btn">
                <Plus className="w-4 h-4 mr-2" /> Stock In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>Add inventory to a branch</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Branch</Label>
                  <Select
                    value={stockInData.branchId}
                    onValueChange={(value) =>
                      setStockInData({ ...stockInData, branchId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={stockInData.sku}
                    onChange={(e) =>
                      setStockInData({ ...stockInData, sku: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={stockInData.quantity}
                    onChange={(e) =>
                      setStockInData({
                        ...stockInData,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <Button onClick={handleStockIn} className="w-full">
                  Add Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="transfer-stock-btn">
                <ArrowLeftRight className="w-4 h-4 mr-2" /> Transfer Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Stock</DialogTitle>
                <DialogDescription>
                  Move inventory between branches
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>From Branch</Label>
                  <Select
                    value={transferData.fromBranchId}
                    onValueChange={(value) =>
                      setTransferData({ ...transferData, fromBranchId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Branch</Label>
                  <Select
                    value={transferData.toBranchId}
                    onValueChange={(value) =>
                      setTransferData({ ...transferData, toBranchId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={transferData.sku}
                    onChange={(e) =>
                      setTransferData({ ...transferData, sku: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={transferData.quantity}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <Button onClick={handleTransfer} className="w-full">
                  Transfer Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Card data-testid="low-stock-list">
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No low stock items
              </p>
            ) : (
              lowStock.map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded p-4 flex justify-between items-center bg-red-50"
                >
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600">
                      {item.color} / {item.size} - SKU: {item.sku}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {item.currentStock}
                    </div>
                    <div className="text-sm text-gray-600">units left</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBills, setCustomerBills] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${API}/customers/search/${searchPhone}`
      );
      setCustomers([response.data]);
      setSelectedCustomer(response.data);
      fetchCustomerBills(response.data.id);
    } catch (error) {
      toast.error("Customer not found");
    }
  };

  const fetchCustomerBills = async (customerId) => {
    try {
      const response = await axios.get(`${API}/customers/${customerId}/bills`);
      setCustomerBills(response.data);
    } catch (error) {
      toast.error("Failed to fetch customer bills");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card data-testid="customers-list">
        <CardHeader>
          <CardTitle>Customer Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                data-testid="search-customer-phone"
                placeholder="Search by phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <Button onClick={handleSearch} data-testid="search-customer-btn">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="border rounded p-4"
                  data-testid="customer-card"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {customer.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.phoneNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Loyalty Points
                      </div>
                      <div className="font-bold">{customer.loyaltyPoints}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="customer-history">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {customerBills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No purchases found
              </p>
            ) : (
              customerBills.map((bill) => (
                <div key={bill.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Bill #{bill.billNumber}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {bill.items.length} items • {bill.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        ${bill.totalAmount.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          bill.status === "completed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {bill.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "employee",
    branchId: "",
    commissionRate: 0.05,
  });

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/employees`);
      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`);
      setBranches(response.data);
    } catch (error) {
      toast.error("Failed to fetch branches");
    }
  };

  const handleAddEmployee = async () => {
    try {
      await axios.post(`${API}/employees`, formData);
      toast.success("Employee added successfully");
      fetchEmployees();
      setShowDialog(false);
      setFormData({
        fullName: "",
        username: "",
        password: "",
        role: "employee",
        branchId: "",
        commissionRate: 0.05,
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add employee");
    }
  };

  return (
    <Card data-testid="employees-list">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employees</CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-employee-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  data-testid="employee-name"
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  data-testid="employee-username"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  data-testid="employee-password"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger data-testid="employee-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Branch</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branchId: value })
                  }
                >
                  <SelectTrigger data-testid="employee-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commissionRate * 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRate: Number(e.target.value) / 100,
                    })
                  }
                  data-testid="employee-commission"
                />
              </div>
              <Button
                onClick={handleAddEmployee}
                className="w-full"
                data-testid="submit-employee-btn"
              >
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="border rounded p-4 flex justify-between items-center"
              data-testid="employee-card"
            >
              <div>
                <div className="font-medium">{employee.fullName}</div>
                <div className="text-sm text-gray-600">
                  @{employee.username} • {employee.role}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Commission Rate</div>
                <div className="font-bold">
                  {(employee.commissionRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CommissionsTab = ({ user }) => {
  const [commissions, setCommissions] = useState([]);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const endpoint =
        user?.role === "admin"
          ? `${API}/commissions/all`
          : `${API}/commissions/my`;
      const response = await axios.get(endpoint);
      setCommissions(response.data);
    } catch (error) {
      toast.error("Failed to fetch commissions");
    }
  };

  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="pending-commissions">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              ${totalPending.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="paid-commissions">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Paid Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="commissions-list">
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="border rounded p-4 flex justify-between items-center"
                data-testid="commission-card"
              >
                <div>
                  <div className="font-medium">
                    Bill: {commission.billId.substring(0, 8)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Sale: ${commission.saleAmount.toFixed(2)} • Rate:{" "}
                    {(commission.commissionRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    ${commission.commissionAmount.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm ${
                      commission.status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {commission.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportsTab = ({ user }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/sales`);
      setReportData(response.data);
    } catch (error) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (!reportData) {
    return <div className="text-center py-8">No data available</div>;
  }

  const paymentMethodData = Object.entries(reportData.paymentMethods || {}).map(
    ([key, value]) => ({
      name: key,
      value: value.total,
    })
  );

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Bill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.avgBillValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${reportData.totalDiscount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reportData.bills.slice(0, 20).map((bill) => (
              <div
                key={bill.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">Bill #{bill.billNumber}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(bill.createdAt).toLocaleString()} •{" "}
                    {bill.paymentMethod}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    ${bill.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bill.items.length} items
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
