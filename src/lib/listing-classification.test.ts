import assert from "node:assert/strict";
import { test } from "node:test";

import type { listings } from "@/db/schema";
import {
  LISTING_FIELD_CLASSIFICATION,
  PUBLIC_LISTING_FIELDS,
} from "./listing-classification.ts";
import { toPublicListing } from "./public-safe.ts";

type ListingRow = typeof listings.$inferSelect;

// A row with every column present. If a schema column is added, this fixture
// stops compiling — forcing both a classification entry and a decision here.
const FULL_ROW: ListingRow = {
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
  soldPriceKyd: null,
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

test("every listing column is classified (100% coverage gate)", () => {
  const columns = Object.keys(FULL_ROW).sort();
  const classified = Object.keys(LISTING_FIELD_CLASSIFICATION).sort();
  assert.deepEqual(
    classified,
    columns,
    "a listing column is missing a public/private/internal classification",
  );
});

test("public projection exposes exactly the public-classified fields", () => {
  const projectionKeys = Object.keys(toPublicListing(FULL_ROW)).sort();
  assert.deepEqual(
    projectionKeys,
    [...PUBLIC_LISTING_FIELDS].sort(),
    "public projection drifted from the public field classification",
  );
});

test("no private or internal field appears in the public projection", () => {
  const projectionKeys = new Set(Object.keys(toPublicListing(FULL_ROW)));
  for (const [field, cls] of Object.entries(LISTING_FIELD_CLASSIFICATION)) {
    if (cls !== "public") {
      assert.equal(
        projectionKeys.has(field),
        false,
        `${cls} field "${field}" leaked into the public projection`,
      );
    }
  }
});
