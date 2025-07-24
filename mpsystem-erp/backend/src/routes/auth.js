const express = require('express');
const router = express.Router();

// Mock user data (replace with database)
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@mpsystem.com',
        password: 'admin123', // In real app, this should be hashed
        role: 'administrator'
    },
    {
        id: 2,
        username: 'manager',
        email: 'manager@mpsystem.com',
        password: 'manager123',
        role: 'manager'
    }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }
        
        // Find user
        const user = users.find(u => 
            u.username === username && u.password === password
        );
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        
        // Generate token (in real app, use JWT)
        const token = `token_${user.id}_${Date.now()}`;
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    try {
        // In real app, invalidate token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Logout failed',
            message: error.message
        });
    }
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
    try {
        // Mock authentication check
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization token provided'
            });
        }
        
        // Extract user ID from token (simplified)
        const tokenParts = authHeader.split('_');
        const userId = parseInt(tokenParts[1]);
        
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }
        
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Profile fetch failed',
            message: error.message
        });
    }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Username, email and password are required'
            });
        }
        
        // Check if user exists
        const existingUser = users.find(u => 
            u.username === username || u.email === email
        );
        
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists'
            });
        }
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password, // In real app, hash this
            role
        };
        
        users.push(newUser);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

module.exports = router;