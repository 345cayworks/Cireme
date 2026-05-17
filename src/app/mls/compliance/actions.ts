"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  dismissComplianceIssue,
  recordComplianceAction,
  runComplianceSweep,
} from "@/lib/compliance-service";
import { requirePermission } from "@/lib/auth-guard";

const actionSchema = z.object({
  issueId: z.string().uuid(),
  actionType: z.enum([
    "flagged",
    "correction_requested",
    "unpublished",
    "removed",
    "account_suspended",
    "account_terminated",
  ]),
  note: z.string().trim().max(2000).optional(),
});

const dismissSchema = z.object({
  issueId: z.string().uuid(),
  note: z.string().trim().max(2000).optional(),
});

export async function runSweepAction() {
  const user = await requirePermission("compliance:review");
  await runComplianceSweep(user.id);
  revalidatePath("/mls/compliance");
}

export async function recordActionAction(formData: FormData) {
  const user = await requirePermission("compliance:review");
  const parsed = actionSchema.safeParse({
    issueId: formData.get("issueId"),
    actionType: formData.get("actionType"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return;

  await recordComplianceAction({
    issueId: parsed.data.issueId,
    actionType: parsed.data.actionType,
    actorId: user.id,
    note: parsed.data.note,
  });
  revalidatePath("/mls/compliance");
}

export async function dismissIssueAction(formData: FormData) {
  const user = await requirePermission("compliance:review");
  const parsed = dismissSchema.safeParse({
    issueId: formData.get("issueId"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return;

  await dismissComplianceIssue({
    issueId: parsed.data.issueId,
    actorId: user.id,
    note: parsed.data.note,
  });
  revalidatePath("/mls/compliance");
}
