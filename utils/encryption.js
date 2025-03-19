// Client-side encryption utilities 
// (Note: This is a simplified version without actual encryption for client-side use)

/**
 * Check if a string appears to be encrypted
 * @param {string} text - Text to check
 * @returns {boolean} - True if the text appears to be encrypted
 */
export function isEncrypted(text) {
  if (!text) return false;
  
  // Simple check for the encryption format we use (iv:encrypted)
  const parts = text.split(':');
  if (parts.length !== 2) return false;
  
  // Check if first part looks like a hex string of correct length for IV
  const iv = parts[0];
  return /^[0-9a-f]{32}$/i.test(iv);
}

/**
 * Creates a masked version of an API key for display
 * @param {string} apiKey - API key to mask
 * @returns {string} - Masked API key
 */
export function maskApiKey(apiKey) {
  if (!apiKey) return '';
  
  // Show only first 4 and last 4 characters
  const firstPart = apiKey.substring(0, 4);
  const lastPart = apiKey.substring(apiKey.length - 4);
  
  return `${firstPart}...${lastPart}`;
}
