import assert from "node:assert/strict";
import { test } from "node:test";

import { cagr, projectBand } from "./rppi-projection.ts";

test("cagr computes compound growth and guards bad input", () => {
  assert.ok(Math.abs(cagr(100, 200, 10) - 0.0717735) < 1e-6);
  assert.equal(cagr(0, 100, 5), 0);
  assert.equal(cagr(100, 200, 0), 0);
});

test("projectBand returns an ordered low<=mid<=high band", () => {
  const r = projectBand("georgeTown", 1_000_000, 5);
  assert.equal(r.projection.length, 5);
  assert.ok(r.rates.low <= r.rates.mid && r.rates.mid <= r.rates.high);
  for (const p of r.projection) {
    assert.ok(p.low <= p.mid && p.mid <= p.high, `band ordered @ ${p.year}`);
    assert.ok(p.low > 0);
  }
  // Compounding grows the high bound across the horizon.
  assert.ok(
    r.projection[4]!.high >= r.projection[0]!.high,
    "high bound compounds upward",
  );
});

test("projectBand scales linearly with current value", () => {
  const a = projectBand("total", 500_000);
  const b = projectBand("total", 1_000_000);
  assert.ok(
    Math.abs(b.projection[0]!.mid - 2 * a.projection[0]!.mid) < 1e-6,
  );
});
