/**
 * Search Index Protocol (SIP-01) — reference implementation.
 * Spec: docs/SEARCH_INDEX_PROTOCOL.md (from 0xSearchstr/UNCAGED-ENGINE)
 *
 * One addressable event (kind 39697) per indexed web document:
 *   d = "widx:" + sha256(normalized_url)[0:32]   ← URL identity
 *   u = canonical URL
 *   x = sha256(title + "\n" + description)       ← content identity
 *   v = "1"                                      ← schema version
 *   content = { title, description?, image? }
 *
 * The event NEVER contains a search query, a user identity, or anything
 * about who surfaced the page. Indexer identity = the event pubkey.
 *
 * This implementation is byte-compatible with 0xSearchstr, 0xPresearchstr,
 * and UNCAGED-ENGINE — same kinds, same tags, same normalization.
 */

/** Web Index Observation kind (addressable). Draft allocation — see spec. */
export const WEB_INDEX_KIND = 39697;

/** Current schema version. */
export const WEB_INDEX_SCHEMA_VERSION = '1';

/** d-tag namespace prefix. */
export const WEB_INDEX_D_PREFIX = 'widx:';

/* Limits (hard caps, spec §6/§7) */
const MAX_TITLE_LEN = 300;
const MAX_DESCRIPTION_LEN = 1000;
const MAX_IMAGE_LEN = 2048;
const MAX_URL_LEN = 2048;
const MAX_TAGS = 8;
const MAX_TAG_LEN = 40;

/** Tracking parameters stripped during normalization (spec §8.5). */
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'dclid', 'mc_cid', 'mc_eid', 'igshid', 'ref_src',
  'spm', 'si',
]);

/**
 * Normalize a URL for document identity (spec §8).
 * Implementations MUST produce byte-identical output for the same page.
 * Returns null for invalid or disallowed (non-http/https) URLs.
 */
export function normalizeIndexUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  // Lowercase host handled by URL; strip leading www.
  url.hostname = url.hostname.replace(/^www\./, '');

  // Default ports.
  if ((url.protocol === 'http:' && url.port === '80') ||
      (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }

  // Fragment never identifies content for indexing purposes.
  url.hash = '';

  // Strip tracking params, keep everything else, sort deterministically.
  if (url.search) {
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    url.search = '';
    for (const [key, value] of params) url.searchParams.append(key, value);
  }

  // Trailing slash on non-root paths.
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

/** SHA-256 hex (lowercase) of a UTF-8 string. */
async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Document identity for a URL: "widx:" + first 32 hex chars of sha256(normalized). */
export async function documentId(normalizedUrl: string): Promise<string> {
  const hex = await sha256Hex(normalizedUrl);
  return `${WEB_INDEX_D_PREFIX}${hex.slice(0, 32)}`;
}

/** Content hash per spec §9: sha256(title + "\n" + description). */
export async function contentHash(title: string, description: string): Promise<string> {
  return sha256Hex(`${title}\n${description}`);
}

/** Input for building an observation event. */
export interface IndexObservationInput {
  url: string;
  title: string;
  description?: string;
  image?: string;
  tags?: string[];
  language?: string;
  published?: number;
  source?: string; // indexer software id, e.g. "crawlstr/1"
}

export interface UnsignedIndexEvent {
  kind: number;
  content: string;
  tags: string[][];
}

/**
 * Build an unsigned web-index observation event.
 * Returns null when the input is unusable (bad URL, empty title).
 */
export async function buildIndexEvent(
  input: IndexObservationInput,
): Promise<UnsignedIndexEvent | null> {
  const normalized = normalizeIndexUrl(input.url);
  if (!normalized) return null;

  const title = input.title.trim().slice(0, MAX_TITLE_LEN);
  if (!title) return null;

  const description = (input.description ?? '').trim().slice(0, MAX_DESCRIPTION_LEN);

  let image = (input.image ?? '').trim().slice(0, MAX_IMAGE_LEN);
  if (image && !/^https:\/\//i.test(image)) image = ''; // images: https only

  const d = await documentId(normalized);
  const x = await contentHash(title, description);

  const topics = (input.tags ?? [])
    .map((t) => t.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter((t) => t.length > 0 && t.length <= MAX_TAG_LEN)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, MAX_TAGS);

  const language = (input.language ?? '').trim().toLowerCase();

  const content: Record<string, string> = { title };
  if (description) content.description = description;
  if (image) content.image = image;

  const tags: string[][] = [
    ['d', d],
    ['u', normalized],
    ...topics.map((t): string[] => ['t', t]),
    ...(language ? [['l', language] as string[]] : []),
    ['x', x],
    ['v', WEB_INDEX_SCHEMA_VERSION],
    ...(input.published ? [['published', String(Math.floor(input.published))] as string[]] : []),
    ...(input.source ? [['source', input.source.trim().slice(0, 40)] as string[]] : []),
    ['alt', `Web index observation: ${title}`],
  ];

  return { kind: WEB_INDEX_KIND, content: JSON.stringify(content), tags };
}
