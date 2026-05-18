import type { Route } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  listingPriceHistory,
  listingStatusHistory,
  listings,
  users,
} from "@/db/schema";

const STATUSES = [
  "all",
  "draft",
  "incomplete",
  "active",
  "pending",
  "withdrawn",
  "expired",
  "off_market",
  "sold",
  "canceled",
] as const;

export default async function ListingModeration({
  status,
}: {
  status?: string;
}) {
  const filter = (STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const rows = await db
    .select({
      id: listings.id,
      ref: listings.publicReference,
      title: listings.title,
      district: listings.district,
      status: listings.status,
      price: listings.priceKyd,
      privateRemarks: listings.privateRemarks,
      updatedAt: listings.updatedAt,
      agentEmail: users.email,
      officeId: listings.officeId,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.agentId))
    .where(
      filter === "all"
        ? undefined
        : eq(listings.status, filter as "active"),
    )
    .orderBy(desc(listings.updatedAt))
    .limit(200);

  const ids = rows.map((r) => r.id);
  const [sHist, pHist] = await Promise.all([
    ids.length
      ? db
          .select()
          .from(listingStatusHistory)
          .where(inArray(listingStatusHistory.listingId, ids))
          .orderBy(desc(listingStatusHistory.createdAt))
      : Promise.resolve([]),
    ids.length
      ? db
          .select()
          .from(listingPriceHistory)
          .where(inArray(listingPriceHistory.listingId, ids))
          .orderBy(desc(listingPriceHistory.createdAt))
      : Promise.resolve([]),
  ]);
  const sBy = new Map<string, typeof sHist>();
  for (const h of sHist) {
    const l = sBy.get(h.listingId) ?? [];
    l.push(h);
    sBy.set(h.listingId, l);
  }
  const pBy = new Map<string, typeof pHist>();
  for (const h of pHist) {
    const l = pBy.get(h.listingId) ?? [];
    l.push(h);
    pBy.set(h.listingId, l);
  }

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Listings — moderation</h1>
      <p className="muted">
        All listings, read-only. Enforcement (unpublish, remove, account
        action) is applied from{" "}
        <Link href="/mls/compliance">Compliance</Link> against an open issue —
        run a sweep there to raise issues. Authoring stays with the agent.
      </p>

      <div className="chipbar">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              (s === "all"
                ? "/mls/listings"
                : `/mls/listings?status=${s}`) as Route
            }
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">No listings in this view.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Title</th>
              <th>District</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Price (KYD)</th>
              <th>Updated</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rs = sBy.get(r.id) ?? [];
              const rp = pBy.get(r.id) ?? [];
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/listings/${r.id}` as Route}>{r.ref}</Link>
                  </td>
                  <td>{r.title}</td>
                  <td className="muted">
                    {r.district.replace(/_/g, " ")}
                  </td>
                  <td>
                    <span className={`badge badge--${r.status}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="muted">{r.agentEmail ?? "—"}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {r.price ?? "—"}
                  </td>
                  <td className="muted">
                    {r.updatedAt
                      ? new Date(r.updatedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <details>
                      <summary>view</summary>
                      <div style={{ marginTop: "0.5rem", minWidth: 280 }}>
                        <strong style={{ fontSize: "0.8rem" }}>
                          Private remarks
                        </strong>
                        <p style={{ margin: "0.2rem 0 0.6rem" }}>
                          {r.privateRemarks ?? (
                            <span className="muted">none</span>
                          )}
                        </p>
                        <strong style={{ fontSize: "0.8rem" }}>
                          Status history
                        </strong>
                        {rs.length ? (
                          <ul className="timeline">
                            {rs.map((h) => (
                              <li key={h.id}>
                                {h.fromStatus ?? "—"} → {h.toStatus}{" "}
                                <span className="muted">
                                  {h.createdAt
                                    ? new Date(h.createdAt).toLocaleString()
                                    : ""}
                                  {h.note ? ` — ${h.note}` : ""}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted" style={{ margin: "0.2rem 0" }}>
                            none
                          </p>
                        )}
                        <strong style={{ fontSize: "0.8rem" }}>
                          Price history
                        </strong>
                        {rp.length ? (
                          <ul className="timeline">
                            {rp.map((h) => (
                              <li key={h.id}>
                                {h.oldPriceKyd ?? "—"} → {h.newPriceKyd}{" "}
                                <span className="muted">
                                  {h.createdAt
                                    ? new Date(h.createdAt).toLocaleString()
                                    : ""}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted" style={{ margin: "0.2rem 0" }}>
                            none
                          </p>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
