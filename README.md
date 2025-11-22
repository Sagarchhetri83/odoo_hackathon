# StockMaster Project

## Inventory Management System (IMS)

This project aims to build a modular Inventory Management System (IMS) that digitizes and streamlines all stock operations inside a business, replacing manual registers, Excel sheets, and scattered tracking with a centralized, real-time, easy-to-use application.

## Traceability Table

| Feature/Endpoint/View | PDF Section/Description |
| :--------------------------- | :------------------------------------------------------------------------------------------- |
| **Authentication** | Authentication Module |
| User signup | Authentication Module - User signup |
| User login | Authentication Module - User login |
| POST /auth/signup | APIs Required - Auth |
| POST /auth/login | APIs Required - Auth |
| **OTP-based Password Reset** | Authentication Module - OTP-based password reset; OTP Feature |
| POST /auth/request-reset-otp | OTP Feature - Endpoints; APIs Required - Auth |
| POST /auth/verify-reset-otp | OTP Feature - Endpoints; APIs Required - Auth |
| POST /auth/reset-password | OTP Feature - Endpoints; APIs Required - Auth |
| OTP numeric 6-digit | OTP Feature |
| Hashed OTP in Redis with TTL | OTP Feature |
| Single-use OTP | OTP Feature |
| Generic success response | OTP Feature |
| Short-lived resetToken | OTP Feature |
| Rate-limit OTP requests | OTP Feature |
| Redirect to Inventory Dashboard | Authentication Module |
| **Inventory Dashboard** | Inventory Dashboard |
| Total Products in Stock | Inventory Dashboard - Display these KPIs |
| Low Stock / Out of Stock | Inventory Dashboard - Display these KPIs |
| Pending Receipts | Inventory Dashboard - Display these KPIs |
| Pending Deliveries | Inventory Dashboard - Display these KPIs |
| Internal Transfers Scheduled | Inventory Dashboard - Display these KPIs |
| Dashboard Dynamic Filters | Dashboard Dynamic Filters |
| Filter by Document Type | Dashboard Dynamic Filters - By Document Type |
| Filter by Status | Dashboard Dynamic Filters - By Status |
| Filter by Warehouse/Location | Dashboard Dynamic Filters - By Warehouse or Location |
| Filter by Product Category | Dashboard Dynamic Filters - By Product Category |
| Frontend Dashboard UI | Frontend Requirements - Dashboard with KPIs & filters |
| **Product Management** | Core Modules - 1) Product Management |
| Create/update products | Core Modules - 1) Product Management |
| Product Name | Core Modules - 1) Product Management - Fields |
| Product SKU / Code | Core Modules - 1) Product Management - Fields |
| Product Category | Core Modules - 1) Product Management - Fields; Product categories |
| Unit of Measure | Core Modules - 1) Product Management - Fields |
| Initial stock (optional) | Core Modules - 1) Product Management - Fields |
| Stock availability per location | Core Modules - 1) Product Management |
| Reordering rules | Core Modules - 1) Product Management |
| GET /products | APIs Required - Products |
| POST /products | APIs Required - Products |
| PUT /products/:id | APIs Required - Products |
| Frontend Product CRUD pages | Frontend Requirements - Product CRUD pages |
| **Receipts (Incoming Stock)** | Core Modules - 2) Receipts (Incoming Stock) |
| Create new receipt | Core Modules - 2) Receipts (Incoming Stock) |
| Add supplier & products | Core Modules - 2) Receipts (Incoming Stock) |
| Input received quantities | Core Modules - 2) Receipts (Incoming Stock) |
| Validate receipt | Core Modules - 2) Receipts (Incoming Stock) |
| Stock increases | Core Modules - 2) Receipts (Incoming Stock) |
| POST /receipts | APIs Required - Receipts |
| PUT /receipts/:id/validate | APIs Required - Receipts |
| Frontend Receipt UI | Frontend Requirements - Receipt creation + validation UI |
| **Delivery Orders (Outgoing Stock)** | Core Modules - 3) Delivery Orders (Outgoing Stock) |
| Pick items | Core Modules - 3) Delivery Orders (Outgoing Stock) |
| Pack items | Core Modules - 3) Delivery Orders (Outgoing Stock) |
| Validate delivery | Core Modules - 3) Delivery Orders (Outgoing Stock) |
| Stock decreases | Core Modules - 3) Delivery Orders (Outgoing Stock) |
| POST /deliveries | APIs Required - Delivery Orders |
| PUT /deliveries/:id/validate | APIs Required - Delivery Orders |
| Frontend Delivery UI | Frontend Requirements - Delivery creation + validation UI |
| **Internal Transfers** | Core Modules - 4) Internal Transfers |
| Move stock between locations | Core Modules - 4) Internal Transfers |
| Stock total stays same | Core Modules - 4) Internal Transfers |
| Logged in stock ledger | Core Modules - 4) Internal Transfers |
| POST /transfers | APIs Required - Internal Transfers |
| PUT /transfers/:id/complete | APIs Required - Internal Transfers |
| Frontend Internal Transfer UI | Frontend Requirements - Internal transfer UI |
| **Stock Adjustments** | Core Modules - 5) Stock Adjustments |
| Fix stock mismatches | Core Modules - 5) Stock Adjustments |
| Select product & location | Core Modules - 5) Stock Adjustments |
| Enter counted quantity | Core Modules - 5) Stock Adjustments |
| System updates stock | Core Modules - 5) Stock Adjustments |
| Logs adjustment | Core Modules - 5) Stock Adjustments |
| POST /adjustments | APIs Required - Stock Adjustments |
| Frontend Adjustment UI | Frontend Requirements - Adjustment entry UI |
| **Stock Ledger** | Stock Ledger |
| Immutable log | Stock Ledger |
| Audit trail | Stock Ledger |
| GET /ledger | APIs Required - Ledger |
| Frontend Stock Ledger Viewer | Frontend Requirements - Stock ledger viewer with filters |
| **Additional Features** | Additional Features |
| Low stock alerts | Additional Features |
| Multi-warehouse support | Additional Features; Backend Requirements - Support multi-warehouse stock_levels |
| SKU search + smart filters | Additional Features |
| Full move history | Additional Features |
| Navigation (Left Sidebar) | Navigation (Left Sidebar) |
| Dashboard link | Navigation (Left Sidebar) |
| Products link | Navigation (Left Sidebar) |
| Receipts link | Navigation (Left Sidebar) |
| Delivery Orders link | Navigation (Left Sidebar) |
| Internal Transfers link | Navigation (Left Sidebar) |
| Inventory Adjustments link | Navigation (Left Sidebar) |
| Move History link | Navigation (Left Sidebar) |
| Settings (Warehouse) link | Navigation (Left Sidebar) |
| Profile + Logout link | Navigation (Left Sidebar) |
| **Backend Requirements** | Backend Requirements |
| Transactional updates | Backend Requirements - Transactional updates for all stock changes |
| Ledger entry for every stock op | Backend Requirements - Ledger entry created for every stock operation |
| Prevent negative stock | Backend Requirements - Prevent negative stock unless adjustment defines it |
| JWT authentication | Non-functional Requirements |
| Redis caching | Non-functional Requirements - Redis caching for OTP & rate-limits |
| Postgres | Non-functional Requirements - Postgres for relational inventory data |
| Atomic stock updates | Non-functional Requirements - Stock updates must be atomic |
| Clear error messages | Non-functional Requirements |
| Server-side dynamic filters | Non-functional Requirements - Filters must be dynamic and server-side |
| **Frontend Requirements** | Frontend Requirements |
| Dashboard loads fast | Non-functional Requirements |
| Clean UI | Non-functional Requirements - Clean UI for warehouse operators |

## Quick Start

### Prerequisites
- Docker Desktop installed and running (for Docker setup)
- OR Python 3.9+ and Node.js 20.11.0+ (for local development)
- PostgreSQL 13+ (for local development)
- Redis (for local development)

### Running with Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Rebuild frontend only (after Dockerfile changes):**
   ```bash
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Running Locally (Without Docker)

#### Backend Setup

1. **Create and activate virtual environment (recommended):**
   ```bash
   # Windows PowerShell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Or Windows CMD
   venv\Scripts\activate.bat
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables:**
   
   **Windows PowerShell:**
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
   $env:REDIS_URL="redis://localhost:6379/0"
   $env:SECRET_KEY="your-secret-key-here"
   ```
   
   **Windows CMD:**
   ```cmd
   set DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster
   set REDIS_URL=redis://localhost:6379/0
   set SECRET_KEY=your-secret-key-here
   ```
   
   **Linux/Mac:**
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
   export REDIS_URL="redis://localhost:6379/0"
   export SECRET_KEY="your-secret-key-here"
   ```

4. **Run database migrations and seed data:**
   ```bash
   python seed_data.py
   ```
   
   **Note:** If you get `ModuleNotFoundError`, make sure you've installed dependencies (step 2) and activated your virtual environment.

4. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
   ```

3. **Start the frontend server:**
   ```bash
   npm run dev
   ```

### Sample Login Credentials

After running `seed_data.py`, you can use these test accounts:

**Admin Account:**
- Email: `admin@stockmaster.com`
- Password: `admin123`

**Manager Account:**
- Email: `manager@stockmaster.com`
- Password: `manager123`

**Staff Account:**
- Email: `staff@stockmaster.com`
- Password: `staff123`

### First Steps
1. Sign up at http://localhost:3000/signup (or use sample credentials above)
2. Log in at http://localhost:3000/login
3. Access Dashboard at http://localhost:3000/dashboard
