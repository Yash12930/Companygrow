// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../server').User; // Adjust path if server.js exports User differently
                                     // Or, more commonly: const User = mongoose.model('User');
                                     // Assuming User model is globally registered by Mongoose

// Re-access JWT_SECRET. Best practice is to have this in a config file or env variable.
// For now, redeclaring it here if not easily importable from server.js
const JWT_SECRET = 'abc'; // Ensure this matches JWT_SECRET in server.js

module.exports = function(req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // Check if it's a Bearer token
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Token is not valid (Bearer format expected)' });
        }
        const token = authHeader.split(' ')[1]; // Get token from "Bearer <token>"

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user; // Add user payload (id, role) to request object
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
