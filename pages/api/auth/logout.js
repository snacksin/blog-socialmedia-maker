import { withSessionRoute } from '../../../lib/session';

/**
 * Logout API endpoint
 * Destroys the user's session cookie
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Destroy the session
  req.session.destroy();

  return res.status(200).json({ success: true });
}

export default withSessionRoute(handler);
