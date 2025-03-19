// Authentication utilities for client-side and server-side use
import jwt from 'jsonwebtoken';

/**
 * Check if a user is currently authenticated (client-side)
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get the current authentication token from localStorage (client-side)
 * @returns {string|null} The authentication token or null if not authenticated
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Set the authentication token in localStorage (client-side)
 * @param {string} token The authentication token to store
 */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

/**
 * Remove the authentication token (logout) (client-side)
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

/**
 * Get authentication headers for API requests (client-side)
 * @returns {Object} Headers object with Authorization if authenticated
 */
export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Auth middleware that wraps API handlers to require authentication (server-side)
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler function with auth check
 */
export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      // Get token from Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-jwt-secret');
        
        // Add user data to request object
        req.user = decoded;
        
        // Call the original handler
        return handler(req, res);
      } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
}

/**
 * Helper function to get user ID from request (server-side)
 * @param {Object} req - Express request object
 * @returns {string|null} - User ID or null if not authenticated
 */
export function getUserId(req) {
  return req.user?.userId || null;
}

/**
 * Helper function to check if a user is authenticated (server-side)
 * @param {Object} req - Express request object
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticatedRequest(req) {
  return !!req.user;
}

/**
 * For development/testing purposes only - create a fake JWT token (server-side)
 * In production, this would not be exposed
 * @param {string} userId - User ID to include in token
 * @returns {string} - JWT token
 */
export function createTestToken(userId) {
  // This should only be used for testing!
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'development-jwt-secret', 
    { expiresIn: '1d' }
  );
}
