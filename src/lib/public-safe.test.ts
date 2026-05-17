import assert from "node:assert/strict";
import { test } from "node:test";

import type { listings } from "@/db/schema";
import {
  PRIVATE_LISTING_FIELDS,
  isPubliclyVisible,
  toPublicListing,
} from "./public-safe.ts";

type ListingRow = typeof listings.$inferSelect;

const SECRET = "DO-NOT-LEAK-THIS-VALUE";

function listingFixture(over: Partial<ListingRow> = {}): ListingRow {
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
    // Every private field carries the sentinel so any leak is detectable.
    soldPriceKyd: SECRET,
    bedrooms: 3,
    bathrooms: "2.5",
    areaSqFt: 2400,
    publicDescription: "Bright, well kept.",
    privateRemarks: SECRET,
    agentId: SECRET,
    officeId: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

test("public projection omits every declared private field key", () => {
  const result = toPublicListing(listingFixture());
  for (const field of PRIVATE_LISTING_FIELDS) {
    assert.ok(
      !(field in result),
      `private field "${field}" must not appear in the public projection`,
    );
  }
});

test("no private sentinel value survives serialization", () => {
  const serialized = JSON.stringify(toPublicListing(listingFixture()));
  assert.equal(
    serialized.includes(SECRET),
    false,
    "a private value leaked into the public projection",
  );
});

test("public projection exposes exactly the allow-listed keys", () => {
  const result = toPublicListing(listingFixture());
  assert.deepEqual(
    Object.keys(result).sort(),
    [
      "areaSqFt",
      "bathrooms",
      "bedrooms",
      "district",
      "id",
      "priceKyd",
      "propertyType",
      "publicDescription",
      "publicReference",
      "publishedAt",
      "status",
      "tenure",
      "title",
    ],
    "public projection key set changed — review for leaks before updating",
  );
});

test("PRIVATE_LISTING_FIELDS and the public key set are disjoint", () => {
  const publicKeys = new Set(Object.keys(toPublicListing(listingFixture())));
  for (const field of PRIVATE_LISTING_FIELDS) {
    assert.equal(publicKeys.has(field), false);
  }
});

test("isPubliclyVisible allows only active/pending/sold", () => {
  for (const status of ["active", "pending", "sold"] as const) {
    assert.equal(isPubliclyVisible(listingFixture({ status })), true);
  }
  for (const status of [
    "draft",
    "incomplete",
    "withdrawn",
    "expired",
    "canceled",
    "off_market",
  ] as const) {
    assert.equal(isPubliclyVisible(listingFixture({ status })), false);
  }
});
