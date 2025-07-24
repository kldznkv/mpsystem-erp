# MP System ERP API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All API requests (except login and health check) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### POST /auth/login

Login to the system.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mpsystem.com",
    "role": "administrator"
  }
}
```

### POST /auth/logout

Logout from the system.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /auth/profile

Get current user profile.

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mpsystem.com",
    "role": "administrator"
  }
}
```

## Inventory Management

### GET /inventory

Get all inventory items with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `search` (optional): Search in name, description, SKU

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Товар 1",
      "description": "Описание товара 1",
      "sku": "SKU001",
      "quantity": 100,
      "price": 1500,
      "cost": 1000,
      "category": "Категория А",
      "supplier": "Поставщик 1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### GET /inventory/:id

Get single inventory item by ID.

**Response:**
```json
{
  "id": 1,
  "name": "Товар 1",
  "description": "Описание товара 1",
  "sku": "SKU001",
  "quantity": 100,
  "price": 1500,
  "cost": 1000,
  "category": "Категория А",
  "supplier": "Поставщик 1",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /inventory

Create new inventory item.

**Request Body:**
```json
{
  "name": "Новый товар",
  "description": "Описание нового товара",
  "sku": "SKU004",
  "quantity": 50,
  "price": 1800,
  "cost": 1200,
  "category": "Категория С",
  "supplier": "Поставщик 3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "item": {
    "id": 4,
    "name": "Новый товар",
    "description": "Описание нового товара",
    "sku": "SKU004",
    "quantity": 50,
    "price": 1800,
    "cost": 1200,
    "category": "Категория С",
    "supplier": "Поставщик 3",
    "createdAt": "2024-01-18T10:00:00.000Z",
    "updatedAt": "2024-01-18T10:00:00.000Z"
  }
}
```

### PUT /inventory/:id

Update inventory item.

**Request Body:**
```json
{
  "name": "Обновленный товар",
  "quantity": 75,
  "price": 1600
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "item": {
    "id": 1,
    "name": "Обновленный товар",
    "quantity": 75,
    "price": 1600,
    "updatedAt": "2024-01-18T10:30:00.000Z"
  }
}
```

### DELETE /inventory/:id

Delete inventory item.

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "item": {
    "id": 1,
    "name": "Товар 1"
  }
}
```

### GET /inventory/stats/summary

Get inventory statistics.

**Response:**
```json
{
  "summary": {
    "totalItems": 3,
    "totalQuantity": 225,
    "totalValue": 385000,
    "lowStockItems": 0
  },
  "categoryStats": [
    {
      "category": "Категория А",
      "itemCount": 2,
      "totalQuantity": 175,
      "totalValue": 240000
    }
  ]
}
```

## Sales Management

### GET /sales

Get all sales with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `search` (optional): Search in customer name/email

**Response:**
```json
{
  "sales": [
    {
      "id": 1,
      "date": "2024-01-15",
      "customerName": "Иван Иванов",
      "customerEmail": "ivan@example.com",
      "items": [
        {
          "id": 1,
          "name": "Товар 1",
          "quantity": 2,
          "price": 1500,
          "total": 3000
        }
      ],
      "subtotal": 5000,
      "tax": 500,
      "discount": 0,
      "total": 5500,
      "status": "completed",
      "paymentMethod": "card",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### GET /sales/:id

Get single sale by ID.

### POST /sales

Create new sale.

**Request Body:**
```json
{
  "customerName": "Новый клиент",
  "customerEmail": "client@example.com",
  "items": [
    {
      "id": 1,
      "name": "Товар 1",
      "quantity": 2,
      "price": 1500
    },
    {
      "id": 2,
      "name": "Товар 2",
      "quantity": 1,
      "price": 2000
    }
  ],
  "discount": 100,
  "paymentMethod": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sale created successfully",
  "sale": {
    "id": 4,
    "date": "2024-01-18",
    "customerName": "Новый клиент",
    "customerEmail": "client@example.com",
    "items": [
      {
        "id": 1,
        "name": "Товар 1",
        "quantity": 2,
        "price": 1500,
        "total": 3000
      },
      {
        "id": 2,
        "name": "Товар 2",
        "quantity": 1,
        "price": 2000,
        "total": 2000
      }
    ],
    "subtotal": 5000,
    "tax": 500,
    "discount": 100,
    "total": 5400,
    "status": "completed",
    "paymentMethod": "cash",
    "createdAt": "2024-01-18T11:00:00.000Z"
  }
}
```

### PUT /sales/:id

Update sale.

### DELETE /sales/:id

Delete sale.

### GET /sales/stats/summary

Get sales statistics.

**Query Parameters:**
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response:**
```json
{
  "summary": {
    "totalSales": 3,
    "totalRevenue": 15410,
    "averageOrderValue": 5136.67,
    "completedSales": 2,
    "pendingSales": 1
  },
  "dailySales": {
    "2024-01-15": {
      "count": 1,
      "revenue": 5500
    },
    "2024-01-16": {
      "count": 1,
      "revenue": 5510
    },
    "2024-01-17": {
      "count": 1,
      "revenue": 4400
    }
  },
  "paymentMethods": {
    "card": {
      "count": 1,
      "revenue": 5500
    },
    "cash": {
      "count": 1,
      "revenue": 5510
    },
    "bank_transfer": {
      "count": 1,
      "revenue": 4400
    }
  }
}
```

## User Management

### GET /users

Get all users with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `search` (optional): Search in username, email, name

### GET /users/:id

Get single user by ID.

### POST /users

Create new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "firstName": "Новый",
  "lastName": "Пользователь",
  "password": "password123",
  "role": "employee"
}
```

### PUT /users/:id

Update user.

### DELETE /users/:id

Delete user.

### PUT /users/:id/password

Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### GET /users/stats/summary

Get user statistics.

## Reports

### GET /reports/inventory

Generate inventory report.

**Query Parameters:**
- `category` (optional): Filter by category
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `format` (optional): Report format (json, csv)

### GET /reports/sales

Generate sales report.

**Query Parameters:**
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `status` (optional): Filter by status
- `format` (optional): Report format

### GET /reports/financial

Generate financial report.

### GET /reports/dashboard

Generate dashboard summary report.

### GET /reports/export/:type

Export report in different formats.

**Path Parameters:**
- `type`: Report type (inventory, sales, financial)

**Query Parameters:**
- `format`: Export format (csv, excel, pdf)

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Required field is missing"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Versioning

Current API version: v1

All endpoints are prefixed with `/api/v1/` (currently just `/api/`)

## Health Check

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-18T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```