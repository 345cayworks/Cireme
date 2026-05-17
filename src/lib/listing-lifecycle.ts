/**
 * Listing lifecycle engine (Phase 4) — pure logic, no I/O.
 *
 * Two responsibilities:
 *  1. A status state machine: which transitions are legal.
 *  2. Completeness validation: a listing must satisfy the Cayman-correct
 *     required-field set before it may enter a publicly visible status.
 *
 * Persistence (history + audit) lives in listing-service.ts; keeping this
 * module side-effect-free makes the rules unit-testable in isolation.
 */
import type { listings } from "@/db/schema";

type ListingRow = typeof listings.$inferSelect;
export type ListingStatus = ListingRow["status"];

/** Legal target statuses keyed by current status. Empty array = terminal. */
const TRANSITIONS: Record<ListingStatus, readonly ListingStatus[]> = {
  draft: ["incomplete", "active", "canceled"],
  incomplete: ["active", "draft", "canceled"],
  active: ["pending", "withdrawn", "expired", "sold", "off_market"],
  pending: ["active", "sold", "withdrawn", "canceled"],
  withdrawn: ["active", "canceled"],
  expired: ["active", "canceled"],
  off_market: ["active", "canceled"],
  sold: [],
  canceled: [],
};

/** Statuses the public portal can surface — entering one requires completeness. */
export const PUBLIC_STATUSES: readonly ListingStatus[] = [
  "active",
  "pending",
  "sold",
];

export function canTransition(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedTransitions(
  from: ListingStatus,
): readonly ListingStatus[] {
  return TRANSITIONS[from];
}

export class ListingTransitionError extends Error {
  readonly from: ListingStatus;
  readonly to: ListingStatus;
  constructor(from: ListingStatus, to: ListingStatus) {
    super(`Illegal listing transition: ${from} -> ${to}`);
    this.name = "ListingTransitionError";
    this.from = from;
    this.to = to;
  }
}

export class ListingIncompleteError extends Error {
  readonly missing: readonly string[];
  constructor(missing: readonly string[]) {
    super(`Listing is incomplete: missing ${missing.join(", ")}`);
    this.name = "ListingIncompleteError";
    this.missing = missing;
  }
}

/**
 * Fields required before a listing may become publicly visible.
 * `landBlock`/`landParcel` are the Cayman canonical property key and are
 * mandatory for publication even though the column is nullable for drafts.
 */
const REQUIRED_FOR_PUBLICATION = [
  "title",
  "propertyType",
  "district",
  "tenure",
  "priceKyd",
  "publicDescription",
  "landBlock",
  "landParcel",
] as const satisfies readonly (keyof ListingRow)[];

export type CompletenessResult =
  | { ok: true }
  | { ok: false; missing: string[] };

export function validateCompleteness(
  listing: ListingRow,
  mediaCount: number,
): CompletenessResult {
  const missing: string[] = [];

  for (const field of REQUIRED_FOR_PUBLICATION) {
    const value = listing[field];
    if (value === null || value === undefined || value === "") {
      missing.push(field);
    }
  }
  if (mediaCount < 1) missing.push("media");

  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}

/** True when entering `to` from `from` requires a completeness check. */
export function requiresCompleteness(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  return PUBLIC_STATUSES.includes(to) && !PUBLIC_STATUSES.includes(from);
}
