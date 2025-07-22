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
    }
    
    // Detail modals (placeholder)
    function showProductionDetails(line) {
        alert(`Production Line: ${line.name}\nStatus: ${line.status}\nProgress: ${line.progress}%`);
    }
    
    function showOrderDetails(order) {
        alert(`Order: ${order.id}\nCustomer: ${order.customer}\nStatus: ${order.status}`);
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
