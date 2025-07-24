// InventoryItem model - placeholder for database schema

class InventoryItem {
    constructor({
        id,
        name,
        description = '',
        sku,
        quantity = 0,
        price = 0,
        cost = 0,
        category = 'Без категории',
        supplier = '',
        minStockLevel = 5,
        maxStockLevel = 1000,
        unit = 'шт',
        barcode = '',
        location = '',
        status = 'active',
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sku = sku;
        this.quantity = quantity;
        this.price = price;
        this.cost = cost;
        this.category = category;
        this.supplier = supplier;
        this.minStockLevel = minStockLevel;
        this.maxStockLevel = maxStockLevel;
        this.unit = unit;
        this.barcode = barcode;
        this.location = location;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Static validation methods
    static validateSKU(sku) {
        // SKU should be 3-50 characters, alphanumeric and dash/underscore
        const skuRegex = /^[a-zA-Z0-9_-]{3,50}$/;
        return skuRegex.test(sku);
    }

    static validatePrice(price) {
        return !isNaN(price) && price >= 0;
    }

    static validateQuantity(quantity) {
        return Number.isInteger(quantity) && quantity >= 0;
    }

    // Instance methods
    updateQuantity(newQuantity, reason = 'manual_adjustment') {
        if (!InventoryItem.validateQuantity(newQuantity)) {
            throw new Error('Invalid quantity value');
        }

        const oldQuantity = this.quantity;
        this.quantity = newQuantity;
        this.updatedAt = new Date();

        // Return change log entry
        return {
            itemId: this.id,
            oldQuantity,
            newQuantity,
            change: newQuantity - oldQuantity,
            reason,
            timestamp: this.updatedAt
        };
    }

    adjustQuantity(adjustment, reason = 'adjustment') {
        return this.updateQuantity(this.quantity + adjustment, reason);
    }

    updatePrice(newPrice) {
        if (!InventoryItem.validatePrice(newPrice)) {
            throw new Error('Invalid price value');
        }

        this.price = newPrice;
        this.updatedAt = new Date();
    }

    updateCost(newCost) {
        if (!InventoryItem.validatePrice(newCost)) {
            throw new Error('Invalid cost value');
        }

        this.cost = newCost;
        this.updatedAt = new Date();
    }

    // Calculate profit margin
    getProfitMargin() {
        if (this.price === 0) return 0;
        return ((this.price - this.cost) / this.price) * 100;
    }

    // Calculate total value
    getTotalValue() {
        return this.quantity * this.price;
    }

    // Calculate total cost
    getTotalCost() {
        return this.quantity * this.cost;
    }

    // Check stock levels
    isLowStock() {
        return this.quantity <= this.minStockLevel;
    }

    isOverStock() {
        return this.quantity >= this.maxStockLevel;
    }

    isOutOfStock() {
        return this.quantity === 0;
    }

    getStockStatus() {
        if (this.isOutOfStock()) return 'out_of_stock';
        if (this.isLowStock()) return 'low_stock';
        if (this.isOverStock()) return 'over_stock';
        return 'normal';
    }

    // Update item details
    updateDetails(updates) {
        const allowedUpdates = [
            'name', 'description', 'category', 'supplier',
            'minStockLevel', 'maxStockLevel', 'unit', 'barcode', 'location'
        ];

        let hasChanges = false;

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined && updates[field] !== this[field]) {
                this[field] = updates[field];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.updatedAt = new Date();
        }

        return hasChanges;
    }

    // Check if item is active
    isActive() {
        return this.status === 'active';
    }

    // Archive item
    archive() {
        this.status = 'archived';
        this.updatedAt = new Date();
    }

    // Restore archived item
    restore() {
        this.status = 'active';
        this.updatedAt = new Date();
    }

    // Get item summary
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            sku: this.sku,
            quantity: this.quantity,
            price: this.price,
            totalValue: this.getTotalValue(),
            stockStatus: this.getStockStatus(),
            category: this.category
        };
    }
}

// Example schema for MongoDB with Mongoose (commented out)
/*
const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        default: 0,
        min: 0
    },
    category: {
        type: String,
        default: 'Без категории',
        trim: true
    },
    supplier: {
        type: String,
        default: '',
        trim: true
    },
    minStockLevel: {
        type: Number,
        default: 5,
        min: 0
    },
    maxStockLevel: {
        type: Number,
        default: 1000,
        min: 1
    },
    unit: {
        type: String,
        default: 'шт',
        trim: true
    },
    barcode: {
        type: String,
        default: '',
        trim: true
    },
    location: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'discontinued'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
*/

module.exports = InventoryItem;