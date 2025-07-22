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
    
    function loadInventoryPage() {
        console.log('Loading inventory page...');
        // TODO: Implement inventory management
    }
    
    function loadBOMPage() {
        console.log('Loading BOM page...');
        // TODO: Implement BOM management
    }
    
    function loadQualityPage() {
        console.log('Loading quality page...');
        // TODO: Implement quality control
    }
    
    function loadReportsPage() {
        console.log('Loading reports page...');
        // TODO: Implement reporting
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
