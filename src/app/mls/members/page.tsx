import { desc, inArray } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { applications, memberships } from "@/db/schema";
import { allowedApplicationTransitions } from "@/lib/account-lifecycle";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import {
  membershipStatusAction,
  reviewApplicationAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
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
              <Link href="/mls/dashboard">← Back to MLS Core</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const pendingApps = await db
    .select()
    .from(applications)
    .where(inArray(applications.status, ["submitted", "under_review"]))
    .orderBy(desc(applications.createdAt))
    .limit(200);

  const activeMemberships = await db
    .select()
    .from(memberships)
    .where(inArray(memberships.status, ["pending", "active", "suspended"]))
    .orderBy(desc(memberships.createdAt))
    .limit(200);

  return (
    <main>
      <p className="muted">
        <Link href="/mls/dashboard">← MLS Core</Link>
      </p>
      <h1>Membership review</h1>

      <h2>Applications</h2>
      {pendingApps.length === 0 ? (
        <p className="muted">No open applications.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pendingApps.map((app) => (
            <li key={app.id} className="card" style={{ marginBottom: "1rem" }}>
              <div>
                <strong>{app.applicantEmail}</strong>{" "}
                <span className="muted">
                  · {app.requestedType} · {app.status}
                </span>
              </div>
              <form
                action={reviewApplicationAction}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <input type="hidden" name="applicationId" value={app.id} />
                <select name="toStatus" required>
                  {allowedApplicationTransitions(app.status).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit">Apply</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Memberships</h2>
      {activeMemberships.length === 0 ? (
        <p className="muted">No memberships.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activeMemberships.map((m) => (
            <li key={m.id} className="card" style={{ marginBottom: "1rem" }}>
              <div>
                <span className="muted">
                  {m.type} · status: {m.status}
                </span>
              </div>
              <form
                action={membershipStatusAction}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginTop: "0.5rem",
                }}
              >
                <input type="hidden" name="membershipId" value={m.id} />
                <select name="toStatus" required>
                  {["active", "suspended", "inactive"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="note"
                  placeholder="Note (optional)"
                  style={{ margin: 0, maxWidth: 220 }}
                />
                <button type="submit">Change status</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
