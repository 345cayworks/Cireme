import assert from "node:assert/strict";
import { test } from "node:test";

import {
  completeVolumeSeries,
  latestMix,
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

test("completeVolumeSeries drops a partial trailing year", () => {
  const full = completeVolumeSeries();
  assert.ok(full.length >= 10);
  const last = full[full.length - 1]!;
  const prev = full[full.length - 2]!;
  // Remaining last year must not look like a half-year stub.
  assert.ok(last.freeholdTransfers >= prev.freeholdTransfers * 0.5);
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
