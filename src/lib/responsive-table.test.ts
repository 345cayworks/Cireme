import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveTableLayout, type ColumnDef } from "./responsive-table.ts";

const COLS: ColumnDef[] = [
  { key: "actor", priority: 1 },
  { key: "action", priority: 1 },
  { key: "entity", priority: 2 },
  { key: "timestamp", priority: 3 },
];

test("below md → stacked, every field kept (nothing hidden)", () => {
  const l = resolveTableLayout(COLS, 480);
  assert.equal(l.mode, "stacked");
  assert.deepEqual(l.visibleColumns, [
    "actor",
    "action",
    "entity",
    "timestamp",
  ]);
});

test("md..lg → table, low-priority columns dropped", () => {
  const l = resolveTableLayout(COLS, 800);
  assert.equal(l.mode, "table");
  assert.deepEqual(l.visibleColumns, ["actor", "action", "entity"]);
});

test("lg+ → table, all columns shown", () => {
  const l = resolveTableLayout(COLS, 1280);
  assert.equal(l.mode, "table");
  assert.deepEqual(l.visibleColumns.length, 4);
});

test("exact md boundary is a real table", () => {
  assert.equal(resolveTableLayout(COLS, 768).mode, "table");
  assert.equal(resolveTableLayout(COLS, 767).mode, "stacked");
});
