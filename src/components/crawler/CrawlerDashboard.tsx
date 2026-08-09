import { useState } from 'react';
import {
  Radar,
  Play,
  Square,
  Plus,
  Trash2,
  Globe,
  Clock,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Settings2,
  Wifi,
  BatteryCharging,
  Shield,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCrawler } from '@/hooks/useCrawler';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ${seconds % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function CrawlerDashboard() {
  const {
    isRunning,
    initialized,
    stats,
    recentCrawls,
    indexerInfo,
    start,
    stop,
    seedUrl,
    clearAll,
    updateSettings,
    getSettings,
  } = useCrawler();

  const [seedInput, setSeedInput] = useState('');
  const [copied, setCopied] = useState(false);
  const settings = getSettings();

  const handleSeed = () => {
    if (!seedInput.trim()) return;
    let url = seedInput.trim();
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    seedUrl(url);
    setSeedInput('');
  };

  const copyNpub = () => {
    if (!indexerInfo) return;
    navigator.clipboard.writeText(indexerInfo.npub);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Toggle Card */}
      <Card className={cn(
        'border-2 transition-colors duration-300',
        isRunning ? 'border-green-500/50 bg-green-500/5' : 'border-border'
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2.5 rounded-xl transition-colors',
                isRunning ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
              )}>
                <Radar className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isRunning ? 'Crawler Active' : 'Crawler Offline'}
                </CardTitle>
                <CardDescription>
                  {isRunning
                    ? 'Your browser is contributing to the shared SIP-01 index'
                    : 'Enable to start crawling and indexing the web'}
                </CardDescription>
              </div>
            </div>
            <Button
              size="lg"
              variant={isRunning ? 'destructive' : 'default'}
              onClick={isRunning ? stop : start}
              disabled={!initialized}
              className={cn(
                'gap-2 px-6',
                !isRunning && 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Crawling
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Live status indicator */}
        {isRunning && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              Crawling... Uptime: {formatUptime(stats.uptime)}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Indexer Identity Card */}
      {indexerInfo && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Key className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Indexer Identity (SIP-01)</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {indexerInfo.npub}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyNpub}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per-device pseudonymous keypair. Signs kind 39697 observations.
              Separate from your personal Nostr identity.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Database className="h-4 w-4" />
              <span className="text-xs font-medium">Indexed</span>
            </div>
            <div className="text-2xl font-bold">{stats.pagesIndexed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Queue</span>
            </div>
            <div className="text-2xl font-bold">{stats.queueSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Bandwidth</span>
            </div>
            <div className="text-2xl font-bold">{formatBytes(stats.bandwidthUsed)}</div>
            <p className="text-xs text-muted-foreground">used</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">Protocol</span>
            </div>
            <div className="text-2xl font-bold">SIP-01</div>
            <p className="text-xs text-muted-foreground">kind 39697</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Seed / History / Settings */}
      <Tabs defaultValue="seed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seed">Seed URLs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Seed URL Tab */}
        <TabsContent value="seed">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add URLs to Crawl</CardTitle>
              <CardDescription>
                Enter a URL to start crawling. Pages are published as SIP-01 observations
                (kind 39697) readable by 0xSearchstr, 0xPresearchstr, UNCAGED, and any compatible client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSeed()}
                  className="flex-1"
                />
                <Button onClick={handleSeed} disabled={!seedInput.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {stats.queueSize} URL{stats.queueSize !== 1 ? 's' : ''} in queue
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear Queue
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear crawl queue?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all {stats.queueSize} pending URLs from the queue.
                        Already crawled pages will remain in the index.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAll}>Clear Queue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recently Crawled</CardTitle>
              <CardDescription>
                Pages indexed by this browser, published as SIP-01 observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCrawls.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No pages crawled yet.</p>
                  <p className="text-sm mt-1">Add a seed URL and start the crawler.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {recentCrawls.map((page) => (
                      <div
                        key={page.url}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {page.title || 'Untitled'}
                          </p>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                          >
                            <span className="truncate">{page.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(page.crawledAt).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              kind 39697
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crawler Settings</CardTitle>
              <CardDescription>
                Control how the crawler behaves. Nothing runs unless you explicitly enable it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="wifi-only">WiFi Only</Label>
                      <p className="text-xs text-muted-foreground">Only crawl on WiFi networks</p>
                    </div>
                  </div>
                  <Switch
                    id="wifi-only"
                    checked={settings.wifiOnly}
                    onCheckedChange={(v) => updateSettings({ wifiOnly: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="charging-only">Charging Only</Label>
                      <p className="text-xs text-muted-foreground">Only crawl while device is charging</p>
                    </div>
                  </div>
                  <Switch
                    id="charging-only"
                    checked={settings.chargingOnly}
                    onCheckedChange={(v) => updateSettings({ chargingOnly: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="respect-robots">Respect robots.txt</Label>
                      <p className="text-xs text-muted-foreground">Follow website crawling policies</p>
                    </div>
                  </div>
                  <Switch
                    id="respect-robots"
                    checked={settings.respectRobots}
                    onCheckedChange={(v) => updateSettings({ respectRobots: v })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="eco-mode">Eco Mode</Label>
                      <p className="text-xs text-muted-foreground">Slower crawling, less resource usage</p>
                    </div>
                  </div>
                  <Switch
                    id="eco-mode"
                    checked={settings.ecoMode}
                    onCheckedChange={(v) => updateSettings({ ecoMode: v })}
                  />
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Privacy & Trust
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">No tracking</Badge>
                    <Badge variant="outline" className="text-xs">No analytics</Badge>
                    <Badge variant="outline" className="text-xs">SIP-01</Badge>
                    <Badge variant="outline" className="text-xs">kind 39697</Badge>
                  </li>
                  <li>The crawler only runs when you explicitly enable it.</li>
                  <li>
                    Observations are signed by a per-device indexer key
                    ({indexerInfo ? indexerInfo.npub.slice(0, 16) + '...' : 'generating...'}),
                    never your personal Nostr identity.
                  </li>
                  <li>Events contain page metadata only — never search queries.</li>
                  <li>Your crawl history stays in your browser (IndexedDB).</li>
                  <li>
                    <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                      Most sites block direct browser access (CORS).
                    </span>{' '}
                    Those requests are routed through a CORS proxy, so the proxy
                    operator can see which URLs are fetched. Pages fetched this
                    session: {stats.viaDirect} direct, {stats.viaProxy} via proxy.
                  </li>
                  <li>
                    Compatible with{' '}
                    <a href="https://github.com/NostrDanish/0xSearchstr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">0xSearchstr</a>,{' '}
                    <a href="https://github.com/NostrDanish/0xPresearchstr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">0xPresearchstr</a>, and{' '}
                    <a href="https://github.com/NostrDanish/UNCAGED-ENGINE" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">UNCAGED</a>.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
