from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
import enum

# User and Auth Schemas (already defined)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class PasswordReset(BaseModel):
    reset_token: str
    new_password: str

# Inventory Schemas

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    sku_code: str
    category_id: int
    unit_of_measure: str
    initial_stock: Optional[int] = 0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    sku_code: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    initial_stock: Optional[int] = None

class ProductOut(ProductBase):
    id: int
    category: CategoryOut

    class Config:
        orm_mode = True

class WarehouseBase(BaseModel):
    name: str

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseOut(WarehouseBase):
    id: int

    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    name: str
    warehouse_id: int

class LocationCreate(LocationBase):
    pass

class LocationOut(LocationBase):
    id: int
    warehouse: WarehouseOut

    class Config:
        orm_mode = True

class StockLevelBase(BaseModel):
    product_id: int
    warehouse_id: int
    location_id: Optional[int]
    quantity: int
    reorder_point: int

class StockLevelOut(StockLevelBase):
    id: int
    product: ProductOut
    warehouse: WarehouseOut
    location: Optional[LocationOut]

    class Config:
        orm_mode = True

class SupplierBase(BaseModel):
    name: str

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int

    class Config:
        orm_mode = True

class ReceiptItemBase(BaseModel):
    product_id: int
    quantity_received: int

class ReceiptItemCreate(ReceiptItemBase):
    pass

class ReceiptItemOut(ReceiptItemBase):
    id: int
    product: ProductOut

    class Config:
        orm_mode = True

class ReceiptBase(BaseModel):
    supplier_id: int
    warehouse_id: int
    status: Optional[str] = "Draft"
    receipt_items: List[ReceiptItemCreate]

class ReceiptCreate(ReceiptBase):
    pass

class ReceiptOut(ReceiptBase):
    id: int
    created_at: datetime
    validated_at: Optional[datetime]
    created_by_user: UserOut
    supplier: SupplierOut
    warehouse: WarehouseOut
    receipt_items: List[ReceiptItemOut]

    class Config:
        orm_mode = True

class DeliveryOrderItemBase(BaseModel):
    product_id: int
    quantity_delivered: int

class DeliveryOrderItemCreate(DeliveryOrderItemBase):
    pass

class DeliveryOrderItemOut(DeliveryOrderItemBase):
    id: int
    product: ProductOut

    class Config:
        orm_mode = True

class DeliveryOrderBase(BaseModel):
    warehouse_id: int
    status: Optional[str] = "Draft"
    delivery_items: List[DeliveryOrderItemCreate]

class DeliveryOrderCreate(DeliveryOrderBase):
    pass

class DeliveryOrderOut(DeliveryOrderBase):
    id: int
    created_at: datetime
    validated_at: Optional[datetime]
    created_by_user: UserOut
    warehouse: WarehouseOut
    delivery_items: List[DeliveryOrderItemOut]

    class Config:
        orm_mode = True

class InternalTransferItemBase(BaseModel):
    product_id: int
    quantity: int
    from_location_id: Optional[int]
    to_location_id: Optional[int]

class InternalTransferItemCreate(InternalTransferItemBase):
    pass

class InternalTransferItemOut(InternalTransferItemBase):
    id: int
    product: ProductOut
    from_location: Optional[LocationOut]
    to_location: Optional[LocationOut]

    class Config:
        orm_mode = True

class InternalTransferBase(BaseModel):
    from_warehouse_id: int
    to_warehouse_id: int
    status: Optional[str] = "Draft"
    transfer_items: List[InternalTransferItemCreate]

class InternalTransferCreate(InternalTransferBase):
    pass

class InternalTransferOut(InternalTransferBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime]
    created_by_user: UserOut
    from_warehouse: WarehouseOut
    to_warehouse: WarehouseOut
    transfer_items: List[InternalTransferItemOut]

    class Config:
        orm_mode = True

class StockAdjustmentItemBase(BaseModel):
    product_id: int
    counted_quantity: int
    location_id: Optional[int]

class StockAdjustmentItemCreate(StockAdjustmentItemBase):
    pass

class StockAdjustmentItemOut(StockAdjustmentItemBase):
    id: int
    product: ProductOut
    location: Optional[LocationOut]
    system_quantity: int

    class Config:
        orm_mode = True

class StockAdjustmentBase(BaseModel):
    warehouse_id: int
    reason: Optional[str]
    adjustment_items: List[StockAdjustmentItemCreate]

class StockAdjustmentCreate(StockAdjustmentBase):
    pass

class StockAdjustmentOut(StockAdjustmentBase):
    id: int
    created_at: datetime
    created_by_user: UserOut
    warehouse: WarehouseOut
    adjustment_items: List[StockAdjustmentItemOut]

    class Config:
        orm_mode = True

class StockLedgerEntryOut(BaseModel):
    id: int
    product: ProductOut
    warehouse: WarehouseOut
    location: Optional[LocationOut]
    change_quantity: int
    new_stock_level: int
    document_type: str
    document_id: int
    timestamp: datetime
    created_by_user: UserOut

    class Config:
        orm_mode = True

# Dashboard Schemas
class DashboardKPIs(BaseModel):
    total_products_in_stock: int
    low_stock_items: int
    out_of_stock_items: int
    pending_receipts: int
    pending_deliveries: int
    internal_transfers_scheduled: int

class DashboardFilterParams(BaseModel):
    document_type: Optional[str] = None # Receipts, Delivery, Internal, Adjustments
    status: Optional[str] = None # Draft, Waiting, Ready, Done, Canceled
    warehouse_id: Optional[int] = None
    location_id: Optional[int] = None
    product_category_id: Optional[int] = None

class DashboardData(BaseModel):
    kpis: DashboardKPIs
    # Potentially add a list of filtered documents here too if needed
