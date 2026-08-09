// HTTP fetcher with CORS handling

export interface FetchResult {
  html: string;
  status: number;
  contentType: string;
  size: number;
}

export async function fetchPage(url: string, maxSizeKB = 2048): Promise<FetchResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null; // Only crawl HTML pages
    }

    // Check content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSizeKB * 1024) {
      return null; // Page too large
    }

    const html = await response.text();

    // Double-check size after download
    if (html.length > maxSizeKB * 1024) {
      return null;
    }

    return {
      html,
      status: response.status,
      contentType,
      size: html.length,
    };
  } catch (error) {
    // CORS error, timeout, or network error
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.debug('[Crawler] Fetch timeout:', url);
    } else {
      console.debug('[Crawler] Fetch error:', url, error);
    }
    return null;
  }
}
