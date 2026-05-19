import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import {
  allowedTransitions,
  validateCompleteness,
} from "@/lib/listing-lifecycle";
import { can } from "@/lib/rbac";
import PropertyMap from "@/components/PropertyMap";
import {
  changePriceAction,
  deleteMediaAction,
  transitionAction,
  updateListingAction,
  uploadMediaAction,
} from "../../actions";

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

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  let user;
  try {
    user = await requirePermission("listing:edit:own");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>Edit listing</h1>
          <div className="card">
            <p>Your role cannot edit listings.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Dashboard</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
  }

  const { id } = await params;
  const { saved, error } = await searchParams;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  if (!listing) notFound();

  // Ownership: an agent may only edit their own; office/admin roles broader.
  const ownsOrBroader =
    can(user.role, "listing:edit:office") || listing.agentId === user.id;
  if (!ownsOrBroader) notFound();

  const media = await db
    .select()
    .from(listingMedia)
    .where(eq(listingMedia.listingId, id))
    .orderBy(desc(listingMedia.position));

  const completeness = validateCompleteness(listing, media.length);
  const next = allowedTransitions(listing.status);
  const initialPin =
    listing.latitude != null && listing.longitude != null
      ? { lat: Number(listing.latitude), lng: Number(listing.longitude) }
      : null;

  return (
    <main>
      <p className="muted">
        <Link href="/mls/listings">← My listings</Link>
      </p>
      <p className="eyebrow">Listing</p>
      <h1 style={{ marginTop: 0 }}>{listing.title}</h1>
      <p className="muted">
        {listing.publicReference} ·{" "}
        <span className={`badge badge--${listing.status}`}>
          {listing.status.replace(/_/g, " ")}
        </span>
      </p>

      {saved ? (
        <p role="status" style={{ color: "var(--success)" }}>
          Changes saved.
        </p>
      ) : null}
      {error ? (
        <p role="alert" style={{ color: "var(--error)" }}>
          Some fields were invalid — changes were not saved. Check required
          fields and try again.
        </p>
      ) : null}

      {/* Completeness checklist */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <strong>Publication readiness</strong>
        {completeness.ok ? (
          <p className="muted" style={{ margin: "0.4rem 0 0" }}>
            ✓ All required fields present and at least one image — this
            listing can be published.
          </p>
        ) : (
          <p className="muted" style={{ margin: "0.4rem 0 0" }}>
            Missing before it can go active:{" "}
            <strong>{completeness.missing.join(", ")}</strong>
          </p>
        )}
      </div>

      {/* Edit fields */}
      <form
        action={updateListingAction}
        style={{ marginTop: "1.5rem", maxWidth: 560 }}
      >
        <input type="hidden" name="listingId" value={listing.id} />
        <label>
          Title
          <input
            name="title"
            required
            minLength={3}
            defaultValue={listing.title}
          />
        </label>
        <label>
          Property type
          <select name="propertyType" defaultValue={listing.propertyType}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          District
          <select name="district" defaultValue={listing.district}>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tenure
          <select name="tenure" defaultValue={listing.tenure}>
            {TENURES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Public description
          <textarea
            name="publicDescription"
            rows={4}
            defaultValue={listing.publicDescription ?? ""}
          />
        </label>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <label style={{ flex: 1 }}>
            Land Block
            <input name="landBlock" defaultValue={listing.landBlock ?? ""} />
          </label>
          <label style={{ flex: 1 }}>
            Land Parcel
            <input
              name="landParcel"
              defaultValue={listing.landParcel ?? ""}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <label style={{ flex: 1 }}>
            Bedrooms
            <input
              name="bedrooms"
              inputMode="numeric"
              defaultValue={listing.bedrooms ?? ""}
            />
          </label>
          <label style={{ flex: 1 }}>
            Bathrooms
            <input
              name="bathrooms"
              inputMode="decimal"
              placeholder="2.5"
              defaultValue={listing.bathrooms ?? ""}
            />
          </label>
          <label style={{ flex: 1 }}>
            Area (sq ft)
            <input
              name="areaSqFt"
              inputMode="numeric"
              defaultValue={listing.areaSqFt ?? ""}
            />
          </label>
        </div>
        <label>
          Private remarks <span className="muted">(never shown publicly)</span>
          <textarea
            name="privateRemarks"
            rows={2}
            defaultValue={listing.privateRemarks ?? ""}
          />
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
          <PropertyMap editable initial={initialPin} height={300} />
        </div>
        <button type="submit" style={{ marginTop: "0.5rem" }}>
          Save changes
        </button>
      </form>

      {/* Price (separate history) */}
      <section className="section">
        <h2>Price</h2>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          Current: {listing.priceKyd ? `KYD ${listing.priceKyd}` : "no price"}.
          Price changes are tracked separately.
        </p>
        <form
          action={changePriceAction}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <input type="hidden" name="listingId" value={listing.id} />
          <input
            name="newPriceKyd"
            placeholder="New price KYD"
            style={{ margin: 0, maxWidth: 220 }}
          />
          <button type="submit">Update price</button>
        </form>
      </section>

      {/* Status */}
      <section className="section">
        <h2>Status</h2>
        {next.length > 0 ? (
          <form
            action={transitionAction}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <input type="hidden" name="listingId" value={listing.id} />
            <select name="toStatus" required>
              {next.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button type="submit">Change status</button>
          </form>
        ) : (
          <p className="muted">Terminal status — no transitions.</p>
        )}
        {!completeness.ok ? (
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Going active is blocked until the readiness items above are
            resolved (enforced server-side).
          </p>
        ) : null}
      </section>

      {/* Media */}
      <section className="section">
        <h2>Photos</h2>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
          }}
        >
          {media.length === 0 ? (
            <p className="muted">No photos yet — add at least one to publish.</p>
          ) : (
            media.map((m) => (
              <form
                key={m.id}
                action={deleteMediaAction}
                style={{ position: "relative" }}
              >
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="mediaId" value={m.id} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/media/${m.blobKey}`}
                  alt={m.caption ?? "listing media"}
                  style={{
                    height: 72,
                    width: 72,
                    objectFit: "cover",
                    borderRadius: 6,
                    display: "block",
                  }}
                />
                <button
                  type="submit"
                  title="Remove"
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "#c0392b",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    lineHeight: "20px",
                    padding: 0,
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </form>
            ))
          )}
        </div>
        <form
          action={uploadMediaAction}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <input type="hidden" name="listingId" value={listing.id} />
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            style={{ margin: 0 }}
          />
          <button type="submit">Upload image</button>
        </form>
      </section>
    </main>
  );
}
