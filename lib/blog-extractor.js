// Blog content extraction utility

import { JSDOM } from 'jsdom';

/**
 * Extract blog content from a given URL
 * @param {string} url - Blog URL to extract content from
 * @returns {Promise<Object>} - Extracted blog data
 */
export async function extractBlogContent(url) {
  if (!url) {
    throw new Error('URL is required');
  }
  
  try {
    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogToSocialBot/1.0; +https://blog-to-social.vercel.app)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const dom = new JSDOM(html);
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
    
    return {
      title,
      content,
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
