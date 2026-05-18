"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = { label: string; href: string };

export default function WorkspaceFrame({
  email,
  roleLabel,
  nav,
  signOutAction,
  children,
}: {
  email: string;
  roleLabel: string;
  nav: NavItem[];
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentTab = params.get("tab");

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (path !== pathname) return false;
    if (!query) return !currentTab || pathname !== "/mls/members";
    return query.includes(`tab=${currentTab ?? "applications"}`);
  };

  return (
    <div className="ws-shell">
      <nav className="ws-rail" aria-label="Workspace">
        <div className="ws-rail__brand">CIREME</div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href as never}
            className="ws-nav__item"
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <header className="ws-topbar">
        <div className="ws-topbar__left">
          <span>MLS Workspace</span>
          <span className="ws-badge-role">{roleLabel}</span>
        </div>
        <div className="ws-topbar__right">
          <span title={email}>{email}</span>
          <form action={signOutAction}>
            <button type="submit" className="ws-signout">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="ws-content">{children}</div>
    </div>
  );
}
