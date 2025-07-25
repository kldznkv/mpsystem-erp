// ===== UNIFIED JAVASCRIPT SYSTEM =====
console.log('🚀 MPSYSTEM JavaScript загружен');

// ===== API SERVICE =====
class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
        this.headers = CONFIG.API_CONFIG.headers;
        this.timeout = CONFIG.API_CONFIG.timeout;
        this.retries = CONFIG.API_CONFIG.retries;
    }

    // Generic API request method with error handling and retries
    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const requestOptions = {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            }
        };

        let lastError;
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                console.warn(`API request attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.retries && !error.name === 'AbortError') {
                    await this.delay(1000 * attempt); // Exponential backoff
                } else {
                    break;
                }
            }
        }

        throw lastError;
    }

    // Helper method for delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET request
    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.pathname + url.search, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// ===== ORDERS API SERVICE =====
class OrdersApiService {
    constructor(apiService) {
        this.api = apiService;
    }

    // Fetch orders with filters and pagination
    async fetchOrders(filters = {}) {
        const params = {
            page: filters.page || CONFIG.PAGINATION.DEFAULT_PAGE,
            limit: filters.limit || CONFIG.PAGINATION.DEFAULT_SIZE,
            status: filters.status,
            client_name: filters.client_name,
            priority: filters.priority,
            search: filters.search
        };

        return this.api.get(CONFIG.API_ENDPOINTS.ORDERS, params);
    }

    // Fetch single order by ID
    async fetchOrderById(id) {
        return this.api.get(CONFIG.API_ENDPOINTS.ORDER_BY_ID(id));
    }

    // Create new order
    async createOrder(orderData) {
        return this.api.post(CONFIG.API_ENDPOINTS.ORDERS, orderData);
    }

    // Update order
    async updateOrder(id, orderData) {
        return this.api.put(CONFIG.API_ENDPOINTS.ORDER_BY_ID(id), orderData);
    }

    // Update order status
    async updateOrderStatus(id, status, progress = null) {
        const data = { status };
        if (progress !== null) {
            data.progress = progress;
        }
        return this.api.put(CONFIG.API_ENDPOINTS.ORDER_BY_ID(id), data);
    }

    // Delete order
    async deleteOrder(id) {
        return this.api.delete(CONFIG.API_ENDPOINTS.ORDER_BY_ID(id));
    }

    // Get order progress
    async getOrderProgress(id) {
        return this.api.get(CONFIG.API_ENDPOINTS.ORDER_PROGRESS(id));
    }
}

// ===== LOADING STATE MANAGER =====
class LoadingManager {
    constructor() {
        this.loadingStates = new Set();
    }

    setLoading(key, isLoading = true) {
        if (isLoading) {
            this.loadingStates.add(key);
        } else {
            this.loadingStates.delete(key);
        }
        this.updateUI(key, isLoading);
    }

    isLoading(key) {
        return this.loadingStates.has(key);
    }

    updateUI(key, isLoading) {
        const elements = document.querySelectorAll(`[data-loading="${key}"]`);
        elements.forEach(element => {
            if (isLoading) {
                element.classList.add('loading');
                element.disabled = true;
            } else {
                element.classList.remove('loading');
                element.disabled = false;
            }
        });

        // Update specific loading indicators
        const loadingIndicator = document.getElementById(`loading-${key}`);
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    }
}

// ===== NOTIFICATION MANAGER =====
class NotificationManager {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${icon}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        this.container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Global instances
const apiService = new ApiService();
const ordersApi = new OrdersApiService(apiService);
const loadingManager = new LoadingManager();
const notificationManager = new NotificationManager();

// Enhanced ERP Storage System
class ERPStorage {
    constructor() {
        this.data = {
            materials: [],
            suppliers: [],
            inventory: [],
            batches: [],
            orders: [],
            production_queue: [],
            production_lines: [],
            requirements: [],
            purchase_orders: [],
            contracts: [],
            price_history: [],
            delivery_schedule: [],
            activities: []
        };
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initializeWithSampleData();
        this.initializeProductionRules();
        this.initializeProcurementData();
    }

    loadFromStorage() {
        try {
            const storedData = localStorage.getItem('erp_data');
            if (storedData) {
                this.data = { ...this.data, ...JSON.parse(storedData) };
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    saveToStorage() {
        localStorage.setItem('erp_data', JSON.stringify(this.data));
    }

    getTable(tableName) {
        return this.data[tableName] || [];
    }

    getData() {
        return this.data;
    }

    addRecord(tableName, record) {
        if (!this.data[tableName]) this.data[tableName] = [];
        
        const id = this.data[tableName].length > 0 
            ? Math.max(...this.data[tableName].map(r => r.id || 0)) + 1 
            : 1;
        
        record.id = id;
        record.created_at = new Date().toISOString();
        this.data[tableName].push(record);
        this.saveToStorage();
        return record;
    }

    updateRecord(tableName, id, updates) {
        const index = this.data[tableName].findIndex(r => r.id === id);
        if (index !== -1) {
            this.data[tableName][index] = { ...this.data[tableName][index], ...updates };
            this.saveToStorage();
            return this.data[tableName][index];
        }
        return null;
    }

    deleteRecord(tableName, id) {
        this.data[tableName] = this.data[tableName].filter(r => r.id !== id);
        this.saveToStorage();
    }

    addActivity(type, description) {
        this.addRecord('activities', {
            type,
            description,
            timestamp: new Date().toISOString()
        });
    }

    initializeWithSampleData() {
        if (this.data.materials.length > 0) return; // Already initialized

        // Materials
        this.data.materials = [
            { id: 1, code: 'GR-PET-001', name: 'PET Гранулы прозрачные', type: 'granulate_pet', unit: 'кг', standard_cost: 85.5, min_stock_level: 1000, supplier_id: 1 },
            { id: 2, code: 'DYE-CLEAR', name: 'Краситель прозрачный', type: 'ink_printing', unit: 'кг', standard_cost: 450.0, min_stock_level: 50, supplier_id: 2 },
            { id: 3, code: 'DYE-BLUE', name: 'Краситель синий', type: 'ink_printing', unit: 'кг', standard_cost: 520.0, min_stock_level: 30, supplier_id: 2 },
            { id: 4, code: 'GR-LLDPE-001', name: 'LLDPE Гранулы', type: 'granulate_ldpe', unit: 'кг', standard_cost: 75.0, min_stock_level: 800, supplier_id: 1 }
        ];

        // Suppliers
        this.data.suppliers = [
            { id: 1, code: 'SUP-001', name: 'ОАО "Нефтехим"', contact_person: 'Иванов И.И.', email: 'ivanov@neftehim.ru', phone: '+7-495-123-4567', is_active: true, overall_rating: 85.5 },
            { id: 2, code: 'SUP-002', name: 'ТД "Химические красители"', contact_person: 'Петрова М.А.', email: 'petrova@himkras.ru', phone: '+7-812-987-6543', is_active: true, overall_rating: 78.2 }
        ];

        // Inventory
        this.data.inventory = [
            { id: 1, material_id: 1, quantity: 2500, reserved_quantity: 500, available_quantity: 2000, last_received: '2024-01-15', reservations: [{ order_id: 'ORD-240001', quantity: 500 }] },
            { id: 2, material_id: 2, quantity: 120, reserved_quantity: 0, available_quantity: 120, last_received: '2024-01-10', reservations: [] },
            { id: 3, material_id: 3, quantity: 80, reserved_quantity: 25, available_quantity: 55, last_received: '2024-01-12', reservations: [{ order_id: 'ORD-240001', quantity: 25 }] },
            { id: 4, material_id: 4, quantity: 1200, reserved_quantity: 0, available_quantity: 1200, last_received: '2024-01-14', reservations: [] }
        ];

        // Orders
        this.data.orders = [
            { id: 1, order_number: 'ORD-240001', customer_name: 'ООО "Упаковка+"', product_name: 'Пленка PET прозрачная 30мкм', quantity: 1000, order_date: '2024-01-15', delivery_date: '2024-01-25', status: 'scheduled', priority: 'high', material_requirements: [{ material_id: 1, required_quantity: 500 }, { material_id: 3, required_quantity: 25 }] },
            { id: 2, order_number: 'ORD-240002', customer_name: 'ТД "Полимер"', product_name: 'Пленка LDPE 50мкм', quantity: 1500, order_date: '2024-01-16', delivery_date: '2024-01-28', status: 'new', priority: 'medium', material_requirements: [] }
        ];

        // Production Queue
        this.data.production_queue = [
            { id: 1, order_id: 1, order_number: 'ORD-240001', product_name: 'Пленка PET прозрачная 30мкм', quantity: 1000, line_id: 1, status: 'scheduled', scheduled_start: '2024-01-20T08:00:00', estimated_completion: '2024-01-20T16:00:00', priority: 'high' }
        ];

        this.saveToStorage();
    }

    initializeProductionRules() {
        if (!this.data.production_recipes) {
            this.data.production_recipes = this.getDefaultProductionRecipes();
        }
        if (!this.data.production_lines) {
            this.data.production_lines = this.getDefaultProductionLines();
        }
        this.saveToStorage();
    }

    initializeProcurementData() {
        if (!this.data.contracts) {
            this.data.contracts = this.getDefaultContracts();
        }
        this.saveToStorage();
    }

    // Production Rules and Recipes
    getDefaultProductionRecipes() {
        return [
            {
                id: 1,
                product_name: 'Пленка PET прозрачная 30мкм',
                material_requirements: [
                    { material_id: 1, quantity_per_unit: 0.5 },
                    { material_id: 2, quantity_per_unit: 0.025 }
                ],
                setup_time_minutes: 60,
                production_time_per_unit: 0.5,
                line_types: ['extrusion']
            },
            {
                id: 2,
                product_name: 'Пленка LDPE 50мкм',
                material_requirements: [
                    { material_id: 4, quantity_per_unit: 0.6 }
                ],
                setup_time_minutes: 45,
                production_time_per_unit: 0.4,
                line_types: ['extrusion']
            }
        ];
    }

    getDefaultProductionLines() {
        return [
            {
                id: 1,
                name: 'Линия экструзии 1',
                type: 'extrusion',
                status: 'available',
                capacity_per_hour: 100,
                current_order_id: null
            },
            {
                id: 2,
                name: 'Линия экструзии 2',
                type: 'extrusion',
                status: 'maintenance',
                capacity_per_hour: 120,
                current_order_id: null
            }
        ];
    }

    getDefaultContracts() {
        return [
            {
                id: 1,
                supplier_id: 1,
                material_id: 1,
                price: 82.0,
                min_order_qty: 500,
                lead_time_days: 7,
                valid_from: '2024-01-01',
                valid_to: '2024-12-31'
            }
        ];
    }

    // Enhanced order processing
    processOrder(orderData) {
        try {
            const order = this.addRecord('orders', {
                order_number: this.generateOrderNumber(),
                customer_name: orderData.customer_name || orderData.customer,
                product_name: orderData.product_name || orderData.product,
                quantity: orderData.quantity,
                order_date: new Date().toISOString().split('T')[0],
                delivery_date: orderData.deliveryDate,
                status: 'new',
                priority: 'medium'
            });

            this.addActivity('order_created', `Создан заказ ${order.order_number}`);
            return { success: true, order: order };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    generateOrderNumber() {
        const orders = this.getTable('orders');
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const count = orders.filter(o => o.order_number && o.order_number.startsWith(`ORD-${year}${month}`)).length + 1;
        return `ORD-${year}${month}${count.toString().padStart(3, '0')}`;
    }
}

// Initialize storage
const storage = new ERPStorage();

// ===== ENHANCED NAVIGATION SYSTEM =====
function showTab(tabName) {
    console.log('🔄 Переключение на вкладку:', tabName);
    
    try {
        // Валидация
        if (!tabName) {
            console.error('❌ Не указано имя вкладки');
            return false;
        }

        // Проверяем существование страницы
        const selectedTab = document.getElementById(tabName);
        if (!selectedTab) {
            console.error('❌ Страница не найдена:', tabName);
            showToast(`Страница "${tabName}" не найдена`, 'error');
            return false;
        }

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });

        // Show selected tab with animation
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
        console.log('✅ Страница активирована:', tabName);

        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate corresponding nav button
        const navButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        if (navButton) {
            navButton.classList.add('active');
            console.log('✅ Навигация обновлена для:', tabName);
        } else {
            console.warn('⚠️ Кнопка навигации не найдена для:', tabName);
        }

        // Update page title
        updatePageTitle(tabName);

        // Load tab content
        loadTabContent(tabName);
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка в showTab:', error);
        showToast('Ошибка при переключении страницы', 'error');
        return false;
    }
}

// Alternative navigation function
function navigateToPage(pageId) {
    console.log('🧭 Navigating to:', pageId);
    return showTab(pageId);
}

// Show specific page (alias for showTab)
function showPage(pageId) {
    return showTab(pageId);
}

// Hide specific page
function hidePage(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('active');
        page.style.display = 'none';
        console.log('📴 Страница скрыта:', pageId);
        return true;
    }
    return false;
}

// Update page title based on current tab
function updatePageTitle(tabName) {
    const titles = {
        'dashboard': 'Dashboard - Главная панель',
        'planning': 'Планирование производства',
        'production': 'Управление производством',
        'quality': 'Контроль качества',
        'warehouse': 'Управление складом',
        'purchasing': 'Закупки',
        'orders': 'Управление заказами',
        'maintenance': 'Техническое обслуживание',
        'analytics': 'Аналитика и отчеты'
    };
    
    const title = titles[tabName] || tabName;
    document.title = `MPSYSTEM - ${title}`;
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'dashboard':
            updateDashboardStats();
            updateCurrentTime();
            break;
        case 'planning':
            loadPlanningPage();
            break;
        case 'procurement':
            loadMaterials();
            loadSuppliers();
            break;
        case 'orders':
            loadOrdersPage();
            break;
        case 'warehouse':
            loadInventoryPage();
            break;
        case 'purchasing':
            loadPurchasingPage();
            break;
        case 'production':
            loadProductionPage();
            break;
        case 'quality':
            // Quality module placeholder
            showToast('Модуль контроля качества будет доступен в следующей версии', 'info');
            break;
        case 'maintenance':
            // Maintenance module placeholder
            showToast('Модуль технического обслуживания будет доступен в следующей версии', 'info');
            break;
        case 'analytics':
            updateDashboardStats();
            break;
    }
}

// Enhanced Modal & Side Panel System
function showModal(modalId, asSidePanel = false) {
    console.log('🔄 Opening modal:', modalId, 'as side panel:', asSidePanel);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('❌ Modal not found:', modalId);
        return;
    }
    
    if (asSidePanel) {
        modal.classList.add('side-panel');
        console.log('✅ Added side-panel class to:', modalId);
    } else {
        modal.classList.remove('side-panel');
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('✅ Modal activated:', modalId);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (modal.classList.contains('side-panel')) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateX(100%)';
            setTimeout(() => {
                modal.classList.remove('active');
                modal.classList.remove('side-panel');
                content.style.transform = '';
                document.body.style.overflow = '';
            }, 300);
            return;
        }
    }
    
    modal.classList.remove('active');
    modal.classList.remove('side-panel');
    document.body.style.overflow = '';
}

// Show any modal as side panel
function showSidePanel(modalId) {
    showModal(modalId, true);
}

// Toggle between modal and side panel
function toggleModalType(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const isSidePanel = modal.classList.contains('side-panel');
    hideModal(modalId);
    
    setTimeout(() => {
        showModal(modalId, !isSidePanel);
    }, 100);
}

// Enhanced Data Loading Functions
function loadOrders() {
    const orders = storage.getTable('orders');
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number || order.id}</td>
            <td>${order.customer_name || order.customer || '-'}</td>
            <td>${order.product_name || order.product || '-'}</td>
            <td>${order.quantity || 0} кг</td>
            <td><span class="status-badge status-${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span></td>
            <td>${order.order_date || order.date || '-'}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="editOrder(${order.id})">Редактировать</button>
                <button class="btn btn-small btn-danger" onclick="deleteOrder(${order.id})">Удалить</button>
            </td>
        </tr>
    `).join('');
}

function loadInventory() {
    const inventory = storage.getTable('inventory');
    const materials = storage.getTable('materials');
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;

    tbody.innerHTML = inventory.map(item => {
        const material = materials.find(m => m.id === item.material_id);
        return `
            <tr>
                <td>${material ? material.code : 'N/A'}</td>
                <td>${material ? material.name : 'Неизвестный материал'}</td>
                <td>
                    <span style="color: ${item.available_quantity < 100 ? '#ef4444' : '#10b981'}">
                        ${item.quantity || 0} (доступно: ${item.available_quantity || 0})
                    </span>
                    ${item.reserved_quantity > 0 ? `<br><small>🔒 Резерв: ${item.reserved_quantity}</small>` : ''}
                </td>
                <td>${material ? material.unit : 'шт'}</td>
                <td>${item.last_received || '-'}</td>
            </tr>
        `;
    }).join('');
}

function loadProduction() {
    const productionQueue = storage.getTable('production_queue');
    const productionLines = storage.getTable('production_lines');
    const tbody = document.getElementById('productionTable');
    if (!tbody) return;

    tbody.innerHTML = productionQueue.map(item => {
        const line = productionLines.find(l => l.id === item.line_id);
        return `
            <tr>
                <td>${line ? line.name : 'Линия ' + item.line_id}</td>
                <td>${item.order_number || item.order_id}</td>
                <td><span class="status-badge status-${getStatusClass(item.status)}">${getStatusLabel(item.status)}</span></td>
                <td>${item.progress || 0}%</td>
                <td>${item.estimated_completion ? new Date(item.estimated_completion).toLocaleString() : '-'}</td>
            </tr>
        `;
    }).join('');
}

function loadMaterials() {
    const materials = storage.getTable('materials');
    const suppliers = storage.getTable('suppliers');
    const tbody = document.getElementById('materialsTable');
    if (!tbody) return;

    tbody.innerHTML = materials.map(material => {
        const supplier = suppliers.find(s => s.id === material.supplier_id);
        return `
            <tr>
                <td><strong>${material.code}</strong></td>
                <td>${material.name}</td>
                <td><span class="status-badge status-new">${getTypeLabel(material.type)}</span></td>
                <td>${material.unit}</td>
                <td>${material.standard_cost ? material.standard_cost.toFixed(2) + ' ₽' : '-'}</td>
                <td>${material.min_stock_level || '-'}</td>
                <td>${supplier ? supplier.name : '-'}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="editMaterial(${material.id})">✏️</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMaterial(${material.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadSuppliers() {
    const suppliers = storage.getTable('suppliers');
    const tbody = document.getElementById('suppliersTable');
    if (!tbody) return;

    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td><strong>${supplier.code}</strong></td>
            <td>${supplier.name}</td>
            <td>${supplier.contact_person || '-'}</td>
            <td>${supplier.email || '-'}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.overall_rating ? supplier.overall_rating.toFixed(1) + '/100' : '-'}</td>
            <td>
                <span class="status-badge ${supplier.is_active ? 'status-completed' : 'status-cancelled'}">
                    ${supplier.is_active ? 'Активный' : 'Неактивный'}
                </span>
            </td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="editSupplier(${supplier.id})">✏️</button>
                <button class="btn btn-small btn-danger" onclick="deleteSupplier(${supplier.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Enhanced Order Creation
function createOrder() {
    const form = document.getElementById('orderForm');
    
    const orderData = {
        customer_name: document.getElementById('customerSelect').value,
        product_name: document.getElementById('productSelect').value,
        quantity: parseInt(document.getElementById('quantityInput').value),
        deliveryDate: document.getElementById('deliveryDate').value
    };

    if (!orderData.customer_name || !orderData.product_name || !orderData.quantity) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    const result = storage.processOrder(orderData);
    
    if (result.success) {
        hideModal('orderModal');
        form.reset();
        
        // Refresh data
        loadOrders();
        loadInventory();
        loadProduction();
        updateDashboardStats();
        
        showToast(`Заказ ${result.order.order_number} успешно создан!`);
    } else {
        showToast(result.error, 'error');
    }
}

// Enhanced Utility Functions
function getStatusClass(status) {
    const statusMap = {
        'new': 'new',
        'approved': 'approved',
        'scheduled': 'in-production',
        'in_production': 'in-production',
        'completed': 'completed',
        'shipped': 'completed',
        'cancelled': 'cancelled',
        'available': 'completed',
        'maintenance': 'cancelled',
        'draft': 'new',
        'sent': 'approved',
        'confirmed': 'approved',
        'delivered': 'completed'
    };
    return statusMap[status] || 'new';
}

function getStatusLabel(status) {
    const statusLabels = {
        'new': 'Новый',
        'approved': 'Утвержден',
        'scheduled': 'Запланирован',
        'in_production': 'В производстве',
        'completed': 'Выполнен',
        'shipped': 'Отгружен',
        'cancelled': 'Отменен',
        'available': 'Доступна',
        'maintenance': 'Обслуживание',
        'draft': 'Черновик',
        'sent': 'Отправлен',
        'confirmed': 'Подтвержден',
        'delivered': 'Доставлен'
    };
    return statusLabels[status] || status;
}

function getTypeLabel(type) {
    const types = {
        'granulate_ldpe': 'Гранулят ПВД',
        'granulate_hdpe': 'Гранулят ПНД',
        'granulate_pp': 'Гранулят ПП',
        'granulate_pet': 'Гранулят ПЭТ',
        'ink_printing': 'Краска',
        'adhesive_pu': 'Клей ПУ',
        'adhesive_acrylic': 'Клей акриловый',
        'solvent': 'Растворитель',
        'additive': 'Добавка'
    };
    return types[type] || type;
}

async function updateDashboardStats() {
    try {
        // Try to fetch from GitHub Pages static API
        const response = await fetch('./api/v1/dashboard/metrics.json');
        if (response.ok) {
            const metrics = await response.json();
            document.getElementById('totalOrders').textContent = metrics.orders_active;
            document.getElementById('productionCapacity').textContent = metrics.production_capacity + '%';
            document.getElementById('oeeMetric').textContent = metrics.oee_efficiency + '%';
            document.getElementById('qualityRate').textContent = metrics.quality_pass_rate + '%';
            return;
        }
    } catch (error) {
        console.log('📡 GitHub Pages API not available, using local data');
    }
    
    // Fallback to local storage data
    const orders = storage.getTable('orders');
    const productionQueue = storage.getTable('production_queue');
    
    // Update stats from local data
    document.getElementById('totalOrders').textContent = orders.filter(o => ['new', 'approved', 'scheduled', 'in_production'].includes(o.status)).length;
    document.getElementById('productionCapacity').textContent = '92%';
    document.getElementById('oeeMetric').textContent = '87.3%';
    document.getElementById('qualityRate').textContent = '99.1%';
}

// CRUD Operations
function deleteOrder(id) {
    if (confirm('Удалить заказ?')) {
        storage.deleteRecord('orders', id);
        loadOrders();
        updateDashboardStats();
        showToast('Заказ удален', 'success');
    }
}

function deleteMaterial(id) {
    if (confirm('Удалить материал?')) {
        storage.deleteRecord('materials', id);
        loadMaterials();
        showToast('Материал удален', 'success');
    }
}

function deleteSupplier(id) {
    if (confirm('Удалить поставщика?')) {
        storage.deleteRecord('suppliers', id);
        loadSuppliers();
        showToast('Поставщик удален', 'success');
    }
}

function editOrder(id) {
    // TODO: Implement order editing
    showToast('Редактирование заказов будет добавлено в следующем обновлении', 'warning');
}

function editMaterial(id) {
    // TODO: Implement material editing
    showToast('Редактирование материалов будет добавлено в следующем обновлении', 'warning');
}

function editSupplier(id) {
    // TODO: Implement supplier editing
    showToast('Редактирование поставщиков будет добавлено в следующем обновлении', 'warning');
}

// MPSYSTEM specific functions
function updateCurrentTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('ru-RU');
    }
}

// =============================================
// GITHUB PAGES API INTEGRATION
// =============================================

async function loadProductionLinesFromAPI() {
    try {
        const response = await fetch('./api/v1/dashboard/production-lines.json');
        if (response.ok) {
            const lines = await response.json();
            updateProductionLinesDisplay(lines);
            return true;
        }
    } catch (error) {
        console.log('📡 Production lines API not available');
    }
    return false;
}

async function loadCriticalAlertsFromAPI() {
    try {
        const response = await fetch('./api/v1/dashboard/alerts.json');
        if (response.ok) {
            const alerts = await response.json();
            updateCriticalAlertsDisplay(alerts);
            return true;
        }
    } catch (error) {
        console.log('📡 Critical alerts API not available');
    }
    return false;
}

function updateProductionLinesDisplay(lines) {
    lines.forEach(line => {
        const lineCard = document.getElementById(line.line_id);
        if (lineCard) {
            // Update line status
            const statusElement = lineCard.querySelector('.line-status');
            if (statusElement) {
                const statusText = {
                    'running': 'Работает',
                    'idle': 'Простой', 
                    'maintenance': 'ТО',
                    'stopped': 'Остановлена'
                };
                statusElement.textContent = statusText[line.status] || line.status;
                statusElement.className = `line-status ${line.status}`;
            }

            // Update current order
            const orderElement = lineCard.querySelector('.current-order');
            if (orderElement) {
                orderElement.textContent = line.current_order ? `Заказ: ${line.current_order}` : 'Нет заказа';
            }

            // Update progress
            const progressFill = lineCard.querySelector('.progress-fill');
            const progressText = lineCard.querySelector('.progress-text');
            if (progressFill && progressText) {
                progressFill.style.width = `${line.progress_percent}%`;
                progressText.textContent = line.time_remaining || `${line.progress_percent}%`;
            }

            // Update metrics
            const metricsElement = lineCard.querySelector('.line-metrics');
            if (metricsElement) {
                metricsElement.innerHTML = `
                    <span>OEE: ${line.oee_percent}%</span>
                    <span>Очередь: ${line.queue_count} заказа</span>
                `;
            }
        }
    });
}

function updateCriticalAlertsDisplay(alerts) {
    const alertsList = document.getElementById('criticalAlerts');
    if (!alertsList) return;

    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.alert_type}">
            <span class="alert-icon">${alert.icon}</span>
            <span class="alert-text">${alert.message}</span>
            <span class="alert-time">${alert.time_ago}</span>
            ${alert.action_available ? `<button class="alert-action" onclick="handleAlertAction(${alert.alert_id})">${alert.action_label}</button>` : ''}
        </div>
    `).join('');
}

function handleAlertAction(alertId) {
    showToast(`Действие по уведомлению ${alertId} выполнено`, 'success');
}

// =============================================
// UC-D001: DASHBOARD AUTO-UPDATE (30 seconds)
// =============================================

async function updateDashboardMetrics() {
    try {
        const response = await fetch('./api/v1/dashboard/metrics.json');
        if (response.ok) {
            const metrics = await response.json();
            
            // Update metrics with animation
            animateMetricUpdate('totalOrders', metrics.orders_active);
            animateMetricUpdate('productionCapacity', metrics.production_capacity + '%');
            animateMetricUpdate('oeeMetric', metrics.oee_efficiency + '%');
            animateMetricUpdate('qualityRate', metrics.quality_pass_rate + '%');
            
            return true;
        }
    } catch (error) {
        console.log('📡 GitHub Pages metrics API not available');
    }
    return false;
}

function animateMetricUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.transform = 'scale(1.1)';
        element.style.color = '#10b981';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 200);
    }
}

// =============================================
// UC-D002: LINE DETAILS MODAL
// =============================================

let currentLineData = null;

function showLineDetails(lineId) {
    // Find line data from production lines API
    loadLineDetails(lineId);
    
    // Show as side panel by default
    showSidePanel('lineDetailsModal');
}

function hideLineDetails() {
    const modal = document.getElementById('lineDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentLineData = null;
}

async function loadLineDetails(lineId) {
    try {
        const response = await fetch('./api/v1/dashboard/production-lines.json');
        if (response.ok) {
            const lines = await response.json();
            const line = lines.find(l => l.line_id === lineId);
            if (line) {
                populateLineModal(line);
                currentLineData = line;
                return;
            }
        }
    } catch (error) {
        console.log('📡 Line details API not available');
    }
    
    // Fallback data
    populateLineModal({
        line_id: lineId,
        line_name: `Линия ${lineId}`,
        status: 'running',
        current_order: 'ORD-250001',
        progress_percent: 65,
        time_remaining: '2ч 30мин осталось',
        oee_percent: 89,
        queue_count: 3,
        operator: 'Иванов И.И.'
    });
}

function populateLineModal(line) {
    // Update modal title and status
    document.getElementById('lineModalTitle').textContent = line.line_name;
    const statusBadge = document.getElementById('lineModalStatus');
    statusBadge.textContent = getStatusText(line.status);
    statusBadge.className = `line-status-badge ${line.status}`;
    
    // Update details
    document.getElementById('lineModalOrder').textContent = line.current_order || 'Нет заказа';
    document.getElementById('lineModalProgress').style.width = `${line.progress_percent}%`;
    document.getElementById('lineModalProgressText').textContent = line.time_remaining || `${line.progress_percent}%`;
    document.getElementById('lineModalOperator').textContent = line.operator;
    
    // Update metrics
    document.getElementById('lineModalOEE').textContent = `${line.oee_percent}%`;
    document.getElementById('lineModalQueue').textContent = line.queue_count;
    document.getElementById('lineModalSpeed').textContent = '120%'; // Mock data
}

function getStatusText(status) {
    const statusMap = {
        'running': 'Работает',
        'idle': 'Простой',
        'maintenance': 'Наладка',
        'stopped': 'Остановлена'
    };
    return statusMap[status] || status;
}

// =============================================
// UC-D003: QUICK ACTIONS
// =============================================

function executeLineAction(action) {
    if (!currentLineData) {
        showToast('Данные линии не загружены', 'error');
        return;
    }
    
    const lineId = currentLineData.line_id;
    const lineName = currentLineData.line_name;
    
    switch(action) {
        case 'pause':
            showToast(`🏭 Линия "${lineName}" поставлена на паузу`, 'warning');
            break;
        case 'priority':
            showToast(`🔼 Приоритет линии "${lineName}" изменен`, 'info');
            break;
        case 'maintenance':
            showToast(`🔧 Линия "${lineName}" переведена в режим ТО`, 'warning');
            break;
        default:
            showToast(`Действие "${action}" выполнено для линии "${lineName}"`, 'info');
    }
    
    // Hide modal after action
    setTimeout(() => {
        hideLineDetails();
    }, 1500);
}

function viewLineHistory() {
    if (!currentLineData) return;
    
    showToast(`📊 История линии "${currentLineData.line_name}" будет доступна в следующей версии`, 'info');
}

// =============================================
// ORDERS PAGE FUNCTIONS
// =============================================

// Sample orders data (согласно ТЗ структуре)
let ordersData = [
    {
        id: 'ord-001',
        number: 'ZP-2024/0318',
        clientId: 'client-001',
        client: 'ООО Пакет-Сервис',
        productId: 'prod-001',
        product: 'Пленка ПВД прозрачная 30мкм',
        quantity: 2500,
        unit: 'кг',
        dueDate: '2024-02-15',
        priority: 'high',
        status: 'in_production',
        value: 125000,
        margin: 15,
        progress: 65,
        createdBy: 'manager-001',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-20',
        specialRequirements: 'Особые требования к упаковке',
        attachments: ['spec.pdf', 'drawing.dwg']
    },
    {
        id: 'ord-002', 
        number: 'ZP-2024/0319',
        clientId: 'client-002',
        client: 'АО Упаковочные решения',
        productId: 'prod-002',
        product: 'Пакет с печатью 4+0',
        quantity: 10000,
        unit: 'шт',
        dueDate: '2024-02-20',
        priority: 'urgent',
        status: 'planned',
        value: 85000,
        margin: 12,
        progress: 15,
        createdBy: 'manager-002',
        createdAt: '2024-01-19',
        updatedAt: '2024-01-20',
        specialRequirements: '',
        attachments: []
    },
    {
        id: 'ord-003',
        number: 'ZP-2024/0320',
        clientId: 'client-003', 
        client: 'ИП Васильев',
        productId: 'prod-003',
        product: 'Пленка ламинированная',
        quantity: 1200,
        unit: 'м2',
        dueDate: '2024-02-25',
        priority: 'normal',
        status: 'new',
        value: 96000,
        margin: 18,
        progress: 0,
        createdBy: 'manager-001',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        specialRequirements: 'Срочная доставка',
        attachments: ['tech_spec.pdf']
    }
];

let filteredOrders = [...ordersData];

async function loadOrdersPage() {
    try {
        loadingManager.setLoading('orders', true);
        
        // Fetch orders from API
        const ordersResponse = await ordersApi.fetchOrders({
            page: window.currentOrdersPage || 1,
            limit: 20
        });
        
        // Update global orders data
        window.ordersData = ordersResponse.items || [];
        
        // Update UI
        updateOrdersSummary();
        renderOrdersTable();
        updateOrdersPagination(ordersResponse);
        
        notificationManager.success(`Загружено ${ordersResponse.items?.length || 0} заказов`);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        notificationManager.error('Ошибка загрузки заказов: ' + error.message);
        
        // Fallback to local data
        updateOrdersSummary();
        renderOrdersTable();
    } finally {
        loadingManager.setLoading('orders', false);
    }
}

// ===== ORDERS API FUNCTIONS =====

// Pagination handler
function updateOrdersPagination(response) {
    const pagination = document.getElementById('orders-pagination');
    if (!pagination || !response.pages) return;
    
    const currentPage = response.page || 1;
    const totalPages = response.pages || 1;
    
    let paginationHtml = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHtml += `<button onclick="loadOrdersPage(${currentPage - 1})" class="btn btn-sm">← Пред</button>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        const activeClass = i === currentPage ? 'btn-primary' : '';
        paginationHtml += `<button onclick="loadOrdersPage(${i})" class="btn btn-sm ${activeClass}">${i}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHtml += `<button onclick="loadOrdersPage(${currentPage + 1})" class="btn btn-sm">След →</button>`;
    }
    
    pagination.innerHTML = paginationHtml;
    window.currentOrdersPage = currentPage;
}

// Create new order via API
async function createNewOrder(orderData) {
    try {
        loadingManager.setLoading('create-order', true);
        
        const newOrder = await ordersApi.createOrder(orderData);
        
        notificationManager.success(`Заказ ${newOrder.number} успешно создан`);
        
        // Refresh orders list
        await loadOrdersPage();
        
        // Close modal
        const modal = document.getElementById('createOrderModal');
        if (modal) modal.style.display = 'none';
        
        return newOrder;
        
    } catch (error) {
        console.error('Error creating order:', error);
        notificationManager.error('Ошибка создания заказа: ' + error.message);
        throw error;
    } finally {
        loadingManager.setLoading('create-order', false);
    }
}

// Update order status via API
async function updateOrderStatusAPI(orderId, newStatus, progress = null) {
    try {
        loadingManager.setLoading(`order-${orderId}`, true);
        
        const updatedOrder = await ordersApi.updateOrderStatus(orderId, newStatus, progress);
        
        notificationManager.success(`Статус заказа обновлен: ${CONFIG.HELPERS.getStatusConfig(newStatus).label}`);
        
        // Update local data
        const orderIndex = window.ordersData.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            window.ordersData[orderIndex] = updatedOrder;
        }
        
        // Refresh UI
        renderOrdersTable();
        updateOrdersSummary();
        
        return updatedOrder;
        
    } catch (error) {
        console.error('Error updating order status:', error);
        notificationManager.error('Ошибка обновления статуса: ' + error.message);
        throw error;
    } finally {
        loadingManager.setLoading(`order-${orderId}`, false);
    }
}

// Delete order via API
async function deleteOrderAPI(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
        return;
    }
    
    try {
        loadingManager.setLoading(`order-${orderId}`, true);
        
        await ordersApi.deleteOrder(orderId);
        
        notificationManager.success('Заказ успешно удален');
        
        // Refresh orders list
        await loadOrdersPage();
        
    } catch (error) {
        console.error('Error deleting order:', error);
        notificationManager.error('Ошибка удаления заказа: ' + error.message);
    } finally {
        loadingManager.setLoading(`order-${orderId}`, false);
    }
}

// Fetch order details via API
async function fetchOrderDetails(orderId) {
    try {
        loadingManager.setLoading(`order-details-${orderId}`, true);
        
        const order = await ordersApi.fetchOrderById(orderId);
        return order;
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        notificationManager.error('Ошибка загрузки деталей заказа: ' + error.message);
        throw error;
    } finally {
        loadingManager.setLoading(`order-details-${orderId}`, false);
    }
}

// Apply filters and reload orders
async function applyOrdersFilters() {
    const filters = {
        status: document.getElementById('statusFilter')?.value,
        client_name: document.getElementById('clientFilter')?.value,
        priority: document.getElementById('priorityFilter')?.value,
        search: document.getElementById('searchFilter')?.value,
        page: 1 // Reset to first page when filtering
    };
    
    try {
        loadingManager.setLoading('orders', true);
        
        const ordersResponse = await ordersApi.fetchOrders(filters);
        
        // Update global orders data
        window.ordersData = ordersResponse.items || [];
        
        // Update UI
        updateOrdersSummary();
        renderOrdersTable();
        updateOrdersPagination(ordersResponse);
        
    } catch (error) {
        console.error('Error applying filters:', error);
        notificationManager.error('Ошибка применения фильтров: ' + error.message);
    } finally {
        loadingManager.setLoading('orders', false);
    }
}

// ===== ORDERS UI HELPERS =====

// Handle search input with debounce
let searchTimeout;
function handleSearchKeyup(event) {
    clearTimeout(searchTimeout);
    
    if (event.key === 'Enter') {
        applyOrdersFilters();
        return;
    }
    
    searchTimeout = setTimeout(() => {
        applyOrdersFilters();
    }, 500); // Debounce for 500ms
}

// Reset all filters
function resetOrdersFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('clientFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    document.getElementById('searchFilter').value = '';
    
    applyOrdersFilters();
}

// Refresh orders data manually
async function refreshOrdersData() {
    window.currentOrdersPage = 1; // Reset to first page
    await loadOrdersPage();
}

// Show create order modal
function showCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Set default due date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7); // Default to one week from now
        document.getElementById('dueDate').value = CONFIG.HELPERS.formatDate(tomorrow, 'API');
    }
}

// Hide create order modal
function hideCreateOrderModal() {
    const modal = document.getElementById('createOrderModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            // Clear form
            document.getElementById('createOrderForm').reset();
        }, 300);
    }
}

// Handle create order form submission
async function handleCreateOrderSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        client_id: document.getElementById('clientId').value,
        client_name: document.getElementById('clientName').value,
        product_id: document.getElementById('productId').value,
        product_name: document.getElementById('productName').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        unit: document.getElementById('unit').value,
        due_date: document.getElementById('dueDate').value,
        priority: document.getElementById('priority').value,
        value: document.getElementById('value').value ? parseFloat(document.getElementById('value').value) : null,
        margin: document.getElementById('margin').value ? parseFloat(document.getElementById('margin').value) : null,
        special_requirements: document.getElementById('specialRequirements').value || null,
        created_by: document.getElementById('createdBy').value
    };
    
    // Validate required fields
    if (!formData.client_id || !formData.client_name || !formData.product_id || 
        !formData.product_name || !formData.quantity || !formData.unit || 
        !formData.due_date || !formData.priority || !formData.created_by) {
        notificationManager.error('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    try {
        await createNewOrder(formData);
    } catch (error) {
        console.error('Form submission error:', error);
    }
}

// Client ID/Name auto-update helpers
function updateClientName() {
    const clientId = document.getElementById('clientId').value;
    const clientName = document.getElementById('clientName');
    
    const clientMap = {
        'ML-001': 'MLEKOVITA',
        'AG-001': 'AGRONA',
        'LP-001': 'LACPOL',
        'DN-001': 'DANONE',
        'MZ-001': 'MONDELEZ'
    };
    
    if (clientMap[clientId]) {
        clientName.value = clientMap[clientId];
    }
}

function updateClientId() {
    const clientName = document.getElementById('clientName').value;
    const clientId = document.getElementById('clientId');
    
    const nameMap = {
        'MLEKOVITA': 'ML-001',
        'AGRONA': 'AG-001',
        'LACPOL': 'LP-001',
        'DANONE': 'DN-001',
        'MONDELEZ': 'MZ-001'
    };
    
    if (nameMap[clientName]) {
        clientId.value = nameMap[clientName];
    }
}

// Update render orders table function
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const loadingRow = document.getElementById('orders-loading-row');
    const emptyRow = document.getElementById('orders-empty-row');
    const ordersCount = document.getElementById('orders-count');
    
    if (!tbody) return;
    
    // Hide loading and empty rows
    if (loadingRow) loadingRow.style.display = 'none';
    if (emptyRow) emptyRow.style.display = 'none';
    
    // Clear existing rows (except special rows)
    const existingRows = tbody.querySelectorAll('tr:not(#orders-loading-row):not(#orders-empty-row)');
    existingRows.forEach(row => row.remove());
    
    const orders = window.ordersData || [];
    
    // Update count
    if (ordersCount) {
        ordersCount.textContent = `Всего: ${orders.length}`;
    }
    
    if (orders.length === 0) {
        if (emptyRow) emptyRow.style.display = 'table-row';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Check if order is overdue
        const isOverdue = CONFIG.HELPERS.isOrderOverdue(order.due_date, order.status);
        const daysUntilDue = CONFIG.HELPERS.calculateDaysUntilDue(order.due_date);
        
        // Status config
        const statusConfig = CONFIG.HELPERS.getStatusConfig(order.status);
        const priorityConfig = CONFIG.HELPERS.getPriorityConfig(order.priority);
        const unitConfig = CONFIG.HELPERS.getUnitConfig(order.unit);
        
        row.innerHTML = `
            <td>
                <a href="#" class="order-number-link" onclick="showOrderDetails('${order.id}')" 
                   title="Показать детали заказа">
                    ${order.number || `ZP-${new Date().getFullYear()}/${String(order.id).padStart(4, '0')}`}
                </a>
            </td>
            <td>${order.client_name}</td>
            <td title="${order.product_name}">${order.product_name.length > 30 ? order.product_name.substring(0, 30) + '...' : order.product_name}</td>
            <td>${CONFIG.HELPERS.formatQuantity(order.quantity)} ${unitConfig.label}</td>
            <td class="${isOverdue ? 'order-overdue' : ''}" title="${isOverdue ? 'Просрочен на ' + Math.abs(daysUntilDue) + ' дн.' : daysUntilDue + ' дн. до срока'}">
                ${CONFIG.HELPERS.formatDate(order.due_date)}
            </td>
            <td>
                <span class="order-priority-badge ${order.priority}">${priorityConfig.label}</span>
            </td>
            <td>
                <span class="order-status-badge ${order.status}">${statusConfig.label}</span>
            </td>
            <td>
                <div class="order-progress">
                    <div class="order-progress-bar">
                        <div class="order-progress-fill" style="width: ${order.progress || 0}%"></div>
                    </div>
                    <span class="order-progress-text">${order.progress || 0}%</span>
                </div>
            </td>
            <td class="currency">
                ${order.value ? CONFIG.HELPERS.formatCurrency(order.value) : '—'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm" onclick="showOrderDetails('${order.id}')" title="Детали">👁️</button>
                    <button class="btn btn-sm" onclick="editOrderStatus('${order.id}')" title="Изменить статус">⚡</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrderAPI('${order.id}')" title="Удалить">🗑️</button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Show order details modal
async function showOrderDetails(orderId) {
    try {
        const order = await fetchOrderDetails(orderId);
        
        // Create or update order details modal (implement as needed)
        console.log('Order details:', order);
        notificationManager.info(`Показ деталей заказа ${order.number}`);
        
    } catch (error) {
        console.error('Error showing order details:', error);
    }
}

// Edit order status inline
async function editOrderStatus(orderId) {
    const newStatus = prompt('Введите новый статус заказа:\n- new\n- confirmed\n- planned\n- in_production\n- completed\n- shipped');
    
    if (newStatus && ['new', 'confirmed', 'planned', 'in_production', 'completed', 'shipped'].includes(newStatus)) {
        try {
            await updateOrderStatusAPI(orderId, newStatus);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    } else if (newStatus) {
        notificationManager.error('Неверный статус заказа');
    }
}

function updateOrdersSummary() {
    const summary = {
        new: ordersData.filter(o => o.status === 'new').length,
        queued: ordersData.filter(o => ['confirmed', 'planned'].includes(o.status)).length,
        inProgress: ordersData.filter(o => o.status === 'in_production').length,
        critical: ordersData.filter(o => o.priority === 'urgent' || isOverdue(o)).length
    };

    document.getElementById('ordersNew').textContent = summary.new;
    document.getElementById('ordersQueued').textContent = summary.queued;
    document.getElementById('ordersInProgress').textContent = summary.inProgress;
    document.getElementById('ordersCritical').textContent = summary.critical;
}

function isOverdue(order) {
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    return dueDate < today && !['completed', 'shipped'].includes(order.status);
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = filteredOrders.map(order => `
        <tr onclick="showOrderTimeline('${order.id}')">
            <td>
                <a href="#" class="order-number-link" onclick="showOrderDetails('${order.id}')">${order.number}</a>
            </td>
            <td>${order.client}</td>
            <td>${order.product}</td>
            <td>${order.quantity} ${order.unit}</td>
            <td>${formatDate(order.dueDate)}</td>
            <td>
                <span class="priority-badge priority-${order.priority}">${getPriorityLabel(order.priority)}</span>
            </td>
            <td>
                <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span>
            </td>
            <td>
                <div class="progress-bar-order">
                    <div class="progress-fill-order" style="width: ${order.progress}%"></div>
                </div>
                <small>${order.progress}%</small>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editOrder('${order.id}')">✏️</button>
                    <button class="btn btn-sm btn-secondary" onclick="duplicateOrder('${order.id}')">📋</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getPriorityLabel(priority) {
    const labels = {
        'low': 'Низкий',
        'normal': 'Обычный', 
        'high': 'Высокий',
        'urgent': 'Срочный'
    };
    return labels[priority] || priority;
}

function getStatusLabel(status) {
    const labels = {
        'new': 'Новый',
        'confirmed': 'Подтвержден',
        'planned': 'Запланирован',
        'in_production': 'В производстве',
        'completed': 'Завершен',
        'shipped': 'Отгружен'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function applyOrderFilters() {
    const status = document.getElementById('filterStatus').value;
    const client = document.getElementById('filterClient').value.toLowerCase();
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const search = document.getElementById('searchOrder').value.toLowerCase();
    
    const selectedPriorities = Array.from(document.querySelectorAll('.priority-checkboxes input:checked'))
        .map(cb => cb.value);

    filteredOrders = ordersData.filter(order => {
        if (status && order.status !== status) return false;
        if (client && !order.client.toLowerCase().includes(client)) return false;
        if (search && !order.number.toLowerCase().includes(search)) return false;
        if (!selectedPriorities.includes(order.priority)) return false;
        
        if (dateFrom) {
            const orderDate = new Date(order.createdAt);
            const filterDate = new Date(dateFrom);
            if (orderDate < filterDate) return false;
        }
        
        if (dateTo) {
            const orderDate = new Date(order.createdAt);
            const filterDate = new Date(dateTo);
            if (orderDate > filterDate) return false;
        }
        
        return true;
    });

    renderOrdersTable();
    updateOrdersSummary();
}

function resetOrderFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterClient').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('searchOrder').value = '';
    
    document.querySelectorAll('.priority-checkboxes input').forEach(cb => cb.checked = true);
    
    filteredOrders = [...ordersData];
    renderOrdersTable();
    updateOrdersSummary();
}

function showOrderTimeline(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    const timeline = document.getElementById('productionTimeline');
    const stages = [
        { name: 'MAG-1: Сырье', status: 'completed', date: '2024-01-18' },
        { name: 'MAG-2: Экструзия', status: 'completed', date: '2024-01-19' },
        { name: 'MAG-3: УФ обработка', status: 'current', date: '2024-01-20' },
        { name: 'MAG-4: Печать', status: 'pending', date: '' },
        { name: 'MAG-5: Готовая продукция', status: 'pending', date: '' }
    ];

    timeline.innerHTML = `
        <div class="timeline-header">
            <h4>Заказ: ${order.number}</h4>
            <p>Клиент: ${order.client}</p>
            <p>Продукт: ${order.product}</p>
        </div>
        ${stages.map(stage => `
            <div class="timeline-stage ${stage.status}">
                <div class="stage-info">
                    <strong>${stage.name}</strong>
                    <br>
                    <small>${stage.date || 'Ожидание'}</small>
                </div>
            </div>
        `).join('')}
    `;
}

function showCreateOrderModal() {
    showSidePanel('orderModal');
}

function showOrderDetails(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        // TODO: Create order details modal/side panel
        showToast(`Детали заказа ${order.number} - откроется в боковой панели`, 'info');
    }
}

function editOrder(orderId) {
    showToast(`Редактирование заказа ${orderId}`, 'info');
}

function duplicateOrder(orderId) {
    showToast(`Дублирование заказа ${orderId}`, 'info');
}

function deleteOrder(orderId) {
    if (confirm('Удалить заказ?')) {
        ordersData = ordersData.filter(o => o.id !== orderId);
        filteredOrders = filteredOrders.filter(o => o.id !== orderId);
        renderOrdersTable();
        updateOrdersSummary();
        showToast('Заказ удален', 'success');
    }
}

// =============================================
// PLANNING PAGE FUNCTIONS
// =============================================

// Sample planning data
let planningData = {
    ordersToSchedule: 23,
    linesAvailable: 6,
    setupTime: '45 min',
    materialsReady: '89%',
    
    queuedOrders: [
        {
            id: 'ord-001',
            number: 'ZP-2024/0318',
            client: 'ООО Пакет-Сервис',
            product: 'Пленка ПВД прозрачная 30мкм',
            quantity: 2500,
            unit: 'кг',
            deadline: '2024-02-15',
            priority: 'high',
            status: 'confirmed',
            materialType: 'transparent',
            width: 300,
            thickness: 30
        },
        {
            id: 'ord-002',
            number: 'ZP-2024/0319',
            client: 'АО Упаковочные решения',
            product: 'Пакет с печатью 4+0',
            quantity: 10000,
            unit: 'шт',
            deadline: '2024-02-20',
            priority: 'urgent',
            status: 'new',
            materialType: 'colored',
            color: 'red',
            width: 250,
            thickness: 40
        },
        {
            id: 'ord-003',
            number: 'ZP-2024/0320',
            client: 'ИП Васильев',
            product: 'Пленка ламинированная',
            quantity: 1200,
            unit: 'м2',
            deadline: '2024-02-25',
            priority: 'normal',
            status: 'confirmed',
            materialType: 'transparent',
            width: 400,
            thickness: 50
        }
    ],
    
    productionLines: [
        {
            id: 'extrusion-1',
            name: 'Экструзия Линия 1',
            type: 'extrusion',
            status: 'running',
            currentOrder: 'ZP-2024/0315',
            capacity: '95%',
            efficiency: 92,
            maxWidth: 500,
            capabilities: ['transparent', 'colored'],
            schedule: generateLineSchedule('extrusion-1')
        },
        {
            id: 'extrusion-2',
            name: 'Экструзия Линия 2',
            type: 'extrusion',
            status: 'idle',
            currentOrder: null,
            capacity: '0%',
            efficiency: 88,
            maxWidth: 600,
            capabilities: ['transparent', 'colored'],
            schedule: generateLineSchedule('extrusion-2')
        },
        {
            id: 'lamination-1',
            name: 'Ламинация Линия 1',
            type: 'lamination',
            status: 'running',
            currentOrder: 'ZP-2024/0317',
            capacity: '78%',
            efficiency: 85,
            maxWidth: 400,
            capabilities: ['multilayer'],
            schedule: generateLineSchedule('lamination-1')
        },
        {
            id: 'printing-1',
            name: 'Флексопечать',
            type: 'printing',
            status: 'maintenance',
            currentOrder: null,
            capacity: '0%',
            efficiency: 90,
            maxWidth: 350,
            capabilities: ['printing'],
            schedule: generateLineSchedule('printing-1')
        }
    ]
};

let currentTimelineView = 'week';
let draggedOrder = null;

function generateLineSchedule(lineId) {
    // Генерируем случайное расписание для демонстрации
    const schedule = [];
    for (let i = 0; i < 24; i++) {
        if (Math.random() > 0.7) {
            schedule.push({
                type: Math.random() > 0.8 ? 'setup' : 'production',
                order: `ZP-${2024}/0${Math.floor(Math.random() * 999) + 300}`,
                duration: Math.floor(Math.random() * 4) + 1
            });
        } else {
            schedule.push(null);
        }
    }
    return schedule;
}

function loadPlanningPage() {
    updatePlanningMetrics();
    renderOrdersQueue();
    renderProductionLines();
    generateRecommendations();
}

function updatePlanningMetrics() {
    document.getElementById('ordersToSchedule').textContent = planningData.ordersToSchedule;
    document.getElementById('linesAvailable').textContent = planningData.linesAvailable;
    document.getElementById('setupTime').textContent = planningData.setupTime;
    document.getElementById('materialsReady').textContent = planningData.materialsReady;
}

function renderOrdersQueue() {
    const container = document.getElementById('ordersQueue');
    if (!container) return;

    const filter = document.getElementById('queueFilter')?.value || 'all';
    const sort = document.getElementById('queueSort')?.value || 'priority';

    let filteredOrders = [...planningData.queuedOrders];

    // Фильтрация
    if (filter !== 'all') {
        if (filter === 'urgent') {
            filteredOrders = filteredOrders.filter(o => o.priority === 'urgent');
        } else {
            filteredOrders = filteredOrders.filter(o => o.status === filter);
        }
    }

    // Сортировка
    filteredOrders.sort((a, b) => {
        switch (sort) {
            case 'priority':
                const priorityOrder = { 'urgent': 0, 'high': 1, 'normal': 2, 'low': 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'deadline':
                return new Date(a.deadline) - new Date(b.deadline);
            case 'client':
                return a.client.localeCompare(b.client);
            default:
                return 0;
        }
    });

    container.innerHTML = filteredOrders.map(order => `
        <div class="order-queue-card priority-${order.priority}" 
             draggable="true" 
             data-order-id="${order.id}"
             ondragstart="handleDragStart(event)"
             ondragend="handleDragEnd(event)"
             onclick="showPlanningModal('${order.id}')">
            
            <div class="queue-card-header">
                <span class="queue-order-number">${order.number}</span>
                <span class="queue-priority-badge priority-${order.priority}">
                    ${getPriorityLabel(order.priority)}
                </span>
            </div>
            
            <div class="queue-card-info">
                <div><strong>${order.client}</strong></div>
                <div>${order.product}</div>
                <div>${order.quantity} ${order.unit}</div>
                <div class="queue-deadline">⏰ ${formatDate(order.deadline)}</div>
                <div>📏 ${order.width}мм × ${order.thickness}мкм</div>
                ${order.materialType ? `<div>🎨 ${order.materialType === 'transparent' ? 'Прозрачный' : 'Цветной'}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function renderProductionLines() {
    const container = document.getElementById('productionLinesGrid');
    if (!container) return;

    container.innerHTML = planningData.productionLines.map(line => `
        <div class="production-line-row" data-line-id="${line.id}">
            <div class="line-row-header">
                <div class="line-info">
                    <span class="line-name">${line.name}</span>
                    <span class="line-status-indicator line-status-${line.status}">
                        ${getLineStatusLabel(line.status)}
                    </span>
                    <span class="line-capacity">Загрузка: ${line.capacity}</span>
                </div>
                <div class="line-controls">
                    <button class="btn btn-sm btn-secondary" onclick="showLineDetails('${line.id}')">
                        📊 Детали
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="optimizeLine('${line.id}')">
                        🔧 Оптимизировать
                    </button>
                </div>
            </div>
            
            <div class="line-timeline">
                <div class="timeline-slots"
                     ondrop="handleDrop(event, '${line.id}')"
                     ondragover="handleDragOver(event)">
                    ${renderTimelineSlots(line)}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTimelineSlots(line) {
    const slots = [];
    for (let i = 0; i < 24; i++) {
        const task = line.schedule[i];
        if (task) {
            slots.push(`
                <div class="timeline-slot occupied ${task.type}" title="${task.order}">
                    <div class="timeline-task task-${task.type}">
                        ${task.order.slice(-3)}
                    </div>
                </div>
            `);
        } else {
            slots.push(`<div class="timeline-slot" title="Свободно ${i}:00"></div>`);
        }
    }
    return slots.join('');
}

function getLineStatusLabel(status) {
    const labels = {
        'running': '▶️ Работает',
        'idle': '⏸️ Простой',
        'maintenance': '🔧 ТО'
    };
    return labels[status] || status;
}

function generateRecommendations() {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;

    const recommendations = [
        {
            type: 'optimization',
            title: 'Оптимизация переналадки',
            description: 'Рекомендуется сгруппировать прозрачные заказы ZP-2024/0318 и ZP-2024/0320 на одной линии для экономии времени на переналадку.',
            actions: ['accept', 'decline'],
            orderId: 'ord-001'
        },
        {
            type: 'warning',
            title: 'Нехватка материалов',
            description: 'Для заказа ZP-2024/0319 недостаточно красного красителя. Ожидаемая поставка через 2 дня.',
            actions: ['order_material'],
            orderId: 'ord-002'
        },
        {
            type: 'info',
            title: 'Эффективность линии',
            description: 'Экструзия Линия 1 показывает высокую эффективность (92%) для данного типа заказов. Рекомендуется использовать для срочных заказов.',
            actions: ['accept'],
            lineId: 'extrusion-1'
        },
        {
            type: 'error',
            title: 'Превышение сроков',
            description: 'Заказ ZP-2024/0319 может быть выполнен с опозданием на 1 день при текущем планировании.',
            actions: ['reschedule', 'priority'],
            orderId: 'ord-002'
        }
    ];

    container.innerHTML = recommendations.map((rec, index) => `
        <div class="recommendation-item ${rec.type}">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-description">${rec.description}</div>
            <div class="recommendation-actions">
                ${rec.actions.includes('accept') ? '<button class="btn-accept" onclick="acceptRecommendation(' + index + ')">✅ Принять</button>' : ''}
                ${rec.actions.includes('decline') ? '<button class="btn-decline" onclick="declineRecommendation(' + index + ')">❌ Отклонить</button>' : ''}
                ${rec.actions.includes('order_material') ? '<button class="btn-accept" onclick="orderMaterial(\'' + rec.orderId + '\')">📦 Заказать</button>' : ''}
                ${rec.actions.includes('reschedule') ? '<button class="btn-accept" onclick="rescheduleOrder(\'' + rec.orderId + '\')">📅 Перепланировать</button>' : ''}
                ${rec.actions.includes('priority') ? '<button class="btn-accept" onclick="increasePriority(\'' + rec.orderId + '\')">🔼 Приоритет</button>' : ''}
            </div>
        </div>
    `).join('');
}

function switchTimelineView(view) {
    currentTimelineView = view;
    document.querySelectorAll('.timeline-controls .btn').forEach(btn => {
        btn.className = 'btn btn-sm btn-secondary';
    });
    event.target.className = 'btn btn-sm btn-primary';
    
    renderProductionLines();
    showToast(`Переключено на вид: ${view === 'day' ? 'День' : view === 'week' ? 'Неделя' : 'Месяц'}`, 'info');
}

// Drag and Drop функциональность
function handleDragStart(event) {
    draggedOrder = event.target.getAttribute('data-order-id');
    event.target.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    draggedOrder = null;
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event, lineId) {
    event.preventDefault();
    if (draggedOrder) {
        const order = planningData.queuedOrders.find(o => o.id === draggedOrder);
        if (order) {
            showPlanningModal(draggedOrder, lineId);
        }
    }
}

// Модальное окно планирования
function showPlanningModal(orderId, suggestedLineId = null) {
    const order = planningData.queuedOrders.find(o => o.id === orderId);
    if (!order) return;

    // Заполняем информацию о заказе
    document.getElementById('planningOrderInfo').innerHTML = `
        <div><strong>Заказ:</strong> ${order.number}</div>
        <div><strong>Клиент:</strong> ${order.client}</div>
        <div><strong>Продукт:</strong> ${order.product}</div>
        <div><strong>Количество:</strong> ${order.quantity} ${order.unit}</div>
        <div><strong>Срок:</strong> ${formatDate(order.deadline)}</div>
        <div><strong>Приоритет:</strong> ${getPriorityLabel(order.priority)}</div>
    `;

    // Генерируем опции выбора линии
    const compatibleLines = planningData.productionLines.filter(line => 
        isLineCompatible(line, order)
    );

    document.getElementById('lineOptions').innerHTML = compatibleLines.map(line => `
        <div class="line-option ${line.id === suggestedLineId ? 'selected' : ''}" 
             onclick="selectLine('${line.id}')">
            <div class="line-option-header">
                <span class="line-option-name">${line.name}</span>
                <span class="line-efficiency">⚡ ${line.efficiency}%</span>
            </div>
            <div class="line-option-details">
                Загрузка: ${line.capacity} • Макс. ширина: ${line.maxWidth}мм<br>
                Статус: ${getLineStatusLabel(line.status)}
            </div>
        </div>
    `).join('');

    // Устанавливаем текущее время
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('startTime').value = now.toISOString().slice(0, 16);

    showSidePanel('planningModal');
}

function hidePlanningModal() {
    hideModal('planningModal');
}

function selectLine(lineId) {
    document.querySelectorAll('.line-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.line-option').classList.add('selected');
}

function isLineCompatible(line, order) {
    // Проверяем технические ограничения
    if (order.width > line.maxWidth) return false;
    if (order.materialType && !line.capabilities.includes(order.materialType)) return false;
    return true;
}

function scheduleOrder() {
    const selectedLine = document.querySelector('.line-option.selected');
    const startTime = document.getElementById('startTime').value;
    const priority = document.getElementById('queuePriority').value;

    if (!selectedLine) {
        showToast('Выберите линию производства', 'error');
        return;
    }

    const lineId = selectedLine.onclick.toString().match(/'([^']+)'/)[1];
    showToast(`Заказ запланирован на линию ${lineId} с приоритетом ${priority}`, 'success');
    hidePlanningModal();
    
    // Обновляем данные (в реальном приложении отправили бы на сервер)
    renderOrdersQueue();
    renderProductionLines();
}

// Действия с рекомендациями
function acceptRecommendation(index) {
    showToast('Рекомендация принята', 'success');
    generateRecommendations();
}

function declineRecommendation(index) {
    showToast('Рекомендация отклонена', 'info');
    generateRecommendations();
}

function orderMaterial(orderId) {
    showToast('Заказ материалов отправлен в закупки', 'success');
}

function rescheduleOrder(orderId) {
    showPlanningModal(orderId);
}

function increasePriority(orderId) {
    const order = planningData.queuedOrders.find(o => o.id === orderId);
    if (order) {
        order.priority = 'urgent';
        renderOrdersQueue();
        showToast('Приоритет заказа повышен', 'success');
    }
}

function optimizeLine(lineId) {
    showToast(`Оптимизация линии ${lineId} выполнена`, 'success');
}

// =============================================
// PURCHASING PAGE FUNCTIONS
// =============================================

// Sample data for purchasing
let purchasingData = {
    requests: [
        {
            id: 'req-001',
            materialId: 'mat-001',
            materialName: 'Пленка ПВД прозрачная',
            requiredQuantity: 500,
            unit: 'кг',
            currentStock: 50,
            criticalityLevel: 'critical',
            requestedBy: 'system',
            requestDate: '2024-01-15',
            requiredDate: '2024-01-18',
            status: 'pending',
            suggestedSupplierId: 'sup-001',
            suggestedSupplierName: 'ООО Пластик-Групп',
            notes: 'Критически низкий остаток'
        },
        {
            id: 'req-002',
            materialId: 'mat-002',
            materialName: 'Краситель черный',
            requiredQuantity: 25,
            unit: 'кг',
            currentStock: 15,
            criticalityLevel: 'high',
            requestedBy: 'user-001',
            requestDate: '2024-01-16',
            requiredDate: '2024-01-20',
            status: 'pending',
            suggestedSupplierId: 'sup-002',
            suggestedSupplierName: 'ХимПоставка Лтд',
            notes: 'Для планового производства'
        },
        {
            id: 'req-003',
            materialId: 'mat-003',
            materialName: 'Клей полиуретановый',
            requiredQuantity: 100,
            unit: 'кг',
            currentStock: 80,
            criticalityLevel: 'medium',
            requestedBy: 'system',
            requestDate: '2024-01-17',
            requiredDate: '2024-01-22',
            status: 'approved',
            suggestedSupplierId: 'sup-003',
            suggestedSupplierName: 'СпецХим',
            notes: 'Плановая закупка'
        }
    ],
    orders: [
        {
            id: 'po-001',
            number: 'PO-2024/0012',
            supplierId: 'sup-001',
            supplierName: 'ООО Пластик-Групп',
            items: [
                { materialName: 'Пленка ПВД прозрачная', quantity: 1000, unit: 'кг', price: 120 },
                { materialName: 'Пленка ПВД цветная', quantity: 500, unit: 'кг', price: 135 }
            ],
            totalAmount: 187500,
            currency: 'RUB',
            orderDate: '2024-01-10',
            requestedDeliveryDate: '2024-01-18',
            confirmedDeliveryDate: '2024-01-19',
            status: 'confirmed',
            paymentTerms: '30 дней',
            deliveryTerms: 'EXW склад поставщика',
            createdBy: 'manager-001'
        },
        {
            id: 'po-002',
            number: 'PO-2024/0013',
            supplierId: 'sup-002',
            supplierName: 'ХимПоставка Лтд',
            items: [
                { materialName: 'Краситель черный', quantity: 50, unit: 'кг', price: 850 },
                { materialName: 'Краситель красный', quantity: 25, unit: 'кг', price: 920 }
            ],
            totalAmount: 65500,
            currency: 'RUB',
            orderDate: '2024-01-12',
            requestedDeliveryDate: '2024-01-20',
            confirmedDeliveryDate: null,
            status: 'sent',
            paymentTerms: '14 дней',
            deliveryTerms: 'FCA склад поставщика',
            createdBy: 'manager-002'
        }
    ],
    deliveries: [
        {
            id: 'del-001',
            purchaseOrderId: 'po-001',
            supplierName: 'ООО Пластик-Групп',
            deliveryDate: '2024-01-18',
            status: 'scheduled',
            items: 'Пленка ПВД прозрачная (1000 кг), Пленка ПВД цветная (500 кг)',
            documentsReady: true,
            notes: 'Поставка согласно графику'
        },
        {
            id: 'del-002',
            purchaseOrderId: 'po-002',
            supplierName: 'ХимПоставка Лтд',
            deliveryDate: '2024-01-18',
            status: 'delivered',
            items: 'Краситель черный (50 кг)',
            documentsReady: true,
            notes: 'Частичная поставка'
        }
    ],
    suppliers: [
        {
            id: 'sup-001',
            name: 'ООО Пластик-Групп',
            categories: ['Полимеры', 'Пленки'],
            rating: 4.8,
            paymentTerms: '30 дней',
            activeOrders: 3,
            contact: '+7 (495) 123-45-67',
            email: 'orders@plastik-group.ru',
            address: 'Москва, ул. Промышленная, 15'
        },
        {
            id: 'sup-002',
            name: 'ХимПоставка Лтд',
            categories: ['Красители', 'Добавки'],
            rating: 4.5,
            paymentTerms: '14 дней',
            activeOrders: 1,
            contact: '+7 (812) 987-65-43',
            email: 'sales@himpostavka.ru',
            address: 'СПб, пр. Химиков, 42'
        },
        {
            id: 'sup-003',
            name: 'СпецХим',
            categories: ['Клеи', 'Растворители'],
            rating: 4.2,
            paymentTerms: '21 день',
            activeOrders: 0,
            contact: '+7 (383) 555-22-11',
            email: 'info@spechim.ru',
            address: 'Новосибирск, ул. Химическая, 8'
        }
    ]
};

// Main purchasing page loader
function loadPurchasingPage() {
    updatePurchasingSummary();
    showPurchasingTab('requests');
}

// Update purchasing summary metrics
function updatePurchasingSummary() {
    const pendingRequests = purchasingData.requests.filter(r => r.status === 'pending').length;
    const onOrderValue = purchasingData.orders.reduce((sum, order) => 
        order.status !== 'completed' ? sum + order.totalAmount : sum, 0);
    const deliveredToday = purchasingData.deliveries.filter(d => 
        d.deliveryDate === '2024-01-18' && d.status === 'delivered').length;

    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('onOrderValue').textContent = '€' + Math.round(onOrderValue / 90) + 'K';
    document.getElementById('deliveredToday').textContent = deliveredToday;
    document.getElementById('budgetVariance').textContent = '-2.1%';
}

// Show purchasing tab
function showPurchasingTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.purchasing-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById('purchasing' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    event.target.classList.add('active');

    // Load tab content
    switch(tabName) {
        case 'requests':
            loadPurchaseRequests();
            break;
        case 'orders':
            loadPurchaseOrders();
            break;
        case 'deliveries':
            loadDeliveries();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
    }
}

// Load purchase requests
function loadPurchaseRequests() {
    const tbody = document.getElementById('purchaseRequestsTable');
    if (!tbody) return;

    tbody.innerHTML = purchasingData.requests.map(request => `
        <tr>
            <td>
                <div><strong>${request.materialName}</strong></div>
                <div style="font-size: 0.75rem; color: #6b7280;">${request.materialId}</div>
            </td>
            <td>${request.requiredQuantity} ${request.unit}</td>
            <td>${request.currentStock} ${request.unit}</td>
            <td>
                <span class="criticality-badge ${request.criticalityLevel}">
                    ${getCriticalityLabel(request.criticalityLevel)}
                </span>
            </td>
            <td>${request.suggestedSupplierName}</td>
            <td>${formatDate(request.requiredDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="createPOFromRequest('${request.id}')">📋</button>
                    <button class="btn btn-sm btn-secondary" onclick="editRequest('${request.id}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="rejectRequest('${request.id}')">❌</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load purchase orders
function loadPurchaseOrders() {
    const tbody = document.getElementById('purchaseOrdersTable');
    if (!tbody) return;

    tbody.innerHTML = purchasingData.orders.map(order => `
        <tr>
            <td>
                <a href="#" onclick="showPODetails('${order.id}')" class="order-number-link">${order.number}</a>
            </td>
            <td>${order.supplierName}</td>
            <td>
                <div class="materials-list">
                    ${order.items.map(item => 
                        `<span class="material-item">${item.materialName} (${item.quantity} ${item.unit})</span>`
                    ).join('')}
                </div>
            </td>
            <td>${order.totalAmount.toLocaleString()} ${order.currency}</td>
            <td>
                <span class="po-status-badge ${order.status}">
                    ${getPOStatusLabel(order.status)}
                </span>
            </td>
            <td>${formatDate(order.requestedDeliveryDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showPODetails('${order.id}')">👁️</button>
                    <button class="btn btn-sm btn-secondary" onclick="editPO('${order.id}')">✏️</button>
                    <button class="btn btn-sm btn-warning" onclick="trackPO('${order.id}')">📍</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load deliveries
function loadDeliveries() {
    const deliveriesList = document.getElementById('deliveriesList');
    if (!deliveriesList) return;

    deliveriesList.innerHTML = purchasingData.deliveries.map(delivery => `
        <div class="delivery-card">
            <div class="delivery-header">
                <span class="delivery-supplier">${delivery.supplierName}</span>
                <span class="delivery-date">${formatDate(delivery.deliveryDate)}</span>
            </div>
            <div class="delivery-items">${delivery.items}</div>
            <div class="delivery-actions">
                <button class="btn btn-sm btn-success" onclick="acceptDelivery('${delivery.id}')">✅ Принять</button>
                <button class="btn btn-sm btn-warning" onclick="postponeDelivery('${delivery.id}')">⏳ Перенести</button>
                <button class="btn btn-sm btn-danger" onclick="rejectDelivery('${delivery.id}')">❌ Отклонить</button>
            </div>
        </div>
    `).join('');
}

// Load suppliers in purchasing context
function loadSuppliers() {
    const tbody = document.getElementById('suppliersTable');
    if (!tbody) return;

    tbody.innerHTML = purchasingData.suppliers.map(supplier => `
        <tr>
            <td>
                <div><strong>${supplier.name}</strong></div>
                <div style="font-size: 0.75rem; color: #6b7280;">${supplier.address}</div>
            </td>
            <td>${supplier.categories.join(', ')}</td>
            <td>
                <div class="supplier-rating">
                    <span class="rating-stars">${'★'.repeat(Math.floor(supplier.rating))}${'☆'.repeat(5-Math.floor(supplier.rating))}</span>
                    <span class="rating-value">${supplier.rating}</span>
                </div>
            </td>
            <td>${supplier.paymentTerms}</td>
            <td>${supplier.activeOrders}</td>
            <td>
                <div style="font-size: 0.75rem;">
                    <div>${supplier.contact}</div>
                    <div>${supplier.email}</div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showSupplierDetails('${supplier.id}')">👁️</button>
                    <button class="btn btn-sm btn-secondary" onclick="editSupplier('${supplier.id}')">✏️</button>
                    <button class="btn btn-sm btn-success" onclick="createPOForSupplier('${supplier.id}')">🛒</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Utility functions
function getCriticalityLabel(level) {
    const labels = {
        'low': 'Низкая',
        'medium': 'Средняя', 
        'high': 'Высокая',
        'critical': 'Критическая'
    };
    return labels[level] || level;
}

function getPOStatusLabel(status) {
    const labels = {
        'draft': 'Черновик',
        'sent': 'Отправлен',
        'confirmed': 'Подтвержден',
        'partially_delivered': 'Частично доставлен',
        'completed': 'Выполнен'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Action functions (placeholders)
function generateMRPRequests() {
    showToast('Генерация MRP заявок выполнена. Добавлено 3 новые заявки.', 'success');
    // Reload requests
    setTimeout(() => loadPurchaseRequests(), 1000);
}

function showCreateRequestModal() {
    showToast('Модал создания заявки на закупку будет реализован в следующей версии', 'info');
}

function createPOFromRequest(requestId) {
    showToast(`Создание заказа поставщику из заявки ${requestId}`, 'success');
}

function editRequest(requestId) {
    showToast(`Редактирование заявки ${requestId}`, 'info');
}

function rejectRequest(requestId) {
    showToast(`Заявка ${requestId} отклонена`, 'warning');
}

function showCreatePOModal() {
    showToast('Модал создания заказа поставщику будет реализован в следующей версии', 'info');
}

function showPODetails(orderId) {
    showToast(`Детали заказа ${orderId} будут показаны в боковой панели`, 'info');
}

function editPO(orderId) {
    showToast(`Редактирование заказа ${orderId}`, 'info');
}

function trackPO(orderId) {
    showToast(`Отслеживание заказа ${orderId}`, 'info');
}

function exportPurchaseOrders() {
    showToast('Экспорт заказов поставщикам выполнен', 'success');
}

function filterDeliveries() {
    showToast('Фильтры применены к списку поставок', 'success');
}

function acceptDelivery(deliveryId) {
    showToast(`Поставка ${deliveryId} принята`, 'success');
}

function postponeDelivery(deliveryId) {
    showToast(`Поставка ${deliveryId} перенесена`, 'warning');
}

function rejectDelivery(deliveryId) {
    showToast(`Поставка ${deliveryId} отклонена`, 'error');
}

function importSuppliers() {
    showToast('Импорт поставщиков будет реализован в следующей версии', 'info');
}

function showCreateSupplierModal() {
    showToast('Модал создания поставщика будет реализован в следующей версии', 'info');
}

function showSupplierDetails(supplierId) {
    showToast(`Детали поставщика ${supplierId} будут показаны в боковой панели`, 'info');
}

function createPOForSupplier(supplierId) {
    showToast(`Создание заказа для поставщика ${supplierId}`, 'success');
}

// =============================================
// INVENTORY PAGE FUNCTIONS
// =============================================

// Sample data for inventory
let inventoryData = {
    materials: [
        {
            id: 'batch-001',
            materialId: 'MAT-001',
            materialCode: 'MAT-001',
            materialName: 'Пленка ПВД прозрачная',
            type: 'raw_material',
            category: 'granulate',
            magLocation: 'MAG1',
            batchNumber: 'B240115001',
            supplierBatch: 'SP-2024-0089',
            quantity: 850,
            originalQuantity: 1000,
            unit: 'кг',
            status: 'released',
            expiryDate: '2025-01-15',
            receivedDate: '2024-01-15',
            supplierId: 'sup-001',
            supplierName: 'ООО Пластик-Групп',
            certificates: ['cert-001.pdf'],
            minStock: 200,
            reorderPoint: 300
        },
        {
            id: 'batch-002',
            materialId: 'MAT-002',
            materialCode: 'MAT-002',
            materialName: 'Краситель черный',
            type: 'raw_material',
            category: 'masterbatch',
            magLocation: 'MAG1',
            batchNumber: 'B240116001',
            supplierBatch: 'HC-2024-0012',
            quantity: 45,
            originalQuantity: 50,
            unit: 'кг',
            status: 'released',
            expiryDate: '2026-06-16',
            receivedDate: '2024-01-16',
            supplierId: 'sup-002',
            supplierName: 'ХимПоставка Лтд',
            certificates: ['cert-002.pdf'],
            minStock: 100,
            reorderPoint: 150
        },
        {
            id: 'batch-003',
            materialId: 'MAT-003',
            materialCode: 'MAT-003',
            materialName: 'Клей полиуретановый',
            type: 'raw_material',
            category: 'adhesive',
            magLocation: 'MAG5',
            batchNumber: 'B240117001',
            supplierBatch: 'SC-2024-0034',
            quantity: 25,
            originalQuantity: 100,
            unit: 'кг',
            status: 'blocked',
            expiryDate: '2024-12-17',
            receivedDate: '2024-01-17',
            supplierId: 'sup-003',
            supplierName: 'СпецХим',
            certificates: [],
            minStock: 50,
            reorderPoint: 75,
            blockReason: 'Несоответствие по вязкости'
        },
        {
            id: 'batch-004',
            materialId: 'MAT-004',
            materialCode: 'MAT-004',
            materialName: 'Пленка готовая 30мкм',
            type: 'finished_good',
            category: 'finished_product',
            magLocation: 'MAG9',
            batchNumber: 'B240118001',
            supplierBatch: null,
            quantity: 1200,
            originalQuantity: 1200,
            unit: 'кг',
            status: 'released',
            expiryDate: null,
            receivedDate: '2024-01-18',
            supplierId: null,
            supplierName: 'Собственное производство',
            certificates: ['qc-001.pdf'],
            minStock: 500,
            reorderPoint: 800
        }
    ],
    movements: [
        {
            id: 'mov-001',
            batchId: 'batch-001',
            materialName: 'Пленка ПВД прозрачная',
            batchNumber: 'B240115001',
            type: 'receipt',
            fromMag: '',
            toMag: 'MAG1',
            quantity: 1000,
            reason: 'Поступление от поставщика',
            referenceDocument: 'PO-2024/0012',
            performedBy: 'warehouse-001',
            timestamp: '2024-01-15 09:30:00',
            notes: 'Полное поступление согласно заказу'
        },
        {
            id: 'mov-002',
            batchId: 'batch-001',
            materialName: 'Пленка ПВД прозрачная',
            batchNumber: 'B240115001',
            type: 'issue',
            fromMag: 'MAG1',
            toMag: '',
            quantity: 150,
            reason: 'Расход на производство',
            referenceDocument: 'JOB-2024/0025',
            performedBy: 'operator-001',
            timestamp: '2024-01-16 14:15:00',
            notes: 'Расход на заказ ORD-001'
        },
        {
            id: 'mov-003',
            batchId: 'batch-003',
            materialName: 'Клей полиуретановый',
            batchNumber: 'B240117001',
            type: 'transfer',
            fromMag: 'MAG1',
            toMag: 'MAG5',
            quantity: 100,
            reason: 'Перемещение в зону ламинации',
            referenceDocument: 'TRF-2024/0008',
            performedBy: 'warehouse-002',
            timestamp: '2024-01-17 11:45:00',
            notes: 'Подготовка к производству'
        }
    ],
    stocktakingPlans: [
        {
            id: 'st-001',
            name: 'Инвентаризация MAG1',
            planDate: '2024-01-25',
            status: 'planned',
            magLocations: ['MAG1'],
            responsible: 'warehouse-001',
            progress: 0
        },
        {
            id: 'st-002',
            name: 'Годовая инвентаризация',
            planDate: '2024-02-01',
            status: 'in_progress',
            magLocations: ['MAG1', 'MAG2', 'MAG3', 'MAG4', 'MAG5', 'MAG7', 'MAG9'],
            responsible: 'manager-001',
            progress: 35
        }
    ]
};

// Filter state
let inventoryFilters = {
    mag: '',
    type: '',
    quality: '',
    supplier: ''
};

// Main inventory page loader
function loadInventoryPage() {
    updateInventorySummary();
    showInventoryTab('materials');
}

// Update inventory summary metrics
function updateInventorySummary() {
    const totalItems = inventoryData.materials.length;
    const criticalStock = inventoryData.materials.filter(m => 
        m.quantity <= m.reorderPoint && m.status === 'released').length;
    const blockedItems = inventoryData.materials.filter(m => m.status === 'blocked').length;
    const totalValue = inventoryData.materials.reduce((sum, m) => sum + (m.quantity * 50), 0); // Mock calculation

    document.getElementById('totalItems').textContent = totalItems.toLocaleString();
    document.getElementById('criticalStock').textContent = criticalStock;
    document.getElementById('blockedItems').textContent = blockedItems;
    document.getElementById('availableValue').textContent = '€' + Math.round(totalValue / 1000) + 'K';
}

// Show inventory tab
function showInventoryTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.inventory-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById('inventory' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    event.target.classList.add('active');

    // Load tab content
    switch(tabName) {
        case 'materials':
            loadInventoryMaterials();
            break;
        case 'critical':
            loadCriticalStock();
            break;
        case 'blocked':
            loadBlockedMaterials();
            break;
        case 'movements':
            loadInventoryMovements();
            break;
        case 'stocktaking':
            loadStocktaking();
            break;
    }
}

// Load inventory materials
function loadInventoryMaterials() {
    const tbody = document.getElementById('inventoryMaterialsTable');
    if (!tbody) return;

    const filteredMaterials = inventoryData.materials.filter(material => {
        return (!inventoryFilters.mag || material.magLocation === inventoryFilters.mag) &&
               (!inventoryFilters.type || material.type === inventoryFilters.type) &&
               (!inventoryFilters.quality || material.status === inventoryFilters.quality) &&
               (!inventoryFilters.supplier || material.supplierId === inventoryFilters.supplier);
    });

    tbody.innerHTML = filteredMaterials.map(material => `
        <tr>
            <td>
                <div><strong>${material.materialName}</strong></div>
                <div style="font-size: 0.75rem; color: #6b7280;">${material.materialCode}</div>
                <span class="material-type-badge ${material.type}">${getMaterialTypeLabel(material.type)}</span>
            </td>
            <td>
                <span class="mag-badge">${material.magLocation}</span>
            </td>
            <td>
                <span class="batch-number">${material.batchNumber}</span>
                ${material.supplierBatch ? `<div style="font-size: 0.6875rem; color: #6b7280;">Поставщик: ${material.supplierBatch}</div>` : ''}
            </td>
            <td>${material.quantity} ${material.unit}</td>
            <td>
                <span class="quality-badge ${material.status}">${getQualityStatusLabel(material.status)}</span>
            </td>
            <td>
                ${material.expiryDate ? 
                    `<span class="${getExpiryClass(material.expiryDate)}">${formatDate(material.expiryDate)}</span>` : 
                    '<span style="color: #6b7280;">Без срока</span>'
                }
            </td>
            <td>${material.supplierName}</td>
            <td>${formatDate(material.receivedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showBatchDetails('${material.id}')">👁️</button>
                    <button class="btn btn-sm btn-secondary" onclick="moveBatch('${material.id}')">📋</button>
                    <button class="btn btn-sm btn-warning" onclick="adjustQuantity('${material.id}')">⚖️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load critical stock
function loadCriticalStock() {
    const tbody = document.getElementById('inventoryCriticalTable');
    if (!tbody) return;

    const criticalMaterials = inventoryData.materials.filter(m => 
        m.quantity <= m.reorderPoint && m.status === 'released');

    tbody.innerHTML = criticalMaterials.map(material => {
        const daysToZero = Math.max(0, Math.floor(material.quantity / 10)); // Mock calculation
        const suggestedOrder = material.reorderPoint - material.quantity + 100;
        const criticalityLevel = material.quantity <= material.minStock ? 'critical' : 'high';

        return `
            <tr>
                <td>
                    <div><strong>${material.materialName}</strong></div>
                    <div style="font-size: 0.75rem; color: #6b7280;">${material.materialCode}</div>
                </td>
                <td>${material.quantity} ${material.unit}</td>
                <td>${material.reorderPoint} ${material.unit}</td>
                <td>
                    <div class="criticality-indicator">
                        <div class="criticality-level ${criticalityLevel}"></div>
                        <span>${criticalityLevel === 'critical' ? 'Критическая' : 'Высокая'}</span>
                    </div>
                </td>
                <td>${daysToZero} дней</td>
                <td>${suggestedOrder} ${material.unit}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="createPurchaseRequest('${material.materialId}')">🛒</button>
                        <button class="btn btn-sm btn-warning" onclick="adjustReorderPoint('${material.id}')">⚖️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load blocked materials
function loadBlockedMaterials() {
    const tbody = document.getElementById('inventoryBlockedTable');
    if (!tbody) return;

    const blockedMaterials = inventoryData.materials.filter(m => m.status === 'blocked');

    tbody.innerHTML = blockedMaterials.map(material => `
        <tr>
            <td>
                <div><strong>${material.materialName}</strong></div>
                <div style="font-size: 0.75rem; color: #6b7280;">${material.materialCode}</div>
            </td>
            <td>
                <span class="batch-number">${material.batchNumber}</span>
            </td>
            <td>${material.quantity} ${material.unit}</td>
            <td>${material.blockReason || 'Контроль качества'}</td>
            <td>${formatDate(material.receivedDate)}</td>
            <td>QC Manager</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-success" onclick="unblockMaterial('${material.id}')">🔓</button>
                    <button class="btn btn-sm btn-danger" onclick="scrapMaterial('${material.id}')">🗑️</button>
                    <button class="btn btn-sm btn-primary" onclick="requestRetest('${material.id}')">🔬</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load inventory movements
function loadInventoryMovements() {
    const tbody = document.getElementById('inventoryMovementsTable');
    if (!tbody) return;

    tbody.innerHTML = inventoryData.movements.map(movement => `
        <tr>
            <td>${formatDateTime(movement.timestamp)}</td>
            <td>
                <div><strong>${movement.materialName}</strong></div>
            </td>
            <td>
                <span class="batch-number">${movement.batchNumber}</span>
            </td>
            <td>
                <span class="movement-badge ${movement.type}">${getMovementTypeLabel(movement.type)}</span>
            </td>
            <td>
                ${movement.fromMag ? movement.fromMag : '—'} → ${movement.toMag ? movement.toMag : '—'}
            </td>
            <td>${movement.quantity} кг</td>
            <td>${movement.referenceDocument}</td>
            <td>${movement.performedBy}</td>
        </tr>
    `).join('');
}

// Load stocktaking
function loadStocktaking() {
    const plansList = document.getElementById('stocktakingPlansList');
    if (!plansList) return;

    plansList.innerHTML = inventoryData.stocktakingPlans.map(plan => `
        <div class="stocktaking-plan ${plan.status === 'in_progress' ? 'active' : ''}" onclick="selectStocktakingPlan('${plan.id}')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong>${plan.name}</strong>
                <span class="stocktaking-status">${getStocktakingStatusLabel(plan.status)}</span>
            </div>
            <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">
                Дата: ${formatDate(plan.planDate)} | Ответственный: ${plan.responsible}
            </div>
            <div style="font-size: 0.875rem; color: #6b7280;">
                Склады: ${plan.magLocations.join(', ')}
            </div>
            ${plan.status === 'in_progress' ? 
                `<div style="margin-top: 0.5rem;">
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px;">
                        <div style="background: #3b82f6; height: 100%; width: ${plan.progress}%; border-radius: 2px;"></div>
                    </div>
                    <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Прогресс: ${plan.progress}%</div>
                </div>` : ''
            }
        </div>
    `).join('');
}

// MAG warehouse details
function showMagDetails(magId) {
    const magMaterials = inventoryData.materials.filter(m => m.magLocation === magId);
    const totalQuantity = magMaterials.reduce((sum, m) => sum + m.quantity, 0);
    
    showToast(`${magId}: ${magMaterials.length} позиций, ${totalQuantity} кг общий вес`, 'info');
}

// Utility functions
function getMaterialTypeLabel(type) {
    const labels = {
        'raw_material': 'Сырье',
        'semi_finished': 'Полуфабрикат',
        'finished_good': 'Готовая продукция'
    };
    return labels[type] || type;
}

function getQualityStatusLabel(status) {
    const labels = {
        'quarantine': 'Карантин',
        'released': 'Разрешен',
        'blocked': 'Заблокирован'
    };
    return labels[status] || status;
}

function getMovementTypeLabel(type) {
    const labels = {
        'receipt': 'Приход',
        'issue': 'Расход',
        'transfer': 'Перемещение',
        'adjustment': 'Корректировка'
    };
    return labels[type] || type;
}

function getStocktakingStatusLabel(status) {
    const labels = {
        'planned': 'Запланирована',
        'in_progress': 'В процессе',
        'completed': 'Завершена'
    };
    return labels[status] || status;
}

function getExpiryClass(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) return 'expiry-warning';
    if (daysToExpiry < 30) return 'expiry-soon';
    return '';
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Filter functions
function applyInventoryFilters() {
    inventoryFilters.mag = document.getElementById('magFilter').value;
    inventoryFilters.type = document.getElementById('typeFilter').value;
    inventoryFilters.quality = document.getElementById('qualityFilter').value;
    inventoryFilters.supplier = document.getElementById('supplierFilter').value;
    
    loadInventoryMaterials();
    showToast('Фильтры применены', 'success');
}

function resetInventoryFilters() {
    inventoryFilters = { mag: '', type: '', quality: '', supplier: '' };
    
    document.getElementById('magFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('qualityFilter').value = '';
    document.getElementById('supplierFilter').value = '';
    
    loadInventoryMaterials();
    showToast('Фильтры сброшены', 'info');
}

// Action functions (placeholders)
function showReceiptModal() {
    showToast('Модал прихода материала будет реализован в следующей версии', 'info');
}

function exportInventory() {
    showToast('Экспорт данных склада выполнен', 'success');
}

function showStocktakingModal() {
    showToast('Модал инвентаризации будет реализован в следующей версии', 'info');
}

function showBatchDetails(batchId) {
    showToast(`Детали партии ${batchId} будут показаны в боковой панели`, 'info');
}

function moveBatch(batchId) {
    showToast(`Перемещение партии ${batchId}`, 'info');
}

function adjustQuantity(batchId) {
    showToast(`Корректировка количества партии ${batchId}`, 'info');
}

function createPurchaseRequest(materialId) {
    showToast(`Создана заявка на закупку для материала ${materialId}`, 'success');
}

function adjustReorderPoint(batchId) {
    showToast(`Корректировка точки заказа для партии ${batchId}`, 'info');
}

function generatePurchaseRequests() {
    showToast('Сгенерированы заявки на закупку для всех критических остатков', 'success');
}

function unblockMaterial(batchId) {
    showToast(`Материал партии ${batchId} разблокирован`, 'success');
}

function scrapMaterial(batchId) {
    showToast(`Материал партии ${batchId} списан как брак`, 'warning');
}

function requestRetest(batchId) {
    showToast(`Запрошен повторный анализ партии ${batchId}`, 'info');
}

function massUnblock() {
    showToast('Массовая разблокировка материалов выполнена', 'success');
}

function filterMovements() {
    showToast('Фильтр движений применен', 'success');
}

function exportMovements() {
    showToast('Экспорт движений выполнен', 'success');
}

function showCreateStocktakingModal() {
    showToast('Модал создания плана инвентаризации будет реализован в следующей версии', 'info');
}

function selectStocktakingPlan(planId) {
    document.querySelectorAll('.stocktaking-plan').forEach(plan => {
        plan.classList.remove('active');
    });
    event.target.closest('.stocktaking-plan').classList.add('active');
    
    showToast(`Выбран план инвентаризации ${planId}`, 'info');
}

// =============================================
// PRODUCTION PAGE FUNCTIONS
// =============================================

// Sample data for production
let productionData = {
    oeeMetrics: {
        availability: 92.1,
        performance: 89.5,
        quality: 98.2,
        oee: 80.9,
        changes: {
            availability: 2.1,
            performance: -1.2,
            quality: 0.8,
            oee: 1.7
        }
    },
    productionJobs: [
        {
            id: 'job-156',
            number: 'JOB-2024/0156',
            orderId: 'ord-001',
            productName: 'Пленка ПВД 30мкм',
            lineId: 'extrusion-1',
            status: 'running',
            plannedQuantity: 1250,
            producedQuantity: 850,
            wasteQuantity: 15,
            priority: 1,
            startTime: '2024-01-18 08:00:00',
            assignedOperators: ['operator-001', 'operator-002'],
            parameters: {
                temperature_zones: [180, 185, 190, 185],
                screw_speed: 45,
                line_speed: 78,
                film_thickness: 30,
                sleeve_width: 600
            }
        },
        {
            id: 'job-157',
            number: 'JOB-2024/0157',
            orderId: 'ord-002',
            productName: 'Пленка ПВД цветная',
            lineId: 'extrusion-2',
            status: 'setup',
            plannedQuantity: 800,
            producedQuantity: 0,
            wasteQuantity: 0,
            priority: 2,
            startTime: null,
            assignedOperators: ['operator-003'],
            parameters: null
        },
        {
            id: 'job-158',
            number: 'JOB-2024/0158',
            orderId: 'ord-003',
            productName: 'Ламинация металлизированная',
            lineId: 'lamination-1',
            status: 'running',
            plannedQuantity: 500,
            producedQuantity: 225,
            wasteQuantity: 4,
            priority: 1,
            startTime: '2024-01-18 10:30:00',
            assignedOperators: ['operator-004'],
            parameters: {
                adhesive_rate: 2.5,
                lamination_speed: 25,
                bond_strength: 2.8
            }
        },
        {
            id: 'job-159',
            number: 'JOB-2024/0159',
            orderId: 'ord-004',
            productName: 'Печать логотипа 4+0',
            lineId: 'flexo-1',
            status: 'setup',
            plannedQuantity: 2000,
            producedQuantity: 0,
            wasteQuantity: 0,
            priority: 3,
            startTime: null,
            assignedOperators: ['operator-005', 'operator-006'],
            parameters: null
        },
        {
            id: 'job-160',
            number: 'JOB-2024/0160',
            orderId: 'ord-005',
            productName: 'Этикетки переменные данные',
            lineId: 'digital-1',
            status: 'running',
            plannedQuantity: 10000,
            producedQuantity: 7800,
            wasteQuantity: 30,
            priority: 1,
            startTime: '2024-01-18 07:00:00',
            assignedOperators: ['operator-007'],
            parameters: {
                print_speed: 850,
                ink_viscosity: { cyan: 18, magenta: 19, yellow: 17, black: 20 },
                registration: 0.05
            }
        }
    ],
    productionLines: {
        'extrusion-1': {
            id: 'extrusion-1',
            name: 'Экструзия 1',
            department: 'extrusion',
            status: 'running',
            currentJobId: 'job-156',
            shiftTime: '5ч 23м',
            speed: { current: 78, planned: 80 },
            wasteRate: 1.2,
            efficiency: 97.5
        },
        'extrusion-2': {
            id: 'extrusion-2',
            name: 'Экструзия 2',
            department: 'extrusion',
            status: 'setup',
            currentJobId: 'job-157',
            setupTime: '35 мин',
            setupProgress: 85,
            operator: 'Петров А.И.'
        },
        'extrusion-3': {
            id: 'extrusion-3',
            name: 'Экструзия 3',
            department: 'extrusion',
            status: 'idle',
            currentJobId: null,
            idleReason: 'Ожидание материала',
            idleDetails: 'МАТ-003 - отсутствует',
            idleTime: '2ч 15м',
            plannedStart: '14:30'
        },
        'extrusion-4': {
            id: 'extrusion-4',
            name: 'Экструзия 4',
            department: 'extrusion',
            status: 'stopped',
            currentJobId: null,
            maintenanceReason: 'Плановое ТО',
            maintenanceDetails: 'Замена экструдерного червяка',
            maintenanceTime: '6ч 45м',
            maintenanceProgress: 75
        },
        'lamination-1': {
            id: 'lamination-1',
            name: 'Ламинация 1',
            department: 'lamination',
            status: 'running',
            currentJobId: 'job-158',
            shiftTime: '3ч 45м',
            speed: { current: 25, planned: 30 },
            bondStrength: 2.8,
            wasteRate: 0.8,
            efficiency: 83.3
        },
        'flexo-1': {
            id: 'flexo-1',
            name: 'Флексо 1',
            department: 'printing',
            status: 'setup',
            currentJobId: 'job-159',
            setupReason: 'Смена форм печати',
            setupDetails: 'Регистрация красок',
            setupProgress: 92,
            colorCount: 4
        },
        'digital-1': {
            id: 'digital-1',
            name: 'Цифровая 1',
            department: 'printing',
            status: 'running',
            currentJobId: 'job-160',
            shiftTime: '7ч 12м',
            speed: 850,
            quality: 99.2,
            wasteRate: 0.3,
            efficiency: 95.8
        }
    },
    alerts: [
        {
            id: 'alert-001',
            type: 'critical',
            title: 'Критическое превышение брака',
            message: 'Линия Экструзия 1: брак достиг 2.5% (норма 1.5%)',
            lineId: 'extrusion-1',
            timestamp: '2024-01-18 13:45:00',
            acknowledged: false,
            actions: ['stop_line', 'check_quality', 'adjust_parameters']
        },
        {
            id: 'alert-002',
            type: 'warning',
            title: 'Снижение скорости линии',
            message: 'Ламинация 1: скорость снижена до 25 м/мин (план 30 м/мин)',
            lineId: 'lamination-1',
            timestamp: '2024-01-18 13:30:00',
            acknowledged: false,
            actions: ['check_materials', 'adjust_speed', 'maintenance_check']
        },
        {
            id: 'alert-003',
            type: 'warning',
            title: 'Материал заканчивается',
            message: 'МАТ-003 (Клей полиуретановый): остаток 25 кг',
            lineId: null,
            timestamp: '2024-01-18 13:15:00',
            acknowledged: false,
            actions: ['order_material', 'reschedule_jobs']
        },
        {
            id: 'alert-004',
            type: 'info',
            title: 'Смена задания',
            message: 'Цифровая 1: переход на заказ JOB-2024/0161',
            lineId: 'digital-1',
            timestamp: '2024-01-18 13:00:00',
            acknowledged: true,
            actions: []
        },
        {
            id: 'alert-005',
            type: 'info',
            title: 'Плановое ТО завершено',
            message: 'Экструзия 4: замена червяка завершена на 75%',
            lineId: 'extrusion-4',
            timestamp: '2024-01-18 12:30:00',
            acknowledged: true,
            actions: []
        }
    ]
};

// Current alert filter
let currentAlertFilter = 'all';

// Main production page loader
function loadProductionPage() {
    updateOEEMetrics();
    loadProductionAlerts();
}

// Update OEE metrics display
function updateOEEMetrics() {
    const metrics = productionData.oeeMetrics;
    
    document.getElementById('availabilityMetric').textContent = `${metrics.availability}%`;
    document.getElementById('performanceMetric').textContent = `${metrics.performance}%`;
    document.getElementById('qualityMetric').textContent = `${metrics.quality}%`;
    document.getElementById('oeeMetric').textContent = `${metrics.oee}%`;

    // Update change indicators
    const changes = metrics.changes;
    document.getElementById('availabilityChange').textContent = 
        `${changes.availability > 0 ? '↑' : '↓'} ${Math.abs(changes.availability)}%`;
    document.getElementById('performanceChange').textContent = 
        `${changes.performance > 0 ? '↑' : '↓'} ${Math.abs(changes.performance)}%`;
    document.getElementById('qualityChange').textContent = 
        `${changes.quality > 0 ? '↑' : '↓'} ${Math.abs(changes.quality)}%`;
    document.getElementById('oeeChange').textContent = 
        `${changes.oee > 0 ? '↑' : '↓'} ${Math.abs(changes.oee)}%`;

    // Update change classes
    document.getElementById('availabilityChange').className = 
        `oee-change ${changes.availability > 0 ? 'positive' : 'negative'}`;
    document.getElementById('performanceChange').className = 
        `oee-change ${changes.performance > 0 ? 'positive' : 'negative'}`;
    document.getElementById('qualityChange').className = 
        `oee-change ${changes.quality > 0 ? 'positive' : 'negative'}`;
    document.getElementById('oeeChange').className = 
        `oee-change ${changes.oee > 0 ? 'positive' : 'negative'}`;
}

// Show production line details
function showProductionLineDetails(lineId) {
    const line = productionData.productionLines[lineId];
    const job = productionData.productionJobs.find(j => j.id === line.currentJobId);
    
    let modalContent = `
        <div class="line-details-modal">
            <h3>${line.name} - Детальная информация</h3>
            <div class="line-status-section">
                <p><strong>Статус:</strong> ${getLineStatusText(line.status)}</p>
    `;

    if (job) {
        const progress = Math.round((job.producedQuantity / job.plannedQuantity) * 100);
        modalContent += `
            <p><strong>Текущее задание:</strong> ${job.number}</p>
            <p><strong>Продукт:</strong> ${job.productName}</p>
            <p><strong>Прогресс:</strong> ${progress}% (${job.producedQuantity}/${job.plannedQuantity})</p>
            <p><strong>Брак:</strong> ${job.wasteQuantity} единиц</p>
        `;
    }

    if (line.status === 'running' && line.speed) {
        modalContent += `
            <p><strong>Скорость:</strong> ${line.speed.current}/${line.speed.planned} м/мин</p>
            <p><strong>Эффективность:</strong> ${line.efficiency}%</p>
        `;
    }

    if (line.status === 'setup') {
        modalContent += `
            <p><strong>Наладка:</strong> ${line.setupReason || 'В процессе'}</p>
            <p><strong>Готовность:</strong> ${line.setupProgress}%</p>
        `;
    }

    modalContent += `
            </div>
        </div>
    `;

    showToast(`Детали линии ${line.name} будут показаны в боковой панели`, 'info');
}

// Load production alerts
function loadProductionAlerts() {
    const alertsList = document.getElementById('productionAlertsList');
    if (!alertsList) return;

    const filteredAlerts = productionData.alerts.filter(alert => {
        if (currentAlertFilter === 'all') return true;
        return alert.type === currentAlertFilter;
    });

    alertsList.innerHTML = filteredAlerts.map(alert => `
        <div class="alert-item ${alert.type}" data-alert-id="${alert.id}">
            <div class="alert-icon">${getAlertIcon(alert.type)}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-meta">
                    <span>Время: ${formatDateTime(alert.timestamp)}</span>
                    ${alert.lineId ? `<span>Линия: ${productionData.productionLines[alert.lineId]?.name || alert.lineId}</span>` : ''}
                    <span>Статус: ${alert.acknowledged ? 'Принято' : 'Новое'}</span>
                </div>
            </div>
            <div class="alert-actions">
                ${!alert.acknowledged ? `<button class="alert-action-btn primary" onclick="acknowledgeAlert('${alert.id}')">Принять</button>` : ''}
                ${alert.actions.map(action => 
                    `<button class="alert-action-btn" onclick="executeAlertAction('${alert.id}', '${action}')">${getActionLabel(action)}</button>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

// Filter production alerts
function filterProductionAlerts(filterType) {
    currentAlertFilter = filterType;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadProductionAlerts();
}

// Production line actions
function startProductionLine(lineId) {
    showToast(`Запуск линии ${lineId}`, 'success');
    // Here would be actual API call to start the line
}

function pauseProductionLine(lineId) {
    showToast(`Пауза линии ${lineId}`, 'warning');
    // Here would be actual API call to pause the line
}

function stopProductionLine(lineId) {
    showToast(`Остановка линии ${lineId}`, 'error');
    // Here would be actual API call to stop the line
}

function showLineSettings(lineId) {
    showToast(`Настройки линии ${lineId} будут открыты в боковой панели`, 'info');
    // Here would open line settings modal
}

function showMaintenanceInfo(lineId) {
    const line = productionData.productionLines[lineId];
    showToast(`ТО линии ${line.name}: ${line.maintenanceDetails} (${line.maintenanceProgress}%)`, 'info');
}

// Alert actions
function acknowledgeAlert(alertId) {
    const alert = productionData.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.acknowledged = true;
        loadProductionAlerts();
        showToast('Уведомление принято', 'success');
    }
}

function executeAlertAction(alertId, action) {
    const actionLabels = {
        'stop_line': 'Остановка линии',
        'check_quality': 'Проверка качества',
        'adjust_parameters': 'Корректировка параметров',
        'check_materials': 'Проверка материалов',
        'adjust_speed': 'Корректировка скорости',
        'maintenance_check': 'Проверка оборудования',
        'order_material': 'Заказ материала',
        'reschedule_jobs': 'Перепланирование заданий'
    };
    
    showToast(`Выполнено: ${actionLabels[action] || action}`, 'success');
}

// Utility functions
function getLineStatusText(status) {
    const statusTexts = {
        'running': '🟢 Работает',
        'setup': '🟡 Наладка',
        'idle': '🔴 Простой',
        'stopped': '⚫ Остановлена'
    };
    return statusTexts[status] || status;
}

function getAlertIcon(type) {
    const icons = {
        'critical': '🔴',
        'warning': '🟡',
        'info': '🔵'
    };
    return icons[type] || '📢';
}

function getActionLabel(action) {
    const labels = {
        'stop_line': 'Стоп',
        'check_quality': 'QC',
        'adjust_parameters': 'Настройка',
        'check_materials': 'Материалы',
        'adjust_speed': 'Скорость',
        'maintenance_check': 'ТО',
        'order_material': 'Заказать',
        'reschedule_jobs': 'Перепланировать'
    };
    return labels[action] || action;
}

// Removed duplicate DOMContentLoaded - merged into main init

// =============================================
// MPSYSTEM LINE ACTIONS (Legacy)
// =============================================

function showLineDetails_Legacy(lineId) {
    showToast(`Детали линии ${lineId} будут доступны в модальном окне`, 'info');
}

function pauseLine(lineId) {
    showToast(`Линия ${lineId} поставлена на паузу`, 'warning');
}

function adjustPriority(lineId) {
    showToast(`Приоритет линии ${lineId} изменен`, 'info');
}

function startLine(lineId) {
    showToast(`Линия ${lineId} запущена`, 'success');
}

function checkMaterials(lineId) {
    showToast(`Проверка материалов для линии ${lineId}`, 'info');
}

function completeMaintenance(lineId) {
    showToast(`Наладка линии ${lineId} завершена`, 'success');
}

function scheduleDelay(lineId) {
    showToast(`Задержка для линии ${lineId} запланирована`, 'warning');
}

function rushTest(lineId) {
    showToast(`Тест для ${lineId} ускорен`, 'info');
}

function viewResults(lineId) {
    showToast(`Просмотр результатов ${lineId}`, 'info');
}

function prepareForLamination(lineId) {
    showToast(`Подготовка к ламинации для ${lineId}`, 'info');
}

function checkQueue(lineId) {
    showToast(`Проверка очереди для ${lineId}`, 'info');
}

function checkColors(lineId) {
    showToast(`Проверка цветов для ${lineId}`, 'info');
}

function adjustColors(lineId) {
    showToast(`Настройка цветов для ${lineId}`, 'info');
}

function orderMaterial(material) {
    showToast(`Заказ материала ${material} отправлен`, 'success');
}

function escalateOrder(orderNumber) {
    showToast(`Заказ ${orderNumber} эскалирован`, 'warning');
}

function scheduleQC(batchNumber) {
    showToast(`Контроль качества партии ${batchNumber} запланирован`, 'info');
}

function prepareMaintenance(lineId) {
    showToast(`Подготовка к ТО линии ${lineId}`, 'info');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 MPSYSTEM ERP loaded - DOM готов!');
    console.log('🔧 Инициализация навигации...');
    console.log('📍 MPSYSTEM App initialized');
    
    // Проверяем что все страницы существуют
    const expectedPages = ['dashboard', 'planning', 'production', 'quality', 'warehouse', 'purchasing', 'orders', 'maintenance', 'analytics'];
    const missingPages = [];
    
    expectedPages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (!page) {
            missingPages.push(pageId);
            console.error('❌ Страница не найдена:', pageId);
        } else {
            console.log('✅ Страница найдена:', pageId);
        }
    });
    
    if (missingPages.length > 0) {
        console.error('❌ Отсутствуют страницы:', missingPages);
    } else {
        console.log('✅ Все страницы найдены!');
    }
    
    // Проверяем навигационные кнопки
    const navButtons = document.querySelectorAll('.nav-item');
    console.log('📋 Найдено навигационных кнопок:', navButtons.length);
    
    navButtons.forEach((btn, index) => {
        const text = btn.querySelector('.nav-text')?.textContent || btn.textContent;
        console.log(`🔘 Кнопка ${index + 1}:`, text.trim());
    });
    
    // Проверяем активную страницу
    const activePage = document.querySelector('.tab-content.active');
    if (activePage) {
        console.log('✅ Активная страница:', activePage.id);
    } else {
        console.warn('⚠️ Нет активной страницы, устанавливаю dashboard');
        showTab('dashboard');
    }
    
    // Добавляем event listeners для навигационного меню
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        const pageId = item.getAttribute('data-page');
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Клик по навигации:', pageId);
            navigateToPage(pageId);
        });
    });
    
    console.log('🎯 Event listeners установлены для', navItems.length, 'навигационных элементов');
    
    // Initialize MPSYSTEM
    await updateDashboardStats();
    updateCurrentTime();
    loadOrders();
    loadInventory();
    loadProduction();
    
    // UC-D001: Load initial dashboard data
    await updateDashboardMetrics();
    await loadProductionLinesFromAPI();
    await loadCriticalAlertsFromAPI();
    
    // Auto-update time every second
    setInterval(updateCurrentTime, 1000);
    
    // UC-D001: Auto-update dashboard every 30 seconds (as per ТЗ requirement)
    setInterval(async function() {
        const dashboardTab = document.querySelector('#dashboard.active');
        if (dashboardTab) {
            console.log('🔄 UC-D001: Auto-updating dashboard (30s interval)');
            await updateDashboardMetrics();
            await loadProductionLinesFromAPI();
            await loadCriticalAlertsFromAPI();
        }
    }, 30000);

    // Setup filter handlers for planning page
    const queueFilter = document.getElementById('queueFilter');
    const queueSort = document.getElementById('queueSort');
    
    if (queueFilter) {
        queueFilter.addEventListener('change', renderOrdersQueue);
    }
    if (queueSort) {
        queueSort.addEventListener('change', renderOrdersQueue);
    }
});

// UC-D002: Close modals on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'lineDetailsModal') {
            hideLineDetails();
        } else {
            hideModal(e.target.id);
        }
    }
});

// MPSYSTEM App initialization complete
console.log('✅ MPSYSTEM App initialized successfully!');