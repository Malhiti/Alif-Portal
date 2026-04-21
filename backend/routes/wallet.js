const express = require('express');
const db = require('../database/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get wallet balance and transactions
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT wallet_balance FROM users WHERE id = ?',
            [req.user.id]
        );
        
        const [transactions] = await db.query(
            `SELECT * FROM wallet_transactions 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 20`,
            [req.user.id]
        );
        
        res.json({
            balance: users[0].wallet_balance,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Transfer money to another user
router.post('/transfer', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { toUsername, amount, notes } = req.body;
        
        if (amount <= 0) {
            throw new Error('المبلغ يجب أن يكون أكبر من صفر');
        }
        
        // Get sender
        const [senders] = await connection.query(
            'SELECT id, wallet_balance FROM users WHERE id = ? FOR UPDATE',
            [req.user.id]
        );
        
        if (senders[0].wallet_balance < amount) {
            throw new Error('رصيد غير كافٍ في المحفظة');
        }
        
        // Get receiver
        const [receivers] = await connection.query(
            'SELECT id FROM users WHERE username = ?',
            [toUsername]
        );
        
        if (receivers.length === 0) {
            throw new Error('المستخدم المستلم غير موجود');
        }
        
        // Update sender balance
        await connection.query(
            'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
            [amount, req.user.id]
        );
        
        // Update receiver balance
        await connection.query(
            'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
            [amount, receivers[0].id]
        );
        
        // Record transactions
        await connection.query(
            `INSERT INTO wallet_transactions (user_id, amount, type, reference_id, notes, status)
             VALUES (?, ?, 'transfer', ?, ?, 'completed')`,
            [req.user.id, -amount, `transfer_to_${toUsername}`, notes || 'تحويل إلى مستخدم آخر']
        );
        
        await connection.query(
            `INSERT INTO wallet_transactions (user_id, amount, type, reference_id, notes, status)
             VALUES (?, ?, 'transfer', ?, ?, 'completed')`,
            [receivers[0].id, amount, `transfer_from_${senders[0].username}`, notes || 'استلام تحويل']
        );
        
        await connection.commit();
        
        res.json({ message: 'تم التحويل بنجاح', amount });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;