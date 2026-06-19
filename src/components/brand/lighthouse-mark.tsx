import * as React from 'react';

/**
 * Light Bearers lighthouse glyph. The tower body uses `currentColor` so
 * callers set its color via text utilities. The lamp emits a teal glow
 * that radiates from the lamp and fades to transparent — the "light"
 * washes out into the surrounding color rather than reading as a solid
 * stroke.
 */
export function LighthouseMark({
  className,
  lightColor = '#1A6B6B',
}: {
  className?: string;
  lightColor?: string;
}) {
  // Unique IDs so multiple instances on a page don't collide.
  const uid = React.useId().replace(/:/g, '');
  const glowId = `lh-glow-${uid}`;
  const rayLeftId = `lh-ray-l-${uid}`;
  const rayRightId = `lh-ray-r-${uid}`;
  const haloId = `lh-halo-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Soft halo around the lamp — teal at center, fades to transparent. */}
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={lightColor} stopOpacity="0.55" />
          <stop offset="55%" stopColor={lightColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
        </radialGradient>

        {/* Left ray: solid teal at the lamp, fades out toward the tip. */}
        <linearGradient id={rayLeftId} x1="17" y1="5" x2="7" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={lightColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
        </linearGradient>

        {/* Right ray: mirror of the left. */}
        <linearGradient id={rayRightId} x1="7" y1="5" x2="17" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={lightColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
        </linearGradient>

        {/* Lamp room outline: teal at the bulb, easing back into currentColor. */}
        <linearGradient id={haloId} x1="12" y1="3" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={lightColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={lightColor} stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Glow halo behind the lamp — sits under everything else. */}
      <circle cx="12" cy="6" r="6" fill={`url(#${glowId})`} stroke="none" />

      {/* Tower base + body — inherits text color. */}
      <path d="M9 21h6" />
      <path d="M10 21l1-11h2l1 11" />
      <path d="M9.5 10h5" />
      <path d="M10 13.5h4" />
      <path d="M10 17h4" />

      {/* Lamp room + dome — teal that softens as it meets the tower. */}
      <g stroke={`url(#${haloId})`}>
        <path d="M10 10l.6-3.5h2.8L14 10" />
        <path d="M10.6 6.5h2.8" />
        <path d="M12 6.5V4" />
        <path d="M12 3a1 1 0 0 1 1 1h-2a1 1 0 0 1 1-1z" />
      </g>

      {/* Outgoing rays — teal at the lamp, washes to transparent at the tips. */}
      <path d="M10.6 6.5 7 5" stroke={`url(#${rayLeftId})`} />
      <path d="M13.4 6.5 17 5" stroke={`url(#${rayRightId})`} />
    </svg>
  );
}
