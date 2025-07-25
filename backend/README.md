# MPSYSTEM Backend

## 🚀 Настроенная конфигурация базы данных

Backend полностью настроен для работы с PostgreSQL и SQLite (fallback).

### 📁 Структура

```
backend/
├── src/app/
│   ├── main.py              # ✅ FastAPI приложение с CORS, логированием
│   ├── core/
│   │   └── config.py        # ✅ Конфигурация PostgreSQL + переменные окружения
│   ├── db/
│   │   ├── database.py      # ✅ SQLAlchemy engine + SessionLocal + dependency
│   │   └── base.py          # ✅ Base модель
│   ├── api/v1/              # API endpoints
│   ├── models/              # SQLAlchemy модели
│   ├── schemas/             # Pydantic схемы
│   └── services/            # Бизнес-логика
├── requirements.txt         # ✅ Все зависимости включая PostgreSQL
├── .env.example            # ✅ Примеры переменных окружения
├── .gitignore              # ✅ Git исключения
├── start.py                # ✅ Скрипт запуска
└── README.md               # ✅ Эта документация
```

### 🔧 Конфигурация базы данных

#### PostgreSQL (Production)
- Автоматическое подключение если задан `DATABASE_URL`
- Connection pooling с настройками производительности
- Настройки через переменные окружения

#### SQLite (Development)
- Автоматический fallback если PostgreSQL недоступен
- Идеально для локальной разработки
- Файл базы: `mpsystem.db`

### 🛠 Установка и запуск

#### 1. Установка зависимостей
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Настройка окружения
```bash
# Скопируйте файл примера
cp .env.example .env

# Отредактируйте .env под ваши настройки
nano .env
```

#### 3. Запуск сервера
```bash
# Через скрипт запуска (рекомендуется)
python start.py

# Или напрямую
cd src && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 🌐 Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /` | Основная информация API |
| `GET /health` | Health check с проверкой БД |
| `GET /db-info` | Информация о подключении к БД (debug) |
| `GET /config` | Конфигурация приложения |
| `GET /api/v1/docs` | Swagger документация |

### 🗄️ База данных

#### Автоматическая конфигурация:
1. **PostgreSQL** - если задан `DATABASE_URL`
2. **SQLite** - fallback для разработки

#### Функции:
- `get_db()` - dependency для FastAPI routes
- `create_database()` - создание таблиц
- `check_db_health()` - проверка подключения
- `get_db_info()` - информация о БД

### 🔐 Переменные окружения

```bash
# Основные настройки
PROJECT_NAME=MPSYSTEM
SECRET_KEY=your-secret-key
DEBUG=False
ENVIRONMENT=development

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/mpsystem
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=mpsystem
POSTGRES_PORT=5432

# CORS Origins
BACKEND_CORS_ORIGINS=http://localhost:3000,https://kldznkv.github.io

# JWT настройки
ACCESS_TOKEN_EXPIRE_MINUTES=11520
ALGORITHM=HS256

# Первый суперпользователь
FIRST_SUPERUSER=admin@mpsystem.com
FIRST_SUPERUSER_PASSWORD=secure-password
```

### 🔧 CORS Настройки

CORS автоматически настроен для:
- `http://localhost:3000` (React dev)
- `http://localhost:8000` (Local API)
- `http://localhost:8080` (Frontend dev)
- `https://kldznkv.github.io` (GitHub Pages)

### 📊 Логирование

- Уровень логирования: `INFO` (настраивается)
- Автоматическое логирование всех запросов
- Timing информация в headers
- Структурированный формат логов

### 🛡️ Безопасность

- Security headers для всех ответов
- Rate limiting готов к настройке
- JWT аутентификация (готово к использованию)
- Валидация всех входных данных

### 🧪 Тестирование конфигурации

```bash
# Тест загрузки конфигурации
python3 -c "
import sys
sys.path.insert(0, 'src')
from app.core.config import settings
from app.db.database import get_db_info
print('✅ Config:', settings.PROJECT_NAME)
print('✅ Database:', get_db_info())
"
```

### 🚢 Развертывание

#### Development
```bash
python start.py
```

#### Production (Docker)
```bash
docker build -t mpsystem-backend .
docker run -p 8000:8000 mpsystem-backend
```

#### Production (Systemd)
```bash
# Создайте systemd service
sudo nano /etc/systemd/system/mpsystem.service
sudo systemctl enable mpsystem
sudo systemctl start mpsystem
```

### 📝 Логи

Все логи содержат:
- Timestamp
- Уровень лога
- HTTP метод и путь
- Статус код ответа
- Время обработки запроса

### ⚡ Производительность

- Connection pooling для PostgreSQL
- Async/await готовность
- Request timing middleware
- Health check endpoints

### 🔄 Миграции

```bash
# Создать миграцию
alembic revision --autogenerate -m "Description"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

---

## ✅ Все настроено и готово к использованию!

- ✅ PostgreSQL подключение настроено
- ✅ SQLite fallback работает
- ✅ CORS middleware подключен
- ✅ Логирование настроено
- ✅ Health checks работают
- ✅ Security headers активны
- ✅ Environment переменные готовы