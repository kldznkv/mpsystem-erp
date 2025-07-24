const express = require('express');
const router = express.Router();

// Mock sales data
let sales = [
    {
        id: 1,
        date: '2024-01-15',
        customerName: 'Иван Иванов',
        customerEmail: 'ivan@example.com',
        items: [
            { id: 1, name: 'Товар 1', quantity: 2, price: 1500, total: 3000 },
            { id: 2, name: 'Товар 2', quantity: 1, price: 2000, total: 2000 }
        ],
        subtotal: 5000,
        tax: 500,
        discount: 0,
        total: 5500,
        status: 'completed',
        paymentMethod: 'card',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T10:30:00')
    },
    {
        id: 2,
        date: '2024-01-16',
        customerName: 'Мария Петрова',
        customerEmail: 'maria@example.com',
        items: [
            { id: 3, name: 'Товар 3', quantity: 3, price: 1200, total: 3600 },
            { id: 1, name: 'Товар 1', quantity: 1, price: 1500, total: 1500 }
        ],
        subtotal: 5100,
        tax: 510,
        discount: 100,
        total: 5510,
        status: 'completed',
        paymentMethod: 'cash',
        createdAt: new Date('2024-01-16T14:15:00'),
        updatedAt: new Date('2024-01-16T14:15:00')
    },
    {
        id: 3,
        date: '2024-01-17',
        customerName: 'Алексей Сидоров',
        customerEmail: 'alex@example.com',
        items: [
            { id: 2, name: 'Товар 2', quantity: 2, price: 2000, total: 4000 }
        ],
        subtotal: 4000,
        tax: 400,
        discount: 0,
        total: 4400,
        status: 'pending',
        paymentMethod: 'bank_transfer',
        createdAt: new Date('2024-01-17T09:45:00'),
        updatedAt: new Date('2024-01-17T09:45:00')
    }
];

// GET /api/sales - Get all sales
router.get('/', (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            dateFrom, 
            dateTo, 
            search 
        } = req.query;
        
        let filteredSales = [...sales];
        
        // Filter by status
        if (status) {
            filteredSales = filteredSales.filter(sale => sale.status === status);
        }
        
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
        
        // Search in customer name or email
        if (search) {
            filteredSales = filteredSales.filter(sale =>
                sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
                sale.customerEmail.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Sort by date (newest first)
        filteredSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedSales = filteredSales.slice(startIndex, endIndex);
        
        res.json({
            sales: paginatedSales,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredSales.length,
                totalPages: Math.ceil(filteredSales.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch sales',
            message: error.message
        });
    }
});

// GET /api/sales/:id - Get single sale
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const sale = sales.find(sale => sale.id === parseInt(id));
        
        if (!sale) {
            return res.status(404).json({
                error: 'Sale not found'
            });
        }
        
        res.json(sale);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch sale',
            message: error.message
        });
    }
});

// POST /api/sales - Create new sale
router.post('/', (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            items,
            discount = 0,
            paymentMethod = 'cash'
        } = req.body;
        
        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Customer name and items are required'
            });
        }
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax - discount;
        
        const newSale = {
            id: Math.max(...sales.map(sale => sale.id)) + 1,
            date: new Date().toISOString().split('T')[0],
            customerName,
            customerEmail: customerEmail || '',
            items: items.map(item => ({
                ...item,
                total: item.quantity * item.price
            })),
            subtotal,
            tax,
            discount,
            total,
            status: 'completed',
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        sales.push(newSale);
        
        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            sale: newSale
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create sale',
            message: error.message
        });
    }
});

// PUT /api/sales/:id - Update sale
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const saleIndex = sales.findIndex(sale => sale.id === parseInt(id));
        
        if (saleIndex === -1) {
            return res.status(404).json({
                error: 'Sale not found'
            });
        }
        
        const {
            customerName,
            customerEmail,
            items,
            discount,
            paymentMethod,
            status
        } = req.body;
        
        let updatedSale = { ...sales[saleIndex] };
        
        // Update basic fields
        if (customerName) updatedSale.customerName = customerName;
        if (customerEmail !== undefined) updatedSale.customerEmail = customerEmail;
        if (paymentMethod) updatedSale.paymentMethod = paymentMethod;
        if (status) updatedSale.status = status;
        
        // Update items and recalculate if items provided
        if (items && Array.isArray(items)) {
            updatedSale.items = items.map(item => ({
                ...item,
                total: item.quantity * item.price
            }));
            
            updatedSale.subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            updatedSale.tax = updatedSale.subtotal * 0.1;
            updatedSale.discount = discount !== undefined ? discount : updatedSale.discount;
            updatedSale.total = updatedSale.subtotal + updatedSale.tax - updatedSale.discount;
        }
        
        updatedSale.updatedAt = new Date();
        sales[saleIndex] = updatedSale;
        
        res.json({
            success: true,
            message: 'Sale updated successfully',
            sale: updatedSale
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update sale',
            message: error.message
        });
    }
});

// DELETE /api/sales/:id - Delete sale
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const saleIndex = sales.findIndex(sale => sale.id === parseInt(id));
        
        if (saleIndex === -1) {
            return res.status(404).json({
                error: 'Sale not found'
            });
        }
        
        const deletedSale = sales.splice(saleIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Sale deleted successfully',
            sale: deletedSale
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete sale',
            message: error.message
        });
    }
});

// GET /api/sales/stats/summary - Get sales statistics
router.get('/stats/summary', (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        
        let filteredSales = [...sales];
        
        // Filter by date range if provided
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
        
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        const completedSales = filteredSales.filter(sale => sale.status === 'completed');
        const pendingSales = filteredSales.filter(sale => sale.status === 'pending');
        
        // Daily sales breakdown
        const dailySales = {};
        filteredSales.forEach(sale => {
            const date = sale.date;
            if (!dailySales[date]) {
                dailySales[date] = { count: 0, revenue: 0 };
            }
            dailySales[date].count++;
            dailySales[date].revenue += sale.total;
        });
        
        // Payment method breakdown
        const paymentMethods = {};
        filteredSales.forEach(sale => {
            if (!paymentMethods[sale.paymentMethod]) {
                paymentMethods[sale.paymentMethod] = { count: 0, revenue: 0 };
            }
            paymentMethods[sale.paymentMethod].count++;
            paymentMethods[sale.paymentMethod].revenue += sale.total;
        });
        
        res.json({
            summary: {
                totalSales,
                totalRevenue,
                averageOrderValue,
                completedSales: completedSales.length,
                pendingSales: pendingSales.length
            },
            dailySales,
            paymentMethods
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get sales statistics',
            message: error.message
        });
    }
});

module.exports = router;