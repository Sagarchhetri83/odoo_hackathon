# Quick Start Guide - StockMaster

## ✅ Step 1: Install Dependencies (DONE!)
The dependencies have been successfully installed in your virtual environment.

## 📝 Step 2: Set Environment Variables

In your PowerShell terminal (where you have the venv activated), run:

```powershell
$env:DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
$env:REDIS_URL="redis://localhost:6379/0"
$env:SECRET_KEY="your-secret-key-change-this-in-production"
```

**Note:** Make sure PostgreSQL and Redis are running before proceeding!

## 🗄️ Step 3: Setup Database

If you haven't created the database yet:

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE stockmaster;
   CREATE USER user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE stockmaster TO user;
   ```

2. **Initialize database and seed data:**
   ```powershell
   python seed_data.py
   ```

## 🚀 Step 4: Start Backend Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## 🎨 Step 5: Start Frontend (in a NEW terminal)

Open a **new PowerShell window**:

```powershell
cd "D:\Vs code\odoo_hackathon\frontend"
npm install
$env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
npm run dev
```

## 🌐 Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🔐 Login Credentials

After running `seed_data.py`, use:
- Email: `admin@stockmaster.com`
- Password: `admin123`

---

## 🐳 Alternative: Use Docker (Easier!)

If you prefer, you can use Docker instead:

```powershell
cd "D:\Vs code\odoo_hackathon"
docker-compose up --build
```

This starts everything automatically (backend, frontend, PostgreSQL, Redis).

