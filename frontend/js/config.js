// MPSYSTEM Configuration
const CONFIG = {
    APP_NAME: 'MPSYSTEM',
    VERSION: '1.0.0',
    DESCRIPTION: 'Веб-платформа для управления производством упаковочных материалов',
    
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' ? 
        'http://localhost:8000' : 
        'https://kldznkv.github.io/mpsystem-erp',
    
    // GitHub Pages static API endpoints
    STATIC_API: {
        MATERIALS: '/api/materials.json',
        SUPPLIERS: '/api/suppliers.json',
        ORDERS: '/api/orders.json',
        INVENTORY: '/api/inventory.json',
        PRODUCTION: '/api/production.json'
    },
    
    // Application Settings
    SETTINGS: {
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        MAX_ITEMS_PER_PAGE: 50,
        DEFAULT_LANGUAGE: 'ru',
        ENABLE_NOTIFICATIONS: true,
        ENABLE_SOUND: false
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
    
    // Status Colors
    STATUS_COLORS: {
        running: '#10b981',
        idle: '#f59e0b',
        maintenance: '#ef4444',
        setup: '#8b5cf6',
        stopped: '#6b7280'
    },
    
    // Priority Colors
    PRIORITY_COLORS: {
        low: '#10b981',
        normal: '#6b7280',
        high: '#f59e0b',
        urgent: '#ef4444'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}