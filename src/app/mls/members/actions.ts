"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

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
