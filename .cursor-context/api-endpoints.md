# MPSYSTEM - API Endpoints

## Base Configuration
- **Production URL**: `https://kldznkv.github.io/mpsystem-erp`
- **Development URL**: `http://localhost:8000`
- **API Version**: v1
- **Authentication**: JWT (для будущих версий)

## Dashboard API

### Metrics
```
GET /api/v1/dashboard/metrics
```
Возвращает ключевые метрики dashboard:
```json
{
  "orders_active": 847,
  "production_capacity": 94.2,
  "oee_efficiency": 87.3,
  "quality_pass_rate": 99.1,
  "timestamp": "2024-07-25T10:30:00Z"
}
```

### Production Lines
```
GET /api/v1/dashboard/production-lines
```
Статус всех производственных линий:
```json
{
  "extrusion": [
    {
      "id": "EXT-01",
      "name": "Экструзия №1",
      "status": "running",
      "current_order": "ORD-2024-0156",
      "progress": 75,
      "oee": 89.2,
      "queue_count": 3
    }
  ],
  "lamination": [...],
  "printing": [...]
}
```

### Alerts
```
GET /api/v1/dashboard/alerts
```
Критические уведомления:
```json
{
  "alerts": [
    {
      "id": "alert-001",
      "type": "critical",
      "icon": "⚠️",
      "title": "Критический остаток",
      "message": "ПЭНД: 127 кг",
      "action": "create_purchase_request",
      "timestamp": "2024-07-25T10:25:00Z"
    }
  ]
}
```

## Materials API

### List Materials
```
GET /api/materials
Query Parameters:
  - page: номер страницы (default: 1)
  - limit: количество на странице (default: 50)
  - search: поиск по названию
  - type: фильтр по типу (raw_material, semi_finished, finished_good)
```

### Create Material
```
POST /api/materials
Body:
{
  "name": "ПЭНД гранулят",
  "type": "raw_material",
  "unit": "кг",
  "density": 0.95,
  "specifications": {...}
}
```

### Update Material
```
PUT /api/materials/:id
```

### Delete Material
```
DELETE /api/materials/:id
```

## Suppliers API

### List Suppliers
```
GET /api/suppliers
Query Parameters:
  - rating_min: минимальный рейтинг
  - country: страна поставщика
  - status: статус (active, inactive)
```

### Supplier Details
```
GET /api/suppliers/:id
```

### Create/Update Supplier
```
POST /api/suppliers
PUT /api/suppliers/:id
```

## Orders API

### List Orders
```
GET /api/orders
Query Parameters:
  - status: статус заказа
  - priority: приоритет
  - date_from: дата с
  - date_to: дата по
  - customer: клиент
```

### Order Details
```
GET /api/orders/:id
```

### Create Order
```
POST /api/orders
Body:
{
  "customer": "ООО Упаковка+",
  "material_type": "flexible_packaging",
  "quantity": 1000,
  "unit": "кг",
  "deadline": "2024-08-01",
  "specifications": {...},
  "materials": [
    {
      "material_id": "MAT-001",
      "quantity": 850
    }
  ]
}
```

### Update Order Status
```
PATCH /api/orders/:id/status
Body:
{
  "status": "in_progress",
  "note": "Запуск на линии EXT-01"
}
```

## Production API

### Production Lines Status
```
GET /api/production/lines
```

### Line Details
```
GET /api/production/lines/:id
```

### Line Actions
```
POST /api/production/lines/:id/actions
Body:
{
  "action": "start|pause|stop|maintenance",
  "reason": "Плановая остановка",
  "estimated_duration": 30
}
```

### Production Jobs
```
GET /api/production/jobs
POST /api/production/jobs
PUT /api/production/jobs/:id
```

### OEE Metrics
```
GET /api/production/oee
Query Parameters:
  - line_id: ID линии
  - date_from: дата с
  - date_to: дата по
  - granularity: hourly|daily|weekly
```

## Inventory API

### Materials Inventory
```
GET /api/inventory/materials
Query Parameters:
  - mag: склад (MAG-01, MAG-02, etc.)
  - material_type: тип материала
  - quality_status: статус качества
  - critical: только критические остатки
```

### Batch Details
```
GET /api/inventory/batches/:id
```

### Material Movements
```
GET /api/inventory/movements
POST /api/inventory/movements
Body:
{
  "type": "receipt|issue|transfer|adjustment",
  "material_id": "MAT-001",
  "quantity": 100,
  "from_mag": "MAG-01",
  "to_mag": "MAG-02",
  "reason": "Перемещение для производства"
}
```

### Stock Levels
```
GET /api/inventory/stock-levels
```

## Purchasing API

### Purchase Requests
```
GET /api/purchasing/requests
POST /api/purchasing/requests
Body:
{
  "material_id": "MAT-001",
  "quantity": 1000,
  "required_date": "2024-08-15",
  "priority": "high",
  "reason": "MRP calculation"
}
```

### Purchase Orders
```
GET /api/purchasing/orders
POST /api/purchasing/orders
PUT /api/purchasing/orders/:id
```

### Deliveries
```
GET /api/purchasing/deliveries
Query Parameters:
  - supplier_id: поставщик
  - status: статус поставки
  - date_from: дата с
  - date_to: дата по
```

### Receive Delivery
```
POST /api/purchasing/deliveries/:id/receive
Body:
{
  "received_quantity": 950,
  "quality_check": "passed",
  "notes": "Частичная поставка"
}
```

## Planning API

### Production Schedule
```
GET /api/planning/schedule
Query Parameters:
  - date_from: дата с
  - date_to: дата по
  - line_id: конкретная линия
```

### Update Schedule
```
PUT /api/planning/schedule
Body:
{
  "changes": [
    {
      "order_id": "ORD-001",
      "line_id": "EXT-01",
      "start_time": "2024-07-26T08:00:00Z",
      "duration": 240
    }
  ]
}
```

### Optimization Recommendations
```
GET /api/planning/recommendations
```

## Analytics API

### KPI Dashboard
```
GET /api/analytics/kpi
Query Parameters:
  - period: daily|weekly|monthly|quarterly
  - department: extrusion|lamination|printing
```

### Production Reports
```
GET /api/analytics/production
Query Parameters:
  - report_type: efficiency|quality|throughput
  - date_from: дата с
  - date_to: дата по
```

### Cost Analysis
```
GET /api/analytics/costs
Query Parameters:
  - cost_type: material|labor|overhead
  - breakdown: daily|weekly|monthly
```

## WebSocket Events (Future)

### Real-time Updates
```
WS /ws/dashboard
Events:
  - line_status_changed
  - new_alert
  - order_completed
  - material_low_stock
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "quantity",
        "message": "Quantity must be greater than 0"
      }
    ],
    "timestamp": "2024-07-25T10:30:00Z"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 85
  - `X-RateLimit-Reset`: 1690282800

## Authentication (Future)
```
Authorization: Bearer <jwt_token>
```

## Static API (GitHub Pages)
Для GitHub Pages используются статические JSON файлы:
- `/api/v1/dashboard/metrics.json`
- `/api/v1/dashboard/production-lines.json`
- `/api/v1/dashboard/alerts.json`