// Export all controllers from this file
// This makes it easier to import controllers throughout the application

const AuthController = require('./AuthController');
const UserController = require('./UserController');
const InventoryController = require('./InventoryController');
const SalesController = require('./SalesController');
const ReportsController = require('./ReportsController');

module.exports = {
    AuthController,
    UserController,
    InventoryController,
    SalesController,
    ReportsController
};