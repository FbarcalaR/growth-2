import "next-auth";

/**
 * Auth.js doesn't ship `user.id` on the session by default — only `email`,
 * `name`, `image`. We copy the DB user-id onto both the JWT and the session
 * via callbacks in `src/auth.ts`; this declaration makes that visible to
 * TypeScript at the call sites (`session?.user?.id` in `requireUser`).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
  }
}
