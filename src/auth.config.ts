import type { NextAuthConfig } from "next-auth";

import { isMlsRole, type Role } from "@/lib/rbac";

/**
 * Edge-safe Auth.js config (no database or Node APIs). Shared by middleware
 * and the full server config in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/mls/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "public_user";
        token.status = (user as { status?: string }).status ?? "pending";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as Role) ?? "public_user";
        session.user.status = (token.status as string) ?? "pending";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isMlsArea =
        request.nextUrl.pathname.startsWith("/mls") &&
        request.nextUrl.pathname !== "/mls/login";
      if (!isMlsArea) return true;
      const role = auth?.user?.role as Role | undefined;
      return Boolean(auth) && isMlsRole(role);
    },
  },
  providers: [],
} satisfies NextAuthConfig;
