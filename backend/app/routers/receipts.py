from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)

@router.post("/", response_model=schemas.ReceiptOut, status_code=status.HTTP_201_CREATED)
def create_receipt(receipt: schemas.ReceiptCreate, db: Session = Depends(get_db), current_user_id: int = 1):
    """
    Create a new receipt (incoming stock).
    Note: In a real implementation, current_user_id would come from JWT token authentication.
    """
    # Verify supplier exists
    supplier = db.query(models.Supplier).filter(models.Supplier.id == receipt.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    
    # Verify warehouse exists
    warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == receipt.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    
    # Verify all products exist
    for item in receipt.receipt_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item.product_id} not found")
    
    # Create receipt
    new_receipt = models.Receipt(
        supplier_id=receipt.supplier_id,
        warehouse_id=receipt.warehouse_id,
        status=receipt.status,
        created_by=current_user_id
    )
    db.add(new_receipt)
    db.flush()  # Flush to get the receipt ID
    
    # Create receipt items
    for item in receipt.receipt_items:
        receipt_item = models.ReceiptItem(
            receipt_id=new_receipt.id,
            product_id=item.product_id,
            quantity_received=item.quantity_received
        )
        db.add(receipt_item)
    
    db.commit()
    db.refresh(new_receipt)
    return new_receipt

@router.put("/{receipt_id}/validate", response_model=schemas.ReceiptOut)
def validate_receipt(receipt_id: int, db: Session = Depends(get_db)):
    """
    Validate a receipt - this increases stock levels and creates ledger entries.
    """
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")
    
    if receipt.status == "Done":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Receipt already validated")
    
    if receipt.status == "Canceled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot validate a canceled receipt")
    
    # Update receipt status
    receipt.status = "Done"
    receipt.validated_at = datetime.utcnow()
    
    # Process each receipt item
    for receipt_item in receipt.receipt_items:
        # Get or create stock level for this product and warehouse
        stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == receipt_item.product_id,
            models.StockLevel.warehouse_id == receipt.warehouse_id
        ).first()
        
        if not stock_level:
            # Create new stock level
            stock_level = models.StockLevel(
                product_id=receipt_item.product_id,
                warehouse_id=receipt.warehouse_id,
                quantity=0,
                reorder_point=0
            )
            db.add(stock_level)
            db.flush()
        
        # Update stock level (increase)
        old_quantity = stock_level.quantity
        stock_level.quantity += receipt_item.quantity_received
        new_quantity = stock_level.quantity
        
        # Create ledger entry
        ledger_entry = models.StockLedgerEntry(
            product_id=receipt_item.product_id,
            warehouse_id=receipt.warehouse_id,
            change_quantity=receipt_item.quantity_received,  # Positive for incoming
            new_stock_level=new_quantity,
            document_type="Receipt",
            document_id=receipt.id,
            created_by=receipt.created_by
        )
        db.add(ledger_entry)
    
    db.commit()
    db.refresh(receipt)
    return receipt

@router.get("/", response_model=List[schemas.ReceiptOut])
def get_receipts(db: Session = Depends(get_db)):
    receipts = db.query(models.Receipt).all()
    return receipts

@router.get("/{receipt_id}", response_model=schemas.ReceiptOut)
def get_receipt(receipt_id: int, db: Session = Depends(get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")
    return receipt
