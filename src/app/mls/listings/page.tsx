import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { listingMedia, listings } from "@/db/schema";
import { ForbiddenError, requirePermission } from "@/lib/auth-guard";
import { allowedTransitions } from "@/lib/listing-lifecycle";
import { can } from "@/lib/rbac";
import {
  changePriceAction,
  createListingAction,
  deleteMediaAction,
  transitionAction,
  uploadMediaAction,
} from "./actions";
import PropertyMap from "@/components/PropertyMap";

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

export default async function ListingsAdminPage() {
  let user;
  try {
    user = await requirePermission("listing:create");
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <main>
          <h1>My listings</h1>
          <div className="card">
            <p>Your role cannot create or manage listings.</p>
            <p className="muted">
              <Link href="/mls/dashboard">← Back to MLS Core</Link>
            </p>
          </div>
        </main>
      );
    }
    throw error;
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
        .orderBy(listingMedia.position)
    : [];
  const mediaByListing = new Map<string, typeof mediaRows>();
  for (const m of mediaRows) {
    const list = mediaByListing.get(m.listingId) ?? [];
    list.push(m);
    mediaByListing.set(m.listingId, list);
  }

  return (
    <main>
      <p className="muted">
        <Link href="/mls/dashboard">← MLS Core</Link>
      </p>
      <h1>{seesAll ? "All listings" : "My listings"}</h1>

      <details className="card" style={{ marginBottom: "1.5rem" }}>
        <summary style={{ cursor: "pointer" }}>New listing</summary>
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
          <label>
            Land Block
            <input name="landBlock" placeholder="12A" />
          </label>
          <label>
            Land Parcel
            <input name="landParcel" placeholder="345" />
          </label>
          <label>
            Public description
            <input name="publicDescription" />
          </label>
          <div style={{ marginTop: "0.75rem" }}>
            <span style={{ display: "block", fontWeight: 600 }}>
              Location pin (optional)
            </span>
            <span
              className="muted"
              style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem" }}
            >
              Drop a pin on the property, or use your current location. Coarse
              location only — never a substitute for Block &amp; Parcel.
            </span>
            <PropertyMap editable height={300} />
          </div>
          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Create draft
          </button>
        </form>
      </details>

      {rows.length === 0 ? (
        <p className="muted">No listings yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map((listing) => {
            const next = allowedTransitions(listing.status);
            return (
              <li
                key={listing.id}
                className="card"
                style={{ marginBottom: "1rem" }}
              >
                <div>
                  <strong>{listing.title}</strong>{" "}
                  <span className="muted">
                    · {listing.publicReference} · {listing.status} ·{" "}
                    {listing.priceKyd ? `KYD ${listing.priceKyd}` : "no price"}
                  </span>
                </div>

                {next.length > 0 ? (
                  <form
                    action={transitionAction}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      marginTop: "0.5rem",
                    }}
                  >
                    <input
                      type="hidden"
                      name="listingId"
                      value={listing.id}
                    />
                    <select name="toStatus" required>
                      {next.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Change status</button>
                  </form>
                ) : (
                  <p className="muted" style={{ fontSize: "0.8rem" }}>
                    Terminal status — no transitions.
                  </p>
                )}

                <form
                  action={changePriceAction}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginTop: "0.5rem",
                  }}
                >
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input
                    name="newPriceKyd"
                    placeholder="New price KYD"
                    style={{ margin: 0, maxWidth: 200 }}
                  />
                  <button type="submit">Update price</button>
                </form>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginTop: "0.5rem",
                  }}
                >
                  {(mediaByListing.get(listing.id) ?? []).map((m) => (
                    <form
                      key={m.id}
                      action={deleteMediaAction}
                      style={{ position: "relative" }}
                    >
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />
                      <input type="hidden" name="mediaId" value={m.id} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/media/${m.blobKey}`}
                        alt={m.caption ?? "listing media"}
                        style={{
                          height: 64,
                          width: 64,
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
                  ))}
                </div>

                <form
                  action={uploadMediaAction}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginTop: "0.5rem",
                  }}
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
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
