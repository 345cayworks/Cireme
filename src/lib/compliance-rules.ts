/**
 * Compliance rule engine (Phase 5) — pure detectors, no I/O.
 *
 * The sweep in compliance-service.ts feeds listing rows through these rules
 * and persists any findings as compliance_issues. Keeping detection pure makes
 * the policy thresholds unit-testable and keeps enforcement (side effects)
 * separate from detection (judgement).
 *
 * misleading_media and incorrect_classification are intentionally absent:
 * they require human judgement and are raised manually, not by the sweep.
 */
import type { complianceIssues, listings } from "@/db/schema";
import { validateCompleteness } from "./listing-lifecycle.ts";

type ListingRow = typeof listings.$inferSelect;
type IssueType = (typeof complianceIssues.$inferSelect)["type"];

/** An active listing untouched for this long is considered stale. */
export const STALE_AFTER_DAYS = 180;

const DAY_MS = 24 * 60 * 60 * 1000;

export type DetectedIssue = {
  listingId: string;
  type: IssueType;
  detail: string;
};

export type ListingContext = {
  mediaCount: number;
  now: Date;
};

/** Single-listing rules: completeness, staleness, sold-left-active. */
export function detectListingIssues(
  listing: ListingRow,
  ctx: ListingContext,
): DetectedIssue[] {
  const issues: DetectedIssue[] = [];
  const isPublic =
    listing.status === "active" ||
    listing.status === "pending" ||
    listing.status === "sold";

  if (isPublic) {
    const completeness = validateCompleteness(listing, ctx.mediaCount);
    if (!completeness.ok) {
      issues.push({
        listingId: listing.id,
        type: "missing_required_fields",
        detail: `Missing: ${completeness.missing.join(", ")}`,
      });
    }
  }

  if (listing.status === "active") {
    const ageMs = ctx.now.getTime() - listing.updatedAt.getTime();
    if (ageMs > STALE_AFTER_DAYS * DAY_MS) {
      const days = Math.floor(ageMs / DAY_MS);
      issues.push({
        listingId: listing.id,
        type: "stale_listing",
        detail: `No update in ${days} days (threshold ${STALE_AFTER_DAYS}).`,
      });
    }
  }

  if (
    listing.soldPriceKyd !== null &&
    (listing.status === "active" || listing.status === "pending")
  ) {
    issues.push({
      listingId: listing.id,
      type: "sold_left_active",
      detail: `Sold price is set but status is ${listing.status}.`,
    });
  }

  return issues;
}

function dedupeKey(listing: ListingRow): string | null {
  if (!listing.landBlock || !listing.landParcel) return null;
  return `${listing.district}|${listing.landBlock}|${listing.landParcel}`;
}

/**
 * Cross-listing rule: two or more active listings sharing the same
 * district + Block & Parcel are flagged as duplicates.
 */
export function detectDuplicates(listings: ListingRow[]): DetectedIssue[] {
  const groups = new Map<string, ListingRow[]>();
  for (const listing of listings) {
    if (listing.status !== "active") continue;
    const key = dedupeKey(listing);
    if (!key) continue;
    const group = groups.get(key);
    if (group) group.push(listing);
    else groups.set(key, [listing]);
  }

  const issues: DetectedIssue[] = [];
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    for (const listing of group) {
      issues.push({
        listingId: listing.id,
        type: "duplicate",
        detail: `Shares district+Block&Parcel (${key}) with ${
          group.length - 1
        } other active listing(s).`,
      });
    }
  }
  return issues;
}
