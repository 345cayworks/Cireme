/**
 * Server-side authorization gate. Middleware only enforces "is this an
 * authenticated MLS user"; anything that mutates state must additionally
 * assert the caller holds the required permission here, at the call site.
 */
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { can, type Permission, type Role } from "@/lib/rbac";

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
