import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>CIREME</h1>
      <p className="muted">Cayman Islands Real Estate Market Explorer</p>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <p>
          An open marketplace for <strong>private sellers</strong> and{" "}
          <strong>independent brokers</strong> in the Cayman Islands — list,
          share, and sell with <strong>no compensation lock-in</strong>.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/listings">Browse listings →</Link>
        </p>
      </div>
      <p className="muted" style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
        Members and brokers:{" "}
        <Link href="/mls/login">sign in to the MLS core</Link>.
      </p>
    </main>
  );
}
