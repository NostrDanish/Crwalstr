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
