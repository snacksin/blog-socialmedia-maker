// Blog content extraction utility - Client-safe version
// Instead of using JSDOM directly, this calls the server-side API

/**
 * Extract blog content from a given URL
 * Client-safe version that calls the server API
 * @param {string} url - Blog URL to extract content from
 * @param {string} token - Optional authentication token
 * @returns {Promise<Object>} - Extracted blog data
 */
export async function extractBlogContent(url, token = null) {
  if (!url) {
    throw new Error('URL is required');
  }
  
  try {
    // Call our server-side API instead of using JSDOM directly
    const response = await fetch('/api/brief/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to extract content: ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Blog extraction error:', error);
    throw new Error(`Failed to extract blog content: ${error.message}`);
  }
}
