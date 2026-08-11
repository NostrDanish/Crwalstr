/**
 * Random Scout seed collection.
 *
 * A small curated list of long-tail starting points — indie blogs, awesome
 * lists, documentation, archives, tools, feeds. This is intentionally a few
 * hundred URLs, not a database: Indexstr ships the heavy SQLite collections,
 * Crawlstr ships entropy.
 *
 * Selection strategy is "fresh-first": the provider remembers (locally, never
 * published) which seeds this device has already scouted, and prefers URLs it
 * has never picked. When everything has been used, the oldest picks recycle.
 *
 * Privacy: the selection history lives in localStorage only. Which seed was
 * picked is NEVER published — only the public page observations that result.
 */

import { normalizeIndexUrl } from './webIndex';

/** Curated long-tail starting points. One per line; comments stripped. */
const SEED_TEXT = `
# --- Nostr / Bitcoin / open protocol ecosystem ---
https://nostr.com
https://nostr.how
https://bitcoin.org
https://bitcoiner.guide
https://darosior.github.io
https://diyhpl.us
https://gnusha.org
https://mempool.space
https://bitcoinops.org
https://learnmeabitcoin.com
https://lightning.engineering
https://btctranscripts.com
https://bitcoin.page
https://bitcoinbriefly.com
https://nakamoto.com
https://unchained.com
https://keys.casa
https://blog.casa
https://ministryofnodes.com
https://bitcoinerjobs.co
https://nostr.directory
https://nostr.watch
https://nostrapps.com
https://njump.me
https://iris.to
https://primal.net
https://habla.news
https://zap.stream
https://wikifreedia.xyz
https://shopstr.store
https://satellite.earth
https://hivemind.vc
https://spiral.xyz
https://opensats.org
https://hrf.org
https://bitcoinbeach.com
https://geyser.fund
https://bolt.fun
https://amboss.space

# --- Indie blogs & essays ---
https://paulgraham.com
https://slatestarcodex.com
https://astralcodexten.substack.com
https://waitbutwhy.com
https://fs.blog
https://ribbonfarm.com
https://kk.org/thetechnium
https://collaborativefund.com/blog
https://jamesclear.com
https://markmanson.net
https://calnewport.com
https://nesslabs.com
https://patrickcollison.com
https://a16z.com
https://stratechery.com
https://daringfireball.net
https://kottke.org
https://boingboing.net
https://longform.org
https://themarginalian.org
https://lithub.com
https://aeon.co
https://psyche.co
https://nautil.us
https://quantamagazine.org
https://jacobin.com
https://currentaffairs.org
https://bostonreview.net
https://lareviewofbooks.org
https://3quarksdaily.com
https://gwern.net
https://sive.rs
https://blog.jimmywales.com
https://tedium.co
https://readmargins.com
https://lwn.net
https://jvns.ca
https://danluu.com
https://rachelbythebay.com
https://matklad.github.io
https://fasterthanli.me
https://xeiaso.net
https://christine.website
https://www.joelonsoftware.com
https://blog.codinghorror.com
https://martinfowler.com
https://simonwillison.net
https://antirez.com
https://pointersgonewild.com
https://mcfunley.com
https://blog.samwhomsey.com

# --- Awesome lists & dev resources ---
https://github.com/sindresorhus/awesome
https://github.com/EbookFoundation/free-programming-books
https://github.com/public-apis/public-apis
https://github.com/avelino/awesome-go
https://github.com/vinta/awesome-python
https://github.com/rust-unofficial/awesome-rust
https://github.com/sorrycc/awesome-javascript
https://github.com/awesome-selfhosted/awesome-selfhosted
https://github.com/dylanrees/citizen-science
https://github.com/caesar0301/awesome-public-datasets
https://developer.mozilla.org
https://devdocs.io
https://dev.to
https://lobste.rs
https://news.ycombinator.com
https://stackoverflow.com
https://stackexchange.com
https://gitlab.com
https://sourceforge.net
https://codeberg.org
https://sr.ht
https://tildeverse.org
https://neocities.org
https://glitch.com
https://replit.com
https://freecodecamp.org
https://leetcode.com
https://exercism.org
https://codewars.com
https://projecteuler.net
https://rosettacode.org

# --- Science & education ---
https://arxiv.org
https://pubmed.ncbi.nlm.nih.gov
https://nature.com
https://science.org
https://sciencedaily.com
https://phys.org
https://livescience.com
https://scientificamerican.com
https://newscientist.com
https://smithsonianmag.com
https://nationalgeographic.com
https://nasa.gov
https://esa.int
https://spacex.com
https://space.com
https://skyandtelescope.org
https://earthobservatory.nasa.gov
https://usgs.gov
https://noaa.gov
https://ted.com
https://khanacademy.org
https://coursera.org
https://edx.org
https://ocw.mit.edu
https://openstax.org
https://ck12.org
https://brilliant.org
https://wolframalpha.com
https://mathworld.wolfram.com
https://planetmath.org
https://mathoverflow.net
https://plato.stanford.edu
https://iep.utm.edu
https://britannica.com
https://en.wikipedia.org

# --- Archives, libraries & books ---
https://archive.org
https://openlibrary.org
https://gutenberg.org
https://standardebooks.org
https://hathitrust.org
https://loc.gov
https://dp.la
https://worldcat.org
https://goodreads.com
https://librarything.com
https://bookfinder.com
https://isbnsearch.org
https://manybooks.net
https://feedbooks.com
https://smashwords.com
https://librivox.org
https://poetryfoundation.org
https://poets.org
https://tvtropes.org
https://fandom.com
https://wikiwand.com

# --- Music, art & culture ---
https://bandcamp.com
https://soundcloud.com
https://musicbrainz.org
https://discogs.com
https://rateyourmusic.com
https://last.fm
https://setlist.fm
https://genius.com
https://whosampled.com
https://everynoise.com
https://radiooooo.com
https://musopen.org
https://imslp.org
https://freemusicarchive.org
https://mixcloud.com
https://deviantart.com
https://artstation.com
https://behance.net
https://dribbble.com
https://flickr.com
https://unsplash.com
https://pexels.com
https://wikimedia.org
https://commons.wikimedia.org
https://openverse.org
https://publicdomainreview.org

# --- Games ---
https://itch.io
https://mobygames.com
https://igdb.com
https://howlongtobeat.com
https://pcgamingwiki.com
https://speedrun.com
https://gog.com
https://chess.com
https://lichess.org
https://boardgamegeek.com
https://steamdb.info
https://protondb.com
https://osgameclones.com
https://dosgames.com
https://myabandonware.com
https://retrogames.cc
https://archive.org/details/softwarelibrary_msdos_games

# --- Tools, projects & open data ---
https://data.gov
https://ourworldindata.org
https://gapminder.org
https://datahub.io
https://kaggle.com
https://huggingface.co
https://openstreetmap.org
https://overpass-turbo.eu
https://geohack.toolforge.org
https://wunderground.com
https://windy.com
https://flightaware.com
https://marinetraffic.com
https://flightradar24.com
https://airvisual.com
https://openaq.org
https://crt.sh
https://shodan.io
https://haveibeenpwned.com
https://virustotal.com
https://urlscan.io
https://web.archive.org
https://commoncrawl.org
https://opendatacommons.org
https://creativecommons.org
https://eff.org
https://aclu.org
https://torproject.org
https://proton.me
https://signal.org
https://matrix.org
https://element.io
https://mastodon.social
https://joinmastodon.org
https://lemmy.world
https://kbin.social
https://peertube.tv
https://odysee.com
https://ipfs.tech
https://filecoin.io
https://arweave.org
https://handshake.org
https://namecheap.com
https://letsencrypt.org
https://ietf.org
https://w3.org
https://whatwg.org
https://icann.org
https://isoc.org
`;

/* ------------------------------------------------------------------ */

const HISTORY_KEY = 'crawlstr:scout-history';
const HISTORY_CAP = 500;

interface ScoutHistoryEntry {
  url: string;
  at: number;
}

let cachedSeeds: string[] | null = null;

/** Parsed, normalized, deduped seed list. */
export function getSeeds(): string[] {
  if (cachedSeeds) return cachedSeeds;

  const seen = new Set<string>();
  const seeds: string[] = [];
  for (const line of SEED_TEXT.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const normalized = normalizeIndexUrl(trimmed);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      seeds.push(normalized);
    }
  }
  cachedSeeds = seeds;
  return seeds;
}

function readHistory(): ScoutHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed)
      ? parsed.filter((e): e is ScoutHistoryEntry =>
          typeof e?.url === 'string' && typeof e?.at === 'number')
      : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: ScoutHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-HISTORY_CAP)));
  } catch {
    // Storage unavailable — selection simply won't be remembered.
  }
}

/**
 * Pick a random seed, preferring URLs this device has never scouted.
 * When every seed has been used, the oldest picks recycle.
 * Returns null when the collection is empty.
 */
export function pickRandomSeed(): string | null {
  const seeds = getSeeds();
  if (seeds.length === 0) return null;

  const history = readHistory();
  const used = new Map<string, number>(history.map((e) => [e.url, e.at]));

  // Prefer never-selected seeds.
  const fresh = seeds.filter((s) => !used.has(s));
  let pick: string;

  if (fresh.length > 0) {
    pick = fresh[Math.floor(Math.random() * fresh.length)];
  } else {
    // Everything has been used — pick from the least-recently-used third.
    const byAge = [...seeds].sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0));
    const pool = byAge.slice(0, Math.max(1, Math.ceil(seeds.length / 3)));
    pick = pool[Math.floor(Math.random() * pool.length)];
  }

  used.set(pick, Date.now());
  writeHistory([...used.entries()].map(([url, at]) => ({ url, at })));
  return pick;
}

/** Number of distinct seeds available. */
export function seedCount(): number {
  return getSeeds().length;
}

/** How many seeds this device has already scouted. */
export function scoutedCount(): number {
  return readHistory().length;
}
