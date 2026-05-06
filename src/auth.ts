import NextAuth from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { newId } from "@/server/services/ids";
import { prisma } from "@/server/repositories/prisma/client";

/**
 * Auth.js (NextAuth v5) config (Epic B).
 *
 * Strategy notes:
 * - **JWT sessions** — stateless, no DB hit per request. Trade-off: server-
 *   side revocation isn't instant. Personal-productivity app, fine for now.
 * - **PrismaAdapter** — User/Account/VerificationToken still live in Postgres
 *   so OAuth links survive across devices. Session DB rows are unused while
 *   we run JWT, but the schema is ready for a flip without a new migration.
 * - **`allowDangerousEmailAccountLinking: true`** on Google — safe because
 *   Google always verifies the email it returns. Prevents the "I signed up
 *   with email then later wanted to add Google" account-fragmentation issue.
 * - **`generateId`** — Auth.js's default uses crypto.randomUUID. We override
 *   to keep the existing `user_<base36>` prefix the rest of the codebase
 *   uses for consistency in logs / DB inspections.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...PrismaAdapter(prisma),
    async createUser(data: AdapterUser): Promise<AdapterUser> {
      // Auth.js's default createUser doesn't know about our domain columns
      // (createdAt as a BigInt, defaults for shopCoins / wheelOfLife).
      // Override to mint a fresh row that satisfies both shapes.
      const fallbackName = data.email?.split("@")[0] ?? "Player";
      const user = await prisma.user.create({
        data: {
          id: newId("user"),
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image ?? null,
          name: data.name ?? fallbackName,
          createdAt: BigInt(Date.now()),
          shopCoins: 0,
          totalCoinsEarned: 0,
          streak: 0,
          wheelOfLife: {},
          prioritiesLocked: false,
        },
      });
      // Auth.js's `AdapterUser` requires `email: string`; our column is
      // nullable for the dev-stub legacy. Coerce here — Auth.js never lands
      // a user without an email via Google anyway.
      return {
        id: user.id,
        email: user.email ?? "",
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
      };
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // The JWT and session callbacks copy the DB user-id onto the JWT and
    // expose it on the session. `requireUser()` reads `session.user.id`
    // to look up the domain User record on every API call.
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
