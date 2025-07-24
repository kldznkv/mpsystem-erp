const express = require('express');
const router = express.Router();

// Mock users data
let users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@mpsystem.com',
        firstName: 'Администратор',
        lastName: 'Системы',
        role: 'administrator',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-01-17T08:00:00')
    },
    {
        id: 2,
        username: 'manager',
        email: 'manager@mpsystem.com',
        firstName: 'Менеджер',
        lastName: 'Продаж',
        role: 'manager',
        status: 'active',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        lastLogin: new Date('2024-01-16T14:30:00')
    },
    {
        id: 3,
        username: 'employee',
        email: 'employee@mpsystem.com',
        firstName: 'Сотрудник',
        lastName: 'Склада',
        role: 'employee',
        status: 'active',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        lastLogin: new Date('2024-01-15T16:45:00')
    }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;
        
        let filteredUsers = [...users];
        
        // Filter by role
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        
        // Filter by status
        if (status) {
            filteredUsers = filteredUsers.filter(user => user.status === status);
        }
        
        // Search in username, email, firstName, lastName
        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                user.lastName.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Sort by creation date (newest first)
        filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        // Remove sensitive data
        const safeUsers = paginatedUsers.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });
        
        res.json({
            users: safeUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        });
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const user = users.find(user => user.id === parseInt(id));
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        // Remove sensitive data
        const { password, ...safeUser } = user;
        
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        });
    }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
    try {
        const {
            username,
            email,
            firstName,
            lastName,
            password,
            role = 'employee',
            status = 'active'
        } = req.body;
        
        if (!username || !email || !firstName || !lastName || !password) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }
        
        // Check if username or email already exists
        const existingUser = users.find(user => 
            user.username === username || user.email === email
        );
        
        if (existingUser) {
            return res.status(409).json({
                error: 'Username or email already exists'
            });
        }
        
        const newUser = {
            id: Math.max(...users.map(user => user.id)) + 1,
            username,
            email,
            firstName,
            lastName,
            password, // In real app, hash this
            role,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null
        };
        
        users.push(newUser);
        
        // Remove sensitive data from response
        const { password: _, ...safeUser } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message
        });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const userIndex = users.findIndex(user => user.id === parseInt(id));
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        const {
            username,
            email,
            firstName,
            lastName,
            role,
            status
        } = req.body;
        
        // Check if new username or email conflicts with existing users
        if (username && username !== users[userIndex].username) {
            const existingUser = users.find(user => user.username === username);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Username already exists'
                });
            }
        }
        
        if (email && email !== users[userIndex].email) {
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email already exists'
                });
            }
        }
        
        // Update user
        const updatedUser = {
            ...users[userIndex],
            username: username || users[userIndex].username,
            email: email || users[userIndex].email,
            firstName: firstName || users[userIndex].firstName,
            lastName: lastName || users[userIndex].lastName,
            role: role || users[userIndex].role,
            status: status || users[userIndex].status,
            updatedAt: new Date()
        };
        
        users[userIndex] = updatedUser;
        
        // Remove sensitive data from response
        const { password, ...safeUser } = updatedUser;
        
        res.json({
            success: true,
            message: 'User updated successfully',
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update user',
            message: error.message
        });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const userIndex = users.findIndex(user => user.id === parseInt(id));
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        // Prevent deletion of admin user
        if (users[userIndex].role === 'administrator') {
            return res.status(403).json({
                error: 'Cannot delete administrator user'
            });
        }
        
        const deletedUser = users.splice(userIndex, 1)[0];
        
        // Remove sensitive data from response
        const { password, ...safeUser } = deletedUser;
        
        res.json({
            success: true,
            message: 'User deleted successfully',
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        });
    }
});

// PUT /api/users/:id/password - Change user password
router.put('/:id/password', (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }
        
        const userIndex = users.findIndex(user => user.id === parseInt(id));
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }
        
        // Update password
        users[userIndex].password = newPassword; // In real app, hash this
        users[userIndex].updatedAt = new Date();
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to update password',
            message: error.message
        });
    }
});

// GET /api/users/stats/summary - Get user statistics
router.get('/stats/summary', (req, res) => {
    try {
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.status === 'active').length;
        const inactiveUsers = users.filter(user => user.status === 'inactive').length;
        
        const roleStats = {};
        users.forEach(user => {
            if (!roleStats[user.role]) {
                roleStats[user.role] = 0;
            }
            roleStats[user.role]++;
        });
        
        // Recent activity (users who logged in within last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentlyActiveUsers = users.filter(user => 
            user.lastLogin && new Date(user.lastLogin) > weekAgo
        ).length;
        
        res.json({
            summary: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                recentlyActiveUsers
            },
            roleStats
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get user statistics',
            message: error.message
        });
    }
});

module.exports = router;