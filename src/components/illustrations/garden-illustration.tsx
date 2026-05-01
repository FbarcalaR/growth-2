/**
 * Decorative SVG used on the welcome step of the login page. Ported from the
 * prototype (`docs/prototype-design/login-page.jsx`) verbatim — sun, ground,
 * oak tree, cherry blossom, central tulip, daisy, mushroom, grass tufts.
 *
 * The colors are intentionally hardcoded inline. They aren't part of our
 * domain palette (these are illustration colors, not UI tokens) and lifting
 * them into `@theme` would inflate the token surface for one-shot art.
 * If we end up needing more illustrations sharing a palette, revisit.
 */
export function GardenIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 160"
      width="280"
      height="160"
      className={className}
      role="img"
      aria-label="A whimsical garden with a sun, trees, and flowers"
    >
      {/* Sky */}
      <rect width="280" height="160" fill="#F0F7E8" />
      {/* Sun */}
      <circle cx="240" cy="30" r="20" fill="#FDD835" opacity="0.7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={240 + 22 * Math.cos(r)}
            y1={30 + 22 * Math.sin(r)}
            x2={240 + 30 * Math.cos(r)}
            y2={30 + 30 * Math.sin(r)}
            stroke="#FDD835"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}
      {/* Ground */}
      <ellipse cx="140" cy="148" rx="130" ry="18" fill="#C8E6C9" />
      <ellipse cx="140" cy="145" rx="120" ry="14" fill="#A5D6A7" />
      {/* Path */}
      <ellipse cx="140" cy="148" rx="20" ry="8" fill="#D7CCC8" />
      {/* Oak tree (left) */}
      <rect x="38" y="95" width="8" height="50" rx="3" fill="#5D4037" />
      <circle cx="42" cy="76" r="24" fill="#2E7D32" />
      <circle cx="30" cy="82" r="16" fill="#388E3C" />
      <circle cx="54" cy="80" r="16" fill="#388E3C" />
      <circle cx="42" cy="62" r="14" fill="#43A047" />
      {/* Cherry blossom (right) */}
      <rect x="218" y="100" width="6" height="45" rx="2" fill="#9E9E9E" />
      <circle cx="200" cy="85" r="18" fill="#F48FB1" />
      <circle cx="218" cy="78" r="17" fill="#F06292" />
      <circle cx="233" cy="88" r="15" fill="#F48FB1" />
      <circle cx="218" cy="67" r="14" fill="#FCE4EC" />
      {/* Tulip (center) */}
      <line x1="140" y1="138" x2="140" y2="110" stroke="#4CAF50" strokeWidth="2.5" />
      <path d="M140,110 C134,102 132,94 140,88 C148,94 146,102 140,110Z" fill="#E91E63" />
      {/* Daisy (left of center) */}
      <line x1="110" y1="138" x2="110" y2="116" stroke="#4CAF50" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        const cx = 110 + Math.cos(r) * 7;
        const cy = 112 + Math.sin(r) * 7;
        return (
          <ellipse
            key={a}
            cx={cx}
            cy={cy}
            rx="3"
            ry="5"
            fill="white"
            transform={`rotate(${a},${cx},${cy})`}
          />
        );
      })}
      <circle cx="110" cy="112" r="4" fill="#FDD835" />
      {/* Mushroom (right of center) */}
      <rect x="167" y="128" width="8" height="12" rx="2" fill="#D7CCC8" />
      <ellipse cx="171" cy="127" rx="12" ry="9" fill="#EF5350" />
      <circle cx="167" cy="124" r="2" fill="white" />
      <circle cx="174" cy="122" r="2" fill="white" />
      {/* Grass tufts */}
      {[60, 85, 160, 185, 210, 240].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1="145"
            x2={x - 4}
            y2="134"
            stroke="#66BB6A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1="145"
            x2={x}
            y2="132"
            stroke="#4CAF50"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1="145"
            x2={x + 4}
            y2="135"
            stroke="#66BB6A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
