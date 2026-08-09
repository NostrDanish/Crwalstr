# Crawlstr

**Decentralized browser-based web crawler.** Turn your browser into a voluntary crawl node that feeds the shared [SIP-01](https://github.com/NostrDanish/0xSearchstr/blob/main/docs/SEARCH_INDEX_PROTOCOL.md) index on Nostr. No backend. No tracking. No accounts required.

Every page you crawl becomes a **kind 39697 web index observation** — instantly searchable by [0xSearchstr](https://0xsearchstr.shakespeare.wtf), [0xPresearchstr](https://presearchstr.shakespeare.wtf), [UNCAGED](https://uncaged.shakespeare.wtf), and any future SIP-01 compatible client.

**Live:** [https://crawlstr.shakespeare.wtf](https://crawlstr.shakespeare.wtf)

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2FNostrDanish%2FCrwalstr.git)

---

## How It Works

```
You add a seed URL
       │
       ▼
┌─────────────┐
│   Crawler   │  IndexedDB queue, persistent across sessions
│   Engine    │  Battery/WiFi/bandwidth aware
└──────┬──────┘
       │
       ▼
   Fetch page (respects robots.txt, rate-limited per domain)
       │
       ▼
   Parse HTML (title, description, text, links, language)
       │
       ▼
   SHA-256 content hash (dedup across the network)
       │
       ▼
   Sign kind 39697 event with per-device indexer key
       │
       ▼
   Publish to Nostr relays (SIP-01)
       │
       ▼
┌──────────────────────────────────────┐
│        Shared SIP-01 Index           │
│                                      │
│  0xSearchstr reads it                │
│  0xPresearchstr reads it             │
│  UNCAGED reads it                    │
│  Your fork reads it                  │
│  Any SIP-01 client reads it          │
└──────────────────────────────────────┘
```

---

## What Makes This Different

Most "decentralized search" projects still run centralized crawlers. Crawlstr makes **every browser a potential crawler** — opt-in, transparent, resource-aware.

| Feature | Description |
|---------|-------------|
| **Opt-in only** | Nothing runs without explicitly pressing "Start Crawling" |
| **SIP-01 native** | Same protocol as 0xSearchstr, 0xPresearchstr, UNCAGED — one shared index |
| **Per-device identity** | Anonymous indexer keypair, separate from your Nostr identity |
| **No query leakage** | Events contain page metadata only — never what anyone searched for |
| **Resource aware** | Battery, WiFi, bandwidth limits. Eco mode. Charging-only mode. |
| **robots.txt** | Respected by default (configurable) |
| **Rate limited** | 5–8 seconds between requests per domain |
| **Persistent queue** | IndexedDB-backed, survives browser restarts |
| **Offline capable** | Crawl queue persists; publishes when Nostr is reachable |
| **PWA** | Installable, works on mobile and desktop |

---

## Quick Start

```bash
git clone https://github.com/NostrDanish/Crwalstr.git
cd Crwalstr
npm install
npm run dev
```

Open the printed URL, add a seed URL, press **Start Crawling**.

---

## Usage

### Seed a URL

Enter any URL in the **Seed URLs** tab:

```
https://bitcoin.org
```

The crawler fetches the page, extracts content, hashes it, signs a SIP-01 observation, and publishes to Nostr. Then it follows links up to depth 3.

### Crawler Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **WiFi Only** | Off | Only crawl on WiFi networks |
| **Charging Only** | Off | Only crawl while device is charging |
| **Respect robots.txt** | On | Follow website crawling policies |
| **Eco Mode** | On | Slower crawling, less resource usage |

### Indexer Identity

Each browser gets its own anonymous indexer keypair (visible in the dashboard). This key signs all kind 39697 observations. It is:

- **Pseudonymous** — not linked to your personal Nostr identity
- **Replaceable** — regenerating creates a new indexer
- **Local** — the secret key never leaves your browser
- **Exportable** — for backup or migration

---

## Protocol

Crawlstr publishes **SIP-01 (Search Index Protocol)** events — the same protocol used by the entire Searchstr ecosystem.

### Kind 39697 — Web Index Observation

```json
{
  "kind": 39697,
  "pubkey": "<device indexer pubkey>",
  "created_at": 1786250000,
  "content": "{\"title\":\"Example Page\",\"description\":\"A page about...\"}",
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

| Tag | Meaning |
|-----|---------|
| `d` | `"widx:" + sha256(normalized_url)[0:32]` — URL identity, identical across all indexers |
| `u` | Canonical URL (normalized per SIP-01 §8) |
| `x` | Content hash: `sha256(title + "\n" + description)` |
| `v` | Schema version `"1"` |
| `l` | ISO 639-1 language code |
| `source` | `"crawlstr/1"` |
| `alt` | NIP-31 human-readable description |

Full schema documentation: [NIP.md](NIP.md)

### Relay Pool

Observations are published to:

- `wss://relay.nostr.band/` (NIP-50 search)
- `wss://relay.ditto.pub/` (NIP-50 search)
- `wss://search.nos.today/` (NIP-50 search)
- `wss://relay.noswhere.com/` (NIP-50 search)
- `wss://relay.primal.net/` (write relay)
- `wss://relay.damus.io/` (write relay)

---

## Federation: One Index, Many Crawlers

Crawlstr is **one more independent indexer** in the SIP-01 ecosystem:

```
Crawlstr (browser crawler)
    │
    ▼ kind 39697, signed by device indexer key
Nostr Relays
    │
    ├──→ 0xSearchstr (search engine) reads it
    ├──→ 0xPresearchstr (search engine) reads it
    ├──→ UNCAGED (search engine template) reads it
    └──→ Any SIP-01 client reads it
```

Multiple crawlers observing the same URL produce events with the **same `d` tag** and different pubkeys — search nodes group by `d` and count distinct authors ("7 independent indexers saw this page").

---

## Browser Limitations

Crawlstr is honest about what a browser can and cannot do:

- **CORS** — A browser cannot fetch arbitrary pages cross-origin. Sites that don't send CORS headers can't be crawled from the browser.
- **JavaScript rendering** — Crawlstr parses static HTML. Single-page apps that require JavaScript rendering won't have their full content extracted.
- **Background execution** — Mobile browsers may throttle or kill background tabs. The crawler is most effective when the tab is active.
- **Rate limits** — Per-domain rate limiting is built-in (5–8 seconds between requests). This is respectful by design.

For unrestricted crawling, run a desktop/CLI SIP-01 crawler alongside Crawlstr.

---

## Tech Stack

- **React 19** + TypeScript + Vite
- **TailwindCSS 4** + shadcn/ui
- **Nostrify** — Nostr relay pool
- **nostr-tools** — Event signing (`finalizeEvent`)
- **idb** — IndexedDB wrapper for the crawl queue
- **TanStack Query** — Data fetching + caching
- **PWA** — Service worker, manifest, installable

---

## Project Structure

```
src/
├── crawler/
│   ├── engine.ts           ← Main crawler orchestrator (crawl loop, queue, scheduling)
│   ├── queue.ts            ← IndexedDB persistent queue (survives restarts)
│   ├── fetcher.ts          ← HTTP fetcher (CORS, timeout, size limits)
│   ├── parser.ts           ← HTML parser (title, description, text, links, language)
│   ├── hasher.ts           ← SHA-256 content hashing for local dedup
│   ├── webIndex.ts         ← SIP-01: URL normalization, event build/parse (byte-compatible)
│   ├── indexerIdentity.ts  ← Per-device anonymous indexer keypair
│   ├── publisher.ts        ← Signs + publishes kind 39697 via finalizeEvent
│   ├── relays.ts           ← Ecosystem relay pool configuration
│   ├── robots.ts           ← robots.txt parser with caching
│   ├── limits.ts           ← Per-domain rate limiting
│   └── types.ts            ← TypeScript interfaces
├── components/
│   └── crawler/
│       └── CrawlerDashboard.tsx  ← Main UI (toggle, stats, seed, history, settings)
├── hooks/
│   └── useCrawler.ts       ← React hook wiring engine to Nostr
├── pages/
│   └── Index.tsx           ← Landing page + dashboard
└── NIP.md                  ← Protocol documentation
```

---

## Ecosystem

| Project | Role | URL |
|---------|------|-----|
| **Crawlstr** (this) | Browser crawler → SIP-01 publisher | [crawlstr.shakespeare.wtf](https://crawlstr.shakespeare.wtf) |
| [0xSearchstr](https://github.com/NostrDanish/0xSearchstr) | Search engine → SIP-01 reader | [0xsearchstr.shakespeare.wtf](https://0xsearchstr.shakespeare.wtf) |
| [0xPresearchstr](https://github.com/NostrDanish/0xPresearchstr) | Community fork with keyword staking | [presearchstr.shakespeare.wtf](https://presearchstr.shakespeare.wtf) |
| [UNCAGED-ENGINE](https://github.com/NostrDanish/UNCAGED-ENGINE) | Minimal search engine template | [uncaged.shakespeare.wtf](https://uncaged.shakespeare.wtf) |

---

## Privacy, Honestly

- **No login required** to crawl. No account. No tracking.
- Crawl observations are signed by a **per-device anonymous keypair**, never your personal Nostr identity.
- Events contain **page metadata only** — never search queries, never browsing history.
- Your crawl history stays in your browser (IndexedDB). Clearing browser data removes it.
- Relay operators see the observation event and your IP address — that's how Nostr works. Key separation is guaranteed; network anonymity is not.
- Use a VPN or Tor — we recommend [NymVPN](https://nym.com).

**Support us:** [https://nym.com/pricing?ref=aYPKAFmGpJi](https://nym.com/pricing?ref=aYPKAFmGpJi)

---

## License

MIT

---

*Vibed with [Shakespeare](https://shakespeare.diy)*
