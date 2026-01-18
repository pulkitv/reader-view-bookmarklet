import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the article with comprehensive headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. The website took too long to respond. Try a different article or website.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: `Cannot connect to this website. It may be blocking automated requests or using anti-bot protection. Try a different article.` },
        { status: 502 }
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMsg = response.status === 403 
        ? 'Access forbidden. The website may be blocking automated requests. Try a different article or website.'
        : response.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : `Failed to fetch article: ${response.statusText}`;
      
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return NextResponse.json(
        { error: 'Could not extract article content. The page may not be an article or is not accessible.' },
        { status: 422 }
      );
    }

    // Calculate text length (approximate word count)
    const textLength = article.textContent?.trim().split(/\s+/).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        title: article.title,
        byline: article.byline || null,
        content: article.content,
        textContent: article.textContent,
        length: textLength,
        excerpt: article.excerpt || null,
        siteName: article.siteName || null,
      },
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'An error occurred while extracting the article' },
      { status: 500 }
    );
  }
}
