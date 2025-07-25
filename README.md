# 🏭 MPSYSTEM - Production ERP System

**Комплексная система управления производством упаковочных материалов**

[![Deploy Status](https://img.shields.io/badge/deployment-active-brightgreen)](https://kldznkv.github.io/mpsystem-erp/)
[![Frontend](https://img.shields.io/badge/frontend-github%20pages-blue)](https://kldznkv.github.io/mpsystem-erp/)
[![Backend](https://img.shields.io/badge/backend-fastapi-green)](http://localhost:8000/docs)

## 🌐 Live Demo

🔗 **Frontend**: https://kldznkv.github.io/mpsystem-erp/

🔗 **Static API**: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/

📚 **API Documentation**: http://localhost:8000/docs (при запуске локального backend)

## 🎯 Основные возможности

### 📊 Dashboard (Главная панель)
- **4 ключевые метрики**: заказы (847), загрузка (94.2%), эффективность (87.3%), качество (99.1%)
- **Производственные линии**: экструзия, ламинация, печать
- **Критические уведомления** с интерактивными действиями
- **Автообновление каждые 30 секунд** (согласно ТЗ)

### ⚙️ Производственные линии
- **🔄 Экструзия**: 4 линии + 2 резки + лаборатория
- **📄 Ламинация**: 1 линия + резка
- **🎨 Печать**: флексопечать + цифровая печать
- **Интерактивные действия**: пауза, старт, приоритет, наладка

### 📦 Управление данными
- **Материалы и поставщики**
- **Заказы и производственная очередь**
- **Складские остатки с резервированием**
- **Бизнес-логика order-to-production**

## 🚀 Быстрый старт

### ⚡ GitHub Pages (рекомендуется)
Просто перейдите по ссылке: https://kldznkv.github.io/mpsystem-erp/

**Backend уже работает на GitHub Pages!** 
- 📊 **Метрики**: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/metrics.json
- ⚙️ **Линии**: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/production-lines.json
- 🚨 **Уведомления**: https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/alerts.json

### 🔧 Локальный Backend (опционально)

```bash
# 1. Установка зависимостей
pip install -r requirements.txt

# 2. Запуск backend сервера
python start_backend.py
```

Локальный backend будет доступен на:
- 🌐 **API**: http://localhost:8000
- 📚 **Документация**: http://localhost:8000/docs
- 🔍 **Статус**: http://localhost:8000/api/v1/dashboard/system/status

## 🔧 Backend на GitHub Pages

### 🎯 Как это работает

MPSYSTEM использует **статические JSON файлы** для имитации backend API на GitHub Pages:

1. **GitHub Actions** автоматически генерируют JSON файлы при каждом push
2. **Frontend** получает данные из статических файлов
3. **Fallback** на локальные данные если API недоступно

### 📊 Статические API файлы

| Файл | URL | Описание |
|------|-----|----------|
| `metrics.json` | [🔗](https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/metrics.json) | Ключевые метрики |
| `production-lines.json` | [🔗](https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/production-lines.json) | Статус линий |
| `alerts.json` | [🔗](https://kldznkv.github.io/mpsystem-erp/api/v1/dashboard/alerts.json) | Критические уведомления |

### 🔄 Интеграция в коде

Frontend автоматически загружает данные из GitHub Pages API:

```javascript
// В функции updateDashboardStats() замените на:
async function updateDashboardStats() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/dashboard/metrics');
        const metrics = await response.json();
        
        document.getElementById('totalOrders').textContent = metrics.orders_active;
        document.getElementById('productionCapacity').textContent = metrics.production_capacity + '%';
        document.getElementById('oeeMetric').textContent = metrics.oee_efficiency + '%';
        document.getElementById('qualityRate').textContent = metrics.quality_pass_rate + '%';
    } catch (error) {
        console.log('Using fallback data (backend not connected)');
        // Fallback to current static data
    }
}

// Для производственных линий:
async function loadProductionLines() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/dashboard/production-lines');
        const lines = await response.json();
        // Render production lines from API
        renderProductionLines(lines);
    } catch (error) {
        console.log('Using fallback production lines data');
    }
}

// Для критических уведомлений:
async function loadCriticalAlerts() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/dashboard/alerts');
        const alerts = await response.json();
        renderCriticalAlerts(alerts);
    } catch (error) {
        console.log('Using fallback alerts data');
    }
}
```

### API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /api/v1/dashboard/metrics` | Получить 4 ключевые метрики |
| `GET /api/v1/dashboard/production-lines` | Статус всех производственных линий |
| `GET /api/v1/dashboard/alerts` | Критические уведомления |
| `GET /api/v1/dashboard/overview` | Полный обзор dashboard |
| `POST /api/v1/dashboard/line/{line_id}/action` | Выполнить действие на линии |
| `POST /api/v1/dashboard/alert/{alert_id}/action` | Выполнить действие по уведомлению |

## 🏗️ Архитектура проекта

```
mpsystem-erp/
├── index.html              # 🌐 Frontend (SPA с интегрированными CSS/JS)
├── backend/                 # 🚀 FastAPI Backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── models/         # SQLAlchemy модели
│   │   ├── schemas/        # Pydantic схемы
│   │   ├── services/       # Бизнес-логика
│   │   ├── core/           # Конфигурация
│   │   └── db/             # База данных
│   └── tests/              # Тесты
├── start_backend.py        # 🔄 Скрипт запуска
├── requirements.txt        # 📦 Зависимости
└── README.md              # 📖 Документация
```

## 🛠️ Технологии

### Frontend
- **HTML5** + **CSS3** (Grid, Flexbox)
- **Vanilla JavaScript** (ES6+)
- **Responsive Design**
- **GitHub Pages** для хостинга

### Backend
- **FastAPI** (Python 3.8+)
- **SQLAlchemy** + **Alembic**
- **Pydantic** для валидации
- **SQLite** (разработка) / **PostgreSQL** (продакшн)
- **Uvicorn** ASGI сервер

## 📈 Возможности развития

### Готовые модули для расширения:
- **📋 Планирование** - календарь производства, оптимизация ресурсов
- **🔬 Качество** - тестирование материалов, контроль параметров
- **🔧 ТО** - планирование обслуживания, учет запчастей
- **📈 Расширенная аналитика** - детальные отчеты, прогнозирование

### API Extensions:
- **WebSocket** для real-time обновлений
- **Аутентификация** и роли пользователей
- **Интеграция** с внешними системами
- **Экспорт данных** в Excel/PDF

## 🔗 Полезные ссылки

- 🌐 **Live Demo**: https://kldznkv.github.io/mpsystem-erp/
- 📚 **API Docs**: http://localhost:8000/docs
- 🐛 **Issues**: [GitHub Issues](https://github.com/kldznkv/mpsystem-erp/issues)
- 📞 **Support**: [Discussions](https://github.com/kldznkv/mpsystem-erp/discussions)

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

---

**🏭 MPSYSTEM - Ваша производственная эффективность!** 🚀