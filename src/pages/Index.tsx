import { useSeoMeta } from '@unhead/react';
import { Radar, Globe, Shield, Zap, Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CrawlerDashboard } from '@/components/crawler/CrawlerDashboard';
import { LoginArea } from '@/components/auth/LoginArea';

const Index = () => {
  useSeoMeta({
    title: 'Crawlstr — Decentralized Web Crawler Network',
    description: 'Turn your browser into a voluntary web crawler. Help build a decentralized, censorship-resistant search index powered by Nostr.',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Crawlstr</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Decentralized Web Crawler
            </span>
          </div>
          <LoginArea className="max-w-60" />
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Globe className="h-3.5 w-3.5" />
            Powered by Nostr
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Search without the cage.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Turn your browser into a voluntary web crawler. Every page you crawl
            feeds the shared SIP-01 index — readable by 0xSearchstr, 0xPresearchstr,
            UNCAGED, and any compatible client.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Shield className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Opt-in Only</h3>
              <p className="text-xs text-muted-foreground">
                Nothing runs without your explicit consent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Zap className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Resource Aware</h3>
              <p className="text-xs text-muted-foreground">
                Respects battery, bandwidth, and WiFi settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            <Users className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">SIP-01 Compatible</h3>
              <p className="text-xs text-muted-foreground">
                Same protocol as 0xSearchstr, Presearchstr, UNCAGED
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Crawler Dashboard */}
      <section className="container max-w-6xl mx-auto px-4 pb-16">
        <CrawlerDashboard />
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every browser that opts in becomes a node in the decentralized crawl network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: Search,
                title: 'Seed URLs',
                desc: 'Add websites you want to index, or pick up crawl jobs from the network',
              },
              {
                step: '2',
                icon: Radar,
                title: 'Crawl',
                desc: 'Your browser fetches pages, extracts content, and discovers new links',
              },
              {
                step: '3',
                icon: Shield,
                title: 'Hash & Dedupe',
                desc: 'Content is hashed with SHA-256 to detect duplicates across the network',
              },
              {
                step: '4',
                icon: Globe,
                title: 'Publish',
                desc: 'Kind 39697 SIP-01 observations signed by your device indexer key',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary">STEP {step}</div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-t">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Architecture</h2>
            <Card>
              <CardContent className="pt-6">
                <pre className="text-xs sm:text-sm font-mono text-muted-foreground overflow-x-auto whitespace-pre">
{`┌──────────────────────────┐
│       CRAWLSTR PWA       │
│  (this app — you are     │
│   the crawler)           │
└───────────┬──────────────┘
            │
  ┌─────────▼─────────┐
  │  CRAWLER ENGINE   │
  │  Queue → Fetch    │
  │   → Parse → Hash  │
  │   → SIP-01 Sign   │
  │   → Publish       │
  └─────────┬─────────┘
            │
      ┌─────▼─────┐
      │   NOSTR   │
      │  RELAYS   │
      │           │
      │ kind 39697│
      │ (SIP-01)  │
      └─────┬─────┘
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
0xSearchstr 0xPre-  UNCAGED
            searchstr
   │        │        │
   └────────┼────────┘
            │
     ┌──────▼──────┐
     │  Any SIP-01  │
     │  compatible  │
     │  search node │
     └──────┬──────┘
            │
      SEARCH RESULTS`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radar className="h-4 w-4" />
              <span>Crawlstr — Decentralized Web Crawler Network</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>No tracking</span>
              <span>·</span>
              <span>No analytics</span>
              <span>·</span>
              <span>Open source</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Vibed with Shakespeare
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
