# Searchstr Crawler Network Protocol v1

This document defines the custom Nostr event kinds used by the Searchstr Crawler Network — a decentralized, opt-in web crawling and indexing protocol.

## Overview

The Searchstr Crawler Network uses Nostr as a **coordination and discovery layer**, not as a search database. Crawlers publish compact metadata about pages they discover. Indexers consume these events to build local search indexes.

```
Crawlers (browser/desktop/server)
    │
    ▼ publish crawl results
Nostr Relays
    │
    ▼ consume events
Indexers (SQLite FTS5, Tantivy, etc.)
    │
    ▼ serve queries
Search Interfaces (Searchstr, UNCAGED, etc.)
```

## Event Kinds

### Kind 20001 — Crawl Request (Ephemeral)

Announces a URL that needs crawling. Any crawler node can pick it up.

```json
{
  "kind": 20001,
  "content": "",
  "tags": [
    ["url", "https://example.com/page"],
    ["domain", "example.com"],
    ["priority", "0.8"],
    ["depth", "2"],
    ["protocol", "searchstr/v1"],
    ["alt", "Crawl request for https://example.com/page"]
  ]
}
```

**Tags:**

| Tag | Required | Description |
|-----|----------|-------------|
| `url` | yes | The URL to crawl |
| `domain` | yes | Domain extracted from URL |
| `priority` | yes | Crawl priority (0.0–1.0) |
| `depth` | yes | Link depth from original seed |
| `protocol` | yes | Protocol version identifier |

### Kind 20002 — Crawl Result (Ephemeral)

Published by a crawler after successfully fetching and parsing a page.

```json
{
  "kind": 20002,
  "content": "{\"title\":\"Page Title\",\"description\":\"Meta description\",\"word_count\":1234,\"protocol\":\"searchstr/v1\"}",
  "tags": [
    ["url", "https://example.com/page"],
    ["d", "https://example.com/page"],
    ["domain", "example.com"],
    ["hash", "sha256:abc123..."],
    ["status", "200"],
    ["content-type", "text/html"],
    ["language", "en"],
    ["protocol", "searchstr/v1"],
    ["alt", "Crawl result for https://example.com/page"]
  ]
}
```

**Tags:**

| Tag | Required | Description |
|-----|----------|-------------|
| `url` | yes | Canonical URL of the crawled page |
| `d` | yes | Same as `url` — used for addressable dedup |
| `domain` | yes | Domain extracted from URL |
| `hash` | yes | SHA-256 hash of normalized page text content |
| `status` | yes | HTTP status code |
| `content-type` | yes | Response content type |
| `language` | yes | Detected page language (ISO 639-1) |
| `protocol` | yes | Protocol version identifier |
| `alt` | yes | Human-readable description (NIP-31) |

**Content:**

JSON object with compact metadata:

```json
{
  "title": "Page Title",
  "description": "Meta description text",
  "word_count": 1234,
  "protocol": "searchstr/v1"
}
```

> **Note:** The full page text is NOT stored in the Nostr event. Indexers can use the content hash to identify duplicates and may re-fetch pages if full text is needed.

## Design Principles

1. **Nostr is the coordination layer, not the database.** Only compact metadata goes on Nostr. Full content stays local to crawlers/indexers.

2. **Content hashing enables deduplication.** Multiple crawlers fetching the same page produce the same `hash` tag. Indexers use this to deduplicate.

3. **Opt-in and transparent.** Crawlers are always explicitly enabled by the user. No hidden crawling, no tracking, no analytics.

4. **Respectful by default.** Crawlers respect robots.txt, implement per-domain rate limiting, and adapt to device battery/network conditions.

5. **No central authority.** Anyone can run a crawler, anyone can run an indexer. The protocol is open and permissionless.

## Crawler Behavior

### Queue Management

Crawlers maintain a local IndexedDB queue that persists across sessions:

```json
{
  "url": "https://example.com/article",
  "priority": 0.72,
  "depth": 2,
  "discovered_from": "https://example.com",
  "attempts": 1,
  "last_attempt": 1786250000,
  "next_attempt": 1786253600
}
```

### URL Canonicalization

Before hashing, URLs are normalized:
- Remove tracking parameters (`utm_*`, `fbclid`, `gclid`, etc.)
- Lowercase hostname
- Remove trailing slash from root paths
- Preserve meaningful query parameters (`?page=2`, `?id=123`)

### Rate Limiting

- **Per-domain:** Minimum 5 seconds between requests (eco mode: 8 seconds)
- **Per-crawler:** Configurable max pages per hour
- **Per-session:** Configurable max bandwidth

### Power Management

- Battery < 15% and not charging → **STOP**
- WiFi-only mode → **STOP** on cellular
- Charging-only mode → **STOP** when unplugged
- Eco mode → longer delays, fewer concurrent requests

## Future Extensions

- **Kind 20003** — URL Discovery (lightweight link announcements without full crawl)
- **Kind 20004** — Index Announcement (indexer capability/discovery)
- **Kind 20005** — Crawler Capability (what a node can handle)
- **Kind 20006** — Crawl Policy (per-domain rules)

## Security Considerations

- Crawl results are signed by the crawler's Nostr key — this proves authorship, not accuracy
- Indexers should validate results and use multi-crawler consensus for trust
- Content hashing prevents some forms of spam but not all
- Crawler reputation should be based on accuracy, consistency, and diversity — not used as a permission system
