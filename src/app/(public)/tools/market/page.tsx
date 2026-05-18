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
  const latest = RPPI_ANNUAL[RPPI_ANNUAL.length - 1]!;

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
          Index, 2015 = 100 (condominiums). Higher means pricier than 2015 —
          e.g. 200 = roughly double 2015 prices. Each line is a region; the
          gold line is Cayman-wide.
        </p>
        <div className="card">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {/* Y-axis scale */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                color: "var(--meta)",
                textAlign: "right",
                minWidth: 28,
                height: 220,
              }}
            >
              <span>{Math.round(max)}</span>
              <span>100</span>
              <span>{Math.round(min)}</span>
            </div>
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 220 }}
              role="img"
              aria-label={`Residential property price index by region, ${y0} to ${y1}, 2015 = 100`}
            >
              {/* 2015 = 100 baseline */}
              <line
                x1="0"
                x2="100"
                y1={38 - ((100 - min) / (max - min)) * 36}
                y2={38 - ((100 - min) / (max - min)) * 36}
                stroke="var(--n-300)"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
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
          </div>
          {/* X-axis years */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.7rem",
              color: "var(--meta)",
              margin: "0.3rem 0 0 36px",
            }}
          >
            <span>{y0}</span>
            <span>{years[Math.floor(years.length / 2)]}</span>
            <span>{y1}</span>
          </div>
          {/* Legend with latest value per region */}
          <div
            style={{
              display: "flex",
              gap: "1.25rem",
              flexWrap: "wrap",
              marginTop: "0.75rem",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "var(--meta)" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  borderTop: "1px dashed var(--n-400)",
                  marginRight: 6,
                  verticalAlign: "middle",
                }}
              />
              2015 base (100)
            </span>
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
                {r.label} · {latest[r.key].toFixed(0)} ({y1})
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
          Each bar is one year of freehold transfers — registered ownership
          changes Cayman-wide. Taller = a busier market that year.
        </p>
        <div className="card">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {/* Y-axis: 0 to peak transfers */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                color: "var(--meta)",
                textAlign: "right",
                minWidth: 34,
                height: 180,
              }}
            >
              <span>{vmax.toLocaleString()}</span>
              <span>{Math.round(vmax / 2).toLocaleString()}</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 100 36"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 180 }}
              role="img"
              aria-label={`Freehold transfers per year, ${vol[0]!.year} to ${vol[vol.length - 1]!.year}, peak ${vmax.toLocaleString()}`}
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
                  >
                    <title>
                      {v.year}: {v.freeholdTransfers.toLocaleString()} freehold
                      transfers
                    </title>
                  </rect>
                );
              })}
            </svg>
          </div>
          {/* X-axis years */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.7rem",
              color: "var(--meta)",
              margin: "0.4rem 0 0 42px",
            }}
          >
            <span>{vol[0]!.year}</span>
            <span>{vol[Math.floor(vol.length / 2)]!.year}</span>
            <span>{vol[vol.length - 1]!.year}</span>
          </div>
          <p
            className="muted"
            style={{ fontSize: "0.75rem", margin: "0.5rem 0 0 42px" }}
          >
            Y-axis: transfers per year (0–{vmax.toLocaleString()}). Hover a bar
            for the exact count.
          </p>
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
        <p className="muted" style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>
          <strong>Freehold transfers</strong>: ownership sold/changed.{" "}
          <strong>Leases</strong>: new long-term leases granted.{" "}
          <strong>Lease transfers</strong>: existing leases reassigned.{" "}
          <strong>Purchase agreements</strong>: sales contracted but not yet
          completed.
        </p>
        <p className="disclaimer" style={{ marginTop: "1rem" }}>
          {LAS_CAVEAT} Source: {LAS_SOURCE}. Partial (year-to-date) years are
          excluded from the trend and mix.
        </p>
      </section>
    </main>
  );
}
