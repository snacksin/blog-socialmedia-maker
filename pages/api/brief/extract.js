// Server-side API endpoint for blog content extraction
// This isolates the JSDOM usage to the server where Node.js modules are available

import { JSDOM } from 'jsdom';
import { authMiddleware } from '../../../utils/auth';

/**
 * Handler for extracting blog content from a URL
 * This endpoint is protected and requires authentication
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // Validate URL format
    const parsedUrl = new URL(url);
    
    // You might want to add more validation here, e.g. allowed domains
    
    // Extract blog content
    const blogData = await extractBlogContent(url);
    
    // Return the extracted blog data
    return res.status(200).json(blogData);
  } catch (error) {
    console.error('Blog extraction error:', error);
    
    // Send appropriate error based on type
    if (error.message.includes('Invalid URL')) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Failed to extract blog content' 
    });
  }
}

/**
 * Extract blog content from a given URL
 * Server-side only function that uses JSDOM
 * @param {string} url - Blog URL to extract content from
 * @returns {Promise<Object>} - Extracted blog data
 */
async function extractBlogContent(url) {
  try {
    // Set timeout to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Fetch the HTML content with security headers
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogToSocialBot/1.0; +https://blog-to-social.vercel.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    clearTimeout(timeoutId); // Clear timeout after successful fetch
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Basic HTML validation (optional)
    if (!html || html.length < 100) {
      throw new Error('Retrieved content is too small to be a valid blog post');
    }
    
    // Parse the HTML
    const dom = new JSDOM(html, {
      url: url, // Set URL for proper relative URL resolution
      referrer: url,
      contentType: 'text/html',
      includeNodeLocations: false,
      storageQuota: 10000000, // Limit storage to prevent DoS
    });
    
    const document = dom.window.document;
    
    // Extract title - try different common selectors
    const title = extractTitle(document);
    
    // Extract content - try different common selectors
    const content = extractContent(document);
    
    // Extract featured image
    const featuredImage = extractFeaturedImage(document, url);
    
    // Validate extracted content
    if (!title) {
      throw new Error('Could not extract blog title');
    }
    
    if (!content) {
      throw new Error('Could not extract blog content');
    }
    
    // Truncate content to prevent excessive data transfer
    const truncatedContent = content.length > 5000 
      ? content.substring(0, 5000) + '...'
      : content;
    
    return {
      title,
      content: truncatedContent,
      featuredImage,
      url
    };
  } catch (error) {
    console.error('Blog extraction error:', error);
    throw new Error(`Failed to extract blog content: ${error.message}`);
  }
}

/**
 * Extract the blog title from the document
 * @param {Document} document - JSDOM document
 * @returns {string} - Extracted title
 */
function extractTitle(document) {
  // Try different common selectors for blog titles
  const titleSelectors = [
    'h1.entry-title',            // Common WordPress
    'h1.post-title',             // Common blog
    'article h1',                // Generic article
    'main h1',                   // Generic main content
    'h1',                        // Any h1
    'title'                      // Document title
  ];
  
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // Fallback to document title
  return document.title.trim();
}

/**
 * Extract the blog content from the document
 * @param {Document} document - JSDOM document
 * @returns {string} - Extracted content
 */
function extractContent(document) {
  // Try different common selectors for blog content
  const contentSelectors = [
    'div.entry-content',         // Common WordPress
    'article.post-content',      // Common blog
    'div.post-content',          // Common blog
    'main article',              // Generic article
    'main',                      // Main content
    'article',                   // Any article
    '.content',                  // Generic content class
    '#content'                   // Generic content ID
  ];
  
  let contentElement = null;
  
  // Find the first matching selector that contains content
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim().length > 100) { // Ensure it has substantial content
      contentElement = element;
      break;
    }
  }
  
  if (!contentElement) {
    // Fallback to body if no content element found
    contentElement = document.body;
  }
  
  // Extract paragraphs from the content element
  const paragraphs = Array.from(contentElement.querySelectorAll('p'));
  
  if (paragraphs.length === 0) {
    // If no paragraphs found, just use the text content
    return contentElement.textContent.trim();
  }
  
  // Join paragraphs with double newlines
  return paragraphs
    .map(p => p.textContent.trim())
    .filter(text => text.length > 0)
    .join('\n\n');
}

/**
 * Extract the featured image from the document
 * @param {Document} document - JSDOM document
 * @param {string} baseUrl - Base URL for resolving relative URLs
 * @returns {string|null} - URL of featured image or null if not found
 */
function extractFeaturedImage(document, baseUrl) {
  // Try different common selectors for featured images
  const imageSelectors = [
    'meta[property="og:image"]',          // Open Graph image
    'meta[name="twitter:image"]',         // Twitter image
    'img.featured-image',                 // Generic featured image
    '.post-thumbnail img',                // Common WordPress
    'article img',                        // First image in article
    'figure img',                         // Image in figure
    'img'                                 // Any image
  ];
  
  // Try meta tags first
  for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    const element = document.querySelector(selector);
    if (element && element.content) {
      return resolveUrl(element.content, baseUrl);
    }
  }
  
  // Try image elements
  for (const selector of imageSelectors) {
    if (selector.startsWith('meta')) continue; // Skip meta tags (already checked)
    
    const element = document.querySelector(selector);
    if (element && element.src) {
      return resolveUrl(element.src, baseUrl);
    }
  }
  
  return null;
}

/**
 * Resolve relative URLs against a base URL
 * @param {string} url - URL to resolve
 * @param {string} baseUrl - Base URL
 * @returns {string} - Resolved URL
 */
function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch (error) {
    return url; // Return the original URL if it can't be resolved
  }
}

// Export the handler wrapped with auth middleware
export default authMiddleware(handler);
