/**
 * The Growth wordmark logo: a circular sage badge with a heart-leaf.
 * Ported from the prototype (`docs/prototype-design/login-page.jsx`). Used on
 * the welcome screen and reusable anywhere we want the brand mark.
 */
export function WelcomeLogo({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      role="img"
      aria-label="Growth"
      className={className}
    >
      <circle cx="26" cy="26" r="26" fill="var(--color-brand-700)" />
      <path
        d="M26,40 C26,40 14,30 14,20 C14,14 20,10 26,16 C32,10 38,14 38,20 C38,30 26,40 26,40Z"
        fill="var(--color-brand-500)"
      />
      <path
        d="M26,40 C26,40 20,30 22,20 C23,15 26,16 26,16 C26,16 29,15 30,20 C32,30 26,40 26,40Z"
        fill="#A5D6A7"
      />
      <line
        x1="26"
        y1="40"
        x2="26"
        y2="44"
        stroke="#A5D6A7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
