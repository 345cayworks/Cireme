import type { Route } from "next";
import Link from "next/link";
import { and, gte, ilike, inArray, lte, eq, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";
import { CAYMAN_DISTRICTS, DISTRICT_LABEL } from "@/data/cayman-districts";
import PropertyMap, { type MapMarker } from "@/components/PropertyMap";

export const dynamic = "force-dynamic";

const PROPERTY_TYPES = [
  "residential",
  "condo",
  "land",
  "commercial",
  "multi_family",
] as const;
const TENURES = ["freehold", "strata", "leasehold"] as const;
const PUBLIC_STATUSES = ["active", "pending", "sold"] as const;

function statusBadge(status: string) {
  const cls =
    status === "active"
      ? "badge badge--active"
      : status === "pending"
        ? "badge badge--pending"
        : status === "sold"
          ? "badge badge--sold"
          : "badge";
  return <span className={cls}>{status}</span>;
}

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const district = one(sp.district);
  const propertyType = one(sp.propertyType);
  const tenure = one(sp.tenure);
  const status = one(sp.status);
  const minPrice = one(sp.minPrice).replace(/[^\d.]/g, "");
  const maxPrice = one(sp.maxPrice).replace(/[^\d.]/g, "");
  const minBeds = one(sp.minBeds).replace(/[^\d]/g, "");

  const where: SQL[] = [
    inArray(
      listings.status,
      status && (PUBLIC_STATUSES as readonly string[]).includes(status)
        ? [status as "active"]
        : [...PUBLIC_STATUSES],
    ),
  ];
  if (q) where.push(ilike(listings.title, `%${q}%`));
  if (district && CAYMAN_DISTRICTS.some((d) => d.value === district))
    where.push(eq(listings.district, district as "george_town"));
  if ((PROPERTY_TYPES as readonly string[]).includes(propertyType))
    where.push(eq(listings.propertyType, propertyType as "residential"));
  if ((TENURES as readonly string[]).includes(tenure))
    where.push(eq(listings.tenure, tenure as "freehold"));
  if (minPrice) where.push(gte(listings.priceKyd, minPrice));
  if (maxPrice) where.push(lte(listings.priceKyd, maxPrice));
  if (minBeds) where.push(gte(listings.bedrooms, Number(minBeds)));

  const rows = await db
    .select()
    .from(listings)
    .where(and(...where))
    .limit(120);
  const visible = rows.filter(isPubliclyVisible).map(toPublicListing);

  const ids = visible.map((l) => l.id);
  const media = ids.length
    ? await db
        .select()
        .from(listingMedia)
        .where(inArray(listingMedia.listingId, ids))
    : [];
  const primaryByListing = new Map<string, string>();
  for (const m of media) {
    if (!primaryByListing.has(m.listingId) || m.isPrimary) {
      primaryByListing.set(m.listingId, m.blobKey);
    }
  }

  const mapMarkers: MapMarker[] = visible
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({
      id: l.id,
      position: { lat: Number(l.latitude), lng: Number(l.longitude) },
      title: l.title,
      href: `/listings/${l.id}`,
    }));

  const hasFilters = Boolean(
    q || district || propertyType || tenure || status || minPrice || maxPrice || minBeds,
  );

  return (
    <main>
      <p className="eyebrow">Cayman Islands</p>
      <h1>Listings</h1>
      <p className="muted" style={{ marginTop: "-0.25rem" }}>
        {visible.length} propert{visible.length === 1 ? "y" : "ies"}
        {hasFilters ? " match your search" : " available"}
      </p>

      {/* Advanced search (GET — shareable URL, no client JS needed) */}
      <form
        method="get"
        className="card"
        style={{
          marginTop: "1rem",
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          alignItems: "end",
        }}
      >
        <label>
          Keyword
          <input name="q" defaultValue={q} placeholder="Title contains…" />
        </label>
        <label>
          District
          <select name="district" defaultValue={district}>
            <option value="">Any</option>
            {CAYMAN_DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select name="propertyType" defaultValue={propertyType}>
            <option value="">Any</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tenure
          <select name="tenure" defaultValue={tenure}>
            <option value="">Any</option>
            {TENURES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">Any (active/pending/sold)</option>
            {PUBLIC_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Min price (KYD)
          <input name="minPrice" inputMode="numeric" defaultValue={minPrice} />
        </label>
        <label>
          Max price (KYD)
          <input name="maxPrice" inputMode="numeric" defaultValue={maxPrice} />
        </label>
        <label>
          Min beds
          <input name="minBeds" inputMode="numeric" defaultValue={minBeds} />
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit">Search</button>
          {hasFilters ? (
            <Link href={"/listings" as Route} className="btn-outline">
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {visible.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          {CAYMAN_DISTRICTS.map((d) => {
            const n = visible.filter((l) => l.district === d.value).length;
            if (n === 0) return null;
            return (
              <span key={d.value} className="badge">
                {d.label} · {n}
              </span>
            );
          })}
        </div>
      ) : null}

      {mapMarkers.length > 0 ? (
        <div style={{ marginTop: "1.5rem" }}>
          <PropertyMap markers={mapMarkers} height={420} />
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Map shows the {mapMarkers.length} matching propert
            {mapMarkers.length === 1 ? "y" : "ies"} with a pin. Pins are
            approximate.
          </p>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <p className="muted" style={{ margin: 0 }}>
            {hasFilters
              ? "No properties match your search — try widening the filters."
              : "No public listings yet — please check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: "1.5rem" }}>
          {visible.map((l) => {
            const key = primaryByListing.get(l.id);
            return (
              <Link
                key={l.id}
                href={`/listings/${l.id}` as Route}
                className="listing-card"
                style={{ display: "block" }}
              >
                {key ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="listing-card__media"
                    src={`/api/media/${key}`}
                    alt={l.title}
                  />
                ) : (
                  <div
                    className="listing-card__media"
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--n-400)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    CIREME
                  </div>
                )}
                <div className="listing-card__body">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span className="listing-card__price">
                      {l.priceKyd ? `KYD ${l.priceKyd}` : "Price on request"}
                    </span>
                    {statusBadge(l.status)}
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--n-900)" }}>
                    {l.title}
                  </div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    {DISTRICT_LABEL[l.district] ?? l.district} ·{" "}
                    {l.propertyType} · {l.tenure}
                    {l.bedrooms != null ? ` · ${l.bedrooms} bd` : ""}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
