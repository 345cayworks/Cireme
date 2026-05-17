import type { Route } from "next";
import Link from "next/link";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";
import { CAYMAN_DISTRICTS, DISTRICT_LABEL } from "@/data/cayman-districts";
import PropertyMap, { type MapMarker } from "@/components/PropertyMap";

export const dynamic = "force-dynamic";

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

export default async function ListingsPage() {
  const rows = await db.select().from(listings).limit(60);
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

  return (
    <main>
      <p className="eyebrow">Cayman Islands</p>
      <h1>Listings</h1>
      <p className="muted" style={{ marginTop: "-0.25rem" }}>
        {visible.length} propert{visible.length === 1 ? "y" : "ies"} available
      </p>

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
            Map pins are approximate. Use “Use my location” to centre the map
            near you.
          </p>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <p className="muted" style={{ margin: 0 }}>
            No public listings yet — please check back soon.
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
                    {l.propertyType} ·{" "}
                    {l.tenure}
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
