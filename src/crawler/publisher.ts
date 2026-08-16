/**
 * Index publisher — signs and publishes SIP-01 web index observations
 * (kind 39697) and crawler node heartbeats (kind 16919).
 * Canonical spec: https://github.com/NostrDanish/SIP-01
 * (public/spec/SIP-01.md, v1.2).
 *
 * Every observation is signed by THIS DEVICE's dedicated indexer identity
 * (indexerIdentity.ts) — never the user's personal Nostr key, and
 * the event never contains a search query. The user's identity and the
 * indexer identity are never linked on purpose.
 *
 * This is the same pattern as UNCAGED-ENGINE's src/lib/indexPublisher.ts.
 */
import { finalizeEvent } from 'nostr-tools/pure';
import type { NostrEvent } from '@nostrify/nostrify';

import { getIndexerIdentity, getIndexerSecretKey } from './indexerIdentity';
import { buildIndexEvent, normalizeIndexUrl, type IndexObservationInput } from './webIndex';
import { getIndexPublishRelays } from './relays';

/** Callback type for publishing a signed event to a relay. */
export type RelayPublishFn = (relayUrl: string, event: NostrEvent) => Promise<void>;

/** Injected relay publisher — wired up by the React hook. */
let relayPublishFn: RelayPublishFn | null = null;

export function setRelayPublisher(fn: RelayPublishFn) {
  relayPublishFn = fn;
}

/** Publish a signed event to all index relays (best-effort). */
async function publishToIndexRelays(signedEvent: NostrEvent): Promise<void> {
  const relays = getIndexPublishRelays();

  if (relayPublishFn) {
    await Promise.allSettled(
      relays.map((url) => relayPublishFn!(url, signedEvent)),
    );
  } else {
    // No relay publisher configured — log for debugging
    console.debug('[Crawler] No relay publisher configured. Would publish to:', relays);
  }
}

/**
 * Build, sign, and publish one web index observation.
 *
 * Returns the normalized URL on success, or null when the input is not
 * indexable (non-http(s) URL, empty title). Relay failures are swallowed —
 * indexing is best-effort and must never break the crawl loop.
 */
export async function publishIndexObservation(
  input: IndexObservationInput,
): Promise<string | null> {
  const normalized = normalizeIndexUrl(input.url);
  if (!normalized) return null;

  const template = await buildIndexEvent({ ...input, url: normalized });
  if (!template) return null;

  const signedEvent = finalizeEvent(
    {
      kind: template.kind,
      created_at: Math.floor(Date.now() / 1000),
      tags: template.tags,
      content: template.content,
      pubkey: getIndexerIdentity().pubkeyHex,
    },
    getIndexerSecretKey(),
  );

  await publishToIndexRelays(signedEvent);
  return normalized;
}

/**
 * Publish a node heartbeat (kind 16919, replaceable) to the index relays.
 * Best-effort, same as observations — the heartbeat is health metadata, and
 * a missed beat just reads as "offline" on dashboards until the next one.
 */
export async function publishHeartbeatEvent(event: NostrEvent): Promise<void> {
  await publishToIndexRelays(event);
}

/**
 * Get the current indexer identity info for display purposes.
 */
export function getIndexerInfo(): { pubkeyHex: string; npub: string } {
  const identity = getIndexerIdentity();
  return {
    pubkeyHex: identity.pubkeyHex,
    npub: identity.npub,
  };
}
