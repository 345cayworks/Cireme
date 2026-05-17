/**
 * Structural public/private separation (Addendum C.3).
 *
 * The public portal must never read private listing fields. Rather than
 * filtering in ad-hoc query code, every public read goes through
 * `toPublicListing`, which constructs the public projection from an explicit
 * allow-list. `PRIVATE_LISTING_FIELDS` is the deny-list a test asserts against
 * so a leak fails CI rather than reaching production.
 */
import type { listings } from "@/db/schema";

type ListingRow = typeof listings.$inferSelect;

/** Fields that must never appear in any public response. */
export const PRIVATE_LISTING_FIELDS = [
  "privateRemarks",
  "agentId",
  "soldPriceKyd",
] as const satisfies readonly (keyof ListingRow)[];

export type PublicListing = {
  id: string;
  publicReference: string;
  title: string;
  propertyType: ListingRow["propertyType"];
  status: ListingRow["status"];
  district: ListingRow["district"];
  tenure: ListingRow["tenure"];
  priceKyd: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  areaSqFt: number | null;
  publicDescription: string | null;
  publishedAt: Date | null;
};

/** Statuses the public portal is allowed to surface at all. */
const PUBLIC_VISIBLE_STATUSES: ReadonlySet<ListingRow["status"]> = new Set([
  "active",
  "pending",
  "sold",
]);

export function isPubliclyVisible(row: ListingRow): boolean {
  return PUBLIC_VISIBLE_STATUSES.has(row.status);
}

export function toPublicListing(row: ListingRow): PublicListing {
  return {
    id: row.id,
    publicReference: row.publicReference,
    title: row.title,
    propertyType: row.propertyType,
    status: row.status,
    district: row.district,
    tenure: row.tenure,
    priceKyd: row.priceKyd,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqFt: row.areaSqFt,
    publicDescription: row.publicDescription,
    publishedAt: row.publishedAt,
  };
}
