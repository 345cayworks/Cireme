import type { Route } from "next";
import Link from "next/link";

import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import { listGroupListings, listRoster } from "@/lib/broker-service";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

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

export default async function GroupListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    await requirePermission("listing:edit:office");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Group listings</h1>
          <div className="card">
            <p>Your role does not have group listing visibility.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const { status } = await searchParams;
  const filter = (STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const me = await getCurrentUser();
  const [rows, roster] = me
    ? await Promise.all([listGroupListings(me), listRoster(me)])
    : [[], []];
  const nameById = new Map(roster.map((r) => [r.id, r.displayName]));

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <main>
      <p className="eyebrow">Brokerage</p>
      <h1 style={{ marginTop: 0 }}>Group listings</h1>
      <p className="muted">
        Listings authored by your roster or carrying your office. Read-only
        here — edit via{" "}
        <Link href="/mls/listings">Listings</Link> (you already have
        office-edit rights there).
      </p>

      <div className="chipbar">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              (s === "all"
                ? "/mls/group-listings"
                : `/mls/group-listings?status=${s}`) as Route
            }
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <p style={{ marginTop: 0 }}>No group listings yet.</p>
          <p className="muted" style={{ marginBottom: 0 }}>
            This view fills once agents are assigned to your brokerage/office
            and they create listings. Assignment is a separate backend step.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <p className="muted">No listings with status “{filter}”.</p>
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
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/listings/${r.id}` as Route}>{r.ref}</Link>
                </td>
                <td>{r.title}</td>
                <td className="muted">{r.district.replace(/_/g, " ")}</td>
                <td>
                  <span className={`badge badge--${r.status}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="muted">
                  {(r.agentId && nameById.get(r.agentId)) || "—"}
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>
                  {r.price ?? "—"}
                </td>
                <td className="muted">
                  {r.updatedAt
                    ? new Date(r.updatedAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
