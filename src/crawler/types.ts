// Crawler type definitions

export interface CrawlJob {
  url: string;
  priority: number;
  depth: number;
  discoveredFrom?: string;
  attempts: number;
  lastAttempt?: number;
  nextAttempt?: number;
}

export interface ParsedPage {
  title: string;
  description: string;
  /** Representative image (og:image / twitter:image). */
  image?: string;
  /** Claimed publication time, unix seconds (SIP-01 `published` tag). */
  published?: number;
  text: string;
  language: string;
  links: string[];
  wordCount: number;
}

export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  contentHash: string;
  language: string;
  links: string[];
  wordCount: number;
  crawledAt: number;
  status: number;
  contentType: string;
}

export interface CrawlerStats {
  pagesIndexed: number;
  queueSize: number;
  bandwidthUsed: number;
  uptime: number;
  errors: number;
  skipped: number;
  /** Pages that required the CORS proxy (most of the web). */
  viaProxy: number;
  /** Pages fetched directly because the site sends CORS headers. */
  viaDirect: number;
  /** Skipped because the site's robots.txt disallows crawling. */
  robotsBlocked: number;
  /** Could not be retrieved at all (network, proxy, timeout, non-HTML). */
  fetchFailed: number;
  /** Skipped because identical content was already indexed. */
  duplicates: number;
  /** Skipped for having almost no extractable text (JS-rendered SPAs). */
  thinContent: number;
}

export interface CrawlerSettings {
  wifiOnly: boolean;
  chargingOnly: boolean;
  respectRobots: boolean;
  maxBandwidthMB: number;
  maxPagesPerHour: number;
  maxDepth: number;
  maxConcurrent: number;
  maxPageSizeKB: number;
  ecoMode: boolean;
}

export const DEFAULT_SETTINGS: CrawlerSettings = {
  wifiOnly: false,
  chargingOnly: false,
  respectRobots: true,
  maxBandwidthMB: 25,
  maxPagesPerHour: 100,
  maxDepth: 3,
  maxConcurrent: 1,
  maxPageSizeKB: 2048,
  ecoMode: true,
};
