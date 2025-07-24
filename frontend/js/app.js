// Main application logic for MP System ERP
class MPSystemERP {
    constructor() {
        this.currentView = 'dashboard';
        this.isAuthenticated = false;
        this.init();
    }
    
    // Initialize the application
    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadView(this.currentView);
        
        if (CONFIG.DEBUG) {
            console.log('MP System ERP initialized');
        }
    }
    
    // Check if user is authenticated
    checkAuthentication() {
        const token = dataManager.getAuthToken();
        this.isAuthenticated = !!token;
        
        if (!this.isAuthenticated) {
            // Redirect to login or show login form
            this.showLoginForm();
        }
    }
    
    // Bind event listeners
    bindEvents() {
        // Navigation events
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.getAttribute('href').substring(1);
                this.loadView(view);
            });
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }
    
    // Load different views
    loadView(viewName) {
        this.currentView = viewName;
        const content = document.getElementById('content');
        
        switch(viewName) {
            case 'dashboard':
                this.loadDashboard(content);
                break;
            case 'inventory':
                this.loadInventory(content);
                break;
            case 'sales':
                this.loadSales(content);
                break;
            case 'reports':
                this.loadReports(content);
                break;
            default:
                this.loadDashboard(content);
        }
        
        this.updateActiveNav(viewName);
    }
    
    // Dashboard view
    loadDashboard(container) {
        container.innerHTML = `
            <h2>Панель управления</h2>
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Общая статистика</h3>
                    <p>Товаров на складе: ${SAMPLE_DATA.inventory.length}</p>
                    <p>Продаж за сегодня: ${SAMPLE_DATA.sales.length}</p>
                </div>
                <div class="dashboard-card">
                    <h3>Быстрые действия</h3>
                    <button onclick="app.loadView('inventory')">Управление складом</button>
                    <button onclick="app.loadView('sales')">Новая продажа</button>
                </div>
            </div>
        `;
        
        this.addDashboardStyles();
    }
    
    // Inventory view
    loadInventory(container) {
        const inventoryHtml = SAMPLE_DATA.inventory.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price} ₽</td>
                <td>
                    <button onclick="app.editItem(${item.id})">Редактировать</button>
                    <button onclick="app.deleteItem(${item.id})">Удалить</button>
                </td>
            </tr>
        `).join('');
        
        container.innerHTML = `
            <h2>Управление складом</h2>
            <button onclick="app.addNewItem()">Добавить товар</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventoryHtml}
                </tbody>
            </table>
        `;
        
        this.addTableStyles();
    }
    
    // Sales view
    loadSales(container) {
        const salesHtml = SAMPLE_DATA.sales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.date}</td>
                <td>${sale.amount} ₽</td>
                <td>${sale.items}</td>
                <td>
                    <button onclick="app.viewSale(${sale.id})">Просмотр</button>
                </td>
            </tr>
        `).join('');
        
        container.innerHTML = `
            <h2>Продажи</h2>
            <button onclick="app.createNewSale()">Новая продажа</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Сумма</th>
                        <th>Товаров</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${salesHtml}
                </tbody>
            </table>
        `;
        
        this.addTableStyles();
    }
    
    // Reports view
    loadReports(container) {
        container.innerHTML = `
            <h2>Отчеты</h2>
            <div class="reports-section">
                <h3>Доступные отчеты</h3>
                <ul>
                    <li><a href="#" onclick="app.generateReport('inventory')">Отчет по складу</a></li>
                    <li><a href="#" onclick="app.generateReport('sales')">Отчет по продажам</a></li>
                    <li><a href="#" onclick="app.generateReport('financial')">Финансовый отчет</a></li>
                </ul>
            </div>
        `;
    }
    
    // Update active navigation item
    updateActiveNav(viewName) {
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${viewName}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Add dynamic styles
    addDashboardStyles() {
        if (!document.getElementById('dashboard-styles')) {
            const style = document.createElement('style');
            style.id = 'dashboard-styles';
            style.textContent = `
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .dashboard-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .dashboard-card button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    margin: 0.25rem;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .dashboard-card button:hover {
                    background: #5a67d8;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addTableStyles() {
        if (!document.getElementById('table-styles')) {
            const style = document.createElement('style');
            style.id = 'table-styles';
            style.textContent = `
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }
                .data-table th,
                .data-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .data-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }
                .data-table button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.25rem 0.5rem;
                    margin: 0 0.25rem;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                .data-table button:hover {
                    background: #5a67d8;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Show login form
    showLoginForm() {
        // For demo purposes, auto-authenticate
        if (CONFIG.DEBUG) {
            console.log('Auto-authenticating for demo');
            dataManager.setAuthToken('demo-token');
            this.isAuthenticated = true;
        }
    }
    
    // Save application state
    saveState() {
        localStorage.setItem('currentView', this.currentView);
    }
    
    // Placeholder methods for UI actions
    editItem(id) {
        alert(`Редактирование товара ID: ${id}`);
    }
    
    deleteItem(id) {
        if (confirm(`Удалить товар ID: ${id}?`)) {
            alert(`Товар ${id} удален`);
        }
    }
    
    addNewItem() {
        alert('Добавление нового товара');
    }
    
    createNewSale() {
        alert('Создание новой продажи');
    }
    
    viewSale(id) {
        alert(`Просмотр продажи ID: ${id}`);
    }
    
    generateReport(type) {
        alert(`Генерация отчета: ${type}`);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MPSystemERP();
});