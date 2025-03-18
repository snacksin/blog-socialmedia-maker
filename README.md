# Blog to Social Media

A modern web application that transforms blog content into engaging Facebook social media briefs with viral headlines, text snippets, and calls to action.

## Features

- **Modern Glassmorphism UI** with Tailwind CSS
- **User Authentication** system for managing multiple users
- **OpenAI API Integration** with GPT-4.5 for generating viral content
- **Blog Content Extraction** from WordPress and other blog platforms
- **Secure API Key Management** using encryption and Vercel Postgres
- **Copy to Clipboard** functionality for easy social media posting

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript with Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres
- **AI**: OpenAI GPT-4.5
- **Deployment**: Vercel

## Project Structure

```
blog-to-social/
├── api/                  # Vercel Serverless Functions
│   ├── auth/             # Authentication endpoints
│   ├── brief/            # Brief generation endpoints
│   └── user/             # User management endpoints
├── lib/                  # Utility functions
│   ├── auth.js           # Authentication utilities
│   ├── blog-extractor.js # Blog content extraction
│   ├── encryption.js     # API key encryption
│   └── openai.js         # OpenAI integration
├── index.html            # Main application page
├── styles.css            # Glassmorphism and UI styles
├── script.js             # Client-side application logic
├── package.json          # Dependencies and scripts
└── vercel.json           # Vercel deployment configuration
```

## Setup and Deployment

### Prerequisites

- Node.js 18 or later
- A Vercel account
- An OpenAI API key

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/yourusername/blog-to-social-media.git
   cd blog-to-social-media
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

2. Connect your GitHub repository to Vercel

3. Add the required environment variables in the Vercel dashboard:
   - `JWT_SECRET`: A secure random string for JWT generation
   - `ENCRYPTION_KEY`: A 32-byte key for API key encryption

4. Deploy your application

5. Set up Vercel Postgres:
   - Create a Postgres database in the Vercel dashboard
   - Vercel will automatically add the database connection variables to your project

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
