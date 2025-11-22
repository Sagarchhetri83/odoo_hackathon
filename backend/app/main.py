from fastapi import FastAPI
from .database import engine, Base
from . import models
from .routers import auth, dashboard, products, receipts, deliveries, transfers, adjustments, ledger

app = FastAPI()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(receipts.router)
app.include_router(deliveries.router)
app.include_router(transfers.router)
app.include_router(adjustments.router)
app.include_router(ledger.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to StockMaster Backend!"}
