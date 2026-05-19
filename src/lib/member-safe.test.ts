import assert from "node:assert/strict";
import { test } from "node:test";

import type { listings } from "@/db/schema";
import {
  PRIVATE_LISTING_FIELDS,
  INTERNAL_LISTING_FIELDS,
} from "./listing-classification.ts";
import { toMemberListing } from "./member-safe.ts";
import { toPublicListing } from "./public-safe.ts";
import { ROLES, isMlsRole } from "./rbac.ts";

type ListingRow = typeof listings.$inferSelect;

const SECRET = "DO-NOT-LEAK-THIS-VALUE";

function listingFixture(): ListingRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    publicReference: "CIR-1",
    title: "Sea view villa",
    propertyType: "residential",
    status: "active",
    district: "george_town",
    tenure: "freehold",
    landBlock: "12A",
    landParcel: "345",
    priceKyd: "1250000.00",
    soldPriceKyd: "990000.00",
    bedrooms: 3,
    bathrooms: "2.5",
    areaSqFt: 2400,
    publicDescription: "Bright, well kept.",
    latitude: "19.2866000",
    longitude: "-81.3744000",
    privateRemarks: "Seller motivated.",
    agentId: "agent-1",
    officeId: "office-1",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const ATTR = {
  agentName: "Jane Agent",
  agentEmail: "jane@example.com",
  officeName: "Cayman Realty",
  officeContactEmail: "compliance@example.com",
};

test("member projection exposes exactly the allow-listed keys", () => {
  const result = toMemberListing(listingFixture(), ATTR);
  assert.deepEqual(
    Object.keys(result).sort(),
    [
      "agentId",
      "areaSqFt",
      "attribution",
      "bathrooms",
      "bedrooms",
      "district",
      "id",
      "landBlock",
      "landParcel",
      "latitude",
      "longitude",
      "priceKyd",
      "privateRemarks",
      "propertyType",
      "publicDescription",
      "publicReference",
      "publishedAt",
      "soldPriceKyd",
      "status",
      "tenure",
      "title",
    ],
    "member projection key set changed — review before updating",
  );
});

test("members CAN resolve every private-classified field", () => {
  const result = toMemberListing(listingFixture(), ATTR) as Record<
    string,
    unknown
  >;
  for (const field of PRIVATE_LISTING_FIELDS) {
    assert.ok(
      field in result,
      `member projection should expose private field "${field}"`,
    );
  }
});

test("member projection still excludes purely internal columns", () => {
  const result = toMemberListing(listingFixture(), ATTR) as Record<
    string,
    unknown
  >;
  for (const field of INTERNAL_LISTING_FIELDS) {
    assert.equal(
      field in result,
      false,
      `internal field "${field}" must not appear in the member projection`,
    );
  }
});

test("a non-member's only projection (public) resolves NO private field", () => {
  // Sentinel every private value: prove it cannot survive the public path
  // that a non-member role is limited to.
  const row = listingFixture();
  for (const f of PRIVATE_LISTING_FIELDS) {
    (row as Record<string, unknown>)[f] = SECRET;
  }
  const publicView = toPublicListing(row);
  const serialized = JSON.stringify(publicView);
  assert.equal(
    serialized.includes(SECRET),
    false,
    "a private value leaked into the public (non-member) projection",
  );
  for (const f of PRIVATE_LISTING_FIELDS) {
    assert.equal(
      f in publicView,
      false,
      `private field "${f}" reachable by a non-member`,
    );
  }
});

test("member-data gate admits exactly the MLS roles", () => {
  const members = ROLES.filter((r) => isMlsRole(r));
  const nonMembers = ROLES.filter((r) => !isMlsRole(r));
  assert.deepEqual(
    [...members].sort(),
    ["agent", "broker", "mls_admin", "office_manager", "super_admin"],
    "MLS-member set drifted — cooperation gate must track isMlsRole",
  );
  // public_user and advertiser must never be treated as members.
  assert.deepEqual([...nonMembers].sort(), ["advertiser", "public_user"]);
});
