import assert from "node:assert/strict";
import { test } from "node:test";

import type { PublicListing } from "./public-safe.ts";
import {
  RESO_PROPERTY_FIELDS,
  buildResoFeed,
  canAccessResoFeed,
  toResoProperty,
} from "./reso-export.ts";
import { ROLES, isMlsRole } from "./rbac.ts";

const SAMPLE: PublicListing = {
  id: "00000000-0000-0000-0000-000000000001",
  publicReference: "CIR-1",
  title: "Sea view villa",
  propertyType: "condo",
  status: "sold",
  district: "george_town",
  tenure: "freehold",
  priceKyd: "1250000.00",
  bedrooms: 3,
  bathrooms: "2.5",
  areaSqFt: 2400,
  publicDescription: "Bright, well kept.",
  publishedAt: new Date("2026-01-02T00:00:00Z"),
  latitude: "19.2866000",
  longitude: "-81.3744000",
};

test("RESO record emits exactly the declared field set", () => {
  const r = toResoProperty(SAMPLE);
  assert.deepEqual(
    Object.keys(r).sort(),
    [...RESO_PROPERTY_FIELDS].sort(),
    "RESO field set drifted — review against the documented mapping",
  );
});

test("status and type map to RESO enums; price/coords coerce to numbers", () => {
  const r = toResoProperty(SAMPLE);
  assert.equal(r.StandardStatus, "Closed"); // sold → Closed
  assert.equal(r.PropertyType, "Residential"); // condo → Residential
  assert.equal(r.ListPrice, 1250000);
  assert.equal(r.BathroomsTotalInteger, 2); // floor(2.5)
  assert.equal(typeof r.Latitude, "number");
  assert.equal(r.Country, "KY");
  assert.equal(r.X_CIREME_Currency, "KYD");
});

test("no private/internal source field name leaks into the RESO record", () => {
  const r = toResoProperty(SAMPLE) as Record<string, unknown>;
  for (const banned of [
    "privateRemarks",
    "landBlock",
    "landParcel",
    "agentId",
    "soldPriceKyd",
    "officeId",
    "createdAt",
    "updatedAt",
  ]) {
    assert.equal(banned in r, false, `"${banned}" must not appear in RESO`);
  }
});

test("no compensation/cooperation field is ever emitted (positioning lock)", () => {
  const keys = RESO_PROPERTY_FIELDS.join(" ").toLowerCase();
  for (const term of ["compensation", "commission", "coop", "split", "fee"]) {
    assert.equal(
      keys.includes(term),
      false,
      `RESO export must not expose a "${term}" field`,
    );
  }
});

test("feed envelope wraps the value array", () => {
  const feed = buildResoFeed([SAMPLE, SAMPLE]);
  assert.equal(feed.value.length, 2);
  assert.ok("@reso.context" in feed);
  assert.equal(feed.OriginatingSystemName, "CIREME");
});

test("RESO feed access is member-only (test-enforced)", () => {
  const allowed = ROLES.filter((r) => canAccessResoFeed(r));
  const denied = ROLES.filter((r) => !canAccessResoFeed(r));
  assert.deepEqual(
    [...allowed].sort(),
    ["agent", "broker", "mls_admin", "office_manager", "super_admin"],
  );
  assert.deepEqual([...denied].sort(), ["advertiser", "public_user"]);
  // canAccessResoFeed must track isMlsRole exactly.
  for (const r of ROLES)
    assert.equal(canAccessResoFeed(r), isMlsRole(r));
});
