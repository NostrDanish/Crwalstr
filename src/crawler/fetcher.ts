// HTTP fetcher.
//
// A browser cannot read cross-origin responses unless the target site sends
// CORS headers, and almost no site does. Direct fetches therefore fail with
// "TypeError: Failed to fetch" for the vast majority of the web, which made
// the crawler index nothing at all.
//
// Strategy: try direct first (fast, no third party sees the request), then
// fall back to a CORS proxy so the crawler actually works on real websites.
// The proxy is honest about the trade-off — see PROXY_NOTE below.

import { isPubliclyFetchable } from './safety';
import { recordFetch } from './meter';

/** CORS proxy used when a direct cross-origin fetch is blocked. */
export const CORS_PROXY_TEMPLATE = 'https://proxy.shakespeare.diy/?url={href}';

/**
 * Honest disclosure for the UI: when the proxy is used, the proxy operator
 * sees which URL was fetched (not who searched for it, and no user identity).
 */
export const PROXY_NOTE =
  'When a site blocks direct browser access (CORS), the request is routed through a CORS proxy. The proxy operator can see which URLs are fetched.';

export interface FetchResult {
  html: string;
  status: number;
  contentType: string;
  size: number;
  /** True when the page had to be retrieved through the CORS proxy. */
  viaProxy: boolean;
}

export interface FetchOptions {
  maxSizeKB?: number;
  /** Allow falling back to the CORS proxy. Default true. */
  allowProxy?: boolean;
  timeoutMs?: number;
}

function proxyUrl(url: string): string {
  return CORS_PROXY_TEMPLATE.replace('{href}', encodeURIComponent(url));
}

interface RawFetch {
  html: string;
  status: number;
  contentType: string;
}

/** Single fetch attempt. Throws on network/CORS failure; returns null if unusable. */
async function attempt(
  requestUrl: string,
  maxSizeKB: number,
  timeoutMs: number,
  /** True on the direct path — response.url is then the real final URL. */
  checkRedirectTarget: boolean,
): Promise<RawFetch | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(requestUrl, {
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) return null;

    // Redirect re-check: a public URL can 302 into private space. On the
    // direct path, response.url is where we actually landed — guard it.
    // (On the proxied path the proxy follows redirects server-side; the
    // proxy operator owns that check, and we say so in the UI.)
    if (checkRedirectTarget && response.url && response.url !== requestUrl) {
      if (!isPubliclyFetchable(response.url)) {
        console.debug('[Crawler] Refused: redirect into non-public address', response.url);
        return null;
      }
    }

    const contentType = response.headers.get('content-type') ?? '';

    // Proxies sometimes omit/rewrite content-type. Accept empty and sniff later.
    const looksHtml =
      contentType === '' ||
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml') ||
      contentType.includes('text/plain');
    if (!looksHtml) return null;

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxSizeKB * 1024) return null;

    const html = await response.text();
    if (html.length > maxSizeKB * 1024) return null;

    // Meter EVERY fetched byte, including proxy overhead and content we
    // later discard — the budget is about what we consumed, not what we kept.
    recordFetch(html.length);

    // Sniff: make sure this is actually markup before handing it to the parser.
    if (!/<\s*(!doctype|html|head|body|title|meta|div|a|p)\b/i.test(html.slice(0, 4000))) {
      return null;
    }

    return { html, status: response.status, contentType: contentType || 'text/html' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch an XML-ish document (RSS/Atom feed, sitemap) — same direct-then-proxy
 * strategy as fetchPage, but accepts XML content types instead of HTML.
 * Returns raw text, or null.
 */
export async function fetchXml(url: string, maxSizeKB = 1024): Promise<string | null> {
  // SSRF guard — never hand a non-public target to fetch, direct or proxied.
  if (!isPubliclyFetchable(url)) {
    console.debug('[Crawler] Refused non-public URL:', url);
    return null;
  }

  const tryOnce = async (requestUrl: string, direct: boolean): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(requestUrl, {
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        signal: controller.signal,
        headers: { Accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,text/html,*/*;q=0.8' },
      });
      if (!response.ok) return null;

      // Redirect re-check on the direct path (see fetchPage for rationale).
      if (direct && response.url && response.url !== requestUrl && !isPubliclyFetchable(response.url)) {
        console.debug('[Crawler] Refused: redirect into non-public address', response.url);
        return null;
      }

      const text = await response.text();
      if (text.length > maxSizeKB * 1024) return null;

      // Meter every byte, kept or not.
      recordFetch(text.length);
      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    return await tryOnce(url, true);
  } catch {
    // CORS — fall through to the proxy.
  }

  try {
    return await tryOnce(proxyUrl(url), false);
  } catch {
    return null;
  }
}

export async function fetchPage(
  url: string,
  optionsOrMaxSizeKB: FetchOptions | number = {},
): Promise<FetchResult | null> {
  const options: FetchOptions =
    typeof optionsOrMaxSizeKB === 'number'
      ? { maxSizeKB: optionsOrMaxSizeKB }
      : optionsOrMaxSizeKB;

  const maxSizeKB = options.maxSizeKB ?? 2048;
  const allowProxy = options.allowProxy ?? true;
  const timeoutMs = options.timeoutMs ?? 15000;

  // SSRF guard — never hand a non-public target to fetch, direct or proxied.
  // This is the primary check; the in-flight redirect check is secondary.
  if (!isPubliclyFetchable(url)) {
    console.debug('[Crawler] Refused non-public URL:', url);
    return null;
  }

  // --- 1. Direct fetch (works only for CORS-enabled sites) ---
  try {
    const direct = await attempt(url, maxSizeKB, timeoutMs, true);
    if (direct) {
      return { ...direct, size: direct.html.length, viaProxy: false };
    }
    // Reachable but unusable (non-HTML, too large, error status) — don't retry.
    return null;
  } catch (error) {
    // Network-level failure. For cross-origin requests this is almost always
    // CORS, which the proxy can solve. Timeouts are not worth retrying.
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.debug('[Crawler] Timeout:', url);
      return null;
    }
    if (!allowProxy) {
      console.debug('[Crawler] Blocked (CORS) and proxy disabled:', url);
      return null;
    }
  }

  // --- 2. Proxy fallback ---
  try {
    const proxied = await attempt(proxyUrl(url), maxSizeKB, timeoutMs, false);
    if (!proxied) return null;
    return { ...proxied, size: proxied.html.length, viaProxy: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.debug('[Crawler] Proxy timeout:', url);
    } else {
      console.debug('[Crawler] Proxy failed:', url);
    }
    return null;
  }
}
