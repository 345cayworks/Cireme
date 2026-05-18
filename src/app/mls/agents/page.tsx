import Link from "next/link";

import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import { listRoster } from "@/lib/broker-service";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  try {
    await requirePermission("listing:edit:office");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>My agents</h1>
          <div className="card">
            <p>Your role does not manage a brokerage roster.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const me = await getCurrentUser();
  const roster = me ? await listRoster(me) : [];

  return (
    <main>
      <p className="eyebrow">Brokerage</p>
      <h1 style={{ marginTop: 0 }}>My agents</h1>
      <p className="muted">
        Agents managed by you, plus members sharing your office.
      </p>

      {roster.length === 0 ? (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p style={{ marginTop: 0 }}>No agents are linked to you yet.</p>
          <p className="muted" style={{ marginBottom: 0 }}>
            A roster appears once an administrator assigns agents to your
            brokerage or office. Agent↔broker assignment is a separate
            backend step and is intentionally not editable here.
          </p>
        </div>
      ) : (
        <table className="data-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((m) => (
              <tr key={m.id}>
                <td>{m.displayName}</td>
                <td className="muted">{m.email}</td>
                <td className="muted">{m.role.replace(/_/g, " ")}</td>
                <td>
                  <span className={`badge badge--${m.status}`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
