# MP System ERP

Система управления ресурсами предприятия (Enterprise Resource Planning) для малого и среднего бизнеса.

## Возможности

- **Управление складом**: Учет товаров, контроль остатков, уведомления о низких запасах
- **Управление продажами**: Создание заказов, обработка платежей, история транзакций
- **Отчетность**: Аналитические отчеты по продажам, финансам и складским операциям
- **Управление пользователями**: Роли и права доступа
- **Панель управления**: Обзор ключевых показателей бизнеса

## Технологии

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Адаптивный дизайн
- SPA архитектура

### Backend
- Node.js
- Express.js
- RESTful API
- JWT аутентификация

### База данных
- Поддержка MongoDB, PostgreSQL, MySQL
- Схемы данных для всех основных сущностей

## Структура проекта

```
mpsystem-erp/
├── frontend/                  # Фронтенд приложение
│   ├── index.html            # Главная страница
│   ├── css/
│   │   └── styles.css        # Стили
│   ├── js/
│   │   ├── app.js            # Основная логика
│   │   ├── config.js         # Конфигурация
│   │   └── data.js           # Управление данными
│   └── assets/               # Статические файлы
├── backend/                  # Серверная часть
│   ├── package.json          # Зависимости
│   ├── server.js             # Главный файл сервера
│   └── src/
│       ├── controllers/      # Контроллеры
│       ├── models/           # Модели данных
│       └── routes/           # Маршруты API
├── database/                 # Скрипты БД
├── docs/                     # Документация
└── tests/                    # Тесты
```

## Установка и запуск

### Требования
- Node.js 16+ 
- npm или yarn
- База данных (MongoDB/PostgreSQL/MySQL)

### Установка зависимостей

```bash
cd mpsystem-erp/backend
npm install
```

### Настройка окружения

1. Скопируйте файл `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл с вашими настройками:
```env
NODE_ENV=development
PORT=3000
DB_URL=mongodb://localhost:27017/mpsystem_erp
JWT_SECRET=your-secret-key
```

### Запуск сервера

#### Режим разработки
```bash
npm run dev
```

#### Продакшн режим
```bash
npm start
```

### Запуск фронтенда

Откройте `frontend/index.html` в браузере или используйте локальный веб-сервер:

```bash
# Используя Python
cd frontend
python -m http.server 8000

# Используя Node.js (http-server)
npx http-server frontend -p 8000
```

## API Документация

### Аутентификация

#### POST /api/auth/login
Вход в систему

**Тело запроса:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "administrator"
  }
}
```

### Управление складом

#### GET /api/inventory
Получить список товаров

**Параметры:**
- `page` - номер страницы
- `limit` - количество элементов на странице
- `category` - фильтр по категории
- `search` - поиск по названию/артикулу

#### POST /api/inventory
Создать новый товар

**Тело запроса:**
```json
{
  "name": "Новый товар",
  "sku": "SKU004",
  "quantity": 100,
  "price": 1500,
  "category": "Категория А"
}
```

### Управление продажами

#### GET /api/sales
Получить список продаж

#### POST /api/sales
Создать новую продажу

**Тело запроса:**
```json
{
  "customerName": "Иван Иванов",
  "items": [
    {
      "id": 1,
      "name": "Товар 1",
      "quantity": 2,
      "price": 1500
    }
  ],
  "paymentMethod": "cash"
}
```

### Отчеты

#### GET /api/reports/inventory
Отчет по складу

#### GET /api/reports/sales
Отчет по продажам

#### GET /api/reports/financial
Финансовый отчет

## Разработка

### Структура кода

- **Модели** (`/backend/src/models/`): Определения структур данных
- **Контроллеры** (`/backend/src/controllers/`): Бизнес-логика
- **Маршруты** (`/backend/src/routes/`): API endpoints
- **Frontend** (`/frontend/`): Клиентская часть

### Добавление новых функций

1. Создайте модель в `/backend/src/models/`
2. Добавьте маршруты в `/backend/src/routes/`
3. Реализуйте контроллер в `/backend/src/controllers/`
4. Обновите фронтенд в `/frontend/js/`

### Тестирование

```bash
npm test
```

### Линтинг

```bash
npm run lint
```

## Конфигурация

### Переменные окружения

Основные настройки в файле `.env`:

- `NODE_ENV` - режим работы (development/production)
- `PORT` - порт сервера
- `DB_URL` - строка подключения к БД
- `JWT_SECRET` - секретный ключ для JWT
- `CORS_ORIGIN` - разрешенные домены для CORS

### База данных

Система поддерживает несколько типов БД:

#### MongoDB
```env
DB_URL=mongodb://localhost:27017/mpsystem_erp
```

#### PostgreSQL
```env
DB_URL=postgresql://user:password@localhost:5432/mpsystem_erp
```

#### MySQL
```env
DB_URL=mysql://user:password@localhost:3306/mpsystem_erp
```

## Деплой

### Docker

```bash
# Собрать образ
docker build -t mpsystem-erp .

# Запустить контейнер
docker run -p 3000:3000 -e NODE_ENV=production mpsystem-erp
```

### Docker Compose

```bash
docker-compose up -d
```

### Обычный деплой

1. Установите зависимости: `npm install --production`
2. Настройте переменные окружения
3. Запустите сервер: `npm start`

## Безопасность

- Все пароли должны быть захешированы
- Используйте HTTPS в продакшне
- Настройте CORS правильно
- Регулярно обновляйте зависимости
- Используйте сильные JWT секреты

## Лицензия

MIT License - подробности в файле [LICENSE](LICENSE)

## Поддержка

Для вопросов и предложений создавайте issues в репозитории.

## Changelog

### v1.0.0
- Базовая функциональность ERP системы
- Управление складом и продажами
- Система отчетов
- Аутентификация пользователей