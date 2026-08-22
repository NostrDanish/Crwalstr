// IndexedDB-backed crawl queue

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { CrawlJob } from './types';

interface CrawlerDB extends DBSchema {
  queue: {
    key: string;
    value: CrawlJob;
    indexes: { 'by-priority': number };
  };
  crawled: {
    key: string;
    value: {
      url: string;
      contentHash: string;
      title: string;
      crawledAt: number;
      /**
       * 'fetched' — we downloaded and parsed the page.
       * 'observed' — we only saw it referenced (RSS/Atom feed, sitemap) and
       * published an observation, but never fetched the page itself.
       *
       * The audit's point: observed ≠ fetched. A feed can announce a page
       * that 404s when actually fetched, so feed-derived entries must not
       * block a future real fetch.
       */
      status: 'fetched' | 'observed';
    };
    indexes: { 'by-hash': string };
  };
}

let db: IDBPDatabase<CrawlerDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<CrawlerDB>> {
  if (db) return db;

  db = await openDB<CrawlerDB>('searchstr-crawler', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        const queueStore = database.createObjectStore('queue', { keyPath: 'url' });
        queueStore.createIndex('by-priority', 'priority');

        const crawledStore = database.createObjectStore('crawled', { keyPath: 'url' });
        crawledStore.createIndex('by-hash', 'contentHash');
      }
      // v2: crawled records gain a status field. Existing records predate the
      // field — treat them as 'fetched' (they were, by definition, at the time).
      if (oldVersion < 2) {
        // No schema change needed — 'status' is a plain property, and the
        // 'by-hash' index is unchanged. Backfill happens lazily in code.
      }
    },
  });

  return db;
}

export async function addToQueue(job: CrawlJob): Promise<void> {
  const database = await initDB();
  await database.put('queue', job);
}

export async function getNextJob(): Promise<CrawlJob | null> {
  const database = await initDB();
  const tx = database.transaction('queue', 'readonly');
  const index = tx.store.index('by-priority');

  // Walk highest→lowest priority and return the first job that is READY.
  // The previous version looked at only the single top job and returned null
  // when it was delayed — starving ready jobs below it in the queue.
  const now = Date.now();
  let cursor = await index.openCursor(null, 'prev');
  while (cursor) {
    const job = cursor.value;
    if (!job.nextAttempt || job.nextAttempt <= now) {
      return job;
    }
    cursor = await cursor.continue();
  }

  return null;
}

export async function removeFromQueue(url: string): Promise<void> {
  const database = await initDB();
  await database.delete('queue', url);
}

export async function getQueueSize(): Promise<number> {
  const database = await initDB();
  return database.count('queue');
}

export async function getCrawled(url: string) {
  const database = await initDB();
  const record = await database.get('crawled', url);
  // Backfill the v2 status field for records written before it existed.
  if (record && !record.status) {
    return { ...record, status: 'fetched' as const };
  }
  return record;
}

/**
 * True only when we ACTUALLY fetched and parsed the page. Feed/sitemap
 * observations don't count — the audit's observed-vs-fetched fix: a feed
 * announcing a page must not permanently block a future real fetch of it.
 */
export async function isFetched(url: string): Promise<boolean> {
  const record = await getCrawled(url);
  return record?.status === 'fetched';
}

export async function markCrawled(
  url: string,
  contentHash: string,
  title: string,
  status: 'fetched' | 'observed' = 'fetched',
): Promise<void> {
  const database = await initDB();
  await database.put('crawled', {
    url,
    contentHash,
    title,
    crawledAt: Date.now(),
    status,
  });
}

export async function findByHash(hash: string): Promise<string | null> {
  const database = await initDB();
  const tx = database.transaction('crawled', 'readonly');
  const index = tx.store.index('by-hash');
  const result = await index.get(hash);
  return result?.url ?? null;
}

export async function getCrawledCount(): Promise<number> {
  const database = await initDB();
  return database.count('crawled');
}

export async function getRecentCrawled(limit = 20) {
  const database = await initDB();
  const tx = database.transaction('crawled', 'readonly');
  const all = await tx.store.getAll();
  return all
    .sort((a, b) => b.crawledAt - a.crawledAt)
    .slice(0, limit);
}

export async function clearQueue(): Promise<void> {
  const database = await initDB();
  await database.clear('queue');
}
