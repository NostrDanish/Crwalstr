import { cn } from '@/lib/utils';

export interface CrawlstrLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Animate the legs while the crawler is active. */
  animated?: boolean;
}

/**
 * The Crawlstr mark: a spider whose legs double as a network graph.
 *
 * Uses `currentColor` so it inherits text color and works in both themes.
 * Set the color with a Tailwind text utility, e.g. `className="text-primary"`.
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
      {/* Web arcs behind the body */}
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 26a20 20 0 0 1 40 0" opacity={0.35} />
        <path d="M18 34a14 14 0 0 1 28 0" opacity={0.2} />
      </g>

      {/* Legs */}
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(animated && 'motion-safe:animate-pulse')}
      >
        {/* Left */}
        <path d="M26 30 16 22 8 26" />
        <path d="M26 34 14 34 6 39" />
        <path d="M26 38 16 45 10 53" />
        <path d="M28 41 24 50 26 58" />
        {/* Right */}
        <path d="M38 30 48 22 56 26" />
        <path d="M38 34 50 34 58 39" />
        <path d="M38 38 48 45 54 53" />
        <path d="M36 41 40 50 38 58" />
      </g>

      {/* Node dots at the leg tips — the "network" read */}
      <g fill="currentColor">
        <circle cx="8" cy="26" r="2.6" />
        <circle cx="6" cy="39" r="2.6" />
        <circle cx="10" cy="53" r="2.6" />
        <circle cx="26" cy="58" r="2.6" />
        <circle cx="56" cy="26" r="2.6" />
        <circle cx="58" cy="39" r="2.6" />
        <circle cx="54" cy="53" r="2.6" />
        <circle cx="38" cy="58" r="2.6" />
      </g>

      {/* Body + head */}
      <ellipse cx="32" cy="35" rx="9" ry="11" fill="currentColor" />
      <circle cx="32" cy="23" r="5.5" fill="currentColor" />

      {/* Eyes — punch through to the background so they read in both themes */}
      <circle cx="30" cy="22" r="1.35" className="fill-background" />
      <circle cx="34" cy="22" r="1.35" className="fill-background" />
    </svg>
  );
}
