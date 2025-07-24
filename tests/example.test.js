// Example test file for MP System ERP
// Run with: npm test

const request = require('supertest');
const app = require('../backend/server');

describe('MP System ERP API Tests', () => {
    
    describe('Health Check', () => {
        test('GET /api/health should return OK status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body.status).toBe('OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('Authentication', () => {
        test('POST /api/auth/login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.username).toBe('admin');
        });

        test('POST /api/auth/login with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'wrongpassword'
                })
                .expect(401);
            
            expect(response.body.error).toBe('Invalid credentials');
        });

        test('POST /api/auth/login without credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);
            
            expect(response.body.error).toBe('Username and password are required');
        });
    });

    describe('Inventory Management', () => {
        let authToken;

        beforeEach(async () => {
            // Login to get auth token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });
            authToken = loginResponse.body.token;
        });

        test('GET /api/inventory should return inventory list', async () => {
            const response = await request(app)
                .get('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.items)).toBe(true);
        });

        test('GET /api/inventory without auth should return 401', async () => {
            await request(app)
                .get('/api/inventory')
                .expect(401);
        });

        test('POST /api/inventory should create new item', async () => {
            const newItem = {
                name: 'Test Item',
                sku: 'TEST001',
                quantity: 10,
                price: 100,
                category: 'Test Category'
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newItem)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.item.name).toBe(newItem.name);
            expect(response.body.item.sku).toBe(newItem.sku);
        });

        test('POST /api/inventory with duplicate SKU should return 409', async () => {
            const duplicateItem = {
                name: 'Duplicate Item',
                sku: 'SKU001', // This SKU already exists
                quantity: 10,
                price: 100
            };

            const response = await request(app)
                .post('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .send(duplicateItem)
                .expect(409);
            
            expect(response.body.error).toBe('SKU already exists');
        });

        test('GET /api/inventory/:id should return single item', async () => {
            const response = await request(app)
                .get('/api/inventory/1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.id).toBe(1);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('sku');
        });

        test('GET /api/inventory/:id with invalid ID should return 404', async () => {
            await request(app)
                .get('/api/inventory/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('Sales Management', () => {
        let authToken;

        beforeEach(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });
            authToken = loginResponse.body.token;
        });

        test('GET /api/sales should return sales list', async () => {
            const response = await request(app)
                .get('/api/sales')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body).toHaveProperty('sales');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.sales)).toBe(true);
        });

        test('POST /api/sales should create new sale', async () => {
            const newSale = {
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                items: [
                    {
                        id: 1,
                        name: 'Test Item',
                        quantity: 2,
                        price: 100
                    }
                ],
                paymentMethod: 'cash'
            };

            const response = await request(app)
                .post('/api/sales')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newSale)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.sale.customerName).toBe(newSale.customerName);
            expect(response.body.sale.total).toBeGreaterThan(0);
        });
    });

    describe('Reports', () => {
        let authToken;

        beforeEach(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });
            authToken = loginResponse.body.token;
        });

        test('GET /api/reports/inventory should return inventory report', async () => {
            const response = await request(app)
                .get('/api/reports/inventory')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.reportType).toBe('inventory');
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('items');
        });

        test('GET /api/reports/sales should return sales report', async () => {
            const response = await request(app)
                .get('/api/reports/sales')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.reportType).toBe('sales');
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('sales');
        });

        test('GET /api/reports/dashboard should return dashboard report', async () => {
            const response = await request(app)
                .get('/api/reports/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            
            expect(response.body.reportType).toBe('dashboard');
            expect(response.body).toHaveProperty('metrics');
        });
    });

    describe('Error Handling', () => {
        test('GET /api/nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);
            
            expect(response.body.error).toBe('Not Found');
        });
    });
});

// Helper functions for testing
const generateTestUser = () => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    password: 'testpassword123'
});

const generateTestItem = () => ({
    name: `Test Item ${Date.now()}`,
    sku: `TEST_${Date.now()}`,
    quantity: Math.floor(Math.random() * 100),
    price: Math.floor(Math.random() * 1000) + 100,
    category: 'Test Category'
});

const generateTestSale = () => ({
    customerName: `Test Customer ${Date.now()}`,
    customerEmail: `customer_${Date.now()}@example.com`,
    items: [
        {
            id: 1,
            name: 'Test Item',
            quantity: 1,
            price: 100
        }
    ],
    paymentMethod: 'cash'
});

module.exports = {
    generateTestUser,
    generateTestItem,
    generateTestSale
};