"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { listings } from "@/db/schema";
import { requirePermission } from "@/lib/auth-guard";
import {
  changeListingPrice,
  createListing,
  transitionListingStatus,
} from "@/lib/listing-service";
import { addListingMedia, deleteListingMedia } from "@/lib/media-service";
import { can } from "@/lib/rbac";

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  propertyType: z.enum([
    "residential",
    "condo",
    "land",
    "commercial",
    "multi_family",
  ]),
  district: z.enum([
    "george_town",
    "west_bay",
    "bodden_town",
    "north_side",
    "east_end",
    "cayman_brac",
    "little_cayman",
  ]),
  tenure: z.enum(["freehold", "strata", "leasehold"]),
  priceKyd: z.string().trim().regex(/^\d+(\.\d{1,2})?$/).optional(),
  landBlock: z.string().trim().max(50).optional(),
  landParcel: z.string().trim().max(50).optional(),
  publicDescription: z.string().trim().max(4000).optional(),
});

const transitionSchema = z.object({
  listingId: z.string().uuid(),
  toStatus: z.enum([
    "draft",
    "incomplete",
    "active",
    "pending",
    "sold",
    "withdrawn",
    "expired",
    "canceled",
    "off_market",
  ]),
});

const priceSchema = z.object({
  listingId: z.string().uuid(),
  newPriceKyd: z.string().trim().regex(/^\d+(\.\d{1,2})?$/),
});

/** Agents may only touch their own listings; office/admin roles are broader. */
async function assertCanEdit(
  user: { id: string; role: Parameters<typeof can>[0] },
  listingId: string,
) {
  if (can(user.role, "listing:edit:office")) return;
  const [row] = await db
    .select({ agentId: listings.agentId })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  if (!row || row.agentId !== user.id) {
    throw new Error("Not permitted to edit this listing");
  }
}

export async function createListingAction(formData: FormData) {
  const user = await requirePermission("listing:create");
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    propertyType: formData.get("propertyType"),
    district: formData.get("district"),
    tenure: formData.get("tenure"),
    priceKyd: formData.get("priceKyd") || undefined,
    landBlock: formData.get("landBlock") || undefined,
    landParcel: formData.get("landParcel") || undefined,
    publicDescription: formData.get("publicDescription") || undefined,
  });
  if (!parsed.success) return;

  await createListing({
    ...parsed.data,
    agentId: user.id,
    officeId: null,
    priceKyd: parsed.data.priceKyd ?? null,
  });
  revalidatePath("/mls/listings");
}

export async function transitionAction(formData: FormData) {
  const user = await requirePermission("listing:edit:own");
  const parsed = transitionSchema.safeParse({
    listingId: formData.get("listingId"),
    toStatus: formData.get("toStatus"),
  });
  if (!parsed.success) return;

  await assertCanEdit(user, parsed.data.listingId);
  await transitionListingStatus({
    listingId: parsed.data.listingId,
    toStatus: parsed.data.toStatus,
    actorId: user.id,
  });
  revalidatePath("/mls/listings");
}

export async function changePriceAction(formData: FormData) {
  const user = await requirePermission("listing:edit:own");
  const parsed = priceSchema.safeParse({
    listingId: formData.get("listingId"),
    newPriceKyd: formData.get("newPriceKyd"),
  });
  if (!parsed.success) return;

  await assertCanEdit(user, parsed.data.listingId);
  await changeListingPrice({
    listingId: parsed.data.listingId,
    newPriceKyd: parsed.data.newPriceKyd,
    actorId: user.id,
  });
  revalidatePath("/mls/listings");
}

export async function uploadMediaAction(formData: FormData) {
  const user = await requirePermission("listing:edit:own");
  const listingId = formData.get("listingId");
  const file = formData.get("file");

  if (typeof listingId !== "string" || !(file instanceof File)) return;
  if (file.size === 0 || file.size > MAX_MEDIA_BYTES) return;
  if (!file.type.startsWith("image/")) return;

  await assertCanEdit(user, listingId);
  await addListingMedia({ listingId, file, actorId: user.id });
  revalidatePath("/mls/listings");
}

const deleteMediaSchema = z.object({
  listingId: z.string().uuid(),
  mediaId: z.string().uuid(),
});

export async function deleteMediaAction(formData: FormData) {
  const user = await requirePermission("listing:edit:own");
  const parsed = deleteMediaSchema.safeParse({
    listingId: formData.get("listingId"),
    mediaId: formData.get("mediaId"),
  });
  if (!parsed.success) return;

  await assertCanEdit(user, parsed.data.listingId);
  await deleteListingMedia({
    listingId: parsed.data.listingId,
    mediaId: parsed.data.mediaId,
    actorId: user.id,
  });
  revalidatePath("/mls/listings");
}
