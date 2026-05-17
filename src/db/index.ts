import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { env } from "@/lib/env";
import * as schema from "./schema";

// The Pool driver uses a WebSocket session, which enables multi-statement
// transactions (required for the lifecycle/audit writes). Node has no global
// WebSocket in all runtimes we target, so wire the `ws` implementation.
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export type Database = typeof db;
export { schema };
