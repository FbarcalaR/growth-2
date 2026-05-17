import { NextResponse } from "next/server";

/**
 * Build identifier endpoint. The client polls this on a timer; when the
 * returned `sha` differs from the one captured at first mount, a new
 * deployment has shipped and we surface the "update available" banner.
 *
 * Vercel sets `VERCEL_GIT_COMMIT_SHA` at build + runtime, so the value is
 * deploy-stable on production / preview without any extra env config. In
 * local dev (no SHA), we return the constant `"dev"` so the banner stays
 * silent.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";
  return NextResponse.json({ sha });
}
