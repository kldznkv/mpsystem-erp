const express = require('express');
const router = express.Router();

// GET /api/reports/inventory - Inventory report
router.get('/inventory', (req, res) => {
    try {
        const { dateFrom, dateTo, category, format = 'json' } = req.query;
        
        // Mock inventory data (in real app, get from database)
        const inventory = [
            {
                id: 1,
                name: 'Товар 1',
                sku: 'SKU001',
                quantity: 100,
                price: 1500,
                cost: 1000,
                category: 'Категория А',
                supplier: 'Поставщик 1',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01')
            },
            {
                id: 2,
                name: 'Товар 2',
                sku: 'SKU002',
                quantity: 50,
                price: 2000,
                cost: 1500,
                category: 'Категория В',
                supplier: 'Поставщик 2',
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02')
            },
            {
                id: 3,
                name: 'Товар 3',
                sku: 'SKU003',
                quantity: 75,
                price: 1200,
                cost: 800,
                category: 'Категория А',
                supplier: 'Поставщик 1',
                createdAt: new Date('2024-01-03'),
                updatedAt: new Date('2024-01-03')
            }
        ];
        
        let filteredInventory = [...inventory];
        
        // Filter by category if provided
        if (category) {
            filteredInventory = filteredInventory.filter(item => 
                item.category.toLowerCase().includes(category.toLowerCase())
            );
        }
        
        // Calculate report metrics
        const totalItems = filteredInventory.length;
        const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = filteredInventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const totalCost = filteredInventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        const potentialProfit = totalValue - totalCost;
        
        const lowStockItems = filteredInventory.filter(item => item.quantity < 10);
        const overStockItems = filteredInventory.filter(item => item.quantity > 100);
        
        // Group by category
        const categoryBreakdown = {};
        filteredInventory.forEach(item => {
            if (!categoryBreakdown[item.category]) {
                categoryBreakdown[item.category] = {
                    itemCount: 0,
                    totalQuantity: 0,
                    totalValue: 0,
                    totalCost: 0
                };
            }
            
            categoryBreakdown[item.category].itemCount++;
            categoryBreakdown[item.category].totalQuantity += item.quantity;
            categoryBreakdown[item.category].totalValue += (item.quantity * item.price);
            categoryBreakdown[item.category].totalCost += (item.quantity * item.cost);
        });
        
        const report = {
            reportType: 'inventory',
            generatedAt: new Date(),
            filters: { category, dateFrom, dateTo },
            summary: {
                totalItems,
                totalQuantity,
                totalValue,
                totalCost,
                potentialProfit,
                lowStockCount: lowStockItems.length,
                overStockCount: overStockItems.length
            },
            categoryBreakdown,
            alerts: {
                lowStockItems: lowStockItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    sku: item.sku,
                    quantity: item.quantity
                })),
                overStockItems: overStockItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    sku: item.sku,
                    quantity: item.quantity
                }))
            },
            items: filteredInventory
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate inventory report',
            message: error.message
        });
    }
});

// GET /api/reports/sales - Sales report
router.get('/sales', (req, res) => {
    try {
        const { dateFrom, dateTo, status, format = 'json' } = req.query;
        
        // Mock sales data (in real app, get from database)
        const sales = [
            {
                id: 1,
                date: '2024-01-15',
                customerName: 'Иван Иванов',
                total: 5500,
                status: 'completed',
                paymentMethod: 'card',
                itemCount: 3
            },
            {
                id: 2,
                date: '2024-01-16',
                customerName: 'Мария Петрова',
                total: 5510,
                status: 'completed',
                paymentMethod: 'cash',
                itemCount: 4
            },
            {
                id: 3,
                date: '2024-01-17',
                customerName: 'Алексей Сидоров',
                total: 4400,
                status: 'pending',
                paymentMethod: 'bank_transfer',
                itemCount: 2
            }
        ];
        
        let filteredSales = [...sales];
        
        // Filter by date range
        if (dateFrom) {
            filteredSales = filteredSales.filter(sale => 
                new Date(sale.date) >= new Date(dateFrom)
            );
        }
        if (dateTo) {
            filteredSales = filteredSales.filter(sale => 
                new Date(sale.date) <= new Date(dateTo)
            );
        }
        
        // Filter by status
        if (status) {
            filteredSales = filteredSales.filter(sale => sale.status === status);
        }
        
        // Calculate metrics
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        const completedSales = filteredSales.filter(sale => sale.status === 'completed');
        const pendingSales = filteredSales.filter(sale => sale.status === 'pending');
        
        // Daily breakdown
        const dailyBreakdown = {};
        filteredSales.forEach(sale => {
            const date = sale.date;
            if (!dailyBreakdown[date]) {
                dailyBreakdown[date] = {
                    salesCount: 0,
                    revenue: 0,
                    itemsSold: 0
                };
            }
            
            dailyBreakdown[date].salesCount++;
            dailyBreakdown[date].revenue += sale.total;
            dailyBreakdown[date].itemsSold += sale.itemCount;
        });
        
        // Payment method breakdown
        const paymentMethodBreakdown = {};
        filteredSales.forEach(sale => {
            if (!paymentMethodBreakdown[sale.paymentMethod]) {
                paymentMethodBreakdown[sale.paymentMethod] = {
                    count: 0,
                    revenue: 0
                };
            }
            
            paymentMethodBreakdown[sale.paymentMethod].count++;
            paymentMethodBreakdown[sale.paymentMethod].revenue += sale.total;
        });
        
        const report = {
            reportType: 'sales',
            generatedAt: new Date(),
            filters: { dateFrom, dateTo, status },
            summary: {
                totalSales,
                totalRevenue,
                averageOrderValue,
                completedSales: completedSales.length,
                pendingSales: pendingSales.length,
                completedRevenue: completedSales.reduce((sum, sale) => sum + sale.total, 0),
                pendingRevenue: pendingSales.reduce((sum, sale) => sum + sale.total, 0)
            },
            dailyBreakdown,
            paymentMethodBreakdown,
            sales: filteredSales
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate sales report',
            message: error.message
        });
    }
});

// GET /api/reports/financial - Financial report
router.get('/financial', (req, res) => {
    try {
        const { dateFrom, dateTo, format = 'json' } = req.query;
        
        // Mock data (in real app, get from database)
        const sales = [
            { date: '2024-01-15', revenue: 5500, cost: 3500 },
            { date: '2024-01-16', revenue: 5510, cost: 3600 },
            { date: '2024-01-17', revenue: 4400, cost: 2800 }
        ];
        
        const expenses = [
            { date: '2024-01-15', category: 'Аренда', amount: 50000 },
            { date: '2024-01-15', category: 'Зарплата', amount: 150000 },
            { date: '2024-01-16', category: 'Коммунальные', amount: 25000 },
            { date: '2024-01-17', category: 'Маркетинг', amount: 30000 }
        ];
        
        let filteredSales = [...sales];
        let filteredExpenses = [...expenses];
        
        // Filter by date range
        if (dateFrom) {
            filteredSales = filteredSales.filter(sale => 
                new Date(sale.date) >= new Date(dateFrom)
            );
            filteredExpenses = filteredExpenses.filter(expense => 
                new Date(expense.date) >= new Date(dateFrom)
            );
        }
        if (dateTo) {
            filteredSales = filteredSales.filter(sale => 
                new Date(sale.date) <= new Date(dateTo)
            );
            filteredExpenses = filteredExpenses.filter(expense => 
                new Date(expense.date) <= new Date(dateTo)
            );
        }
        
        // Calculate metrics
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.revenue, 0);
        const totalCostOfGoods = filteredSales.reduce((sum, sale) => sum + sale.cost, 0);
        const grossProfit = totalRevenue - totalCostOfGoods;
        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        
        const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfit = grossProfit - totalExpenses;
        const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        // Expense breakdown by category
        const expenseByCategory = {};
        filteredExpenses.forEach(expense => {
            if (!expenseByCategory[expense.category]) {
                expenseByCategory[expense.category] = 0;
            }
            expenseByCategory[expense.category] += expense.amount;
        });
        
        // Daily financial breakdown
        const dailyFinancials = {};
        filteredSales.forEach(sale => {
            const date = sale.date;
            if (!dailyFinancials[date]) {
                dailyFinancials[date] = {
                    revenue: 0,
                    costOfGoods: 0,
                    expenses: 0,
                    grossProfit: 0,
                    netProfit: 0
                };
            }
            
            dailyFinancials[date].revenue += sale.revenue;
            dailyFinancials[date].costOfGoods += sale.cost;
            dailyFinancials[date].grossProfit += (sale.revenue - sale.cost);
        });
        
        // Add expenses to daily breakdown
        filteredExpenses.forEach(expense => {
            const date = expense.date;
            if (dailyFinancials[date]) {
                dailyFinancials[date].expenses += expense.amount;
                dailyFinancials[date].netProfit = dailyFinancials[date].grossProfit - dailyFinancials[date].expenses;
            }
        });
        
        const report = {
            reportType: 'financial',
            generatedAt: new Date(),
            filters: { dateFrom, dateTo },
            summary: {
                totalRevenue,
                totalCostOfGoods,
                grossProfit,
                grossProfitMargin,
                totalExpenses,
                netProfit,
                netProfitMargin
            },
            expenseByCategory,
            dailyFinancials,
            revenueStreams: {
                sales: totalRevenue
            },
            expenseDetails: filteredExpenses
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate financial report',
            message: error.message
        });
    }
});

// GET /api/reports/dashboard - Dashboard summary report
router.get('/dashboard', (req, res) => {
    try {
        // Mock data for dashboard
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const todaySales = [
            { total: 2500, items: 3 },
            { total: 1800, items: 2 }
        ];
        
        const yesterdaySales = [
            { total: 3200, items: 4 },
            { total: 2100, items: 3 },
            { total: 1500, items: 2 }
        ];
        
        const inventory = [
            { quantity: 100, price: 1500 },
            { quantity: 50, price: 2000 },
            { quantity: 75, price: 1200 }
        ];
        
        // Calculate metrics
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
        const revenueChange = yesterdayRevenue > 0 ? 
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
        
        const todayOrderCount = todaySales.length;
        const yesterdayOrderCount = yesterdaySales.length;
        const orderCountChange = yesterdayOrderCount > 0 ? 
            ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100 : 0;
        
        const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const lowStockItems = inventory.filter(item => item.quantity < 10).length;
        
        const report = {
            reportType: 'dashboard',
            generatedAt: new Date(),
            date: today,
            metrics: {
                revenue: {
                    today: todayRevenue,
                    yesterday: yesterdayRevenue,
                    change: revenueChange
                },
                orders: {
                    today: todayOrderCount,
                    yesterday: yesterdayOrderCount,
                    change: orderCountChange
                },
                inventory: {
                    totalValue: totalInventoryValue,
                    itemCount: inventory.length,
                    lowStockAlert: lowStockItems
                }
            },
            recentActivity: {
                sales: todaySales.map((sale, index) => ({
                    id: index + 1,
                    amount: sale.total,
                    items: sale.items,
                    time: new Date()
                }))
            },
            alerts: [
                ...(lowStockItems > 0 ? [`${lowStockItems} товаров с низким остатком`] : []),
                ...(todayOrderCount === 0 ? ['Сегодня еще не было продаж'] : [])
            ]
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate dashboard report',
            message: error.message
        });
    }
});

// GET /api/reports/export/:type - Export report in different formats
router.get('/export/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'csv' } = req.query;
        
        // This is a placeholder for export functionality
        // In a real application, you would generate actual CSV/Excel/PDF files
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
            
            // Mock CSV data
            const csvData = `ID,Name,Value,Date\n1,Sample Data,100,2024-01-15\n2,Sample Data 2,200,2024-01-16`;
            res.send(csvData);
        } else {
            res.json({
                message: 'Export functionality placeholder',
                type,
                format,
                note: 'In a real application, this would generate and return the requested file format'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Failed to export report',
            message: error.message
        });
    }
});

module.exports = router;