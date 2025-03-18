# Blog to Social Media

A modern Next.js web application that transforms blog content into engaging Facebook social media briefs with viral headlines, text snippets, and calls to action.

## Features

- **Modern Glassmorphism UI** with Tailwind CSS
- **User Authentication** system for managing multiple users
- **OpenAI API Integration** with GPT-4.5 for generating viral content
- **Blog Content Extraction** from WordPress and other blog platforms
- **Secure API Key Management** using encryption and Vercel Postgres
- **Copy to Clipboard** functionality for easy social media posting

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres
- **AI**: OpenAI GPT-4.5
- **Deployment**: Vercel

## Project Structure

```
blog-to-social/
├── pages/               # Next.js pages and API routes
│   ├── api/             # API endpoints (Serverless Functions)
│   │   ├── auth/        # Authentication endpoints
│   │   ├── brief/       # Brief generation endpoints
│   │   └── user/        # User management endpoints
│   ├── _app.js          # Next.js App component
│   └── index.js         # Main page
├── styles/              # CSS styles
│   ├── globals.css      # Global styles and Glassmorphism
│   └── Home.module.css  # Page-specific styles
├── lib/                 # Utility functions
│   ├── auth.js          # Authentication utilities
│   ├── blog-extractor.js# Blog content extraction
│   ├── encryption.js    # API key encryption
│   └── openai.js        # OpenAI integration
├── package.json         # Dependencies and scripts
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── vercel.json          # Vercel deployment configuration
```

## Setup and Deployment

### Prerequisites

- Node.js 18 or later
- A Vercel account
- An OpenAI API key
- GitHub repository

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/snacksin/blog-socialmedia-maker.git
   cd blog-socialmedia-maker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   JWT_SECRET=your_jwt_secret_here
   ENCRYPTION_KEY=your_32_byte_encryption_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Visit `http://localhost:3000` to see the application

### Deployment to Vercel

1. Push your code to GitHub
   ```
   git push -u origin main
   ```

2. Set Up Project in Vercel
   - Go to [vercel.com](https://vercel.com/)
   - Sign in with your GitHub account
   - Click "Add New..." > "Project"
   - Select "blog-socialmedia-maker" from your repositories
   - Click "Deploy"

3. Configure Environment Variables
   - After deployment, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following required variables:
   
   a. **JWT_SECRET**:
   - Generate using: `openssl rand -base64 32`
   - This secures user authentication tokens
   
   b. **ENCRYPTION_KEY**:
   - Generate using: `openssl rand -hex 16`
   - Must be 32 hex characters (16 bytes) for AES-256 encryption
   - Used to encrypt user's OpenAI API keys

4. Set up Vercel Postgres:
   - In Vercel dashboard, go to "Storage"
   - Create a new Postgres database
   - The connection details will be automatically added to your environment variables

## Database Schema

The application uses Vercel Postgres with the following schema:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  api_key VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

1. Register for an account or log in
2. Add your OpenAI API key in the settings
3. Enter a blog URL in the input field
4. Click "Generate Brief" to create a social media brief
5. Use the copy button to copy the generated brief to your clipboard
6. Paste the brief into your Facebook post editor

## Troubleshooting

- **Build Errors**: If you encounter build errors related to missing modules, ensure that the lib files are properly located in both the project root and pages directory.
- **API Key Issues**: Verify that your OpenAI API key is valid and has not reached its rate limit.
- **Database Connection**: Check that your Vercel Postgres database is properly set up and connected.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
