/**
 * Cayman Islands Residential Property Price Index (RPPI) — annual regional
 * indexes. Reference period: 2015 = 100.
 *
 * Source: Cayman Islands Government, Lands & Survey Department, published at
 * https://www.caymanlandinfo.gov.ky (annual indexes + methodological note).
 *
 * Scope per the official methodology: market purchases of CONDOMINIUMS only
 * (houses and land are not covered), mix- and quality-adjusted (hedonic).
 * This index is a market trend measure, NOT a valuation of any specific
 * property. Projections derived from it are estimates only.
 *
 * Analytical districts are the index's own regions and do not map 1:1 to the
 * platform's caymanDistrict enum — see DISTRICT_TO_RPPI_REGION.
 */

export type RppiRegion =
  | "georgeTown"
  | "otherCayman"
  | "sevenMileBeach"
  | "westBay"
  | "total";

export type RppiAnnualPoint = {
  year: number;
  georgeTown: number;
  otherCayman: number;
  sevenMileBeach: number;
  westBay: number;
  total: number;
};

export const RPPI_REFERENCE_YEAR = 2015;

export const RPPI_SOURCE =
  "Cayman Islands Government — Lands & Survey Department RPPI (caymanlandinfo.gov.ky)";

export const RPPI_DISCLAIMER =
  "Based on the Cayman Islands Government RPPI (condominiums only, 2015 = 100). " +
  "Projections are statistical estimates of market trend, not a formal " +
  "valuation, appraisal, or financial advice. Past performance does not " +
  "guarantee future results.";

/** Maps the platform district enum to the RPPI analytical region. */
export const DISTRICT_TO_RPPI_REGION: Record<string, RppiRegion> = {
  george_town: "georgeTown",
  west_bay: "westBay",
  bodden_town: "otherCayman",
  north_side: "otherCayman",
  east_end: "otherCayman",
  cayman_brac: "otherCayman",
  little_cayman: "otherCayman",
};

export const RPPI_ANNUAL: readonly RppiAnnualPoint[] = [
  { year: 1998, georgeTown: 60.9, otherCayman: 65.4, sevenMileBeach: 60.3, westBay: 56.8, total: 62.1 },
  { year: 1999, georgeTown: 67, otherCayman: 76.8, sevenMileBeach: 60.9, westBay: 57.6, total: 65.1 },
  { year: 2000, georgeTown: 67.7, otherCayman: 81.4, sevenMileBeach: 65.1, westBay: 77.4, total: 69.6 },
  { year: 2001, georgeTown: 66.2, otherCayman: 78, sevenMileBeach: 61.4, westBay: 72.3, total: 66.4 },
  { year: 2002, georgeTown: 67.7, otherCayman: 76.5, sevenMileBeach: 62.9, westBay: 68.7, total: 67.5 },
  { year: 2003, georgeTown: 70.8, otherCayman: 90, sevenMileBeach: 61.6, westBay: 76.3, total: 69.6 },
  { year: 2004, georgeTown: 76.8, otherCayman: 96.2, sevenMileBeach: 64.7, westBay: 74.2, total: 73.6 },
  { year: 2005, georgeTown: 84.4, otherCayman: 97.7, sevenMileBeach: 80.9, westBay: 86.7, total: 84.6 },
  { year: 2006, georgeTown: 98.7, otherCayman: 114.1, sevenMileBeach: 96.4, westBay: 98.5, total: 99.1 },
  { year: 2007, georgeTown: 102, otherCayman: 121.8, sevenMileBeach: 99.7, westBay: 89.3, total: 101.3 },
  { year: 2008, georgeTown: 102.6, otherCayman: 115.4, sevenMileBeach: 97.1, westBay: 98.5, total: 100.9 },
  { year: 2009, georgeTown: 105.8, otherCayman: 127.7, sevenMileBeach: 97.5, westBay: 94.7, total: 102.9 },
  { year: 2010, georgeTown: 101, otherCayman: 123.4, sevenMileBeach: 98.4, westBay: 112.3, total: 103.1 },
  { year: 2011, georgeTown: 92.5, otherCayman: 108.1, sevenMileBeach: 102.1, westBay: 97.7, total: 98.4 },
  { year: 2012, georgeTown: 95.9, otherCayman: 111, sevenMileBeach: 104.1, westBay: 96.4, total: 100.7 },
  { year: 2013, georgeTown: 96.6, otherCayman: 97.1, sevenMileBeach: 96.2, westBay: 95.3, total: 96.1 },
  { year: 2014, georgeTown: 99.2, otherCayman: 103.1, sevenMileBeach: 95.6, westBay: 96.3, total: 97.2 },
  { year: 2015, georgeTown: 100, otherCayman: 100, sevenMileBeach: 100, westBay: 100, total: 100 },
  { year: 2016, georgeTown: 101.2, otherCayman: 116.7, sevenMileBeach: 111.4, westBay: 111.1, total: 108.3 },
  { year: 2017, georgeTown: 106.6, otherCayman: 114, sevenMileBeach: 163, westBay: 109.8, total: 135.7 },
  { year: 2018, georgeTown: 125.2, otherCayman: 126.8, sevenMileBeach: 167.8, westBay: 125.5, total: 148.6 },
  { year: 2019, georgeTown: 146.6, otherCayman: 142.1, sevenMileBeach: 234.8, westBay: 138.1, total: 188.9 },
  { year: 2020, georgeTown: 157, otherCayman: 154, sevenMileBeach: 241.5, westBay: 173.9, total: 201.8 },
  { year: 2021, georgeTown: 181.2, otherCayman: 165.8, sevenMileBeach: 234.4, westBay: 185.1, total: 212.2 },
  { year: 2022, georgeTown: 213.1, otherCayman: 196.6, sevenMileBeach: 293.7, westBay: 234.3, total: 259 },
  { year: 2023, georgeTown: 238.4, otherCayman: 225, sevenMileBeach: 303.7, westBay: 238.8, total: 277.7 },
  { year: 2024, georgeTown: 245.2, otherCayman: 218.2, sevenMileBeach: 311.9, westBay: 263.8, total: 286.7 },
  { year: 2025, georgeTown: 248.6, otherCayman: 220.2, sevenMileBeach: 277.7, westBay: 295.6, total: 282.8 },
];
