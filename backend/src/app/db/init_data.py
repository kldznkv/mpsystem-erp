"""
Database initialization with sample data for MPSYSTEM ERP
"""

from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import asyncio

from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.models.warehouse import Warehouse, Supplier, Material, Batch, InventoryItem
from app.models.production import Customer, Product, ProductionLine
from app.models.base import (
    WarehouseType, MaterialType, QualityStatus, 
    ProductionLineStatus, OrderStatus, OrderPriority
)
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import logging
from typing import List

from app.models.orders import Order, OrderPriority, OrderStatus, OrderUnit
from app.services.orders import OrderService

logger = logging.getLogger(__name__)


async def init_database():
    """Initialize database with tables and sample data"""
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created")
    
    # Add sample data
    async with AsyncSessionLocal() as session:
        await create_sample_data(session)
    
    print("✅ Sample data loaded")


async def create_sample_data(session: AsyncSession):
    """Create sample data for development and testing"""
    
    # Create warehouses
    warehouses_data = [
        {"code": "MAG-1", "name": "Сырье и материалы", "type": WarehouseType.RAW_MATERIALS, 
         "description": "Основной склад сырья - гранулаты, красители, добавки"},
        {"code": "MAG-1.1", "name": "ADR - Опасные грузы", "type": WarehouseType.ADR,
         "description": "Склад опасных материалов - растворители, кислоты"},
        {"code": "MAG-2", "name": "Экструзия", "type": WarehouseType.PRODUCTION,
         "description": "Склад при экструдерах"},
        {"code": "MAG-3", "name": "УФ обработка", "type": WarehouseType.PRODUCTION,
         "description": "Склад при УФ линии"},
        {"code": "MAG-4", "name": "Печать", "type": WarehouseType.PRODUCTION,
         "description": "Склад при печатных машинах"},
        {"code": "MAG-5", "name": "Ламинация + Готовые изделия", "type": WarehouseType.FINISHED_GOODS,
         "description": "Ламинатор и склад готовой продукции"},
        {"code": "MAG-6", "name": "Барьерное покрытие", "type": WarehouseType.PRODUCTION,
         "description": "Склад при линии барьерного покрытия"},
        {"code": "MAG-7", "name": "Резка", "type": WarehouseType.PRODUCTION,
         "description": "Склад при слиттерах"},
        {"code": "MAG-8", "name": "Изготовление пакетов", "type": WarehouseType.PRODUCTION,
         "description": "Склад при пакетоделательных машинах"},
        {"code": "MAG-9", "name": "Резка рукавов", "type": WarehouseType.PRODUCTION,
         "description": "Склад при линии резки рукавов"}
    ]
    
    warehouses = []
    for wh_data in warehouses_data:
        warehouse = Warehouse(**wh_data)
        session.add(warehouse)
        warehouses.append(warehouse)
    
    await session.flush()  # Get IDs
    
    # Create suppliers
    suppliers_data = [
        {
            "code": "SUP001", "name": "Dow Chemical Europe", 
            "contact_person": "John Smith", "email": "john.smith@dow.com",
            "phone": "+49-123-456789", "address": "Industrial Park, Germany",
            "rating_delivery": 98.5, "rating_quality": 99.2, 
            "rating_documents": 100.0, "rating_cooperation": 85.0,
            "is_approved": True
        },
        {
            "code": "SUP002", "name": "SABIC Polymers", 
            "contact_person": "Ahmed Al-Rashid", "email": "ahmed@sabic.com",
            "phone": "+966-11-2345678", "address": "Riyadh, Saudi Arabia",
            "rating_delivery": 95.2, "rating_quality": 96.8,
            "rating_documents": 92.0, "rating_cooperation": 88.5,
            "is_approved": True
        },
        {
            "code": "SUP003", "name": "Siegwerk Druckfarben", 
            "contact_person": "Klaus Mueller", "email": "k.mueller@siegwerk.com",
            "phone": "+49-2241-304-0", "address": "Siegburg, Germany",
            "rating_delivery": 92.8, "rating_quality": 98.5,
            "rating_documents": 96.0, "rating_cooperation": 90.0,
            "is_approved": True
        },
        {
            "code": "SUP004", "name": "Henkel Adhesive Technologies", 
            "contact_person": "Maria Schmidt", "email": "maria.schmidt@henkel.com",
            "phone": "+49-211-797-0", "address": "Duesseldorf, Germany",
            "rating_delivery": 89.5, "rating_quality": 97.2,
            "rating_documents": 94.0, "rating_cooperation": 92.0,
            "is_approved": True
        },
        {
            "code": "SUP005", "name": "Chemtura Corporation", 
            "contact_person": "Robert Johnson", "email": "r.johnson@chemtura.com",
            "phone": "+1-203-573-2000", "address": "Connecticut, USA",
            "rating_delivery": 87.0, "rating_quality": 94.5,
            "rating_documents": 88.0, "rating_cooperation": 85.5,
            "is_approved": True
        }
    ]
    
    suppliers = []
    for sup_data in suppliers_data:
        # Calculate overall rating
        ratings = [sup_data["rating_delivery"], sup_data["rating_quality"], 
                  sup_data["rating_documents"], sup_data["rating_cooperation"]]
        weights = [0.4, 0.3, 0.2, 0.1]
        sup_data["overall_rating"] = sum(r * w for r, w in zip(ratings, weights))
        
        supplier = Supplier(**sup_data)
        session.add(supplier)
        suppliers.append(supplier)
    
    await session.flush()
    
    # Create materials
    materials_data = [
        {
            "code": "GR-PVD-001", "name": "Гранулят ПВД LDPE 020C прозрачный",
            "type": MaterialType.GRANULATE_LDPE, "unit": "кг",
            "description": "Гранулят полиэтилена низкого давления для производства прозрачной пленки",
            "min_stock_level": 1000.0, "max_stock_level": 10000.0, "reorder_point": 2000.0,
            "standard_cost": 245.50, "primary_supplier_id": suppliers[0].id
        },
        {
            "code": "GR-PVD-002", "name": "Гранулят ПВД LDPE 020C белый",
            "type": MaterialType.GRANULATE_LDPE, "unit": "кг",
            "description": "Гранулят полиэтилена низкого давления белого цвета",
            "min_stock_level": 800.0, "max_stock_level": 8000.0, "reorder_point": 1500.0,
            "standard_cost": 248.75, "primary_supplier_id": suppliers[0].id
        },
        {
            "code": "GR-PND-001", "name": "Гранулят ПНД HDPE 050",
            "type": MaterialType.GRANULATE_HDPE, "unit": "кг",
            "description": "Гранулят полиэтилена высокого давления",
            "min_stock_level": 500.0, "max_stock_level": 5000.0, "reorder_point": 1000.0,
            "standard_cost": 268.20, "primary_supplier_id": suppliers[1].id
        },
        {
            "code": "INK-RED-001", "name": "Краска красная RAL 3020",
            "type": MaterialType.INK_PRINTING, "unit": "кг",
            "description": "Краска для флексографической печати, красный цвет RAL 3020",
            "min_stock_level": 50.0, "max_stock_level": 500.0, "reorder_point": 100.0,
            "standard_cost": 1250.00, "primary_supplier_id": suppliers[2].id
        },
        {
            "code": "INK-BLUE-001", "name": "Краска синяя RAL 5005",
            "type": MaterialType.INK_PRINTING, "unit": "кг",
            "description": "Краска для флексографической печати, синий цвет RAL 5005",
            "min_stock_level": 30.0, "max_stock_level": 300.0, "reorder_point": 75.0,
            "standard_cost": 1285.50, "primary_supplier_id": suppliers[2].id
        },
        {
            "code": "ADH-PU-001", "name": "Клей полиуретановый 2К",
            "type": MaterialType.ADHESIVE_PU, "unit": "кг",
            "description": "Двухкомпонентный полиуретановый клей для ламинации",
            "min_stock_level": 200.0, "max_stock_level": 1000.0, "reorder_point": 400.0,
            "standard_cost": 850.75, "primary_supplier_id": suppliers[3].id
        },
        {
            "code": "SOL-ETH-001", "name": "Растворитель этилацетат",
            "type": MaterialType.SOLVENT, "unit": "л",
            "description": "Этилацетат технический для разбавления красок",
            "min_stock_level": 100.0, "max_stock_level": 1000.0, "reorder_point": 250.0,
            "standard_cost": 125.30, "primary_supplier_id": suppliers[4].id
        },
        {
            "code": "ADD-UV-001", "name": "УФ стабилизатор",
            "type": MaterialType.ADDITIVE, "unit": "кг",
            "description": "Добавка для защиты от ультрафиолетового излучения",
            "min_stock_level": 25.0, "max_stock_level": 250.0, "reorder_point": 50.0,
            "standard_cost": 2150.00, "primary_supplier_id": suppliers[4].id
        }
    ]
    
    materials = []
    for mat_data in materials_data:
        material = Material(**mat_data)
        session.add(material)
        materials.append(material)
    
    await session.flush()
    
    # Create batches
    batches_data = [
        {
            "batch_number": "240115-001", "material_id": materials[0].id, "supplier_id": suppliers[0].id,
            "received_quantity": 2500.0, "production_date": datetime(2024, 1, 10),
            "received_date": datetime(2024, 1, 15), "quality_status": QualityStatus.APPROVED,
            "has_coa": True, "has_tds": True, "has_sds": True, "has_doc": True, "has_cmr": True
        },
        {
            "batch_number": "240116-001", "material_id": materials[1].id, "supplier_id": suppliers[0].id,
            "received_quantity": 1800.0, "production_date": datetime(2024, 1, 12),
            "received_date": datetime(2024, 1, 16), "quality_status": QualityStatus.APPROVED,
            "has_coa": True, "has_tds": True, "has_sds": True, "has_doc": True, "has_cmr": True
        },
        {
            "batch_number": "240116-R01", "material_id": materials[3].id, "supplier_id": suppliers[2].id,
            "received_quantity": 150.0, "production_date": datetime(2024, 1, 10),
            "received_date": datetime(2024, 1, 16), "quality_status": QualityStatus.PENDING,
            "has_coa": True, "has_tds": True, "has_sds": True, "has_doc": False, "has_cmr": True,
            "quality_notes": "Ожидается Declaration of Compliance от поставщика"
        },
        {
            "batch_number": "240117-001", "material_id": materials[2].id, "supplier_id": suppliers[1].id,
            "received_quantity": 1200.0, "production_date": datetime(2024, 1, 14),
            "received_date": datetime(2024, 1, 17), "quality_status": QualityStatus.APPROVED,
            "has_coa": True, "has_tds": True, "has_sds": True, "has_doc": True, "has_cmr": True
        }
    ]
    
    batches = []
    for batch_data in batches_data:
        batch_data["available_quantity"] = batch_data["received_quantity"]
        batch = Batch(**batch_data)
        session.add(batch)
        batches.append(batch)
    
    await session.flush()
    
    # Create inventory items
    inventory_data = [
        # MAG-1 inventory
        {"warehouse_id": warehouses[0].id, "material_id": materials[0].id, "batch_id": batches[0].id,
         "quantity": 2500.0, "location_code": "A1-05-02"},
        {"warehouse_id": warehouses[0].id, "material_id": materials[1].id, "batch_id": batches[1].id,
         "quantity": 1800.0, "location_code": "A1-05-03"},
        {"warehouse_id": warehouses[0].id, "material_id": materials[2].id, "batch_id": batches[3].id,
         "quantity": 1200.0, "location_code": "A1-06-01"},
        {"warehouse_id": warehouses[0].id, "material_id": materials[5].id,
         "quantity": 450.0, "location_code": "A2-01-05"},
        # MAG-4 inventory (printing materials)
        {"warehouse_id": warehouses[4].id, "material_id": materials[3].id, "batch_id": batches[2].id,
         "quantity": 150.0, "location_code": "P1-02-01"},
        {"warehouse_id": warehouses[4].id, "material_id": materials[4].id,
         "quantity": 85.0, "location_code": "P1-02-02"},
        # MAG-1.1 inventory (ADR)
        {"warehouse_id": warehouses[1].id, "material_id": materials[6].id,
         "quantity": 350.0, "location_code": "ADR-01-01"},
    ]
    
    for inv_data in inventory_data:
        inv_data["available_quantity"] = inv_data["quantity"]
        inventory = InventoryItem(**inv_data)
        session.add(inventory)
    
    # Create production lines
    lines_data = [
        {"code": "EXTRUDER-1", "name": "Экструдер №1", "line_type": "EXTRUDER",
         "warehouse_id": warehouses[2].id, "max_width_mm": 1600.0, "min_width_mm": 300.0,
         "max_speed_mpm": 350.0, "status": ProductionLineStatus.ACTIVE, "standard_efficiency": 92.0},
        {"code": "EXTRUDER-2", "name": "Экструдер №2", "line_type": "EXTRUDER", 
         "warehouse_id": warehouses[2].id, "max_width_mm": 1400.0, "min_width_mm": 250.0,
         "max_speed_mpm": 280.0, "status": ProductionLineStatus.MAINTENANCE, "standard_efficiency": 88.5},
        {"code": "UV-LINE-1", "name": "УФ обработка №1", "line_type": "UV_TREATMENT",
         "warehouse_id": warehouses[3].id, "max_width_mm": 1600.0, "min_width_mm": 200.0,
         "max_speed_mpm": 450.0, "status": ProductionLineStatus.IDLE, "standard_efficiency": 85.0},
        {"code": "PRINT-LINE-1", "name": "Печатная машина №1", "line_type": "PRINTER",
         "warehouse_id": warehouses[4].id, "max_width_mm": 1300.0, "min_width_mm": 150.0,
         "max_speed_mpm": 200.0, "status": ProductionLineStatus.ACTIVE, "standard_efficiency": 78.5},
        {"code": "PRINT-LINE-2", "name": "Печатная машина №2", "line_type": "PRINTER",
         "warehouse_id": warehouses[4].id, "max_width_mm": 1100.0, "min_width_mm": 100.0,
         "max_speed_mpm": 180.0, "status": ProductionLineStatus.IDLE, "standard_efficiency": 82.0},
        {"code": "LAMINATOR-1", "name": "Ламинатор №1", "line_type": "LAMINATOR",
         "warehouse_id": warehouses[5].id, "max_width_mm": 1500.0, "min_width_mm": 200.0,
         "max_speed_mpm": 150.0, "status": ProductionLineStatus.IDLE, "standard_efficiency": 89.0}
    ]
    
    for line_data in lines_data:
        line = ProductionLine(**line_data)
        session.add(line)
    
    # Create customers
    customers_data = [
        {"code": "CUST001", "name": "ООО Упаковка Плюс", "contact_person": "Иванов Иван Иванович",
         "email": "ivanov@upakovka-plus.ru", "phone": "+7-495-123-4567", 
         "address": "Москва, ул. Промышленная, 15", "category": "VIP", "payment_terms": "30 дней"},
        {"code": "CUST002", "name": "Агроупак ТД", "contact_person": "Петрова Мария Сергеевна",
         "email": "m.petrova@agroupak.ru", "phone": "+7-812-987-6543",
         "address": "СПб, пр. Обуховской Обороны, 120", "category": "REGULAR", "payment_terms": "45 дней"},
        {"code": "CUST003", "name": "Флекс Пак Интернешнл", "contact_person": "Сидоров Петр Николаевич",
         "email": "p.sidorov@flexpak.com", "phone": "+7-343-555-0123",
         "address": "Екатеринбург, ул. Машиностроителей, 8", "category": "REGULAR", "payment_terms": "30 дней"}
    ]
    
    for cust_data in customers_data:
        customer = Customer(**cust_data)
        session.add(customer)
    
    await session.commit()
    print("✅ Sample data created successfully")


def create_sample_orders(db: Session) -> List[Order]:
    """Create sample orders with realistic data for Polish packaging industry"""
    
    logger.info("Creating sample orders data...")
    
    # Check if orders already exist
    existing_orders = db.query(Order).count()
    if existing_orders > 0:
        logger.info(f"Orders already exist ({existing_orders} orders), skipping creation")
        return []
    
    order_service = OrderService(db)
    
    # Sample data based on Polish packaging industry
    sample_orders_data = [
        {
            "client_id": "ML-001",
            "client_name": "MLEKOVITA",
            "product_id": "PKG-001",
            "product_name": "Opakowania do serów żółtych 500g",
            "quantity": 50000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=14),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.CONFIRMED,
            "value": 125000.0,
            "margin": 18.5,
            "progress": 10,
            "special_requirements": "Nadruk logo MLEKOVITA, certyfikat BRC",
            "created_by": "jan.kowalski@mpsystem.pl"
        },
        {
            "client_id": "AG-001", 
            "client_name": "AGRONA",
            "product_id": "FLM-002",
            "product_name": "Folia stretch 500mm x 300m",
            "quantity": 2000.0,
            "unit": OrderUnit.M,
            "due_date": date.today() + timedelta(days=7),
            "priority": OrderPriority.URGENT,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 84000.0,
            "margin": 22.0,
            "progress": 65,
            "special_requirements": "Grubość 23μm, transparent, paleta drewniana",
            "created_by": "maria.nowak@mpsystem.pl"
        },
        {
            "client_id": "LP-001",
            "client_name": "LACPOL",
            "product_id": "LAM-003",
            "product_name": "Laminat do jogurtów 125ml",
            "quantity": 100000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=21),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.PLANNED,
            "value": 180000.0,
            "margin": 16.8,
            "progress": 25,
            "special_requirements": "Barrier properties: O2 < 1cc/m²/day, WVTR < 0.5g/m²/day",
            "created_by": "piotr.wisniewski@mpsystem.pl"
        },
        {
            "client_id": "DN-001",
            "client_name": "DANONE",
            "product_id": "CUP-004",
            "product_name": "Kubki PS do jogurtów 150ml",
            "quantity": 75000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=10),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 225000.0,
            "margin": 14.5,
            "progress": 80,
            "special_requirements": "IML labeling ready, crystal clear PS",
            "created_by": "anna.kowalczyk@mpsystem.pl"
        },
        {
            "client_id": "MZ-001",
            "client_name": "MONDELEZ",
            "product_id": "WRP-005",
            "product_name": "Wrappers do czekolad 100g",
            "quantity": 200000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=28),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.NEW,
            "value": 160000.0,
            "margin": 19.2,
            "progress": 0,
            "special_requirements": "Foil backing, high barrier, FDA approved",
            "created_by": "tomasz.kowalski@mpsystem.pl"
        },
        {
            "client_id": "ML-001",
            "client_name": "MLEKOVITA",
            "product_id": "PKG-006",
            "product_name": "Opakowania do masła 250g",
            "quantity": 30000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=5),
            "priority": OrderPriority.URGENT,
            "status": OrderStatus.COMPLETED,
            "value": 96000.0,
            "margin": 20.3,
            "progress": 90,
            "special_requirements": "Pergamin wewnętrzny, easy peel",
            "created_by": "katarzyna.nowak@mpsystem.pl"
        },
        {
            "client_id": "AG-001",
            "client_name": "AGRONA", 
            "product_id": "BAG-007",
            "product_name": "Worki na warzywa 2kg",
            "quantity": 25000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=18),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.CONFIRMED,
            "value": 45000.0,
            "margin": 25.1,
            "progress": 10,
            "special_requirements": "Micro-perforacje, recyclable LDPE",
            "created_by": "jan.kowalski@mpsystem.pl"
        },
        {
            "client_id": "LP-001",
            "client_name": "LACPOL",
            "product_id": "LID-008",
            "product_name": "Wieczka do jogurtów PP",
            "quantity": 80000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=12),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 64000.0,
            "margin": 17.8,
            "progress": 45,
            "special_requirements": "Nakłuwalne, kolor biały RAL 9003",
            "created_by": "maria.nowak@mpsystem.pl"
        },
        {
            "client_id": "DN-001",
            "client_name": "DANONE",
            "product_id": "LAB-009",
            "product_name": "Etykiety IML do kubków",
            "quantity": 75000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=8),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.SHIPPED,
            "value": 37500.0,
            "margin": 28.5,
            "progress": 100,
            "special_requirements": "Druk 6 kolorów + lakier, cold cure adhesive",
            "created_by": "piotr.wisniewski@mpsystem.pl"
        },
        {
            "client_id": "MZ-001",
            "client_name": "MONDELEZ",
            "product_id": "BOX-010",
            "product_name": "Pudełka do ciastek 200g",
            "quantity": 15000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=35),
            "priority": OrderPriority.LOW,
            "status": OrderStatus.NEW,
            "value": 75000.0,
            "margin": 15.2,
            "progress": 0,
            "special_requirements": "Karton SBS 300g/m², UV spot lacquer",
            "created_by": "anna.kowalczyk@mpsystem.pl"
        },
        {
            "client_id": "ML-001",
            "client_name": "MLEKOVITA",
            "product_id": "TUB-011",
            "product_name": "Pojemniki do serków 150g",
            "quantity": 40000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=16),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.PLANNED,
            "value": 120000.0,
            "margin": 19.7,
            "progress": 25,
            "special_requirements": "PP termoformowane, pokrywa easy peel",
            "created_by": "tomasz.kowalski@mpsystem.pl"
        },
        {
            "client_id": "AG-001",
            "client_name": "AGRONA",
            "product_id": "NET-012", 
            "product_name": "Siatki na owoce 2kg",
            "quantity": 10000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=22),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.CONFIRMED,
            "value": 25000.0,
            "margin": 30.5,
            "progress": 10,
            "special_requirements": "PE mesh, kolor czerwony, zamknięcie clip",
            "created_by": "katarzyna.nowak@mpsystem.pl"
        },
        {
            "client_id": "LP-001",
            "client_name": "LACPOL",
            "product_id": "BOT-013",
            "product_name": "Butelki PET 500ml",
            "quantity": 50000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=25),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.PLANNED,
            "value": 150000.0,
            "margin": 12.8,
            "progress": 25,
            "special_requirements": "Crystal clear PET, 28mm neck, lightweight",
            "created_by": "jan.kowalski@mpsystem.pl"
        },
        {
            "client_id": "DN-001",
            "client_name": "DANONE",
            "product_id": "CAP-014",
            "product_name": "Nakrętki do butelek 28mm",
            "quantity": 50000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=20),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 25000.0,
            "margin": 22.4,
            "progress": 70,
            "special_requirements": "PP kolor niebieski, tamper evident",
            "created_by": "maria.nowak@mpsystem.pl"
        },
        {
            "client_id": "MZ-001",
            "client_name": "MONDELEZ",
            "product_id": "FLW-015",
            "product_name": "Flow pack do wafelków",
            "quantity": 80000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=30),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.NEW,
            "value": 96000.0,
            "margin": 21.3,
            "progress": 0,
            "special_requirements": "BOPP metalised, cold seal, excellent machinability",
            "created_by": "piotr.wisniewski@mpsystem.pl"
        },
        {
            "client_id": "ML-001",
            "client_name": "MLEKOVITA",
            "product_id": "STR-016",
            "product_name": "Paski do zamykania ser żółty",
            "quantity": 100000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=15),
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.CONFIRMED,
            "value": 30000.0,
            "margin": 35.8,
            "progress": 10,
            "special_requirements": "LDPE kolor żółty, nadruk 1+0",
            "created_by": "anna.kowalczyk@mpsystem.pl"
        },
        {
            "client_id": "AG-001",
            "client_name": "AGRONA",
            "product_id": "BAG-017",
            "product_name": "Worki próżniowe 30x40cm",
            "quantity": 5000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=12),
            "priority": OrderPriority.URGENT,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 45000.0,
            "margin": 18.9,
            "progress": 55,
            "special_requirements": "PA/PE struktura, grubość 90μm, texture",
            "created_by": "tomasz.kowalski@mpsystem.pl"
        },
        {
            "client_id": "LP-001",
            "client_name": "LACPOL",
            "product_id": "CUP-018",
            "product_name": "Kubki do śmietany 200ml",
            "quantity": 60000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() + timedelta(days=18),
            "priority": OrderPriority.NORMAL,
            "status": OrderStatus.PLANNED,
            "value": 90000.0,
            "margin": 16.5,
            "progress": 25,
            "special_requirements": "PP injection molded, kolor biały, stackable",
            "created_by": "katarzyna.nowak@mpsystem.pl"
        },
        # Dodajemy kilka zakazów z przeszłością (overdue)
        {
            "client_id": "DN-001",
            "client_name": "DANONE",
            "product_id": "LID-019",
            "product_name": "Pokrywki aluminiowe 83mm",
            "quantity": 20000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() - timedelta(days=3),  # OVERDUE
            "priority": OrderPriority.URGENT,
            "status": OrderStatus.IN_PRODUCTION,
            "value": 60000.0,
            "margin": 24.2,
            "progress": 85,
            "special_requirements": "Aluminium 0.2mm, easy peel, sterile",
            "created_by": "jan.kowalski@mpsystem.pl"
        },
        {
            "client_id": "MZ-001",
            "client_name": "MONDELEZ",
            "product_id": "TRA-020",
            "product_name": "Tace do ciastek 6-pack",
            "quantity": 12000.0,
            "unit": OrderUnit.PCS,
            "due_date": date.today() - timedelta(days=1),  # OVERDUE
            "priority": OrderPriority.HIGH,
            "status": OrderStatus.PLANNED,
            "value": 36000.0,
            "margin": 19.8,
            "progress": 25,
            "special_requirements": "PET cristal, compartments 6x, food safe",
            "created_by": "maria.nowak@mpsystem.pl"
        }
    ]
    
    created_orders = []
    
    try:
        for i, order_data in enumerate(sample_orders_data, 1):
            try:
                # Create order using OrderService to ensure business logic
                from app.schemas.orders import OrderCreate
                
                order_create = OrderCreate(
                    client_id=order_data["client_id"],
                    client_name=order_data["client_name"],
                    product_id=order_data["product_id"],
                    product_name=order_data["product_name"],
                    quantity=order_data["quantity"],
                    unit=order_data["unit"],
                    due_date=order_data["due_date"],
                    priority=order_data["priority"],
                    value=order_data.get("value"),
                    margin=order_data.get("margin"),
                    special_requirements=order_data.get("special_requirements"),
                    created_by=order_data["created_by"]
                )
                
                # Create the order
                order_response = order_service.create_order(order_create)
                
                # Update status and progress if different from NEW
                if order_data.get("status", OrderStatus.NEW) != OrderStatus.NEW:
                    order_service.update_order_status(
                        order_id=order_response.id,
                        new_status=order_data["status"],
                        progress=order_data.get("progress", 0)
                    )
                
                created_orders.append(order_response)
                logger.info(f"Created order {i}/{len(sample_orders_data)}: {order_response.number}")
                
            except Exception as e:
                logger.error(f"Failed to create order {i}: {e}")
                continue
    
    except Exception as e:
        logger.error(f"Error creating sample orders: {e}")
        db.rollback()
        raise
    
    logger.info(f"Successfully created {len(created_orders)} sample orders")
    return created_orders


def create_all_sample_data(db: Session) -> dict:
    """Create all sample data for the application"""
    
    logger.info("Starting sample data creation...")
    
    results = {
        "orders": [],
        "success": True,
        "message": ""
    }
    
    try:
        # Create sample orders
        orders = create_sample_orders(db)
        results["orders"] = orders
        
        results["message"] = f"Sample data created successfully: {len(orders)} orders"
        logger.info(results["message"])
        
    except Exception as e:
        results["success"] = False
        results["message"] = f"Error creating sample data: {str(e)}"
        logger.error(results["message"])
        db.rollback()
    
    return results


if __name__ == "__main__":
    print("🚀 Initializing MPSYSTEM ERP Database...")
    asyncio.run(init_database())
    print("🎉 Database initialization completed!")