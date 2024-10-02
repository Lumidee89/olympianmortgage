const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware to verify token and extract user or admin info
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    // Extract token from 'Bearer <token>' format if the token is in that form
    const tokenString = token.split(' ')[1] || token; // Handles 'Bearer <token>' and direct token

    jwt.verify(tokenString, config.jwt.secret || process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }

        // Store user or admin ID in request based on the decoded token
        if (decoded.userId) {
            req.userId = decoded.userId;
        }
        if (decoded.adminId) {
            req.adminId = decoded.adminId;
        }

        next();
    });
};

module.exports = verifyToken;
