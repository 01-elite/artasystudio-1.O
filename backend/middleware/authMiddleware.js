const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not authorized, please login" });

    try {
        const decoded = jwt.verify(token, "YOUR_SECRET_KEY"); // Use .env for this later
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token failed" });
    }
};

const creatorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'creator') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Creators only." });
    }
};

module.exports = { protect, creatorOnly };