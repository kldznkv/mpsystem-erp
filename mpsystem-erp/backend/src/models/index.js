// Export all models from this file
// This makes it easier to import models throughout the application

// Example models (replace with actual database models)
const User = require('./User');
const InventoryItem = require('./InventoryItem');
const Sale = require('./Sale');
const Report = require('./Report');

module.exports = {
    User,
    InventoryItem,
    Sale,
    Report
};