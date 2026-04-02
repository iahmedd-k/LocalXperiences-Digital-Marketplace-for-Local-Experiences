const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    const user = await User.findById(decoded.id);
    if (!user) return errorResponse(res, 401, 'User not found');
    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 401, 'Invalid token');
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // swallow errors for optional auth
  }
  next();
};

const hostOnly = (req, res, next) => {
  if (!req.user) return errorResponse(res, 401, 'Not authenticated');
  if (req.user.role !== 'host') {
    return errorResponse(res, 403, 'Host access only');
  }
  next();
};

module.exports = { protect, optionalAuth, hostOnly };
