import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ACTIVATION_TTL_MS,
  activationExpiry,
  generateRawToken,
  hashToken,
  isExpired,
  validatePassword,
} from "./activation-token.ts";

test("raw tokens are unique, URL-safe, high-entropy", () => {
  const a = generateRawToken();
  const b = generateRawToken();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
  assert.ok(a.length >= 40);
});

test("hashToken is deterministic, differs per input, never the raw token", () => {
  const raw = generateRawToken();
  assert.equal(hashToken(raw), hashToken(raw));
  assert.notEqual(hashToken(raw), hashToken(generateRawToken()));
  assert.notEqual(hashToken(raw), raw);
  assert.match(hashToken(raw), /^[0-9a-f]{64}$/);
});

test("expiry boundary is inclusive (expired exactly at expiresAt)", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const exp = activationExpiry(now);
  assert.equal(exp.getTime() - now.getTime(), ACTIVATION_TTL_MS);
  assert.equal(isExpired(exp, new Date(exp.getTime() - 1)), false);
  assert.equal(isExpired(exp, exp), true);
  assert.equal(isExpired(exp, new Date(exp.getTime() + 1)), true);
});

test("validatePassword enforces a minimum length", () => {
  assert.equal(validatePassword("a-strong-pass"), null);
  assert.ok(validatePassword("short"));
  assert.ok(validatePassword(12345678));
  assert.ok(validatePassword(undefined));
});
