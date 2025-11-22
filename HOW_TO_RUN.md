# 🚀 How to Run StockMaster Project

This guide provides step-by-step instructions to run the StockMaster Inventory Management System.

---

## 🐳 Option 1: Run with Docker (Easiest - Recommended)

This is the simplest way to run the entire project with all services.

### Prerequisites
- Docker Desktop installed and running
- [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

1. **Open PowerShell or Command Prompt in the project root directory:**
   ```powershell
   cd "D:\Vs code\odoo_hackathon"
   ```

2. **Start all services (Backend, Frontend, PostgreSQL, Redis):**
   ```powershell
   docker-compose up --build
   ```
   
   This will:
   - Build Docker images for backend and frontend
   - Start PostgreSQL database
   - Start Redis cache
   - Start backend API server
   - Start frontend Next.js server

3. **Wait for all services to start** (you'll see logs from all services)

4. **Access the application:**
   - **Frontend (Web App):** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Documentation:** http://localhost:8000/docs

5. **To stop all services:**
   ```powershell
   docker-compose down
   ```

---

## 💻 Option 2: Run Locally (Without Docker)

This requires installing dependencies manually but gives you more control.

### Prerequisites
- Python 3.9+ installed
- Node.js 20.11.0+ installed
- PostgreSQL 13+ installed and running
- Redis installed and running

### Step 1: Setup PostgreSQL Database

1. **Start PostgreSQL service** (if not running)

2. **Create database and user:**
   ```sql
   -- Open PostgreSQL command line or pgAdmin
   CREATE DATABASE stockmaster;
   CREATE USER user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE stockmaster TO user;
   ```

### Step 2: Setup Redis

1. **Start Redis:**
   
   **Option A: Using Docker (easiest for Windows):**
   ```powershell
   docker run -d -p 6379:6379 --name redis redis:6-alpine
   ```
   
   **Option B: Install Redis for Windows:**
   - Download from [redis.io](https://redis.io/download) or use WSL2
   - Or use a Windows port like Memurai

2. **Verify Redis is running:**
   ```powershell
   # If using Docker
   docker ps
   # Should see redis container running
   ```

### Step 3: Setup Backend

1. **Open PowerShell in the backend directory:**
   ```powershell
   cd "D:\Vs code\odoo_hackathon\backend"
   ```

2. **Create and activate virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   
   If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   ```powershell
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
   $env:REDIS_URL="redis://localhost:6379/0"
   $env:SECRET_KEY="your-secret-key-change-this-in-production"
   ```

5. **Initialize database and seed data:**
   ```powershell
   python seed_data.py
   ```
   
   This will create tables and add test users.

6. **Start the backend server:**
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

7. **Keep this terminal open** - the backend server is now running!

### Step 4: Setup Frontend

1. **Open a NEW PowerShell window** (keep backend running)

2. **Navigate to frontend directory:**
   ```powershell
   cd "D:\Vs code\odoo_hackathon\frontend"
   ```

3. **Install Node.js dependencies:**
   ```powershell
   npm install
   ```
   
   This may take a few minutes the first time.

4. **Set environment variable:**
   ```powershell
   $env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
   ```

5. **Start the frontend development server:**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   ▲ Next.js 16.0.3
   - Local:        http://localhost:3000
   ```

### Step 5: Access the Application

1. **Open your web browser** and go to:
   - **Frontend:** http://localhost:3000
   - **Backend API Docs:** http://localhost:8000/docs

2. **Login with test credentials:**
   - Email: `admin@stockmaster.com`
   - Password: `admin123`

---

## 📋 Quick Reference Commands

### Docker Method
```powershell
# Start everything
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build --no-cache frontend
docker-compose up
```

### Local Method

**Backend (Terminal 1):**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
$env:REDIS_URL="redis://localhost:6379/0"
$env:SECRET_KEY="your-secret-key"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```powershell
cd frontend
$env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
npm run dev
```

---

## ✅ Verification Checklist

After starting, verify everything is working:

- [ ] Backend server is running on http://localhost:8000
- [ ] Backend API docs accessible at http://localhost:8000/docs
- [ ] Frontend is running on http://localhost:3000
- [ ] Can access login page at http://localhost:3000/login
- [ ] Can login with test credentials
- [ ] Dashboard loads after login

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: ModuleNotFoundError**
```powershell
# Solution: Make sure virtual environment is activated and dependencies installed
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Problem: Database connection error**
```powershell
# Solution: Check PostgreSQL is running and credentials are correct
# Verify DATABASE_URL environment variable
$env:DATABASE_URL
```

**Problem: Redis connection error**
```powershell
# Solution: Start Redis
docker run -d -p 6379:6379 --name redis redis:6-alpine
```

### Frontend Issues

**Problem: npm install fails**
```powershell
# Solution: Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**Problem: Cannot connect to backend**
```powershell
# Solution: Check environment variable and backend is running
$env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
# Verify backend is running on port 8000
```

**Problem: Port already in use**
```powershell
# Solution: Change port or stop the service using the port
# For backend, use different port:
uvicorn app.main:app --reload --port 8001

# For frontend, edit package.json or use:
npm run dev -- -p 3001
```

### Docker Issues

**Problem: Docker containers won't start**
```powershell
# Solution: Check Docker Desktop is running
# Rebuild containers:
docker-compose down
docker-compose up --build
```

**Problem: Port conflicts**
```powershell
# Solution: Edit docker-compose.yml to change ports
# Or stop services using those ports
```

---

## 🎯 Next Steps After Running

1. **Login** at http://localhost:3000/login
   - Use: `admin@stockmaster.com` / `admin123`

2. **Explore the Dashboard** - View KPIs and inventory overview

3. **Create Products** - Add products to your inventory

4. **Test Features:**
   - Create receipts (incoming stock)
   - Create deliveries (outgoing stock)
   - Internal transfers
   - Stock adjustments
   - View stock ledger

5. **Check API Documentation** - Visit http://localhost:8000/docs for all available endpoints

---

## 📞 Need Help?

- Check the `INSTALLATION_REQUIREMENTS.md` for detailed dependency information
- Review the `README.md` for project overview
- Check backend logs in the terminal for error messages
- Check browser console (F12) for frontend errors

