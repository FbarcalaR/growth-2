"use client";

/**
 * Last-resort root error boundary. Renders only when an exception escapes the
 * standard `<ErrorBoundary>` (`app/error.tsx`) — typically a render-time
 * exception inside the root layout itself. Must include its own `<html>` /
 * `<body>` because the layout it'd normally inherit is the thing that
 * crashed. Story 8.2.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "48px 24px",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f4f7f0",
          color: "#1c2b20",
        }}
      >
        <div style={{ fontSize: 36 }} aria-hidden>
          🥀
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Growth crashed unexpectedly</h1>
        <p style={{ fontSize: 14, color: "#6b7f70", maxWidth: 360, margin: 0 }}>
          Something went very wrong before the app finished loading. Reload the page or come back in
          a minute.
        </p>
        {error.digest && (
          <p style={{ fontSize: 10, color: "#9eb09e", fontFamily: "monospace" }}>
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 8,
            padding: "10px 18px",
            border: "none",
            borderRadius: 999,
            background: "#3a6647",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
