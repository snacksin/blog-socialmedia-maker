# Blog to Social Media Post Generator

This is a [Next.js](https://nextjs.org) application that fetches content from a blog post URL, extracts the title and main content, and uses the OpenAI API to generate a catchy social media headline and an explanatory paragraph.

## Features

- Fetches blog post content from a given URL.
- Extracts title and main text content using JSDOM.
- Utilizes OpenAI's GPT-4 Turbo model to generate social media copy.
- Built with Next.js App Router, TypeScript, and Tailwind CSS.

## Project Structure

The project follows standard Next.js conventions with some added structure for better organization:

- `src/app/`: Contains the main application routes and UI.
  - `api/`: Houses the API routes (e.g., for generating summaries).
- `src/components/`: Reusable React components.
- `src/lib/`: Utility functions and shared logic.
- `src/hooks/`: Custom React hooks.
- `src/types/`: TypeScript type definitions.
- `public/`: Static assets.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd blog-to-social-media
```

### 2. Install Dependencies

Choose your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

This project requires an OpenAI API key to function.

1.  Create a file named `.env.local` in the root of the project (`blog-to-social-media/`).
2.  Add your OpenAI API key to this file:

    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```

    Replace `your_openai_api_key_here` with your actual key.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1.  Navigate to the application in your browser (usually `http://localhost:3000`).
2.  Enter the full URL of the blog post you want to summarize in the input field.
3.  Click the "Generate" button.
4.  The application will fetch the content, process it, and display the generated social media headline and paragraph.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important:** Remember to configure your `OPENAI_API_KEY` as an environment variable in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on deploying to Vercel and other platforms.

## Learn More About Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
