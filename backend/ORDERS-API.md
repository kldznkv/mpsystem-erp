# 📡 ORDERS API - Полная документация

## ✅ Созданные файлы

### 1. `backend/src/app/api/v1/endpoints/orders.py`
**Полные CRUD API endpoints для Orders**

### 2. `backend/src/app/services/orders.py`
**OrderService с бизнес-логикой и валидацией**

### 3. API интеграция в `api.py` и `main.py`

## 🌐 API Endpoints

### Базовый URL
```
Base URL: /api/v1/orders
```

### 1. GET /orders - Получить список заказов
```http
GET /api/v1/orders?status=new&client_name=Упаковка&priority=urgent&page=1&limit=50
```

**Query Parameters:**
- `status` (optional): Filter by OrderStatus (new, confirmed, planned, in_production, completed, shipped)
- `client_name` (optional): Filter by client name (partial match)
- `priority` (optional): Filter by OrderPriority (low, normal, high, urgent)
- `search` (optional): Search in order number, client name, or product name
- `overdue_only` (optional): Boolean - show only overdue orders
- `page` (default: 1): Page number
- `limit` (default: 50, max: 100): Items per page

**Response:** `OrderListResponse`
```json
{
  "items": [
    {
      "id": "uuid",
      "number": "ZP-2024/0001",
      "client_id": "CL-001",
      "client_name": "ООО Упаковка Плюс",
      "product_id": "PR-001",
      "product_name": "Пленка ПВД 100мкм",
      "quantity": 1000.0,
      "unit": "kg",
      "due_date": "2024-08-15",
      "priority": "high",
      "status": "new",
      "value": 50000.0,
      "margin": 15.5,
      "progress": 0,
      "special_requirements": "Прозрачная пленка",
      "created_by": "manager@mpsystem.com",
      "created_at": "2024-07-25T12:00:00Z",
      "updated_at": "2024-07-25T12:00:00Z",
      "is_overdue": false,
      "days_until_due": 21,
      "is_urgent_priority": false,
      "status_display": "Новый",
      "priority_display": "Высокий"
    }
  ],
  "total": 150,
  "page": 1,
  "size": 50,
  "pages": 3
}
```

### 2. GET /orders/{order_id} - Получить заказ по ID
```http
GET /api/v1/orders/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `OrderResponse`

### 3. POST /orders - Создать новый заказ
```http
POST /api/v1/orders
Content-Type: application/json

{
  "client_id": "CL-001",
  "client_name": "ООО Упаковка Плюс",
  "product_id": "PR-001",
  "product_name": "Пленка ПВД 100мкм",
  "quantity": 1000.0,
  "unit": "kg",
  "due_date": "2024-08-15",
  "priority": "high",
  "value": 50000.0,
  "margin": 15.5,
  "special_requirements": "Прозрачная пленка",
  "created_by": "manager@mpsystem.com"
}
```

**Response:** `OrderResponse` (Status: 201 Created)

### 4. PUT /orders/{order_id} - Обновить заказ
```http
PUT /api/v1/orders/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "quantity": 1200.0,
  "priority": "urgent",
  "special_requirements": "Срочный заказ - прозрачная пленка"
}
```

**Response:** `OrderResponse`

### 5. DELETE /orders/{order_id} - Удалить заказ
```http
DELETE /api/v1/orders/550e8400-e29b-41d4-a716-446655440000
```

**Response:** 204 No Content

**Business Rule:** Можно удалять только заказы в статусе `new` или `confirmed`

### 6. PUT /orders/{order_id}/status - Обновить статус заказа
```http
PUT /api/v1/orders/550e8400-e29b-41d4-a716-446655440000/status
Content-Type: application/json

{
  "status": "confirmed",
  "progress": 10,
  "notes": "Заказ подтвержден клиентом"
}
```

**Response:** `OrderResponse`

### 7. GET /orders/{order_id}/progress - Получить прогресс заказа
```http
GET /api/v1/orders/550e8400-e29b-41d4-a716-446655440000/progress
```

**Response:**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "ZP-2024/0001",
  "status": "in_production",
  "progress": 50,
  "is_overdue": false,
  "days_until_due": 10,
  "detailed_progress": {
    "current_status": "in_production",
    "current_progress": 50,
    "status_history": [...],
    "next_milestone": "Production completion",
    "recommendations": [...]
  }
}
```

### 8. GET /orders/summary/statistics - Статистика заказов
```http
GET /api/v1/orders/summary/statistics
```

**Response:** `OrderSummary`
```json
{
  "total_orders": 150,
  "new_orders": 25,
  "in_production": 45,
  "completed_orders": 80,
  "overdue_orders": 5,
  "urgent_orders": 12,
  "total_value": 2500000.0,
  "average_margin": 18.5
}
```

### 9. GET /orders/overdue/list - Просроченные заказы
```http
GET /api/v1/orders/overdue/list
```

**Response:** `List[OrderResponse]`

### 10. GET /orders/urgent/list - Срочные заказы
```http
GET /api/v1/orders/urgent/list
```

**Response:** `List[OrderResponse]`

## 🔧 Бизнес-логика (OrderService)

### Автогенерация номера заказа
```python
# Формат: ZP-YYYY/NNNN
# Пример: ZP-2024/0001, ZP-2024/0002
def generate_order_number() -> str
```

### Валидация статусных переходов
```python
# Разрешенные переходы:
NEW → CONFIRMED
CONFIRMED → PLANNED | NEW
PLANNED → IN_PRODUCTION | CONFIRMED  
IN_PRODUCTION → COMPLETED | PLANNED
COMPLETED → SHIPPED
SHIPPED → (финальный статус)
```

### Автоматический прогресс по статусам
```python
NEW: 0%
CONFIRMED: 10%
PLANNED: 25%
IN_PRODUCTION: 50%
COMPLETED: 90%
SHIPPED: 100%
```

### Бизнес-правила
- **Удаление:** Только статусы `NEW` или `CONFIRMED`
- **Изменение:** Нельзя изменять заказы в статусе `COMPLETED` или `SHIPPED`
- **Дата поставки:** Не может быть в прошлом
- **Количество:** Должно быть положительным числом

## 🚨 Обработка ошибок

### HTTP Status Codes
- `200` - Успешный запрос
- `201` - Заказ создан
- `204` - Заказ удален
- `400` - Неверные данные / нарушение бизнес-правил
- `404` - Заказ не найден
- `422` - Ошибка валидации данных
- `500` - Внутренняя ошибка сервера

### Примеры ошибок
```json
// 404 Not Found
{
  "detail": "Order with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}

// 400 Bad Request
{
  "detail": "Cannot delete order in status 'in_production'. Only 'new' or 'confirmed' orders can be deleted."
}

// 400 Bad Request - Status Transition
{
  "detail": "Invalid status transition from 'new' to 'completed'"
}

// 422 Validation Error
{
  "detail": [
    {
      "loc": ["body", "quantity"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

## 🔍 Фильтрация и поиск

### Доступные фильтры
- **status**: Фильтр по статусу заказа
- **priority**: Фильтр по приоритету
- **client_name**: Поиск по названию клиента (частичное совпадение)
- **client_id**: Точный поиск по ID клиента
- **product_id**: Точный поиск по ID продукта
- **due_date_from/due_date_to**: Диапазон дат поставки
- **search**: Поиск по номеру заказа, названию клиента или продукта
- **overdue_only**: Только просроченные заказы

### Пагинация
- **page**: Номер страницы (от 1)
- **limit**: Количество элементов на странице (от 1 до 100)
- Возвращается: общее количество, количество страниц, текущая страница

## 📊 Примеры использования

### Создание заказа с Python requests
```python
import requests

# Создание заказа
order_data = {
    "client_id": "CL-001",
    "client_name": "ООО Упаковка Плюс",
    "product_id": "PR-001", 
    "product_name": "Пленка ПВД 100мкм",
    "quantity": 1000.0,
    "unit": "kg",
    "due_date": "2024-08-15",
    "priority": "high",
    "value": 50000.0,
    "margin": 15.5,
    "created_by": "manager@mpsystem.com"
}

response = requests.post(
    "http://localhost:8000/api/v1/orders/",
    json=order_data
)

if response.status_code == 201:
    order = response.json()
    print(f"Order created: {order['number']}")
```

### Получение заказов с фильтрами
```python
# Получить все срочные заказы в производстве
params = {
    "status": "in_production",
    "priority": "urgent",
    "page": 1,
    "limit": 20
}

response = requests.get(
    "http://localhost:8000/api/v1/orders/",
    params=params
)

orders = response.json()
print(f"Found {orders['total']} urgent orders in production")
```

### Обновление статуса заказа
```python
order_id = "550e8400-e29b-41d4-a716-446655440000"

status_update = {
    "status": "confirmed",
    "progress": 10,
    "notes": "Order confirmed by client"
}

response = requests.put(
    f"http://localhost:8000/api/v1/orders/{order_id}/status",
    json=status_update
)

updated_order = response.json()
print(f"Order status updated to: {updated_order['status']}")
```

## ✅ Готово к использованию!

- ✅ **10 API endpoints** с полной функциональностью
- ✅ **Фильтрация и пагинация** для списков
- ✅ **Бизнес-логика** в OrderService
- ✅ **Валидация** данных и статусных переходов
- ✅ **Обработка ошибок** с правильными HTTP кодами
- ✅ **Автогенерация** номеров заказов
- ✅ **Dependency injection** для DB сессии
- ✅ **Документация** и примеры использования

**API готово для интеграции с фронтендом и production использования!** 🚀