/**
 * Listing media via Netlify Blobs (closes the media concept gap).
 *
 * Binary lives in Blobs; the listing_media row is the catalog/order/caption.
 * Blob write + DB row are not a single transaction (different systems) — on a
 * partial failure the orphan is the blob, never a dangling row, so reads stay
 * consistent. Production uses the global store; non-production deploys use a
 * deploy-scoped store so test media never lands in the production bucket.
 */
import { getDeployStore, getStore } from "@netlify/blobs";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { auditLog, listingMedia } from "@/db/schema";

const STORE_NAME = "listing-media";

function mediaStore() {
  return process.env.CONTEXT === "production"
    ? getStore(STORE_NAME)
    : getDeployStore(STORE_NAME);
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function addListingMedia(params: {
  listingId: string;
  file: File;
  actorId: string;
  caption?: string;
}) {
  const { listingId, file, actorId, caption } = params;
  const key = `${listingId}/${crypto.randomUUID()}-${safeName(file.name)}`;

  await mediaStore().set(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type || "application/octet-stream" },
  });

  const existing = await listListingMedia(listingId);
  const [row] = await db
    .insert(listingMedia)
    .values({
      listingId,
      blobKey: key,
      position: existing.length,
      isPrimary: existing.length === 0,
      caption: caption ?? null,
    })
    .returning();

  await db.insert(auditLog).values({
    actorId,
    entity: "listing",
    entityId: listingId,
    action: "media_added",
    after: { blobKey: key },
  });

  return row!;
}

export function listListingMedia(listingId: string) {
  return db
    .select()
    .from(listingMedia)
    .where(eq(listingMedia.listingId, listingId))
    .orderBy(listingMedia.position);
}

export async function getMediaBlob(
  key: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const result = await mediaStore().getWithMetadata(key, {
    type: "arrayBuffer",
  });
  if (!result) return null;
  const contentType =
    typeof result.metadata.contentType === "string"
      ? result.metadata.contentType
      : "application/octet-stream";
  return { data: result.data as ArrayBuffer, contentType };
}

export async function deleteListingMedia(params: {
  mediaId: string;
  listingId: string;
  actorId: string;
}) {
  const { mediaId, listingId, actorId } = params;
  const [row] = await db
    .select()
    .from(listingMedia)
    .where(
      and(
        eq(listingMedia.id, mediaId),
        eq(listingMedia.listingId, listingId),
      ),
    )
    .limit(1);
  if (!row) return;

  await db.delete(listingMedia).where(eq(listingMedia.id, mediaId));
  await mediaStore().delete(row.blobKey);

  await db.insert(auditLog).values({
    actorId,
    entity: "listing",
    entityId: listingId,
    action: "media_removed",
    before: { blobKey: row.blobKey },
  });
}
