# MPSYSTEM - Material Production System

## 🏭 Описание проекта

MPSYSTEM - это веб-платформа для управления производством упаковочных материалов, включающая управление двумя основными линиями:
- **Экструзия** (4 линии + 2 резки + лаборатория)
- **Ламинация** (1 линия + резка)
- **Печать** (2 линии: флексо + цифровая)

## 🚀 Быстрый старт

### Frontend (GitHub Pages)
Проект доступен по адресу: https://kldznkv.github.io/mpsystem-erp/

### Локальная разработка

```bash
# Клонирование репозитория
git clone https://github.com/kldznkv/mpsystem-erp.git
cd mpsystem-erp

# Запуск frontend
cd frontend
# Откройте index.html в браузере

# Запуск backend (опционально)
cd ../backend
npm install
npm run dev
```

## 📁 Структура проекта

```
MPSYSTEM/
├── README.md                 # Описание проекта
├── TECH-SPEC.md             # Техническое задание
├── .cursor-context/         # Контекст для AI
│   ├── project-overview.md
│   ├── business-logic.md
│   └── api-endpoints.md
├── frontend/                # Фронтенд приложения
│   ├── index.html          # Главная страница
│   ├── css/
│   │   └── styles.css      # Стили приложения
│   ├── js/
│   │   ├── app.js          # Основная логика
│   │   ├── config.js       # Конфигурация
│   │   └── modules/        # Модули функциональности
│   └── assets/             # Статические ресурсы
├── backend/                # Бэкенд API
│   ├── src/
│   │   ├── controllers/    # Контроллеры API
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # Маршруты API
│   │   ├── services/       # Бизнес-логика
│   │   └── middleware/     # Промежуточное ПО
│   ├── database/
│   │   ├── migrations/     # Миграции БД
│   │   └── seeds/          # Начальные данные
│   ├── tests/              # Тесты
│   ├── package.json        # Зависимости
│   └── server.js           # Главный файл сервера
└── docs/                   # Документация
    ├── api-documentation.md
    └── user-manual.md
```

## 🛠 Технологии

### Frontend
- **HTML5** - структура приложения
- **CSS3** - стилизация (система дизайна на базе Inter)
- **Vanilla JavaScript** - логика приложения
- **LocalStorage** - локальное хранение данных

### Backend
- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **Sequelize** - ORM для работы с БД
- **SQLite/PostgreSQL** - база данных
- **JWT** - аутентификация

### DevOps
- **GitHub Pages** - хостинг frontend
- **GitHub Actions** - CI/CD
- **Docker** - контейнеризация

## 📊 Основные модули

### 1. Dashboard (Главная панель)
- Мониторинг ключевых метрик
- Обзор производственных линий
- Критические уведомления
- OEE метрики

### 2. Planning (Планирование)
- Планирование производства
- Оптимизация очередности заказов
- Управление временными интервалами
- Система рекомендаций

### 3. Orders (Заказы)
- Создание и управление заказами
- Отслеживание статусов
- Ценообразование
- Available-to-Promise (ATP)

### 4. Inventory (Склад)
- Управление материалами
- Контроль критических остатков
- Движения материалов
- Инвентаризация

### 5. Production (Производство)
- Мониторинг линий
- Контроль качества
- Отслеживание OEE
- Управление сменами

### 6. Purchasing (Закупки)
- MRP планирование
- Управление поставщиками
- Заказы на поставку
- Контроль поставок

### 7. Quality (Качество)
- Контроль качества
- Протоколы испытаний
- Управление несоответствиями

### 8. Analytics (Аналитика)
- Отчеты по производству
- Аналитика эффективности
- Финансовые показатели

## 🔧 API Endpoints

### Materials
- `GET /api/materials` - получить все материалы
- `POST /api/materials` - создать материал
- `PUT /api/materials/:id` - обновить материал
- `DELETE /api/materials/:id` - удалить материал

### Orders
- `GET /api/orders` - получить все заказы
- `POST /api/orders` - создать заказ
- `PUT /api/orders/:id` - обновить заказ
- `DELETE /api/orders/:id` - удалить заказ

### Production
- `GET /api/production/lines` - статус линий
- `POST /api/production/jobs` - создать задание
- `PUT /api/production/lines/:id/status` - изменить статус

## 🎨 Дизайн-система

### Цветовая палитра
- **Основной**: #3b82f6 (синий)
- **Успех**: #10b981 (зеленый)
- **Предупреждение**: #f59e0b (оранжевый)
- **Ошибка**: #ef4444 (красный)
- **Фон**: #f8fafc (светло-серый)

### Типографика
- **Основной шрифт**: Inter
- **Размеры**: 12px, 14px, 16px, 18px, 20px, 24px

### Компоненты
- Карточки метрик
- Таблицы данных
- Боковые панели
- Модальные окна
- Статусные бейджи

## 📈 Развертывание

### GitHub Pages (Production)
Автоматическое развертывание при push в main ветку:
```bash
git push origin main
```

### Локальная разработка Backend
```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

## 🧪 Тестирование

```bash
# Backend тесты
cd backend
npm test

# Покрытие кода
npm run test:coverage
```

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 👥 Команда разработки

- **Frontend**: Vanilla JS + CSS3
- **Backend**: Node.js + Express.js
- **Database**: SQLite/PostgreSQL
- **Deployment**: GitHub Pages + Actions

## 🔗 Полезные ссылки

- [Техническое задание](TECH-SPEC.md)
- [API документация](docs/api-documentation.md)
- [Руководство пользователя](docs/user-manual.md)
- [Демо версия](https://kldznkv.github.io/mpsystem-erp/)

---

© 2024 MPSYSTEM Development Team