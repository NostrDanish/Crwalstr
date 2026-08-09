# Crawlstr — Event Kinds & Protocol Reference

Crawlstr is a **browser-based web crawler** that publishes to the **shared SIP-01
(Search Index Protocol) index** on Nostr. It uses the exact same event kinds,
tags, URL normalization, and schemas as
[0xSearchstr](https://github.com/NostrDanish/0xSearchstr),
[0xPresearchstr](https://github.com/NostrDanish/0xPresearchstr), and
[UNCAGED-ENGINE](https://github.com/NostrDanish/UNCAGED-ENGINE).

## Protocol Compatibility

| Schema | Kind | Type | Status |
|--------|------|------|--------|
| Web Index Observation (SIP-01) | **39697** | addressable | **Written** by Crawlstr |

Crawlstr is a **pure SIP-01 publisher** — it only writes kind 39697 events.
It does NOT write community submissions (kind 30078) or query caches.

## What Crawlstr Writes

### Kind 39697 — Web Index Observation (SIP-01)

One addressable event per `(crawler's indexer pubkey, normalized URL)` — a signed
statement: *"This device observed this web page at this time, and here is its
public metadata."*

```json
{
  "kind": 39697,
  "pubkey": "<device indexer pubkey, hex>",
  "created_at": 1786250000,
  "content": "{\"title\":\"Example Page\",\"description\":\"A page about...\",\"image\":\"https://example.com/og.jpg\"}",
  "tags": [
    ["d", "widx:9f86d081884c7d659a2feaa0c55ad015"],
    ["u", "https://example.com/page"],
    ["l", "en"],
    ["x", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["v", "1"],
    ["source", "crawlstr/1"],
    ["alt", "Web index observation: Example Page"]
  ]
}
```

**Tags:**

| Tag | Required | Meaning |
|-----|----------|---------|
| `d` | ✔ | `"widx:" + sha256(normalized_url)[0:32]` — URL identity, identical across all indexers |
| `u` | ✔ | Canonical URL (http/https only, normalized per SIP-01 §8) |
| `v` | ✔ | Schema version `"1"` |
| `x` | ✔ | Content hash: `sha256(title + "\n" + description)` |
| `l` | – | ISO 639-1 language code |
| `source` | – | `"crawlstr/1"` — identifies this software |
| `alt` | ✔ | NIP-31 human-readable description |

**Key properties (same as all SIP-01 publishers):**

- **Per-device indexer identity** — each browser generates its own anonymous keypair
  on first use (`localStorage: sip:indexer:secret`). Never the user's personal key.
- **No query leakage** — the event contains a URL and public page metadata, never
  what anyone searched for.
- **URL normalization** — identical to SIP-01 §8: strips tracking params, lowercases
  host, removes `www.`, sorts query params, removes fragments.
- **Deduplication** — the `d` tag is deterministic from the normalized URL; the
  `x` tag is a content agreement signal. Multiple crawlers observing the same page
  produce events with the same `d` — search nodes count distinct authors.
- **Addressable** — re-crawling the same URL replaces the previous observation
  (one slot per indexer per URL).

## How Crawlstr Differs from Other SIP-01 Publishers

| Feature | 0xSearchstr / UNCAGED | Crawlstr |
|---------|----------------------|----------|
| **Trigger** | Search results surfaced by providers | Active web crawling |
| **Discovery** | Search results from external APIs | Link following from seed URLs |
| **Depth** | 1 (direct results only) | Configurable (up to 3 by default) |
| **Rate limiting** | N/A (API-driven) | Per-domain, configurable |
| **robots.txt** | N/A | Respected (configurable) |
| **Queue** | N/A | IndexedDB persistent queue |
| **Power management** | N/A | Battery/WiFi/bandwidth aware |

The **event schema is identical**. The difference is only in how URLs are discovered.

## Relay Publishing

Crawlstr publishes to the same relay pool as the ecosystem:

**Search relays (NIP-50):**
- `wss://relay.nostr.band/`
- `wss://relay.ditto.pub/`
- `wss://search.nos.today/`
- `wss://relay.noswhere.com/`

**Write relays (for propagation):**
- `wss://relay.ditto.pub/`
- `wss://relay.primal.net/`
- `wss://relay.damus.io/`

## Reading the Index

Any SIP-01 compatible search engine can read Crawlstr's observations:

```json
{
  "kinds": [39697],
  "#d": ["widx:9f86d081884c7d659a2feaa0c55ad015"]
}
```

Or browse by topic:

```json
{
  "kinds": [39697],
  "#t": ["nostr"],
  "limit": 50
}
```

Or query full-text via NIP-50 (on capable relays):

```json
{
  "kinds": [39697],
  "search": "bitcoin privacy",
  "limit": 20
}
```

## Trust Model

- Crawlstr observations are **structurally trusted** — any indexer pubkey is accepted.
- Events are validated on parse: schema version, URL allowlist, field caps.
- Agreement across independent indexers (same `d`, different `pubkey`) is the
  ranking signal.
- Crawlstr is just one more independent indexer in the SIP-01 ecosystem.

## References

- **SIP-01 Spec:** [0xSearchstr/docs/SEARCH_INDEX_PROTOCOL.md](https://github.com/NostrDanish/0xSearchstr/blob/main/docs/SEARCH_INDEX_PROTOCOL.md)
- **0xSearchstr NIP.md:** [legacy schemas, community submissions, Nostra interop](https://github.com/NostrDanish/0xSearchstr/blob/main/NIP.md)
- **UNCAGED-ENGINE NIP.md:** [reference implementation schemas](https://github.com/NostrDanish/UNCAGED-ENGINE/blob/main/NIP.md)
