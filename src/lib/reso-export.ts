/**
 * One-way RESO-aligned export (U5). Pure mapping from the public-safe
 * listing projection to a RESO Data Dictionary-style "Property" record.
 *
 * Discipline (mirrors public-safe / member-safe): the feed is built ONLY
 * from `PublicListing` — no private/internal source field can reach it.
 * There are deliberately NO compensation/cooperation fields (RESO defines
 * buyer-agent-compensation fields; the locked positioning forbids them, so
 * they are intentionally omitted). Non-DD local additions use the RESO
 * `X_` extension-prefix convention.
 *
 * NOTE ON "VALIDATION": this validates against the explicit field/shape
 * contract documented here and asserted by `reso-export.test.ts`. Formal
 * certification against the official RESO Data Dictionary schema requires
 * the official schema artifact and is a flagged follow-up — see the U5
 * build-ledger entry.
 */
import type { PublicListing } from "./public-safe.ts";
import { isMlsRole, type Role } from "./rbac.ts";
import { DISTRICT_LABEL } from "../data/cayman-districts.ts";

/** The exact field set the RESO export is allowed to emit. */
export const RESO_PROPERTY_FIELDS = [
  "ListingKey",
  "ListingId",
  "StandardStatus",
  "PropertyType",
  "ListPrice",
  "BedroomsTotal",
  "BathroomsTotalInteger",
  "LivingArea",
  "City",
  "Country",
  "StateOrProvince",
  "PublicRemarks",
  "Latitude",
  "Longitude",
  "ModificationTimestamp",
  "OriginatingSystemName",
  "X_CIREME_Currency",
] as const;

export type ResoProperty = Record<
  (typeof RESO_PROPERTY_FIELDS)[number],
  string | number | null
>;

const STATUS_TO_RESO: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  sold: "Closed",
};

const TYPE_TO_RESO: Record<string, string> = {
  residential: "Residential",
  condo: "Residential",
  land: "Land",
  commercial: "CommercialSale",
  multi_family: "ResidentialIncome",
};

/** Access rule for the RESO feed (member-only). Pure + test-enforced. */
export function canAccessResoFeed(role: Role | undefined): boolean {
  return isMlsRole(role);
}

export function toResoProperty(l: PublicListing): ResoProperty {
  return {
    ListingKey: l.id,
    ListingId: l.publicReference,
    StandardStatus: STATUS_TO_RESO[l.status] ?? "Active",
    PropertyType: TYPE_TO_RESO[l.propertyType] ?? "Residential",
    ListPrice: l.priceKyd != null ? Number(l.priceKyd) : null,
    BedroomsTotal: l.bedrooms,
    BathroomsTotalInteger:
      l.bathrooms != null ? Math.floor(Number(l.bathrooms)) : null,
    LivingArea: l.areaSqFt,
    City: DISTRICT_LABEL[l.district] ?? l.district,
    Country: "KY",
    StateOrProvince: "Cayman Islands",
    PublicRemarks: l.publicDescription,
    Latitude: l.latitude != null ? Number(l.latitude) : null,
    Longitude: l.longitude != null ? Number(l.longitude) : null,
    ModificationTimestamp: l.publishedAt
      ? new Date(l.publishedAt).toISOString()
      : null,
    OriginatingSystemName: "CIREME",
    X_CIREME_Currency: "KYD",
  };
}

export function buildResoFeed(listings: PublicListing[]) {
  return {
    "@reso.context": "urn:reso:metadata:1.7:resource:property",
    OriginatingSystemName: "CIREME",
    value: listings.map(toResoProperty),
  };
}
