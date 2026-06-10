interface LogoProps {
  className?: string;
}

/**
 * QueuePilot brand mark — "Hub" concept: a central node with three connected
 * satellites (the unified broker topology). Self-contained SVG with its own
 * gradient tile; size it via className (e.g. "h-8 w-8").
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QueuePilot"
    >
      <defs>
        <linearGradient id="qp-logo-grad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="22" fill="url(#qp-logo-grad)" />
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <line x1="48" y1="48" x2="26" y2="28" />
        <line x1="48" y1="48" x2="72" y2="30" />
        <line x1="48" y1="48" x2="48" y2="76" />
      </g>
      <circle cx="26" cy="28" r="7" fill="#fff" fillOpacity="0.85" />
      <circle cx="72" cy="30" r="7" fill="#fff" fillOpacity="0.85" />
      <circle cx="48" cy="76" r="7" fill="#fff" fillOpacity="0.85" />
      <circle cx="48" cy="48" r="11" fill="#fff" />
    </svg>
  );
}
