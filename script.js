// ERP System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    initializeDashboard();
    setupRealTimeUpdates();
    drawProductionChart();
    setupPlanningModule();
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

// Planning Module Setup
function setupPlanningModule() {
    setupTabNavigation();
    setupPlanningInteractions();
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show target content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function setupPlanningInteractions() {
    // Setup search functionality for planning tables
    const searchInputs = document.querySelectorAll('#planning .search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            filterPlanningTable(this);
        });
    });
    
    // Setup filter functionality
    const filterSelects = document.querySelectorAll('#planning .filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterByPriority(this.value);
        });
    });
}

function filterPlanningTable(searchInput) {
    const searchTerm = searchInput.value.toLowerCase();
    const tableRows = document.querySelectorAll('#new-orders .order-row');
    
    tableRows.forEach(row => {
        const orderText = row.textContent.toLowerCase();
        if (orderText.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterByPriority(priority) {
    const tableRows = document.querySelectorAll('#new-orders .order-row');
    
    tableRows.forEach(row => {
        if (priority === 'Все приоритеты') {
            row.style.display = '';
        } else {
            const orderPriority = row.getAttribute('data-priority');
            if (orderPriority === priority.toLowerCase()) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Planning Functions
function planOrder(orderId) {
    showNotification(`Планирование заказа ${orderId}...`, 'info');
    
    // Simulate planning process
    setTimeout(() => {
        // Create planning modal
        const modal = createPlanningModal(orderId);
        document.body.appendChild(modal);
    }, 500);
}

function createPlanningModal(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Планирование заказа ${orderId}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="planning-sections">
                    <div class="planning-section">
                        <h4>🎯 Автоматические рекомендации</h4>
                        <div class="recommendation-item">
                            <span class="rec-label">Оптимальная линия:</span>
                            <span class="rec-value">Линия 1 (Экструзия)</span>
                        </div>
                        <div class="recommendation-item">
                            <span class="rec-label">Позиция в очереди:</span>
                            <span class="rec-value">После заказа #ORD-2024-005 (прозрачные пленки)</span>
                        </div>
                        <div class="recommendation-item">
                            <span class="rec-label">Время производства:</span>
                            <span class="rec-value">4.5 часа</span>
                        </div>
                        <div class="recommendation-item">
                            <span class="rec-label">Себестоимость:</span>
                            <span class="rec-value">187,250 ₽</span>
                        </div>
                    </div>
                    
                    <div class="planning-section">
                        <h4>📦 Материалы и ресурсы</h4>
                        <div class="materials-list">
                            <div class="material-item available">
                                <span class="material-name">ПВД гранулы</span>
                                <span class="material-amount">2,600кг</span>
                                <span class="material-status">✅ В наличии</span>
                            </div>
                            <div class="material-item available">
                                <span class="material-name">Упаковочная пленка</span>
                                <span class="material-amount">125 рулонов</span>
                                <span class="material-status">✅ В наличии</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="planning-section">
                        <h4>🔄 Маршрут производства</h4>
                        <div class="production-route">
                            <div class="route-step">
                                <span class="step-number">1</span>
                                <span class="step-name">MAG 1 - Подготовка материалов</span>
                                <span class="step-time">30 мин</span>
                            </div>
                            <div class="route-step">
                                <span class="step-number">2</span>
                                <span class="step-name">Экструзия - Производство пленки</span>
                                <span class="step-time">3.5 часа</span>
                            </div>
                            <div class="route-step">
                                <span class="step-number">3</span>
                                <span class="step-name">MAG 3 - Промежуточное хранение</span>
                                <span class="step-time">15 мин</span>
                            </div>
                            <div class="route-step">
                                <span class="step-number">4</span>
                                <span class="step-name">UV-контроль качества</span>
                                <span class="step-time">20 мин</span>
                            </div>
                            <div class="route-step">
                                <span class="step-number">5</span>
                                <span class="step-name">Упаковка и маркировка</span>
                                <span class="step-time">15 мин</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Отменить</button>
                <button class="btn btn-outline" onclick="adjustPlanning('${orderId}')">Настроить план</button>
                <button class="btn btn-primary" onclick="confirmPlanning('${orderId}')">✅ Подтвердить план</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    return modal;
}

function adjustPlanning(orderId) {
    showNotification(`Открытие настроек планирования для ${orderId}`, 'info');
    // Here would be additional adjustment interface
}

function confirmPlanning(orderId) {
    showNotification(`Заказ ${orderId} добавлен в очередь производства!`, 'success');
    closeModal(document.querySelector('.modal-overlay'));
    
    // Update UI to reflect the change
    setTimeout(() => {
        updatePlanningStats();
    }, 1000);
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function viewOrderDetails(orderId) {
    showNotification(`Просмотр детальной информации по заказу ${orderId}`, 'info');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Детали заказа ${orderId}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-details-grid">
                    <div class="detail-section">
                        <h4>📋 Основная информация</h4>
                        <div class="detail-item">
                            <span class="detail-label">Клиент:</span>
                            <span class="detail-value">ООО "ЭкоПак"</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Дата заказа:</span>
                            <span class="detail-value">15.01.2024</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Срок поставки:</span>
                            <span class="detail-value">22.01.2024</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Приоритет:</span>
                            <span class="detail-value critical">🔴 Критический</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>📦 Спецификация продукта</h4>
                        <div class="detail-item">
                            <span class="detail-label">Продукт:</span>
                            <span class="detail-value">Пленка ПВД прозрачная</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Толщина:</span>
                            <span class="detail-value">150 мкм</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ширина рукава:</span>
                            <span class="detail-value">300 мм</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Количество:</span>
                            <span class="detail-value">2,500 кг (≈ 125 рулонов)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Закрыть</button>
                <button class="btn btn-primary" onclick="planOrder('${orderId}')">📋 Планировать</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}

function optimizeQueue() {
    showNotification('Запуск автооптимизации очереди производства...', 'info');
    
    // Simulate optimization process
    setTimeout(() => {
        showNotification('Очередь оптимизирована! Время переналадок сокращено на 35%', 'success');
        updateOptimizationStats();
    }, 2000);
}

function createNewOrder() {
    showNotification('Открытие формы создания нового заказа...', 'info');
    // This would open a new order creation modal
}

function runOptimization() {
    showNotification('Запуск полной автооптимизации производства...', 'info');
    
    setTimeout(() => {
        showNotification('Автооптимизация завершена успешно!', 'success');
        updateOptimizationMetrics();
    }, 3000);
}

function viewOptimizationReport() {
    showNotification('Генерация отчета по оптимизации...', 'info');
    // This would generate and show optimization report
}

function updatePlanningStats() {
    // Update planning statistics
    const stats = {
        newOrders: Math.max(23, Math.floor(Math.random() * 5) + 22),
        inQueue: Math.max(19, Math.floor(Math.random() * 3) + 17),
        inProgress: Math.floor(Math.random() * 3) + 11,
        efficiency: Math.floor(Math.random() * 5) + 90
    };
    
    // Update stat cards if they exist
    const statElements = document.querySelectorAll('.planning-stats .stat-value');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.newOrders;
        statElements[1].textContent = stats.inQueue;
        statElements[2].textContent = stats.inProgress;
        statElements[3].textContent = stats.efficiency + '%';
    }
}

function updateOptimizationStats() {
    const optimizationMetrics = document.querySelectorAll('.optimization-metrics .metric-value');
    if (optimizationMetrics.length >= 3) {
        optimizationMetrics[0].textContent = '-' + (Math.floor(Math.random() * 10) + 30) + '%';
        optimizationMetrics[1].textContent = '+' + (Math.floor(Math.random() * 5) + 15) + '%';
        optimizationMetrics[2].textContent = (Math.floor(Math.random() * 5) + 90) + '%';
    }
}

function updateOptimizationMetrics() {
    // Animate optimization results
    updateOptimizationStats();
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
    updatePlanningStats();
    setupPlanningInteractions();
}

// Warehouse Page
function initializeWarehouse() {
    console.log('Warehouse page initialized');
    setupWarehouseTabs();
    updateWarehouseStats();
    setupTableSearch();
}

function setupWarehouseTabs() {
    const warehousePage = document.getElementById('warehouse');
    if (!warehousePage) return;
    
    const tabButtons = warehousePage.querySelectorAll('.warehouse-tabs .tab-btn');
    const tabContents = warehousePage.querySelectorAll('.warehouse-tabs .tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show target content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Warehouse Functions
function generateMRPRequirements() {
    showNotification('Формирование потребностей MRP...', 'info');
    setTimeout(() => {
        showNotification('Потребности MRP обновлены! Найдено 6 критических позиций', 'success');
    }, 2000);
}

function receiveDelivery() {
    showNotification('Открытие формы приемки поставки...', 'info');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📦 Приемка поставки</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="receive-sections">
                    <div class="receive-section">
                        <h4>🚚 Информация о поставке</h4>
                        <div class="form-group">
                            <label>Номер поставки:</label>
                            <input type="text" placeholder="POST-240119-001" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Поставщик:</label>
                            <select class="form-select">
                                <option>Dow Chemical Europe</option>
                                <option>Siegwerk Druckfarben</option>
                                <option>Henkel Adhesives</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>CMR номер:</label>
                            <input type="text" placeholder="DE-12345-2024" class="form-input">
                        </div>
                    </div>
                    
                    <div class="receive-section">
                        <h4>📋 Документы</h4>
                        <div class="documents-checklist">
                            <label><input type="checkbox"> CMR - Международная накладная</label>
                            <label><input type="checkbox"> WZ - Товарная накладная</label>
                            <label><input type="checkbox"> CoA - Сертификат анализа</label>
                            <label><input type="checkbox"> TDS - Техническая спецификация</label>
                            <label><input type="checkbox"> SDS - Паспорт безопасности</label>
                            <label><input type="checkbox"> DoC - Декларация соответствия</label>
                        </div>
                    </div>
                    
                    <div class="receive-section">
                        <h4>⚖️ Количественная приемка</h4>
                        <div class="quantity-check">
                            <div class="form-group">
                                <label>Заявленный вес:</label>
                                <input type="number" placeholder="5000" class="form-input"> кг
                            </div>
                            <div class="form-group">
                                <label>Фактический вес:</label>
                                <input type="number" placeholder="4985" class="form-input"> кг
                            </div>
                            <div class="form-group">
                                <label>Расхождение:</label>
                                <span class="weight-diff">-15 кг (-0.3%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Отменить</button>
                <button class="btn btn-primary" onclick="confirmReceiving()">✅ Принять поставку</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}

function confirmReceiving() {
    showNotification('Поставка принята! Партия 240119-001 создана и направлена на контроль качества', 'success');
    closeModal(document.querySelector('.modal-overlay'));
}

function viewBatchDetails(batchNumber) {
    showNotification(`Просмотр детальной информации по партии ${batchNumber}`, 'info');
}

function receiveSpecificDelivery(deliveryId) {
    showNotification(`Начата приемка поставки ${deliveryId}`, 'info');
    receiveDelivery();
}

function viewDeliveryDetails(deliveryId) {
    showNotification(`Просмотр деталей поставки ${deliveryId}`, 'info');
}

function traceFromProduct() {
    const input = document.querySelector('.traceability-search .trace-input');
    const value = input.value.trim();
    if (value) {
        showNotification(`Поиск сырья для продукта ${value}...`, 'info');
        setTimeout(() => {
            showNotification('Трейсабилити выполнен! Найдено 3 партии сырья', 'success');
        }, 1500);
    } else {
        showNotification('Введите номер партии продукта', 'error');
    }
}

function traceFromMaterial() {
    const inputs = document.querySelectorAll('.traceability-search .trace-input');
    const value = inputs[1].value.trim();
    if (value) {
        showNotification(`Поиск продуктов из сырья ${value}...`, 'info');
        setTimeout(() => {
            showNotification('Трейсабилити выполнен! Найдено 8 готовых изделий', 'success');
        }, 1500);
    } else {
        showNotification('Введите номер партии сырья', 'error');
    }
}

function approveQuality(batchNumber) {
    showNotification(`Партия ${batchNumber} одобрена к использованию`, 'success');
}

function blockQuality(batchNumber) {
    showNotification(`Партия ${batchNumber} заблокирована`, 'error');
}

function exportInventory() {
    showNotification('Экспорт остатков в Excel...', 'info');
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

// Procurement Page
function initializeOrders() {
    console.log('Procurement page initialized');
    setupProcurementTabs();
    updateProcurementStats();
}

function setupProcurementTabs() {
    const procurementPage = document.getElementById('orders');
    if (!procurementPage) return;
    
    const tabButtons = procurementPage.querySelectorAll('.procurement-tabs .tab-btn');
    const tabContents = procurementPage.querySelectorAll('.procurement-tabs .tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show target content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function updateProcurementStats() {
    const stats = {
        mrpRequirements: Math.floor(Math.random() * 10) + 20,
        ordersInTransit: Math.floor(Math.random() * 5) + 15,
        activeSuppliers: Math.floor(Math.random() * 10) + 40,
        savings: (Math.random() * 2 + 0.5).toFixed(1) + 'M ₽'
    };
    
    const statElements = document.querySelectorAll('.procurement-stats .stat-value');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.mrpRequirements;
        statElements[1].textContent = stats.ordersInTransit;
        statElements[2].textContent = stats.activeSuppliers;
        statElements[3].textContent = stats.savings;
    }
}

// Procurement Functions
function createSpotPurchase() {
    showNotification('Открытие формы срочной закупки...', 'info');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚡ Spot закупка</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="spot-purchase-form">
                    <div class="form-section">
                        <h4>📦 Материал</h4>
                        <div class="form-group">
                            <label>Тип материала:</label>
                            <select class="form-select">
                                <option>Гранулят ПВД</option>
                                <option>Краска печатная</option>
                                <option>Клей полиуретановый</option>
                                <option>Базовая пленка</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Количество:</label>
                            <input type="number" placeholder="1000" class="form-input"> кг
                        </div>
                        <div class="form-group">
                            <label>Крайний срок:</label>
                            <input type="date" class="form-input">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>💰 Условия</h4>
                        <div class="form-group">
                            <label>Максимальная цена:</label>
                            <input type="number" placeholder="250" class="form-input"> ₽/кг
                        </div>
                        <div class="form-group">
                            <label>Условия поставки:</label>
                            <select class="form-select">
                                <option>DAP Москва</option>
                                <option>FCA Склад поставщика</option>
                                <option>DDP Наш склад</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Отменить</button>
                <button class="btn btn-primary" onclick="sendSpotRequest()">📤 Отправить запрос</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}

function sendSpotRequest() {
    showNotification('Запрос отправлен 5 поставщикам! Ожидаем предложения', 'success');
    closeModal(document.querySelector('.modal-overlay'));
}

function createPurchaseOrder() {
    showNotification('Открытие формы создания заказа поставщику...', 'info');
}

function refreshMRP() {
    showNotification('Обновление потребностей MRP...', 'info');
    setTimeout(() => {
        showNotification('MRP обновлен! Найдено 3 новые критические потребности', 'success');
        updateProcurementStats();
    }, 2000);
}

function groupRequirements() {
    showNotification('Группировка заказов по поставщикам...', 'info');
    setTimeout(() => {
        showNotification('Заказы сгруппированы! Оптимизация транспортных расходов на 15%', 'success');
    }, 1500);
}

function createPOFromRequirement(materialCode) {
    showNotification(`Создание заказа поставщику для материала ${materialCode}...`, 'info');
    
    setTimeout(() => {
        showNotification(`Заказ PO-2024-0158 создан и отправлен поставщику`, 'success');
    }, 1000);
}

function findAlternativeSupplier(materialCode) {
    showNotification(`Поиск альтернативных поставщиков для ${materialCode}...`, 'info');
    
    setTimeout(() => {
        showNotification('Найдено 3 альтернативных поставщика с лучшими ценами', 'success');
    }, 1500);
}

function followUpOrder(orderId) {
    showNotification(`Отправка напоминания по заказу ${orderId}...`, 'info');
    setTimeout(() => {
        showNotification('Напоминание отправлено поставщику', 'success');
    }, 1000);
}

function trackDelivery(orderId) {
    showNotification(`Отслеживание доставки заказа ${orderId}...`, 'info');
    setTimeout(() => {
        showNotification('Трекинг активирован. Уведомления о статусе доставки включены', 'success');
    }, 1000);
}

function prepareReceiving(orderId) {
    showNotification(`Подготовка приемки для заказа ${orderId}...`, 'info');
    setTimeout(() => {
        showNotification('Склад уведомлен. Документы подготовлены для приемки', 'success');
    }, 1000);
}

function escalateOrder(orderId) {
    showNotification(`Эскалация проблемного заказа ${orderId}...`, 'info');
    setTimeout(() => {
        showNotification('Уведомление отправлено менеджеру поставщика и руководству', 'error');
    }, 1000);
}

function findAlternativeForOrder(orderId) {
    showNotification(`Поиск альтернативного поставщика для заказа ${orderId}...`, 'info');
    setTimeout(() => {
        showNotification('Найден альтернативный поставщик. Отправка запроса...', 'success');
    }, 2000);
}

function viewSupplierDetails(supplierId) {
    showNotification(`Открытие карточки поставщика ${supplierId}...`, 'info');
}

function reviewSupplier(supplierId) {
    showNotification(`Инициирована ревизия поставщика ${supplierId}`, 'error');
}

function exportContracts() {
    showNotification('Экспорт договоров в Excel...', 'info');
}

function createContract() {
    showNotification('Открытие формы создания нового договора...', 'info');
}

function renewContract(contractId) {
    showNotification(`Начата процедура продления договора ${contractId}...`, 'info');
    setTimeout(() => {
        showNotification('Запрос на продление отправлен поставщику', 'success');
    }, 1000);
}

function viewContract(contractId) {
    showNotification(`Просмотр договора ${contractId}...`, 'info');
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
    
    // Update planning stats every minute
    setInterval(() => {
        const planningPage = document.getElementById('planning');
        if (planningPage && planningPage.classList.contains('active')) {
            updatePlanningStats();
        }
    }, 60000);
    
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
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
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
            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 0;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .modal-content.large {
                max-width: 800px;
            }
            .modal-header {
                padding: 24px 24px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
                margin-bottom: 24px;
            }
            .modal-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #94a3b8;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
            .modal-close:hover {
                background: #f1f5f9;
                color: #64748b;
            }
            .modal-body {
                padding: 0 24px;
                margin-bottom: 24px;
            }
            .modal-footer {
                padding: 24px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            .planning-sections {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .planning-section {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
            }
            .planning-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
            }
            .recommendation-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .recommendation-item:last-child {
                border-bottom: none;
            }
            .rec-label {
                font-weight: 500;
                color: #64748b;
            }
            .rec-value {
                font-weight: 600;
                color: #1e293b;
            }
            .materials-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .material-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
            }
            .material-name {
                font-weight: 500;
                color: #1e293b;
            }
            .material-amount {
                color: #64748b;
            }
            .material-status {
                font-size: 14px;
                font-weight: 500;
                color: #16a34a;
            }
            .production-route {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .route-step {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
            }
            .step-number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                background: #6366f1;
                color: white;
                border-radius: 50%;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }
            .step-name {
                flex: 1;
                font-weight: 500;
                color: #1e293b;
            }
            .step-time {
                font-size: 14px;
                color: #64748b;
                background: #e2e8f0;
                padding: 4px 8px;
                border-radius: 4px;
            }
            .order-details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 24px;
            }
            .detail-section {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
            }
            .detail-section h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
            }
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 500;
                color: #64748b;
            }
            .detail-value {
                font-weight: 600;
                color: #1e293b;
            }
            .detail-value.critical {
                color: #dc2626;
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

// Global error handler
window.addEventListener('error', function(e) {
    console.error('ERP System Error:', e.error);
    showNotification('Произошла ошибка в системе', 'error');
});

// Welcome message
setTimeout(() => {
    showNotification('Добро пожаловать в MPSYSTEM Production ERP XL', 'info');
}, 1000);