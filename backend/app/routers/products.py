from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_id: Optional[int] = None,
    sku_code: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get all products with optional filters:
    - category_id: Filter by product category
    - sku_code: Filter by SKU code (exact match)
    - search: Search by product name or SKU (partial match)
    """
    query = db.query(models.Product)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if sku_code:
        query = query.filter(models.Product.sku_code == sku_code)
    
    if search:
        query = query.filter(
            (models.Product.name.ilike(f"%{search}%")) |
            (models.Product.sku_code.ilike(f"%{search}%"))
        )
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check if SKU code already exists
    existing_product = db.query(models.Product).filter(models.Product.sku_code == product.sku_code).first()
    if existing_product:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU code already exists")
    
    # Check if category exists
    category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    new_product = models.Product(
        name=product.name,
        sku_code=product.sku_code,
        category_id=product.category_id,
        unit_of_measure=product.unit_of_measure,
        initial_stock=product.initial_stock or 0
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    # If initial_stock is provided, create stock level entries
    # Note: This would typically require a warehouse_id, but for simplicity,
    # we'll create a default stock level. In a real system, you'd need to specify the warehouse.
    # For now, we'll skip automatic stock level creation and let it be done manually.
    
    return new_product

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Check if SKU code is being updated and if it already exists
    if product_update.sku_code and product_update.sku_code != product.sku_code:
        existing_product = db.query(models.Product).filter(models.Product.sku_code == product_update.sku_code).first()
        if existing_product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU code already exists")
    
    # Check if category is being updated and if it exists
    if product_update.category_id and product_update.category_id != product.category_id:
        category = db.query(models.Category).filter(models.Category.id == product_update.category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Update product fields
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product
