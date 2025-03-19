// Blog to Social Media App - Main JavaScript

// Main API endpoints (to be implemented with Vercel)
const API_BASE_URL = '/api'; // Use relative path for local development
const ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  saveApiKey: `${API_BASE_URL}/user/apikey`,
  checkApiKey: `${API_BASE_URL}/user/check-apikey`,
  extractBlog: `${API_BASE_URL}/brief/extract`,
  generateBrief: `${API_BASE_URL}/brief/generate`
};

// DOM Elements
const elements = {
  // Auth elements
  authSection: document.getElementById('auth-section'),
  loggedOutView: document.getElementById('logged-out-view'),
  loggedInView: document.getElementById('logged-in-view'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  loginBtn: document.getElementById('login-btn'),
  registerBtn: document.getElementById('register-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  userName: document.getElementById('user-name'),
  
  // API Key elements
  apiKeySection: document.getElementById('api-key-section'),
  noApiKeyView: document.getElementById('no-api-key'),
  hasApiKeyView: document.getElementById('has-api-key'),
  apiKeyInput: document.getElementById('api-key-input'),
  saveApiKeyBtn: document.getElementById('save-api-key-btn'),
  changeApiKeyBtn: document.getElementById('change-api-key-btn'),
  
  // Application elements
  appSection: document.getElementById('app-section'),
  urlForm: document.getElementById('url-form'),
  blogUrlInput: document.getElementById('blog-url'),
  generateBtn: document.getElementById('generate-btn'),
  generateBtnText: document.getElementById('generate-btn-text'),
  generateSpinner: document.getElementById('generate-spinner'),
  
  // Results elements
  resultsSection: document.getElementById('results-section'),
  briefContent: document.getElementById('brief-content'),
  copyBtn: document.getElementById('copy-btn'),
  originalUrl: document.getElementById('original-url'),
  
  // Toast elements
  errorToast: document.getElementById('error-toast')
};

// Auth State Management
let authState = {
  isLoggedIn: false,
  user: null,
  token: null,
  hasApiKey: false
};

// Initialize the application
function initApp() {
  // Check if user is logged in (from localStorage)
  const savedAuth = localStorage.getItem('authState');
  if (savedAuth) {
    try {
      const parsedAuth = JSON.parse(savedAuth);
      authState = {
        ...parsedAuth,
        // Don't store actual API key in authState/localStorage
        hasApiKey: parsedAuth.hasApiKey || false
      };
      updateAuthUI();
      
      // Check if API key is still valid on server
      checkApiKey();
    } catch (error) {
      console.error('Failed to parse saved auth state:', error);
      clearAuthState();
    }
  }
  
  // Attach event listeners
  attachEventListeners();
}

// Attach event listeners to DOM elements
function attachEventListeners() {
  // Auth event listeners
  elements.loginBtn.addEventListener('click', handleLogin);
  elements.registerBtn.addEventListener('click', handleRegister);
  elements.logoutBtn.addEventListener('click', handleLogout);
  
  // API Key event listeners
  elements.saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  elements.changeApiKeyBtn.addEventListener('click', handleChangeApiKey);
  
  // App event listeners
  elements.urlForm.addEventListener('submit', handleUrlSubmit);
  elements.copyBtn.addEventListener('click', handleCopyBrief);
}

// Authentication Functions
async function handleLogin() {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  
  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }
  
  try {
    // Temporary mock implementation for demo
    // In production, this would call the login API endpoint
    mockAuthResponse({
      email,
      name: email.split('@')[0], // Just use part of email as name for demo
      id: '123456'
    });
    
    // Check if the API key exists
    checkApiKey();
  } catch (error) {
    showError(error.message || 'Login failed');
  }
}

async function handleRegister() {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  
  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }
  
  try {
    // Temporary mock implementation for demo
    // In production, this would call the register API endpoint
    mockAuthResponse({
      email,
      name: email.split('@')[0], // Just use part of email as name for demo
      id: '123456'
    });
  } catch (error) {
    showError(error.message || 'Registration failed');
  }
}

function handleLogout() {
  clearAuthState();
  updateAuthUI();
}

// API Key Functions
async function handleSaveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    showError('Please enter a valid OpenAI API key');
    return;
  }
  
  try {
    // Temporary mock implementation for demo
    // In production, this would call the save API key endpoint
    authState.hasApiKey = true;
    saveAuthState();
    updateAuthUI();
    showError('API key saved successfully', 'success');
  } catch (error) {
    showError(error.message || 'Failed to save API key');
  }
}

function handleChangeApiKey() {
  elements.hasApiKeyView.classList.add('hidden');
  elements.noApiKeyView.classList.remove('hidden');
}

async function checkApiKey() {
  // Temporary mock implementation for demo
  // In production, this would call the check API key endpoint
  return authState.hasApiKey;
}

// Brief Generation Functions
async function handleUrlSubmit(e) {
  e.preventDefault();
  
  const url = elements.blogUrlInput.value.trim();
  
  if (!url) {
    showError('Please enter a blog URL');
    return;
  }
  
  setGeneratingState(true);
  
  try {
    // In a real implementation, these would be API calls
    // For demo purposes, we'll simulate the blog extraction and brief generation
    await generateBrief(url);
  } catch (error) {
    showError(error.message || 'Failed to generate brief');
  } finally {
    setGeneratingState(false);
  }
}

async function generateBrief(url) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock response for demo purposes
  const mockBrief = `
HEADLINE: 5 Shocking Ways Coffee is Actually Changing Your Brain 🧠

SNIPPET: New research reveals that your morning cup of coffee does more than just wake you up. Scientists have discovered that regular coffee consumption can enhance memory function and protect against neurodegenerative diseases.

CTA: Try switching to cold brew coffee for even more brain benefits! Drop a ☕ in the comments if you're joining the brain-boosting coffee challenge.
  `;
  
  displayBrief(mockBrief, url);
}

function displayBrief(briefText, originalUrl) {
  // Parse the brief text
  const headlineMatch = briefText.match(/HEADLINE:(.*?)(?=\n\n)/s);
  const snippetMatch = briefText.match(/SNIPPET:(.*?)(?=\n\n)/s);
  const ctaMatch = briefText.match(/CTA:(.*?)(?=(\n\n|$))/s);
  
  // Format the content
  let formattedContent = '';
  
  if (headlineMatch && headlineMatch[1]) {
    formattedContent += `<div class="brief-headline">${headlineMatch[1].trim()}</div>`;
  }
  
  if (snippetMatch && snippetMatch[1]) {
    formattedContent += `<div class="brief-text">${snippetMatch[1].trim()}</div>`;
  }
  
  if (ctaMatch && ctaMatch[1]) {
    formattedContent += `<div class="brief-cta">${ctaMatch[1].trim()}</div>`;
  }
  
  // Update the UI
  elements.briefContent.innerHTML = formattedContent;
  elements.originalUrl.textContent = originalUrl;
  elements.resultsSection.classList.remove('hidden');
  elements.resultsSection.classList.add('animate-fade-in');
  
  // Scroll to results
  elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Copy functionality
function handleCopyBrief() {
  const briefText = elements.briefContent.innerText;
  
  navigator.clipboard.writeText(briefText)
    .then(() => {
      // Change button text temporarily
      const originalText = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = 'Copied!';
      
      setTimeout(() => {
        elements.copyBtn.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      showError('Failed to copy text: ' + err);
    });
}

// UI Helper Functions
function updateAuthUI() {
  if (authState.isLoggedIn) {
    elements.loggedOutView.classList.add('hidden');
    elements.loggedInView.classList.remove('hidden');
    elements.appSection.classList.remove('hidden');
    
    // Update user info
    elements.userName.textContent = authState.user.name;
    
    // Update API key section
    if (authState.hasApiKey) {
      elements.noApiKeyView.classList.add('hidden');
      elements.hasApiKeyView.classList.remove('hidden');
    } else {
      elements.noApiKeyView.classList.remove('hidden');
      elements.hasApiKeyView.classList.add('hidden');
    }
  } else {
    elements.loggedOutView.classList.remove('hidden');
    elements.loggedInView.classList.add('hidden');
    elements.appSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');
  }
}

function setGeneratingState(isGenerating) {
  if (isGenerating) {
    elements.generateBtnText.classList.add('hidden');
    elements.generateSpinner.classList.remove('hidden');
    elements.generateBtn.disabled = true;
    elements.blogUrlInput.disabled = true;
  } else {
    elements.generateBtnText.classList.remove('hidden');
    elements.generateSpinner.classList.add('hidden');
    elements.generateBtn.disabled = false;
    elements.blogUrlInput.disabled = false;
  }
}

function showError(message, type = 'error') {
  const toast = elements.errorToast;
  toast.textContent = message;
  toast.classList.remove('hidden', 'bg-red-500/80', 'bg-green-500/80');
  
  if (type === 'error') {
    toast.classList.add('bg-red-500/80');
  } else if (type === 'success') {
    toast.classList.add('bg-green-500/80');
  }
  
  toast.classList.add('toast-animation');
  
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('toast-animation');
  }, 3000);
}

// Auth State Helpers
function mockAuthResponse(user) {
  // Mock auth response for demo purposes
  authState = {
    isLoggedIn: true,
    user,
    token: 'mock-jwt-token',
    hasApiKey: false
  };
  
  saveAuthState();
  updateAuthUI();
}

function saveAuthState() {
  localStorage.setItem('authState', JSON.stringify(authState));
}

function clearAuthState() {
  authState = {
    isLoggedIn: false,
    user: null,
    token: null,
    hasApiKey: false
  };
  
  localStorage.removeItem('authState');
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Utility function for demo purposes to bypass login (for testing)
function autoLogin() {
  mockAuthResponse({
    email: 'demo@example.com',
    name: 'Demo User',
    id: '123456'
  });
  authState.hasApiKey = true;
  saveAuthState();
  updateAuthUI();
}

// Call autoLogin() in the console to automatically log in for testing
