import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { env } from "@/lib/env";
import * as schema from "./schema";

// The Pool driver uses a WebSocket session, which enables multi-statement
// transactions (required for the lifecycle/audit writes). Node has no global
// WebSocket in all runtimes we target, so wire the `ws` implementation. This
// is config-only and reads no environment, so it is safe at import.
neonConfig.webSocketConstructor = ws;

function createDb() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export type Database = ReturnType<typeof createDb>;

let instance: Database | undefined;

function getDb(): Database {
  if (!instance) instance = createDb();
  return instance;
}

/**
 * Lazily-initialized Drizzle client. The Pool (and therefore the env read) is
 * created on first use, not at import, so `next build` can collect page data
 * for dynamic routes without a live DATABASE_URL.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

export { schema };
