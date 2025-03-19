// Authentication utilities for client-side use

/**
 * Check if a user is currently authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Get the current authentication token from localStorage
 * @returns {string|null} The authentication token or null if not authenticated
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Set the authentication token in localStorage
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
 * Remove the authentication token (logout)
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with Authorization if authenticated
 */
export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
