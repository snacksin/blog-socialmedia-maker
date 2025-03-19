// API Key Management Endpoint
import { sql } from '@vercel/postgres';
import { encrypt, decrypt } from '../../../utils/encryption';
import { authMiddleware } from '../../../utils/auth';

/**
 * Handler for API key management
 * - GET: Check if the user has an API key
 * - POST: Save an API key
 * - DELETE: Remove an API key
 */
async function handler(req, res) {
  try {
    // Get the user ID from the session
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Handle GET request - Check if user has API key
    if (req.method === 'GET') {
      const result = await sql`
        SELECT api_key FROM users WHERE id = ${userId}
      `;

      const user = result.rows[0];
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ 
        hasKey: !!user.api_key 
      });
    }

    // Handle POST request - Save API key
    if (req.method === 'POST') {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: 'API key is required' });
      }
      
      if (!apiKey.startsWith('sk-')) {
        return res.status(400).json({ message: 'Invalid API key format' });
      }
      
      // Encrypt the API key before storing
      const encryptedKey = encrypt(apiKey);

      // Update user record with encrypted API key
      await sql`
        UPDATE users 
        SET api_key = ${encryptedKey}
        WHERE id = ${userId}
      `;

      return res.status(200).json({ message: 'API key saved successfully' });
    }

    // Handle DELETE request - Remove API key
    if (req.method === 'DELETE') {
      await sql`
        UPDATE users 
        SET api_key = NULL
        WHERE id = ${userId}
      `;

      return res.status(200).json({ message: 'API key removed successfully' });
    }

    // If method not supported
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API key endpoint error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    return res.status(500).json({ message: 'Server error' });
  }
}

// Export the handler with authentication middleware
export default authMiddleware(handler);
