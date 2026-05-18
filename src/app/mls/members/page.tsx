import type { Route } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  membershipStatusHistory,
  memberships,
  users,
} from "@/db/schema";
import {
  allowedAccountTransitions,
  allowedApplicationTransitions,
  type AccountStatus,
} from "@/lib/account-lifecycle";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import {
  membershipStatusAction,
  reviewApplicationAction,
} from "./actions";
import ActivationLink from "./ActivationLink";

export const dynamic = "force-dynamic";

const APP_STATES = [
  "open",
  "submitted",
  "under_review",
  "approved",
  "denied",
  "withdrawn",
] as const;
const MEMBER_STATES = ["all", "pending", "active", "suspended", "inactive"] as const;
const DESTRUCTIVE: ReadonlySet<AccountStatus> = new Set(["suspended", "inactive"]);

function tabHref(tab: string, extra = ""): Route {
  return `/mls/members?tab=${tab}${extra}` as Route;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  try {
    await requirePermission("member:approve");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Membership review</h1>
          <div className="card">
            <p>Your role cannot review memberships or applications.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const { tab, status } = await searchParams;
  const activeTab = tab === "members" ? "members" : "applications";

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Members &amp; applications</h1>

      <div className="chipbar" role="tablist">
        <Link
          href={tabHref("applications")}
          className="chip"
          aria-current={activeTab === "applications" ? "true" : undefined}
        >
          Applications
        </Link>
        <Link
          href={tabHref("members")}
          className="chip"
          aria-current={activeTab === "members" ? "true" : undefined}
        >
          Members
        </Link>
      </div>

      {activeTab === "applications"
        ? await ApplicationsTab(status)
        : await MembersTab(status)}
    </main>
  );
}

async function ApplicationsTab(status?: string) {
  const filter = (APP_STATES as readonly string[]).includes(status ?? "")
    ? status!
    : "open";
  const where =
    filter === "open"
      ? inArray(applications.status, ["submitted", "under_review"])
      : inArray(applications.status, [filter as "approved"]);

  const rows = await db
    .select()
    .from(applications)
    .where(where)
    .orderBy(desc(applications.createdAt))
    .limit(200);

  const applicantEmails = rows.map((r) => r.applicantEmail);
  const existing = applicantEmails.length
    ? await db
        .select({ email: users.email })
        .from(users)
        .where(inArray(users.email, applicantEmails))
    : [];
  const hasAccount = new Set(existing.map((u) => u.email));

  return (
    <>
      <div className="chipbar">
        {APP_STATES.map((s) => (
          <Link
            key={s}
            href={tabHref("applications", `&status=${s}`)}
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">No applications in this view.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((app) => {
            const meta = (app.metadata ?? {}) as Record<string, unknown>;
            const transitions = allowedApplicationTransitions(app.status);
            return (
              <li
                key={app.id}
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
                    <strong>{app.applicantEmail}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {app.requestedType.replace(/_/g, " ")} · submitted{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge badge--${app.status}`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>

                {Object.keys(meta).length > 0 ? (
                  <pre className="diff-json" style={{ marginTop: "0.75rem" }}>
                    {JSON.stringify(meta, null, 2)}
                  </pre>
                ) : null}

                {transitions.includes("approved") &&
                !hasAccount.has(app.applicantEmail) ? (
                  <p
                    className="disclaimer"
                    style={{ marginTop: "0.75rem" }}
                  >
                    No account exists for this email yet. Approving provisions
                    a <strong>pending</strong> account — you then generate a
                    set-password link from the Members tab and relay it to the
                    applicant. They cannot sign in until they redeem it.
                  </p>
                ) : null}

                {transitions.length === 0 ? (
                  <p
                    className="muted"
                    style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}
                  >
                    Terminal state — no further transitions.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginTop: "0.75rem",
                    }}
                  >
                    {transitions.map((to) => (
                      <form key={to} action={reviewApplicationAction}>
                        <input
                          type="hidden"
                          name="applicationId"
                          value={app.id}
                        />
                        <input type="hidden" name="toStatus" value={to} />
                        {to === "denied" || to === "withdrawn" ? (
                          <ConfirmSubmit
                            label={to === "denied" ? "Deny" : "Withdraw"}
                            prompt={`${to === "denied" ? "Deny" : "Withdraw"} this application? This is recorded.`}
                          />
                        ) : (
                          <button type="submit">
                            {to === "approved" ? "Approve" : "Move to review"}
                          </button>
                        )}
                      </form>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

async function MembersTab(status?: string) {
  const filter = (MEMBER_STATES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const baseWhere =
    filter === "all"
      ? inArray(memberships.status, ["pending", "active", "suspended", "inactive"])
      : inArray(memberships.status, [filter as AccountStatus]);

  const rows = await db
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      type: memberships.type,
      status: memberships.status,
      approvedAt: memberships.approvedAt,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      officeId: users.officeId,
    })
    .from(memberships)
    .leftJoin(users, eq(users.id, memberships.userId))
    .where(baseWhere)
    .orderBy(desc(memberships.createdAt))
    .limit(200);

  const ids = rows.map((r) => r.membershipId);
  const history = ids.length
    ? await db
        .select()
        .from(membershipStatusHistory)
        .where(inArray(membershipStatusHistory.membershipId, ids))
        .orderBy(desc(membershipStatusHistory.createdAt))
    : [];
  const historyByMembership = new Map<string, typeof history>();
  for (const h of history) {
    const list = historyByMembership.get(h.membershipId) ?? [];
    list.push(h);
    historyByMembership.set(h.membershipId, list);
  }

  return (
    <>
      <div className="chipbar">
        {MEMBER_STATES.map((s) => (
          <Link
            key={s}
            href={tabHref("members", `&status=${s}`)}
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">No members in this view.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((m) => {
            const transitions = allowedAccountTransitions(m.status);
            const rowHistory = historyByMembership.get(m.membershipId) ?? [];
            return (
              <li
                key={m.membershipId}
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
                    <strong>{m.displayName ?? m.email ?? "—"}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {m.email} · {m.type.replace(/_/g, " ")} · role:{" "}
                      {m.role ?? "—"}
                      {m.officeId ? ` · office ${m.officeId.slice(0, 8)}` : ""}
                    </div>
                  </div>
                  <span className={`badge badge--${m.status}`}>
                    {m.status}
                  </span>
                </div>

                {m.status === "pending" ? (
                  <div style={{ marginTop: "0.75rem" }}>
                    <span className="muted" style={{ fontSize: "0.85rem" }}>
                      Awaiting activation — relay a set-password link.
                    </span>
                    <ActivationLink userId={m.userId} />
                  </div>
                ) : null}

                {rowHistory.length > 0 ? (
                  <ul className="timeline" style={{ marginTop: "0.75rem" }}>
                    {rowHistory.map((h) => (
                      <li key={h.id}>
                        <strong>
                          {h.fromStatus ?? "—"} → {h.toStatus}
                        </strong>{" "}
                        <span className="muted">
                          {h.createdAt
                            ? new Date(h.createdAt).toLocaleString()
                            : ""}
                          {h.note ? ` — ${h.note}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {transitions.length === 0 ? (
                  <p
                    className="muted"
                    style={{ fontSize: "0.85rem", marginTop: "0.75rem" }}
                  >
                    Terminal state — no further transitions.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {transitions.map((to) => (
                      <form
                        key={to}
                        action={membershipStatusAction}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="hidden"
                          name="membershipId"
                          value={m.membershipId}
                        />
                        <input type="hidden" name="toStatus" value={to} />
                        <input
                          type="text"
                          name="note"
                          required
                          placeholder="Audit note (required)"
                          style={{ margin: 0, maxWidth: 280 }}
                        />
                        {DESTRUCTIVE.has(to) ? (
                          <ConfirmSubmit
                            label={`Set ${to}`}
                            prompt={`Set this member ${to}? Recorded in the audit log.`}
                            typedPhrase={to === "inactive" ? "INACTIVE" : undefined}
                          />
                        ) : (
                          <button type="submit">Set {to}</button>
                        )}
                      </form>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
