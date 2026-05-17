import type { Route } from "next";
import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav">
      <Link href="/" className="site-nav__brand">
        CIREME
      </Link>
      <div className="site-nav__links">
        <Link href={"/" as Route}>Home</Link>
        <Link href={"/listings" as Route}>Listings</Link>
        <Link href={"/tools" as Route}>Tools</Link>
        <Link href={"/partners" as Route}>Partners</Link>
        <details className="nav-menu">
          <summary aria-label="Login menu">Login</summary>
          <div className="nav-menu__panel" role="menu">
            <a href="/mls/login?as=admin" role="menuitem">
              <strong>Admin</strong>
              <span className="muted">Approvals, members, oversight</span>
            </a>
            <a href="/mls/login?as=broker" role="menuitem">
              <strong>Broker</strong>
              <span className="muted">Your team and group listings</span>
            </a>
            <a href="/mls/login?as=agent" role="menuitem">
              <strong>Agent</strong>
              <span className="muted">Your listings and media</span>
            </a>
          </div>
        </details>
      </div>
    </nav>
  );
}
