const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ 
            success: false,
            message: "Token required"
        });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid format. Use: Bearer <token>' 
        });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;