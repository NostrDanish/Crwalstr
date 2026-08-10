import { cn } from '@/lib/utils';

export interface CrawlstrLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Gently pulse the web while the crawler is active. */
  animated?: boolean;
}

/**
 * The Crawlstr mark — a spider sitting in a fan-shaped web.
 *
 * Geometry: web hub at (32,34), radius 30. Seven spokes at 0°, ±39°, ±78°,
 * ±117° from vertical, each capped with a rounded ball tip. Three rings of
 * silk sag inward between the spokes. Legs sit over the web, body over legs.
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
        <g
          strokeWidth={1.9}
          className={cn(animated && 'motion-safe:animate-pulse')}
        >
          {/* Spokes — inner ends tuck behind the body */}
          <path d="M32 28V4" />
          <path d="M28.22 29.34 13.12 10.69" />
          <path d="M35.78 29.34 50.88 10.69" />
          <path d="M26.13 32.75 2.66 27.76" />
          <path d="M37.87 32.75 61.34 27.76" />
          <path d="M26.65 36.72 5.27 47.62" />
          <path d="M37.35 36.72 58.73 47.62" />

          {/* Outer ring (r=30) */}
          <path d="M5.27 47.62Q6.72 37.33 2.66 27.76Q10.26 20.68 13.12 10.69Q23.49 9.96 32 4Q40.51 9.96 50.88 10.69Q53.74 20.68 61.34 27.76Q57.28 37.33 58.73 47.62" />

          {/* Middle ring (r=20.5) */}
          <path d="M13.73 43.31Q14.73 36.27 11.95 29.74Q17.14 24.9 19.1 18.07Q26.18 17.57 32 13.5Q37.82 17.57 44.9 18.07Q46.86 24.9 52.05 29.74Q49.27 36.27 50.27 43.31" />

          {/* Inner ring (r=12.5) */}
          <path d="M19.77 31.4Q22.94 28.45 24.13 24.29Q28.45 23.98 32 21.5Q35.55 23.98 39.87 24.29Q41.06 28.45 44.23 31.4" />
        </g>

        {/* ===== Legs (over the web) ===== */}
        <g strokeWidth={2.6}>
          <path d="M25 35 17 27 11.5 24.5" />
          <path d="M24 40 13 35 8.5 34" />
          <path d="M24 45 13 44 9.5 49" />
          <path d="M26 50 16.5 53 12.5 58" />
          <path d="M39 35 47 27 52.5 24.5" />
          <path d="M40 40 51 35 55.5 34" />
          <path d="M40 45 51 44 54.5 49" />
          <path d="M38 50 47.5 53 51.5 58" />
        </g>
      </g>

      {/* Ball tips at the spoke ends */}
      <g fill="currentColor">
        <circle cx="32" cy="4" r="1.5" />
        <circle cx="13.12" cy="10.69" r="1.5" />
        <circle cx="50.88" cy="10.69" r="1.5" />
        <circle cx="2.66" cy="27.76" r="1.5" />
        <circle cx="61.34" cy="27.76" r="1.5" />
        <circle cx="5.27" cy="47.62" r="1.5" />
        <circle cx="58.73" cy="47.62" r="1.5" />
      </g>

      {/* ===== Body ===== */}
      <ellipse cx="32" cy="49.5" rx="9.8" ry="10.6" fill="currentColor" />
      <circle cx="32" cy="32.5" r="8.7" fill="currentColor" />

      {/* Eyes — punch through to the background so they work in both themes */}
      <circle cx="27.8" cy="33" r="1.7" className="fill-background" />
      <circle cx="36.2" cy="33" r="1.7" className="fill-background" />
    </svg>
  );
}
