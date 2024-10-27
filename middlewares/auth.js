// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  },
  
  // Check user role
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Access denied - insufficient permissions' 
        });
      }
      next();
    };
  },
  
  // Check if email is verified
  requireVerified: (req, res, next) => {
    if (!req.user.verified) {
      return res.status(403).json({ 
        message: 'Email verification required' 
      });
    }
    next();
  },

  // Check if profile is complete
  requireCompleteProfile: (req, res, next) => {
    if (!req.user.profileComplete) {
      return res.status(403).json({ 
        message: 'Please complete your profile first' 
      });
    }
    next();
  },

  // For driver-specific routes, check if driver is verified
  requireVerifiedDriver: (req, res, next) => {
    if (req.user.role !== 'driver' || !req.user.driverVerified) {
      return res.status(403).json({ 
        message: 'Driver verification required' 
      });
    }
    next();
  }
};

module.exports = auth;