import Link from "next/link";

import { RPPI_ANNUAL, RPPI_SOURCE, type RppiRegion } from "@/data/rppi";
import { LAS_CAVEAT, LAS_SOURCE } from "@/data/las";
import {
  completeVolumeSeries,
  latestMix,
  partialVolumeYear,
  regionGrowth,
} from "@/lib/market-intel";

export const metadata = { title: "Market intelligence — CIREME" };

const REGIONS: { key: RppiRegion; label: string; stroke: string }[] = [
  { key: "total", label: "Total Cayman", stroke: "var(--gold)" },
  { key: "georgeTown", label: "George Town", stroke: "#5a616e" },
  { key: "sevenMileBeach", label: "Seven Mile Beach", stroke: "#2f6f9f" },
  { key: "westBay", label: "West Bay", stroke: "#2e7d5b" },
  { key: "otherCayman", label: "Other Cayman", stroke: "#c2701c" },
];

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function MarketPage() {
  const years = RPPI_ANNUAL.map((p) => p.year);
  const y0 = years[0]!;
  const y1 = years[years.length - 1]!;
  const all = RPPI_ANNUAL.flatMap((p) => [
    p.total,
    p.georgeTown,
    p.sevenMileBeach,
    p.westBay,
    p.otherCayman,
  ]);
  const min = Math.min(...all);
  const max = Math.max(...all);

  const line = (key: RppiRegion) =>
    RPPI_ANNUAL.map((p, i) => {
      const x = (i / (RPPI_ANNUAL.length - 1)) * 100;
      const yv = 38 - ((p[key] - min) / (max - min)) * 36;
      return `${x.toFixed(2)},${yv.toFixed(2)}`;
    }).join(" ");

  const vol = completeVolumeSeries().slice(-12);
  const vmax = Math.max(...vol.map((v) => v.freeholdTransfers));
  const mix = latestMix();
  const partial = partialVolumeYear();

  return (
    <main>
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        <Link href="/tools">← Tools</Link>
      </p>
      <p className="eyebrow">Cayman Islands</p>
      <h1>Market intelligence</h1>
      <p className="muted" style={{ maxWidth: "64ch" }}>
        How Cayman residential prices have moved (official RPPI) and how active
        the market has been (Lands &amp; Survey transaction activity).
      </p>

      {/* Price index */}
      <section className="section">
        <h2>Residential price index ({y0}–{y1})</h2>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          Index, 2015 = 100 (condominiums).
        </p>
        <div className="card">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 220 }}
          >
            {REGIONS.map((r) => (
              <polyline
                key={r.key}
                points={line(r.key)}
                fill="none"
                stroke={r.stroke}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div
            style={{
              display: "flex",
              gap: "1.25rem",
              flexWrap: "wrap",
              marginTop: "0.75rem",
              fontSize: "0.85rem",
            }}
          >
            {REGIONS.map((r) => (
              <span key={r.key} style={{ color: "var(--n-700)" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    background: r.stroke,
                    borderRadius: 2,
                    marginRight: 6,
                  }}
                />
                {r.label}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1rem" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ textAlign: "right", color: "var(--meta)" }}>
                <th style={{ textAlign: "left", padding: "0.4rem 0" }}>
                  Region
                </th>
                <th>Latest index</th>
                <th>1-yr</th>
                <th>5-yr p.a.</th>
                <th>Since {y0} p.a.</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => {
                const g = regionGrowth(r.key);
                return (
                  <tr
                    key={r.key}
                    style={{ borderTop: "1px solid var(--n-200)" }}
                  >
                    <td style={{ padding: "0.45rem 0" }}>{r.label}</td>
                    <td style={{ textAlign: "right" }}>
                      {g.latestIndex.toFixed(1)}
                    </td>
                    <td style={{ textAlign: "right" }}>{pct(g.yoy)}</td>
                    <td style={{ textAlign: "right" }}>{pct(g.cagr5)}</td>
                    <td style={{ textAlign: "right" }}>{pct(g.cagrAll)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="disclaimer" style={{ marginTop: "1rem" }}>
          Source: {RPPI_SOURCE}. Index measures condominium prices only;
          estimates of market trend, not a valuation.
        </p>
      </section>

      {/* Transaction activity */}
      <section className="section">
        <h2>Transaction activity</h2>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          Freehold transfers per year (Cayman-wide).
        </p>
        <div className="card">
          <svg
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 180 }}
          >
            {vol.map((v, i) => {
              const bw = 100 / vol.length;
              const h = (v.freeholdTransfers / vmax) * 32;
              return (
                <rect
                  key={v.year}
                  x={i * bw + bw * 0.15}
                  y={34 - h}
                  width={bw * 0.7}
                  height={h}
                  fill="var(--gold)"
                />
              );
            })}
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--meta)",
              marginTop: "0.4rem",
            }}
          >
            <span>{vol[0]!.year}</span>
            <span>{vol[vol.length - 1]!.year}</span>
          </div>
        </div>

        {partial ? (
          <p
            className="muted"
            style={{ fontSize: "0.8rem", marginTop: "0.6rem" }}
          >
            {partial.year} to date ({partial.monthsCovered}&nbsp;mo):{" "}
            {partial.freeholdTransfers.toLocaleString()} freehold transfers —{" "}
            <strong>partial year</strong>, excluded from the trend and
            year-over-year figures above.
          </p>
        ) : null}

        <div
          className="card"
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              Freehold transfers ({mix.year})
            </div>
            <strong>{mix.freeholdTransfers.toLocaleString()}</strong>
          </div>
          <div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              Leases
            </div>
            <strong>{mix.leases.toLocaleString()}</strong>
          </div>
          <div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              Lease transfers
            </div>
            <strong>{mix.leaseTransfers.toLocaleString()}</strong>
          </div>
          <div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              Purchase agreements
            </div>
            <strong>{mix.purchaseAgreements.toLocaleString()}</strong>
          </div>
        </div>
        <p className="disclaimer" style={{ marginTop: "1rem" }}>
          {LAS_CAVEAT} Source: {LAS_SOURCE}. Partial (year-to-date) years are
          excluded from the trend and mix.
        </p>
      </section>
    </main>
  );
}
