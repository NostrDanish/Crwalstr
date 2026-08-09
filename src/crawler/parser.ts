// HTML parser — extracts content from crawled pages

import type { ParsedPage } from './types';

export function parsePage(html: string, baseUrl: string): ParsedPage {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract title
  const title = doc.querySelector('title')?.textContent?.trim() ??
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ??
    '';

  // Extract description
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ??
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ??
    '';

  // Remove non-content elements
  const removeSelectors = 'script, style, noscript, iframe, nav, footer, header, aside, [role="navigation"], [role="banner"], [role="contentinfo"], .nav, .navbar, .sidebar, .footer, .header, .menu, .ad, .ads, .advertisement, .social-share, .comments';
  doc.querySelectorAll(removeSelectors).forEach(el => el.remove());

  // Extract main content
  const mainContent =
    doc.querySelector('main') ??
    doc.querySelector('article') ??
    doc.querySelector('[role="main"]') ??
    doc.querySelector('.content') ??
    doc.querySelector('#content') ??
    doc.body;

  const text = mainContent?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Detect language
  const language = doc.documentElement.lang?.split('-')[0] ?? 'en';

  // Extract links
  const linkElements = doc.querySelectorAll('a[href]');
  const links: string[] = [];

  linkElements.forEach(el => {
    const href = el.getAttribute('href');
    if (!href) return;

    try {
      const absoluteUrl = new URL(href, baseUrl).href;
      // Only include http(s) links, no fragments, no mailto/tel
      if (absoluteUrl.startsWith('http') && !absoluteUrl.includes('#')) {
        links.push(absoluteUrl);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return {
    title,
    description,
    text: text.slice(0, 10000), // Cap text at 10k chars for storage
    language,
    links: [...new Set(links)], // Deduplicate
    wordCount,
  };
}
