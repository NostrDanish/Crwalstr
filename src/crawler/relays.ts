/**
 * Relay configuration — matches the Searchstr/UNCAGED ecosystem.
 *
 * Index observations (SIP-01, kind 39697) are published to:
 * 1. The NIP-50 search relay pool (so search engines see them immediately)
 * 2. Well-known public write relays (so they replicate widely)
 */

/**
 * Relays that support NIP-50 search queries.
 * Same defaults as UNCAGED-ENGINE / 0xSearchstr.
 */
export const SEARCH_RELAYS = [
  'wss://relay.nostr.band/',
  'wss://relay.ditto.pub/',
  'wss://search.nos.today/',
  'wss://relay.noswhere.com/',
];

/**
 * Extra relays that index observations are published to, beyond the
 * search pool. These are well-known public relays that reliably accept
 * writes, so observations propagate widely.
 */
export const INDEX_WRITE_RELAYS = [
  'wss://relay.ditto.pub/',
  'wss://relay.primal.net/',
  'wss://relay.damus.io/',
];

/**
 * Relays that index observations are published to: the search pool first
 * (so the Web Index provider sees fresh observations immediately), then
 * the write relays (so they replicate across the network). Deduped.
 */
export function getIndexPublishRelays(): string[] {
  const seen = new Set<string>();
  const pool: string[] = [];
  for (const url of [...SEARCH_RELAYS, ...INDEX_WRITE_RELAYS]) {
    if (!seen.has(url)) {
      seen.add(url);
      pool.push(url);
    }
  }
  return pool;
}
