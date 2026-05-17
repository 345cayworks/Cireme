import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Netlify DB (Neon extension) injects NETLIFY_DATABASE_URL; fall back to
    // it so migrations work without hand-copying the connection string.
    url:
      process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
