import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { db } from "@/db";
import { users } from "@/db/schema";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const [account] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!account) return null;
        if (account.status !== "active") return null;

        const ok = await compare(password, account.passwordHash);
        if (!ok) return null;

        return {
          id: account.id,
          email: account.email,
          name: account.displayName,
          role: account.role,
          status: account.status,
        };
      },
    }),
  ],
});
