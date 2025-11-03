# ClothPOS - Clothing Dashboard# 👕 ClothPOS - Retail Management System

A modern retail management system for clothing stores with POS, inventory, customer management, and analytics.<div align="center">

## Tech Stack**A Complete Point of Sale and Inventory Management System for Clothing Retail Stores**

**Backend:**[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)

- Python 3.13+ with FastAPI[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)

- MongoDB (optional - mock server available)[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)

[![Python](https://img.shields.io/badge/Python-3.13.5-3776AB?style=flat&logo=python)](https://www.python.org/)

**Frontend:**[![Node.js](https://img.shields.io/badge/Node.js-22.17.0-339933?style=flat&logo=node.js)](https://nodejs.org/)

- React 18

- Tailwind CSS</div>

- shadcn/ui components

---

## Quick Start

## 🎯 Quick Start

### Prerequisites

- Python 3.13+### 1️⃣ Install MongoDB

- Node.js 22+

- MongoDB (optional)Download and install from: https://www.mongodb.com/try/download/community

### Installation### 2️⃣ Run the Application

1. **Backend Setup:**```powershell

````powershellcd "d:\Downloads\Clothing Dashboard"

cd backend.\START.ps1

python -m venv venv```

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt### 3️⃣ Login

````

- **URL:** http://localhost:3000

2. **Frontend Setup:**- **Username:** `admin`

```powershell- **Password:** `admin123`

cd frontend

npm install --legacy-peer-deps**That's it! 🎉**

````

---

### Running the Project

## 📚 Documentation

**Easy Way - Use the startup script:**

```powershell- **[CHECKLIST.md](CHECKLIST.md)** - Step-by-step checklist for first-time setup ✅

.\RUN_WITHOUT_MONGODB.ps1- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive setup and troubleshooting guide 📖

```- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project analysis and technical details 📊



**Manual Way:**---



1. Start Backend (Terminal 1):## ✨ Features

```powershell

cd backend### 🛒 Point of Sale (POS)

.\venv\Scripts\Activate.ps1

python mock_server.py- Fast barcode scanning

```- Product search and selection

- Shopping cart management

2. Start Frontend (Terminal 2):- Multiple payment methods (Cash, Card, UPI)

```powershell- Customer loyalty points integration

cd frontend- Real-time commission calculation

npm start

```### 📦 Inventory Management



3. Open browser: http://localhost:3000- Product catalog with variants (size, color, SKU)

- Stock level tracking

### Login Credentials- Low stock alerts

- **Username:** admin- Multi-location inventory

- **Password:** admin123

### 👥 Customer Management

## Project Structure

- Customer registration via phone number

```- Loyalty points system

├── backend/- Purchase history tracking

│   ├── server.py          # Full backend (requires MongoDB)- Customer analytics

│   ├── mock_server.py     # Mock backend (no database needed)

│   ├── requirements.txt### 👔 Employee Management

│   └── .env

├── frontend/- Staff management with roles (Admin, Manager, Cashier)

│   ├── src/- Commission rate configuration

│   │   ├── App.js         # Main application- Performance tracking

│   │   └── components/    # UI components- Branch assignment

│   ├── package.json

│   └── tailwind.config.js### 🏪 Branch Management

└── README.md

```- Multi-branch support

- Branch-specific inventory

## Features- Branch performance analytics



- 🛒 Point of Sale (POS) system### 📊 Analytics & Reports

- 📦 Product inventory management

- 👥 Customer management- Sales dashboard with charts

- 👨‍💼 Employee management- Revenue analytics

- 🏪 Multi-branch support- Payment method breakdown

- 📊 Sales analytics & reporting- Top-selling products

- 🔐 Authentication & authorization- Average bill value

- 💳 Payment processing integration- Date range filtering



## API Endpoints---



- `POST /api/auth/login` - User authentication## 🏗️ Technology Stack

- `GET /api/products` - Get products

- `GET /api/customers` - Get customers### Backend

- `GET /api/employees` - Get employees

- `GET /api/branches` - Get branches- **Framework:** FastAPI (Python)

- `GET /api/dashboard/stats` - Dashboard statistics- **Database:** MongoDB (Motor async driver)

- `GET /api/analytics/sales` - Sales analytics- **Authentication:** JWT with bcrypt

- **API Documentation:** Swagger UI / ReDoc

## Development- **Payments:** Stripe

- **SMS:** Twilio (optional)

**Backend:** Port 8000

**Frontend:** Port 3000### Frontend



**Environment Variables:**- **Framework:** React 18

- **UI Library:** shadcn/ui (35+ components)

Backend `.env`:- **Styling:** Tailwind CSS

```- **Icons:** Lucide React

MONGO_URL=mongodb://localhost:27017- **Charts:** Recharts

DB_NAME=clothing_dashboard- **HTTP Client:** Axios

```- **Routing:** React Router v6

- **Notifications:** Sonner

Frontend `.env`:

```---

REACT_APP_BACKEND_URL=http://localhost:8000

```## 📁 Project Structure



## Notes```

Clothing Dashboard/

- The `mock_server.py` provides a working backend without MongoDB├── backend/              # FastAPI Python backend

- For production, use `server.py` with MongoDB installed│   ├── server.py        # Main application (858 lines)

- Frontend automatically connects to `http://localhost:8000`│   ├── requirements.txt # Python dependencies

│   └── .env            # Backend configuration
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.js      # Main component (1311 lines)
│   │   ├── components/ # UI components (35+)
│   │   └── lib/        # Utilities
│   ├── package.json    # Node dependencies
│   └── .env           # Frontend configuration
│
└── tests/              # Test files
````

---

## 🚀 Running the Application

### Option 1: Automated (Recommended)

```powershell
.\START.ps1
```

Opens both backend and frontend in separate windows.

### Option 2: Individual Scripts

**Backend:**

```powershell
cd backend
.\start-backend.ps1
```

**Frontend:**

```powershell
cd frontend
.\start-frontend.ps1
```

### Option 3: Manual

**Backend:**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```powershell
cd frontend
npm install
npm start
```

---

## 🌐 Access URLs

| Service                | URL                         | Description          |
| ---------------------- | --------------------------- | -------------------- |
| **Frontend**           | http://localhost:3000       | Main application     |
| **Backend API**        | http://localhost:8000       | API endpoints        |
| **API Docs (Swagger)** | http://localhost:8000/docs  | Interactive API docs |
| **API Docs (ReDoc)**   | http://localhost:8000/redoc | Alternative API docs |

---

## 🔐 Default Credentials

The system creates a default admin account on first startup:

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change this password in production!

---

## 📋 Prerequisites

| Software | Required Version | Your Version | Status                |
| -------- | ---------------- | ------------ | --------------------- |
| Python   | 3.13+            | 3.13.5       | ✅                    |
| Node.js  | 22.0+            | 22.17.0      | ✅                    |
| npm      | 11.0+            | 11.6.0       | ✅                    |
| MongoDB  | Latest           | -            | ⚠️ Needs Installation |

---

## 🛠️ Development

### Backend Development

- FastAPI auto-reloads on code changes
- Check logs in backend terminal
- Test endpoints at http://localhost:8000/docs

### Frontend Development

- React hot-reloads automatically
- Use React DevTools browser extension
- Check browser console for errors

### Database Management

- Use MongoDB Compass GUI
- Connection: `mongodb://localhost:27017`
- Database: `clothing_dashboard`

---

## 📸 Screenshots

### Login Page

Beautiful gradient login with ClothPOS branding

### Dashboard

Sales overview with interactive charts and quick stats

### POS Interface

Fast checkout with barcode scanning and cart management

### Analytics

Comprehensive sales reports with date filtering

---

## 🤝 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Branches

- `GET /api/branches` - List all branches
- `POST /api/branches` - Create branch
- `GET /api/branches/{id}` - Get branch details
- `PUT /api/branches/{id}` - Update branch
- `DELETE /api/branches/{id}` - Delete branch

### Employees

- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- Similar CRUD endpoints...

### Products

- Full CRUD operations
- Stock management
- Variant support

### Customers

- Phone-based registration
- Loyalty points management

### Bills/Sales

- Create sales transactions
- Apply discounts
- Multiple payment methods
- Commission calculation

### Analytics

- Sales reports by date range
- Revenue analytics
- Top products

**Full API documentation available at:** http://localhost:8000/docs

---

## 🐛 Troubleshooting

### MongoDB Not Running

```powershell
net start MongoDB
```

### Port Already in Use

Change the port in uvicorn command or kill the process

### Module Not Found (Frontend)

```powershell
cd frontend
Remove-Item node_modules -Recurse -Force
npm install
```

### Execution Policy Error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

For more help, see **[SETUP_GUIDE.md](SETUP_GUIDE.md)**

---

## 📝 Configuration

### Backend (.env)

```properties
MONGO_URL="mongodb://localhost:27017"
DB_NAME="clothing_dashboard"
JWT_SECRET="your-secret-key"
STRIPE_API_KEY="sk_test_..."
CORS_ORIGINS="*"
```

### Frontend (.env)

```properties
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 🧪 Testing

Run tests with:

```powershell
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- Input validation with Pydantic
- SQL injection prevention (NoSQL)

---

## 🎨 UI Components

The project uses **shadcn/ui** with 35+ accessible components:

- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Tables, Tabs, Tooltips
- And many more...

All components are:

- ✅ Fully accessible (ARIA)
- ✅ Keyboard navigable
- ✅ Customizable with Tailwind
- ✅ Dark mode ready

---

## 📦 Dependencies

### Backend (82 packages)

Key: FastAPI, Motor, Pydantic, Python-JOSE, Stripe, Twilio

### Frontend (50+ packages)

Key: React, React Router, Axios, Tailwind CSS, Recharts, Radix UI

See `backend/requirements.txt` and `frontend/package.json` for complete lists.

---

## 🚧 Known Limitations

- Twilio SMS integration requires valid credentials
- Stripe payments use test mode by default
- No email notifications (only SMS via Twilio)
- Single currency support
- No multi-language support

---

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] Export reports to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] Barcode printing
- [ ] Receipt printing
- [ ] Inventory forecasting
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Returns management
- [ ] Multi-currency support

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🙋‍♂️ Support

1. Check **[CHECKLIST.md](CHECKLIST.md)** for quick setup
2. Read **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed help
3. See **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** for technical details
4. Check backend terminal for errors
5. Check frontend terminal for errors
6. Open browser console (F12) for frontend errors

---

## 🎉 Quick Start Reminder

```powershell
# 1. Install MongoDB (first time only)
# Download from: https://www.mongodb.com/try/download/community

# 2. Run the application
cd "d:\Downloads\Clothing Dashboard"
.\START.ps1

# 3. Open browser to http://localhost:3000
# 4. Login with: admin / admin123
```

---

<div align="center">

**Made with ❤️ for Retail Management**

⭐ **Star this project if you find it useful!** ⭐

</div>
#   s h o p - d a s h b o a r d  
 