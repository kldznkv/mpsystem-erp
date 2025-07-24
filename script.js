// ERP System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    initializeDashboard();
    setupRealTimeUpdates();
    drawProductionChart();
    console.log('MPSYSTEM ERP Interface initialized');
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(nl => nl.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show target page
            const targetPage = this.getAttribute('data-page');
            const targetElement = document.getElementById(targetPage);
            if (targetElement) {
                targetElement.classList.add('active');
            }
            
            // Initialize page-specific features
            initializePage(targetPage);
        });
    });
}

function initializePage(pageId) {
    switch(pageId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'planning':
            initializePlanning();
            break;
        case 'warehouse':
            initializeWarehouse();
            break;
        case 'orders':
            initializeOrders();
            break;
        default:
            console.log(`Page ${pageId} initialized`);
    }
}

// Dashboard Functions
function initializeDashboard() {
    updateKPICards();
    updateEquipmentStatus();
    updateActivities();
}

function updateKPICards() {
    // Simulate real-time KPI updates
    const kpiElements = {
        'production-volume': { min: 2000, max: 3000 },
        'efficiency': { min: 85, max: 95, suffix: '%' },
        'orders-count': { min: 100, max: 200 },
        'quality-score': { min: 96, max: 99.5, suffix: '%' }
    };
    
    Object.keys(kpiElements).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const config = kpiElements[elementId];
            const value = (Math.random() * (config.max - config.min) + config.min);
            const formattedValue = config.suffix ? 
                value.toFixed(1) + config.suffix : 
                Math.round(value).toLocaleString();
            
            animateValue(element, formattedValue);
        }
    });
}

function animateValue(element, newValue) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
    }, 100);
}

function updateEquipmentStatus() {
    const equipmentItems = document.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach((item, index) => {
        const indicator = item.querySelector('.equipment-status-indicator');
        const efficiency = item.querySelector('.equipment-efficiency');
        
        if (Math.random() > 0.8) { // 20% chance of maintenance
            indicator.className = 'equipment-status-indicator maintenance';
            efficiency.textContent = '0%';
        } else {
            indicator.className = 'equipment-status-indicator online';
            const efficiencyValue = Math.floor(Math.random() * 15) + 85; // 85-100%
            efficiency.textContent = efficiencyValue + '%';
        }
    });
}

function updateActivities() {
    const activities = [
        { icon: '✅', text: 'Заказ #1247 завершён', time: '2 минуты назад' },
        { icon: '⚠️', text: 'Техническое обслуживание Линии 3', time: '15 минут назад' },
        { icon: '📦', text: 'Поступление материалов на склад', time: '1 час назад' },
        { icon: '🎯', text: 'План выполнен на 103%', time: '2 часа назад' },
        { icon: '🔧', text: 'Настройка оборудования завершена', time: '3 часа назад' },
        { icon: '📊', text: 'Отчет по качеству сгенерирован', time: '4 часа назад' }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        // Randomly shuffle activities
        const shuffled = activities.sort(() => 0.5 - Math.random());
        const selectedActivities = shuffled.slice(0, 4);
        
        activityList.innerHTML = selectedActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-details">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

// Charts
function drawProductionChart() {
    const canvas = document.getElementById('production-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate sample data
    const data = [];
    for (let i = 0; i < 7; i++) {
        data.push(Math.random() * 100 + 50);
    }
    
    // Chart settings
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue;
    
    // Draw grid lines
    ctx.strokeStyle = '#E1E8ED';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Draw line chart
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + (chartWidth / 6) * index;
        const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#3498DB';
    data.forEach((value, index) => {
        const x = padding + (chartWidth / 6) * index;
        const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    days.forEach((day, index) => {
        const x = padding + (chartWidth / 6) * index;
        ctx.fillText(day, x, height - 10);
    });
}

// Planning Page
function initializePlanning() {
    console.log('Planning page initialized');
    
    // Add event listeners for planning actions
    const createPlanBtn = document.querySelector('#planning .btn-primary');
    if (createPlanBtn) {
        createPlanBtn.addEventListener('click', function() {
            showNotification('Функция создания плана будет доступна в следующей версии', 'info');
        });
    }
    
    // Initialize search functionality
    setupTableSearch();
}

// Warehouse Page
function initializeWarehouse() {
    console.log('Warehouse page initialized');
    
    // Add event listeners for warehouse actions
    const addItemBtn = document.querySelector('#warehouse .btn-primary');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            showNotification('Функция добавления товара будет доступна в следующей версии', 'info');
        });
    }
    
    // Simulate warehouse stats updates
    updateWarehouseStats();
    setupTableSearch();
}

function updateWarehouseStats() {
    const stats = {
        total: Math.floor(Math.random() * 5000) + 10000,
        lowStock: Math.floor(Math.random() * 30) + 10,
        capacity: (Math.random() * 5 + 95).toFixed(1) + '%'
    };
    
    const statElements = document.querySelectorAll('#warehouse .stat-value');
    if (statElements.length >= 3) {
        statElements[0].textContent = stats.total.toLocaleString();
        statElements[1].textContent = stats.lowStock;
        statElements[2].textContent = stats.capacity;
    }
}

// Orders Page
function initializeOrders() {
    console.log('Orders page initialized');
    showNotification('Модуль заказов находится в разработке', 'info');
}

// Table Search Functionality
function setupTableSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = this.closest('.table-card').querySelector('.data-table');
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Update dashboard every 30 seconds
    setInterval(() => {
        const dashboardPage = document.getElementById('dashboard');
        if (dashboardPage && dashboardPage.classList.contains('active')) {
            updateKPICards();
            updateEquipmentStatus();
        }
    }, 30000);
    
    // Update activities every 2 minutes
    setInterval(() => {
        const dashboardPage = document.getElementById('dashboard');
        if (dashboardPage && dashboardPage.classList.contains('active')) {
            updateActivities();
        }
    }, 120000);
    
    // Redraw chart every 5 minutes
    setInterval(() => {
        const dashboardPage = document.getElementById('dashboard');
        if (dashboardPage && dashboardPage.classList.contains('active')) {
            drawProductionChart();
        }
    }, 300000);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'info' ? '#3498DB' : type === 'success' ? '#27AE60' : '#E74C3C'};
        color: white;
        padding: 16px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(num);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            showTooltip(this, tooltipText);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #2C3E50;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1001;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('ERP System Error:', e.error);
    showNotification('Произошла ошибка в системе', 'error');
});

// Welcome message
setTimeout(() => {
    showNotification('Добро пожаловать в MPSYSTEM Production ERP XL', 'info');
}, 1000);