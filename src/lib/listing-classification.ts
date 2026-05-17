/**
 * Listing field classification — Phase 1 governance artifact, in code.
 *
 * The Phase 1 gate requires 100% of listing fields classified public/private.
 * This map is the single source of truth: `satisfies Record<keyof ListingRow,
 * FieldClass>` makes it a COMPILE error to add a column to the schema without
 * classifying it, and listing-classification.test.ts proves coverage at
 * runtime. public-safe.ts derives its deny-list from here so the public
 * projection, the governance doc, and the tests cannot drift apart.
 *
 *  - public   : may appear in the public portal projection
 *  - private  : member/owner-only; never leaves the MLS core
 *  - internal : operational metadata; not user-facing, not in public output
 */
import type { listings } from "@/db/schema";

type ListingRow = typeof listings.$inferSelect;

export type FieldClass = "public" | "private" | "internal";

export const LISTING_FIELD_CLASSIFICATION = {
  id: "public",
  publicReference: "public",
  title: "public",
  propertyType: "public",
  status: "public",
  district: "public",
  tenure: "public",
  priceKyd: "public",
  bedrooms: "public",
  bathrooms: "public",
  areaSqFt: "public",
  publicDescription: "public",
  publishedAt: "public",
  // Precise legal parcel identifiers can re-identify an owner — member-only.
  landBlock: "private",
  landParcel: "private",
  // Sale economics and internal notes are never public.
  soldPriceKyd: "private",
  privateRemarks: "private",
  agentId: "private",
  // Operational metadata.
  officeId: "internal",
  createdAt: "internal",
  updatedAt: "internal",
} as const satisfies Record<keyof ListingRow, FieldClass>;

export type ClassifiedField = keyof typeof LISTING_FIELD_CLASSIFICATION;

function fieldsOf(target: FieldClass): (keyof ListingRow)[] {
  return (
    Object.entries(LISTING_FIELD_CLASSIFICATION) as [
      keyof ListingRow,
      FieldClass,
    ][]
  )
    .filter(([, cls]) => cls === target)
    .map(([field]) => field);
}

export const PUBLIC_LISTING_FIELDS = fieldsOf("public");
export const PRIVATE_LISTING_FIELDS = fieldsOf("private");
export const INTERNAL_LISTING_FIELDS = fieldsOf("internal");
