"use client";

import Link from "next/link";
import { useState } from "react";

function kyd(n: number) {
  return n.toLocaleString("en-KY", {
    style: "currency",
    currency: "KYD",
    maximumFractionDigits: 0,
  });
}

export default function MortgagePage() {
  const [price, setPrice] = useState(750000);
  const [depositPct, setDepositPct] = useState(20);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(25);

  const deposit = (price * depositPct) / 100;
  const principal = Math.max(price - deposit, 0);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly =
    r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - principal;

  return (
    <main>
      <p className="muted" style={{ marginBottom: "0.5rem" }}>
        <Link href="/tools">← Tools</Link>
      </p>
      <h1>Mortgage calculator</h1>
      <p className="muted" style={{ maxWidth: "58ch" }}>
        A quick estimate of your monthly payment.
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
            Property price (KYD)
            <input
              type="number"
              value={price}
              min={0}
              onChange={(e) => setPrice(+e.target.value)}
            />
          </label>
          <label>
            Deposit ({depositPct}%) — {kyd(deposit)}
            <input
              type="range"
              min={0}
              max={60}
              value={depositPct}
              onChange={(e) => setDepositPct(+e.target.value)}
            />
          </label>
          <label>
            Interest rate (% per year)
            <input
              type="number"
              step="0.1"
              value={rate}
              min={0}
              onChange={(e) => setRate(+e.target.value)}
            />
          </label>
          <label>
            Term (years)
            <input
              type="number"
              value={years}
              min={1}
              max={40}
              onChange={(e) => setYears(+e.target.value)}
            />
          </label>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div className="muted" style={{ fontSize: "0.8rem" }}>
              Estimated monthly payment
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.4rem",
                fontWeight: 600,
              }}
            >
              {Number.isFinite(monthly) ? kyd(monthly) : "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                Loan amount
              </div>
              <strong>{kyd(principal)}</strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                Total interest
              </div>
              <strong>{kyd(totalInterest)}</strong>
            </div>
            <div>
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                Total repaid
              </div>
              <strong>{kyd(totalPaid)}</strong>
            </div>
          </div>
        </div>
      </div>

      <p className="disclaimer" style={{ marginTop: "1.5rem" }}>
        Estimate only. Assumes a fixed rate and equal monthly payments; actual
        terms, fees and rates vary by lender. Not financial advice.
      </p>
    </main>
  );
}
