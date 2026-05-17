/**
 * Development seed. Idempotent-ish: it clears the demo tables and rebuilds a
 * small dataset that exercises every compliance rule so the /mls dashboard is
 * demonstrable. Never run against production.
 *
 *   npm run db:seed
 */
import { hash } from "bcryptjs";

import { db } from "@/db";
import {
  auditLog,
  complianceActions,
  complianceIssues,
  listingMedia,
  listingPriceHistory,
  listingStatusHistory,
  listings,
  offices,
  users,
} from "@/db/schema";

const DAY = 86_400_000;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed: NODE_ENV=production");
  }

  // Order matters: clear children before parents.
  await db.delete(auditLog);
  await db.delete(complianceActions);
  await db.delete(complianceIssues);
  await db.delete(listingPriceHistory);
  await db.delete(listingStatusHistory);
  await db.delete(listingMedia);
  await db.delete(listings);
  await db.delete(users);
  await db.delete(offices);

  const [office] = await db
    .insert(offices)
    .values({
      name: "Seven Mile Realty",
      slug: "seven-mile-realty",
      complianceContactEmail: "compliance@example.ky",
    })
    .returning();

  const passwordHash = await hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@example.ky",
      passwordHash,
      displayName: "MLS Admin",
      role: "mls_admin",
      status: "active",
      officeId: office!.id,
    })
    .returning();

  const [agent] = await db
    .insert(users)
    .values({
      email: "agent@example.ky",
      passwordHash,
      displayName: "Independent Agent",
      role: "agent",
      status: "active",
      officeId: office!.id,
    })
    .returning();

  const now = Date.now();
  const base = {
    propertyType: "residential" as const,
    district: "george_town" as const,
    tenure: "freehold" as const,
    agentId: agent!.id,
    officeId: office!.id,
    publicDescription: "Well presented, move-in ready.",
  };

  const inserted = await db
    .insert(listings)
    .values([
      // Clean, complete, fresh — should produce no issue.
      {
        ...base,
        publicReference: "CIR-CLEAN01",
        title: "Tidy canal home",
        status: "active",
        landBlock: "12A",
        landParcel: "100",
        priceKyd: "950000.00",
      },
      // Missing required field (no price) — missing_required_fields.
      {
        ...base,
        publicReference: "CIR-INCOMP1",
        title: "Price-less listing",
        status: "active",
        landBlock: "12A",
        landParcel: "200",
        priceKyd: null,
      },
      // Stale active listing — stale_listing.
      {
        ...base,
        publicReference: "CIR-STALE01",
        title: "Forgotten bungalow",
        status: "active",
        landBlock: "12A",
        landParcel: "300",
        priceKyd: "725000.00",
        updatedAt: new Date(now - 200 * DAY),
      },
      // Sold price set but still active — sold_left_active.
      {
        ...base,
        publicReference: "CIR-SOLD001",
        title: "Quietly sold villa",
        status: "active",
        landBlock: "12A",
        landParcel: "400",
        priceKyd: "1300000.00",
        soldPriceKyd: "1275000.00",
      },
      // Duplicate pair: same district + Block & Parcel, both active.
      {
        ...base,
        publicReference: "CIR-DUPE00A",
        title: "Beachfront listing (A)",
        status: "active",
        landBlock: "99Z",
        landParcel: "777",
        priceKyd: "2100000.00",
      },
      {
        ...base,
        publicReference: "CIR-DUPE00B",
        title: "Beachfront listing (B)",
        status: "active",
        landBlock: "99Z",
        landParcel: "777",
        priceKyd: "2150000.00",
      },
    ])
    .returning();

  // Give every listing one media row so "missing media" doesn't mask the
  // intended rule under test (except the deliberately-incomplete one).
  for (const listing of inserted) {
    if (listing.publicReference === "CIR-INCOMP1") continue;
    await db.insert(listingMedia).values({
      listingId: listing.id,
      blobKey: `listings/${listing.id}/seed.jpg`,
      isPrimary: true,
      position: 0,
    });
  }

  console.log(
    `Seeded: office=${office!.name}, users=[${admin!.email}, ${agent!.email}], listings=${inserted.length}`,
  );
  console.log("Login: admin@example.ky / password123 (role: mls_admin)");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
