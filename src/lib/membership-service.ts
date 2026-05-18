/**
 * Membership & application service (Phase 2). Applies the account/application
 * state machines and records membership status history + the immutable audit
 * log. Each mutation is one transaction (Neon Pool driver).
 *
 * Authority is enforced at the call site (server actions) via
 * requirePermission("member:approve"); this layer trusts its actorId, like the
 * listing and compliance services.
 */
import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

import { db } from "@/db";
import {
  applications,
  auditLog,
  membershipStatusHistory,
  memberships,
  users,
} from "@/db/schema";

type MembershipType = (typeof memberships.$inferInsert)["type"];
type UserRole = (typeof users.$inferInsert)["role"];

/**
 * The role an approved applicant's account is provisioned with. Mirrors the
 * existing RBAC matrix (rbac.ts): a private seller needs only own-listing
 * rights (= agent), an independent broker needs office-listing rights
 * (= broker), an advertiser has no MLS access (= advertiser). Changing
 * product intent here is a one-line, audited decision.
 */
export function roleForMembershipType(type: MembershipType): UserRole {
  switch (type) {
    case "independent_broker":
      return "broker";
    case "advertiser":
      return "advertiser";
    case "private_seller":
      return "agent";
  }
}
import {
  AccountTransitionError,
  ApplicationTransitionError,
  canTransitionAccount,
  canTransitionApplication,
  type AccountStatus,
  type ApplicationStatus,
} from "@/lib/account-lifecycle";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class ApplicationNotFoundError extends Error {
  readonly applicationId: string;
  constructor(applicationId: string) {
    super(`Application not found: ${applicationId}`);
    this.name = "ApplicationNotFoundError";
    this.applicationId = applicationId;
  }
}

export class MembershipNotFoundError extends Error {
  readonly membershipId: string;
  constructor(membershipId: string) {
    super(`Membership not found: ${membershipId}`);
    this.name = "MembershipNotFoundError";
    this.membershipId = membershipId;
  }
}

export async function transitionMembershipStatus(params: {
  membershipId: string;
  toStatus: AccountStatus;
  actorId: string;
  note?: string;
}) {
  const { membershipId, toStatus, actorId, note } = params;

  return db.transaction(async (tx: Tx) => {
    const [membership] = await tx
      .select()
      .from(memberships)
      .where(eq(memberships.id, membershipId))
      .limit(1);
    if (!membership) throw new MembershipNotFoundError(membershipId);

    const fromStatus = membership.status;
    if (fromStatus === toStatus) return membership;
    if (!canTransitionAccount(fromStatus, toStatus)) {
      throw new AccountTransitionError(fromStatus, toStatus);
    }

    const [updated] = await tx
      .update(memberships)
      .set({ status: toStatus, updatedAt: new Date() })
      .where(eq(memberships.id, membershipId))
      .returning();

    await tx.insert(membershipStatusHistory).values({
      membershipId,
      fromStatus,
      toStatus,
      changedBy: actorId,
      note: note ?? null,
    });

    await tx.insert(auditLog).values({
      actorId,
      entity: "membership",
      entityId: membershipId,
      action: "membership_status_change",
      before: { status: fromStatus },
      after: { status: toStatus },
    });

    return updated;
  });
}

export async function setUserAccountStatus(params: {
  userId: string;
  toStatus: AccountStatus;
  actorId: string;
}) {
  const { userId, toStatus, actorId } = params;

  return db.transaction(async (tx: Tx) => {
    const [user] = await tx
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new Error(`User not found: ${userId}`);

    if (user.status === toStatus) return;
    if (!canTransitionAccount(user.status, toStatus)) {
      throw new AccountTransitionError(user.status, toStatus);
    }

    await tx
      .update(users)
      .set({ status: toStatus, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await tx.insert(auditLog).values({
      actorId,
      entity: "user",
      entityId: userId,
      action: "account_status_change",
      before: { status: user.status },
      after: { status: toStatus },
    });
  });
}

/**
 * Transitions an application. On `approved`, if a user already exists for the
 * applicant email, a membership of the requested type is created (active) and
 * the user account is activated. User provisioning/credentials are out of
 * scope for this service.
 */
/**
 * Creates a new partner/membership application (public, no auth). No account
 * is created at apply time — that happens only on admin approval.
 */
export async function createApplication(input: {
  applicantEmail: string;
  requestedType: (typeof memberships.$inferInsert)["type"];
  metadata: Record<string, unknown>;
}) {
  return db.transaction(async (tx: Tx) => {
    const [created] = await tx
      .insert(applications)
      .values({
        applicantEmail: input.applicantEmail,
        requestedType: input.requestedType,
        status: "submitted",
        metadata: input.metadata,
      })
      .returning();
    await tx.insert(auditLog).values({
      actorId: null,
      entity: "application",
      entityId: created!.id,
      action: "application_submitted",
      after: {
        requestedType: input.requestedType,
        status: "submitted",
      },
    });
    return created!;
  });
}

export async function transitionApplication(params: {
  applicationId: string;
  toStatus: ApplicationStatus;
  actorId: string;
}) {
  const { applicationId, toStatus, actorId } = params;

  return db.transaction(async (tx: Tx) => {
    const [application] = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!application) throw new ApplicationNotFoundError(applicationId);

    const fromStatus = application.status;
    if (fromStatus === toStatus) return application;
    if (!canTransitionApplication(fromStatus, toStatus)) {
      throw new ApplicationTransitionError(fromStatus, toStatus);
    }

    const now = new Date();
    const [updated] = await tx
      .update(applications)
      .set({
        status: toStatus,
        reviewedBy: actorId,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(applications.id, applicationId))
      .returning();

    if (toStatus === "approved") {
      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, application.applicantEmail))
        .limit(1);

      if (existing) {
        // Account already exists (and has credentials) — activate it now.
        await tx.insert(memberships).values({
          userId: existing.id,
          type: application.requestedType,
          status: "active",
          approvedBy: actorId,
          approvedAt: now,
        });
        await tx
          .update(users)
          .set({ status: "active", updatedAt: now })
          .where(eq(users.id, existing.id));
      } else {
        // Provision a *pending* account with an unusable random password.
        // The member sets their own password by redeeming an activation
        // link (admin-relayed); only then do account + membership go active.
        const metadata = (application.metadata ?? {}) as {
          displayName?: unknown;
        };
        const displayName =
          typeof metadata.displayName === "string" &&
          metadata.displayName.trim()
            ? metadata.displayName.trim()
            : application.applicantEmail.split("@")[0]!;
        const unusable = await hash(randomBytes(32).toString("base64url"), 12);

        const [created] = await tx
          .insert(users)
          .values({
            email: application.applicantEmail,
            passwordHash: unusable,
            displayName,
            role: roleForMembershipType(application.requestedType),
            status: "pending",
          })
          .returning({ id: users.id });

        await tx.insert(memberships).values({
          userId: created!.id,
          type: application.requestedType,
          status: "pending",
          approvedBy: actorId,
          approvedAt: now,
        });
        await tx.insert(auditLog).values({
          actorId,
          entity: "user",
          entityId: created!.id,
          action: "account_provisioned",
          after: { status: "pending", role: roleForMembershipType(application.requestedType) },
        });
      }
    }

    await tx.insert(auditLog).values({
      actorId,
      entity: "application",
      entityId: applicationId,
      action: "application_status_change",
      before: { status: fromStatus },
      after: { status: toStatus },
    });

    return updated;
  });
}
