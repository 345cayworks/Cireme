import Link from "next/link";
import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import {
  STALE_AFTER_DAYS,
  detectListingIssues,
} from "@/lib/compliance-rules";

export const dynamic = "force-dynamic";

/**
 * Read-only staleness & accuracy analytics (U4). Runs the pure compliance
 * rules over current inventory WITHOUT opening issues — enforcement still
 * lives in Compliance (Run sweep). This is the "what would a sweep find"
 * dashboard.
 */
export default async function ReportsPage() {
  try {
    await requirePermission("listing:moderate");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Reports</h1>
          <div className="card">
            <p>Staleness &amp; accuracy reports are for moderators.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const rows = await db.select().from(listings).limit(1000);
  const ids = rows.map((r) => r.id);
  const media = ids.length
    ? await db
        .select()
        .from(listingMedia)
        .where(inArray(listingMedia.listingId, ids))
    : [];
  const mediaCount = new Map<string, number>();
  for (const m of media)
    mediaCount.set(m.listingId, (mediaCount.get(m.listingId) ?? 0) + 1);

  const now = new Date();
  const byType = new Map<string, number>();
  const flagged: { ref: string; title: string; type: string; detail: string }[] =
    [];
  for (const l of rows) {
    const issues = detectListingIssues(l, {
      mediaCount: mediaCount.get(l.id) ?? 0,
      now,
    });
    for (const i of issues) {
      byType.set(i.type, (byType.get(i.type) ?? 0) + 1);
      flagged.push({
        ref: l.publicReference,
        title: l.title,
        type: i.type,
        detail: i.detail,
      });
    }
  }

  const byStatus = new Map<string, number>();
  for (const l of rows)
    byStatus.set(l.status, (byStatus.get(l.status) ?? 0) + 1);

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Staleness &amp; accuracy</h1>
      <p className="muted" style={{ maxWidth: "70ch" }}>
        Read-only snapshot of what a compliance sweep would currently detect
        ({rows.length} listings scanned; “stale” = an active listing untouched
        for {STALE_AFTER_DAYS}+ days). No issues are opened here — act from{" "}
        <Link href="/mls/compliance">Compliance</Link>.
      </p>

      <div className="statgrid">
        <div className="stat-card">
          <div className="stat-card__label">Listings scanned</div>
          <div className="stat-card__value">{rows.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Would-flag issues</div>
          <div
            className={
              flagged.length
                ? "stat-card__value stat-card__value--alert"
                : "stat-card__value"
            }
          >
            {flagged.length}
          </div>
        </div>
        {[...byType.entries()].map(([t, n]) => (
          <div key={t} className="stat-card">
            <div className="stat-card__label">{t.replace(/_/g, " ")}</div>
            <div className="stat-card__value">{n}</div>
          </div>
        ))}
      </div>

      <h2>Inventory by status</h2>
      <div className="chipbar">
        {[...byStatus.entries()].map(([s, n]) => (
          <span key={s} className={`badge badge--${s}`}>
            {s.replace(/_/g, " ")} · {n}
          </span>
        ))}
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Flagged listings</h2>
      {flagged.length === 0 ? (
        <p className="muted">Nothing would be flagged — inventory is clean.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Title</th>
              <th>Issue</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((f, i) => (
              <tr key={`${f.ref}-${i}`}>
                <td>{f.ref}</td>
                <td>{f.title}</td>
                <td>
                  <span className="badge badge--under_review">
                    {f.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="muted">{f.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
