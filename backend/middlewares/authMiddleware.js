const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from "Bearer <token>" header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized — no token provided'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized — user no longer exists'));
    }

    if (!req.user.isActive) {
      res.status(403);
      return next(new Error('Account has been deactivated'));
    }

    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized — invalid or expired token'));
  }
};

/**
 * Restrict to specific roles.
 * Usage: authorize('admin', 'team_lead')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role '${req.user?.role}' is not authorized to access this resource`));
    }
    next();
  };
};

module.exports = { protect, authorize };
