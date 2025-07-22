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
        
        // Update state
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
    function loadOrdersPage() {
        console.log('Loading orders page...');
        // TODO: Implement full orders management
    }
    
    function loadProductionPage() {
        console.log('Loading production page...');
        // TODO: Implement production monitoring
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
