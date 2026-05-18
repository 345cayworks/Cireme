import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { can, type Permission, type Role } from "@/lib/rbac";
import WorkspaceFrame, { type NavItem } from "./WorkspaceFrame";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

const NAV: { label: string; href: string; need?: Permission }[] = [
  { label: "Dashboard", href: "/mls/dashboard" },
  { label: "Applications", href: "/mls/members?tab=applications", need: "member:approve" },
  { label: "Members", href: "/mls/members?tab=members", need: "member:approve" },
  { label: "Listings", href: "/mls/listings", need: "listing:moderate" },
  { label: "My agents", href: "/mls/agents", need: "listing:edit:office" },
  { label: "Group listings", href: "/mls/group-listings", need: "listing:edit:office" },
  { label: "Brokerage", href: "/mls/brokerage", need: "listing:edit:office" },
  { label: "Compliance", href: "/mls/compliance", need: "compliance:review" },
  { label: "Audit", href: "/mls/audit", need: "platform:admin" },
];

export default async function MlsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  // Pre-auth surfaces (login, activate) render without the workspace shell.
  if (!user) return <>{children}</>;

  const role = user.role as Role;
  const nav: NavItem[] = NAV.filter(
    (item) =>
      !item.need ||
      can(role, item.need) ||
      // An agent/broker still needs Listings even without moderate rights.
      (item.href === "/mls/listings" &&
        (can(role, "listing:create") || can(role, "listing:edit:office"))),
  ).map(({ label, href }) => ({ label, href }));

  const roleLabel =
    role === "super_admin" || role === "mls_admin"
      ? "Administrator"
      : role.replace(/_/g, " ");

  return (
    <WorkspaceFrame
      email={user.email ?? ""}
      roleLabel={roleLabel}
      nav={nav}
      signOutAction={signOutAction}
    >
      {children}
    </WorkspaceFrame>
  );
}
