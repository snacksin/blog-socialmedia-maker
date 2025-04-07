'use client';

import { useState } from 'react';
import { FormEvent } from 'react';

export default function HomePage() {
  const [blogContentInput, setBlogContentInput] = useState(''); // Renamed from url
  const [headline, setHeadline] = useState('');
  const [paragraphs, setParagraphs] = useState<string[]>([]); // Changed from bodyContent (string) to paragraphs (string[])
  const [loading, setLoading] = useState(false);
  const [copiedHeadline, setCopiedHeadline] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false); // Will copy all paragraphs joined
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setHeadline(''); // Clear previous results
    setParagraphs([]); // Clear previous results
    if (!blogContentInput.trim()) { // Check if blog content is empty
      setError('Please Paste Your Blog URL');
      return;
    }
    setLoading(true);
    setHeadline('');
    // paragraphs state already cleared above
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blogContent: blogContentInput }) // Send blogContentInput
      });
      const data = await response.json();
      if (response.ok) {
        // API returns { headline: string, paragraphs: string[] }
        setHeadline(data.headline || '');
        setParagraphs(data.paragraphs || []);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleCopyHeadline = () => {
    if (!headline) return;
    navigator.clipboard.writeText(headline);
    setCopiedHeadline(true);
    setTimeout(() => setCopiedHeadline(false), 2000);
  };

  const handleCopyBody = () => { // Copies all paragraphs joined by newlines
    if (paragraphs.length === 0) return;
    const bodyToCopy = paragraphs.join('\n\n'); // Join paragraphs with double newline for readability
    navigator.clipboard.writeText(bodyToCopy);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-5xl mx-auto my-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Blog to Social Media</h1>
          <p className="text-gray-400 text-lg">Transform WordPress blogs into social media content</p>
        </div>
        
        <div className="bento-grid">
          {/* Input Form - Large Item */}
          <div className="bento-item-large glass-effect glass-primary p-8 rounded-2xl border border-transparent animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl text-white font-medium mb-4">Paste Blog URL</h2>
              <textarea
                value={blogContentInput}
                onChange={(e) => setBlogContentInput(e.target.value)}
                placeholder="Paste your blog URL here..."
                className="blog-textarea w-full rounded-lg bg-gray-800/70 text-white border border-gray-700 focus:border-[#ff6f3c] focus:outline-none focus:ring-2 focus:ring-[#ff6f3c]/30 transition-all p-4" // Added blog-textarea class and padding
                rows={10} // Set initial height
              />
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white font-bold rounded-lg bg-gradient-to-r from-[#8e44ad] to-[#ff6f3c] hover:scale-105 transition transform disabled:opacity-70 flex justify-center items-center" // Added flex centering
                style={{ minHeight: '60px' }} // Ensure button has height even when loading
              >
                {loading ? (
                  /* Hamster Wheel Loader - Centered within the button */
                  <div className="flex justify-center items-center h-full w-full">
                    <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster" style={{ fontSize: '5px' }}> {/* Adjusted font-size to scale */}
                      <div className="wheel"></div>
                      <div className="hamster">
                        <div className="hamster__body">
                          <div className="hamster__head">
                            <div className="hamster__ear"></div>
                            <div className="hamster__eye"></div>
                            <div className="hamster__nose"></div>
                          </div>
                          <div className="hamster__limb hamster__limb--fr"></div>
                          <div className="hamster__limb hamster__limb--fl"></div>
                          <div className="hamster__limb hamster__limb--br"></div>
                          <div className="hamster__limb hamster__limb--bl"></div>
                          <div className="hamster__tail"></div>
                        </div>
                      </div>
                      <div className="spoke"></div>
                    </div>
                  </div>
                ) : (
                  'Generate'
                )}
              </button>
            </form>
          </div>
          
          {/* Results Area */}
          {(headline || paragraphs.length > 0) && ( // Check paragraphs array
            <div className="bento-item-large glass-effect glass-secondary animate-fade-in p-8 rounded-2xl border border-transparent space-y-6">
              <h3 className="text-2xl font-medium text-white">Here&apos;s Your Words Allie</h3>
              
              {/* Headline Section */}
              {headline && (
                <div className="content-section">
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">Headline</h4>
                  <div className="generated-text headline-display bg-gray-800/40 p-4 rounded-lg shadow-inner">{headline}</div>
                  <button
                    onClick={handleCopyHeadline}
                    className="copy-button mt-3 py-2 px-4 bg-gradient-to-r from-[#8e44ad]/80 to-[#ff6f3c]/80 text-white rounded-md hover:scale-105 transition text-sm flex items-center"
                    aria-label="Copy headline"
                  >
                    {copiedHeadline ? 'Copied!' : 'Copy Headline'}
                  </button>
                </div>
              )}

              {/* Body Section */}
              {paragraphs.length > 0 && (
                <div className="content-section">
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">Paragraphs</h4>
                  <div className="generated-text body-display space-y-4 bg-gray-800/40 p-4 rounded-lg max-h-80 overflow-y-auto shadow-inner">
                    {paragraphs.map((para, index) => (
                      <p key={index} className="whitespace-pre-line">{para}</p> // Display each paragraph
                    ))}
                  </div>
                  <button
                    onClick={handleCopyBody}
                    className="copy-button mt-3 py-2 px-4 bg-gradient-to-r from-[#8e44ad]/80 to-[#ff6f3c]/80 text-white rounded-md hover:scale-105 transition text-sm flex items-center"
                    aria-label="Copy body content"
                  >
                    {copiedBody ? 'Copied!' : 'Copy Paragraphs'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Card 1 */}
          <div className="glass-effect glass-tertiary p-6 rounded-2xl border border-transparent animate-fade-in" style={{animationDelay: '100ms'}}>
            <div className="flex flex-col h-full justify-between">
              <h3 className="text-xl font-medium text-white mb-3">Transform Blogs</h3>
              <p className="text-gray-300">Easily convert your WordPress blog content into social media-ready formats</p>
            </div>
          </div>
          
          {/* Info Card 2 */}
          <div className="glass-effect glass-tertiary p-6 rounded-2xl border border-transparent animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="flex flex-col h-full justify-between">
              <h3 className="text-xl font-medium text-white mb-3">Multi-Platform</h3>
              <p className="text-gray-300">Generate content optimized for Twitter, Instagram, LinkedIn and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}