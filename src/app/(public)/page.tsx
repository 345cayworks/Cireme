import type { Route } from "next";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow" style={{ color: "var(--gold)" }}>
          Cayman Islands
        </p>
        <h1>Cayman property, listed openly.</h1>
        <p>
          A premium marketplace for private sellers and independent brokers —
          accurate, Cayman-correct listings with no compensation lock-in.
        </p>
        <div className="hero__cta">
          <Link href={"/listings" as Route} className="btn">
            Browse listings
          </Link>
          <Link href={"/tools" as Route} className="btn btn-outline" style={{ color: "#f5f6f8", borderColor: "rgba(255,255,255,0.3)" }}>
            Try the tools
          </Link>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">How CIREME is different</p>
        <div className="triptych">
          <div className="card">
            <h3>Open</h3>
            <p className="muted">
              No gatekeeping and no required cooperation fees. List on your
              terms.
            </p>
          </div>
          <div className="card">
            <h3>Independent</h3>
            <p className="muted">
              Built for private sellers and independent brokers — not an
              incumbent association.
            </p>
          </div>
          <div className="card">
            <h3>Cayman-correct</h3>
            <p className="muted">
              District, tenure, Block &amp; Parcel and KYD treated as
              first-class data.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Tools</p>
        <div className="triptych">
          <Link href={"/tools" as Route} className="card" style={{ display: "block" }}>
            <h3>Mortgage calculator</h3>
            <p className="muted">Estimate monthly payments in seconds.</p>
          </Link>
          <Link href={"/tools" as Route} className="card" style={{ display: "block" }}>
            <h3>Price projection</h3>
            <p className="muted">
              Indicative 5-year outlook by district (estimates only).
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
