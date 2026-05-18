import assert from "node:assert/strict";
import { test } from "node:test";

import { LAS_ANNUAL } from "../data/las.ts";
import {
  completeVolumeSeries,
  latestMix,
  partialVolumeYear,
  regionGrowth,
} from "./market-intel.ts";

test("regionGrowth returns coherent growth metrics", () => {
  const g = regionGrowth("total");
  assert.ok(g.latestYear >= 2024);
  assert.ok(g.latestIndex > 0);
  for (const r of [g.yoy, g.cagr5, g.cagrAll]) {
    assert.equal(Number.isFinite(r), true);
    assert.ok(r > -1 && r < 5);
  }
});

test("completeVolumeSeries excludes every partial year", () => {
  const full = completeVolumeSeries();
  assert.ok(full.length >= 10);
  assert.ok(full.every((p) => !p.partial));
  // A partial year present in the raw data must not survive the filter.
  const rawPartial = LAS_ANNUAL.filter((p) => p.partial);
  for (const p of rawPartial) {
    assert.equal(
      full.some((f) => f.year === p.year),
      false,
      `partial year ${p.year} leaked into the complete series`,
    );
  }
});

test("partialVolumeYear surfaces the trailing year-to-date year", () => {
  const p = partialVolumeYear();
  if (p) {
    assert.equal(p.partial, true);
    assert.ok((p.monthsCovered ?? 0) > 0 && (p.monthsCovered ?? 0) < 12);
  }
});

test("latestMix exposes the four transaction types", () => {
  const m = latestMix();
  assert.ok(m.year > 2010);
  for (const k of [
    "freeholdTransfers",
    "leases",
    "leaseTransfers",
    "purchaseAgreements",
  ] as const) {
    assert.equal(typeof m[k], "number");
  }
});
