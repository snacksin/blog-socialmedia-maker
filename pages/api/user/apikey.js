// API Key Management Endpoint
// This would be deployed as a serverless function on Vercel

import { sql } from '@vercel/postgres';
import { encrypt, decrypt } from '../../../utils/encryption';
import { authMiddleware } from '../../../utils/auth';

export default async function handler(req, res) {
  try {
    // Verify authentication
    await authMiddleware(req);
    const userId = req.user.userId;

    // Handle GET request - Check if user has API key
    if (req.method === 'GET') {
      const result = await sql`
        SELECT api_key FROM users WHERE id = ${userId}
      `;

      const user = result.rows[0];
      return res.status(200).json({ 
        hasKey: !!user?.api_key 
      });
    }

    // Handle POST request - Save API key
    if (req.method === 'POST') {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ message: 'API key is required' });
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
    
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return res.status(401).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Server error' });
  }
}
