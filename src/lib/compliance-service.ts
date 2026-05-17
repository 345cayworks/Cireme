/**
 * Compliance + moderation service (Phase 5).
 *
 * - runComplianceSweep: feeds every listing through the pure rule engine and
 *   opens a compliance_issue for each new finding (idempotent: an existing
 *   open issue of the same type for the same listing is not re-raised).
 * - recordComplianceAction: appends a compliance_action, applies the
 *   enforcement side effect, and resolves the issue when the action is
 *   terminal. Each call is one transaction so the action, its enforcement,
 *   and the audit row commit together.
 */
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLog,
  complianceActions,
  complianceIssues,
  listingMedia,
  listings,
  users,
} from "@/db/schema";
import {
  detectDuplicates,
  detectListingIssues,
  type DetectedIssue,
} from "@/lib/compliance-rules";

type ActionType = (typeof complianceActions.$inferSelect)["actionType"];
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class ComplianceIssueNotFoundError extends Error {
  readonly issueId: string;
  constructor(issueId: string) {
    super(`Compliance issue not found: ${issueId}`);
    this.name = "ComplianceIssueNotFoundError";
    this.issueId = issueId;
  }
}

async function mediaCounts(tx: Tx): Promise<Map<string, number>> {
  const rows = await tx
    .select({
      listingId: listingMedia.listingId,
      n: sql<number>`count(*)::int`,
    })
    .from(listingMedia)
    .groupBy(listingMedia.listingId);
  return new Map(rows.map((r) => [r.listingId, r.n]));
}

export type SweepSummary = {
  scanned: number;
  detected: number;
  opened: number;
};

export async function runComplianceSweep(
  actorId: string,
): Promise<SweepSummary> {
  const now = new Date();

  return db.transaction(async (tx) => {
    const allListings = await tx.select().from(listings);
    const media = await mediaCounts(tx);

    const detected: DetectedIssue[] = [];
    for (const listing of allListings) {
      detected.push(
        ...detectListingIssues(listing, {
          mediaCount: media.get(listing.id) ?? 0,
          now,
        }),
      );
    }
    detected.push(...detectDuplicates(allListings));

    const openRows = await tx
      .select({
        listingId: complianceIssues.listingId,
        type: complianceIssues.type,
      })
      .from(complianceIssues)
      .where(eq(complianceIssues.status, "open"));
    const existing = new Set(
      openRows.map((r) => `${r.listingId}|${r.type}`),
    );

    let opened = 0;
    for (const issue of detected) {
      const key = `${issue.listingId}|${issue.type}`;
      if (existing.has(key)) continue;
      existing.add(key);

      await tx.insert(complianceIssues).values({
        listingId: issue.listingId,
        type: issue.type,
        detail: issue.detail,
        status: "open",
      });
      await tx.insert(auditLog).values({
        actorId,
        entity: "listing",
        entityId: issue.listingId,
        action: "compliance_issue_opened",
        after: { type: issue.type, detail: issue.detail },
      });
      opened += 1;
    }

    return {
      scanned: allListings.length,
      detected: detected.length,
      opened,
    };
  });
}

const RESOLVING_ACTIONS: ReadonlySet<ActionType> = new Set([
  "unpublished",
  "removed",
  "account_suspended",
  "account_terminated",
]);

async function applyEnforcement(
  tx: Tx,
  actionType: ActionType,
  listingId: string | null,
  actorId: string,
): Promise<void> {
  if (actionType === "unpublished" && listingId) {
    await tx
      .update(listings)
      .set({ status: "off_market", updatedAt: new Date() })
      .where(eq(listings.id, listingId));
    return;
  }
  if (actionType === "removed" && listingId) {
    await tx
      .update(listings)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(eq(listings.id, listingId));
    return;
  }

  if (
    actionType === "account_suspended" ||
    actionType === "account_terminated"
  ) {
    if (!listingId) return;
    const [listing] = await tx
      .select({ agentId: listings.agentId })
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);
    if (!listing?.agentId) return;
    const status =
      actionType === "account_suspended" ? "suspended" : "inactive";
    await tx
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, listing.agentId));
    await tx.insert(auditLog).values({
      actorId,
      entity: "user",
      entityId: listing.agentId,
      action: `account_${status}`,
      after: { status },
    });
  }
}

export async function recordComplianceAction(params: {
  issueId: string;
  actionType: ActionType;
  actorId: string;
  note?: string;
}) {
  const { issueId, actionType, actorId, note } = params;

  return db.transaction(async (tx) => {
    const [issue] = await tx
      .select()
      .from(complianceIssues)
      .where(eq(complianceIssues.id, issueId))
      .limit(1);
    if (!issue) throw new ComplianceIssueNotFoundError(issueId);

    const [action] = await tx
      .insert(complianceActions)
      .values({
        issueId,
        actionType,
        actorId,
        note: note ?? null,
      })
      .returning();

    await applyEnforcement(tx, actionType, issue.listingId, actorId);

    if (RESOLVING_ACTIONS.has(actionType) && issue.status === "open") {
      await tx
        .update(complianceIssues)
        .set({ status: "resolved", resolvedAt: new Date() })
        .where(eq(complianceIssues.id, issueId));
    }

    await tx.insert(auditLog).values({
      actorId,
      entity: "compliance_issue",
      entityId: issueId,
      action: "compliance_action",
      before: { status: issue.status },
      after: { actionType },
    });

    return action;
  });
}

/** Dismiss a non-actionable open issue (false positive). */
export async function dismissComplianceIssue(params: {
  issueId: string;
  actorId: string;
  note?: string;
}) {
  const { issueId, actorId, note } = params;

  return db.transaction(async (tx) => {
    const [issue] = await tx
      .select()
      .from(complianceIssues)
      .where(
        and(
          eq(complianceIssues.id, issueId),
          inArray(complianceIssues.status, ["open"]),
        ),
      )
      .limit(1);
    if (!issue) throw new ComplianceIssueNotFoundError(issueId);

    await tx
      .update(complianceIssues)
      .set({ status: "dismissed", resolvedAt: new Date() })
      .where(eq(complianceIssues.id, issueId));

    await tx.insert(auditLog).values({
      actorId,
      entity: "compliance_issue",
      entityId: issueId,
      action: "compliance_issue_dismissed",
      before: { status: "open" },
      after: { status: "dismissed", note: note ?? null },
    });

    return { id: issueId, status: "dismissed" as const };
  });
}
