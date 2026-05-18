"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActivationError, issueActivationToken } from "@/lib/activation-service";
import { requirePermission } from "@/lib/auth-guard";
import {
  transitionApplication,
  transitionMembershipStatus,
} from "@/lib/membership-service";

const applicationSchema = z.object({
  applicationId: z.string().uuid(),
  toStatus: z.enum([
    "under_review",
    "approved",
    "denied",
    "withdrawn",
  ]),
});

const membershipSchema = z.object({
  membershipId: z.string().uuid(),
  toStatus: z.enum(["active", "suspended", "inactive"]),
  note: z.string().trim().max(2000).optional(),
});

export async function reviewApplicationAction(formData: FormData) {
  const user = await requirePermission("member:approve");
  const parsed = applicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
    toStatus: formData.get("toStatus"),
  });
  if (!parsed.success) return;

  await transitionApplication({
    applicationId: parsed.data.applicationId,
    toStatus: parsed.data.toStatus,
    actorId: user.id,
  });
  revalidatePath("/mls/members");
}

/**
 * Issues a single-use activation link for a pending account. Returns the link
 * for the admin to relay out-of-band (no email system yet). The raw token is
 * shown once and never persisted.
 */
export async function generateActivationLinkAction(
  userId: string,
): Promise<{ link: string; expiresAt: string } | { error: string }> {
  const admin = await requirePermission("member:approve");
  if (!z.string().uuid().safeParse(userId).success) {
    return { error: "Invalid user." };
  }
  try {
    const { token, expiresAt } = await issueActivationToken(
      userId,
      admin.id,
    );
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host = h.get("host") ?? "";
    const link = `${proto}://${host}/mls/activate?token=${encodeURIComponent(token)}`;
    revalidatePath("/mls/members");
    return { link, expiresAt: expiresAt.toISOString() };
  } catch (e) {
    return {
      error:
        e instanceof ActivationError
          ? e.message
          : "Could not generate an activation link.",
    };
  }
}

export async function membershipStatusAction(formData: FormData) {
  const user = await requirePermission("member:approve");
  const parsed = membershipSchema.safeParse({
    membershipId: formData.get("membershipId"),
    toStatus: formData.get("toStatus"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return;

  await transitionMembershipStatus({
    membershipId: parsed.data.membershipId,
    toStatus: parsed.data.toStatus,
    actorId: user.id,
    note: parsed.data.note,
  });
  revalidatePath("/mls/members");
}
