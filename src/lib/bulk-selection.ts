/**
 * Pure bulk-selection model (U6). Drives multi-select + bulk actions in
 * admin tables WITHOUT inventing backend: a bulk action is only ever a
 * loop over an EXISTING per-item operation, so the only correctness
 * concern this module owns is *which selected items the action may touch*.
 *
 * Eligibility is explicit and test-enforced: anything not eligible is
 * reported as skipped (with a reason) rather than silently acted on.
 */

export type SelectionState = ReadonlySet<string>;

export function toggle(state: SelectionState, id: string): Set<string> {
  const next = new Set(state);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Select every currently-eligible id (page-scoped "select all"). */
export function selectAllEligible<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  isEligible: (item: T) => boolean,
): Set<string> {
  return new Set(items.filter(isEligible).map(idOf));
}

export function clear(): Set<string> {
  return new Set();
}

export type BulkPlan = {
  willApply: string[];
  skipped: { id: string; reason: string }[];
};

/**
 * Partition the selection into what the bulk action will actually touch
 * vs. what is skipped. Selected ids that are not in the current item set,
 * or not eligible, never reach the backend.
 */
export function planBulk<T>(
  items: readonly T[],
  selected: SelectionState,
  idOf: (item: T) => string,
  isEligible: (item: T) => boolean,
  ineligibleReason = "not eligible for this action",
): BulkPlan {
  const byId = new Map(items.map((i) => [idOf(i), i] as const));
  const willApply: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const id of selected) {
    const item = byId.get(id);
    if (!item) {
      skipped.push({ id, reason: "no longer present" });
      continue;
    }
    if (!isEligible(item)) {
      skipped.push({ id, reason: ineligibleReason });
      continue;
    }
    willApply.push(id);
  }
  return { willApply, skipped };
}
