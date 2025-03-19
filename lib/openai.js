// OpenAI API integration for generating social media briefs

import { OpenAI } from 'openai';

/**
 * Initialize OpenAI client with the provided API key
 * @param {string} apiKey - OpenAI API key
 * @returns {OpenAI} - OpenAI client instance
 */
export function initializeOpenAI(apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  return new OpenAI({ apiKey });
}

/**
 * Generate a social media brief using OpenAI
 * @param {OpenAI} openai - OpenAI client instance
 * @param {Object} blogData - Data extracted from the blog
 * @param {string} blogData.title - Blog title
 * @param {string} blogData.content - Blog content
 * @param {string} blogData.url - Blog URL
 * @returns {Promise<string>} - Generated social media brief
 */
export async function generateSocialBrief(openai, blogData) {
  const { title, content, url } = blogData;
  
  if (!title || !content) {
    throw new Error('Blog title and content are required');
  }
  
  // Truncate content if it's too long to stay within token limits
  const truncatedContent = content.substring(0, 2000);
  
  try {
    // Create prompt for generating social media brief
    const prompt = `
    Create a Facebook social media brief from this blog article.
    
    Article Title: ${title}
    
    Article Content: ${truncatedContent}
    
    Please create:
    1. A viral headline that will make people stop scrolling (make it attention-grabbing but not clickbait)
    2. A brief text snippet (2-3 sentences) that summarizes the key value from the article
    3. A clear call-to-action that encourages engagement
    
    Format the response as:
    HEADLINE: [your viral headline]
    
    SNIPPET: [your text snippet]
    
    CTA: [your call to action]
    
    Original URL: ${url}
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Updated to a supported model version
      messages: [
        {
          role: "system", 
          content: "You are a social media expert who creates viral Facebook posts. Your content is positive, engaging, and designed to stop people from scrolling. You create hooks that grab attention without being clickbait."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // Add some creativity but not too random
      max_tokens: 500, // Limit response length
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Extract useful error information if available
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }
}

/**
 * Test the OpenAI API key to ensure it's valid
 * @param {string} apiKey - OpenAI API key to test
 * @returns {Promise<boolean>} - True if key is valid, false otherwise
 */
export async function testApiKey(apiKey) {
  try {
    const openai = initializeOpenAI(apiKey);
    
    // Make a minimal API call to validate the key
    await openai.models.list();
    
    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
