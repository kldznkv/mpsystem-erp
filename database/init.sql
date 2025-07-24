-- MP System ERP Database Initialization Script
-- This script creates the basic database structure for PostgreSQL/MySQL

-- Create database (uncomment if needed)
-- CREATE DATABASE mpsystem_erp;

-- Use database
-- USE mpsystem_erp;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('administrator', 'manager', 'employee', 'user')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10,2) DEFAULT 0 CHECK (cost >= 0),
    category VARCHAR(50) DEFAULT 'Без категории',
    supplier VARCHAR(100),
    min_stock_level INTEGER DEFAULT 5 CHECK (min_stock_level >= 0),
    max_stock_level INTEGER DEFAULT 1000 CHECK (max_stock_level >= 1),
    unit VARCHAR(20) DEFAULT 'шт',
    barcode VARCHAR(50),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'discontinued')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    sale_date DATE DEFAULT CURRENT_DATE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
    discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'check', 'online')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'failed')),
    notes TEXT,
    sales_person VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    item_name VARCHAR(100) NOT NULL,
    item_sku VARCHAR(50),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('inventory', 'sales', 'financial', 'dashboard', 'user_activity', 'profit_loss', 'tax', 'custom')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    filters JSON,
    data JSON NOT NULL,
    generated_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed', 'expired')),
    format VARCHAR(10) DEFAULT 'json' CHECK (format IN ('json', 'csv', 'excel', 'pdf')),
    file_path VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory history table (for tracking changes)
CREATE TABLE IF NOT EXISTS inventory_history (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    old_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    reason VARCHAR(100) DEFAULT 'manual_adjustment',
    changed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory_items(quantity);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_total ON sales(total);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_inventory_id ON sale_items(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);

CREATE INDEX IF NOT EXISTS idx_inventory_history_item_id ON inventory_history(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at);

-- Insert default admin user (password should be hashed in real application)
INSERT INTO users (username, email, first_name, last_name, password_hash, role)
VALUES ('admin', 'admin@mpsystem.com', 'Администратор', 'Системы', '$2a$10$N9qo8uLOickgx2ZMRZoMye.FH6yx.OPG/.id.X.Q.X6ZK6ZjJZOG.', 'administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_items (name, description, sku, quantity, price, cost, category, supplier)
VALUES 
    ('Товар 1', 'Описание товара 1', 'SKU001', 100, 1500.00, 1000.00, 'Категория А', 'Поставщик 1'),
    ('Товар 2', 'Описание товара 2', 'SKU002', 50, 2000.00, 1500.00, 'Категория В', 'Поставщик 2'),
    ('Товар 3', 'Описание товара 3', 'SKU003', 75, 1200.00, 800.00, 'Категория А', 'Поставщик 1')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample sales
INSERT INTO sales (sale_date, customer_name, customer_email, subtotal, tax, total, status, payment_method)
VALUES 
    ('2024-01-15', 'Иван Иванов', 'ivan@example.com', 5000.00, 500.00, 5500.00, 'completed', 'card'),
    ('2024-01-16', 'Мария Петрова', 'maria@example.com', 5100.00, 510.00, 5510.00, 'completed', 'cash'),
    ('2024-01-17', 'Алексей Сидоров', 'alex@example.com', 4000.00, 400.00, 4400.00, 'pending', 'bank_transfer');

-- Note: In a production environment, you should:
-- 1. Use proper password hashing (bcrypt, scrypt, etc.)
-- 2. Set up proper database user permissions
-- 3. Configure SSL/TLS for database connections
-- 4. Set up database backups
-- 5. Configure monitoring and logging