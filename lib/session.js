import { getIronSession } from 'iron-session';

// Updated for newer versions of iron-session
const sessionOptions = {
  password: process.env.COOKIE_SECRET || 'complex-password-at-least-32-characters-long',
  cookieName: process.env.COOKIE_NAME || 'blog_to_social_session',
  // Updated cookie options format
  cookieOptions: {
    // Secure in production
    secure: process.env.NODE_ENV === 'production',
    // Only accessible by the server
    httpOnly: true,
    // For better security, but limits cookie to same-site usage
    sameSite: 'lax',
    // Session expires after 24 hours
    maxAge: 24 * 60 * 60,
    // Path for the cookie
    path: '/',
  },
};

// Updated middleware for API routes with newer iron-session API
export function withSessionRoute(handler) {
  return async function sessionRoute(req, res) {
    req.session = await getIronSession(req, res, sessionOptions);
    return handler(req, res);
  };
}

// Updated middleware for SSR functions
export function withSessionSsr(handler) {
  return async function sessionSsr(context) {
    context.req.session = await getIronSession(
      context.req,
      context.res,
      sessionOptions
    );
    return handler(context);
  };
}

// Attaches a session to the request and returns the session
export async function getSession(req) {
  // Session middleware attaches the session to the request
  if (!req.session) {
    throw new Error('No session found in request - ensure withSessionRoute or withSessionSsr is used');
  }
  return req.session;
}

// Checks if the request has an authenticated user
export async function isAuthenticated(req) {
  const session = await getSession(req);
  return !!session.user;
}

// Gets the user ID from the session
export function getUserId(req) {
  return req.session?.user?.id || null;
}

// Set user data in session (after login/register)
export async function setUserSession(req, userData) {
  req.session.user = userData;
  await req.session.save();
}

// Clear session (for logout)
export async function clearSession(req) {
  req.session.destroy();
}
