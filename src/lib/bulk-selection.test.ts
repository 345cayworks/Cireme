import assert from "node:assert/strict";
import { test } from "node:test";

import {
  clear,
  planBulk,
  selectAllEligible,
  toggle,
} from "./bulk-selection.ts";

type Issue = { id: string; status: "open" | "dismissed" };
const ISSUES: Issue[] = [
  { id: "a", status: "open" },
  { id: "b", status: "dismissed" },
  { id: "c", status: "open" },
];
const idOf = (i: Issue) => i.id;
const isOpen = (i: Issue) => i.status === "open";

test("toggle adds then removes an id immutably", () => {
  const s0 = new Set<string>();
  const s1 = toggle(s0, "a");
  assert.deepEqual([...s1], ["a"]);
  assert.equal(s0.size, 0, "input not mutated");
  assert.deepEqual([...toggle(s1, "a")], []);
});

test("selectAllEligible picks only eligible items", () => {
  assert.deepEqual(
    [...selectAllEligible(ISSUES, idOf, isOpen)].sort(),
    ["a", "c"],
  );
  assert.deepEqual([...clear()], []);
});

test("planBulk only applies to eligible, present items", () => {
  const selected = new Set(["a", "b", "zzz"]);
  const plan = planBulk(ISSUES, selected, idOf, isOpen, "issue is not open");
  assert.deepEqual(plan.willApply, ["a"]);
  const reasons = Object.fromEntries(
    plan.skipped.map((s) => [s.id, s.reason]),
  );
  assert.equal(reasons["b"], "issue is not open");
  assert.equal(reasons["zzz"], "no longer present");
});

test("planBulk on an all-eligible selection skips nothing", () => {
  const plan = planBulk(ISSUES, new Set(["a", "c"]), idOf, isOpen);
  assert.deepEqual(plan.willApply.sort(), ["a", "c"]);
  assert.equal(plan.skipped.length, 0);
});
