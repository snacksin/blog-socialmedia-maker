import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Auth State Management
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
    hasApiKey: false
  });

  const [blogUrl, setBlogUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('error');
  const [showError, setShowError] = useState(false);

  // Initialize app when component mounts
  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState({
          ...parsedAuth,
          // Don't store actual API key in authState
          hasApiKey: parsedAuth.hasApiKey || false
        });
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        clearAuthState();
      }
    }
  }, []);

  // Auth Functions
  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    
    try {
      // In a real app, this would call the API
      // Temporary mock implementation for demo
      mockAuthResponse({
        email,
        name: email.split('@')[0], // Use part of email as name
        id: '123456'
      });
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    
    try {
      // In a real app, this would call the API
      mockAuthResponse({
        email,
        name: email.split('@')[0], // Use part of email as name
        id: '123456'
      });
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    }
  };

  const handleLogout = () => {
    clearAuthState();
  };

  // API Key Functions
  const handleSaveApiKey = async () => {
    if (!apiKey || !apiKey.startsWith('sk-')) {
      showToast('Please enter a valid OpenAI API key', 'error');
      return;
    }
    
    try {
      // In a real app, this would call the API
      setAuthState(prev => ({ ...prev, hasApiKey: true }));
      saveAuthState();
      showToast('API key saved successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save API key', 'error');
    }
  };

  const handleChangeApiKey = () => {
    setAuthState(prev => ({ ...prev, hasApiKey: false }));
  };

  // Brief Generation Functions
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    
    if (!blogUrl) {
      showToast('Please enter a blog URL', 'error');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Call server-side API to generate brief
      await generateBrief(blogUrl);
    } catch (error) {
      console.error('Brief generation error:', error);
      showToast(error.message || 'Failed to generate brief', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBrief = async (url) => {
    try {
      // Step 1: Extract blog content using the server-side API
      const extractResponse = await fetch('/api/brief/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({ url })
      });
      
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.message || 'Failed to extract blog content');
      }
      
      const blogData = await extractResponse.json();
      
      // Step 2: Generate social brief using the extracted content
      const generateResponse = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          title: blogData.title,
          content: blogData.content,
          url: blogData.url
        })
      });
      
      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.message || 'Failed to generate social brief');
      }
      
      const { brief } = await generateResponse.json();
      
      // Display the generated brief
      displayBrief(brief, url);
    } catch (error) {
      console.error('Error in brief generation process:', error);
      throw error; // Re-throw for the parent handler
    }
  };

  const displayBrief = (briefText, originalUrl) => {
    // Parse the brief text
    const headlineMatch = briefText.match(/HEADLINE:(.*?)(?=\n\n)/s);
    const snippetMatch = briefText.match(/SNIPPET:(.*?)(?=\n\n)/s);
    const ctaMatch = briefText.match(/CTA:(.*?)(?=(\n\n|$))/s);
    
    const parsedBrief = {
      headline: headlineMatch ? headlineMatch[1].trim() : '',
      snippet: snippetMatch ? snippetMatch[1].trim() : '',
      cta: ctaMatch ? ctaMatch[1].trim() : '',
      originalUrl
    };
    
    setBrief(parsedBrief);
  };

  // Copy functionality
  const handleCopyBrief = () => {
    if (!brief) return;
    
    const textToCopy = `${brief.headline}\n\n${brief.snippet}\n\n${brief.cta}`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('Copied to clipboard!', 'success');
      })
      .catch(err => {
        showToast('Failed to copy text: ' + err, 'error');
      });
  };

  // Helper functions
  const mockAuthResponse = (user) => {
    const newAuthState = {
      isLoggedIn: true,
      user,
      token: 'mock-jwt-token',
      hasApiKey: false
    };
    
    setAuthState(newAuthState);
    localStorage.setItem('authState', JSON.stringify(newAuthState));
  };

  const saveAuthState = () => {
    localStorage.setItem('authState', JSON.stringify(authState));
  };

  const clearAuthState = () => {
    setAuthState({
      isLoggedIn: false,
      user: null,
      token: null,
      hasApiKey: false
    });
    
    localStorage.removeItem('authState');
    setBrief(null);
  };

  const showToast = (message, type = 'error') => {
    setErrorMessage(message);
    setErrorType(type);
    setShowError(true);
    
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient min-h-screen font-sans">
      <Head>
        <title>Blog to Social Media</title>
        <meta name="description" content="Transform blog content into engaging Facebook posts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Blog to Social Media</h1>
          <p className="text-xl text-white/80">Transform blog content into engaging Facebook posts</p>
        </header>

        <main>
          {/* Auth Section (Login/Register/API Key) */}
          <div className="glassmorphism p-6 rounded-2xl mb-8 max-w-md mx-auto">
            {!authState.isLoggedIn ? (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">Login or Register</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-white mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="glass-input"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-white mb-1">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      className="glass-input"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      className="glass-button flex-1"
                      onClick={handleLogin}
                    >
                      Login
                    </button>
                    <button 
                      className="glass-button flex-1"
                      onClick={handleRegister}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Welcome {authState.user?.name}</h2>
                  <button 
                    className="text-sm text-white/70 hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">OpenAI API Key</h3>
                  {!authState.hasApiKey ? (
                    <div className="space-y-3">
                      <p className="text-white/80 text-sm">You need to add your OpenAI API key to use this application.</p>
                      <div>
                        <input 
                          type="password" 
                          className="glass-input"
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button 
                          className="glass-button mt-2 w-full"
                          onClick={handleSaveApiKey}
                        >
                          Save API Key
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/80 text-sm">Your API key is stored securely.</p>
                      <button 
                        className="glass-button-outline text-sm"
                        onClick={handleChangeApiKey}
                      >
                        Change API Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* URL Input & Brief Generation */}
          {authState.isLoggedIn && authState.hasApiKey && (
            <div>
              <div className="glassmorphism p-6 rounded-2xl mb-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">Generate Social Media Brief</h2>
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="blog-url" className="block text-white mb-1">Blog URL</label>
                    <input 
                      type="url" 
                      id="blog-url" 
                      className="glass-input"
                      placeholder="https://example.com/blog-post"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="glass-button w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      <span>Generate Brief</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Results Section */}
              {brief && (
                <div className="glassmorphism p-6 rounded-2xl max-w-3xl mx-auto animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Your Social Media Brief</h2>
                    <button 
                      className="glass-button-outline flex items-center"
                      onClick={handleCopyBrief}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  <div className="text-white space-y-4 mb-4">
                    <div className="brief-headline">{brief.headline}</div>
                    <div className="brief-text">{brief.snippet}</div>
                    <div className="brief-cta">{brief.cta}</div>
                  </div>
                  <div className="text-sm text-white/60 italic">
                    <p>Original URL: {brief.originalUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Error Toast */}
        {showError && (
          <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg toast-animation ${
            errorType === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'
          } text-white`}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
