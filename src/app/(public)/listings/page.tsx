import type { Route } from "next";
import Link from "next/link";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { isPubliclyVisible, toPublicListing } from "@/lib/public-safe";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const rows = await db.select().from(listings).limit(50);
  const visible = rows.filter(isPubliclyVisible).map(toPublicListing);

  return (
    <main>
      <p className="muted">
        <Link href="/">← CIREME</Link>
      </p>
      <h1>Listings</h1>
      {visible.length === 0 ? (
        <p className="muted">No public listings yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {visible.map((l) => (
            <li key={l.id} className="card" style={{ marginBottom: "1rem" }}>
              <Link
                href={`/listings/${l.id}` as Route}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <strong>{l.title}</strong>
                <div className="muted">
                  {l.district} · {l.propertyType} · {l.tenure} ·{" "}
                  {l.priceKyd ? `KYD ${l.priceKyd}` : "Price on request"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
