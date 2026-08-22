/**
 * SSRF guard for the CORS-proxy boundary.
 *
 * When direct fetch fails, Crawlstr routes the request through a CORS proxy:
 *
 *     Crawlstr → proxy → arbitrary URL
 *
 * The proxy performs the server-side request. That makes the destination
 * validation a real trust boundary — without it, the crawler could be used to
 * make the proxy fetch localhost, RFC1918 space, link-local, or cloud
 * metadata endpoints (169.254.169.254).
 *
 * Every URL the crawler is about to fetch (direct or proxied) passes
 * isPubliclyFetchable() first. This is belt-and-braces under SIP-01 §11 —
 * the spec already requires server-side crawlers to apply SSRF protections;
 * we hold the same standard at the browser edge.
 */

/** True when the URL is safe to hand to fetch (direct or via proxy). */
export function isPubliclyFetchable(input: string): boolean {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

  const host = url.hostname.toLowerCase();
  if (!host) return false;

  // Obvious non-public hostnames.
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.intranet') ||
    host.endsWith('.lan') ||
    host.endsWith('.home') ||
    host === 'metadata.google.internal'
  ) {
    return false;
  }

  // IP literals — dotted-quad and the odd forms browsers accept.
  if (isPrivateIPv4(host)) return false;
  if (isPrivateIPv6(host)) return false;

  return true;
}

/* ------------------------------------------------------------------ */
/* IPv4                                                                */
/* ------------------------------------------------------------------ */

/**
 * Parse an IPv4 literal in any form a browser might accept:
 *   127.0.0.1        dotted quad
 *   127.1            short form (last part = 16-bit)
 *   2130706433       single 32-bit integer
 *   0x7f000001       hex
 *   017700000001     octal
 * Returns the 32-bit address as a number, or null if it isn't IPv4.
 */
function parseIPv4(host: string): number | null {
  // Single integer form (no dots).
  if (!host.includes('.')) {
    const n = parseIntAuto(host);
    if (n === null || n < 0 || n > 0xffffffff) return null;
    return n;
  }

  const parts = host.split('.');
  if (parts.length > 4) return null;

  const nums: number[] = [];
  for (const part of parts) {
    const n = parseIntAuto(part);
    if (n === null || n < 0) return null;
    nums.push(n);
  }

  // Dotted forms: all but the last must fit in a byte; the last widens
  // to fill the remainder (127.1 → 127.0.0.1).
  const lastMax = [0, 0xffffffff, 0xffffff, 0xffff, 0xff][parts.length];
  if (lastMax === undefined) return null;

  let addr = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    if (nums[i] > 0xff) return null;
    addr = (addr + nums[i]) * 0x100;
  }
  const last = nums[parts.length - 1];
  if (last > lastMax) return null;
  return addr + last;
}

function parseIntAuto(s: string): number | null {
  if (s === '') return null;
  if (/^0[xX][0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^0[0-7]+$/.test(s)) return parseInt(s, 8); // legacy octal (leading 0)
  if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
  return null;
}

function isPrivateIPv4(host: string): boolean {
  const ip = parseIPv4(host);
  if (ip === null) return false;

  const a = ip >>> 24;
  const b = (ip >>> 16) & 0xff;

  return (
    a === 0 ||                          // 0.0.0.0/8       "this network"
    a === 10 ||                         // 10.0.0.0/8      RFC1918
    a === 127 ||                        // 127.0.0.0/8     loopback
    (a === 169 && b === 254) ||         // 169.254.0.0/16  link-local (cloud metadata)
    (a === 172 && b >= 16 && b <= 31) ||// 172.16.0.0/12   RFC1918
    (a === 192 && b === 168) ||         // 192.168.0.0/16  RFC1918
    (a === 192 && b === 0) ||           // 192.0.0.0/24    IETF protocol assignments
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15 benchmark
    (a === 100 && b >= 64 && b <= 127)  // 100.64.0.0/10   CGNAT
  );
}

/* ------------------------------------------------------------------ */
/* IPv6                                                                */
/* ------------------------------------------------------------------ */

function isPrivateIPv6(host: string): boolean {
  // URL.hostname keeps the brackets off for IPv6? No — hostname includes them.
  const bare = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
  if (!bare.includes(':')) return false; // not IPv6

  const h = bare.toLowerCase();

  if (h === '::1' || h === '::') return true;              // loopback / unspecified
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // fc00::/7 unique local
  if (/^fe[89ab]/.test(h)) return true;                     // fe80::/10 link-local
  if (h.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 — run the v4 guard on the tail.
    const tail = h.slice(7);
    return isPrivateIPv4(tail);
  }
  return false;
}
