/**
 * Listing lifecycle service (Phase 4) — applies lifecycle rules and records
 * the append-only history + audit trail.
 *
 * The Neon HTTP driver is single-statement (no multi-statement transactions),
 * so writes are ordered main-mutation-first, then history, then audit. History
 * and audit rows are append-only; the Phase 5 compliance sweep reconciles any
 * gap between a listing's current state and its history tail.
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

async function loadListing(listingId: string) {
  const [row] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  if (!row) throw new ListingNotFoundError(listingId);
  return row;
}

async function mediaCount(listingId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(listingMedia)
    .where(eq(listingMedia.listingId, listingId));
  return row?.n ?? 0;
}

export async function transitionListingStatus(params: {
  listingId: string;
  toStatus: ListingStatus;
  actorId: string;
  note?: string;
}) {
  const { listingId, toStatus, actorId, note } = params;
  const listing = await loadListing(listingId);
  const fromStatus = listing.status;

  if (fromStatus === toStatus) return listing;

  if (!canTransition(fromStatus, toStatus)) {
    throw new ListingTransitionError(fromStatus, toStatus);
  }

  if (requiresCompleteness(fromStatus, toStatus)) {
    const result = validateCompleteness(
      listing,
      await mediaCount(listingId),
    );
    if (!result.ok) throw new ListingIncompleteError(result.missing);
  }

  const now = new Date();
  const setPublishedAt =
    toStatus === "active" && listing.publishedAt === null;

  const [updated] = await db
    .update(listings)
    .set({
      status: toStatus,
      updatedAt: now,
      ...(setPublishedAt ? { publishedAt: now } : {}),
    })
    .where(eq(listings.id, listingId))
    .returning();

  await db.insert(listingStatusHistory).values({
    listingId,
    fromStatus,
    toStatus,
    changedBy: actorId,
    note: note ?? null,
  });

  await db.insert(auditLog).values({
    actorId,
    entity: "listing",
    entityId: listingId,
    action: "status_change",
    before: { status: fromStatus },
    after: { status: toStatus },
  });

  return updated;
}

export async function changeListingPrice(params: {
  listingId: string;
  newPriceKyd: string;
  actorId: string;
}) {
  const { listingId, newPriceKyd, actorId } = params;
  const listing = await loadListing(listingId);
  const oldPriceKyd = listing.priceKyd;

  if (oldPriceKyd === newPriceKyd) return listing;

  const [updated] = await db
    .update(listings)
    .set({ priceKyd: newPriceKyd, updatedAt: new Date() })
    .where(eq(listings.id, listingId))
    .returning();

  await db.insert(listingPriceHistory).values({
    listingId,
    oldPriceKyd,
    newPriceKyd,
    changedBy: actorId,
  });

  await db.insert(auditLog).values({
    actorId,
    entity: "listing",
    entityId: listingId,
    action: "price_change",
    before: { priceKyd: oldPriceKyd },
    after: { priceKyd: newPriceKyd },
  });

  return updated;
}
