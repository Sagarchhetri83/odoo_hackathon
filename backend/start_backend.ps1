# Backend Startup Script for Windows PowerShell

Write-Host "Starting StockMaster Backend Server..." -ForegroundColor Green

# Check if virtual environment is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    if (Test-Path "venv\Scripts\Activate.ps1") {
        .\venv\Scripts\Activate.ps1
    } else {
        Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
        Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
        Write-Host "  python -m venv venv" -ForegroundColor Cyan
        Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
        exit 1
    }
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
# Update DATABASE_URL with your PostgreSQL credentials
# Database: ims_db, Username: postgres, Password: Sagar@123
# Note: @ in password is URL encoded as %40
$env:DATABASE_URL = "postgresql://postgres:Sagar%40123@localhost:5432/ims_db"
$env:REDIS_URL = "redis://localhost:6379/0"
$env:SECRET_KEY = "dev-secret-key-change-in-production"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "  REDIS_URL: $env:REDIS_URL" -ForegroundColor Cyan
Write-Host "  SECRET_KEY: [hidden]" -ForegroundColor Cyan
Write-Host ""

# Check if uvicorn is installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import uvicorn" 2>$null
    Write-Host "Dependencies OK" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Dependencies not installed!" -ForegroundColor Red
    Write-Host "Please install dependencies:" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

