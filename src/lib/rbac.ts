/**
 * Role-based access control.
 *
 * Roles mirror the addendum role hierarchy. The niche positioning keeps this
 * deliberately flat: there is no compensation or professional-conduct
 * authority, only platform-access control.
 */
export const ROLES = [
  "super_admin",
  "mls_admin",
  "broker",
  "office_manager",
  "agent",
  "advertiser",
  "public_user",
] as const;

export type Role = (typeof ROLES)[number];

export type Permission =
  | "listing:create"
  | "listing:edit:own"
  | "listing:edit:office"
  | "listing:moderate"
  | "compliance:review"
  | "member:approve"
  | "platform:admin";

const MATRIX: Record<Role, Permission[]> = {
  super_admin: [
    "listing:create",
    "listing:edit:own",
    "listing:edit:office",
    "listing:moderate",
    "compliance:review",
    "member:approve",
    "platform:admin",
  ],
  mls_admin: [
    "listing:moderate",
    "compliance:review",
    "member:approve",
  ],
  broker: ["listing:create", "listing:edit:own", "listing:edit:office"],
  office_manager: ["listing:edit:office"],
  agent: ["listing:create", "listing:edit:own"],
  advertiser: [],
  public_user: [],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role].includes(permission);
}

/** Roles permitted into the private MLS core (vs. public-only users). */
export function isMlsRole(role: Role | undefined): boolean {
  return (
    role !== undefined && role !== "public_user" && role !== "advertiser"
  );
}
