# Blog to Social Media Converter

A web application that transforms blog content into engaging social media posts for Facebook using OpenAI's API.

## Production Ready Setup

This application has been configured for production deployment with the following features:

### Database Integration
- PostgreSQL database hosted on Neon.tech
- Secure API key storage with encryption
- Schema includes users table and sessions table for secure authentication
- Database connection managed via environment variables

### Security Features
- Eliminated localStorage usage for sensitive data
- HTTP-only secure cookie-based sessions using iron-session
- Password hashing with bcrypt
- JWT tokens only used for API authentication, not for storing sensitive data
- API keys are stored encrypted in the database, never on the client
- Environment variables for all secrets and configuration

### Authentication System
- Secure login, register, and logout endpoints
- Session management with automatic expiration
- Protection for all API endpoints

### UI Improvements
- All text color set to white for better readability
- Enhanced glassmorphism effects
- Improved toast notifications
- Better hover and interactive states
- Custom scrollbar styling

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (a Neon.tech database URL is included in .env.local)

### Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   ```
   node setup-db.js
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

The following environment variables need to be set:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing JWT tokens
- `ENCRYPTION_KEY`: 32-character key for encrypting API keys
- `COOKIE_SECRET`: Secret for securing session cookies
- `COOKIE_NAME`: Name for the session cookie

## Usage

1. Register or log in to your account
2. Add your OpenAI API key in the user settings
3. Enter a blog URL to extract its content
4. The application will generate an engaging social media post including:
   - An attention-grabbing headline
   - A brief snippet summarizing the key points
   - A call-to-action to encourage engagement
5. Copy the generated content to use on Facebook

## Architecture

The application follows a standard Next.js architecture:

- `/pages`: Page components and API routes
- `/lib`: Core functionality libraries
- `/utils`: Utility functions 
- `/styles`: Global and component-specific styling
