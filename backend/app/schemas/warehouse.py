from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.base import QualityStatus, MaterialType, WarehouseType


# Base schemas
class WarehouseBase(BaseModel):
    code: str
    name: str
    type: WarehouseType
    description: Optional[str] = None
    is_active: bool = True


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Warehouse(WarehouseBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


# Supplier schemas
class SupplierBase(BaseModel):
    code: str
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    is_approved: bool = False


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating_delivery: Optional[float] = None
    rating_quality: Optional[float] = None
    rating_documents: Optional[float] = None
    rating_cooperation: Optional[float] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None


class Supplier(SupplierBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    rating_delivery: Optional[float] = None
    rating_quality: Optional[float] = None
    rating_documents: Optional[float] = None
    rating_cooperation: Optional[float] = None
    overall_rating: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Material schemas
class MaterialBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    type: MaterialType
    unit: str
    min_stock_level: Optional[float] = None
    max_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None
    standard_cost: Optional[float] = None
    is_active: bool = True


class MaterialCreate(MaterialBase):
    primary_supplier_id: Optional[int] = None


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    min_stock_level: Optional[float] = None
    max_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None
    standard_cost: Optional[float] = None
    last_purchase_price: Optional[float] = None
    primary_supplier_id: Optional[int] = None
    is_active: Optional[bool] = None


class Material(MaterialBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    last_purchase_price: Optional[float] = None
    primary_supplier_id: Optional[int] = None
    primary_supplier: Optional[Supplier] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Batch schemas
class BatchBase(BaseModel):
    batch_number: str
    material_id: int
    supplier_id: int
    received_quantity: float
    production_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    received_date: datetime
    quality_notes: Optional[str] = None


class BatchCreate(BatchBase):
    has_coa: bool = False
    has_tds: bool = False
    has_sds: bool = False
    has_doc: bool = False
    has_cmr: bool = False


class BatchUpdate(BaseModel):
    available_quantity: Optional[float] = None
    reserved_quantity: Optional[float] = None
    quality_status: Optional[QualityStatus] = None
    quality_notes: Optional[str] = None
    has_coa: Optional[bool] = None
    has_tds: Optional[bool] = None
    has_sds: Optional[bool] = None
    has_doc: Optional[bool] = None
    has_cmr: Optional[bool] = None


class Batch(BatchBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    available_quantity: float
    reserved_quantity: float = 0.0
    quality_status: QualityStatus
    has_coa: bool
    has_tds: bool
    has_sds: bool
    has_doc: bool
    has_cmr: bool
    material: Material
    supplier: Supplier
    created_at: datetime
    updated_at: Optional[datetime] = None


# Inventory schemas
class InventoryItemBase(BaseModel):
    warehouse_id: int
    material_id: int
    batch_id: Optional[int] = None
    quantity: float
    location_code: Optional[str] = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    quantity: Optional[float] = None
    reserved_quantity: Optional[float] = None
    location_code: Optional[str] = None


class InventoryItem(InventoryItemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    reserved_quantity: float = 0.0
    available_quantity: float
    last_movement_date: Optional[datetime] = None
    warehouse: Warehouse
    material: Material
    batch: Optional[Batch] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Stock movement schemas
class StockMovementBase(BaseModel):
    inventory_item_id: int
    movement_type: str  # RECEIVE, ISSUE, TRANSFER, ADJUST
    quantity: float
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    user_id: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovement(StockMovementBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime


# Specialized response schemas
class InventorySummary(BaseModel):
    """Summary of inventory levels by warehouse"""
    warehouse: Warehouse
    total_items: int
    total_value: float
    low_stock_items: int
    critical_items: int


class MaterialInventory(BaseModel):
    """Current inventory for a specific material"""
    material: Material
    total_quantity: float
    available_quantity: float
    reserved_quantity: float
    warehouses: List[InventoryItem]
    batches: List[Batch]
    days_of_stock: Optional[float] = None


class TraceabilityResult(BaseModel):
    """Traceability chain for a batch"""
    batch: Batch
    source_documents: List[str]
    usage_history: List[dict]
    quality_documents: List[str]


# CSV Import schemas
class CSVImportRequest(BaseModel):
    file_type: str  # materials, suppliers, inventory
    has_header: bool = True
    delimiter: str = ","
    encoding: str = "utf-8"


class CSVImportResult(BaseModel):
    success: bool
    total_rows: int
    imported_rows: int
    failed_rows: int
    errors: List[str]
    warnings: List[str]


# Bulk operations
class BulkMaterialCreate(BaseModel):
    materials: List[MaterialCreate]
    

class BulkSupplierCreate(BaseModel):
    suppliers: List[SupplierCreate]


class BulkInventoryUpdate(BaseModel):
    updates: List[InventoryItemUpdate]