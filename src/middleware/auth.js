const db = require('../db');

const { supabase } = db;

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Store user in request object for later use
    req.user = data.user;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error authenticating token' });
  }
};

module.exports = {
  authenticateToken
};