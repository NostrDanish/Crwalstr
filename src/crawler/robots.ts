// robots.txt parser and checker

const robotsCache = new Map<string, { rules: RobotsRules; fetchedAt: number }>();
const CACHE_TTL = 3600000; // 1 hour

interface RobotsRules {
  disallowed: string[];
  crawlDelay?: number;
}

export async function shouldCrawlUrl(url: string): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    let rules = await getRobotsRules(robotsUrl);
    if (!rules) return true; // No robots.txt = allowed

    const path = urlObj.pathname;
    for (const disallowed of rules.disallowed) {
      if (disallowed === '/') return false; // Entire site disallowed
      if (disallowed && path.startsWith(disallowed)) return false;
    }

    return true;
  } catch {
    return true; // Error = assume allowed
  }
}

export async function getCrawlDelay(url: string): Promise<number> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    const rules = await getRobotsRules(robotsUrl);
    return rules?.crawlDelay ?? 0;
  } catch {
    return 0;
  }
}

async function getRobotsRules(robotsUrl: string): Promise<RobotsRules | null> {
  // Check cache
  const cached = robotsCache.get(robotsUrl);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.rules;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(robotsUrl, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const text = await response.text();
    const rules = parseRobotsTxt(text);
    robotsCache.set(robotsUrl, { rules, fetchedAt: Date.now() });
    return rules;
  } catch {
    return null;
  }
}

function parseRobotsTxt(text: string): RobotsRules {
  const lines = text.split('\n');
  const disallowed: string[] = [];
  let crawlDelay: number | undefined;
  let relevantAgent = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const directive = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      const agent = value.toLowerCase();
      relevantAgent = agent === '*' || agent.includes('searchstr') || agent.includes('crawlstr');
    }

    if (relevantAgent) {
      if (directive === 'disallow' && value) {
        disallowed.push(value);
      }
      if (directive === 'crawl-delay') {
        const delay = parseInt(value);
        if (!isNaN(delay)) crawlDelay = delay * 1000; // Convert to ms
      }
    }
  }

  return { disallowed, crawlDelay };
}
