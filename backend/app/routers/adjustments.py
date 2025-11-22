from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/adjustments",
    tags=["Adjustments"]
)

@router.post("/", response_model=schemas.StockAdjustmentOut, status_code=status.HTTP_201_CREATED)
def create_adjustment(adjustment: schemas.StockAdjustmentCreate, db: Session = Depends(get_db), current_user_id: int = 1):
    """
    Create a stock adjustment - fixes mismatches between recorded stock vs physical count.
    This immediately updates stock levels and creates ledger entries.
    Note: In a real implementation, current_user_id would come from JWT token authentication.
    """
    # Verify warehouse exists
    warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == adjustment.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    
    # Verify all products exist
    for item in adjustment.adjustment_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item.product_id} not found")
    
    # Create stock adjustment
    new_adjustment = models.StockAdjustment(
        warehouse_id=adjustment.warehouse_id,
        reason=adjustment.reason,
        status="Done",  # Adjustments are immediately done
        created_by=current_user_id
    )
    db.add(new_adjustment)
    db.flush()  # Flush to get the adjustment ID
    
    # Process each adjustment item
    for item in adjustment.adjustment_items:
        # Get or create stock level
        stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == item.product_id,
            models.StockLevel.warehouse_id == adjustment.warehouse_id
        ).first()
        
        system_quantity = stock_level.quantity if stock_level else 0
        
        if not stock_level:
            # Create new stock level
            stock_level = models.StockLevel(
                product_id=item.product_id,
                warehouse_id=adjustment.warehouse_id,
                location_id=item.location_id,
                quantity=0,
                reorder_point=0
            )
            db.add(stock_level)
            db.flush()
        
        # Calculate the adjustment difference
        adjustment_difference = item.counted_quantity - system_quantity
        
        # Update stock level to the counted quantity
        stock_level.quantity = item.counted_quantity
        if item.location_id:
            stock_level.location_id = item.location_id
        
        # Create adjustment item record
        adjustment_item = models.StockAdjustmentItem(
            stock_adjustment_id=new_adjustment.id,
            product_id=item.product_id,
            counted_quantity=item.counted_quantity,
            system_quantity=system_quantity,
            location_id=item.location_id
        )
        db.add(adjustment_item)
        
        # Create ledger entry
        ledger_entry = models.StockLedgerEntry(
            product_id=item.product_id,
            warehouse_id=adjustment.warehouse_id,
            location_id=item.location_id,
            change_quantity=adjustment_difference,  # Can be positive or negative
            new_stock_level=item.counted_quantity,
            document_type="Adjustment",
            document_id=new_adjustment.id,
            created_by=current_user_id
        )
        db.add(ledger_entry)
    
    db.commit()
    db.refresh(new_adjustment)
    return new_adjustment

@router.get("/", response_model=List[schemas.StockAdjustmentOut])
def get_adjustments(db: Session = Depends(get_db)):
    adjustments = db.query(models.StockAdjustment).all()
    return adjustments

@router.get("/{adjustment_id}", response_model=schemas.StockAdjustmentOut)
def get_adjustment(adjustment_id: int, db: Session = Depends(get_db)):
    adjustment = db.query(models.StockAdjustment).filter(models.StockAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock adjustment not found")
    return adjustment

