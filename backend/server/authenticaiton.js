const jwt = require('jsonwebtoken');

const secretKey = '1191820114'; 
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    // console.log(token);
    if (!token) {
        return res.status(401).json({ error: 'Token missing or invalid' });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        req.user_id = decoded.user_id; // Attach user_id to the request object
        next();
    });
};

module.exports = authenticateToken;
