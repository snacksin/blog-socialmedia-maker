// API Key Management Endpoint
import { encrypt, decrypt } from '../../../utils/encryption';
import { authMiddleware } from '../../../utils/auth';
import { query, sql, testConnection } from '../../../lib/db.esm';

/**
 * Handler for API key management
 * - GET: Check if the user has an API key
 * - POST: Save an API key
 * - DELETE: Remove an API key
 */
async function handler(req, res) {
  try {
    // Ensure database connection is available
    // This is a good place to test connection if there are issues
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 API Key endpoint accessed');
    }

    // Get the user ID from the session
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Handle GET request - Check if user has API key
    if (req.method === 'GET') {
      try {
        // Try using both our database methods for diagnostic purposes
        const pgResult = await query(
          'SELECT api_key FROM users WHERE id = $1',
          [userId]
        );
        
        // If pg query worked, we'll also try the Vercel client for comparison
        const vercelResult = await sql`
          SELECT api_key FROM users WHERE id = ${userId}
        `;

        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Database query results: PG rows: ${pgResult.rowCount}, Vercel rows: ${vercelResult.rowCount}`);
        }

        const user = pgResult.rows[0];
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
          hasKey: !!user.api_key
        });
      } catch (dbError) {
        console.error('Database error during API key GET:', dbError);
        
        // Try reconnecting to the database
        const reconnected = await testConnection();
        if (!reconnected) {
          return res.status(503).json({
            message: 'Database connection error',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
        
        throw dbError; // Re-throw to be caught by outer catch
      }
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
      
      try {
        // Encrypt the API key before storing
        const encryptedKey = encrypt(apiKey);

        // Update user record with encrypted API key using our query function
        await query(
          'UPDATE users SET api_key = $1 WHERE id = $2',
          [encryptedKey, userId]
        );

        return res.status(200).json({ message: 'API key saved successfully' });
      } catch (dbError) {
        console.error('Database error during API key POST:', dbError);
        return res.status(503).json({
          message: 'Failed to save API key',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    }

    // Handle DELETE request - Remove API key
    if (req.method === 'DELETE') {
      try {
        await query(
          'UPDATE users SET api_key = NULL WHERE id = $1',
          [userId]
        );

        return res.status(200).json({ message: 'API key removed successfully' });
      } catch (dbError) {
        console.error('Database error during API key DELETE:', dbError);
        return res.status(503).json({
          message: 'Failed to remove API key',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    }

    // If method not supported
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API key endpoint error:', error);
    
    if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    return res.status(500).json({
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Export the handler with authentication middleware
export default authMiddleware(handler);
