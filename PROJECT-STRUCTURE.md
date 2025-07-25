# 📁 MPSYSTEM - Структура проекта

## 🎯 Обзор очищенной структуры

После очистки проект имеет четкую, логичную структуру без дублирований:

```
MPSYSTEM/
├── 📦 ROOT FILES
│   ├── README.md                    # Основная документация
│   ├── TECH-SPEC.md                # Техническое задание
│   ├── docker-compose.yml          # Docker конфигурация
│   ├── Dockerfile                  # Контейнер для backend
│   ├── .gitignore                  # Git исключения
│   └── LICENSE                     # Лицензия проекта
│
├── 🌐 frontend/                    # FRONTEND (GitHub Pages)
│   ├── index.html                  # ✅ Главная страница
│   ├── css/
│   │   └── styles.css              # ✅ Все стили (извлечены из HTML)
│   ├── js/
│   │   ├── app.js                  # ✅ Основная логика
│   │   ├── config.js               # ✅ Конфигурация
│   │   └── modules/                # Готово для модулей
│   └── assets/                     # Статические ресурсы
│
├── 🚀 backend/                     # BACKEND (FastAPI)
│   ├── src/app/                    # ✅ ОСНОВНАЯ СТРУКТУРА
│   │   ├── main.py                 # ✅ FastAPI точка входа
│   │   ├── api/v1/                 # API endpoints
│   │   │   ├── api.py              # Роутер API
│   │   │   └── endpoints/          # Все endpoints
│   │   ├── core/                   # Конфигурация
│   │   ├── db/                     # База данных
│   │   ├── models/                 # SQLAlchemy модели
│   │   ├── schemas/                # Pydantic схемы
│   │   ├── services/               # Бизнес-логика
│   │   └── utils/                  # Утилиты
│   ├── tests/                      # Тесты
│   ├── database/                   # Миграции и сиды
│   ├── start.py                    # ✅ Скрипт запуска
│   ├── server.js                   # Node.js сервер (альтернатива)
│   ├── package.json                # Node.js зависимости
│   └── requirements.txt            # ✅ Python зависимости
│
├── 📊 api/                         # СТАТИЧЕСКИЙ API (GitHub Pages)
│   └── v1/dashboard/               # JSON файлы для статического API
│
├── 🤖 .cursor-context/             # AI КОНТЕКСТ
│   ├── project-overview.md         # Обзор проекта
│   ├── business-logic.md           # Бизнес-логика
│   └── api-endpoints.md            # API документация
│
└── 📚 docs/                        # ДОКУМЕНТАЦИЯ
    ├── api-documentation.md        # API документация
    └── user-manual.md              # Руководство пользователя
```

## 🧹 Что было удалено

### Дублированные папки в backend/src/
- ❌ `backend/src/api/` → ✅ `backend/src/app/api/`
- ❌ `backend/src/core/` → ✅ `backend/src/app/core/`
- ❌ `backend/src/db/` → ✅ `backend/src/app/db/`
- ❌ `backend/src/models/` → ✅ `backend/src/app/models/`
- ❌ `backend/src/schemas/` → ✅ `backend/src/app/schemas/`
- ❌ `backend/src/services/` → ✅ `backend/src/app/services/`
- ❌ `backend/src/utils/` → ✅ `backend/src/app/utils/`

### Лишние файлы из корня
- ❌ `index.html` → ✅ `frontend/index.html`
- ❌ `server.py` → ✅ `backend/src/app/main.py`
- ❌ `start_backend.py` → ✅ `backend/start.py`

### Ненужные папки
- ❌ `backend/src/controllers/` (не используется в FastAPI)
- ❌ `backend/src/middleware/` (не используется в FastAPI)
- ❌ `backend/src/routes/` (не используется в FastAPI)

## 🔧 Как запустить

### Frontend (GitHub Pages)
```bash
# Уже доступен на GitHub Pages
https://kldznkv.github.io/mpsystem-erp/

# Или локально
cd frontend
python3 -m http.server 8080
```

### Backend (FastAPI)
```bash
cd backend

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python start.py

# Или напрямую
cd src && uvicorn app.main:app --reload
```

### Backend (Node.js) - альтернатива
```bash
cd backend
npm install
npm start
```

## 📋 Основные точки входа

| Компонент | Файл | Описание |
|-----------|------|----------|
| **Frontend** | `frontend/index.html` | Single Page Application |
| **FastAPI Backend** | `backend/src/app/main.py` | FastAPI приложение |
| **Node.js Backend** | `backend/server.js` | Express.js сервер |
| **Стили** | `frontend/css/styles.css` | Все CSS стили |
| **Логика** | `frontend/js/app.js` | Вся JavaScript логика |
| **Конфигурация** | `frontend/js/config.js` | Настройки приложения |

## 🎯 Преимущества новой структуры

1. **Нет дублирований** - каждый файл и папка имеют единственное назначение
2. **Четкое разделение** - frontend и backend полностью разделены
3. **FastAPI стандарт** - backend следует best practices FastAPI
4. **Модульность** - каждый компонент изолирован
5. **Документированность** - полная документация и контекст для AI

## 📊 Статистика проекта

- **Директорий**: 33
- **Python файлов**: 43 (backend)
- **JavaScript файлов**: 3 (frontend)
- **CSS файлов**: 1 (frontend)
- **HTML файлов**: 1 (frontend)
- **Markdown файлов**: 9 (документация)

## 🚀 Готово к развитию

Проект теперь имеет чистую архитектуру, готовую для:
- Добавления новых модулей в frontend/js/modules/
- Расширения API в backend/src/app/api/v1/endpoints/
- Написания тестов в backend/tests/
- Создания миграций в backend/database/migrations/
- Добавления документации в docs/

---

*Обновлено: 2024-07-25*  
*Статус: ✅ Очищена и оптимизирована*