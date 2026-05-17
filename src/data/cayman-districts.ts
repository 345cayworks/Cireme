/**
 * Cayman district reference data — labels + approximate centroids.
 *
 * Map/geodata decision (design risk #1, resolved): listings have no precise
 * coordinates, so location is shown at district level using these approximate
 * centroids. This is the "upgrade-ready" path: when/if per-listing
 * latitude/longitude is added to the schema, components can switch from
 * centroid clustering to precise pins without changing this contract.
 *
 * Centroids are intentionally coarse (display only) — not survey-accurate
 * and never a substitute for Block & Parcel.
 */
export type CaymanDistrict =
  | "george_town"
  | "west_bay"
  | "bodden_town"
  | "north_side"
  | "east_end"
  | "cayman_brac"
  | "little_cayman";

export type DistrictRef = {
  value: CaymanDistrict;
  label: string;
  lat: number;
  lng: number;
};

export const CAYMAN_DISTRICTS: readonly DistrictRef[] = [
  { value: "george_town", label: "George Town", lat: 19.2866, lng: -81.3744 },
  { value: "west_bay", label: "West Bay", lat: 19.3736, lng: -81.4179 },
  { value: "bodden_town", label: "Bodden Town", lat: 19.2833, lng: -81.253 },
  { value: "north_side", label: "North Side", lat: 19.35, lng: -81.2 },
  { value: "east_end", label: "East End", lat: 19.3, lng: -81.11 },
  { value: "cayman_brac", label: "Cayman Brac", lat: 19.72, lng: -79.82 },
  {
    value: "little_cayman",
    label: "Little Cayman",
    lat: 19.69,
    lng: -80.05,
  },
];

export const DISTRICT_LABEL: Record<string, string> = Object.fromEntries(
  CAYMAN_DISTRICTS.map((d) => [d.value, d.label]),
);
