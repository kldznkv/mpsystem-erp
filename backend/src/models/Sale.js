// Sale model - placeholder for database schema

class Sale {
    constructor({
        id,
        date = new Date().toISOString().split('T')[0],
        customerName,
        customerEmail = '',
        customerPhone = '',
        items = [],
        subtotal = 0,
        tax = 0,
        discount = 0,
        total = 0,
        status = 'pending',
        paymentMethod = 'cash',
        paymentStatus = 'pending',
        notes = '',
        salesPerson = '',
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.date = date;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.items = items;
        this.subtotal = subtotal;
        this.tax = tax;
        this.discount = discount;
        this.total = total;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.notes = notes;
        this.salesPerson = salesPerson;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Static validation methods
    static validateStatus(status) {
        const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
        return validStatuses.includes(status);
    }

    static validatePaymentMethod(method) {
        const validMethods = ['cash', 'card', 'bank_transfer', 'check', 'online'];
        return validMethods.includes(method);
    }

    static validatePaymentStatus(status) {
        const validStatuses = ['pending', 'paid', 'partial', 'refunded', 'failed'];
        return validStatuses.includes(status);
    }

    static validateEmail(email) {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Calculate totals from items
    calculateTotals(taxRate = 0.1) {
        this.subtotal = this.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
        }, 0);

        this.tax = this.subtotal * taxRate;
        this.total = this.subtotal + this.tax - this.discount;
        this.updatedAt = new Date();

        return {
            subtotal: this.subtotal,
            tax: this.tax,
            total: this.total
        };
    }

    // Add item to sale
    addItem(item) {
        if (!item.id || !item.name || !item.quantity || !item.price) {
            throw new Error('Item must have id, name, quantity, and price');
        }

        const existingItemIndex = this.items.findIndex(i => i.id === item.id);
        
        if (existingItemIndex >= 0) {
            // Update existing item quantity
            this.items[existingItemIndex].quantity += item.quantity;
            this.items[existingItemIndex].total = 
                this.items[existingItemIndex].quantity * this.items[existingItemIndex].price;
        } else {
            // Add new item
            this.items.push({
                ...item,
                total: item.quantity * item.price
            });
        }

        this.calculateTotals();
        return this.items;
    }

    // Remove item from sale
    removeItem(itemId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== itemId);
        
        if (this.items.length < initialLength) {
            this.calculateTotals();
            return true;
        }
        
        return false;
    }

    // Update item quantity
    updateItemQuantity(itemId, newQuantity) {
        const item = this.items.find(i => i.id === itemId);
        
        if (!item) {
            throw new Error('Item not found in sale');
        }

        if (newQuantity <= 0) {
            return this.removeItem(itemId);
        }

        item.quantity = newQuantity;
        item.total = item.quantity * item.price;
        this.calculateTotals();
        
        return item;
    }

    // Apply discount
    applyDiscount(discountAmount) {
        if (discountAmount < 0 || discountAmount > this.subtotal + this.tax) {
            throw new Error('Invalid discount amount');
        }

        this.discount = discountAmount;
        this.total = this.subtotal + this.tax - this.discount;
        this.updatedAt = new Date();
        
        return this.total;
    }

    // Complete the sale
    complete() {
        if (this.items.length === 0) {
            throw new Error('Cannot complete sale with no items');
        }

        this.status = 'completed';
        this.paymentStatus = 'paid';
        this.updatedAt = new Date();
        
        return this;
    }

    // Cancel the sale
    cancel(reason = '') {
        this.status = 'cancelled';
        if (reason) {
            this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
        }
        this.updatedAt = new Date();
        
        return this;
    }

    // Process refund
    refund(amount = null, reason = '') {
        if (this.status !== 'completed') {
            throw new Error('Can only refund completed sales');
        }

        const refundAmount = amount || this.total;
        
        if (refundAmount > this.total) {
            throw new Error('Refund amount cannot exceed sale total');
        }

        this.status = 'refunded';
        this.paymentStatus = 'refunded';
        
        if (reason) {
            this.notes = this.notes ? `${this.notes}\nRefund reason: ${reason}` : `Refund reason: ${reason}`;
        }
        
        this.updatedAt = new Date();
        
        return refundAmount;
    }

    // Get sale summary
    getSummary() {
        return {
            id: this.id,
            date: this.date,
            customerName: this.customerName,
            itemCount: this.items.length,
            totalQuantity: this.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: this.subtotal,
            tax: this.tax,
            discount: this.discount,
            total: this.total,
            status: this.status,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus
        };
    }

    // Check if sale is editable
    isEditable() {
        return this.status === 'pending';
    }

    // Check if sale is completed
    isCompleted() {
        return this.status === 'completed';
    }

    // Get customer information
    getCustomerInfo() {
        return {
            name: this.customerName,
            email: this.customerEmail,
            phone: this.customerPhone
        };
    }

    // Update customer information
    updateCustomerInfo(customerInfo) {
        const { name, email, phone } = customerInfo;
        
        if (name) this.customerName = name;
        if (email !== undefined) this.customerEmail = email;
        if (phone !== undefined) this.customerPhone = phone;
        
        this.updatedAt = new Date();
    }
}

// Example schema for MongoDB with Mongoose (commented out)
/*
const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
}, { _id: false });

const saleSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    items: [saleItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'check', 'online'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'refunded', 'failed'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: ''
    },
    salesPerson: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes
saleSchema.index({ date: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ customerName: 1 });

module.exports = mongoose.model('Sale', saleSchema);
*/

module.exports = Sale;