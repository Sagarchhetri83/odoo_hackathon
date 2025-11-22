from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)

@router.post("/", response_model=schemas.InternalTransferOut, status_code=status.HTTP_201_CREATED)
def create_transfer(transfer: schemas.InternalTransferCreate, db: Session = Depends(get_db), current_user_id: int = 1):
    """
    Create a new internal transfer (moving stock between warehouses/locations).
    Note: In a real implementation, current_user_id would come from JWT token authentication.
    """
    # Verify warehouses exist
    from_warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == transfer.from_warehouse_id).first()
    if not from_warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source warehouse not found")
    
    to_warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == transfer.to_warehouse_id).first()
    if not to_warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination warehouse not found")
    
    if transfer.from_warehouse_id == transfer.to_warehouse_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Source and destination warehouses cannot be the same")
    
    # Verify all products exist
    for item in transfer.transfer_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item.product_id} not found")
    
    # Create internal transfer
    new_transfer = models.InternalTransfer(
        from_warehouse_id=transfer.from_warehouse_id,
        to_warehouse_id=transfer.to_warehouse_id,
        status=transfer.status,
        created_by=current_user_id
    )
    db.add(new_transfer)
    db.flush()  # Flush to get the transfer ID
    
    # Create transfer items
    for item in transfer.transfer_items:
        transfer_item = models.InternalTransferItem(
            internal_transfer_id=new_transfer.id,
            product_id=item.product_id,
            quantity=item.quantity,
            from_location_id=item.from_location_id,
            to_location_id=item.to_location_id
        )
        db.add(transfer_item)
    
    db.commit()
    db.refresh(new_transfer)
    return new_transfer

@router.put("/{transfer_id}/complete", response_model=schemas.InternalTransferOut)
def complete_transfer(transfer_id: int, db: Session = Depends(get_db)):
    """
    Complete an internal transfer - this moves stock from source to destination warehouse.
    Stock total stays the same; only location changes.
    """
    transfer = db.query(models.InternalTransfer).filter(models.InternalTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internal transfer not found")
    
    if transfer.status == "Done":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transfer already completed")
    
    if transfer.status == "Canceled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot complete a canceled transfer")
    
    # Check stock availability in source warehouse
    for transfer_item in transfer.transfer_items:
        stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == transfer_item.product_id,
            models.StockLevel.warehouse_id == transfer.from_warehouse_id
        ).first()
        
        if not stock_level or stock_level.quantity < transfer_item.quantity:
            product = db.query(models.Product).filter(models.Product.id == transfer_item.product_id).first()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.name if product else transfer_item.product_id} in source warehouse. Available: {stock_level.quantity if stock_level else 0}, Required: {transfer_item.quantity}"
            )
    
    # Update transfer status
    transfer.status = "Done"
    transfer.completed_at = datetime.utcnow()
    
    # Process each transfer item
    for transfer_item in transfer.transfer_items:
        # Decrease stock in source warehouse
        from_stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == transfer_item.product_id,
            models.StockLevel.warehouse_id == transfer.from_warehouse_id
        ).first()
        
        from_stock_level.quantity -= transfer_item.quantity
        from_new_quantity = from_stock_level.quantity
        
        # Create ledger entry for source warehouse (outgoing)
        from_ledger_entry = models.StockLedgerEntry(
            product_id=transfer_item.product_id,
            warehouse_id=transfer.from_warehouse_id,
            location_id=transfer_item.from_location_id,
            change_quantity=-transfer_item.quantity,  # Negative for outgoing
            new_stock_level=from_new_quantity,
            document_type="Internal Transfer",
            document_id=transfer.id,
            created_by=transfer.created_by
        )
        db.add(from_ledger_entry)
        
        # Increase stock in destination warehouse
        to_stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == transfer_item.product_id,
            models.StockLevel.warehouse_id == transfer.to_warehouse_id
        ).first()
        
        if not to_stock_level:
            # Create new stock level for destination warehouse
            to_stock_level = models.StockLevel(
                product_id=transfer_item.product_id,
                warehouse_id=transfer.to_warehouse_id,
                location_id=transfer_item.to_location_id,
                quantity=0,
                reorder_point=0
            )
            db.add(to_stock_level)
            db.flush()
        
        to_stock_level.quantity += transfer_item.quantity
        to_stock_level.location_id = transfer_item.to_location_id  # Update location if specified
        to_new_quantity = to_stock_level.quantity
        
        # Create ledger entry for destination warehouse (incoming)
        to_ledger_entry = models.StockLedgerEntry(
            product_id=transfer_item.product_id,
            warehouse_id=transfer.to_warehouse_id,
            location_id=transfer_item.to_location_id,
            change_quantity=transfer_item.quantity,  # Positive for incoming
            new_stock_level=to_new_quantity,
            document_type="Internal Transfer",
            document_id=transfer.id,
            created_by=transfer.created_by
        )
        db.add(to_ledger_entry)
    
    db.commit()
    db.refresh(transfer)
    return transfer

@router.get("/", response_model=List[schemas.InternalTransferOut])
def get_transfers(db: Session = Depends(get_db)):
    transfers = db.query(models.InternalTransfer).all()
    return transfers

@router.get("/{transfer_id}", response_model=schemas.InternalTransferOut)
def get_transfer(transfer_id: int, db: Session = Depends(get_db)):
    transfer = db.query(models.InternalTransfer).filter(models.InternalTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internal transfer not found")
    return transfer
