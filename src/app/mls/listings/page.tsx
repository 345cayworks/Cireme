import type { Route } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import { validateCompleteness } from "@/lib/listing-lifecycle";
import { can } from "@/lib/rbac";
import { createListingAction } from "./actions";
import PropertyMap from "@/components/PropertyMap";
import ListingModeration from "./ListingModeration";

export const dynamic = "force-dynamic";

const PROPERTY_TYPES = [
  "residential",
  "condo",
  "land",
  "commercial",
  "multi_family",
] as const;
const DISTRICTS = [
  "george_town",
  "west_bay",
  "bodden_town",
  "north_side",
  "east_end",
  "cayman_brac",
  "little_cayman",
] as const;
const TENURES = ["freehold", "strata", "leasehold"] as const;
const STATUS_FILTERS = [
  "all",
  "draft",
  "incomplete",
  "active",
  "pending",
  "sold",
  "withdrawn",
  "expired",
  "off_market",
  "canceled",
] as const;

export default async function ListingsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let user;
  try {
    user = await requirePermission("listing:create");
  } catch (error) {
    if (!(error instanceof ForbiddenError)) throw error;
    try {
      user = await requirePermission("listing:moderate");
    } catch (error2) {
      if (error2 instanceof ForbiddenError) {
        return (
          <main>
            <h1>Listings</h1>
            <div className="card">
              <p>Your role cannot create or moderate listings.</p>
              <p className="muted">
                <Link href="/mls/dashboard">← Dashboard</Link>
              </p>
            </div>
          </main>
        );
      }
      throw error2;
    }
  }

  // Admins (listing:moderate) get the read-only moderation registry.
  if (can(user.role, "listing:moderate")) {
    return <ListingModeration status={status} />;
  }

  const seesAll = can(user.role, "listing:edit:office");
  const rows = seesAll
    ? await db
        .select()
        .from(listings)
        .orderBy(desc(listings.updatedAt))
        .limit(200)
    : await db
        .select()
        .from(listings)
        .where(eq(listings.agentId, user.id))
        .orderBy(desc(listings.updatedAt))
        .limit(200);

  const ids = rows.map((r) => r.id);
  const mediaRows = ids.length
    ? await db
        .select()
        .from(listingMedia)
        .where(inArray(listingMedia.listingId, ids))
    : [];
  const mediaCount = new Map<string, number>();
  for (const m of mediaRows) {
    mediaCount.set(m.listingId, (mediaCount.get(m.listingId) ?? 0) + 1);
  }

  const filter = (STATUS_FILTERS as readonly string[]).includes(status ?? "")
    ? status!
    : "all";
  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <main>
      <p className="eyebrow">Workspace</p>
      <h1 style={{ marginTop: 0 }}>{seesAll ? "All listings" : "My listings"}</h1>
      <p className="muted">
        Create a draft, then open a listing to complete it, add photos, set
        price and publish.
      </p>

      <details className="card" style={{ marginBottom: "1.5rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          New listing
        </summary>
        <form
          action={createListingAction}
          style={{ marginTop: "1rem", maxWidth: 520 }}
        >
          <label>
            Title
            <input name="title" required minLength={3} />
          </label>
          <label>
            Property type
            <select name="propertyType">
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            District
            <select name="district">
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tenure
            <select name="tenure">
              {TENURES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price (KYD)
            <input name="priceKyd" placeholder="950000.00" />
          </label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <label style={{ flex: 1 }}>
              Land Block
              <input name="landBlock" placeholder="12A" />
            </label>
            <label style={{ flex: 1 }}>
              Land Parcel
              <input name="landParcel" placeholder="345" />
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <label style={{ flex: 1 }}>
              Bedrooms
              <input name="bedrooms" inputMode="numeric" />
            </label>
            <label style={{ flex: 1 }}>
              Bathrooms
              <input name="bathrooms" inputMode="decimal" placeholder="2.5" />
            </label>
            <label style={{ flex: 1 }}>
              Area (sq ft)
              <input name="areaSqFt" inputMode="numeric" />
            </label>
          </div>
          <label>
            Public description
            <textarea name="publicDescription" rows={3} />
          </label>
          <div style={{ marginTop: "0.75rem" }}>
            <span style={{ display: "block", fontWeight: 600 }}>
              Location pin (optional)
            </span>
            <span
              className="muted"
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              Coarse location only — never a substitute for Block &amp; Parcel.
            </span>
            <PropertyMap editable height={300} />
          </div>
          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Create draft
          </button>
        </form>
      </details>

      <div className="chipbar">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={
              (s === "all"
                ? "/mls/listings"
                : `/mls/listings?status=${s}`) as Route
            }
            className="chip"
            aria-current={filter === s ? "true" : undefined}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="muted">
          No listings yet — create your first draft above.
        </p>
      ) : visible.length === 0 ? (
        <p className="muted">No listings with status “{filter}”.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {visible.map((listing) => {
            const mc = mediaCount.get(listing.id) ?? 0;
            const completeness = validateCompleteness(listing, mc);
            return (
              <li
                key={listing.id}
                className="card"
                style={{ marginBottom: "1rem", background: "var(--surface)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <Link
                      href={`/mls/listings/${listing.id}/edit` as Route}
                      style={{ fontWeight: 600 }}
                    >
                      {listing.title}
                    </Link>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {listing.publicReference} ·{" "}
                      {listing.district.replace(/_/g, " ")} ·{" "}
                      {listing.priceKyd
                        ? `KYD ${listing.priceKyd}`
                        : "no price"}{" "}
                      · {mc} photo{mc === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`badge badge--${listing.status}`}>
                      {listing.status.replace(/_/g, " ")}
                    </span>
                    <div
                      className="muted"
                      style={{ fontSize: "0.78rem", marginTop: "0.35rem" }}
                    >
                      {completeness.ok
                        ? "✓ ready to publish"
                        : `${completeness.missing.length} item${
                            completeness.missing.length === 1 ? "" : "s"
                          } missing`}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "0.6rem" }}>
                  <Link
                    href={`/mls/listings/${listing.id}/edit` as Route}
                    className="btn-outline"
                  >
                    Open &amp; edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
