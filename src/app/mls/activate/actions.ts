"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { ActivationError, redeemActivationToken } from "@/lib/activation-service";

export async function setPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const back = (msg: string): never =>
    redirect(
      `/mls/activate?token=${encodeURIComponent(token)}&error=${encodeURIComponent(msg)}` as Route,
    );

  if (!token) redirect("/mls/activate" as Route);
  if (password !== confirm) back("Passwords do not match.");

  try {
    await redeemActivationToken(token, password);
  } catch (e) {
    if (e instanceof ActivationError) back(e.message);
    throw e;
  }
  redirect("/mls/login?activated=1" as Route);
}
