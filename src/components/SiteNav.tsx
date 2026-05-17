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
          <summary>Login</summary>
          <div className="nav-menu__panel">
            <a href="/mls/login?as=admin">Admin Login</a>
            <a href="/mls/login?as=broker">Broker Login</a>
            <a href="/mls/login?as=agent">Agent Login</a>
          </div>
        </details>
      </div>
    </nav>
  );
}
