# 🚀 MPSYSTEM Backend Setup - Простая настройка!

## 📋 Быстрый старт

### 1. Запуск Backend (один клик!)

```bash
# В корне проекта
python start.py
```

Или альтернативно:
```bash
python3 start.py
```

### 2. Что происходит автоматически:

✅ **Проверка Python** (требуется 3.8+)  
✅ **Установка зависимостей** из `backend/requirements.txt`  
✅ **Инициализация базы данных** SQLite  
✅ **Создание тестовых данных** (20 заказов)  
✅ **Запуск сервера** на http://localhost:8000  

### 3. Проверяем что работает:

```bash
# Health check
curl http://localhost:8000/health

# Список заказов
curl http://localhost:8000/api/v1/orders

# Статистика БД
curl http://localhost:8000/db-stats
```

### 4. API документация:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

---

## 🔗 Подключение Frontend к Backend

### Вариант 1: Локальная разработка

1. **Запустите backend** (см. выше)
2. **Откройте frontend** - http://localhost:3000 или file://index.html
3. **В консоли браузера** проверьте что API доступно:

```javascript
// В DevTools Console
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

### Вариант 2: GitHub Pages + Backend

1. **Запустите backend локально** (порт 8000)
2. **Измените конфигурацию** в `frontend/js/config.js`:

```javascript
// В CONFIG.API_BASE_URL измените на:
API_BASE_URL: 'http://localhost:8000'
```

3. **Деплойте на GitHub Pages** - backend будет работать локально

### Вариант 3: Полная настройка CORS

Если есть проблемы с CORS, добавьте в `backend/src/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Структура API Endpoints

### Orders (Заказы)
- `GET /api/v1/orders` - Список заказов
- `GET /api/v1/orders/{id}` - Заказ по ID
- `POST /api/v1/orders` - Создать заказ
- `PUT /api/v1/orders/{id}` - Обновить заказ
- `DELETE /api/v1/orders/{id}` - Удалить заказ

### System
- `GET /health` - Проверка работоспособности
- `GET /db-stats` - Статистика базы данных
- `POST /db-init` - Переинициализация БД (debug режим)

---

## 🛠️ Troubleshooting

### Проблема: "Module not found"
```bash
# Переустановите зависимости
cd backend
pip install -r requirements.txt
```

### Проблема: "Port 8000 already in use"
```bash
# Найдите и остановите процесс
lsof -ti:8000 | xargs kill -9

# Или измените порт в start.py
```

### Проблема: CORS ошибки
1. Проверьте что backend запущен
2. Откройте http://localhost:8000/health в браузере
3. Если не работает - добавьте `allow_origins=["*"]` в CORS настройки

### Проблема: База данных
```bash
# Пересоздайте БД
python start.py
# В логах увидите процесс инициализации
```

---

## 🎯 Результат

После запуска у вас будет:

✅ **Backend API** на http://localhost:8000  
✅ **Swagger документация** на /api/v1/docs  
✅ **20 тестовых заказов** в базе данных  
✅ **CORS настроен** для frontend  
✅ **Auto-reload** при изменении кода  

**Frontend автоматически подключится к backend и покажет реальные данные!**

---

## 🔧 Дальнейшая разработка

1. **Добавление новых endpoints** - в `backend/src/app/api/v1/endpoints/`
2. **Новые модели данных** - в `backend/src/app/models/`
3. **Схемы валидации** - в `backend/src/app/schemas/`
4. **Бизнес-логика** - в `backend/src/app/services/`

**Сервер автоматически перезапустится при изменениях!** 🔄