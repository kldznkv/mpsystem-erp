# 📋 ORDERS MODEL - Полная документация

## ✅ Созданные файлы

### 1. `backend/src/app/models/orders.py`
**SQLAlchemy модель Order с полным набором полей:**

#### 🔑 Основные поля:
- `id`: UUID (primary key) - уникальный идентификатор
- `number`: String (unique) - номер заказа в формате "ZP-2024/0318"
- `client_id`: String - идентификатор клиента
- `client_name`: String - название компании клиента
- `product_id`: String - идентификатор продукта
- `product_name`: String - название продукта
- `quantity`: Float - количество (с валидацией > 0)
- `unit`: Enum - единица измерения (pcs, kg, m2, m, l, ton)
- `due_date`: Date - дата поставки
- `priority`: Enum - приоритет (low, normal, high, urgent)
- `status`: Enum - статус (new, confirmed, planned, in_production, completed, shipped)
- `value`: Float - стоимость заказа
- `margin`: Float - маржинальность в %
- `progress`: Integer - прогресс выполнения (0-100%)
- `special_requirements`: Text - особые требования
- `created_by`: String - кто создал заказ
- `created_at`: DateTime - время создания
- `updated_at`: DateTime - время обновления

#### 📊 Computed Properties:
- `is_overdue` - проверка просрочки
- `days_until_due` - дни до срока поставки
- `is_urgent_priority` - проверка срочного приоритета
- `status_display` - статус на русском языке
- `priority_display` - приоритет на русском языке

### 2. `backend/src/app/schemas/orders.py`
**Pydantic схемы с полной валидацией:**

#### 📝 Схемы:
- `OrderBase` - базовая схема с общими полями
- `OrderCreate` - для создания заказов
- `OrderUpdate` - для обновления заказов
- `OrderResponse` - для ответов API
- `OrderListResponse` - для пагинированных списков
- `OrderSummary` - для статистики заказов
- `OrderStatusUpdate` - для обновления статуса
- `OrderFilter` - для фильтрации заказов

#### ✅ Валидация:
- Количество > 0 и < 1,000,000
- Дата поставки не в прошлом
- Маржа 0-100%
- Прогресс 0-100%
- Формат номера заказа ZP-YYYY/NNNN

## 🔧 Enums (Перечисления)

### OrderPriority
```python
LOW = "low"        # Низкий
NORMAL = "normal"  # Обычный  
HIGH = "high"      # Высокий
URGENT = "urgent"  # Срочный
```

### OrderStatus
```python
NEW = "new"                    # Новый
CONFIRMED = "confirmed"        # Подтвержден
PLANNED = "planned"           # Запланирован
IN_PRODUCTION = "in_production" # В производстве
COMPLETED = "completed"        # Завершен
SHIPPED = "shipped"           # Отгружен
```

### OrderUnit
```python
PCS = "pcs"  # штуки
KG = "kg"    # килограммы
M2 = "m2"    # квадратные метры
M = "m"      # метры
L = "l"      # литры
TON = "ton"  # тонны
```

## 🗄️ База данных

### Таблица: `orders`
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit order_unit_enum NOT NULL,
    due_date DATE NOT NULL,
    priority order_priority_enum NOT NULL DEFAULT 'normal',
    status order_status_enum NOT NULL DEFAULT 'new',
    value FLOAT,
    margin FLOAT,
    progress INTEGER NOT NULL DEFAULT 0,
    special_requirements TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Индексы:
- `orders.number` (UNIQUE)
- `orders.client_id`
- `orders.product_id`
- `orders.due_date`
- `orders.priority`
- `orders.status`

## 📡 API Endpoints (будущие)

### Основные операции:
```http
GET    /api/v1/orders/         # Список заказов с фильтрацией
POST   /api/v1/orders/         # Создание заказа
GET    /api/v1/orders/{id}     # Получение заказа по ID
PUT    /api/v1/orders/{id}     # Обновление заказа
DELETE /api/v1/orders/{id}     # Удаление заказа
```

### Специальные операции:
```http
GET    /api/v1/orders/summary          # Статистика заказов
PUT    /api/v1/orders/{id}/status      # Обновление статуса
GET    /api/v1/orders/overdue          # Просроченные заказы
GET    /api/v1/orders/urgent           # Срочные заказы
```

## 🔗 Связи с другими таблицами (будущие)

### Планируемые relationships:
```python
# В Order модели (будущее):
items = relationship("OrderItem", back_populates="order")
production_jobs = relationship("ProductionJob", back_populates="order")
invoices = relationship("Invoice", back_populates="order")
shipments = relationship("Shipment", back_populates="order")

# Связанные таблицы:
- order_items (позиции заказа)
- production_jobs (производственные задания)
- materials (материалы)
- clients (клиенты)
- products (продукты)
```

## 📊 Примеры использования

### Создание заказа:
```python
from app.schemas.orders import OrderCreate
from app.models.orders import OrderUnit, OrderPriority

order_data = OrderCreate(
    client_id="CL-001",
    client_name="ООО Упаковка Плюс",
    product_id="PR-001",
    product_name="Пленка ПВД 100мкм",
    quantity=1000.0,
    unit=OrderUnit.KG,
    due_date=date(2024, 8, 15),
    priority=OrderPriority.HIGH,
    value=50000.0,
    margin=15.5,
    created_by="manager@mpsystem.com"
)
```

### Фильтрация заказов:
```python
from app.schemas.orders import OrderFilter

filter_data = OrderFilter(
    status=OrderStatus.IN_PRODUCTION,
    priority=OrderPriority.URGENT,
    overdue_only=True,
    search="Упаковка"
)
```

## 🎯 Бизнес-логика

### Workflow заказа:
1. **NEW** → **CONFIRMED** (подтверждение клиентом)
2. **CONFIRMED** → **PLANNED** (планирование производства)
3. **PLANNED** → **IN_PRODUCTION** (начало производства)
4. **IN_PRODUCTION** → **COMPLETED** (завершение производства)
5. **COMPLETED** → **SHIPPED** (отгрузка клиенту)

### Автоматические проверки:
- Просрочка: `due_date < today() AND status NOT IN [COMPLETED, SHIPPED]`
- Срочность: `priority = URGENT OR days_until_due <= 3`
- Готовность к производству: материалы зарезервированы, план создан

## ✅ Готово к использованию!

- ✅ SQLAlchemy модель с полным набором полей
- ✅ Pydantic схемы с валидацией
- ✅ Enums для приоритетов, статусов и единиц
- ✅ Computed properties для бизнес-логики
- ✅ Документация и комментарии
- ✅ Подготовка к relationships
- ✅ Индексы для производительности

**Модель готова для интеграции с API endpoints и фронтендом!** 🚀