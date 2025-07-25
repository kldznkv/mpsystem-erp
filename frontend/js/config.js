// MPSYSTEM Configuration
const CONFIG = {
    APP_NAME: 'MPSYSTEM',
    VERSION: '1.0.0',
    DESCRIPTION: 'Веб-платформа для управления производством упаковочных материалов',
    
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' ? 
        'http://localhost:8000' : 
        'https://kldznkv.github.io/mpsystem-erp',
    
    // API Endpoints
    API_ENDPOINTS: {
        // Orders
        ORDERS: '/api/v1/orders',
        ORDER_BY_ID: (id) => `/api/v1/orders/${id}`,
        ORDER_PROGRESS: (id) => `/api/v1/orders/${id}/progress`,
        
        // Dashboard
        DASHBOARD_METRICS: '/api/v1/dashboard/metrics',
        DASHBOARD_ORDERS: '/api/v1/dashboard/orders',
        
        // Health and Status
        HEALTH: '/health',
        DB_STATS: '/db-stats',
        
        // Future endpoints
        MATERIALS: '/api/v1/materials',
        SUPPLIERS: '/api/v1/suppliers',
        INVENTORY: '/api/v1/inventory',
        PRODUCTION: '/api/v1/production'
    },
    
    // GitHub Pages static API endpoints (fallback)
    STATIC_API: {
        MATERIALS: '/api/materials.json',
        SUPPLIERS: '/api/suppliers.json',
        ORDERS: '/api/orders.json',
        INVENTORY: '/api/inventory.json',
        PRODUCTION: '/api/production.json'
    },
    
    // Order Status Configuration
    ORDER_STATUS: {
        NEW: {
            value: 'new',
            label: 'Новый',
            color: '#3b82f6',
            bgColor: '#dbeafe'
        },
        CONFIRMED: {
            value: 'confirmed',
            label: 'Подтвержден',
            color: '#1d4ed8',
            bgColor: '#dbeafe'
        },
        PLANNED: {
            value: 'planned',
            label: 'Запланирован',
            color: '#7c3aed',
            bgColor: '#f3e8ff'
        },
        IN_PRODUCTION: {
            value: 'in_production',
            label: 'В производстве',
            color: '#059669',
            bgColor: '#d1fae5'
        },
        COMPLETED: {
            value: 'completed',
            label: 'Завершен',
            color: '#0284c7',
            bgColor: '#f0f9ff'
        },
        SHIPPED: {
            value: 'shipped',
            label: 'Отгружен',
            color: '#065f46',
            bgColor: '#d1fae5'
        }
    },
    
    // Order Priority Configuration
    ORDER_PRIORITY: {
        LOW: {
            value: 'low',
            label: 'Низкий',
            color: '#059669',
            bgColor: '#d1fae5'
        },
        NORMAL: {
            value: 'normal',
            label: 'Обычный',
            color: '#6b7280',
            bgColor: '#f1f5f9'
        },
        HIGH: {
            value: 'high',
            label: 'Высокий',
            color: '#d97706',
            bgColor: '#fef3c7'
        },
        URGENT: {
            value: 'urgent',
            label: 'Срочный',
            color: '#dc2626',
            bgColor: '#fecaca'
        }
    },
    
    // Order Units
    ORDER_UNITS: {
        PCS: { value: 'pcs', label: 'шт' },
        KG: { value: 'kg', label: 'кг' },
        M: { value: 'm', label: 'м' },
        M2: { value: 'm2', label: 'м²' },
        L: { value: 'l', label: 'л' },
        TON: { value: 'ton', label: 'т' }
    },
    
    // Application Settings
    SETTINGS: {
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        MAX_ITEMS_PER_PAGE: 50,
        DEFAULT_PAGE_SIZE: 20,
        DEFAULT_LANGUAGE: 'ru',
        ENABLE_NOTIFICATIONS: true,
        ENABLE_SOUND: false,
        REQUEST_TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3
    },
    
    // Production Lines Configuration
    PRODUCTION_LINES: {
        EXTRUSION: {
            lines: 4,
            cutting: 2,
            laboratory: 1
        },
        LAMINATION: {
            lines: 1,
            cutting: 1
        },
        PRINTING: {
            flexo: 1,
            digital: 1
        }
    },
    
    // Status Colors (legacy support)
    STATUS_COLORS: {
        running: '#10b981',
        idle: '#f59e0b',
        maintenance: '#ef4444',
        setup: '#8b5cf6',
        stopped: '#6b7280'
    },
    
    // Priority Colors (legacy support)
    PRIORITY_COLORS: {
        low: '#10b981',
        normal: '#6b7280',
        high: '#f59e0b',
        urgent: '#ef4444'
    },
    
    // API Request Configuration
    API_CONFIG: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 10000,
        retries: 3
    },
    
    // Pagination Configuration
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_SIZE: 20,
        MAX_SIZE: 100,
        SIZE_OPTIONS: [10, 20, 50, 100]
    },
    
    // Date Format Configuration
    DATE_FORMATS: {
        DISPLAY: 'DD.MM.YYYY',
        API: 'YYYY-MM-DD',
        DATETIME_DISPLAY: 'DD.MM.YYYY HH:mm',
        DATETIME_API: 'YYYY-MM-DDTHH:mm:ss'
    },
    
    // Number Format Configuration
    NUMBER_FORMATS: {
        CURRENCY: {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2
        },
        PERCENTAGE: {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        },
        QUANTITY: {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }
    },
    
    // Client Configuration
    CLIENT_CONFIG: {
        // Known clients for autocomplete
        KNOWN_CLIENTS: [
            { id: 'ML-001', name: 'MLEKOVITA' },
            { id: 'AG-001', name: 'AGRONA' },
            { id: 'LP-001', name: 'LACPOL' },
            { id: 'DN-001', name: 'DANONE' },
            { id: 'MZ-001', name: 'MONDELEZ' }
        ]
    },
    
    // Validation Rules
    VALIDATION: {
        ORDER_NUMBER_PATTERN: /^ZP-\d{4}\/\d{4}$/,
        CLIENT_ID_PATTERN: /^[A-Z]{2}-\d{3}$/,
        PRODUCT_ID_PATTERN: /^[A-Z]{3}-\d{3}$/,
        MAX_QUANTITY: 1000000,
        MIN_QUANTITY: 0.001,
        MAX_MARGIN: 100,
        MIN_MARGIN: 0
    }
};

// Helper Functions
CONFIG.HELPERS = {
    // Get status configuration by value
    getStatusConfig: (status) => {
        return Object.values(CONFIG.ORDER_STATUS).find(s => s.value === status) || CONFIG.ORDER_STATUS.NEW;
    },
    
    // Get priority configuration by value
    getPriorityConfig: (priority) => {
        return Object.values(CONFIG.ORDER_PRIORITY).find(p => p.value === priority) || CONFIG.ORDER_PRIORITY.NORMAL;
    },
    
    // Get unit configuration by value
    getUnitConfig: (unit) => {
        return Object.values(CONFIG.ORDER_UNITS).find(u => u.value === unit) || CONFIG.ORDER_UNITS.PCS;
    },
    
    // Build API URL
    buildApiUrl: (endpoint) => {
        return CONFIG.API_BASE_URL + endpoint;
    },
    
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('pl-PL', CONFIG.NUMBER_FORMATS.CURRENCY).format(amount);
    },
    
    // Format percentage
    formatPercentage: (value) => {
        return new Intl.NumberFormat('pl-PL', CONFIG.NUMBER_FORMATS.PERCENTAGE).format(value / 100);
    },
    
    // Format quantity
    formatQuantity: (quantity) => {
        return new Intl.NumberFormat('pl-PL', CONFIG.NUMBER_FORMATS.QUANTITY).format(quantity);
    },
    
    // Format date
    formatDate: (date, format = 'DISPLAY') => {
        if (!date) return '';
        const d = new Date(date);
        if (format === 'DISPLAY') {
            return d.toLocaleDateString('pl-PL');
        }
        return d.toISOString().split('T')[0];
    },
    
    // Calculate days until due
    calculateDaysUntilDue: (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    },
    
    // Check if order is overdue
    isOrderOverdue: (dueDate, status) => {
        const excludedStatuses = ['completed', 'shipped'];
        if (excludedStatuses.includes(status)) return false;
        return CONFIG.HELPERS.calculateDaysUntilDue(dueDate) < 0;
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}