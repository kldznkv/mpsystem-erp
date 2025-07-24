// Data management for MP System ERP
class DataManager {
    constructor() {
        this.cache = new Map();
        this.baseUrl = CONFIG.API.BASE_URL;
    }
    
    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.getAuthToken()
            },
            timeout: CONFIG.API.TIMEOUT
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Authentication token management
    getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }
    
    setAuthToken(token) {
        localStorage.setItem('auth_token', token);
    }
    
    clearAuthToken() {
        localStorage.removeItem('auth_token');
    }
    
    // CRUD operations
    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        return this.request(url.pathname + url.search);
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // Cache management
    setCache(key, data, ttl = 300000) { // 5 minutes default TTL
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// Create global data manager instance
const dataManager = new DataManager();

// Sample data for development
const SAMPLE_DATA = {
    inventory: [
        { id: 1, name: 'Товар 1', quantity: 100, price: 1500 },
        { id: 2, name: 'Товар 2', quantity: 50, price: 2000 },
        { id: 3, name: 'Товар 3', quantity: 75, price: 1200 }
    ],
    sales: [
        { id: 1, date: '2024-01-15', amount: 15000, items: 10 },
        { id: 2, date: '2024-01-16', amount: 25000, items: 15 },
        { id: 3, date: '2024-01-17', amount: 18000, items: 12 }
    ]
};