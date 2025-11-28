const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;

const MOCK_USERS = [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com' },
    { id: 2, username: 'user1', password: 'pass123', email: 'user1@example.com' }
];

const findUserByCredentials = async (username, password) => {
    return MOCK_USERS.find(u => u.username === username && u.password === password);
};

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        const user = await findUserByCredentials(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;