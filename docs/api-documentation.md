# MPSYSTEM API Documentation

## Overview
MPSYSTEM предоставляет RESTful API для управления всеми аспектами производства упаковочных материалов.

## Base URL
- **Production**: `https://kldznkv.github.io/mpsystem-erp/api`
- **Development**: `http://localhost:8000/api`

## Authentication
В текущей версии аутентификация не требуется. В будущих версиях будет использоваться JWT.

## Content Type
Все запросы и ответы используют `application/json`.

## Pagination
Для списочных запросов используется стандартная пагинация:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Error Handling
Все ошибки возвращаются в стандартном формате:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [...],
    "timestamp": "2024-07-25T10:30:00Z"
  }
}
```

## Endpoints

### Dashboard
Основные метрики и статусы для главной панели.

#### GET /dashboard/metrics
Возвращает ключевые метрики системы.

**Response:**
```json
{
  "orders_active": 847,
  "production_capacity": 94.2,
  "oee_efficiency": 87.3,
  "quality_pass_rate": 99.1,
  "timestamp": "2024-07-25T10:30:00Z"
}
```

### Materials
Управление материалами и сырьем.

#### GET /materials
Получить список всех материалов.

**Query Parameters:**
- `page` (number): Номер страницы
- `limit` (number): Количество элементов на странице
- `search` (string): Поиск по названию
- `type` (string): Тип материала

**Response:**
```json
{
  "data": [
    {
      "id": "MAT-001",
      "name": "ПЭНД гранулят",
      "type": "raw_material",
      "unit": "кг",
      "density": 0.95,
      "created_at": "2024-07-01T00:00:00Z"
    }
  ]
}
```

### Orders
Управление заказами клиентов.

#### GET /orders
Получить список заказов.

#### POST /orders
Создать новый заказ.

**Request Body:**
```json
{
  "customer": "ООО Упаковка+",
  "material_type": "flexible_packaging",
  "quantity": 1000,
  "unit": "кг",
  "deadline": "2024-08-01",
  "materials": [
    {
      "material_id": "MAT-001",
      "quantity": 850
    }
  ]
}
```

### Production
Управление производственными процессами.

#### GET /production/lines
Статус производственных линий.

#### POST /production/lines/:id/actions
Выполнить действие на линии.

**Request Body:**
```json
{
  "action": "start",
  "reason": "Запуск планового задания",
  "estimated_duration": 240
}
```

### Inventory
Управление складскими остатками.

#### GET /inventory/materials
Остатки материалов по складам.

#### POST /inventory/movements
Создать движение материала.

### Purchasing
Управление закупками.

#### GET /purchasing/requests
Заявки на закупку.

#### POST /purchasing/orders
Создать заказ поставщику.

### Planning
Планирование производства.

#### GET /planning/schedule
Производственное расписание.

#### PUT /planning/schedule
Обновить расписание.

### Analytics
Аналитика и отчеты.

#### GET /analytics/kpi
Ключевые показатели эффективности.

## Rate Limiting
API имеет лимиты:
- 100 запросов per 15 минут per IP
- 1000 запросов per час per IP

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Examples

### Create Material
```bash
curl -X POST http://localhost:8000/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ПЭНД гранулят",
    "type": "raw_material",
    "unit": "кг",
    "density": 0.95
  }'
```

### Get Orders
```bash
curl http://localhost:8000/api/orders?status=active&limit=10
```

### Update Production Line
```bash
curl -X POST http://localhost:8000/api/production/lines/EXT-01/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "pause",
    "reason": "Плановая настройка"
  }'
```