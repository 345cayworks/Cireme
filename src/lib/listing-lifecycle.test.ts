import assert from "node:assert/strict";
import { test } from "node:test";

import type { listings } from "@/db/schema";
import {
  allowedTransitions,
  canTransition,
  requiresCompleteness,
  validateCompleteness,
} from "./listing-lifecycle.ts";

type ListingRow = typeof listings.$inferSelect;

function listingFixture(over: Partial<ListingRow> = {}): ListingRow {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    publicReference: "CIR-1",
    title: "Sea view villa",
    propertyType: "residential",
    status: "draft",
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
    latitude: null,
    longitude: null,
    privateRemarks: null,
    agentId: null,
    officeId: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

test("state machine: legal and illegal transitions", () => {
  assert.equal(canTransition("draft", "active"), true);
  assert.equal(canTransition("active", "sold"), true);
  assert.equal(canTransition("sold", "active"), false, "sold is terminal");
  assert.equal(canTransition("draft", "pending"), false);
  assert.deepEqual([...allowedTransitions("canceled")], []);
});

test("requiresCompleteness only when entering a public status", () => {
  assert.equal(requiresCompleteness("draft", "active"), true);
  assert.equal(requiresCompleteness("active", "pending"), false);
  assert.equal(requiresCompleteness("active", "withdrawn"), false);
});

test("validateCompleteness passes a complete listing with media", () => {
  assert.deepEqual(validateCompleteness(listingFixture(), 2), { ok: true });
});

test("validateCompleteness reports each missing field", () => {
  const result = validateCompleteness(
    listingFixture({ priceKyd: null, landParcel: "", publicDescription: null }),
    0,
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.missing.includes("priceKyd"));
    assert.ok(result.missing.includes("landParcel"));
    assert.ok(result.missing.includes("publicDescription"));
    assert.ok(result.missing.includes("media"));
  }
});
