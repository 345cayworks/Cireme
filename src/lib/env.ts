import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  // Optional: only consumed by the super-admin bootstrap script, never by
  // the request path. Strength is enforced by the script, not here.
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPERADMIN_MASTER_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

function loadEnv(): Env {
  if (!cached) {
    cached = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
      SUPERADMIN_MASTER_KEY: process.env.SUPERADMIN_MASTER_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
  }
  return cached;
}

/**
 * Validated, typed environment access. Validation is lazy: it runs on first
 * property read, not at import. This keeps `next build` page-data collection
 * (which imports modules but does not execute requests) from requiring runtime
 * secrets, while still failing fast and loud on the first real request if a
 * required variable is missing.
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return loadEnv()[prop as keyof Env];
  },
});
