"use server";

import { z } from "zod";

import { createApplication } from "@/lib/membership-service";

const schema = z.object({
  requestedType: z.enum([
    "private_seller",
    "independent_broker",
    "advertiser",
  ]),
  applicantEmail: z.string().trim().email().max(254),
  displayName: z.string().trim().min(2).max(120),
  firm: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type ApplyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok" };

export async function submitApplicationAction(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const parsed = schema.safeParse({
    requestedType: formData.get("requestedType"),
    applicantEmail: formData.get("applicantEmail"),
    displayName: formData.get("displayName"),
    firm: formData.get("firm") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Please check the form — a valid email, your name, and a partner type are required.",
    };
  }

  const { requestedType, applicantEmail, displayName, firm, message } =
    parsed.data;

  try {
    await createApplication({
      applicantEmail,
      requestedType,
      metadata: { displayName, firm: firm ?? null, message: message ?? null },
    });
  } catch {
    return {
      status: "error",
      message: "We couldn't submit your application. Please try again later.",
    };
  }

  return { status: "ok" };
}
