# 🏭 MPSYSTEM Production ERP - Backend

**FastAPI-based Backend для комплексной ERP системы управления производством**

## 🚀 **Быстрый старт**

### **Запуск локально (Рекомендуется)**

```bash
# 1. Установка зависимостей
pip install -r requirements.txt

# 2. Запуск сервера разработки
python start_backend.py

# 3. Открыть в браузере:
# - API документация: http://localhost:8000/api/docs
# - Фронтенд: http://localhost:8000
# - Проверка здоровья: http://localhost:8000/health
```

### **Запуск с Docker**

```bash
# Запуск полного стека (Backend + Redis)
docker-compose up -d

# Только бекенд
docker build -t mpsystem-erp .
docker run -p 8000:8000 mpsystem-erp
```

---

## 📋 **Архитектура API**

### **Основные модули:**

#### **📊 Dashboard (`/api/v1/dashboard`)**
- `GET /kpi` - KPI метрики производства
- `GET /production-overview` - Обзор производственных линий  
- `GET /recent-activities` - Последние активности системы
- `GET /chart-data/production` - Данные для графиков
- `GET /alerts` - Системные уведомления
- `GET /system-status` - Статус системы

#### **📋 Planning (`/api/v1/planning`)**
- `GET /stats` - Статистика планирования
- `GET /new-orders` - Новые заказы для планирования
- `GET /production-queue` - Очередь производства
- `POST /optimize-queue` - Оптимизация очереди
- `POST /orders/{order_id}/plan` - Планирование заказа

#### **📦 Warehouse (`/api/v1/warehouse`)**
- `GET /inventory` - Остатки на складах
- `GET /batches/{batch_id}/trace` - Трейсабилити партий
- *[В разработке: поступления, качество, документы]*

#### **🛒 Procurement (`/api/v1/procurement`)**
- `GET /mrp-requirements` - Потребности MRP
- `GET /suppliers` - Информация о поставщиках
- *[В разработке: заказы, договоры, цены]*

#### **🏭 Production (`/api/v1/production`)**
- `GET /lines` - Статус производственных линий
- *[В разработке: оборудование, операции, качество]*

---

## 🗄️ **База данных**

### **Текущая конфигурация:**
- **SQLite** (локальная разработка)
- **AsyncIO** + **SQLAlchemy 2.0**
- **Alembic** для миграций

### **Production готовность:**
```bash
# Переключение на PostgreSQL
export DATABASE_URL="postgresql+asyncpg://user:password@localhost/mpsystem_erp"
```

### **Основные модели:**
```python
# Склады
class Warehouse(BaseModel):
    code: str  # MAG-1, MAG-1.1, MAG-2-9
    name: str
    type: str  # raw_materials, adr, production, finished

# Материалы и партии  
class Material(BaseModel):
    code: str
    name: str
    type: str  # granulate, ink, adhesive, film
    unit: str

class Batch(BaseModel):
    number: str
    material_id: int
    supplier_id: int
    quantity: float
    quality_status: str  # pending, approved, blocked

# Производственные заказы
class ProductionOrder(BaseModel):
    order_number: str
    customer: str
    product_spec: str
    quantity: float
    priority: str
    status: str
```

---

## 🔧 **Конфигурация**

### **Переменные окружения (.env):**

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./mpsystem_erp.db

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "https://kldznkv.github.io"]

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### **Настройки производства:**

```python
# Склады системы
WAREHOUSES = [
    "MAG-1",     # Сырье
    "MAG-1.1",   # ADR опасные грузы  
    "MAG-2",     # Экструзия
    "MAG-3",     # УФ обработка
    "MAG-4",     # Печать
    "MAG-5",     # Ламинация + готовые изделия
    "MAG-6",     # Барьерное покрытие
    "MAG-7",     # Резка
    "MAG-8",     # Изготовление пакетов
    "MAG-9"      # Резка рукавов
]

# Производственные линии
PRODUCTION_LINES = [
    "EXTRUDER-1", "EXTRUDER-2",
    "UV-LINE-1", 
    "PRINT-LINE-1", "PRINT-LINE-2",
    "LAMINATOR-1",
    "SLITTER-1", "SLITTER-2", 
    "BAG-MAKER-1", "BAG-MAKER-2"
]
```

---

## 🔐 **Безопасность**

### **Аутентификация:**
- JWT токены
- Роли пользователей (Admin, Manager, Operator, Viewer)
- Разграничение доступа к модулям

### **Заголовки безопасности:**
```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
```

---

## 📊 **Мониторинг и производительность**

### **Health Check:**
```bash
curl http://localhost:8000/health
```

### **Метрики системы:**
- Использование CPU/RAM
- Время отклика API
- Статус производственных линий
- Подключения к БД

### **Логирование:**
- Структурированные логи
- Отслеживание API запросов
- Уведомления об ошибках

---

## 🧪 **Тестирование**

```bash
# Запуск тестов
pytest

# Тесты с покрытием
pytest --cov=backend

# Только API тесты
pytest tests/api/
```

---

## 🚀 **Deployment**

### **Production Checklist:**
- [ ] Установить `DEBUG=False`
- [ ] Настроить PostgreSQL
- [ ] Установить сильный `SECRET_KEY`
- [ ] Настроить CORS origins
- [ ] Настроить Redis для кеширования
- [ ] Настроить HTTPS
- [ ] Настроить мониторинг

### **Docker Production:**
```yaml
version: '3.8'
services:
  backend:
    image: mpsystem-erp:latest
    environment:
      - DATABASE_URL=postgresql+asyncpg://...
      - DEBUG=false
      - SECRET_KEY=production-secret
    depends_on:
      - postgres
      - redis
```

---

## 📚 **API Документация**

### **Swagger UI:** 
`http://localhost:8000/api/docs`

### **ReDoc:** 
`http://localhost:8000/api/redoc`

### **OpenAPI Schema:** 
`http://localhost:8000/api/openapi.json`

---

## 🛠️ **Разработка**

### **Добавление нового endpoint:**

```python
from fastapi import APIRouter, Depends
from app.db.database import get_db

router = APIRouter()

@router.get("/new-endpoint")
async def new_endpoint(db: AsyncSession = Depends(get_db)):
    return {"message": "New endpoint"}
```

### **Добавление новой модели:**

```python
from app.db.base import BaseModel
from sqlalchemy.orm import Mapped, mapped_column

class NewModel(BaseModel):
    __tablename__ = "new_models"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
```

---

## 📞 **Поддержка**

### **Статус проекта:** ✅ В активной разработке

### **Реализованные модули:**
- ✅ Dashboard с KPI
- ✅ Planning базовый функционал
- ⏳ Warehouse (в разработке)
- ⏳ Procurement (в разработке)
- ⏳ Production (в разработке)

### **Следующие этапы:**
1. **Модели данных** - создание полных моделей БД
2. **Аутентификация** - система пользователей и ролей
3. **Warehouse API** - полная реализация складского модуля
4. **Procurement API** - реализация закупок
5. **Production tracking** - мониторинг производства в реальном времени

---

**Разработано для производства полимерных пленок** 🎬