/**
 * Account & application lifecycle (Phase 2) — pure logic, no I/O.
 *
 * Two state machines:
 *  - account status (users.status / memberships.status): pending → active →
 *    suspended → inactive
 *  - application status: submitted → under_review → approved | denied |
 *    withdrawn
 *
 * Kept side-effect-free so every transition (positive and negative) is
 * unit-testable, which is the Phase 2 gate.
 */
import type {
  applications,
  memberships,
  users,
} from "@/db/schema";

export type AccountStatus = (typeof users.$inferSelect)["status"];
export type ApplicationStatus = (typeof applications.$inferSelect)["status"];
export type MembershipType = (typeof memberships.$inferSelect)["type"];

/** Every account type the platform issues. */
export const ACCOUNT_TYPES = [
  "private_seller",
  "independent_broker",
  "advertiser",
] as const satisfies readonly MembershipType[];

const ACCOUNT_STATUS_TRANSITIONS: Record<
  AccountStatus,
  readonly AccountStatus[]
> = {
  pending: ["active", "inactive"],
  active: ["suspended", "inactive"],
  suspended: ["active", "inactive"],
  inactive: [],
};

const APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  submitted: ["under_review", "withdrawn"],
  under_review: ["approved", "denied", "withdrawn"],
  approved: [],
  denied: [],
  withdrawn: [],
};

export function canTransitionAccount(
  from: AccountStatus,
  to: AccountStatus,
): boolean {
  return ACCOUNT_STATUS_TRANSITIONS[from].includes(to);
}

export function allowedAccountTransitions(
  from: AccountStatus,
): readonly AccountStatus[] {
  return ACCOUNT_STATUS_TRANSITIONS[from];
}

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return APPLICATION_STATUS_TRANSITIONS[from].includes(to);
}

export function allowedApplicationTransitions(
  from: ApplicationStatus,
): readonly ApplicationStatus[] {
  return APPLICATION_STATUS_TRANSITIONS[from];
}

export class AccountTransitionError extends Error {
  readonly from: AccountStatus;
  readonly to: AccountStatus;
  constructor(from: AccountStatus, to: AccountStatus) {
    super(`Illegal account status transition: ${from} -> ${to}`);
    this.name = "AccountTransitionError";
    this.from = from;
    this.to = to;
  }
}

export class ApplicationTransitionError extends Error {
  readonly from: ApplicationStatus;
  readonly to: ApplicationStatus;
  constructor(from: ApplicationStatus, to: ApplicationStatus) {
    super(`Illegal application transition: ${from} -> ${to}`);
    this.name = "ApplicationTransitionError";
    this.from = from;
    this.to = to;
  }
}
