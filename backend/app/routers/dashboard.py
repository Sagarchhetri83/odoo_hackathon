from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/kpis", response_model=schemas.DashboardKPIs)
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    document_type: Optional[str] = Query(None, description="Filter by document type: Receipts, Delivery, Internal, Adjustments"),
    status: Optional[str] = Query(None, description="Filter by status: Draft, Waiting, Ready, Done, Canceled"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    location_id: Optional[int] = Query(None, description="Filter by location ID"),
    product_category_id: Optional[int] = Query(None, description="Filter by product category ID")
):
    """
    Get Dashboard KPIs with optional dynamic filters.
    Returns:
    - Total Products in Stock
    - Low Stock / Out of Stock items
    - Pending Receipts
    - Pending Deliveries
    - Internal Transfers Scheduled
    """
    
    # Build base query filters
    filters = []
    
    # Filter by warehouse if provided
    warehouse_filter = None
    if warehouse_id:
        warehouse_filter = models.StockLevel.warehouse_id == warehouse_id
    
    # Filter by location if provided
    location_filter = None
    if location_id:
        location_filter = models.StockLevel.location_id == location_id
    
    # Filter by product category if provided
    category_filter = None
    if product_category_id:
        category_filter = models.Product.category_id == product_category_id
    
    # Build stock level query with filters
    stock_query = db.query(models.StockLevel)
    if warehouse_filter:
        stock_query = stock_query.filter(warehouse_filter)
    if location_filter:
        stock_query = stock_query.filter(location_filter)
    if category_filter:
        stock_query = stock_query.join(models.Product).filter(category_filter)
    
    # Total Products in Stock (sum of all stock levels with filters applied)
    total_products_in_stock = stock_query.with_entities(func.sum(models.StockLevel.quantity)).scalar() or 0
    
    # Low Stock Items (quantity <= reorder_point and > 0)
    low_stock_query = stock_query.filter(
        and_(
            models.StockLevel.quantity <= models.StockLevel.reorder_point,
            models.StockLevel.quantity > 0
        )
    )
    low_stock_items = low_stock_query.count()
    
    # Out of Stock Items (quantity = 0)
    out_of_stock_query = stock_query.filter(models.StockLevel.quantity == 0)
    out_of_stock_items = out_of_stock_query.count()
    
    # Pending Receipts (status in Draft, Waiting, Ready)
    receipt_query = db.query(models.Receipt).filter(
        models.Receipt.status.in_(["Draft", "Waiting", "Ready"])
    )
    if warehouse_id:
        receipt_query = receipt_query.filter(models.Receipt.warehouse_id == warehouse_id)
    if document_type and document_type.lower() == "receipts":
        # Already filtered by document type
        pass
    pending_receipts = receipt_query.count()
    
    # Pending Deliveries (status in Draft, Waiting, Ready)
    delivery_query = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.status.in_(["Draft", "Waiting", "Ready"])
    )
    if warehouse_id:
        delivery_query = delivery_query.filter(models.DeliveryOrder.warehouse_id == warehouse_id)
    if document_type and document_type.lower() == "delivery":
        # Already filtered by document type
        pass
    pending_deliveries = delivery_query.count()
    
    # Internal Transfers Scheduled (status in Draft, Waiting, Ready)
    transfer_query = db.query(models.InternalTransfer).filter(
        models.InternalTransfer.status.in_(["Draft", "Waiting", "Ready"])
    )
    if warehouse_id:
        transfer_query = transfer_query.filter(
            or_(
                models.InternalTransfer.from_warehouse_id == warehouse_id,
                models.InternalTransfer.to_warehouse_id == warehouse_id
            )
        )
    if document_type and document_type.lower() in ["internal", "internal transfer"]:
        # Already filtered by document type
        pass
    internal_transfers_scheduled = transfer_query.count()
    
    return schemas.DashboardKPIs(
        total_products_in_stock=total_products_in_stock,
        low_stock_items=low_stock_items,
        out_of_stock_items=out_of_stock_items,
        pending_receipts=pending_receipts,
        pending_deliveries=pending_deliveries,
        internal_transfers_scheduled=internal_transfers_scheduled
    )
