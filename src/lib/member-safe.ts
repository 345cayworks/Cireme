/**
 * Member-safe cross-listing projection (U3 — cooperation).
 *
 * The mirror of `public-safe.ts`: where the public projection is the
 * allow-list a *visitor* may see, this is the allow-list an authenticated
 * **MLS member** may see when browsing another member's listing for
 * cooperation. It deliberately INCLUDES the `private`-classified,
 * member-only fields (Block & Parcel, private remarks, sold price, agent
 * attribution) plus agent/office contact — and still EXCLUDES purely
 * `internal` operational columns.
 *
 * Authority is enforced at the call site by `requireMlsMember()`. This
 * projection must only ever be constructed for a verified MLS member; a
 * test asserts the field set so it cannot silently drift, and the public
 * projection's exclusion of these same fields is independently tested.
 *
 * No compensation/cooperation-fee field exists or may be added (locked
 * Phase 0 positioning) — "cooperation" here means visibility + a direct
 * contact route, never money routing.
 */
import type { listings } from "@/db/schema";

type ListingRow = typeof listings.$inferSelect;

export type ListingAttribution = {
  agentName: string | null;
  agentEmail: string | null;
  officeName: string | null;
  officeContactEmail: string | null;
};

export type MemberListing = {
  // public-tier fields
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
  latitude: string | null;
  longitude: string | null;
  // member-only (private-classified) fields
  landBlock: string | null;
  landParcel: string | null;
  soldPriceKyd: string | null;
  privateRemarks: string | null;
  agentId: string | null;
  // attribution + contact (joined; never a compensation field)
  attribution: ListingAttribution;
};

export function toMemberListing(
  row: ListingRow,
  attribution: ListingAttribution,
): MemberListing {
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
    latitude: row.latitude,
    longitude: row.longitude,
    landBlock: row.landBlock,
    landParcel: row.landParcel,
    soldPriceKyd: row.soldPriceKyd,
    privateRemarks: row.privateRemarks,
    agentId: row.agentId,
    attribution,
  };
}
