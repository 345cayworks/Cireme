import type { Route } from "next";
import Link from "next/link";
import { desc, inArray, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import {
  applications,
  auditLog,
  complianceIssues,
  listings,
  memberships,
} from "@/db/schema";
import { can, type Role } from "@/lib/rbac";

export const dynamic = "force-dynamic";

async function countOf(
  table: typeof applications | typeof complianceIssues | typeof listings | typeof memberships,
  where: ReturnType<typeof inArray>,
) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(table)
    .where(where);
  return row?.n ?? 0;
}

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "public_user") as Role;

  const canMembers = can(role, "member:approve");
  const canCompliance = can(role, "compliance:review");
  const canModerate = can(role, "listing:moderate");

  const [appsOpen, issuesOpen, listingsPending, membersFlagged] =
    await Promise.all([
      canMembers
        ? countOf(applications, inArray(applications.status, ["submitted", "under_review"]))
        : Promise.resolve(0),
      canCompliance
        ? countOf(complianceIssues, inArray(complianceIssues.status, ["open"]))
        : Promise.resolve(0),
      canModerate
        ? countOf(listings, inArray(listings.status, ["pending"]))
        : Promise.resolve(0),
      canMembers
        ? countOf(memberships, inArray(memberships.status, ["suspended", "inactive"]))
        : Promise.resolve(0),
    ]);

  const needsApps = canMembers
    ? await db
        .select()
        .from(applications)
        .where(inArray(applications.status, ["submitted", "under_review"]))
        .orderBy(applications.createdAt)
        .limit(5)
    : [];

  const recent = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(8);

  const cards: { label: string; value: number; href: Route; alert?: boolean }[] =
    [];
  if (canMembers)
    cards.push({
      label: "Applications awaiting review",
      value: appsOpen,
      href: "/mls/members?tab=applications" as Route,
      alert: appsOpen > 0,
    });
  if (canCompliance)
    cards.push({
      label: "Open compliance issues",
      value: issuesOpen,
      href: "/mls/compliance" as Route,
      alert: issuesOpen > 0,
    });
  if (canModerate)
    cards.push({
      label: "Listings pending moderation",
      value: listingsPending,
      href: "/mls/listings?status=pending" as Route,
    });
  if (canMembers)
    cards.push({
      label: "Suspended / inactive members",
      value: membersFlagged,
      href: "/mls/members?tab=members&status=suspended" as Route,
    });

  const nothingPending =
    appsOpen === 0 && issuesOpen === 0 && listingsPending === 0;

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p className="muted">
        Signed in as {session?.user?.email} · {role.replace(/_/g, " ")}
      </p>

      {cards.length === 0 ? (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <p style={{ margin: 0 }}>
            Your work lives in <Link href="/mls/listings">Listings</Link>.
          </p>
        </div>
      ) : (
        <>
          <div className="statgrid">
            {cards.map((c) => (
              <Link key={c.label} href={c.href} className="stat-card">
                <div className="stat-card__label">{c.label}</div>
                <div
                  className={
                    c.alert
                      ? "stat-card__value stat-card__value--alert"
                      : "stat-card__value"
                  }
                >
                  {c.value}
                </div>
              </Link>
            ))}
          </div>

          {canMembers ? (
            <section style={{ marginTop: "2rem" }}>
              <h2>Needs you</h2>
              {needsApps.length === 0 ? (
                <p className="muted">
                  {nothingPending
                    ? "Nothing needs a decision right now."
                    : "No open applications."}
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Requested</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {needsApps.map((a) => (
                      <tr key={a.id}>
                        <td>{a.applicantEmail}</td>
                        <td>{a.requestedType.replace(/_/g, " ")}</td>
                        <td>
                          <span className={`badge badge--${a.status}`}>
                            {a.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="muted">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Link href={"/mls/members?tab=applications" as Route}>
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ) : null}
        </>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Recent activity</h2>
        {recent.length === 0 ? (
          <p className="muted">No recorded activity yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td>{(e.action ?? "—").replace(/_/g, " ")}</td>
                  <td className="muted">
                    {e.entity ?? "—"}
                    {e.entityId ? ` · ${e.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="muted">
                    {e.createdAt
                      ? new Date(e.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
