/**
 * Super-admin bootstrap. Provisions (or rotates) the single platform
 * super-admin account from environment secrets:
 *
 *   SUPER_ADMIN_EMAIL     — the super-admin login email
 *   SUPERADMIN_MASTER_KEY — the master key; becomes the account password
 *                           (stored only as a bcrypt hash, never in plaintext)
 *
 * Run:  npm run db:bootstrap-admin
 *
 * Idempotent: re-running upserts the account and rotates the credential to the
 * current master key. Requires DATABASE_URL (and AUTH_SECRET, since the db
 * client loads the validated env). The master key is never logged.
 */
import { hash } from "bcryptjs";
import { z } from "zod";

import { db } from "@/db";
import { auditLog, users } from "@/db/schema";

const schema = z.object({
  email: z.string().email("SUPER_ADMIN_EMAIL must be a valid email"),
  masterKey: z
    .string()
    .min(16, "SUPERADMIN_MASTER_KEY must be at least 16 characters"),
});

async function main() {
  const parsed = schema.safeParse({
    email: process.env.SUPER_ADMIN_EMAIL,
    masterKey: process.env.SUPERADMIN_MASTER_KEY,
  });

  if (!parsed.success) {
    console.error("Super-admin bootstrap aborted:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.message}`);
    }
    process.exit(1);
  }

  const { email, masterKey } = parsed.data;
  const passwordHash = await hash(masterKey, 12);

  const [account] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      displayName: "Super Admin",
      role: "super_admin",
      status: "active",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash,
        role: "super_admin",
        status: "active",
        updatedAt: new Date(),
      },
    })
    .returning();

  await db.insert(auditLog).values({
    actorId: account!.id,
    entity: "user",
    entityId: account!.id,
    action: "super_admin_bootstrapped",
    after: { email, role: "super_admin", status: "active" },
  });

  console.log(
    `Super-admin ready: ${email} (role: super_admin, status: active).`,
  );
  console.log("Sign in at /mls/login with that email and the master key.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
