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
        <div className="card">
          <h3>Mortgage calculator</h3>
          <p className="muted">
            Estimate a monthly payment from price, deposit, rate and term.
          </p>
          <p className="badge" style={{ marginTop: "0.5rem" }}>
            Coming soon
          </p>
        </div>
        <div className="card">
          <h3>Price projection (RPPI)</h3>
          <p className="muted">
            An indicative 5-year outlook by district.
          </p>
          <p className="badge" style={{ marginTop: "0.5rem" }}>
            Coming soon
          </p>
        </div>
      </div>

      <p className="disclaimer" style={{ marginTop: "2rem" }}>
        All tools provide estimates only. They are not a formal valuation,
        appraisal, or financial advice.
      </p>
    </main>
  );
}
