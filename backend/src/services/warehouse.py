from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
import csv
import io
from datetime import datetime

from app.models.warehouse import (
    Warehouse, Supplier, Material, Batch, InventoryItem, StockMovement
)
from app.schemas.warehouse import (
    WarehouseCreate, WarehouseUpdate,
    SupplierCreate, SupplierUpdate,
    MaterialCreate, MaterialUpdate,
    BatchCreate, BatchUpdate,
    InventoryItemCreate, InventoryItemUpdate,
    StockMovementCreate,
    CSVImportResult, MaterialInventory, TraceabilityResult
)
from app.models.base import QualityStatus, MaterialType


class WarehouseService:
    """Service for warehouse CRUD operations"""
    
    @staticmethod
    async def get_warehouses(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Warehouse]:
        result = await db.execute(
            select(Warehouse)
            .where(Warehouse.is_active == True)
            .offset(skip)
            .limit(limit)
            .order_by(Warehouse.code)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_warehouse(db: AsyncSession, warehouse_id: int) -> Optional[Warehouse]:
        result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_warehouse(db: AsyncSession, warehouse: WarehouseCreate) -> Warehouse:
        db_warehouse = Warehouse(**warehouse.model_dump())
        db.add(db_warehouse)
        await db.commit()
        await db.refresh(db_warehouse)
        return db_warehouse
    
    @staticmethod
    async def update_warehouse(db: AsyncSession, warehouse_id: int, warehouse: WarehouseUpdate) -> Optional[Warehouse]:
        db_warehouse = await WarehouseService.get_warehouse(db, warehouse_id)
        if db_warehouse:
            for key, value in warehouse.model_dump(exclude_unset=True).items():
                setattr(db_warehouse, key, value)
            await db.commit()
            await db.refresh(db_warehouse)
        return db_warehouse
    
    @staticmethod
    async def delete_warehouse(db: AsyncSession, warehouse_id: int) -> bool:
        db_warehouse = await WarehouseService.get_warehouse(db, warehouse_id)
        if db_warehouse:
            db_warehouse.is_active = False
            await db.commit()
            return True
        return False


class SupplierService:
    """Service for supplier CRUD operations"""
    
    @staticmethod
    async def get_suppliers(db: AsyncSession, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Supplier]:
        query = select(Supplier).offset(skip).limit(limit).order_by(Supplier.name)
        if active_only:
            query = query.where(Supplier.is_active == True)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_supplier(db: AsyncSession, supplier_id: int) -> Optional[Supplier]:
        result = await db.execute(
            select(Supplier)
            .options(selectinload(Supplier.materials))
            .where(Supplier.id == supplier_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_supplier(db: AsyncSession, supplier: SupplierCreate) -> Supplier:
        db_supplier = Supplier(**supplier.model_dump())
        db.add(db_supplier)
        await db.commit()
        await db.refresh(db_supplier)
        return db_supplier
    
    @staticmethod
    async def update_supplier(db: AsyncSession, supplier_id: int, supplier: SupplierUpdate) -> Optional[Supplier]:
        db_supplier = await SupplierService.get_supplier(db, supplier_id)
        if db_supplier:
            for key, value in supplier.model_dump(exclude_unset=True).items():
                setattr(db_supplier, key, value)
            
            # Calculate overall rating
            ratings = [
                db_supplier.rating_delivery,
                db_supplier.rating_quality,
                db_supplier.rating_documents,
                db_supplier.rating_cooperation
            ]
            weights = [0.4, 0.3, 0.2, 0.1]  # As per requirements
            
            if all(r is not None for r in ratings):
                db_supplier.overall_rating = sum(r * w for r, w in zip(ratings, weights))
            
            await db.commit()
            await db.refresh(db_supplier)
        return db_supplier
    
    @staticmethod
    async def search_suppliers(db: AsyncSession, query: str) -> List[Supplier]:
        result = await db.execute(
            select(Supplier)
            .where(
                and_(
                    Supplier.is_active == True,
                    or_(
                        Supplier.name.ilike(f"%{query}%"),
                        Supplier.code.ilike(f"%{query}%")
                    )
                )
            )
            .order_by(Supplier.name)
        )
        return result.scalars().all()


class MaterialService:
    """Service for material CRUD operations"""
    
    @staticmethod
    async def get_materials(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        material_type: Optional[MaterialType] = None,
        active_only: bool = True
    ) -> List[Material]:
        query = (
            select(Material)
            .options(selectinload(Material.primary_supplier))
            .offset(skip)
            .limit(limit)
            .order_by(Material.code)
        )
        
        if active_only:
            query = query.where(Material.is_active == True)
        
        if material_type:
            query = query.where(Material.type == material_type)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_material(db: AsyncSession, material_id: int) -> Optional[Material]:
        result = await db.execute(
            select(Material)
            .options(
                selectinload(Material.primary_supplier),
                selectinload(Material.batches),
                selectinload(Material.inventory_items)
            )
            .where(Material.id == material_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_material(db: AsyncSession, material: MaterialCreate) -> Material:
        db_material = Material(**material.model_dump())
        db.add(db_material)
        await db.commit()
        await db.refresh(db_material)
        return db_material
    
    @staticmethod
    async def update_material(db: AsyncSession, material_id: int, material: MaterialUpdate) -> Optional[Material]:
        db_material = await MaterialService.get_material(db, material_id)
        if db_material:
            for key, value in material.model_dump(exclude_unset=True).items():
                setattr(db_material, key, value)
            await db.commit()
            await db.refresh(db_material)
        return db_material
    
    @staticmethod
    async def get_low_stock_materials(db: AsyncSession) -> List[Material]:
        """Get materials below reorder point"""
        # This is a simplified version - in reality would need complex inventory calculation
        result = await db.execute(
            select(Material)
            .options(selectinload(Material.inventory_items))
            .where(
                and_(
                    Material.is_active == True,
                    Material.reorder_point.is_not(None)
                )
            )
        )
        materials = result.scalars().all()
        
        low_stock = []
        for material in materials:
            total_stock = sum(item.available_quantity for item in material.inventory_items)
            if material.reorder_point and total_stock <= material.reorder_point:
                low_stock.append(material)
        
        return low_stock


class BatchService:
    """Service for batch CRUD operations"""
    
    @staticmethod
    async def get_batches(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        quality_status: Optional[QualityStatus] = None,
        material_id: Optional[int] = None
    ) -> List[Batch]:
        query = (
            select(Batch)
            .options(
                selectinload(Batch.material),
                selectinload(Batch.supplier)
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(Batch.received_date))
        )
        
        if quality_status:
            query = query.where(Batch.quality_status == quality_status)
        
        if material_id:
            query = query.where(Batch.material_id == material_id)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_batch(db: AsyncSession, batch_id: int) -> Optional[Batch]:
        result = await db.execute(
            select(Batch)
            .options(
                selectinload(Batch.material),
                selectinload(Batch.supplier),
                selectinload(Batch.inventory_items)
            )
            .where(Batch.id == batch_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_batch(db: AsyncSession, batch: BatchCreate) -> Batch:
        db_batch = Batch(**batch.model_dump())
        db_batch.available_quantity = db_batch.received_quantity
        db.add(db_batch)
        await db.commit()
        await db.refresh(db_batch)
        return db_batch
    
    @staticmethod
    async def update_batch(db: AsyncSession, batch_id: int, batch: BatchUpdate) -> Optional[Batch]:
        db_batch = await BatchService.get_batch(db, batch_id)
        if db_batch:
            for key, value in batch.model_dump(exclude_unset=True).items():
                setattr(db_batch, key, value)
            await db.commit()
            await db.refresh(db_batch)
        return db_batch
    
    @staticmethod
    async def get_pending_quality_batches(db: AsyncSession) -> List[Batch]:
        """Get batches pending quality control"""
        result = await db.execute(
            select(Batch)
            .options(
                selectinload(Batch.material),
                selectinload(Batch.supplier)
            )
            .where(Batch.quality_status == QualityStatus.PENDING)
            .order_by(Batch.received_date)
        )
        return result.scalars().all()
    
    @staticmethod
    async def approve_batch(db: AsyncSession, batch_id: int, notes: Optional[str] = None) -> Optional[Batch]:
        """Approve batch for use"""
        db_batch = await BatchService.get_batch(db, batch_id)
        if db_batch:
            db_batch.quality_status = QualityStatus.APPROVED
            if notes:
                db_batch.quality_notes = notes
            await db.commit()
            await db.refresh(db_batch)
        return db_batch
    
    @staticmethod
    async def block_batch(db: AsyncSession, batch_id: int, notes: str) -> Optional[Batch]:
        """Block batch from use"""
        db_batch = await BatchService.get_batch(db, batch_id)
        if db_batch:
            db_batch.quality_status = QualityStatus.BLOCKED
            db_batch.quality_notes = notes
            await db.commit()
            await db.refresh(db_batch)
        return db_batch


class InventoryService:
    """Service for inventory management"""
    
    @staticmethod
    async def get_inventory(
        db: AsyncSession,
        warehouse_id: Optional[int] = None,
        material_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[InventoryItem]:
        query = (
            select(InventoryItem)
            .options(
                selectinload(InventoryItem.warehouse),
                selectinload(InventoryItem.material),
                selectinload(InventoryItem.batch)
            )
            .offset(skip)
            .limit(limit)
            .order_by(InventoryItem.warehouse_id, InventoryItem.material_id)
        )
        
        if warehouse_id:
            query = query.where(InventoryItem.warehouse_id == warehouse_id)
        
        if material_id:
            query = query.where(InventoryItem.material_id == material_id)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_material_inventory(db: AsyncSession, material_id: int) -> Optional[MaterialInventory]:
        """Get complete inventory picture for a material"""
        material = await MaterialService.get_material(db, material_id)
        if not material:
            return None
        
        # Get all inventory items for this material
        inventory_items = await InventoryService.get_inventory(db, material_id=material_id, limit=1000)
        
        # Get all batches for this material
        batches = await BatchService.get_batches(db, material_id=material_id, limit=1000)
        
        # Calculate totals
        total_quantity = sum(item.quantity for item in inventory_items)
        available_quantity = sum(item.available_quantity for item in inventory_items)
        reserved_quantity = sum(item.reserved_quantity for item in inventory_items)
        
        return MaterialInventory(
            material=material,
            total_quantity=total_quantity,
            available_quantity=available_quantity,
            reserved_quantity=reserved_quantity,
            warehouses=inventory_items,
            batches=batches
        )
    
    @staticmethod
    async def create_inventory_item(db: AsyncSession, inventory: InventoryItemCreate) -> InventoryItem:
        db_inventory = InventoryItem(**inventory.model_dump())
        db_inventory.available_quantity = db_inventory.quantity - db_inventory.reserved_quantity
        db.add(db_inventory)
        await db.commit()
        await db.refresh(db_inventory)
        return db_inventory
    
    @staticmethod
    async def update_inventory_item(
        db: AsyncSession, 
        inventory_id: int, 
        inventory: InventoryItemUpdate
    ) -> Optional[InventoryItem]:
        result = await db.execute(select(InventoryItem).where(InventoryItem.id == inventory_id))
        db_inventory = result.scalar_one_or_none()
        
        if db_inventory:
            for key, value in inventory.model_dump(exclude_unset=True).items():
                setattr(db_inventory, key, value)
            
            # Recalculate available quantity
            db_inventory.available_quantity = db_inventory.quantity - db_inventory.reserved_quantity
            db_inventory.last_movement_date = datetime.utcnow()
            
            await db.commit()
            await db.refresh(db_inventory)
        return db_inventory
    
    @staticmethod
    async def create_stock_movement(db: AsyncSession, movement: StockMovementCreate) -> StockMovement:
        """Create stock movement and update inventory"""
        db_movement = StockMovement(**movement.model_dump())
        db.add(db_movement)
        
        # Update inventory item
        result = await db.execute(
            select(InventoryItem).where(InventoryItem.id == movement.inventory_item_id)
        )
        inventory_item = result.scalar_one_or_none()
        
        if inventory_item:
            inventory_item.quantity += movement.quantity  # Can be negative for issues
            inventory_item.available_quantity = inventory_item.quantity - inventory_item.reserved_quantity
            inventory_item.last_movement_date = datetime.utcnow()
        
        await db.commit()
        await db.refresh(db_movement)
        return db_movement


class CSVService:
    """Service for CSV import/export operations"""
    
    @staticmethod
    async def import_materials_csv(
        db: AsyncSession, 
        csv_content: str,
        has_header: bool = True,
        delimiter: str = ","
    ) -> CSVImportResult:
        """Import materials from CSV"""
        reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
        
        total_rows = 0
        imported_rows = 0
        errors = []
        warnings = []
        
        if not has_header:
            # Assume standard column order if no header
            fieldnames = ['code', 'name', 'type', 'unit', 'description', 'min_stock_level', 'standard_cost']
            reader.fieldnames = fieldnames
        
        for row_num, row in enumerate(reader, 1):
            total_rows += 1
            
            try:
                # Validate required fields
                if not row.get('code') or not row.get('name'):
                    errors.append(f"Row {row_num}: Missing required fields (code, name)")
                    continue
                
                # Check if material already exists
                existing = await db.execute(
                    select(Material).where(Material.code == row['code'])
                )
                if existing.scalar_one_or_none():
                    warnings.append(f"Row {row_num}: Material {row['code']} already exists, skipping")
                    continue
                
                # Create material
                material_data = {
                    'code': row['code'],
                    'name': row['name'],
                    'type': MaterialType(row.get('type', 'granulate_ldpe')),
                    'unit': row.get('unit', 'kg'),
                    'description': row.get('description'),
                    'min_stock_level': float(row['min_stock_level']) if row.get('min_stock_level') else None,
                    'standard_cost': float(row['standard_cost']) if row.get('standard_cost') else None,
                }
                
                db_material = Material(**material_data)
                db.add(db_material)
                imported_rows += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if imported_rows > 0:
            await db.commit()
        
        return CSVImportResult(
            success=len(errors) == 0,
            total_rows=total_rows,
            imported_rows=imported_rows,
            failed_rows=total_rows - imported_rows,
            errors=errors,
            warnings=warnings
        )
    
    @staticmethod
    async def import_suppliers_csv(
        db: AsyncSession,
        csv_content: str,
        has_header: bool = True,
        delimiter: str = ","
    ) -> CSVImportResult:
        """Import suppliers from CSV"""
        reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
        
        total_rows = 0
        imported_rows = 0
        errors = []
        warnings = []
        
        if not has_header:
            fieldnames = ['code', 'name', 'contact_person', 'email', 'phone', 'address']
            reader.fieldnames = fieldnames
        
        for row_num, row in enumerate(reader, 1):
            total_rows += 1
            
            try:
                if not row.get('code') or not row.get('name'):
                    errors.append(f"Row {row_num}: Missing required fields (code, name)")
                    continue
                
                existing = await db.execute(
                    select(Supplier).where(Supplier.code == row['code'])
                )
                if existing.scalar_one_or_none():
                    warnings.append(f"Row {row_num}: Supplier {row['code']} already exists, skipping")
                    continue
                
                supplier_data = {
                    'code': row['code'],
                    'name': row['name'],
                    'contact_person': row.get('contact_person'),
                    'email': row.get('email'),
                    'phone': row.get('phone'),
                    'address': row.get('address'),
                }
                
                db_supplier = Supplier(**supplier_data)
                db.add(db_supplier)
                imported_rows += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        if imported_rows > 0:
            await db.commit()
        
        return CSVImportResult(
            success=len(errors) == 0,
            total_rows=total_rows,
            imported_rows=imported_rows,
            failed_rows=total_rows - imported_rows,
            errors=errors,
            warnings=warnings
        )


class TraceabilityService:
    """Service for traceability operations"""
    
    @staticmethod
    async def trace_batch(db: AsyncSession, batch_number: str) -> Optional[TraceabilityResult]:
        """Full traceability for a batch"""
        result = await db.execute(
            select(Batch)
            .options(
                selectinload(Batch.material),
                selectinload(Batch.supplier),
                selectinload(Batch.inventory_items)
            )
            .where(Batch.batch_number == batch_number)
        )
        batch = result.scalar_one_or_none()
        
        if not batch:
            return None
        
        # Get source documents
        source_documents = []
        if batch.has_coa:
            source_documents.append("Certificate of Analysis (CoA)")
        if batch.has_tds:
            source_documents.append("Technical Data Sheet (TDS)")
        if batch.has_sds:
            source_documents.append("Safety Data Sheet (SDS)")
        if batch.has_doc:
            source_documents.append("Declaration of Compliance (DoC)")
        if batch.has_cmr:
            source_documents.append("CMR Transport Document")
        
        # Get usage history (simplified - would need production records)
        usage_history = []
        for inventory_item in batch.inventory_items:
            usage_history.append({
                "warehouse": inventory_item.warehouse.name,
                "location": inventory_item.location_code,
                "quantity_used": batch.received_quantity - batch.available_quantity,
                "date": inventory_item.last_movement_date
            })
        
        quality_documents = [doc for doc in source_documents if "Certificate" in doc or "Declaration" in doc]
        
        return TraceabilityResult(
            batch=batch,
            source_documents=source_documents,
            usage_history=usage_history,
            quality_documents=quality_documents
        )