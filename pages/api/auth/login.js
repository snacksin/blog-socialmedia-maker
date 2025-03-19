import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { withSessionRoute } from '../../../lib/session';
import { createToken } from '../../../utils/auth';

/**
 * Login API endpoint
 * Authenticates a user with email and password and sets a secure session cookie
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    const user = result.rows[0];

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if a password hash exists
    if (!user.password_hash) {
      // This is a special case for development where we might create users without passwords
      // In production, every user should have a password
      if (process.env.NODE_ENV !== 'production') {
        // Set the user data in the session
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };

        await req.session.save();

        // Create a JWT token for API access
        const token = createToken(user);

        return res.status(200).json({
          user: {
            id: user.id,
            name: user.name, 
            email: user.email,
            hasApiKey: !!user.api_key
          },
          token
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set the user data in the session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    await req.session.save();

    // Create a JWT token for API access
    const token = createToken(user);

    // Return user data and token
    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasApiKey: !!user.api_key
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
}

export default withSessionRoute(handler);
