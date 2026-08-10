import { cn } from '@/lib/utils';

export interface CrawlstrLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Gently pulse the web while the crawler is active. */
  animated?: boolean;
}

/**
 * The Crawlstr mark — a spider sitting in its web.
 *
 * Traced from the reference artwork. Web hub is at (32,30) with radius 18;
 * seven spokes at 0°, ±37°, ±80°, ±124° from vertical, each capped with a
 * ball tip. Three courses of silk sag inward between the spokes to give the
 * chevron shape. Layer order is web -> ball tips -> legs -> body, so the head
 * hides the hub and the leg joints tuck behind the body.
 *
 * Uses `currentColor` so it inherits text color and works in both themes —
 * set it with a Tailwind text utility, e.g. `className="text-primary"`.
 * The eyes use `fill-background` so they read in light and dark.
 */
export function CrawlstrLogo({ animated = false, className, ...props }: CrawlstrLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Crawlstr"
      className={cn('text-primary', className)}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* ===== Web silk ===== */}
        <g strokeWidth={1.8} className={cn(animated && 'motion-safe:animate-pulse')}>
          {/* Spokes — inner ends are covered by the head */}
          <path d="M32 30 32 12" />
          <path d="M32 30 21.2 15.6" />
          <path d="M32 30 42.8 15.6" />
          <path d="M32 30 14.3 26.9" />
          <path d="M32 30 49.7 26.9" />
          <path d="M32 30 17.1 40.1" />
          <path d="M32 30 46.9 40.1" />

          {/* Outer course */}
          <path d="M17.1 40.1Q17.9 33 14.3 26.9Q19.7 22.5 21.2 15.6Q27.4 16.4 32 12Q36.6 16.4 42.8 15.6Q44.3 22.5 49.7 26.9Q46.1 33 46.9 40.1" />

          {/* Middle course */}
          <path d="M22.6 36.3Q23.1 31.9 20.8 28Q24.3 25.3 25.2 20.9Q29.1 21.4 32 18.7Q34.9 21.4 38.8 20.9Q39.7 25.3 43.2 28Q40.9 31.9 41.4 36.3" />

          {/* Inner course */}
          <path d="M24.9 28.8Q27.1 27 27.7 24.3Q30.2 24.5 32 22.8Q33.8 24.5 36.3 24.3Q36.9 27 39.1 28.8" />
        </g>

        {/* ===== Legs (over the web) ===== */}
        <g strokeWidth={2.4}>
          <path d="M27.5 33 20.5 26.5 17.5 33" />
          <path d="M26.5 36 21 34.5 17 40.5" />
          <path d="M27 39.5 22 41.5 20 47.5" />
          <path d="M36.5 33 43.5 26.5 46.5 33" />
          <path d="M37.5 36 43 34.5 47 40.5" />
          <path d="M37 39.5 42 41.5 44 47.5" />
        </g>
      </g>

      {/* Ball tips */}
      <g fill="currentColor">
        <circle cx="32" cy="12" r="1.2" />
        <circle cx="21.2" cy="15.6" r="1.2" />
        <circle cx="42.8" cy="15.6" r="1.2" />
        <circle cx="14.3" cy="26.9" r="1.2" />
        <circle cx="49.7" cy="26.9" r="1.2" />
        <circle cx="17.1" cy="40.1" r="1.2" />
        <circle cx="46.9" cy="40.1" r="1.2" />
      </g>

      {/* ===== Body ===== */}
      <ellipse cx="32" cy="41.5" rx="6.4" ry="6.6" fill="currentColor" />
      <circle cx="32" cy="31" r="5.4" fill="currentColor" />

      {/* Eyes — punch through to the background so they work in both themes */}
      <circle cx="29.4" cy="30.3" r="1.35" className="fill-background" />
      <circle cx="34.6" cy="30.3" r="1.35" className="fill-background" />
    </svg>
  );
}
