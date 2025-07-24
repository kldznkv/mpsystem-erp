from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi_pagination import Page, add_pagination, paginate
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import aiofiles

from app.db.database import get_db
from app.services.warehouse import (
    WarehouseService, SupplierService, MaterialService, 
    BatchService, InventoryService, CSVService, TraceabilityService
)
from app.schemas.warehouse import (
    Warehouse, WarehouseCreate, WarehouseUpdate,
    Supplier, SupplierCreate, SupplierUpdate,
    Material, MaterialCreate, MaterialUpdate,
    Batch, BatchCreate, BatchUpdate,
    InventoryItem, InventoryItemCreate, InventoryItemUpdate,
    StockMovement, StockMovementCreate,
    CSVImportResult, MaterialInventory, TraceabilityResult
)
from app.models.base import QualityStatus, MaterialType

router = APIRouter()

# ===============================
# WAREHOUSES ENDPOINTS
# ===============================

@router.get("/warehouses", response_model=List[Warehouse])
async def get_warehouses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get all warehouses"""
    return await WarehouseService.get_warehouses(db, skip=skip, limit=limit)


@router.get("/warehouses/{warehouse_id}", response_model=Warehouse)
async def get_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    """Get warehouse by ID"""
    warehouse = await WarehouseService.get_warehouse(db, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.post("/warehouses", response_model=Warehouse)
async def create_warehouse(warehouse: WarehouseCreate, db: AsyncSession = Depends(get_db)):
    """Create new warehouse"""
    return await WarehouseService.create_warehouse(db, warehouse)


@router.put("/warehouses/{warehouse_id}", response_model=Warehouse)
async def update_warehouse(
    warehouse_id: int,
    warehouse: WarehouseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update warehouse"""
    updated_warehouse = await WarehouseService.update_warehouse(db, warehouse_id, warehouse)
    if not updated_warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return updated_warehouse


@router.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    """Delete (deactivate) warehouse"""
    success = await WarehouseService.delete_warehouse(db, warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"message": "Warehouse deleted successfully"}


# ===============================
# SUPPLIERS ENDPOINTS
# ===============================

@router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Get all suppliers"""
    return await SupplierService.get_suppliers(db, skip=skip, limit=limit, active_only=active_only)


@router.get("/suppliers/search")
async def search_suppliers(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db)
):
    """Search suppliers by name or code"""
    return await SupplierService.search_suppliers(db, q)


@router.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: int, db: AsyncSession = Depends(get_db)):
    """Get supplier by ID"""
    supplier = await SupplierService.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate, db: AsyncSession = Depends(get_db)):
    """Create new supplier"""
    return await SupplierService.create_supplier(db, supplier)


@router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier(
    supplier_id: int,
    supplier: SupplierUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update supplier (including ratings)"""
    updated_supplier = await SupplierService.update_supplier(db, supplier_id, supplier)
    if not updated_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return updated_supplier


# ===============================
# MATERIALS ENDPOINTS
# ===============================

@router.get("/materials", response_model=List[Material])
async def get_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    material_type: Optional[MaterialType] = Query(None),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Get all materials"""
    return await MaterialService.get_materials(
        db, skip=skip, limit=limit, material_type=material_type, active_only=active_only
    )


@router.get("/materials/low-stock", response_model=List[Material])
async def get_low_stock_materials(db: AsyncSession = Depends(get_db)):
    """Get materials below reorder point"""
    return await MaterialService.get_low_stock_materials(db)


@router.get("/materials/{material_id}", response_model=Material)
async def get_material(material_id: int, db: AsyncSession = Depends(get_db)):
    """Get material by ID"""
    material = await MaterialService.get_material(db, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.get("/materials/{material_id}/inventory", response_model=MaterialInventory)
async def get_material_inventory(material_id: int, db: AsyncSession = Depends(get_db)):
    """Get complete inventory picture for a material"""
    inventory = await InventoryService.get_material_inventory(db, material_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Material not found")
    return inventory


@router.post("/materials", response_model=Material)
async def create_material(material: MaterialCreate, db: AsyncSession = Depends(get_db)):
    """Create new material"""
    return await MaterialService.create_material(db, material)


@router.put("/materials/{material_id}", response_model=Material)
async def update_material(
    material_id: int,
    material: MaterialUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update material"""
    updated_material = await MaterialService.update_material(db, material_id, material)
    if not updated_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return updated_material


# ===============================
# BATCHES ENDPOINTS
# ===============================

@router.get("/batches", response_model=List[Batch])
async def get_batches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    quality_status: Optional[QualityStatus] = Query(None),
    material_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all batches with filtering"""
    return await BatchService.get_batches(
        db, skip=skip, limit=limit, quality_status=quality_status, material_id=material_id
    )


@router.get("/batches/pending-quality", response_model=List[Batch])
async def get_pending_quality_batches(db: AsyncSession = Depends(get_db)):
    """Get batches pending quality control"""
    return await BatchService.get_pending_quality_batches(db)


@router.get("/batches/{batch_id}", response_model=Batch)
async def get_batch(batch_id: int, db: AsyncSession = Depends(get_db)):
    """Get batch by ID"""
    batch = await BatchService.get_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.post("/batches", response_model=Batch)
async def create_batch(batch: BatchCreate, db: AsyncSession = Depends(get_db)):
    """Create new batch (receive delivery)"""
    return await BatchService.create_batch(db, batch)


@router.put("/batches/{batch_id}", response_model=Batch)
async def update_batch(
    batch_id: int,
    batch: BatchUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update batch details"""
    updated_batch = await BatchService.update_batch(db, batch_id, batch)
    if not updated_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return updated_batch


@router.post("/batches/{batch_id}/approve", response_model=Batch)
async def approve_batch(
    batch_id: int,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Approve batch for use"""
    batch = await BatchService.approve_batch(db, batch_id, notes)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.post("/batches/{batch_id}/block", response_model=Batch)
async def block_batch(
    batch_id: int,
    notes: str,
    db: AsyncSession = Depends(get_db)
):
    """Block batch from use"""
    batch = await BatchService.block_batch(db, batch_id, notes)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


# ===============================
# INVENTORY ENDPOINTS
# ===============================

@router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory(
    warehouse_id: Optional[int] = Query(None),
    material_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get current inventory levels"""
    return await InventoryService.get_inventory(
        db, warehouse_id=warehouse_id, material_id=material_id, skip=skip, limit=limit
    )


@router.post("/inventory", response_model=InventoryItem)
async def create_inventory_item(inventory: InventoryItemCreate, db: AsyncSession = Depends(get_db)):
    """Create inventory item"""
    return await InventoryService.create_inventory_item(db, inventory)


@router.put("/inventory/{inventory_id}", response_model=InventoryItem)
async def update_inventory_item(
    inventory_id: int,
    inventory: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update inventory quantities"""
    updated_inventory = await InventoryService.update_inventory_item(db, inventory_id, inventory)
    if not updated_inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated_inventory


@router.post("/inventory/movements", response_model=StockMovement)
async def create_stock_movement(movement: StockMovementCreate, db: AsyncSession = Depends(get_db)):
    """Create stock movement (receive, issue, transfer, adjust)"""
    return await InventoryService.create_stock_movement(db, movement)


# ===============================
# TRACEABILITY ENDPOINTS
# ===============================

@router.get("/batches/{batch_number}/trace", response_model=TraceabilityResult)
async def trace_batch(batch_number: str, db: AsyncSession = Depends(get_db)):
    """Full traceability for a batch"""
    result = await TraceabilityService.trace_batch(db, batch_number)
    if not result:
        raise HTTPException(status_code=404, detail="Batch not found")
    return result


# ===============================
# CSV IMPORT/EXPORT ENDPOINTS
# ===============================

@router.post("/import/materials", response_model=CSVImportResult)
async def import_materials_csv(
    file: UploadFile = File(...),
    has_header: bool = Form(True),
    delimiter: str = Form(","),
    db: AsyncSession = Depends(get_db)
):
    """Import materials from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    return await CSVService.import_materials_csv(
        db, csv_content, has_header=has_header, delimiter=delimiter
    )


@router.post("/import/suppliers", response_model=CSVImportResult)
async def import_suppliers_csv(
    file: UploadFile = File(...),
    has_header: bool = Form(True),
    delimiter: str = Form(","),
    db: AsyncSession = Depends(get_db)
):
    """Import suppliers from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    csv_content = content.decode('utf-8')
    
    return await CSVService.import_suppliers_csv(
        db, csv_content, has_header=has_header, delimiter=delimiter
    )


# ===============================
# BULK OPERATIONS
# ===============================

@router.post("/materials/bulk", response_model=List[Material])
async def bulk_create_materials(
    materials: List[MaterialCreate],
    db: AsyncSession = Depends(get_db)
):
    """Bulk create materials"""
    created_materials = []
    for material in materials:
        created_material = await MaterialService.create_material(db, material)
        created_materials.append(created_material)
    return created_materials


@router.post("/suppliers/bulk", response_model=List[Supplier])
async def bulk_create_suppliers(
    suppliers: List[SupplierCreate],
    db: AsyncSession = Depends(get_db)
):
    """Bulk create suppliers"""
    created_suppliers = []
    for supplier in suppliers:
        created_supplier = await SupplierService.create_supplier(db, supplier)
        created_suppliers.append(created_supplier)
    return created_suppliers


# ===============================
# SUMMARY ENDPOINTS
# ===============================

@router.get("/summary/stats")
async def get_warehouse_stats(db: AsyncSession = Depends(get_db)):
    """Get warehouse summary statistics"""
    warehouses = await WarehouseService.get_warehouses(db, limit=1000)
    materials = await MaterialService.get_materials(db, limit=1000)
    low_stock = await MaterialService.get_low_stock_materials(db)
    pending_quality = await BatchService.get_pending_quality_batches(db)
    
    return {
        "total_warehouses": len(warehouses),
        "total_materials": len(materials),
        "low_stock_items": len(low_stock),
        "pending_quality_batches": len(pending_quality),
        "active_warehouses": len([w for w in warehouses if w.is_active]),
        "material_types": {
            "granulates": len([m for m in materials if "granulate" in m.type.value]),
            "inks": len([m for m in materials if "ink" in m.type.value]),
            "adhesives": len([m for m in materials if "adhesive" in m.type.value]),
            "films": len([m for m in materials if "film" in m.type.value]),
        }
    }