const express = require('express');
const db = require('../database/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Create store
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { storeName, colorPalette, category } = req.body;
        const userId = req.user.id;
        
        // Generate unique subdomain
        const subdomain = storeName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
        
        // Check if user already has a store
        const [existing] = await db.query(
            'SELECT id FROM stores WHERE user_id = ?',
            [userId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'لديك متجر بالفعل' });
        }
        
        const [result] = await db.query(
            `INSERT INTO stores (user_id, store_name, subdomain, color_palette, category) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, storeName, subdomain, colorPalette, category]
        );
        
        res.status(201).json({
            message: 'تم إنشاء المتجر بنجاح',
            store: {
                id: result.insertId,
                storeName,
                subdomain,
                colorPalette,
                category,
                storeUrl: `https://${subdomain}.yourdomain.com`
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's store
router.get('/my-store', authenticateToken, async (req, res) => {
    try {
        const [stores] = await db.query(
            'SELECT * FROM stores WHERE user_id = ?',
            [req.user.id]
        );
        
        if (stores.length === 0) {
            return res.status(404).json({ message: 'لم يتم إنشاء متجر بعد' });
        }
        
        res.json(stores[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update social media settings
router.put('/social-settings', authenticateToken, async (req, res) => {
    try {
        const { socialLinks, aiAssistant } = req.body;
        const userId = req.user.id;
        
        await db.query(
            `UPDATE stores SET social_links = ?, ai_assistant = ? 
             WHERE user_id = ?`,
            [JSON.stringify(socialLinks), aiAssistant, userId]
        );
        
        res.json({ message: 'تم تحديث إعدادات التواصل الاجتماعي' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;