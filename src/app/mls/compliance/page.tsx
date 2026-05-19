import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { complianceActions, complianceIssues, listings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import ComplianceBulkPanel from "./ComplianceBulkPanel";
import {
  dismissIssueAction,
  recordActionAction,
  runSweepAction,
} from "./actions";

export const dynamic = "force-dynamic";

// Enforcement ladder, in escalation order (matches complianceActionType enum).
const LADDER = [
  { type: "flagged", label: "Flag", destructive: false },
  { type: "correction_requested", label: "Request correction", destructive: false },
  { type: "unpublished", label: "Unpublish", destructive: true },
  { type: "removed", label: "Remove", destructive: true, phrase: "REMOVE" },
  { type: "account_suspended", label: "Suspend account", destructive: true },
  {
    type: "account_terminated",
    label: "Terminate account",
    destructive: true,
    phrase: "TERMINATE",
  },
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
              <Link href="/mls/dashboard">← Dashboard</Link>
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

  const issueIds = rows.map((r) => r.id);
  const actions = issueIds.length
    ? await db
        .select()
        .from(complianceActions)
        .where(inArray(complianceActions.issueId, issueIds))
        .orderBy(desc(complianceActions.createdAt))
    : [];
  const actionsByIssue = new Map<string, typeof actions>();
  for (const a of actions) {
    const list = actionsByIssue.get(a.issueId) ?? [];
    list.push(a);
    actionsByIssue.set(a.issueId, list);
  }

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Compliance</h1>
      <p className="muted">
        Open issues needing an enforcement decision.
      </p>

      <form action={runSweepAction} style={{ margin: "1rem 0 1.5rem" }}>
        <button type="submit">Run compliance sweep</button>
      </form>

      {rows.length === 0 ? (
        <p className="muted">No open issues. Nothing needs a decision.</p>
      ) : (
        <>
        <ComplianceBulkPanel
          issues={rows.map((r) => ({
            id: r.id,
            type: r.type,
            listingRef: r.listingRef,
          }))}
        />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((issue) => {
            const history = actionsByIssue.get(issue.id) ?? [];
            return (
              <li
                key={issue.id}
                className="card"
                style={{ marginBottom: "1rem", background: "var(--surface)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong>{issue.type.replace(/_/g, " ")}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {issue.listingRef ?? "—"}
                      {issue.listingTitle ? ` · ${issue.listingTitle}` : ""} ·
                      opened{" "}
                      {issue.createdAt
                        ? new Date(issue.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <span className="badge badge--under_review">open</span>
                </div>
                <p style={{ margin: "0.6rem 0" }}>{issue.detail}</p>

                {history.length > 0 ? (
                  <ul className="timeline">
                    {history.map((a) => (
                      <li key={a.id}>
                        <strong>{a.actionType.replace(/_/g, " ")}</strong>{" "}
                        <span className="muted">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString()
                            : ""}
                          {a.note ? ` — ${a.note}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {LADDER.map((step) => (
                    <form
                      key={step.type}
                      action={recordActionAction}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <input type="hidden" name="issueId" value={issue.id} />
                      <input
                        type="hidden"
                        name="actionType"
                        value={step.type}
                      />
                      <input
                        type="text"
                        name="note"
                        required
                        placeholder="Note (required)"
                        style={{ flex: 1, minWidth: 200, margin: 0 }}
                      />
                      {step.destructive ? (
                        <ConfirmSubmit
                          label={step.label}
                          prompt={`${step.label}? This is enforced and audited.`}
                          typedPhrase={
                            "phrase" in step ? step.phrase : undefined
                          }
                        />
                      ) : (
                        <button type="submit">{step.label}</button>
                      )}
                    </form>
                  ))}

                  <form
                    action={dismissIssueAction}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "0.4rem",
                      borderTop: "1px solid var(--n-200)",
                      paddingTop: "0.6rem",
                    }}
                  >
                    <input type="hidden" name="issueId" value={issue.id} />
                    <input
                      type="text"
                      name="note"
                      required
                      placeholder="Dismiss reason (required)"
                      style={{ flex: 1, minWidth: 200, margin: 0 }}
                    />
                    <button type="submit" className="btn-outline">
                      Dismiss (false positive)
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
        </>
      )}
    </main>
  );
}
