const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'غير مصرح به، يرجى تسجيل الدخول' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'انتهت صلاحية الجلسة' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;