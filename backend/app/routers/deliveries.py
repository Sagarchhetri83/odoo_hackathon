from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)

@router.post("/", response_model=schemas.DeliveryOrderOut, status_code=status.HTTP_201_CREATED)
def create_delivery(delivery: schemas.DeliveryOrderCreate, db: Session = Depends(get_db), current_user_id: int = 1):
    """
    Create a new delivery order (outgoing stock).
    Note: In a real implementation, current_user_id would come from JWT token authentication.
    """
    # Verify warehouse exists
    warehouse = db.query(models.Warehouse).filter(models.Warehouse.id == delivery.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    
    # Verify all products exist
    for item in delivery.delivery_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with ID {item.product_id} not found")
    
    # Create delivery order
    new_delivery = models.DeliveryOrder(
        warehouse_id=delivery.warehouse_id,
        status=delivery.status,
        created_by=current_user_id
    )
    db.add(new_delivery)
    db.flush()  # Flush to get the delivery ID
    
    # Create delivery items
    for item in delivery.delivery_items:
        delivery_item = models.DeliveryOrderItem(
            delivery_order_id=new_delivery.id,
            product_id=item.product_id,
            quantity_delivered=item.quantity_delivered
        )
        db.add(delivery_item)
    
    db.commit()
    db.refresh(new_delivery)
    return new_delivery

@router.put("/{delivery_id}/validate", response_model=schemas.DeliveryOrderOut)
def validate_delivery(delivery_id: int, db: Session = Depends(get_db)):
    """
    Validate a delivery order - this decreases stock levels and creates ledger entries.
    Prevents negative stock unless explicitly allowed.
    """
    delivery = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery order not found")
    
    if delivery.status == "Done":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivery order already validated")
    
    if delivery.status == "Canceled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot validate a canceled delivery order")
    
    # Check stock availability before processing
    for delivery_item in delivery.delivery_items:
        stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == delivery_item.product_id,
            models.StockLevel.warehouse_id == delivery.warehouse_id
        ).first()
        
        if not stock_level or stock_level.quantity < delivery_item.quantity_delivered:
            product = db.query(models.Product).filter(models.Product.id == delivery_item.product_id).first()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.name if product else delivery_item.product_id}. Available: {stock_level.quantity if stock_level else 0}, Required: {delivery_item.quantity_delivered}"
            )
    
    # Update delivery status
    delivery.status = "Done"
    delivery.validated_at = datetime.utcnow()
    
    # Process each delivery item
    for delivery_item in delivery.delivery_items:
        # Get stock level
        stock_level = db.query(models.StockLevel).filter(
            models.StockLevel.product_id == delivery_item.product_id,
            models.StockLevel.warehouse_id == delivery.warehouse_id
        ).first()
        
        # Update stock level (decrease)
        old_quantity = stock_level.quantity
        stock_level.quantity -= delivery_item.quantity_delivered
        new_quantity = stock_level.quantity
        
        # Create ledger entry
        ledger_entry = models.StockLedgerEntry(
            product_id=delivery_item.product_id,
            warehouse_id=delivery.warehouse_id,
            change_quantity=-delivery_item.quantity_delivered,  # Negative for outgoing
            new_stock_level=new_quantity,
            document_type="Delivery",
            document_id=delivery.id,
            created_by=delivery.created_by
        )
        db.add(ledger_entry)
    
    db.commit()
    db.refresh(delivery)
    return delivery

@router.get("/", response_model=List[schemas.DeliveryOrderOut])
def get_deliveries(db: Session = Depends(get_db)):
    deliveries = db.query(models.DeliveryOrder).all()
    return deliveries

@router.get("/{delivery_id}", response_model=schemas.DeliveryOrderOut)
def get_delivery(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(models.DeliveryOrder).filter(models.DeliveryOrder.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery order not found")
    return delivery
