/**
 * Pure responsive-table layout decision (U6). Components stay dumb: they
 * ask this module what to render at a given viewport width and get back a
 * deterministic, test-enforced answer. The CSS that paints the stacked
 * card is presentational and explicitly deferred from automated testing
 * (see the U6 build-ledger entry) — the *decision* lives here and is
 * tested.
 *
 * Breakpoints match the design system (xs <480 · sm 480 · md 768 · lg
 * 1024). Below `md` the table degrades to stacked cards.
 */

export const BREAKPOINT_MD = 768;

export type ColumnDef = {
  key: string;
  /** 1 = always show; higher = drop sooner on narrow viewports. */
  priority: number;
};

export type TableLayout = {
  mode: "table" | "stacked";
  visibleColumns: string[];
};

export function resolveTableLayout(
  columns: readonly ColumnDef[],
  viewportWidth: number,
): TableLayout {
  if (viewportWidth < BREAKPOINT_MD) {
    // Stacked cards show every field as a labelled row — nothing is
    // hidden, so no column is dropped in this mode.
    return { mode: "stacked", visibleColumns: columns.map((c) => c.key) };
  }
  // Wide enough for a real table: keep priority 1–2, drop the rest as the
  // viewport tightens toward md.
  const maxPriority = viewportWidth >= 1024 ? Infinity : 2;
  return {
    mode: "table",
    visibleColumns: columns
      .filter((c) => c.priority <= maxPriority)
      .map((c) => c.key),
  };
}
