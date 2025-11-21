// middleware/adminAuth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Admin access token required' 
    });
  }

  jwt.verify(token, config.jwt.adminSecret, (err, admin) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired admin token' 
      });
    }
    
    // Verify admin role
    if (admin.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    req.admin = admin;
    next();
  });
};

module.exports = { authenticateAdmin };
