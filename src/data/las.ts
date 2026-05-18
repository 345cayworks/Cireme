/**
 * Cayman Islands Lands & Survey — annual property-transaction activity.
 *
 * Source: Cayman Islands Government, Lands & Survey Department
 * (CIREME_data_2026 dataset). Annual aggregates of monthly figures,
 * 2010–2026. ALL monetary figures are in Cayman Islands dollars (CI$).
 * 2026 is a PARTIAL year (Jan–Apr only); it carries `partial`/`monthsCovered`
 * and is excluded from trend and year-over-year aggregations.
 *
 * Caveats (per the data provider, must be surfaced wherever shown):
 *  - "Number of Transfers" includes Transfers of Undivided Shares,
 *    Transfers by Chargee, and Transfers for Natural Love & Affection.
 *  - "Number of Leases" includes the grant of Sub-Leases.
 *  - Consideration is the value of documents ASSESSED for stamp duty;
 *    it is NOT revenue collected and revenue cannot be derived from it.
 *  - This is transaction-VOLUME/activity data, distinct from the RPPI
 *    price index. It is not a valuation of any property.
 */

export type LasAnnualPoint = {
  year: number;
  freeholdTransfers: number;
  freeholdConsideration: number;
  leases: number;
  leasesConsideration: number;
  leaseTransfers: number;
  leaseTransfersConsideration: number;
  purchaseAgreements: number;
  purchaseAgreementsConsideration: number;
  /** True when the year is incomplete (year-to-date), not a full 12 months. */
  partial?: boolean;
  /** Months of data present when `partial` (e.g. 4 = Jan–Apr). */
  monthsCovered?: number;
};

export const LAS_SOURCE =
  "Cayman Islands Government — Lands & Survey Department (transaction activity)";

export const LAS_CAVEAT =
  "Transfer counts include undivided-share, chargee and natural-love-&-affection " +
  "transfers; lease counts include sub-leases. Consideration is the value of " +
  "documents assessed for stamp duty (not revenue collected). All figures in CI$.";

export const LAS_ANNUAL: readonly LasAnnualPoint[] = [
  { year: 2010, freeholdTransfers: 1619, freeholdConsideration: 307237155, leases: 144, leasesConsideration: 1658533, leaseTransfers: 24, leaseTransfersConsideration: 7538536, purchaseAgreements: 80, purchaseAgreementsConsideration: 17469717 },
  { year: 2011, freeholdTransfers: 1708, freeholdConsideration: 632088625, leases: 138, leasesConsideration: 976342, leaseTransfers: 40, leaseTransfersConsideration: 24810721, purchaseAgreements: 79, purchaseAgreementsConsideration: 20001641 },
  { year: 2012, freeholdTransfers: 1696, freeholdConsideration: 418104914, leases: 109, leasesConsideration: 401732, leaseTransfers: 17, leaseTransfersConsideration: 11467901, purchaseAgreements: 139, purchaseAgreementsConsideration: 39989001 },
  { year: 2013, freeholdTransfers: 1569, freeholdConsideration: 538820161, leases: 125, leasesConsideration: 621282, leaseTransfers: 72, leaseTransfersConsideration: 38079430, purchaseAgreements: 79, purchaseAgreementsConsideration: 17086704 },
  { year: 2014, freeholdTransfers: 1718, freeholdConsideration: 533687283, leases: 115, leasesConsideration: 1439243, leaseTransfers: 45, leaseTransfersConsideration: 27945342, purchaseAgreements: 67, purchaseAgreementsConsideration: 20589776 },
  { year: 2015, freeholdTransfers: 1787, freeholdConsideration: 592415863, leases: 101, leasesConsideration: 2136323, leaseTransfers: 30, leaseTransfersConsideration: 17672811, purchaseAgreements: 161, purchaseAgreementsConsideration: 31004479 },
  { year: 2016, freeholdTransfers: 1792, freeholdConsideration: 844303557, leases: 152, leasesConsideration: 927785, leaseTransfers: 31, leaseTransfersConsideration: 158792007, purchaseAgreements: 114, purchaseAgreementsConsideration: 40901934 },
  { year: 2017, freeholdTransfers: 1875, freeholdConsideration: 797951450.14, leases: 149, leasesConsideration: 898074, leaseTransfers: 45, leaseTransfersConsideration: 31345837.38, purchaseAgreements: 126, purchaseAgreementsConsideration: 13507385 },
  { year: 2018, freeholdTransfers: 2070, freeholdConsideration: 855811852, leases: 184, leasesConsideration: 0, leaseTransfers: 36, leaseTransfersConsideration: 287861010, purchaseAgreements: 225, purchaseAgreementsConsideration: 30851840 },
  { year: 2019, freeholdTransfers: 1922, freeholdConsideration: 816438257.46, leases: 153, leasesConsideration: 0, leaseTransfers: 39, leaseTransfersConsideration: 45788898.71, purchaseAgreements: 339, purchaseAgreementsConsideration: 26108027.61 },
  { year: 2020, freeholdTransfers: 1920, freeholdConsideration: 770561070.42, leases: 126, leasesConsideration: 14088516.62, leaseTransfers: 34, leaseTransfersConsideration: 23118239.89, purchaseAgreements: 677, purchaseAgreementsConsideration: 37479613.86 },
  { year: 2021, freeholdTransfers: 2983, freeholdConsideration: 1346455379.63, leases: 172, leasesConsideration: 14262200.32, leaseTransfers: 45, leaseTransfersConsideration: 52497782, purchaseAgreements: 90, purchaseAgreementsConsideration: 17397259.17 },
  { year: 2022, freeholdTransfers: 2659, freeholdConsideration: 1238367668.97, leases: 124, leasesConsideration: 11830142.3, leaseTransfers: 30, leaseTransfersConsideration: 17783709.08, purchaseAgreements: 70, purchaseAgreementsConsideration: 26519857.15 },
  { year: 2023, freeholdTransfers: 2198, freeholdConsideration: 1079577043.68, leases: 171, leasesConsideration: 22882171.13, leaseTransfers: 47, leaseTransfersConsideration: 53135862.72, purchaseAgreements: 62, purchaseAgreementsConsideration: 26205451.08 },
  { year: 2024, freeholdTransfers: 2215, freeholdConsideration: 1151272244.69, leases: 156, leasesConsideration: 17702957.94, leaseTransfers: 45, leaseTransfersConsideration: 84644868.9, purchaseAgreements: 61, purchaseAgreementsConsideration: 27043057.55 },
  { year: 2025, freeholdTransfers: 2110, freeholdConsideration: 1275734707.56, leases: 181, leasesConsideration: 22449923.98, leaseTransfers: 40, leaseTransfersConsideration: 24612208.45, purchaseAgreements: 68, purchaseAgreementsConsideration: 56371659.8 },
  { year: 2026, freeholdTransfers: 828, freeholdConsideration: 518311692.55, leases: 56, leasesConsideration: 4011113.52, leaseTransfers: 15, leaseTransfersConsideration: 13521023.36, purchaseAgreements: 55, purchaseAgreementsConsideration: 122657290.96, partial: true, monthsCovered: 4 },
];
