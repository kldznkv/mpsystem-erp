// User model - placeholder for database schema
// In a real application, this would use Mongoose, Sequelize, or another ORM

class User {
    constructor({
        id,
        username,
        email,
        firstName,
        lastName,
        password,
        role = 'employee',
        status = 'active',
        createdAt = new Date(),
        updatedAt = new Date(),
        lastLogin = null
    }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password; // Should be hashed in real app
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLogin = lastLogin;
    }

    // Static methods for validation
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUsername(username) {
        // Username should be 3-30 characters, alphanumeric and underscore
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    }

    static validatePassword(password) {
        // Password should be at least 6 characters
        return password && password.length >= 6;
    }

    static validateRole(role) {
        const validRoles = ['administrator', 'manager', 'employee', 'user'];
        return validRoles.includes(role);
    }

    // Instance methods
    updateLastLogin() {
        this.lastLogin = new Date();
        this.updatedAt = new Date();
    }

    changePassword(newPassword) {
        if (User.validatePassword(newPassword)) {
            this.password = newPassword; // Should hash in real app
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    updateProfile(updates) {
        const allowedUpdates = ['firstName', 'lastName', 'email'];
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

    // Get safe user data (without password)
    toSafeObject() {
        const { password, ...safeUser } = this;
        return safeUser;
    }

    // Get full name
    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    // Check if user is active
    isActive() {
        return this.status === 'active';
    }

    // Check if user has admin privileges
    isAdmin() {
        return this.role === 'administrator';
    }

    // Check if user can manage others
    canManage() {
        return this.role === 'administrator' || this.role === 'manager';
    }
}

// Example schema for MongoDB with Mongoose (commented out)
/*
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['administrator', 'manager', 'employee', 'user'],
        default: 'employee'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
*/

module.exports = User;