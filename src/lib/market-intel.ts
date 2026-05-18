/**
 * Market-intelligence aggregations — pure, side-effect-free, unit-testable.
 * Combines the RPPI price index and the Lands & Survey transaction-activity
 * data into the figures the market view renders. No projections here — this
 * is observed history only (projections live in rppi-projection.ts).
 */
import { RPPI_ANNUAL, type RppiRegion } from "../data/rppi.ts";
import { LAS_ANNUAL, type LasAnnualPoint } from "../data/las.ts";
import { cagr } from "./rppi-projection.ts";

export type RegionGrowth = {
  region: RppiRegion;
  latestYear: number;
  latestIndex: number;
  yoy: number;
  cagr5: number;
  cagrAll: number;
};

export function regionGrowth(region: RppiRegion): RegionGrowth {
  const s = RPPI_ANNUAL.map((p) => ({ year: p.year, v: p[region] }));
  const last = s[s.length - 1]!;
  const prev = s[s.length - 2]!;
  const fiveAgo = s[s.length - 1 - 5] ?? s[0]!;
  const first = s[0]!;
  return {
    region,
    latestYear: last.year,
    latestIndex: last.v,
    yoy: cagr(prev.v, last.v, 1),
    cagr5: cagr(fiveAgo.v, last.v, last.year - fiveAgo.year),
    cagrAll: cagr(first.v, last.v, last.year - first.year),
  };
}

/** Annual LAS series with any partial (year-to-date) year removed. */
export function completeVolumeSeries(): LasAnnualPoint[] {
  return LAS_ANNUAL.filter((p) => !p.partial);
}

/** The trailing partial year, if the dataset currently has one. */
export function partialVolumeYear(): LasAnnualPoint | undefined {
  return LAS_ANNUAL.find((p) => p.partial);
}

/** Transaction-type mix (counts) for the latest complete year. */
export function latestMix() {
  const a = completeVolumeSeries();
  const y = a[a.length - 1]!;
  return {
    year: y.year,
    freeholdTransfers: y.freeholdTransfers,
    leases: y.leases,
    leaseTransfers: y.leaseTransfers,
    purchaseAgreements: y.purchaseAgreements,
  };
}
