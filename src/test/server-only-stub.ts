// Empty module — Vitest aliases `server-only` to this so integration tests can
// import server modules without tripping the Next.js client-import guard. The
// real `server-only` package is still pinned in dependencies and used in
// production / `next build`.
export {};
