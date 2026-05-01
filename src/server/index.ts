// Importing this module from a client component will throw at build time.
// The barrel file isn't intended to be imported anywhere — it just registers
// the marker for the rest of the server tree.
import "server-only";
