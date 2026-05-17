/**
 * Listing lifecycle service (Phase 4) — applies lifecycle rules and records
 * the append-only history + audit trail.
 *
 * Each mutation runs in a single transaction (Neon Pool/WebSocket driver), so
 * the listing change and its history + audit rows commit atomically: there is
 * no observable state where a listing moved without a matching audit record.
 */
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLog,
  listingMedia,
  listingPriceHistory,
  listingStatusHistory,
  listings,
} from "@/db/schema";
import {
  ListingIncompleteError,
  ListingTransitionError,
  canTransition,
  requiresCompleteness,
  validateCompleteness,
  type ListingStatus,
} from "@/lib/listing-lifecycle";

export class ListingNotFoundError extends Error {
  readonly listingId: string;
  constructor(listingId: string) {
    super(`Listing not found: ${listingId}`);
    this.name = "ListingNotFoundError";
    this.listingId = listingId;
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function loadListing(tx: Tx, listingId: string) {
  const [row] = await tx
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  if (!row) throw new ListingNotFoundError(listingId);
  return row;
}

async function mediaCount(tx: Tx, listingId: string): Promise<number> {
  const [row] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(listingMedia)
    .where(eq(listingMedia.listingId, listingId));
  return row?.n ?? 0;
}

type NewListingInput = {
  title: string;
  propertyType: (typeof listings.$inferInsert)["propertyType"];
  district: (typeof listings.$inferInsert)["district"];
  tenure: (typeof listings.$inferInsert)["tenure"];
  agentId: string;
  officeId: string | null;
  priceKyd?: string | null;
  publicDescription?: string | null;
  landBlock?: string | null;
  landParcel?: string | null;
  bedrooms?: number | null;
  bathrooms?: string | null;
  areaSqFt?: number | null;
  latitude?: string | null;
  longitude?: string | null;
};

/** Creates a listing in `draft` and records the creation in the audit log. */
export async function createListing(input: NewListingInput) {
  return db.transaction(async (tx) => {
    const publicReference = `CIR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const [created] = await tx
      .insert(listings)
      .values({
        publicReference,
        title: input.title,
        propertyType: input.propertyType,
        status: "draft",
        district: input.district,
        tenure: input.tenure,
        agentId: input.agentId,
        officeId: input.officeId,
        priceKyd: input.priceKyd ?? null,
        publicDescription: input.publicDescription ?? null,
        landBlock: input.landBlock ?? null,
        landParcel: input.landParcel ?? null,
        bedrooms: input.bedrooms ?? null,
        bathrooms: input.bathrooms ?? null,
        areaSqFt: input.areaSqFt ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      })
      .returning();

    await tx.insert(auditLog).values({
      actorId: input.agentId,
      entity: "listing",
      entityId: created!.id,
      action: "listing_created",
      after: { publicReference, status: "draft" },
    });

    return created!;
  });
}

export async function transitionListingStatus(params: {
  listingId: string;
  toStatus: ListingStatus;
  actorId: string;
  note?: string;
}) {
  const { listingId, toStatus, actorId, note } = params;

  return db.transaction(async (tx) => {
    const listing = await loadListing(tx, listingId);
    const fromStatus = listing.status;

    if (fromStatus === toStatus) return listing;

    if (!canTransition(fromStatus, toStatus)) {
      throw new ListingTransitionError(fromStatus, toStatus);
    }

    if (requiresCompleteness(fromStatus, toStatus)) {
      const result = validateCompleteness(
        listing,
        await mediaCount(tx, listingId),
      );
      if (!result.ok) throw new ListingIncompleteError(result.missing);
    }

    const now = new Date();
    const setPublishedAt =
      toStatus === "active" && listing.publishedAt === null;

    const [updated] = await tx
      .update(listings)
      .set({
        status: toStatus,
        updatedAt: now,
        ...(setPublishedAt ? { publishedAt: now } : {}),
      })
      .where(eq(listings.id, listingId))
      .returning();

    await tx.insert(listingStatusHistory).values({
      listingId,
      fromStatus,
      toStatus,
      changedBy: actorId,
      note: note ?? null,
    });

    await tx.insert(auditLog).values({
      actorId,
      entity: "listing",
      entityId: listingId,
      action: "status_change",
      before: { status: fromStatus },
      after: { status: toStatus },
    });

    return updated;
  });
}

export async function changeListingPrice(params: {
  listingId: string;
  newPriceKyd: string;
  actorId: string;
}) {
  const { listingId, newPriceKyd, actorId } = params;

  return db.transaction(async (tx) => {
    const listing = await loadListing(tx, listingId);
    const oldPriceKyd = listing.priceKyd;

    if (oldPriceKyd === newPriceKyd) return listing;

    const [updated] = await tx
      .update(listings)
      .set({ priceKyd: newPriceKyd, updatedAt: new Date() })
      .where(eq(listings.id, listingId))
      .returning();

    await tx.insert(listingPriceHistory).values({
      listingId,
      oldPriceKyd,
      newPriceKyd,
      changedBy: actorId,
    });

    await tx.insert(auditLog).values({
      actorId,
      entity: "listing",
      entityId: listingId,
      action: "price_change",
      before: { priceKyd: oldPriceKyd },
      after: { priceKyd: newPriceKyd },
    });

    return updated;
  });
}
