const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                mobile: user.mobile,
                walletBalance: user.wallet_balance
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, fullName, mobile, email } = req.body;
        
        // Check if user exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? OR mobile = ?',
            [username, mobile]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'اسم المستخدم أو رقم الموبايل مستخدم بالفعل' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, password, full_name, mobile, email) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, fullName, mobile, email || null]
        );
        
        // Create token
        const token = jwt.sign(
            { id: result.insertId, username, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                username,
                fullName,
                mobile,
                walletBalance: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;