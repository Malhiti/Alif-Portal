const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

// Add product
router.post('/add', authenticateToken, upload.single('media'), async (req, res) => {
    try {
        const { name, description, purchasePrice, sellingPrice, discount, quantity } = req.body;
        const userId = req.user.id;
        
        // Get user's store
        const [stores] = await db.query(
            'SELECT id FROM stores WHERE user_id = ?',
            [userId]
        );
        
        if (stores.length === 0) {
            return res.status(404).json({ message: 'يرجى إنشاء متجر أولاً' });
        }
        
        const storeId = stores[0].id;
        const mediaUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
        const mediaType = req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'video') : null;
        
        const [result] = await db.query(
            `INSERT INTO products (store_id, name, description, purchase_price, selling_price, discount, quantity, media_url, media_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [storeId, name, description, purchasePrice || null, sellingPrice, discount || 0, quantity || 0, mediaUrl, mediaType]
        );
        
        res.status(201).json({
            message: 'تم إضافة المنتج بنجاح',
            product: { id: result.insertId, name, sellingPrice, quantity }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all products for user's store
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const [stores] = await db.query(
            'SELECT id FROM stores WHERE user_id = ?',
            [req.user.id]
        );
        
        if (stores.length === 0) {
            return res.json([]);
        }
        
        const [products] = await db.query(
            'SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC',
            [stores[0].id]
        );
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;