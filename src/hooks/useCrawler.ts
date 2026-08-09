// React hook for the crawler engine

import { useEffect, useRef, useState, useCallback } from 'react';
import { CrawlerEngine } from '@/crawler/engine';
import { setPublisher } from '@/crawler/publisher';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { CrawlerStats, CrawlerSettings } from '@/crawler/types';

export function useCrawler() {
  const engineRef = useRef<CrawlerEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [stats, setStats] = useState<CrawlerStats>({
    pagesIndexed: 0,
    queueSize: 0,
    bandwidthUsed: 0,
    uptime: 0,
    errors: 0,
    skipped: 0,
  });
  const [recentCrawls, setRecentCrawls] = useState<Array<{
    url: string;
    title: string;
    crawledAt: number;
  }>>([]);

  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  // Initialize engine
  useEffect(() => {
    const engine = new CrawlerEngine();
    engine.init().then(() => {
      engineRef.current = engine;
      setInitialized(true);
      setStats(engine.getStats());
    });

    engine.onStats((newStats) => {
      setStats(newStats);
    });

    return () => {
      engine.stop();
    };
  }, []);

  // Wire up Nostr publishing when user is logged in
  useEffect(() => {
    if (user) {
      setPublisher(async (event) => {
        await publishEvent(event);
      });
    } else {
      setPublisher(async () => {
        // No-op when not logged in — crawl locally only
      });
    }
  }, [user, publishEvent]);

  // Poll recent crawls
  useEffect(() => {
    if (!initialized) return;

    const loadRecent = async () => {
      if (engineRef.current) {
        const recent = await engineRef.current.getRecentCrawls(20);
        setRecentCrawls(recent);
      }
    };

    loadRecent();
    const interval = setInterval(loadRecent, 10000);
    return () => clearInterval(interval);
  }, [initialized, isRunning]);

  const start = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.stop();
    setIsRunning(false);
  }, []);

  const seedUrl = useCallback(async (url: string) => {
    if (!engineRef.current) return;
    await engineRef.current.seedUrl(url);
  }, []);

  const clearAll = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.clearAll();
  }, []);

  const updateSettings = useCallback((settings: Partial<CrawlerSettings>) => {
    if (!engineRef.current) return;
    engineRef.current.updateSettings(settings);
  }, []);

  const getSettings = useCallback((): CrawlerSettings => {
    return engineRef.current?.getSettings() ?? {
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
  }, []);

  return {
    isRunning,
    initialized,
    stats,
    recentCrawls,
    start,
    stop,
    seedUrl,
    clearAll,
    updateSettings,
    getSettings,
    isLoggedIn: !!user,
  };
}
