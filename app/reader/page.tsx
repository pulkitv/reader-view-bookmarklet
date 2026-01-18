'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReaderView from '@/components/ReaderView';

interface Article {
  title: string;
  byline: string | null;
  content: string;
  textContent: string;
  length: number;
  excerpt: string | null;
  siteName: string | null;
}

function ReaderContent() {
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    
    // Try getting data from URL (old method for small articles)
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setArticle(parsed);
        return;
      } catch (err) {
        console.error('Failed to parse URL data:', err);
      }
    }
    
    // Listen for postMessage from the bookmarklet
    const handleMessage = (event: MessageEvent) => {
      // Security: check message type
      if (event.data && event.data.type === 'READER_VIEW_ARTICLE') {
        try {
          setArticle(event.data.data);
        } catch (err) {
          console.error('Failed to process article data:', err);
          setError('Failed to load article data');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Set timeout if no data received within 10 seconds
    const timeout = setTimeout(() => {
      if (!article) {
        setError('No article data received. Please try using the bookmarklet again.');
      }
    }, 10000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [searchParams, article]);

  const handleBack = () => {
    window.close();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Error</h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading article...</p>
        </div>
      </div>
    );
  }

  return <ReaderView article={article} onBack={handleBack} />;
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading article...</p>
        </div>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
