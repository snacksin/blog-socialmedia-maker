// API endpoint for extracting content from a blog URL

import { authMiddleware } from '../../lib/auth';
import { extractBlogContent } from '../../lib/blog-extractor';

/**
 * Handler for extracting blog content from a URL
 * This endpoint is protected and requires authentication
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // Extract blog content from the provided URL
    const blogData = await extractBlogContent(url);
    
    // Return the extracted blog data
    return res.status(200).json(blogData);
  } catch (error) {
    console.error('Blog extraction error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to extract blog content' 
    });
  }
}

// Export the handler wrapped with auth middleware
export default authMiddleware(handler);
