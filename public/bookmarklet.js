(function() {
  'use strict';
  
  // Configuration
  var READER_APP_URL = 'http://localhost:3000/reader';
  
  // Show loading indicator
  var loadingDiv = document.createElement('div');
  loadingDiv.id = 'reader-view-loading';
  loadingDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:#2563eb;color:white;padding:16px 24px;border-radius:8px;z-index:999999;font-family:system-ui;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
  loadingDiv.textContent = '📖 Extracting article...';
  document.body.appendChild(loadingDiv);
  
  // Load Readability if not already loaded
  if (typeof window.Readability === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.min.js';
    script.onload = extractAndSend;
    script.onerror = function() {
      if (loadingDiv.parentNode) {
        document.body.removeChild(loadingDiv);
      }
      alert('Failed to load Readability library. Please check your internet connection.');
    };
    document.head.appendChild(script);
  } else {
    extractAndSend();
  }

  function extractAndSend() {
    try {
      // Clone the document for Readability
      var documentClone = document.cloneNode(true);
      var reader = new window.Readability(documentClone, {
        charThreshold: 500
      });
      var article = reader.parse();

      // Remove loading indicator
      if (document.getElementById('reader-view-loading')) {
        document.body.removeChild(loadingDiv);
      }

      if (!article) {
        alert('❌ Could not extract article content from this page.\n\nThis might not be an article, or the page structure is too complex.');
        return;
      }

      // Strip inline styles from content to prevent conflicts
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content;
      
      // Remove all inline styles
      var allElements = tempDiv.querySelectorAll('*');
      for (var i = 0; i < allElements.length; i++) {
        allElements[i].removeAttribute('style');
        allElements[i].removeAttribute('class');
        // Remove color and background attributes
        allElements[i].removeAttribute('color');
        allElements[i].removeAttribute('bgcolor');
      }
      
      var cleanedContent = tempDiv.innerHTML;

      // Calculate word count if not provided
      var wordCount = article.length || article.textContent.trim().split(/\s+/).length;

      // Encode the article data
      var articleData = {
        title: article.title || document.title,
        byline: article.byline || null,
        content: cleanedContent,
        textContent: article.textContent,
        length: wordCount,
        excerpt: article.excerpt || article.textContent.substring(0, 200),
        siteName: article.siteName || document.location.hostname,
      };

      // Open reader view in new tab
      var readerUrl = READER_APP_URL;
      var newWindow = window.open(readerUrl, '_blank');
      
      if (!newWindow) {
        alert('⚠️ Popup blocked!\n\nPlease allow popups for this site and try again.');
        return;
      }
      
      // Wait for the window to load, then send data via postMessage
      var sendAttempts = 0;
      var maxAttempts = 50; // 10 seconds
      
      var sendInterval = setInterval(function() {
        sendAttempts++;
        
        try {
          // Send the data to the new window
          newWindow.postMessage({
            type: 'READER_VIEW_ARTICLE',
            data: articleData
          }, READER_APP_URL);
          
          // Stop after first successful send
          if (sendAttempts > 3) { // Send a few times to ensure delivery
            clearInterval(sendInterval);
          }
        } catch (e) {
          console.error('Failed to send message:', e);
        }
        
        if (sendAttempts >= maxAttempts) {
          clearInterval(sendInterval);
        }
      }, 200);
    } catch (error) {
      // Remove loading indicator if still present
      if (document.getElementById('reader-view-loading')) {
        document.body.removeChild(loadingDiv);
      }
      alert('❌ Error extracting article:\n\n' + error.message);
      console.error('Reader View extraction error:', error);
    }
  }
})();
