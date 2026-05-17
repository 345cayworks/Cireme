/**
 * RPPI projection — pure, side-effect-free, unit-testable.
 *
 * Method (per approved design decision): a low–mid–high BAND, never a single
 * deterministic figure, to keep output reading as an estimate rather than a
 * valuation. The band is bounded by the region's long-run and recent
 * compound annual growth rates (CAGR); mid is their midpoint.
 */
import { RPPI_ANNUAL, type RppiRegion } from "../data/rppi.ts";

export type ProjectionPoint = {
  year: number;
  low: number;
  mid: number;
  high: number;
};

export type ProjectionResult = {
  history: { year: number; index: number }[];
  baseYear: number;
  baseIndex: number;
  rates: { low: number; mid: number; high: number };
  projection: ProjectionPoint[];
};

function seriesFor(region: RppiRegion): { year: number; index: number }[] {
  return RPPI_ANNUAL.map((p) => ({ year: p.year, index: p[region] }));
}

/** Compound annual growth rate between two index values over `years`. */
export function cagr(from: number, to: number, years: number): number {
  if (from <= 0 || years <= 0) return 0;
  return Math.pow(to / from, 1 / years) - 1;
}

/**
 * Projects `currentValue` (KYD) forward `horizon` years for `region`.
 * recentWindow = years used for the "recent" growth bound (default 5).
 */
export function projectBand(
  region: RppiRegion,
  currentValue: number,
  horizon = 5,
  recentWindow = 5,
): ProjectionResult {
  const history = seriesFor(region);
  const first = history[0]!;
  const last = history[history.length - 1]!;
  const recentFrom = history[history.length - 1 - recentWindow] ?? first;

  const longRun = cagr(first.index, last.index, last.year - first.year);
  const recent = cagr(
    recentFrom.index,
    last.index,
    last.year - recentFrom.year,
  );

  const low = Math.min(longRun, recent);
  const high = Math.max(longRun, recent);
  const mid = (low + high) / 2;

  const projection: ProjectionPoint[] = [];
  for (let n = 1; n <= horizon; n++) {
    projection.push({
      year: last.year + n,
      low: currentValue * Math.pow(1 + low, n),
      mid: currentValue * Math.pow(1 + mid, n),
      high: currentValue * Math.pow(1 + high, n),
    });
  }

  return {
    history,
    baseYear: last.year,
    baseIndex: last.index,
    rates: { low, mid, high },
    projection,
  };
}
