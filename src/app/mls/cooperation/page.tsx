import type { Route } from "next";
import Link from "next/link";

import { NotMlsMemberError, requireMlsMember } from "@/lib/auth-guard";
import { listCooperationListings } from "@/lib/cooperation-service";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "active", "pending", "sold"] as const;

export default async function CooperationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  try {
    await requireMlsMember();
  } catch (error) {
    if (error instanceof NotMlsMemberError) {
      return (
        <main>
          <h1>Cooperation</h1>
          <div className="card">
            <p>
              The cooperation directory is for MLS members only.
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

  const { status } = await searchParams;
  const filter = (STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const all = await listCooperationListings();
  const rows = filter === "all" ? all : all.filter((l) => l.status === filter);

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>Cooperation directory</h1>
      <p className="muted" style={{ maxWidth: "70ch" }}>
        Marketable inventory across all members, with listing-agent and office
        attribution and a direct contact route. Member-only data (Block &amp;
        Parcel, private remarks, sold price) is shown here and never on the
        public site. CIREME is not a party to any transaction and sets no
        fees — cooperation here means visibility and contact only.
      </p>

      <div className="chipbar">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              (s === "all"
                ? "/mls/cooperation"
                : `/mls/cooperation?status=${s}`) as Route
            }
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s}
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
              <th>Price (KYD)</th>
              <th>Listing agent</th>
              <th>Office</th>
              <th>Member detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const contact = l.attribution.agentEmail
                ? `mailto:${l.attribution.agentEmail}?subject=${encodeURIComponent(
                    `CIREME cooperation enquiry — ${l.publicReference}`,
                  )}`
                : null;
              return (
                <tr key={l.id}>
                  <td>
                    <Link href={`/listings/${l.id}` as Route}>
                      {l.publicReference}
                    </Link>
                  </td>
                  <td>{l.title}</td>
                  <td className="muted">
                    {l.district.replace(/_/g, " ")}
                  </td>
                  <td>
                    <span className={`badge badge--${l.status}`}>
                      {l.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {l.priceKyd ?? "—"}
                  </td>
                  <td className="muted">
                    {l.attribution.agentName ?? "—"}
                    {contact ? (
                      <>
                        {" · "}
                        <a href={contact}>contact</a>
                      </>
                    ) : null}
                  </td>
                  <td className="muted">
                    {l.attribution.officeName ?? "—"}
                  </td>
                  <td>
                    <details>
                      <summary>view</summary>
                      <div style={{ marginTop: "0.5rem", minWidth: 240 }}>
                        <div>
                          <strong style={{ fontSize: "0.8rem" }}>
                            Block &amp; Parcel
                          </strong>
                          <div className="muted">
                            {l.landBlock ?? "—"} / {l.landParcel ?? "—"}
                          </div>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <strong style={{ fontSize: "0.8rem" }}>
                            Sold price (KYD)
                          </strong>
                          <div className="muted">
                            {l.soldPriceKyd ?? "—"}
                          </div>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <strong style={{ fontSize: "0.8rem" }}>
                            Private remarks
                          </strong>
                          <div className="muted">
                            {l.privateRemarks ?? "—"}
                          </div>
                        </div>
                        {l.attribution.officeContactEmail ? (
                          <div style={{ marginTop: "0.5rem" }}>
                            <strong style={{ fontSize: "0.8rem" }}>
                              Office contact
                            </strong>
                            <div className="muted">
                              {l.attribution.officeContactEmail}
                            </div>
                          </div>
                        ) : null}
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
