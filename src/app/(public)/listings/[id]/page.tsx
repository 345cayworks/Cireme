import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";
import { listListingMedia } from "@/lib/media-service";

export const dynamic = "force-dynamic";

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

  return (
    <main>
      <p className="muted">
        <Link href="/listings">← All listings</Link>
      </p>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.district} · {listing.propertyType} · {listing.tenure} ·{" "}
        {listing.status} ·{" "}
        {listing.priceKyd ? `KYD ${listing.priceKyd}` : "Price on request"}
      </p>

      {media.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "0.75rem",
            margin: "1rem 0",
          }}
        >
          {media.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.id}
              src={`/api/media/${m.blobKey}`}
              alt={m.caption ?? listing.title}
              style={{ width: "100%", borderRadius: 8 }}
            />
          ))}
        </div>
      ) : null}

      <div className="card">
        <p>{listing.publicDescription ?? "No description provided."}</p>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          {listing.bedrooms ?? "—"} bed · {listing.bathrooms ?? "—"} bath ·{" "}
          {listing.areaSqFt ? `${listing.areaSqFt} sq ft` : "size n/a"} · Ref{" "}
          {listing.publicReference}
        </p>
      </div>
    </main>
  );
}
