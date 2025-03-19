// API endpoint for generating social media briefs

import { sql } from '@vercel/postgres';
import { authMiddleware } from '../../utils/auth';
import { decrypt } from '../../utils/encryption';
import { initializeOpenAI, generateSocialBrief } from '../../utils/openai';

/**
 * Handler for generating social media briefs from blog content
 * This endpoint is protected and requires authentication
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user.userId;
  const { title, content, url } = req.body;

  // Validate input
  if (!title || !content || !url) {
    return res.status(400).json({ 
      message: 'Blog title, content, and URL are required' 
    });
  }

  try {
    // Get user's OpenAI API key from database
    const result = await sql`
      SELECT api_key FROM users WHERE id = ${userId}
    `;

    const user = result.rows[0];
    
    if (!user || !user.api_key) {
      return res.status(400).json({ 
        message: 'No API key found. Please add your OpenAI API key in settings.' 
      });
    }

    // Decrypt the API key
    const apiKey = decrypt(user.api_key);

    if (!apiKey) {
      return res.status(500).json({ 
        message: 'Failed to decrypt API key' 
      });
    }

    // Initialize OpenAI client with user's API key
    const openai = initializeOpenAI(apiKey);

    // Generate social media brief
    const brief = await generateSocialBrief(openai, {
      title,
      content,
      url
    });

    // Return the generated brief
    return res.status(200).json({ brief });
  } catch (error) {
    console.error('Brief generation error:', error);
    
    // Handle different types of errors
    if (error.message.includes('OpenAI API')) {
      return res.status(400).json({ 
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Failed to generate social media brief' 
    });
  }
}

// Export the handler wrapped with auth middleware
export default authMiddleware(handler);
