interface ReaderViewProps {
  article: {
    title: string;
    byline: string | null;
    content: string;
    textContent: string;
    length: number;
    excerpt: string | null;
    siteName: string | null;
  };
  onBack: () => void;
}

export default function ReaderView({ article, onBack }: ReaderViewProps) {
  const estimatedReadingTime = Math.ceil(article.length / 200); // Assuming 200 words per minute

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Header with back button */}
      <div className="sticky top-0 backdrop-blur-sm border-b z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors"
            style={{ color: '#475569' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
        {/* Metadata */}
        <div className="mb-8">
          {article.siteName && (
            <p className="text-sm font-medium mb-2" style={{ color: '#2563eb' }}>
              {article.siteName}
            </p>
          )}
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight" style={{ color: '#0f172a' }}>
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#64748b' }}>
            {article.byline && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {article.byline}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {estimatedReadingTime} min read
            </span>

            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {article.length.toLocaleString()} words
            </span>
          </div>
        </div>

        {/* Article content with reader-friendly styling */}
        <div 
          className="reader-content"
          style={{ color: '#1a1a1a', backgroundColor: '#ffffff' }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
