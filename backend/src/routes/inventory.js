const express = require('express');
const router = express.Router();

// Mock inventory data
let inventory = [
    {
        id: 1,
        name: 'Товар 1',
        description: 'Описание товара 1',
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
        description: 'Описание товара 2',
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
        description: 'Описание товара 3',
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

// GET /api/inventory - Get all inventory items
router.get('/', (req, res) => {
    try {
        const { page = 1, limit = 20, category, search } = req.query;
        
        let filteredInventory = [...inventory];
        
        // Filter by category
        if (category) {
            filteredInventory = filteredInventory.filter(item => 
                item.category.toLowerCase().includes(category.toLowerCase())
            );
        }
        
        // Search in name, description, sku
        if (search) {
            filteredInventory = filteredInventory.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.sku.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedItems = filteredInventory.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredInventory.length,
                totalPages: Math.ceil(filteredInventory.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch inventory',
            message: error.message
        });
    }
});

// GET /api/inventory/:id - Get single inventory item
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const item = inventory.find(item => item.id === parseInt(id));
        
        if (!item) {
            return res.status(404).json({
                error: 'Item not found'
            });
        }
        
        res.json(item);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch item',
            message: error.message
        });
    }
});

// POST /api/inventory - Create new inventory item
router.post('/', (req, res) => {
    try {
        const {
            name,
            description,
            sku,
            quantity,
            price,
            cost,
            category,
            supplier
        } = req.body;
        
        if (!name || !sku || quantity === undefined || !price) {
            return res.status(400).json({
                error: 'Name, SKU, quantity, and price are required'
            });
        }
        
        // Check if SKU already exists
        const existingItem = inventory.find(item => item.sku === sku);
        if (existingItem) {
            return res.status(409).json({
                error: 'SKU already exists'
            });
        }
        
        const newItem = {
            id: Math.max(...inventory.map(item => item.id)) + 1,
            name,
            description: description || '',
            sku,
            quantity: parseInt(quantity),
            price: parseFloat(price),
            cost: parseFloat(cost) || 0,
            category: category || 'Без категории',
            supplier: supplier || '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        inventory.push(newItem);
        
        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: newItem
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create item',
            message: error.message
        });
    }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                error: 'Item not found'
            });
        }
        
        const {
            name,
            description,
            sku,
            quantity,
            price,
            cost,
            category,
            supplier
        } = req.body;
        
        // Check if new SKU conflicts with existing items
        if (sku && sku !== inventory[itemIndex].sku) {
            const existingItem = inventory.find(item => item.sku === sku);
            if (existingItem) {
                return res.status(409).json({
                    error: 'SKU already exists'
                });
            }
        }
        
        // Update item
        const updatedItem = {
            ...inventory[itemIndex],
            name: name || inventory[itemIndex].name,
            description: description !== undefined ? description : inventory[itemIndex].description,
            sku: sku || inventory[itemIndex].sku,
            quantity: quantity !== undefined ? parseInt(quantity) : inventory[itemIndex].quantity,
            price: price !== undefined ? parseFloat(price) : inventory[itemIndex].price,
            cost: cost !== undefined ? parseFloat(cost) : inventory[itemIndex].cost,
            category: category || inventory[itemIndex].category,
            supplier: supplier !== undefined ? supplier : inventory[itemIndex].supplier,
            updatedAt: new Date()
        };
        
        inventory[itemIndex] = updatedItem;
        
        res.json({
            success: true,
            message: 'Item updated successfully',
            item: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update item',
            message: error.message
        });
    }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                error: 'Item not found'
            });
        }
        
        const deletedItem = inventory.splice(itemIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Item deleted successfully',
            item: deletedItem
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete item',
            message: error.message
        });
    }
});

// GET /api/inventory/stats/summary - Get inventory statistics
router.get('/stats/summary', (req, res) => {
    try {
        const totalItems = inventory.length;
        const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const lowStockItems = inventory.filter(item => item.quantity < 10).length;
        
        const categories = [...new Set(inventory.map(item => item.category))];
        const categoryStats = categories.map(category => {
            const categoryItems = inventory.filter(item => item.category === category);
            return {
                category,
                itemCount: categoryItems.length,
                totalQuantity: categoryItems.reduce((sum, item) => sum + item.quantity, 0),
                totalValue: categoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
            };
        });
        
        res.json({
            summary: {
                totalItems,
                totalQuantity,
                totalValue,
                lowStockItems
            },
            categoryStats
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get inventory statistics',
            message: error.message
        });
    }
});

module.exports = router;