/**
 * Server-side authorization gate. Middleware only enforces "is this an
 * authenticated MLS user"; anything that mutates state must additionally
 * assert the caller holds the required permission here, at the call site.
 */
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { can, isMlsRole, type Permission, type Role } from "@/lib/rbac";

export type AuthedUser = {
  id: string;
  email: string | null;
  role: Role;
};

export class ForbiddenError extends Error {
  readonly permission: Permission;
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
    this.permission = permission;
  }
}

/**
 * Resolves the current session and asserts `permission`. Redirects
 * unauthenticated/inactive users to sign-in; throws ForbiddenError for an
 * authenticated user who lacks the permission (surfaced as a 403-style page).
 */
export async function requirePermission(
  permission: Permission,
): Promise<AuthedUser> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user.status !== "active") {
    redirect("/mls/login");
  }
  if (!can(user.role, permission)) {
    throw new ForbiddenError(permission);
  }

  return { id: user.id, email: user.email ?? null, role: user.role };
}

export class NotMlsMemberError extends Error {
  constructor() {
    super("Member-only resource: caller is not an MLS member");
    this.name = "NotMlsMemberError";
  }
}

/**
 * Asserts the caller is an authenticated, active **MLS member** (any MLS
 * role — broker/agent/office_manager/admin; not public_user/advertiser).
 * This is the gate for member-only cooperation data, which carries
 * private-classified fields that must never resolve for a non-member.
 */
export async function requireMlsMember(): Promise<AuthedUser> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || user.status !== "active") {
    redirect("/mls/login");
  }
  if (!isMlsRole(user.role)) {
    throw new NotMlsMemberError();
  }

  return { id: user.id, email: user.email ?? null, role: user.role };
}
