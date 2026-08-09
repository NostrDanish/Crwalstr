// Rate limiting per domain

const domainLastRequest = new Map<string, number>();
const DEFAULT_RATE_LIMIT = 5000; // 5 seconds between requests per domain

export async function canMakeRequest(url: string, customDelay?: number): Promise<boolean> {
  const domain = new URL(url).hostname;
  const lastRequest = domainLastRequest.get(domain) ?? 0;
  const now = Date.now();
  const rateLimit = customDelay ?? DEFAULT_RATE_LIMIT;

  if (now - lastRequest < rateLimit) {
    return false; // Too soon
  }

  domainLastRequest.set(domain, now);
  return true;
}

export function getTimeUntilNextRequest(url: string, customDelay?: number): number {
  const domain = new URL(url).hostname;
  const lastRequest = domainLastRequest.get(domain) ?? 0;
  const rateLimit = customDelay ?? DEFAULT_RATE_LIMIT;
  const elapsed = Date.now() - lastRequest;
  return Math.max(0, rateLimit - elapsed);
}

export function resetLimits(): void {
  domainLastRequest.clear();
}
