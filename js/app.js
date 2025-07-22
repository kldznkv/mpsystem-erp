// MPSYSTEM App Logic
(function() {
    'use strict';
    
    // App state
    const state = {
        currentPage: 'dashboard',
        selectedOrder: null,
        filters: {},
        refreshIntervals: []
    };
    
    // Initialize app
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initDashboard();
        initEventListeners();
        startAutoRefresh();
    });
    
    // Navigation
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.getAttribute('data-page');
                navigateToPage(targetPage);
            });
        });
    }
    
   function navigateToPage(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Update header
    updatePageHeader(pageId);
    
    // Load page data
    loadPageData(pageId);
    
    // Cleanup when leaving production page (ДО обновления state!)
    if (state.currentPage === 'production' && pageId !== 'production') {
        cleanupProduction();
    }
    
    // Update state (это должно быть ПОСЛЕ cleanup!)
    state.currentPage = pageId;
}
    
    function updatePageHeader(pageId) {
        const pageConfigs = {
            dashboard: { title: 'Dashboard', subtitle: 'Real-time production overview' },
            orders: { title: 'Orders Management', subtitle: 'Track and manage production orders' },
            production: { title: 'Production Control', subtitle: 'Monitor production lines and efficiency' },
            inventory: { title: 'Inventory Management', subtitle: 'Warehouse stock and materials' },
            bom: { title: 'BOM & Recipes', subtitle: 'Product specifications and formulas' },
            quality: { title: 'Quality Control', subtitle: 'Testing and compliance tracking' },
            reports: { title: 'Reports & Analytics', subtitle: 'Production insights and metrics' }
        };
        
        const config = pageConfigs[pageId];
        document.querySelector('.page-title').textContent = config.title;
        document.querySelector('.page-subtitle').textContent = config.subtitle;
    }
    
    // Dashboard
    function initDashboard() {
        updateKPIs();
        updateProductionStatus();
        updateOrdersTable();
    }
    
    function updateKPIs() {
        const kpis = DEMO_DATA.kpis;
        
        // Update KPI values (in real app, this would fetch from API)
        // For demo, we'll just use the static data
        
        // Add some animation
        document.querySelectorAll('.kpi-value').forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transition = 'opacity 0.3s ease';
            }, 100);
        });
    }
    
    function updateProductionStatus() {
        const container = document.querySelector('.production-grid');
        if (!container || state.currentPage !== 'dashboard') return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add production cards
        DEMO_DATA.productionLines.forEach(line => {
            const card = createProductionCard(line);
            container.appendChild(card);
        });
    }
    
    function createProductionCard(line) {
        const card = document.createElement('div');
        card.className = 'production-card';
        card.innerHTML = `
            <div class="production-header">
                <div>
                    <h3 class="production-name">${line.name}</h3>
                    <p class="production-product">${line.product}</p>
                </div>
                <span class="status-badge ${line.status}">${formatStatus(line.status)}</span>
            </div>
            <div class="production-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${line.status === 'setup' ? 'warning' : ''}" 
                         style="width: ${line.progress}%"></div>
                </div>
                <span class="progress-text">${line.progress}% complete</span>
            </div>
            <div class="production-metrics">
                ${createMetrics(line.metrics)}
            </div>
        `;
        
        // Add click handler
        card.addEventListener('click', () => showProductionDetails(line));
        
        return card;
    }
    
    function createMetrics(metrics) {
        let html = '';
        if (metrics.speed !== undefined) {
            html += `
                <div class="metric">
                    <span class="metric-label">Speed</span>
                    <span class="metric-value">${metrics.speed} ${metrics.speedUnit}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Output</span>
                    <span class="metric-value">${metrics.output} ${metrics.outputUnit}</span>
                </div>
            `;
        } else if (metrics.nextOrder) {
            html += `
                <div class="metric">
                    <span class="metric-label">Next Order</span>
                    <span class="metric-value">${metrics.nextOrder}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">ETA</span>
                    <span class="metric-value">${metrics.setupTime} min</span>
                </div>
            `;
        }
        return html;
    }
    
    function updateOrdersTable() {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody || state.currentPage !== 'dashboard') return;
        
        tbody.innerHTML = '';
        
        // Show first 5 orders for dashboard
        DEMO_DATA.orders.slice(0, 5).forEach(order => {
            const row = createOrderRow(order);
            tbody.appendChild(row);
        });
    }
    
    function createOrderRow(order) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity.toLocaleString()} ${order.unit}</td>
            <td>${formatDate(order.dueDate)}</td>
            <td><span class="status-badge ${getStatusClass(order.status)}">${formatStatus(order.status)}</span></td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => showOrderDetails(order));
        
        return row;
    }
    
    // Page loaders
    function loadPageData(pageId) {
        switch(pageId) {
            case 'dashboard':
                initDashboard();
                break;
            case 'orders':
                loadOrdersPage();
                break;
            case 'production':
                loadProductionPage();
                break;
            case 'inventory':
                loadInventoryPage();
                break;
            case 'bom':
                loadBOMPage();
                break;
            case 'quality':
                loadQualityPage();
                break;
            case 'reports':
                loadReportsPage();
                break;
        }
    }
    
    // Placeholder page loaders (to be implemented)
    // Orders Page Implementation
    let ordersState = {
        currentPage: 1,
        itemsPerPage: 10,
        sortBy: 'dueDate',
        sortOrder: 'asc',
        filters: {}
    };
    
    function loadOrdersPage() {
    // Check if there's a pending order from BOM
    if (state.pendingOrder) {
        const { bomId, bomData } = state.pendingOrder;
        showNotification(`Creating order based on ${bomData.name}`, 'info');
        // Clear pending order
        state.pendingOrder = null;
        // Open create order dialog with pre-filled data
        setTimeout(() => {
            createNewOrder(bomData);
        }, 500);
    }
    
    updateOrdersSummary();
    renderOrdersTable();
    initOrdersEventListeners();
}
    
    function updateOrdersSummary() {
        // In real app, calculate from filtered data
        const summaryData = {
            total: DEMO_DATA.orders.length,
            inProduction: DEMO_DATA.orders.filter(o => o.status === 'in-production').length,
            scheduled: DEMO_DATA.orders.filter(o => o.status === 'scheduled').length,
            completedToday: 4,
            totalValue: DEMO_DATA.orders.reduce((sum, o) => sum + o.value, 0)
        };
        
        // Update summary cards (would be dynamic in real app)
        const summaryCards = document.querySelectorAll('.summary-card .summary-value');
        if (summaryCards[0]) summaryCards[0].textContent = summaryData.total;
        if (summaryCards[1]) summaryCards[1].textContent = summaryData.inProduction;
        if (summaryCards[2]) summaryCards[2].textContent = summaryData.scheduled;
        if (summaryCards[3]) summaryCards[3].textContent = summaryData.completedToday;
        if (summaryCards[4]) summaryCards[4].textContent = '€' + Math.round(summaryData.totalValue) + 'k';
    }
    
    function renderOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        // Filter and sort orders
        let filteredOrders = filterOrders(DEMO_DATA.orders);
        let sortedOrders = sortOrdersData(filteredOrders);
        
        // Pagination
        const totalPages = Math.ceil(sortedOrders.length / ordersState.itemsPerPage);
        const startIndex = (ordersState.currentPage - 1) * ordersState.itemsPerPage;
        const paginatedOrders = sortedOrders.slice(startIndex, startIndex + ordersState.itemsPerPage);
        
        // Clear and populate table
        tbody.innerHTML = '';
        paginatedOrders.forEach(order => {
            const row = createDetailedOrderRow(order);
            tbody.appendChild(row);
        });
        
        // Update pagination info
        document.getElementById('currentOrderPage').textContent = ordersState.currentPage;
        document.getElementById('totalOrderPages').textContent = totalPages;
    }
    
    function createDetailedOrderRow(order) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity.toLocaleString()} ${order.unit}</td>
            <td>€${order.value.toLocaleString()}</td>
            <td>${formatDate(order.dueDate)}</td>
            <td><span class="priority-badge priority-${order.priority}">${order.priority.toUpperCase()}</span></td>
            <td><span class="status-badge ${getStatusClass(order.status)}">${formatStatus(order.status)}</span></td>
            <td>
                <div class="progress-cell">
                    <div class="progress-mini">
                        <div class="progress-mini-fill" style="width: ${order.progress}%"></div>
                    </div>
                    <span>${order.progress}%</span>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-action" onclick="viewOrder('${order.id}')" title="View">👁️</button>
                    <button class="btn-action" onclick="editOrderItem('${order.id}')" title="Edit">✏️</button>
                    <button class="btn-action" onclick="printOrder('${order.id}')" title="Print">🖨️</button>
                </div>
            </td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.table-actions')) {
                showOrderDetails(order);
            }
        });
        
        return row;
    }
    
    function filterOrders(orders) {
        return orders.filter(order => {
            if (ordersState.filters.status && order.status !== ordersState.filters.status) return false;
            if (ordersState.filters.priority && order.priority !== ordersState.filters.priority) return false;
            if (ordersState.filters.customer && order.customer !== ordersState.filters.customer) return false;
            if (ordersState.filters.dateFrom && new Date(order.dueDate) < new Date(ordersState.filters.dateFrom)) return false;
            if (ordersState.filters.dateTo && new Date(order.dueDate) > new Date(ordersState.filters.dateTo)) return false;
            return true;
        });
    }
    
    function sortOrdersData(orders) {
        return orders.sort((a, b) => {
            let aVal = a[ordersState.sortBy];
            let bVal = b[ordersState.sortBy];
            
            if (ordersState.sortBy === 'dueDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return ordersState.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return ordersState.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    function initOrdersEventListeners() {
        // Add event listeners for filters if they don't exist
        const statusFilter = document.getElementById('orderStatusFilter');
        if (statusFilter && !statusFilter.hasListener) {
            statusFilter.addEventListener('change', (e) => {
                ordersState.filters.status = e.target.value;
            });
            statusFilter.hasListener = true;
        }
    }
    
    // Global functions for orders
    window.sortOrders = function(field) {
        if (ordersState.sortBy === field) {
            ordersState.sortOrder = ordersState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            ordersState.sortBy = field;
            ordersState.sortOrder = 'asc';
        }
        
        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        
        const currentTh = document.querySelector(`.sortable[onclick*="${field}"]`);
        if (currentTh) {
            currentTh.classList.add('sorted-' + ordersState.sortOrder);
        }
        
        renderOrdersTable();
    }
    
    window.applyOrderFilters = function() {
        ordersState.filters = {
            status: document.getElementById('orderStatusFilter').value,
            priority: document.getElementById('orderPriorityFilter').value,
            customer: document.getElementById('orderCustomerFilter').value,
            dateFrom: document.getElementById('orderDateFrom').value,
            dateTo: document.getElementById('orderDateTo').value
        };
        ordersState.currentPage = 1;
        renderOrdersTable();
    }
    
    window.resetOrderFilters = function() {
        document.getElementById('orderStatusFilter').value = '';
        document.getElementById('orderPriorityFilter').value = '';
        document.getElementById('orderCustomerFilter').value = '';
        document.getElementById('orderDateFrom').value = '';
        document.getElementById('orderDateTo').value = '';
        ordersState.filters = {};
        ordersState.currentPage = 1;
        renderOrdersTable();
    }
    
    window.previousOrdersPage = function() {
        if (ordersState.currentPage > 1) {
            ordersState.currentPage--;
            renderOrdersTable();
        }
    }
    
    window.nextOrdersPage = function() {
        const totalPages = Math.ceil(filterOrders(DEMO_DATA.orders).length / ordersState.itemsPerPage);
        if (ordersState.currentPage < totalPages) {
            ordersState.currentPage++;
            renderOrdersTable();
        }
    }
    
    window.viewOrder = function(orderId) {
        const order = DEMO_DATA.orders.find(o => o.id === orderId);
        if (order) showOrderDetails(order);
    }
    
    window.editOrderItem = function(orderId) {
        alert('Edit order ' + orderId + ' feature coming soon!');
    }
    
    window.printOrder = function(orderId) {
        alert('Print order ' + orderId + ' feature coming soon!');
    }
    
    window.exportOrders = function() {
        alert('Export orders to CSV feature coming soon!');
    }
    
    window.createNewOrder = function() {
        alert('Create new order feature coming soon!');
    }
    
    window.toggleTimelineView = function() {
        alert('Timeline view toggle feature coming soon!');
    }
    
    // Production Page Implementation
    let productionState = {
        viewMode: 'grid',
        selectedLine: null,
        refreshInterval: null
    };
    
    function loadProductionPage() {
        updateProductionOverview();
        renderProductionLines();
        renderProductionAlerts();
        initProductionCharts();
        startProductionRefresh();
    }
    
    function updateProductionOverview() {
        // Calculate OEE metrics (in real app, from API)
        const oeeData = {
            availability: 92.5,
            performance: 94.8,
            quality: 99.2,
            totalOEE: (92.5 * 94.8 * 99.2) / 10000
        };
        
        // Update OEE displays
        const oeeMetrics = document.querySelectorAll('.oee-metric');
        if (oeeMetrics.length >= 4) {
            oeeMetrics[0].querySelector('.oee-value').textContent = oeeData.availability.toFixed(1) + '%';
            oeeMetrics[0].querySelector('.oee-fill').style.width = oeeData.availability + '%';
            
            oeeMetrics[1].querySelector('.oee-value').textContent = oeeData.performance.toFixed(1) + '%';
            oeeMetrics[1].querySelector('.oee-fill').style.width = oeeData.performance + '%';
            
            oeeMetrics[2].querySelector('.oee-value').textContent = oeeData.quality.toFixed(1) + '%';
            oeeMetrics[2].querySelector('.oee-fill').style.width = oeeData.quality + '%';
            
            oeeMetrics[3].querySelector('.oee-value').textContent = oeeData.totalOEE.toFixed(1) + '%';
            oeeMetrics[3].querySelector('.oee-fill').style.width = oeeData.totalOEE + '%';
        }
        
        // Update quick stats with animation
        animateQuickStats();
    }
    
    function animateQuickStats() {
        const stats = [
            { selector: '.stat-card:nth-child(1) .stat-value', value: 5847 },
            { selector: '.stat-card:nth-child(2) .stat-value', value: 127350 },
            { selector: '.stat-card:nth-child(3) .stat-value', value: 1.2 },
            { selector: '.stat-card:nth-child(4) .stat-value', value: 98.7 }
        ];
        
        stats.forEach(stat => {
            const element = document.querySelector(stat.selector);
            if (element) {
                animateValue(element, 0, stat.value, 1000);
            }
        });
    }
    
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    function renderProductionLines() {
        // Update production lines based on current data
        // In real app, this would fetch fresh data
        
        // Simulate real-time updates
        const lines = document.querySelectorAll('.line-card');
        lines.forEach((card, index) => {
            // Add slight animation on data refresh
            card.style.opacity = '0.8';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transition = 'opacity 0.3s ease';
            }, index * 100);
        });
    }
    
    function renderProductionAlerts() {
        // In real app, fetch new alerts
        // For demo, just animate existing ones
        const alerts = document.querySelectorAll('.alert-card');
        alerts.forEach((alert, index) => {
            alert.style.transform = 'translateX(-20px)';
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.style.transform = 'translateX(0)';
                alert.style.opacity = '1';
                alert.style.transition = 'all 0.3s ease';
            }, index * 150);
        });
    }
    
    function initProductionCharts() {
        // Initialize placeholder charts
        // In real app, use Chart.js or similar
        const outputChart = document.getElementById('outputChart');
        const efficiencyChart = document.getElementById('efficiencyChart');
        
        if (outputChart) {
            // Would initialize real chart here
            outputChart.parentElement.innerHTML = '<div style="padding: 60px 20px; text-align: center; color: #64748b;">Output trend chart would display here</div>';
        }
        
        if (efficiencyChart) {
            // Would initialize real chart here
            efficiencyChart.parentElement.innerHTML = '<div style="padding: 60px 20px; text-align: center; color: #64748b;">Efficiency comparison chart would display here</div>';
        }
    }
    
    function startProductionRefresh() {
        // Clear any existing interval
        if (productionState.refreshInterval) {
            clearInterval(productionState.refreshInterval);
        }
        
        // Refresh production data every 10 seconds
        if (CONFIG.PRODUCTION_REFRESH) {
            productionState.refreshInterval = setInterval(() => {
                if (state.currentPage === 'production') {
                    updateProductionMetrics();
                }
            }, CONFIG.PRODUCTION_REFRESH);
        }
    }
    
    function updateProductionMetrics() {
        // Simulate real-time metric updates
        const progressBars = document.querySelectorAll('.line-card .progress-fill');
        progressBars.forEach(bar => {
            const currentWidth = parseFloat(bar.style.width);
            const change = (Math.random() - 0.3) * 5; // Random change
            const newWidth = Math.max(0, Math.min(100, currentWidth + change));
            bar.style.width = newWidth + '%';
            
            // Update progress text
            const progressText = bar.closest('.line-progress').querySelector('.progress-header span:last-child');
            if (progressText) {
                progressText.textContent = Math.round(newWidth) + '%';
            }
        });
        
        // Update efficiency values
        const efficiencyValues = document.querySelectorAll('.mini-metric .metric-value');
        efficiencyValues.forEach(val => {
            if (val.textContent.includes('%')) {
                const current = parseFloat(val.textContent);
                const change = (Math.random() - 0.5) * 2;
                const newVal = Math.max(0, Math.min(100, current + change));
                val.textContent = newVal.toFixed(1) + '%';
            }
        });
    }
    
    // Global functions for production
    window.setProductionView = function(mode) {
        productionState.viewMode = mode;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // In real app, would change layout
        alert('View mode: ' + mode + ' - Layout change coming soon!');
    }
    
    window.showLineDetails = function(lineId) {
        const line = DEMO_DATA.productionLines.find(l => l.id === lineId);
        if (line) {
            showProductionDetails(line);
        }
    }
    
    window.handleAlert = function(type) {
        switch(type) {
            case 'material':
                alert('Opening material requisition form...');
                break;
            case 'quality':
                alert('Opening quality check interface...');
                break;
            case 'shift':
                alert('Shift change acknowledged');
                break;
            default:
                alert('Alert handled');
        }
    }
    
    window.viewAllAlerts = function() {
        alert('Opening alerts dashboard...');
    }
    
    // Cleanup on page change
    function cleanupProduction() {
        if (productionState.refreshInterval) {
            clearInterval(productionState.refreshInterval);
            productionState.refreshInterval = null;
        }
    }
    
    // Inventory Page Implementation
    let inventoryState = {
        activeTab: 'materials',
        selectedWarehouse: null,
        materialFilter: ''
    };
    
    function loadInventoryPage() {
        updateInventoryOverview();
        renderMaterials();
        initInventoryEventListeners();
    }
    
    function updateInventoryOverview() {
        // Update warehouse capacities
        const warehouses = [
            { selector: '.mag1 .capacity-fill', capacity: 78 },
            { selector: '.mag1-1 .capacity-fill', capacity: 92 },
            { selector: '.mag2 .capacity-fill', capacity: 45 },
            { selector: '.mag3 .capacity-fill', capacity: 30 },
            { selector: '.mag4 .capacity-fill', capacity: 55 },
            { selector: '.mag9 .capacity-fill', capacity: 67 }
        ];
        
        warehouses.forEach(wh => {
            const element = document.querySelector(wh.selector);
            if (element) {
                element.style.width = '0%';
                setTimeout(() => {
                    element.style.width = wh.capacity + '%';
                }, 100);
            }
        });
        
        // Update critical items
        updateCriticalItems();
        
        // Update inventory value
        animateInventoryValue();
    }
    
    function updateCriticalItems() {
        const criticalItems = document.querySelectorAll('.critical-item');
        criticalItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
                item.style.transition = 'all 0.3s ease';
            }, index * 100);
        });
    }
    
    function animateInventoryValue() {
        const valueElement = document.querySelector('.value-main');
        if (valueElement) {
            const endValue = 2.84;
            let currentValue = 0;
            const increment = endValue / 30;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= endValue) {
                    currentValue = endValue;
                    clearInterval(timer);
                }
                valueElement.textContent = '€' + currentValue.toFixed(2) + 'M';
            }, 30);
        }
    }
    
    function renderMaterials() {
        const materialsGrid = document.querySelector('.materials-grid');
        if (!materialsGrid) return;
        
        // Clear existing content
        materialsGrid.innerHTML = '';
        
        // Filter materials based on current filters
        let materials = DEMO_DATA.inventory.materials;
        if (inventoryState.selectedWarehouse) {
            materials = materials.filter(m => m.warehouse === inventoryState.selectedWarehouse);
        }
        if (inventoryState.materialFilter) {
            materials = materials.filter(m => m.category === inventoryState.materialFilter);
        }
        
        // Render material cards
        materials.forEach(material => {
            const card = createMaterialCard(material);
            materialsGrid.appendChild(card);
        });
    }
    
    function createMaterialCard(material) {
        const card = document.createElement('div');
        const isCritical = material.quantity < material.minStock;
        card.className = 'material-card' + (isCritical ? ' critical' : '');
        
        const stockPercent = ((material.quantity - 0) / (material.maxStock - 0)) * 100;
        const minPercent = (material.minStock / material.maxStock) * 100;
        const daysLeft = material.quantity / (material.quantity * 0.1); // Simplified calculation
        
        card.innerHTML = `
            <div class="material-header">
                <div>
                    <h4>${material.name}</h4>
                    <p class="material-id">${material.id}</p>
                </div>
                <span class="stock-status ${isCritical ? 'stock-critical' : 'stock-good'}">
                    ${isCritical ? 'Low Stock' : 'In Stock'}
                </span>
            </div>
            <div class="material-info">
                <div class="info-item">
                    <span>Location:</span>
                    <strong>${CONFIG.WAREHOUSES[material.warehouse]}</strong>
                </div>
                <div class="info-item">
                    <span>Supplier:</span>
                    <strong>${material.supplier}</strong>
                </div>
                ${material.hazmat ? '<div class="hazmat-warning">⚠️ HAZMAT - ADR Storage Required</div>' : ''}
            </div>
            <div class="stock-visual">
                <div class="stock-numbers">
                    <span>Current: ${material.quantity.toLocaleString()} ${material.unit}</span>
                    ${isCritical ? '<span class="critical-warning">⚠️ Below minimum!</span>' : 
                                  `<span>Min: ${material.minStock.toLocaleString()} ${material.unit}</span>`}
                </div>
                <div class="stock-bar-container">
                    <div class="stock-bar">
                        <div class="stock-current ${isCritical ? 'critical' : ''}" style="width: ${stockPercent}%"></div>
                        <div class="stock-min-line" style="left: ${minPercent}%"></div>
                    </div>
                </div>
            </div>
            <div class="material-footer">
                <div class="footer-item">
                    <span class="footer-label">${isCritical ? 'Days Left' : 'Last Delivery'}</span>
                    <span class="footer-value ${isCritical ? 'critical' : ''}">
                        ${isCritical ? daysLeft.toFixed(1) + ' days' : formatDate(material.lastDelivery)}
                    </span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Next Delivery</span>
                    <span class="footer-value">${formatDate(material.nextDelivery)}</span>
                </div>
                <div class="footer-item">
                    ${isCritical ? 
                        `<button class="btn-critical" onclick="createUrgentPO('${material.id}')">Urgent PO</button>` :
                        `<span class="footer-label">Price</span><span class="footer-value">${material.price} ${material.currency}</span>`}
                </div>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showInventoryDetails(material);
            }
        });
        
        return card;
    }
    
    function initInventoryEventListeners() {
        // Tab switching is handled by global functions
    }
    
    // Global functions for inventory
    window.switchInventoryTab = function(tab) {
        inventoryState.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab + '-tab').classList.add('active');
        
        // Load tab data
        switch(tab) {
            case 'materials':
                renderMaterials();
                break;
            case 'wip':
                console.log('Loading WIP inventory...');
                break;
            case 'finished':
                console.log('Loading finished goods...');
                break;
            case 'suppliers':
                console.log('Loading suppliers...');
                break;
        }
    }
    
    window.filterByWarehouse = function(warehouse) {
        inventoryState.selectedWarehouse = warehouse;
        
        // Highlight selected warehouse
        document.querySelectorAll('.warehouse-block').forEach(block => {
            block.style.borderColor = '';
        });
        event.currentTarget.style.borderColor = 'var(--primary)';
        
        // Refresh materials
        renderMaterials();
        
        // Scroll to materials section
        document.querySelector('.materials-grid').scrollIntoView({ behavior: 'smooth' });
    }
    
    window.filterMaterials = function(category) {
        inventoryState.materialFilter = category;
        renderMaterials();
    }
    
    window.createUrgentPO = function(materialId) {
        const material = DEMO_DATA.inventory.materials.find(m => m.id === materialId);
        if (material) {
            alert(`Creating urgent purchase order for ${material.name}...\nSupplier: ${material.supplier}\nRequired: ${material.minStock * 2} ${material.unit}`);
        }
    }
    
    window.addNewMaterial = function() {
        alert('Add new material feature coming soon!');
    }
    
    // BOM Page Implementation with System Integration
    let bomState = {
        selectedBOMs: [],
        comparisonMode: false,
        viewMode: 'cards'
    };
    
    function loadBOMPage() {
        updateBOMStatistics();
        initBOMSearch();
        loadBOMCards();
        loadMaterialUsageTable();
        checkLowStockMaterials();
    }
    
    function updateBOMStatistics() {
        // Animate statistics with real data integration
        const stats = [
            { selector: '.stat-card-modern:nth-child(1) .stat-number', value: 47 },
            { selector: '.stat-card-modern:nth-child(2) .stat-number', value: 38.22, prefix: '€' },
            { selector: '.stat-card-modern:nth-child(3) .stat-number', value: 96.20, suffix: '%' },
            { selector: '.stat-card-modern:nth-child(4) .stat-number', value: 12 }
        ];
        
        stats.forEach((stat, index) => {
            setTimeout(() => {
                const element = document.querySelector(stat.selector);
                if (element) {
                    animateStatValue(element, 0, stat.value, 1500, stat.prefix || '', stat.suffix || '');
                }
            }, index * 100);
        });
    }
    
    function animateStatValue(element, start, end, duration, prefix, suffix) {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            let displayValue = isDecimal ? current.toFixed(2) : Math.floor(current);
            element.textContent = prefix + displayValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    function initBOMSearch() {
        const searchInput = document.querySelector('.modern-search');
        if (searchInput && !searchInput.hasListener) {
            searchInput.addEventListener('input', debounce((e) => {
                searchBOMs(e.target.value);
            }, 300));
            searchInput.hasListener = true;
        }
    }
    
    function searchBOMs(query) {
        const cards = document.querySelectorAll('.bom-card-modern');
        const lowerQuery = query.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('.bom-title').textContent.toLowerCase();
            const customer = card.querySelector('.bom-customer').textContent.toLowerCase();
            const code = card.querySelector('.bom-code').textContent.toLowerCase();
            
            const matches = title.includes(lowerQuery) || 
                          customer.includes(lowerQuery) || 
                          code.includes(lowerQuery);
            
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    function loadBOMCards() {
        // Animate cards on load
        const cards = document.querySelectorAll('.bom-card-modern');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'all 0.3s ease';
            }, index * 100);
        });
    }
    
    function loadMaterialUsageTable() {
        // Check material levels and update status
        const materialRows = document.querySelectorAll('.modern-table tbody tr');
        materialRows.forEach(row => {
            const materialName = row.cells[0].textContent;
            const stockStatus = checkMaterialStock(materialName);
            
            // Update stock status badge
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                updateStockStatusBadge(statusBadge, stockStatus);
            }
        });
    }
    
    function checkMaterialStock(materialName) {
        // Integration with inventory system
        const criticalMaterials = ['Antiblock CESA', 'Blue Ink'];
        if (criticalMaterials.includes(materialName)) {
            return 'low';
        }
        
        const orderSoonMaterials = ['Liofol UR7780'];
        if (orderSoonMaterials.includes(materialName)) {
            return 'order';
        }
        
        return 'sufficient';
    }
    
    function updateStockStatusBadge(badge, status) {
        badge.className = 'status-badge ' + status;
        switch(status) {
            case 'low':
                badge.textContent = 'Low Stock';
                break;
            case 'order':
                badge.textContent = 'Order Soon';
                break;
            case 'sufficient':
                badge.textContent = 'Sufficient';
                break;
        }
    }
    
    function checkLowStockMaterials() {
        // Integration with inventory alerts
        const lowStockCount = document.querySelectorAll('.status-badge.low').length;
        if (lowStockCount > 0) {
            showNotification(`Warning: ${lowStockCount} materials are low on stock`, 'warning');
        }
    }
    
    // Global BOM functions
    window.createNewBOM = function() {
        showBOMCreationModal();
    }
    
    window.viewBOMDetails = function(bomId) {
        // Get BOM data
        const bomData = getBOMData(bomId);
        
        // Show detailed modal
        showModal('BOM Details: ' + bomData.name, `
            <div class="bom-detail-modal">
                <div class="detail-section">
                    <h4>Product Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">BOM Code:</span>
                            <span class="detail-value">${bomId}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Customer:</span>
                            <span class="detail-value">${bomData.customer}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Version:</span>
                            <span class="detail-value">${bomData.version}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Updated:</span>
                            <span class="detail-value">${bomData.lastUpdated}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Production Route</h4>
                    <div class="route-timeline">
                        <div class="route-step">
                            <div class="step-icon">1</div>
                            <div class="step-info">
                                <div class="step-name">Extrusion</div>
                                <div class="step-location">MAG 2</div>
                                <div class="step-time">45 min</div>
                            </div>
                        </div>
                        <div class="route-connector"></div>
                        <div class="route-step">
                            <div class="step-icon">2</div>
                            <div class="step-info">
                                <div class="step-name">UV Treatment</div>
                                <div class="step-location">MAG 3</div>
                                <div class="step-time">15 min</div>
                            </div>
                        </div>
                        <div class="route-connector"></div>
                        <div class="route-step">
                            <div class="step-icon">3</div>
                            <div class="step-info">
                                <div class="step-name">Printing</div>
                                <div class="step-location">MAG 4</div>
                                <div class="step-time">30 min</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn-primary" onclick="createProductionOrder('${bomId}')">
                        Create Production Order
                    </button>
                    <button class="btn-secondary" onclick="checkMaterialAvailability('${bomId}')">
                        Check Material Availability
                    </button>
                </div>
            </div>
        `);
    }
    
    window.editBOM = function(bomId, event) {
        event.stopPropagation();
        alert(`Opening BOM editor for ${bomId}...\n\nFeatures:\n- Material management\n- Cost calculation\n- Version control\n- Approval workflow`);
    }
    
    window.copyBOM = function(bomId, event) {
        event.stopPropagation();
        const bomData = getBOMData(bomId);
        alert(`Creating copy of ${bomData.name}...\n\nNew BOM will be created as draft with version 0.1`);
    }
    
    window.printBOM = function(bomId, event) {
        event.stopPropagation();
        alert(`Preparing BOM ${bomId} for printing...\n\nIncludes:\n- Full specifications\n- Material list\n- Cost breakdown\n- QR code for tracking`);
    }
    
    window.finalizeBOM = function(bomId, event) {
        event.stopPropagation();
        showConfirmDialog(
            'Finalize BOM',
            'Are you sure you want to finalize this BOM? Once finalized, it can be used for production orders.',
            () => {
                alert(`BOM ${bomId} has been finalized!\n\nNext steps:\n- Available for production\n- Added to active BOMs\n- Notifications sent to production team`);
                // Update UI
                const card = event.target.closest('.bom-card-modern');
                card.classList.remove('draft-bom');
                card.classList.add('active-bom');
            }
        );
    }
    
    window.startComparison = function() {
        bomState.comparisonMode = true;
        alert('Select 2-4 BOMs to compare by clicking on them.\n\nComparison will show:\n- Material differences\n- Cost analysis\n- Production time\n- Efficiency metrics');
    }
    
    window.addToComparison = function() {
        bomState.comparisonMode = true;
        showNotification('Click on BOMs to add them to comparison', 'info');
    }
    
    window.createProductionOrder = function(bomId) {
        // Integration with Orders page
        const bomData = getBOMData(bomId);
        alert(`Creating production order for ${bomData.name}...\n\nRedirecting to Orders page with pre-filled data.`);
        
        // Navigate to orders with BOM data
        state.pendingOrder = { bomId: bomId, bomData: bomData };
        navigateToPage('orders');
    }
    
    window.checkMaterialAvailability = function(bomId) {
        // Integration with Inventory page
        const bomData = getBOMData(bomId);
        const materials = bomData.materials || [];
        
        let availabilityReport = 'Material Availability Check:\n\n';
        let allAvailable = true;
        
        materials.forEach(material => {
            const status = checkMaterialStock(material.name);
            availabilityReport += `${material.name}: ${status}\n`;
            if (status !== 'sufficient') allAvailable = false;
        });
        
        if (allAvailable) {
            availabilityReport += '\n✅ All materials are available for production!';
        } else {
            availabilityReport += '\n⚠️ Some materials need attention before production can start.';
        }
        
        alert(availabilityReport);
    }
    
    // Helper functions
    function getBOMData(bomId) {
        // In real app, fetch from database
        const bomDatabase = {
            'BOM-001': {
                name: 'Cheese Packaging Standard',
                customer: 'MLEKOVITA',
                version: '2.1',
                lastUpdated: '2025-03-15',
                materials: [
                    { name: 'PE-LD Granulate', quantity: 8.2, unit: 'kg/1000pcs' },
                    { name: 'White Masterbatch', quantity: 0.164, unit: 'kg' },
                    { name: 'Antiblock CESA', quantity: 0.041, unit: 'kg' }
                ]
            },
            'BOM-002': {
                name: 'Barrier Laminate Premium',
                customer: 'LACPOL',
                version: '1.5',
                lastUpdated: '2025-03-10',
                materials: [
                    { name: 'PE-LD Granulate', quantity: 12.4, unit: 'kg/1000pcs' },
                    { name: 'EVOH Barrier', quantity: 0.8, unit: 'kg' },
                    { name: 'Liofol UR7780', quantity: 0.45, unit: 'kg' }
                ]
            },
            'BOM-003': {
                name: 'Printed Food Wrap',
                customer: "Sainsbury's",
                version: '0.9',
                lastUpdated: '2025-03-20',
                materials: [
                    { name: 'PE-LD Granulate', quantity: 9.6, unit: 'kg/1000pcs' },
                    { name: 'Flexo Inks', quantity: 0.85, unit: 'kg' }
                ]
            }
        };
        
        return bomDatabase[bomId] || {};
    }
    
    function showBOMCreationModal() {
        showModal('Create New BOM', `
            <div class="bom-creation-form">
                <div class="form-section">
                    <h4>Basic Information</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Product Name</label>
                            <input type="text" class="form-input" placeholder="e.g., Premium Food Packaging">
                        </div>
                        <div class="form-group">
                            <label>Customer</label>
                            <select class="form-select">
                                <option>Select Customer</option>
                                <option>MLEKOVITA</option>
                                <option>AGRONA</option>
                                <option>LACPOL</option>
                                <option>Sainsbury's</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Specifications</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Size (mm)</label>
                            <div class="input-group">
                                <input type="number" placeholder="Width">
                                <span>×</span>
                                <input type="number" placeholder="Length">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Thickness (μm)</label>
                            <input type="number" class="form-input" placeholder="e.g., 80">
                        </div>
                        <div class="form-group">
                            <label>Structure Type</label>
                            <select class="form-select">
                                <option>Monolayer</option>
                                <option>Laminate</option>
                                <option>Barrier</option>
                                <option>Printed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn-primary" onclick="saveBOM()">
                        Save as Draft
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `);
    }
    
    function showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    window.saveBOM = function() {
        alert('BOM saved as draft!\n\nNext steps:\n- Add materials\n- Calculate costs\n- Submit for approval');
        closeModal();
    }
    
    function loadQualityPage() {
        console.log('Loading quality page...');
        // TODO: Implement quality control
    }
    
    // Reports Page Implementation
    let reportsState = {
        currentPeriod: 'week',
        activeTab: 'production',
        data: {
            production: {},
            financial: {},
            quality: {},
            efficiency: {}
        }
    };
    
    function loadReportsPage() {
        updateReportDate();
        loadReportData();
        animateReportMetrics();
        renderCharts();
    }
    
    function updateReportDate() {
        const now = new Date();
        const dateElement = document.getElementById('reportDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Update period display
        updatePeriodDisplay();
    }
    
    function updatePeriodDisplay() {
        const periodElement = document.getElementById('reportPeriod');
        if (!periodElement) return;
        
        const now = new Date();
        let periodText = '';
        
        switch(reportsState.currentPeriod) {
            case 'today':
                periodText = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                periodText = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                break;
            case 'month':
                periodText = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3) + 1;
                periodText = `Q${quarter} ${now.getFullYear()}`;
                break;
            case 'year':
                periodText = now.getFullYear().toString();
                break;
        }
        
        periodElement.textContent = periodText;
    }
    
    function loadReportData() {
        // In real app, fetch data based on period
        // For demo, use static data
        reportsState.data = {
            production: {
                totalUnits: 847350,
                weeklyGrowth: 12.3,
                lineOutputs: [287, 264, 152, 311],
                topProducts: [
                    { name: 'Cheese Packaging 250×450mm', customer: 'MLEKOVITA', volume: 127350 },
                    { name: 'Food Wrap 230×475mm', customer: 'AGRONA', volume: 98200 },
                    { name: 'Barrier Laminate 425×750mm', customer: 'LACPOL', volume: 65400 }
                ]
            },
            financial: {
                revenue: 458700,
                revenueGrowth: 8.5,
                costs: {
                    material: 215300,
                    labor: 98700,
                    overhead: 68500,
                    energy: 45200,
                    other: 31000
                }
            }
        };
    }
    
    function animateReportMetrics() {
        // Animate summary metrics
        const metrics = [
            { selector: '.summary-item:nth-child(1) .metric-main', value: 847350, format: 'number' },
            { selector: '.summary-item:nth-child(2) .metric-main', value: 458.7, format: 'currency' },
            { selector: '.summary-item:nth-child(3) .metric-main', value: 86.7, format: 'percent' },
            { selector: '.summary-item:nth-child(4) .metric-main', value: 99.2, format: 'percent' }
        ];
        
        metrics.forEach((metric, index) => {
            setTimeout(() => {
                const element = document.querySelector(metric.selector);
                if (element) {
                    animateReportValue(element, 0, metric.value, 1500, metric.format);
                }
            }, index * 200);
        });
        
        // Animate fulfillment cards
        animateFulfillmentCards();
    }
    
    function animateReportValue(element, start, end, duration, format) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            let displayValue;
            switch(format) {
                case 'currency':
                    displayValue = '€' + current.toFixed(1) + 'k';
                    break;
                case 'percent':
                    displayValue = current.toFixed(1) + '%';
                    break;
                case 'number':
                    displayValue = Math.floor(current).toLocaleString();
                    break;
                default:
                    displayValue = current.toFixed(0);
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    function animateFulfillmentCards() {
        const cards = document.querySelectorAll('.fulfillment-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.transition = 'all 0.3s ease';
                
                // Animate the value inside
                const valueElement = card.querySelector('.fulfillment-value');
                if (valueElement) {
                    const value = parseInt(valueElement.textContent);
                    animateReportValue(valueElement, 0, value, 1000, 'number');
                }
            }, 1000 + index * 100);
        });
    }
    
    function renderCharts() {
        // Animate bar charts
        setTimeout(() => {
            const bars = document.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                const currentHeight = bar.style.height;
                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.height = currentHeight;
                    bar.style.transition = 'height 0.8s ease';
                }, index * 100);
            });
        }, 500);
        
        // In real app, would initialize Chart.js here
    }
    
    // Global functions for reports
    window.setPeriod = function(period) {
        reportsState.currentPeriod = period;
        
        // Update button states
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update display and reload data
        updatePeriodDisplay();
        loadReportData();
        animateReportMetrics();
        
        // Show loading animation
        showReportLoading();
    }
    
    window.switchReportTab = function(tab) {
        reportsState.activeTab = tab;
        
        // Update tab states
        document.querySelectorAll('.report-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update content
        document.querySelectorAll('.report-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab + '-report').classList.add('active');
        
        // Load tab-specific data
        switch(tab) {
            case 'production':
                renderCharts();
                break;
            case 'financial':
                renderFinancialCharts();
                break;
            case 'quality':
                console.log('Loading quality reports...');
                break;
            case 'efficiency':
                console.log('Loading efficiency reports...');
                break;
            case 'inventory':
                console.log('Loading inventory reports...');
                break;
        }
    }
    
    function renderFinancialCharts() {
        // Animate donut chart segments
        const circles = document.querySelectorAll('.donut-chart circle[stroke-dasharray]');
        circles.forEach((circle, index) => {
            const dashArray = circle.getAttribute('stroke-dasharray');
            circle.setAttribute('stroke-dasharray', '0 502.4');
            setTimeout(() => {
                circle.setAttribute('stroke-dasharray', dashArray);
                circle.style.transition = 'stroke-dasharray 1s ease';
            }, index * 200);
        });
    }
    
    function showReportLoading() {
        // Quick loading effect
        const content = document.querySelector('.report-content.active');
        if (content) {
            content.style.opacity = '0.5';
            setTimeout(() => {
                content.style.opacity = '1';
                content.style.transition = 'opacity 0.3s ease';
            }, 300);
        }
    }
    
    window.refreshReports = function() {
        showReportLoading();
        setTimeout(() => {
            loadReportData();
            animateReportMetrics();
            alert('Reports refreshed with latest data!');
        }, 500);
    }
    
    window.exportReport = function() {
        alert('Exporting report to PDF...\n\nReport will include:\n- Executive summary\n- All active report tabs\n- Charts and visualizations\n- Data tables');
    }
    
    window.printReport = function() {
        alert('Opening print dialog...\n\nReport will be formatted for A4 paper with proper page breaks.');
    }
    
    window.emailReport = function() {
        alert('Email report feature coming soon!\n\nYou will be able to:\n- Select recipients\n- Add custom message\n- Schedule delivery');
    }
    
    window.scheduleReport = function() {
        alert('Schedule report feature coming soon!\n\nOptions will include:\n- Daily/Weekly/Monthly reports\n- Custom recipients\n- Automated delivery');
    }
    
    // Event listeners
    function initEventListeners() {
        // New order button
        document.querySelector('.btn-primary').addEventListener('click', () => {
            alert('New Order feature coming soon!');
        });
        
        // Notifications button
        document.querySelector('.btn-icon').addEventListener('click', () => {
            alert('Notifications feature coming soon!');
        });
        
        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.parentElement;
                closeModal(modal.id);
            });
        });
    }
    
    // Modal functions
    function showProductionDetails(line) {
        // Fill modal with data
        document.getElementById('modalLineName').textContent = line.name;
        document.getElementById('modalLineType').textContent = formatStatus(line.type);
        document.getElementById('modalLineStatus').innerHTML = `<span class="status-badge ${line.status}">${formatStatus(line.status)}</span>`;
        document.getElementById('modalLineProduct').textContent = line.product;
        document.getElementById('modalLineOrderId').textContent = line.orderId || 'N/A';
        
        // Progress
        const progressBar = document.getElementById('modalLineProgress');
        progressBar.style.width = line.progress + '%';
        document.getElementById('modalLineProgressText').textContent = line.progress + '% Complete';
        
        // Calculate time remaining
        if (line.estimatedEnd) {
            const end = new Date(line.estimatedEnd);
            const now = new Date();
            const hoursRemaining = Math.max(0, (end - now) / (1000 * 60 * 60));
            document.getElementById('modalLineTimeRemaining').textContent = 
                `Time remaining: ${hoursRemaining.toFixed(1)} hours`;
        }
        
        // Metrics
        const metricsContainer = document.getElementById('modalLineMetrics');
        metricsContainer.innerHTML = '';
        
        if (line.metrics.speed !== undefined) {
            metricsContainer.innerHTML += `
                <div class="metric-box">
                    <span class="metric-box-value">${line.metrics.speed}</span>
                    <span class="metric-box-label">${line.metrics.speedUnit}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-box-value">${line.metrics.output}</span>
                    <span class="metric-box-label">${line.metrics.outputUnit}</span>
                </div>
                <div class="metric-box">
                    <span class="metric-box-value">${line.metrics.temperature}°C</span>
                    <span class="metric-box-label">Temperature</span>
                </div>
                <div class="metric-box">
                    <span class="metric-box-value">${line.efficiency}%</span>
                    <span class="metric-box-label">Efficiency</span>
                </div>
            `;
        } else {
            metricsContainer.innerHTML += `
                <div class="metric-box">
                    <span class="metric-box-value">${line.metrics.colors}</span>
                    <span class="metric-box-label">Colors</span>
                </div>
                <div class="metric-box">
                    <span class="metric-box-value">${line.metrics.setupTime}</span>
                    <span class="metric-box-label">Setup Time (min)</span>
                </div>
            `;
        }
        
        // Recent events
        const eventsContainer = document.getElementById('modalLineEvents');
        eventsContainer.innerHTML = `
            <div class="event-item">
                <span class="event-time">10:30</span>
                <span class="event-text">Production started for order ${line.orderId}</span>
            </div>
            <div class="event-item">
                <span class="event-time">10:15</span>
                <span class="event-text">Setup completed, quality check passed</span>
            </div>
            <div class="event-item">
                <span class="event-time">09:45</span>
                <span class="event-text">Material loaded: PE-LD from MAG 1</span>
            </div>
        `;
        
        // Show modal
        showModal('productionModal');
    }
    
    function showOrderDetails(order) {
        // Fill modal with order data
        document.getElementById('modalOrderId').textContent = order.id;
        document.getElementById('modalCustomer').textContent = order.customer;
        document.getElementById('modalProduct').textContent = order.product;
        document.getElementById('modalQuantity').textContent = 
            `${order.quantity.toLocaleString()} ${order.unit}`;
        document.getElementById('modalValue').textContent = 
            `€${order.value.toLocaleString()}`;
        document.getElementById('modalDueDate').textContent = formatDate(order.dueDate);
        
        // Status
        document.getElementById('modalStatus').innerHTML = 
            `<span class="status-badge ${getStatusClass(order.status)}">${formatStatus(order.status)}</span>`;
        document.getElementById('modalPriority').innerHTML = 
            `<span style="color: ${CONFIG.PRIORITY_LEVELS[order.priority.toUpperCase()].color}">
                ${CONFIG.PRIORITY_LEVELS[order.priority.toUpperCase()].label}
            </span>`;
        
        // Progress
        const progressBar = document.getElementById('modalProgress');
        progressBar.style.width = order.progress + '%';
        document.getElementById('modalProgressText').textContent = order.progress + '%';
        
        // Production info
        document.getElementById('modalAssignedLine').textContent = 
            order.assignedLine ? CONFIG.PRODUCTION_LINES[order.assignedLine.toUpperCase().replace('-', '')] : 'Not assigned';
        document.getElementById('modalQualityStatus').innerHTML = 
            `<span class="status-badge ${getQualityStatusClass(order.qualityStatus)}">
                ${formatStatus(order.qualityStatus)}
            </span>`;
        
        // BOM Details
        const bomContainer = document.getElementById('modalBOMDetails');
        bomContainer.innerHTML = `
            <div class="bom-item">
                <span>Material:</span>
                <span>${order.bom.material} - ${order.bom.weight}kg</span>
            </div>
            <div class="bom-item">
                <span>Additives:</span>
                <span>${order.bom.additives.join(', ')}</span>
            </div>
            <div class="bom-item">
                <span>Colors:</span>
                <span>${order.bom.colors} colors</span>
            </div>
            <div class="bom-item">
                <span>Adhesive:</span>
                <span>${order.bom.adhesive || 'None'}</span>
            </div>
        `;
        
        // Documents
        const docsContainer = document.getElementById('modalDocuments');
        docsContainer.innerHTML = '';
        const docTypes = {
            'spec': '📄 Specification',
            'bom': '📋 BOM',
            'coa': '✅ CoA',
            'artwork': '🎨 Artwork'
        };
        
        Object.keys(docTypes).forEach(doc => {
            const hasDoc = order.documents.includes(doc);
            docsContainer.innerHTML += `
                <span class="document-tag ${hasDoc ? 'available' : ''}">
                    ${docTypes[doc]}
                </span>
            `;
        });
        
        // Show modal
        showModal('orderModal');
    }
    
    function showInventoryDetails(item) {
        // Fill modal with inventory data
        document.getElementById('modalItemId').textContent = item.id;
        document.getElementById('modalItemName').textContent = item.name;
        document.getElementById('modalItemCategory').textContent = formatStatus(item.category);
        document.getElementById('modalItemWarehouse').textContent = CONFIG.WAREHOUSES[item.warehouse];
        document.getElementById('modalItemSupplier').textContent = item.supplier;
        
        // Stock levels
        const currentPercent = ((item.quantity - item.minStock) / (item.maxStock - item.minStock)) * 100;
        const stockLevel = document.getElementById('modalStockLevel');
        stockLevel.style.width = currentPercent + '%';
        
        if (currentPercent < 20) {
            stockLevel.style.background = 'var(--danger)';
        } else if (currentPercent < 40) {
            stockLevel.style.background = 'var(--warning)';
        }
        
        document.getElementById('modalMinValue').textContent = item.minStock + ' ' + item.unit;
        document.getElementById('modalCurrentValue').textContent = item.quantity + ' ' + item.unit;
        document.getElementById('modalMaxValue').textContent = item.maxStock + ' ' + item.unit;
        
        const minPos = (item.minStock / item.maxStock) * 100;
        document.getElementById('modalStockMin').style.left = minPos + '%';
        
        document.getElementById('modalLastDelivery').textContent = formatDate(item.lastDelivery);
        document.getElementById('modalNextDelivery').textContent = formatDate(item.nextDelivery);
        
        // Show modal
        showModal('inventoryModal');
    }
    
    // Modal utilities
    function showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Modal action functions
    window.editOrder = function() {
        alert('Edit order feature coming soon!');
        closeModal('orderModal');
    }
    
    window.pauseProduction = function() {
        alert('Pause production feature coming soon!');
    }
    
    window.viewLineDetails = function() {
        closeModal('productionModal');
        navigateToPage('production');
    }
    
    window.createPurchaseOrder = function() {
        alert('Create PO feature coming soon!');
        closeModal('inventoryModal');
    }
    
    // Close modal function for onclick handlers
    window.closeModal = closeModal;
    
    // Helper function for quality status
    function getQualityStatusClass(status) {
        const statusMap = {
            'released': 'running',
            'testing': 'setup',
            'blocked': 'danger',
            'pending': 'pending'
        };
        return statusMap[status] || 'pending';
    }
    
    // Auto refresh
    function startAutoRefresh() {
        if (CONFIG.DASHBOARD_REFRESH) {
            const interval = setInterval(() => {
                if (state.currentPage === 'dashboard') {
                    updateKPIs();
                    updateProductionStatus();
                }
            }, CONFIG.DASHBOARD_REFRESH);
            
            state.refreshIntervals.push(interval);
        }
    }
    
    // Utility functions
    function formatStatus(status) {
        return status.replace(/-/g, ' ')
                     .split(' ')
                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                     .join(' ');
    }
    
    function getStatusClass(status) {
        const statusMap = {
            'in-production': 'running',
            'scheduled': 'pending',
            'pending': 'pending',
            'completed': 'completed',
            'setup': 'setup'
        };
        return statusMap[status] || status;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        state.refreshIntervals.forEach(interval => clearInterval(interval));
    });
    
})();

// Confirm Dialog Function
function showConfirmDialog(title, message, onConfirm) {
    showModal(title, `
        <div class="confirm-dialog">
            <p class="confirm-message">${message}</p>
            <div class="confirm-actions">
                <button class="btn-primary" onclick="confirmAction()">
                    Confirm
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    Cancel
                </button>
            </div>
        </div>
    `);
    
    // Store the confirm callback
    window.confirmAction = function() {
        if (onConfirm) onConfirm();
        closeModal();
    };
}
