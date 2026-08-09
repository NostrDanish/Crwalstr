// Nostr event publisher for crawl results
// This will be called by the engine with a signer function injected

import type { CrawlResult } from './types';

export type PublishFn = (event: {
  kind: number;
  content: string;
  tags: string[][];
}) => Promise<void>;

// Custom kind for Searchstr crawl results
export const CRAWL_RESULT_KIND = 20002;
// Custom kind for crawl requests (URL discovery)
export const CRAWL_REQUEST_KIND = 20001;

let publishFn: PublishFn | null = null;

export function setPublisher(fn: PublishFn) {
  publishFn = fn;
}

export async function publishCrawlResult(result: CrawlResult): Promise<boolean> {
  if (!publishFn) {
    console.debug('[Crawler] No publisher configured, skipping Nostr publish');
    return false;
  }

  try {
    const domain = new URL(result.url).hostname;

    await publishFn({
      kind: CRAWL_RESULT_KIND,
      content: JSON.stringify({
        title: result.title,
        description: result.description,
        word_count: result.wordCount,
        protocol: 'searchstr/v1',
      }),
      tags: [
        ['url', result.url],
        ['d', result.url], // Use URL as d-tag for deduplication
        ['domain', domain],
        ['hash', result.contentHash],
        ['status', String(result.status)],
        ['content-type', result.contentType],
        ['language', result.language],
        ['protocol', 'searchstr/v1'],
        ['alt', `Crawl result for ${result.url}`],
      ],
    });

    return true;
  } catch (error) {
    console.error('[Crawler] Failed to publish to Nostr:', error);
    return false;
  }
}

export async function publishCrawlRequest(url: string, priority: number, depth: number): Promise<boolean> {
  if (!publishFn) return false;

  try {
    const domain = new URL(url).hostname;

    await publishFn({
      kind: CRAWL_REQUEST_KIND,
      content: '',
      tags: [
        ['url', url],
        ['domain', domain],
        ['priority', String(priority)],
        ['depth', String(depth)],
        ['protocol', 'searchstr/v1'],
        ['alt', `Crawl request for ${url}`],
      ],
    });

    return true;
  } catch (error) {
    console.error('[Crawler] Failed to publish crawl request:', error);
    return false;
  }
}
