import type { Route } from "next";
import Link from "next/link";

export const metadata = { title: "Tools — CIREME" };

export default function ToolsPage() {
  return (
    <main>
      <p className="eyebrow">Decision support</p>
      <h1>Tools</h1>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Quick, consumer-friendly estimates to support your property decisions.
      </p>

      <div className="triptych" style={{ marginTop: "1.5rem" }}>
        <Link
          href={"/tools/mortgage" as Route}
          className="card"
          style={{ display: "block" }}
        >
          <h3>Mortgage calculator</h3>
          <p className="muted">
            Estimate a monthly payment from price, deposit, rate and term.
          </p>
        </Link>
        <Link
          href={"/tools/rppi" as Route}
          className="card"
          style={{ display: "block" }}
        >
          <h3>Price projection (RPPI)</h3>
          <p className="muted">
            An indicative 5-year outlook by region, from the official Cayman
            index.
          </p>
        </Link>
        <Link
          href={"/tools/market" as Route}
          className="card"
          style={{ display: "block" }}
        >
          <h3>Market intelligence</h3>
          <p className="muted">
            Price trends by region and Cayman-wide transaction activity.
          </p>
        </Link>
      </div>

      <p className="disclaimer" style={{ marginTop: "2rem" }}>
        All tools provide estimates only. They are not a formal valuation,
        appraisal, or financial advice.
      </p>
    </main>
  );
}
