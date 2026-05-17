export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--n-900)" }}>
          CIREME — Cayman Islands Real Estate Market Explorer
        </div>
        <p style={{ maxWidth: "60ch", margin: 0 }}>
          An open marketplace for private sellers and independent brokers in
          the Cayman Islands. CIREME is a technology and marketing platform —
          not a brokerage, regulator, valuer, or party to any transaction. It
          does not set or mediate cooperation compensation.
        </p>
        <p style={{ margin: 0, color: "var(--meta)" }}>
          Listing data is presented for general information and may change.
          © {new Date().getFullYear()} CIREME.
        </p>
      </div>
    </footer>
  );
}
