import type { MetadataRoute } from "next";

/**
 * Web App Manifest. Next.js serves this at `/manifest.webmanifest` and
 * auto-injects the `<link rel="manifest">` tag, so installable surfaces
 * (Chrome's "Install app" omnibox button, the iOS Add-to-Home-Screen
 * sheet, the Android WebAPK installer) all pick it up.
 *
 * Icon strategy: SVG icons in `/public/icon-{192,512,maskable}.svg`.
 * Chrome 119+ / Edge / Safari 17 all accept SVG manifest icons. Older
 * Chromium ships a fallback rasterisation, so we're not losing anything
 * vs. shipping PNGs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Growth",
    short_name: "Growth",
    description: "A gamified life planner. Set priorities, plant goals, watch them bloom.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f7f0",
    theme_color: "#3a6647",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
