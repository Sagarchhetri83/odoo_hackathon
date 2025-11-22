from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

# User and OTP models (already defined)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    otps = relationship("OTP", back_populates="user")
    receipts = relationship("Receipt", back_populates="created_by_user")
    deliveries = relationship("DeliveryOrder", back_populates="created_by_user")
    transfers = relationship("InternalTransfer", back_populates="created_by_user")
    adjustments = relationship("StockAdjustment", back_populates="created_by_user")
    ledger_entries = relationship("StockLedgerEntry", back_populates="created_by_user")

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    otp_code = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="otps")

# Inventory Models
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku_code = Column(String, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    unit_of_measure = Column(String)
    initial_stock = Column(Integer, default=0) # Optional initial stock

    category = relationship("Category", back_populates="products")
    stock_levels = relationship("StockLevel", back_populates="product")
    receipt_items = relationship("ReceiptItem", back_populates="product")
    delivery_items = relationship("DeliveryOrderItem", back_populates="product")
    transfer_items = relationship("InternalTransferItem", back_populates="product")
    ledger_entries = relationship("StockLedgerEntry", back_populates="product")
    adjustment_items = relationship("StockAdjustmentItem", back_populates="product")

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    locations = relationship("Location", back_populates="warehouse")
    stock_levels = relationship("StockLevel", back_populates="warehouse")
    receipts = relationship("Receipt", back_populates="warehouse")
    deliveries = relationship("DeliveryOrder", back_populates="warehouse")
    internal_transfers_from = relationship("InternalTransfer", foreign_keys="[InternalTransfer.from_warehouse_id]", back_populates="from_warehouse")
    internal_transfers_to = relationship("InternalTransfer", foreign_keys="[InternalTransfer.to_warehouse_id]", back_populates="to_warehouse")
    stock_adjustments = relationship("StockAdjustment", back_populates="warehouse")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))

    warehouse = relationship("Warehouse", back_populates="locations")
    stock_levels = relationship("StockLevel", back_populates="location")

class StockLevel(Base):
    __tablename__ = "stock_levels"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    quantity = Column(Integer, default=0)
    reorder_point = Column(Integer, default=0)

    product = relationship("Product", back_populates="stock_levels")
    warehouse = relationship("Warehouse", back_populates="stock_levels")
    location = relationship("Location", back_populates="stock_levels")

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    receipts = relationship("Receipt", back_populates="supplier")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String, default="Receipt")
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Draft") # Draft, Waiting, Ready, Done, Canceled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    validated_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))

    supplier = relationship("Supplier", back_populates="receipts")
    warehouse = relationship("Warehouse", back_populates="receipts")
    created_by_user = relationship("User", back_populates="receipts")
    receipt_items = relationship("ReceiptItem", back_populates="receipt")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity_received = Column(Integer)

    receipt = relationship("Receipt", back_populates="receipt_items")
    product = relationship("Product", back_populates="receipt_items")

class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String, default="Delivery")
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Draft") # Draft, Waiting, Ready, Done, Canceled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    validated_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))

    warehouse = relationship("Warehouse", back_populates="deliveries")
    created_by_user = relationship("User", back_populates="deliveries")
    delivery_items = relationship("DeliveryOrderItem", back_populates="delivery_order")

class DeliveryOrderItem(Base):
    __tablename__ = "delivery_order_items"
    id = Column(Integer, primary_key=True, index=True)
    delivery_order_id = Column(Integer, ForeignKey("delivery_orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity_delivered = Column(Integer)

    delivery_order = relationship("DeliveryOrder", back_populates="delivery_items")
    product = relationship("Product", back_populates="delivery_items")

class InternalTransfer(Base):
    __tablename__ = "internal_transfers"
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String, default="Internal Transfer")
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Draft") # Draft, Waiting, Ready, Done, Canceled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))

    from_warehouse = relationship("Warehouse", foreign_keys="[InternalTransfer.from_warehouse_id]", back_populates="internal_transfers_from")
    to_warehouse = relationship("Warehouse", foreign_keys="[InternalTransfer.to_warehouse_id]", back_populates="internal_transfers_to")
    created_by_user = relationship("User", back_populates="transfers")
    transfer_items = relationship("InternalTransferItem", back_populates="internal_transfer")

class InternalTransferItem(Base):
    __tablename__ = "internal_transfer_items"
    id = Column(Integer, primary_key=True, index=True)
    internal_transfer_id = Column(Integer, ForeignKey("internal_transfers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    from_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    to_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)

    internal_transfer = relationship("InternalTransfer", back_populates="transfer_items")
    product = relationship("Product", back_populates="transfer_items")
    from_location = relationship("Location", foreign_keys="[InternalTransferItem.from_location_id]")
    to_location = relationship("Location", foreign_keys="[InternalTransferItem.to_location_id]")

class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String, default="Adjustment")
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String, default="Done") # Adjustments are usually directly 'Done'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    reason = Column(String, nullable=True)

    warehouse = relationship("Warehouse", back_populates="stock_adjustments")
    created_by_user = relationship("User", back_populates="adjustments")
    adjustment_items = relationship("StockAdjustmentItem", back_populates="stock_adjustment")

class StockAdjustmentItem(Base):
    __tablename__ = "stock_adjustment_items"
    id = Column(Integer, primary_key=True, index=True)
    stock_adjustment_id = Column(Integer, ForeignKey("stock_adjustments.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    counted_quantity = Column(Integer)
    system_quantity = Column(Integer) # Quantity recorded in system before adjustment
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)

    stock_adjustment = relationship("StockAdjustment", back_populates="adjustment_items")
    product = relationship("Product", back_populates="adjustment_items")
    location = relationship("Location")

class StockLedgerEntry(Base):
    __tablename__ = "stock_ledger_entries"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    change_quantity = Column(Integer) # Positive for incoming, negative for outgoing
    new_stock_level = Column(Integer)
    document_type = Column(String) # e.g., Receipt, Delivery, Internal Transfer, Adjustment
    document_id = Column(Integer) # ID of the related document (receipt_id, delivery_id, etc.)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    product = relationship("Product", back_populates="ledger_entries")
    warehouse = relationship("Warehouse")
    location = relationship("Location")
    created_by_user = relationship("User", back_populates="ledger_entries")
