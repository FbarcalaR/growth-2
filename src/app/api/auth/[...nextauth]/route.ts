/**
 * Auth.js catch-all route — `/api/auth/signin`, `/api/auth/callback/google`,
 * `/api/auth/signout`, `/api/auth/session`, etc. The handlers come straight
 * from `src/auth.ts`'s NextAuth() factory.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
