"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { RPPI_DISCLAIMER, RPPI_SOURCE, type RppiRegion } from "@/data/rppi";
import { projectBand } from "@/lib/rppi-projection";

const REGIONS: { value: RppiRegion; label: string }[] = [
  { value: "total", label: "Total Cayman Islands" },
  { value: "georgeTown", label: "George Town" },
  { value: "sevenMileBeach", label: "Seven Mile Beach" },
  { value: "westBay", label: "West Bay" },
  { value: "otherCayman", label: "Other Cayman Islands" },
];

function kyd(n: number) {
  return n.toLocaleString("en-KY", {
    style: "currency",
    currency: "KYD",
    maximumFractionDigits: 0,
  });
}
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function RppiPage() {
  const [region, setRegion] = useState<RppiRegion>("total");
  const [value, setValue] = useState(1000000);

  const result = useMemo(
    () => projectBand(region, value, 5),
    [region, value],
  );

  // Compact history sparkline.
  const idx = result.history.map((h) => h.index);
  const min = Math.min(...idx);
  const max = Math.max(...idx);
  const pts = result.history
    .map((h, i) => {
      const x = (i / (result.history.length - 1)) * 100;
      const y = 28 - ((h.index - min) / (max - min || 1)) * 26;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <main>
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        <Link href="/tools">← Tools</Link>
      </p>
      <h1>Price projection (RPPI)</h1>
      <p className="muted" style={{ maxWidth: "62ch" }}>
        An indicative low–mid–high outlook for the next five years, based on
        the official Cayman Islands Residential Property Price Index.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "minmax(260px, 360px) 1fr",
          marginTop: "1.5rem",
        }}
      >
        <div className="card">
          <label>
            Region
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RppiRegion)}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Current value (KYD)
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(+e.target.value)}
            />
          </label>
          <div className="muted" style={{ fontSize: "0.85rem" }}>
            Index history ({result.history[0]!.year}–{result.baseYear}),
            2015 = 100
          </div>
          <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            style={{ width: "100%", height: 56, marginTop: "0.5rem" }}
          >
            <polyline
              points={pts}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                Annual growth band
              </div>
              <strong>
                {pct(result.rates.low)} – {pct(result.rates.high)}
              </strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                In 5 years (mid)
              </div>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
                {kyd(result.projection[4]!.mid)}
              </strong>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "right", color: "var(--meta)" }}>
                <th style={{ textAlign: "left", padding: "0.4rem 0" }}>Year</th>
                <th>Low</th>
                <th>Mid</th>
                <th>High</th>
              </tr>
            </thead>
            <tbody>
              {result.projection.map((p) => (
                <tr key={p.year} style={{ borderTop: "1px solid var(--n-200)" }}>
                  <td style={{ padding: "0.45rem 0" }}>{p.year}</td>
                  <td style={{ textAlign: "right" }}>{kyd(p.low)}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {kyd(p.mid)}
                  </td>
                  <td style={{ textAlign: "right" }}>{kyd(p.high)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="disclaimer" style={{ marginTop: "1.5rem" }}>
        {RPPI_DISCLAIMER} Source: {RPPI_SOURCE}.
      </p>
    </main>
  );
}
