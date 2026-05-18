import type { Route } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const ENTITIES = ["listing", "user", "membership", "application", "compliance_issue"];

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  try {
    await requirePermission("platform:admin");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Audit</h1>
          <div className="card">
            <p>The full audit log is restricted to super administrators.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const { entity } = await searchParams;
  const filter = ENTITIES.includes(entity ?? "") ? entity! : undefined;

  const rows = await db
    .select()
    .from(auditLog)
    .where(filter ? eq(auditLog.entity, filter) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Audit</h1>
      <p className="muted">
        Append-only record of every mutation. Read-only.
      </p>

      <div className="chipbar">
        <Link
          href={"/mls/audit" as Route}
          className="chip"
          aria-current={!filter ? "true" : undefined}
        >
          All
        </Link>
        {ENTITIES.map((e) => (
          <Link
            key={e}
            href={`/mls/audit?entity=${e}` as Route}
            className="chip"
            aria-current={filter === e ? "true" : undefined}
          >
            {e.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">No audit entries{filter ? ` for ${filter}` : ""}.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="muted">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </td>
                <td>{(r.action ?? "—").replace(/_/g, " ")}</td>
                <td className="muted">
                  {r.entity ?? "—"}
                  {r.entityId ? ` · ${r.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="muted">
                  {r.actorId ? r.actorId.slice(0, 8) : "system"}
                </td>
                <td>
                  {r.before || r.after ? (
                    <details>
                      <summary>view</summary>
                      <pre className="diff-json">
                        {JSON.stringify(
                          { before: r.before, after: r.after },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
