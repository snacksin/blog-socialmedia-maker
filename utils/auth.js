// Authentication utilities for client-side and server-side use
import jwt from 'jsonwebtoken';
import { withSessionRoute, isAuthenticated as sessionIsAuthenticated, getUserId as sessionGetUserId } from '../lib/session';

// CLIENT-SIDE UTILS
/**
 * Check if a user is currently authenticated (client-side)
 * Requires getServerSideProps to set the session cookie
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  // This becomes a check for the presence of user data in the session
  // The actual state is managed and stored by the server in an HTTP-only cookie
  return !!window.__user;
}

/**
 * Get authentication headers for API requests (client-side)
 * @returns {Object} Headers object with the required headers for authenticated requests
 */
export function getAuthHeaders() {
  // No explicit token is needed since the cookie will be sent automatically
  return { 'Content-Type': 'application/json' };
}

/**
 * Make authenticated fetch request
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
export async function authFetch(url, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important: Include cookies with the request
  });
}

/**
 * Logout helper (client-side)
 * @returns {Promise} - Result of logout API call
 */
export async function logout() {
  const response = await authFetch('/api/auth/logout', {
    method: 'POST',
  });
  
  if (response.ok) {
    // Clear any client-side state if needed
    window.location.href = '/'; // Redirect to home page after logout
    return true;
  }
  return false;
}

// SERVER-SIDE UTILS
/**
 * Auth middleware that wraps API handlers to require authentication (server-side)
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler function with auth check using session
 */
export function authMiddleware(handler) {
  return withSessionRoute(async (req, res) => {
    try {
      // Check if the user is authenticated using the session
      if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Add user data to request object for convenience
      req.user = req.session.user;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}

/**
 * Helper function to get user ID from request (server-side)
 * @param {Object} req - Express request object with session
 * @returns {string|null} - User ID or null if not authenticated
 */
export function getUserId(req) {
  return req.session?.user?.id || null;
}

/**
 * Helper function to check if a user is authenticated (server-side)
 * @param {Object} req - Express request object with session
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticatedRequest(req) {
  return !!req.session?.user;
}

/**
 * Create a JWT token for user authentication
 * @param {Object} userData - User data to include in the token
 * @returns {string} - JWT token
 */
export function createToken(userData) {
  const tokenData = {
    id: userData.id,
    email: userData.email,
    name: userData.name
  };
  return jwt.sign(
    tokenData,
    process.env.JWT_SECRET || 'development-jwt-secret',
    { expiresIn: '1d' }
  );
}

/**
 * Verify a JWT token and return the decoded user data
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded user data or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'development-jwt-secret');
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Helper function to set user session after successful authentication
 * @param {Object} req - Express request object with session
 * @param {Object} userData - User data to store in session
 * @returns {Promise} - Promise that resolves when session is saved
 */
export async function setUserSession(req, userData) {
  req.session.user = {
    id: userData.id,
    email: userData.email,
    name: userData.name
  };
  await req.session.save();
}
