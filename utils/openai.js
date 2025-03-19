// OpenAI API client utilities

/**
 * Generate a social media brief using the server API
 * @param {Object} blogData - Data extracted from the blog
 * @param {string} blogData.title - Blog title
 * @param {string} blogData.content - Blog content
 * @param {string} blogData.url - Blog URL
 * @param {string} apiKey - Optional OpenAI API key to use for this request
 * @param {string} token - Optional auth token for authenticated requests
 * @returns {Promise<string>} - Generated social media brief
 */
export async function generateSocialBrief(blogData, apiKey = null, token = null) {
  if (!blogData || !blogData.title || !blogData.content) {
    throw new Error('Blog title and content are required');
  }
  
  try {
    // Prepare headers with authentication if provided
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Call our server-side API endpoint for brief generation
    const response = await fetch('/api/brief/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        blogData,
        apiKey, // Optional API key to use for this request
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to generate brief: ${response.status}`);
    }
    
    const data = await response.json();
    return data.brief;
    
  } catch (error) {
    console.error('Brief generation error:', error);
    throw new Error(`Failed to generate social media brief: ${error.message}`);
  }
}

/**
 * Test an OpenAI API key via the server API
 * @param {string} apiKey - OpenAI API key to test
 * @returns {Promise<boolean>} - True if key is valid, false otherwise
 */
export async function testApiKey(apiKey) {
  if (!apiKey) {
    return false;
  }
  
  try {
    const response = await fetch('/api/user/apikey/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
