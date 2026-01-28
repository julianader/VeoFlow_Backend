import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config.js';

/**
 * Simple JWT Authentication middleware
 * In development mode, bypasses auth completely
 */
// Consistent dev user ID for development mode
const DEV_USER_ID = '000000000000000000000001';

export const authMiddleware = (req, res, next) => {
  try {
    // Development mode: bypass authentication completely
    if (config.nodeEnv === 'development') {
      req.userId = DEV_USER_ID;
      req.user = { userId: DEV_USER_ID, name: 'Developer', email: 'dev@localhost' };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Generate JWT token (legacy/fallback)
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Optional Keycloak authentication middleware for routes
 */
export const optionalKeycloakAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = keycloakService.decodeToken(token);

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return next();
    }

    req.userId = decoded.sub;
    req.user = decoded;
  } catch (error) {
    // Continue without auth
  }

  next();
};
