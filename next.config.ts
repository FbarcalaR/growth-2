import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Surface the Vercel build SHA to the client bundle so the Profile
    // "Check for updates" panel can compare it against the runtime
    // /api/version response. Falls back to "dev" outside of Vercel.
    NEXT_PUBLIC_BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
  },
};

export default nextConfig;
