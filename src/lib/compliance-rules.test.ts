import assert from "node:assert/strict";
import { test } from "node:test";

import type { listings } from "@/db/schema";
import {
  STALE_AFTER_DAYS,
  detectDuplicates,
  detectListingIssues,
} from "./compliance-rules.ts";

type ListingRow = typeof listings.$inferSelect;

const NOW = new Date("2026-05-17T00:00:00Z");

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
    soldPriceKyd: null,
    bedrooms: 3,
    bathrooms: "2.5",
    areaSqFt: 2400,
    publicDescription: "Bright, well kept.",
    privateRemarks: null,
    agentId: null,
    officeId: null,
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  };
}

test("a complete, fresh active listing yields no issues", () => {
  const issues = detectListingIssues(listingFixture(), {
    mediaCount: 3,
    now: NOW,
  });
  assert.deepEqual(issues, []);
});

test("missing_required_fields raised for incomplete public listing", () => {
  const issues = detectListingIssues(
    listingFixture({ priceKyd: null }),
    { mediaCount: 3, now: NOW },
  );
  assert.equal(issues.length, 1);
  assert.equal(issues[0]!.type, "missing_required_fields");
});

test("stale_listing raised past the threshold, not before", () => {
  const stale = new Date(
    NOW.getTime() - (STALE_AFTER_DAYS + 5) * 86400_000,
  );
  const fresh = new Date(
    NOW.getTime() - (STALE_AFTER_DAYS - 5) * 86400_000,
  );
  assert.equal(
    detectListingIssues(listingFixture({ updatedAt: stale }), {
      mediaCount: 3,
      now: NOW,
    }).some((i) => i.type === "stale_listing"),
    true,
  );
  assert.equal(
    detectListingIssues(listingFixture({ updatedAt: fresh }), {
      mediaCount: 3,
      now: NOW,
    }).some((i) => i.type === "stale_listing"),
    false,
  );
});

test("sold_left_active raised when sold price set but still active", () => {
  const issues = detectListingIssues(
    listingFixture({ soldPriceKyd: "1200000.00", status: "active" }),
    { mediaCount: 3, now: NOW },
  );
  assert.equal(
    issues.some((i) => i.type === "sold_left_active"),
    true,
  );
});

test("detectDuplicates flags shared district + Block & Parcel", () => {
  const a = listingFixture({ id: "a" });
  const b = listingFixture({ id: "b" });
  const c = listingFixture({ id: "c", landParcel: "999" });
  const issues = detectDuplicates([a, b, c]);
  assert.equal(issues.length, 2);
  assert.deepEqual(
    issues.map((i) => i.listingId).sort(),
    ["a", "b"],
  );
});

test("detectDuplicates ignores non-active and keyless listings", () => {
  const a = listingFixture({ id: "a", status: "draft" });
  const b = listingFixture({ id: "b", landBlock: null });
  assert.deepEqual(detectDuplicates([a, b]), []);
});
