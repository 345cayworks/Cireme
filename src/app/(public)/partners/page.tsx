import type { Route } from "next";
import Link from "next/link";

export const metadata = { title: "Partners — CIREME" };

export default function PartnersPage() {
  return (
    <main>
      <p className="eyebrow">Join CIREME</p>
      <h1>Partners</h1>
      <p className="muted" style={{ maxWidth: "62ch" }}>
        CIREME is open to private sellers and independent brokers — with no
        required cooperation fees and no association gatekeeping.
      </p>

      <div className="triptych" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3>Private seller</h3>
          <p className="muted">
            List a property you own, on your terms.
          </p>
        </div>
        <div className="card">
          <h3>Independent broker</h3>
          <p className="muted">
            Manage listings for your clients without lock-in.
          </p>
        </div>
        <div className="card">
          <h3>Advertiser / partner</h3>
          <p className="muted">
            Reach Cayman property buyers and sellers.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Ready to apply?</strong>
          <div className="muted" style={{ fontSize: "0.9rem" }}>
            Send your details and the team will follow up.
          </div>
        </div>
        <Link href={"/partners/apply" as Route} className="btn">
          Apply to join
        </Link>
      </div>
    </main>
  );
}
