# Installation Requirements - StockMaster Project

This document provides a complete list of all requirements and installation instructions for the StockMaster Inventory Management System.

## 📋 System Requirements

### Prerequisites
- **Operating System**: Windows 10/11, Linux, or macOS
- **Python**: 3.9 or higher
- **Node.js**: 20.11.0 or higher
- **PostgreSQL**: 13 or higher
- **Redis**: 6 or higher
- **Docker Desktop** (optional, for containerized setup)

---

## 🔧 Backend Requirements

### Python Dependencies

All Python packages are listed in `backend/requirements.txt`:

```
fastapi==0.70.0
uvicorn==0.15.0
SQLAlchemy==1.4.27
psycopg2-binary==2.9.3
aiohttp==3.8.1
redis==4.0.0
python-jose[cryptography]==3.3.0
bcrypt==3.2.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.5
pydantic[email]
email-validator
pytest==6.2.5
httpx==0.19.0
```

### Backend Installation Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Windows CMD
   python -m venv venv
   venv\Scripts\activate.bat
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   
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

5. **Run database migrations and seed data:**
   ```bash
   python seed_data.py
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## 🎨 Frontend Requirements

### Node.js Dependencies

All Node.js packages are listed in `frontend/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "js-cookie": "^3.0.5",
    "next": "^16.0.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

### Frontend Installation Steps

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variable:**
   
   **Windows PowerShell:**
   ```powershell
   $env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
   ```
   
   **Windows CMD:**
   ```cmd
   set NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
   
   **Linux/Mac:**
   ```bash
   export NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

---

## 🗄️ Database Requirements

### PostgreSQL Setup

1. **Install PostgreSQL 13+** from [postgresql.org](https://www.postgresql.org/download/)

2. **Create database:**
   ```sql
   CREATE DATABASE stockmaster;
   CREATE USER user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE stockmaster TO user;
   ```

3. **Verify connection:**
   ```bash
   psql -U user -d stockmaster -h localhost
   ```

---

## 🔴 Redis Requirements

### Redis Setup

1. **Install Redis:**
   
   **Windows:**
   - Download from [redis.io](https://redis.io/download) or use WSL2
   - Or use Docker: `docker run -d -p 6379:6379 redis:6-alpine`
   
   **Linux:**
   ```bash
   sudo apt-get update
   sudo apt-get install redis-server
   sudo systemctl start redis
   ```
   
   **macOS:**
   ```bash
   brew install redis
   brew services start redis
   ```

2. **Verify Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

---

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

If you prefer using Docker, all services are configured in `docker-compose.yml`:

**Services included:**
- Backend (FastAPI) - Port 8000
- Frontend (Next.js) - Port 3000
- PostgreSQL 13 - Port 5432
- Redis 6 - Port 6379

**Installation Steps:**

1. **Ensure Docker Desktop is installed and running**

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Rebuild frontend only (after Dockerfile changes):**
   ```bash
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up
   ```

---

## 📦 Complete Installation Checklist

### For Local Development (Without Docker)

- [ ] Install Python 3.9+
- [ ] Install Node.js 20.11.0+
- [ ] Install PostgreSQL 13+
- [ ] Install Redis 6+
- [ ] Create Python virtual environment
- [ ] Install backend dependencies (`pip install -r backend/requirements.txt`)
- [ ] Install frontend dependencies (`npm install` in frontend folder)
- [ ] Set up PostgreSQL database
- [ ] Start Redis server
- [ ] Set environment variables (DATABASE_URL, REDIS_URL, SECRET_KEY, NEXT_PUBLIC_BACKEND_URL)
- [ ] Run database seed script (`python backend/seed_data.py`)
- [ ] Start backend server (`uvicorn app.main:app --reload`)
- [ ] Start frontend server (`npm run dev` in frontend folder)

### For Docker Setup

- [ ] Install Docker Desktop
- [ ] Ensure Docker Desktop is running
- [ ] Run `docker-compose up --build`
- [ ] Access application at http://localhost:3000

---

## 🔐 Default Test Credentials

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

---

## 🚀 Quick Start Commands

### Windows PowerShell

```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
$env:REDIS_URL="redis://localhost:6379/0"
$env:SECRET_KEY="your-secret-key-here"
python seed_data.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in new terminal)
cd frontend
npm install
$env:NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
npm run dev
```

### Linux/Mac

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"
export REDIS_URL="redis://localhost:6379/0"
export SECRET_KEY="your-secret-key-here"
python seed_data.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in new terminal)
cd frontend
npm install
export NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
npm run dev
```

---

## 📝 Notes

- Make sure PostgreSQL and Redis are running before starting the backend
- The backend runs on port 8000 by default
- The frontend runs on port 3000 by default
- API documentation is available at http://localhost:8000/docs when backend is running
- For production, change the SECRET_KEY to a strong, securely generated key

---

## 🆘 Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure virtual environment is activated and dependencies are installed
2. **Database connection error**: Verify PostgreSQL is running and credentials are correct
3. **Redis connection error**: Verify Redis is running on port 6379
4. **Port already in use**: Change ports in docker-compose.yml or use different ports for local setup
5. **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

