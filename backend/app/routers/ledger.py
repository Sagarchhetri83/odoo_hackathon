from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/ledger",
    tags=["Ledger"]
)

@router.get("/", response_model=List[schemas.StockLedgerEntryOut])
def get_ledger(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[int] = None,
    warehouse_id: Optional[int] = None,
    location_id: Optional[int] = None,
    document_type: Optional[str] = None,
    document_id: Optional[int] = None
):
    """
    Get stock ledger entries (immutable audit trail) with optional filters.
    """
    query = db.query(models.StockLedgerEntry)
    
    if product_id:
        query = query.filter(models.StockLedgerEntry.product_id == product_id)
    
    if warehouse_id:
        query = query.filter(models.StockLedgerEntry.warehouse_id == warehouse_id)
    
    if location_id:
        query = query.filter(models.StockLedgerEntry.location_id == location_id)
    
    if document_type:
        query = query.filter(models.StockLedgerEntry.document_type == document_type)
    
    if document_id:
        query = query.filter(models.StockLedgerEntry.document_id == document_id)
    
    # Order by timestamp descending (most recent first)
    entries = query.order_by(models.StockLedgerEntry.timestamp.desc()).offset(skip).limit(limit).all()
    return entries

