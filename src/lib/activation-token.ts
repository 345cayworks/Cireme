/**
 * Pure helpers for account-activation tokens (no DB, unit-tested).
 *
 * The raw token is high-entropy random, so a fast SHA-256 is the correct
 * at-rest representation: it makes the stored value useless if leaked while
 * keeping redemption an O(1) indexed lookup. bcrypt is for low-entropy
 * human passwords, not for 256-bit randoms.
 */
import { createHash, randomBytes } from "node:crypto";

/** Activation links are valid for 7 days, then the admin re-issues. */
export const ACTIVATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const MIN_PASSWORD_LENGTH = 10;

export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function activationExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + ACTIVATION_TTL_MS);
}

export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= expiresAt.getTime();
}

/** Returns an error string if the password is unacceptable, else null. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
