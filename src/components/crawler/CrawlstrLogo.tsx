import { cn } from '@/lib/utils';

export interface CrawlstrLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Gently pulse the web while the crawler is active. */
  animated?: boolean;
}

/**
 * The Crawlstr mark: a spider sitting in its web.
 *
 * Uses `currentColor` throughout so it inherits text color and works in both
 * themes — set it with a Tailwind text utility, e.g. `className="text-primary"`.
 * The eyes use `fill-background` so they read correctly in light and dark.
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
      {/* ---------- Web (behind the spider) ---------- */}
      <g
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(animated && 'motion-safe:animate-pulse')}
      >
        {/* Centre spoke */}
        <path d="M32 28 L32 5" />

        {/* Left half */}
        <g>
          <path d="M32 28 L18.8 9.2" />
          <path d="M32 28 L10.7 19.4" />
          <path d="M32 28 L9.3 32" />
          <path d="M32 5 Q24.7 5 18.8 9.2 Q13 12.9 10.7 19.4 Q7.8 25.5 9.3 32" />
          <path d="M32 12 Q26.9 12 22.8 14.9 Q18.8 17.5 17.2 22 Q15.2 26.2 16.2 30.8" />
          <path d="M32 19 Q29.1 19 26.8 20.6 Q24.6 22.1 23.7 24.6 Q22.5 27 23.1 29.6" />
        </g>

        {/* Right half — mirror of the left */}
        <g transform="translate(64 0) scale(-1 1)">
          <path d="M32 28 L18.8 9.2" />
          <path d="M32 28 L10.7 19.4" />
          <path d="M32 28 L9.3 32" />
          <path d="M32 5 Q24.7 5 18.8 9.2 Q13 12.9 10.7 19.4 Q7.8 25.5 9.3 32" />
          <path d="M32 12 Q26.9 12 22.8 14.9 Q18.8 17.5 17.2 22 Q15.2 26.2 16.2 30.8" />
          <path d="M32 19 Q29.1 19 26.8 20.6 Q24.6 22.1 23.7 24.6 Q22.5 27 23.1 29.6" />
        </g>
      </g>

      {/* ---------- Legs (before the body so joints tuck behind) ---------- */}
      <g
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g>
          <path d="M26.5 33 L18 25 L14.5 33" />
          <path d="M25.5 38 L15.5 34 L11 42" />
          <path d="M24.5 44 L14.5 44 L10.5 52" />
          <path d="M26 50 L18.5 54 L15.5 61" />
        </g>
        <g transform="translate(64 0) scale(-1 1)">
          <path d="M26.5 33 L18 25 L14.5 33" />
          <path d="M25.5 38 L15.5 34 L11 42" />
          <path d="M24.5 44 L14.5 44 L10.5 52" />
          <path d="M26 50 L18.5 54 L15.5 61" />
        </g>
      </g>

      {/* ---------- Body ---------- */}
      <ellipse cx="32" cy="45" rx="8.5" ry="10" fill="currentColor" />
      <circle cx="32" cy="33" r="7" fill="currentColor" />

      {/* Eyes — punch through to the background so they work in both themes */}
      <circle cx="29.4" cy="32" r="1.5" className="fill-background" />
      <circle cx="34.6" cy="32" r="1.5" className="fill-background" />
    </svg>
  );
}
