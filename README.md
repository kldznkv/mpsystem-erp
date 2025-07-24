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
/
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
├── tests/                    # Тесты
└── README.md                 # Этот файл
```

## Быстрый старт

### Требования
- Node.js 16+ 
- npm или yarn
- База данных (MongoDB/PostgreSQL/MySQL)

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

```bash
cd backend
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками:
```env
NODE_ENV=development
PORT=3000
DB_URL=mongodb://localhost:27017/mpsystem_erp
JWT_SECRET=your-secret-key
```

### 3. Запуск сервера

```bash
cd backend

# Режим разработки
npm run dev

# Продакшн режим  
npm start
```

### 4. Запуск фронтенда

Откройте `frontend/index.html` в браузере или используйте локальный веб-сервер:

```bash
# Используя Python
cd frontend
python -m http.server 8000

# Используя Node.js (http-server)
npx http-server frontend -p 8000

# Используя PHP
cd frontend
php -S localhost:8000
```

### 5. Инициализация базы данных

```bash
# Для PostgreSQL/MySQL
psql -U username -d mpsystem_erp -f database/init.sql

# Или используйте ваш любимый клиент БД
```

## API Документация

### Базовый URL
`http://localhost:3000/api`

### Основные эндпоинты

#### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/profile` - Профиль пользователя

#### Склад
- `GET /api/inventory` - Список товаров
- `POST /api/inventory` - Создать товар
- `PUT /api/inventory/:id` - Обновить товар
- `DELETE /api/inventory/:id` - Удалить товар

#### Продажи
- `GET /api/sales` - Список продаж
- `POST /api/sales` - Создать продажу
- `PUT /api/sales/:id` - Обновить продажу

#### Отчеты
- `GET /api/reports/inventory` - Отчет по складу
- `GET /api/reports/sales` - Отчет по продажам
- `GET /api/reports/financial` - Финансовый отчет

**Полная документация**: [docs/API.md](docs/API.md)

## Разработка

### Структура кода

- **Frontend** (`/frontend/`): Клиентская часть SPA
- **Backend** (`/backend/`): API сервер на Express.js
- **Модели** (`/backend/src/models/`): Определения структур данных
- **Маршруты** (`/backend/src/routes/`): API endpoints
- **База данных** (`/database/`): SQL скрипты

### Добавление новых функций

1. **Модель**: Создайте модель в `/backend/src/models/`
2. **API**: Добавьте маршруты в `/backend/src/routes/`
3. **Frontend**: Обновите логику в `/frontend/js/`

### Тестирование

```bash
cd backend
npm test
```

### Линтинг

```bash
cd backend
npm run lint
```

## Конфигурация

### Переменные окружения

Основные настройки в файле `backend/.env`:

- `NODE_ENV` - режим работы (development/production)
- `PORT` - порт сервера (по умолчанию 3000)
- `DB_URL` - строка подключения к БД
- `JWT_SECRET` - секретный ключ для JWT
- `CORS_ORIGIN` - разрешенные домены для CORS

### Поддерживаемые базы данных

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

### Обычный деплой

1. Установите зависимости: `cd backend && npm install --production`
2. Настройте переменные окружения
3. Инициализируйте базу данных
4. Запустите сервер: `cd backend && npm start`
5. Настройте веб-сервер для фронтенда (nginx, apache)

## Демо данные

Система включает демо данные для быстрого тестирования:

- **Пользователь**: admin / admin123
- **Товары**: 3 образца товаров
- **Продажи**: История из 3 транзакций

## Безопасность

⚠️ **Важно для продакшна:**

- Измените JWT_SECRET на надежный ключ
- Используйте хеширование паролей (bcrypt)
- Настройте HTTPS
- Ограничьте CORS домены
- Регулярно обновляйте зависимости
- Настройте мониторинг и логирование

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
- API документация
- Демо данные