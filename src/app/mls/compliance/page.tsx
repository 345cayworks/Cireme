import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { complianceIssues, listings } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import {
  dismissIssueAction,
  recordActionAction,
  runSweepAction,
} from "./actions";

export const dynamic = "force-dynamic";

const ACTION_TYPES = [
  "flagged",
  "correction_requested",
  "unpublished",
  "removed",
  "account_suspended",
  "account_terminated",
] as const;

export default async function CompliancePage() {
  try {
    await requirePermission("compliance:review");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Compliance</h1>
          <div className="card">
            <p>
              Your role does not have compliance review access. Contact an MLS
              administrator.
            </p>
            <p className="muted">
              <Link href="/mls/dashboard">← Back to MLS Core</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const rows = await db
    .select({
      id: complianceIssues.id,
      type: complianceIssues.type,
      detail: complianceIssues.detail,
      createdAt: complianceIssues.createdAt,
      listingRef: listings.publicReference,
      listingTitle: listings.title,
    })
    .from(complianceIssues)
    .leftJoin(listings, eq(complianceIssues.listingId, listings.id))
    .where(eq(complianceIssues.status, "open"))
    .orderBy(desc(complianceIssues.createdAt))
    .limit(200);

  return (
    <main>
      <p className="muted">
        <Link href="/mls/dashboard">← MLS Core</Link>
      </p>
      <h1>Compliance — open issues</h1>

      <form action={runSweepAction} style={{ margin: "1rem 0 1.5rem" }}>
        <button type="submit">Run compliance sweep</button>
      </form>

      {rows.length === 0 ? (
        <p className="muted">No open issues.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((issue) => (
            <li
              key={issue.id}
              className="card"
              style={{ marginBottom: "1rem" }}
            >
              <div>
                <strong>{issue.type}</strong>{" "}
                <span className="muted">
                  · {issue.listingRef ?? "—"}
                  {issue.listingTitle ? ` · ${issue.listingTitle}` : ""}
                </span>
              </div>
              <p style={{ margin: "0.4rem 0" }}>{issue.detail}</p>
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                Opened {issue.createdAt.toISOString()}
              </p>

              <form
                action={recordActionAction}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginTop: "0.5rem",
                }}
              >
                <input type="hidden" name="issueId" value={issue.id} />
                <select name="actionType" required>
                  {ACTION_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="note"
                  placeholder="Note (optional)"
                  style={{ flex: 1, minWidth: 180, margin: 0 }}
                />
                <button type="submit">Apply</button>
              </form>

              <form
                action={dismissIssueAction}
                style={{ marginTop: "0.5rem" }}
              >
                <input type="hidden" name="issueId" value={issue.id} />
                <input
                  type="text"
                  name="note"
                  placeholder="Dismiss reason (optional)"
                  style={{ maxWidth: 280, margin: "0 0.5rem 0 0" }}
                />
                <button
                  type="submit"
                  style={{ background: "#555", color: "#fff" }}
                >
                  Dismiss (false positive)
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
