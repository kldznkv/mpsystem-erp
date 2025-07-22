// MPSYSTEM Configuration
const CONFIG = {
    // App info
    APP_NAME: 'MPSYSTEM',
    VERSION: '1.0.0',
    
    // API settings (for future use)
    USE_API: false,
    API_URL: 'https://api.mpsystem.com',
    
    // Update intervals (milliseconds)
    DASHBOARD_REFRESH: 30000, // 30 seconds
    PRODUCTION_REFRESH: 10000, // 10 seconds
    
    // Features
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: false,
    ENABLE_EXPORT: true,
    
    // Production settings
    WAREHOUSES: {
        MAG1: 'Raw Materials Storage',
        MAG1_1: 'ADR Storage (Paints/Adhesives)',
        MAG2: 'Extrusion Department',
        MAG3: 'UV Treatment',
        MAG4: 'Printing Department',
        MAG5: 'Lamination',
        MAG6: 'Barrier Coating',
        MAG7: 'Slitting',
        MAG8: 'Bag Making',
        MAG9: 'Finished Goods Storage'
    },
    
    // Production lines
    PRODUCTION_LINES: {
        EXT1: 'Extrusion Line 1',
        EXT2: 'Extrusion Line 2',
        EXT3: 'Extrusion Line 3',
        PRINT1: 'Flexo Printer 1',
        PRINT2: 'Flexo Printer 2',
        LAM1: 'Lamination Line 1'
    },
    
    // Quality statuses
    QUALITY_STATUS: {
        RELEASED: 'Released',
        TESTING: 'Under Testing',
        BLOCKED: 'Blocked',
        QUARANTINE: 'Quarantine'
    },
    
    // Order priorities
    PRIORITY_LEVELS: {
        URGENT: { value: 1, label: 'Urgent', color: '#ef4444' },
        HIGH: { value: 2, label: 'High', color: '#f59e0b' },
        NORMAL: { value: 3, label: 'Normal', color: '#10b981' },
        LOW: { value: 4, label: 'Low', color: '#64748b' }
    },
    
    // Date format
    DATE_FORMAT: 'MMM DD',
    DATETIME_FORMAT: 'MMM DD, YYYY HH:mm',
    
    // Pagination
    ITEMS_PER_PAGE: 25,
    
    // Chart colors
    CHART_COLORS: [
        '#2563eb', // Primary blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#64748b'  // Gray
    ]
};
