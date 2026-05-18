/**
 * Account-activation service. Admin approval provisions a *pending* account
 * with no usable password; the member redeems a single-use, expiring token
 * (delivered as an admin-relayed link) to set their own password and go
 * active. Credentials are never chosen or seen by an admin.
 *
 * Authority for issuing a link is enforced at the call site
 * (requirePermission("member:approve")); redemption is intentionally
 * unauthenticated but proven by possession of the token.
 */
import { and, eq, isNull } from "drizzle-orm";
import { hash } from "bcryptjs";

import { db } from "@/db";
import { activationTokens, auditLog, memberships, users } from "@/db/schema";
import {
  activationExpiry,
  generateRawToken,
  hashToken,
  isExpired,
  validatePassword,
} from "@/lib/activation-token";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class ActivationError extends Error {}

/**
 * Issues a fresh activation token for a user, superseding any prior unconsumed
 * token (an admin re-issuing a link invalidates the old one). Returns the raw
 * token — the only place it ever exists; only its hash is persisted.
 */
export async function issueActivationToken(
  userId: string,
  actorId: string,
): Promise<{ token: string; expiresAt: Date }> {
  return db.transaction(async (tx: Tx) => {
    const [user] = await tx
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new ActivationError("User not found.");
    if (user.status === "active") {
      throw new ActivationError("Account is already active.");
    }

    const now = new Date();
    // Supersede outstanding tokens so only the newest link works.
    await tx
      .update(activationTokens)
      .set({ consumedAt: now })
      .where(
        and(
          eq(activationTokens.userId, userId),
          isNull(activationTokens.consumedAt),
        ),
      );

    const token = generateRawToken();
    const expiresAt = activationExpiry(now);
    await tx.insert(activationTokens).values({
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    });
    await tx.insert(auditLog).values({
      actorId,
      entity: "user",
      entityId: userId,
      action: "activation_link_issued",
      after: { expiresAt },
    });

    return { token, expiresAt };
  });
}

/**
 * Redeems a token: sets the member's chosen password, activates the account
 * and its pending memberships, and consumes the token. Single-use and
 * expiry are enforced inside the transaction.
 */
export async function redeemActivationToken(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const pwError = validatePassword(newPassword);
  if (pwError) throw new ActivationError(pwError);

  await db.transaction(async (tx: Tx) => {
    const [row] = await tx
      .select()
      .from(activationTokens)
      .where(eq(activationTokens.tokenHash, hashToken(rawToken)))
      .limit(1);

    if (!row || row.consumedAt) {
      throw new ActivationError("This activation link is invalid or has already been used.");
    }
    if (isExpired(row.expiresAt)) {
      throw new ActivationError("This activation link has expired — ask an administrator for a new one.");
    }

    const now = new Date();
    const passwordHash = await hash(newPassword, 12);

    await tx
      .update(users)
      .set({ passwordHash, status: "active", updatedAt: now })
      .where(eq(users.id, row.userId));
    await tx
      .update(memberships)
      .set({ status: "active", updatedAt: now })
      .where(
        and(
          eq(memberships.userId, row.userId),
          eq(memberships.status, "pending"),
        ),
      );
    await tx
      .update(activationTokens)
      .set({ consumedAt: now })
      .where(eq(activationTokens.id, row.id));

    await tx.insert(auditLog).values({
      actorId: row.userId,
      entity: "user",
      entityId: row.userId,
      action: "account_activated",
      after: { status: "active" },
    });
  });
}
