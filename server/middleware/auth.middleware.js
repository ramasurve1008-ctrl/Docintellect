import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { inMemoryStore } from '../services/store.service.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_docintellect_ai_2026_production');

      // Check Mongoose or fallback inMemoryStore
      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Fallback store check
      }

      const memUser = inMemoryStore.getUserById(decoded.id);
      if (memUser) {
        req.user = memUser;
        return next();
      }

      // If user ID was a demo or valid decoded token, attach standard fallback profile
      req.user = {
        _id: decoded.id || 'demo-user-1',
        name: decoded.name || 'Claims Adjuster',
        email: decoded.email || 'adjuster@docintellect.ai',
        role: decoded.role || 'Claims Adjuster',
      };
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token verification failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided in Authorization header',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
