# 📊 SAMPLE DATA - Тестовые данные для MPSYSTEM

## ✅ Созданные файлы

### 1. `backend/src/app/db/init_data.py`
**Создание тестовых данных для Orders**

### 2. `backend/src/app/db/init_db.py`
**Инициализация БД с проверками и логированием**

### 3. `backend/run_server.py`
**Скрипт запуска development сервера**

### 4. Обновлен `backend/src/app/main.py`
**Автоинициализация БД при startup**

## 📦 Тестовые данные Orders

### Клиенты (по польской упаковочной промышленности)
- **MLEKOVITA** - молочные продукты, сыры
- **AGRONA** - сельхоз продукция, овощи  
- **LACPOL** - молочные продукты, йогурты
- **DANONE** - йогурты, молочные продукты
- **MONDELEZ** - кондитерские изделия, шоколад

### Типы продукции (20 позиций)

#### Упаковка для молочных продуктов:
1. **Опакования до serów żółtych 500g** - упаковки для желтых сыров
2. **Opakowania do masła 250g** - упаковки для масла  
3. **Pojemniki do serków 150g** - контейнеры для творожков
4. **Kubki PS do jogurtów 150ml** - стаканы PS для йогуртов
5. **Wieczka do jogurtów PP** - крышки для йогуртов PP
6. **Etykiety IML do kubków** - этикетки IML для стаканов
7. **Laminat do jogurtów 125ml** - ламинат для йогуртов
8. **Kubki do śmietany 200ml** - стаканы для сметаны

#### Промышленная упаковка:
9. **Folia stretch 500mm x 300m** - стрейч пленка
10. **Worki na warzywa 2kg** - пакеты для овощей
11. **Siatki na owoce 2kg** - сетки для фруктов
12. **Worki próżniowe 30x40cm** - вакуумные пакеты

#### Упаковка для кондитерских изделий:
13. **Wrappers do czekolad 100g** - обертки для шоколада
14. **Pudełka do ciastek 200g** - коробки для печенья
15. **Flow pack do wafelków** - флоу пак для вафель
16. **Tace do ciastek 6-pack** - лотки для печенья

#### Дополнительные компоненты:
17. **Butelki PET 500ml** - бутылки PET
18. **Nakrętki do butelek 28mm** - крышки для бутылок
19. **Pokrywki aluminiowe 83mm** - алюминиевые крышки
20. **Paski do zamykania ser żółty** - полоски для закрытия сыра

### Статистика тестовых данных

#### Распределение по статусам:
- **NEW**: 4 заказа (20%)
- **CONFIRMED**: 4 заказа (20%) 
- **PLANNED**: 4 заказа (20%)
- **IN_PRODUCTION**: 6 заказов (30%)
- **COMPLETED**: 1 заказ (5%)
- **SHIPPED**: 1 заказ (5%)

#### Распределение по приоритетам:
- **LOW**: 1 заказ (5%)
- **NORMAL**: 9 заказов (45%)
- **HIGH**: 7 заказов (35%)
- **URGENT**: 3 заказа (15%)

#### Финансовые показатели:
- **Общая стоимость**: ~1.8 млн PLN
- **Средняя маржа**: 20.1%
- **Диапазон маржи**: 12.8% - 35.8%

#### Особенности:
- **2 просроченных заказа** для тестирования overdue функций
- **Реалистичные сроки**: от -3 до +35 дней
- **Польские технические требования**: barrier properties, certyfikat BRC, etc.
- **Различные единицы измерения**: pcs, kg, m, m2

## 🗄️ База данных

### Автоинициализация
```python
# При запуске приложения автоматически:
1. Создаются таблицы (если их нет)
2. Проверяется наличие данных  
3. Создаются тестовые данные (если БД пустая)
4. Логируется статистика
```

### Функции init_db.py

#### `init_db()` - Основная инициализация
```python
def init_db() -> None:
    """Initialize database with tables and sample data"""
    # 1. Создание таблиц
    # 2. Проверка подключения
    # 3. Создание тестовых данных
```

#### `check_db_initialized()` - Проверка состояния
```python
def check_db_initialized() -> bool:
    """Check if database is properly initialized"""
    # Проверяет наличие таблиц и данных
```

#### `get_db_stats()` - Статистика БД
```python
def get_db_stats() -> dict:
    """Get database statistics"""
    # Возвращает счетчики записей по таблицам
```

#### `reset_db()` - Сброс БД
```python 
def reset_db() -> None:
    """Reset database - ALL DATA WILL BE LOST!"""
    # Полный сброс и пересоздание
```

#### `create_sample_data_if_empty()` - Условное создание
```python
def create_sample_data_if_empty() -> dict:
    """Create sample data only if database is empty"""
    # Создает данные только в пустой БД
```

## 🚀 Запуск сервера

### Development сервер (`backend/run_server.py`)
```bash
cd backend
python run_server.py
```

**Отображает:**
```
🏭 MPSYSTEM ERP Backend Development Server
============================================================
🌐 Server URL: http://0.0.0.0:8000
📚 API Documentation: http://0.0.0.0:8000/api/v1/docs
📖 ReDoc: http://0.0.0.0:8000/api/v1/redoc
❤️ Health Check: http://0.0.0.0:8000/health
📊 Database Stats: http://0.0.0.0:8000/db-stats
============================================================
💡 Features:
   • Hot reload enabled
   • Database auto-initialization with sample data
   • Comprehensive API documentation
   • Request logging and timing
   • CORS enabled for frontend development
```

### Альтернативные способы запуска
```bash
# Через start.py
cd backend
python start.py

# Напрямую uvicorn
cd backend/src
uvicorn app.main:app --reload

# Через main.py
cd backend/src
python -m app.main
```

## 📡 API Endpoints для БД

### GET /health - Health Check
```json
{
  "status": "healthy",
  "database": {
    "healthy": true,
    "initialized": true,
    "total_records": 20,
    "tables": {
      "orders": 20
    }
  }
}
```

### GET /db-stats - Статистика БД
```json
{
  "initialized": true,
  "tables": {
    "orders": 20
  },
  "total_records": 20,
  "error": null
}
```

### POST /db-init - Ручная инициализация (debug)
```json
{
  "message": "Database initialized successfully",
  "stats": {
    "initialized": true,
    "total_records": 20,
    "tables": {"orders": 20}
  }
}
```

### GET / - Root endpoint
```json
{
  "message": "Welcome to MPSYSTEM ERP Backend API",
  "project": "MPSYSTEM",
  "version": "1.0.0",
  "status": "operational",
  "database": {
    "initialized": true,
    "total_records": 20,
    "tables": {"orders": 20}
  }
}
```

## 🔧 Логирование

### Startup логи
```
2024-07-25 12:00:00 - app.db.init_db - INFO - 🚀 Initializing MPSYSTEM database...
2024-07-25 12:00:00 - app.db.init_db - INFO - Creating database tables...
2024-07-25 12:00:00 - app.db.init_db - INFO - ✅ Database tables created successfully
2024-07-25 12:00:00 - app.db.init_data - INFO - Creating sample orders data...
2024-07-25 12:00:01 - app.db.init_data - INFO - Created order 1/20: ZP-2024/0001
...
2024-07-25 12:00:05 - app.db.init_data - INFO - Successfully created 20 sample orders
2024-07-25 12:00:05 - app.main - INFO - ✅ Database ready - Total records: 20
2024-07-25 12:00:05 - app.main - INFO -    - orders: 20 records
```

### Request логи
```
2024-07-25 12:01:00 - app.main - INFO - GET /api/v1/orders - Status: 200 - Time: 0.045s
2024-07-25 12:01:15 - app.main - INFO - POST /api/v1/orders - Status: 201 - Time: 0.123s
```

## 📊 Примеры тестовых заказов

### Пример 1: MLEKOVITA - Высокий приоритет
```json
{
  "number": "ZP-2024/0001",
  "client_name": "MLEKOVITA", 
  "product_name": "Opakowania do serów żółtych 500g",
  "quantity": 50000.0,
  "unit": "pcs",
  "due_date": "2024-08-08",
  "priority": "high",
  "status": "confirmed",
  "value": 125000.0,
  "margin": 18.5,
  "special_requirements": "Nadruk logo MLEKOVITA, certyfikat BRC"
}
```

### Пример 2: AGRONA - Срочный заказ в производстве
```json
{
  "number": "ZP-2024/0002",
  "client_name": "AGRONA",
  "product_name": "Folia stretch 500mm x 300m", 
  "quantity": 2000.0,
  "unit": "m",
  "due_date": "2024-08-01",
  "priority": "urgent",
  "status": "in_production",
  "progress": 65,
  "special_requirements": "Grubość 23μm, transparent, paleta drewniana"
}
```

### Пример 3: DANONE - Просроченный заказ
```json
{
  "number": "ZP-2024/0019",
  "client_name": "DANONE",
  "product_name": "Pokrywki aluminiowe 83mm",
  "due_date": "2024-07-22", // OVERDUE!
  "priority": "urgent", 
  "status": "in_production",
  "is_overdue": true,
  "days_until_due": -3
}
```

## ✅ Готово к использованию!

- ✅ **20 реалистичных заказов** с польскими техтребованиями
- ✅ **Автоинициализация БД** при старте приложения
- ✅ **Проверка состояния** БД с подробной статистикой
- ✅ **Development сервер** с удобным интерфейсом
- ✅ **Логирование** всех операций с БД
- ✅ **API endpoints** для управления БД
- ✅ **Просроченные заказы** для тестирования алертов
- ✅ **Различные статусы** и приоритеты для полного покрытия

**Тестовые данные готовы для разработки и демонстрации функций ERP!** 🚀