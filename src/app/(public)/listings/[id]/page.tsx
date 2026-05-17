import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";
import { listListingMedia } from "@/lib/media-service";

export const dynamic = "force-dynamic";

const INQUIRY_EMAIL = "info@cayworks.com";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (!row || !isPubliclyVisible(row)) notFound();

  const listing = toPublicListing(row);
  const media = await listListingMedia(id);
  const cover = media[0];

  const mailto = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(
    `Inquiry — ${listing.title} (${listing.publicReference})`,
  )}&body=${encodeURIComponent(
    `I'd like more information about listing ${listing.publicReference}: ${listing.title}.`,
  )}`;

  return (
    <main>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        <Link href="/listings">← All listings</Link>
      </p>

      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/media/${cover.blobKey}`}
          alt={cover.caption ?? listing.title}
          style={{
            width: "100%",
            maxHeight: 460,
            objectFit: "cover",
            borderRadius: "var(--r-lg)",
          }}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>{listing.title}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {listing.district.replace(/_/g, " ")} · {listing.propertyType} ·{" "}
            {listing.tenure}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.9rem",
              fontWeight: 600,
            }}
          >
            {listing.priceKyd ? `KYD ${listing.priceKyd}` : "Price on request"}
          </div>
          <span
            className={
              listing.status === "active"
                ? "badge badge--active"
                : listing.status === "pending"
                  ? "badge badge--pending"
                  : "badge badge--sold"
            }
          >
            {listing.status}
          </span>
        </div>
      </div>

      <div
        className="card"
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginTop: "1.5rem",
        }}
      >
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>
            Bedrooms
          </div>
          <strong>{listing.bedrooms ?? "—"}</strong>
        </div>
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>
            Bathrooms
          </div>
          <strong>{listing.bathrooms ?? "—"}</strong>
        </div>
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>
            Area
          </div>
          <strong>
            {listing.areaSqFt ? `${listing.areaSqFt} sq ft` : "—"}
          </strong>
        </div>
        <div>
          <div className="muted" style={{ fontSize: "0.8rem" }}>
            Reference
          </div>
          <strong>{listing.publicReference}</strong>
        </div>
      </div>

      {media.length > 1 ? (
        <div className="grid" style={{ marginTop: "1.5rem" }}>
          {media.slice(1).map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.id}
              src={`/api/media/${m.blobKey}`}
              alt={m.caption ?? listing.title}
              style={{
                width: "100%",
                borderRadius: "var(--r-md)",
                aspectRatio: "4 / 3",
                objectFit: "cover",
              }}
            />
          ))}
        </div>
      ) : null}

      <section className="section">
        <h2>About this property</h2>
        <p>{listing.publicDescription ?? "No description provided."}</p>
      </section>

      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Interested in this property?</strong>
          <div className="muted" style={{ fontSize: "0.9rem" }}>
            Contact us quoting reference {listing.publicReference}.
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/tools" className="btn btn-outline">
            Mortgage &amp; projection
          </Link>
          <a href={mailto} className="btn">
            Inquire
          </a>
        </div>
      </div>

      <p className="disclaimer" style={{ marginTop: "1.5rem" }}>
        Listing information is provided for general guidance, may change, and
        is not a valuation or an offer. CIREME is not a party to any
        transaction.
      </p>
    </main>
  );
}
