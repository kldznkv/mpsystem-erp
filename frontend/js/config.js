// Configuration settings for MP System ERP
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:3000/api',
        TIMEOUT: 5000,
        ENDPOINTS: {
            AUTH: '/auth',
            USERS: '/users',
            INVENTORY: '/inventory',
            SALES: '/sales',
            REPORTS: '/reports'
        }
    },
    
    // Application settings
    APP: {
        NAME: 'MP System ERP',
        VERSION: '1.0.0',
        LANGUAGE: 'ru',
        THEME: 'default'
    },
    
    // UI Configuration
    UI: {
        PAGINATION_SIZE: 20,
        TOAST_DURATION: 3000,
        ANIMATION_SPEED: 300
    },
    
    // Date and time format
    DATE_FORMAT: 'DD.MM.YYYY',
    TIME_FORMAT: 'HH:mm:ss',
    
    // Debug mode
    DEBUG: true
};

// Export for modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}