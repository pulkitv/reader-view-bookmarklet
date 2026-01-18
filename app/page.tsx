'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [testUrl, setTestUrl] = useState('https://www.example.com');

  useEffect(() => {
    // Load and prepare the bookmarklet code
    fetch('/bookmarklet.js')
      .then(res => res.text())
      .then(code => {
        // Don't minify - just encode as-is
        setBookmarkletCode(`javascript:${encodeURIComponent(code)}`);
      })
      .catch(err => {
        console.error('Failed to load bookmarklet:', err);
      });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please select and copy manually.');
    }
  };

  const handleTest = () => {
    if (!testUrl) return;
    window.open(testUrl, '_blank');
  };

  const handleDirectTest = () => {
    if (!bookmarkletCode) {
      alert('Bookmarklet code is still loading...');
      return;
    }
    
    try {
      // Remove 'javascript:' prefix and decode
      const code = decodeURIComponent(bookmarkletCode.replace(/^javascript:/, ''));
      
      console.log('Executing bookmarklet code, length:', code.length);
      console.log('First 100 chars:', code.substring(0, 100));
      console.log('Last 100 chars:', code.substring(code.length - 100));
      
      // Execute using eval since it's an IIFE
      eval(code);
    } catch (error) {
      console.error('Bookmarklet test error:', error);
      console.error('Code that failed:', decodeURIComponent(bookmarkletCode.replace(/^javascript:/, '')));
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Error testing bookmarklet: ' + errorMessage + '\n\nCheck the browser console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Reader View
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Client-side article extraction - works on any site you can access
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 sm:p-10 mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Install the Bookmarklet
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Add this bookmarklet to extract any article in reader view. Works on Medium, NYTimes, and any site you can access!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bookmarklet Code:
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={bookmarkletCode || 'Loading...'}
                    className="w-full p-3 pr-24 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 resize-none"
                    rows={4}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={handleCopy}
                    disabled={!bookmarkletCode}
                    className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Test the bookmarklet */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
                  🧪 Quick Test (No Bookmark Needed):
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  Test the extraction on this very page first:
                </p>
                <button
                  onClick={handleDirectTest}
                  disabled={!bookmarkletCode}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-400 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
                >
                  🔬 Test Extraction on This Page
                </button>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                  This will try to extract content from this page. If it works, your bookmarklet code is valid!
                </p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  📚 Test on a Real Article:
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  After saving as a bookmark, try it on a real article:
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open('https://en.wikipedia.org/wiki/JavaScript', '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded transition-colors"
                    >
                      📖 Wikipedia
                    </button>
                    <button
                      onClick={() => window.open('https://dev.to/', '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded transition-colors"
                    >
                      📝 Dev.to
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Click a button above → then click your bookmarklet on that page
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-3">
                  🚨 Bookmarklet Not Working?
                </h4>
                <ul className="text-sm text-red-800 dark:text-red-300 space-y-2">
                  <li><strong>Chrome Issue:</strong> If nothing happens, open DevTools (F12) → Console tab → Check for errors</li>
                  <li><strong>Check the URL:</strong> Make sure the bookmark URL starts with <code className="bg-red-100 dark:bg-red-900 px-1 rounded">javascript:</code></li>
                  <li><strong>Reload:</strong> After creating the bookmark, refresh this page and copy the code again</li>
                  <li><strong>Enable JavaScript:</strong> chrome://settings/content/javascript (must be enabled)</li>
                  <li><strong>Try test button:</strong> Use the yellow "Test Extraction" button above first</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                How to install:
              </h3>
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    💻 Desktop (Chrome, Safari, Edge, Firefox):
                  </h4>
                  <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Show your bookmarks bar: Press <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded">Cmd+Shift+B</kbd> (Mac) or <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded">Ctrl+Shift+B</kbd> (Windows)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Click "Copy" button above to copy the bookmarklet code</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Right-click your bookmarks bar → Add new bookmark/page</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Name it "📖 Reader View" and paste the code as the URL</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">
                    📱 Mobile (Safari iOS, Chrome Android):
                  </h4>
                  <ol className="space-y-2 text-sm text-green-800 dark:text-green-300">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Copy the bookmarklet code above</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Bookmark this page (or any page)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Edit the bookmark → Replace URL with the copied code</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Rename it to "Reader View"</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                How to use:
              </h3>
              <ol className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Navigate to any article you want to read (Medium, NYTimes, blogs, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Click the bookmarklet in your bookmarks bar</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>Article will open in a new tab with clean, distraction-free formatting</span>
                </li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Benefits:
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Works on ANY site you can access (no server-side blocking)</li>
                <li>• Bypasses paywalls you're already authenticated to</li>
                <li>• Works on Medium, NYTimes, and other protected sites</li>
                <li>• Extracts content directly from the page you're viewing</li>
                <li>• No CORS or anti-bot issues</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This app uses client-side extraction with{' '}
            <a href="https://github.com/mozilla/readability" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              Mozilla's Readability.js
            </a>
            {' '}to provide a clean reading experience
          </p>
        </div>
      </div>
    </div>
  );
}
