# CIREME — Cayman Islands Real Estate Market Explorer

An open Cayman Islands real-estate marketplace for **private sellers** and
**independent brokers**, built with no compensation lock-in (locked Phase 0
positioning — see `CIREME_MLS_Roadmap_Addendums.md`).

## Architecture

Two structurally separated layers in one Next.js codebase:

- **Public portal** — routes under `src/app/(public)`. Reads only the
  public-safe projection (`src/lib/public-safe.ts`); private fields are
  physically excluded, not filtered ad hoc.
- **Private MLS core** — routes under `src/app/mls`. Gated by Auth.js
  middleware (`src/middleware.ts`) and role checks (`src/lib/rbac.ts`).

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | Netlify DB (Neon serverless Postgres) |
| Data access | Drizzle ORM, migration-first |
| Auth | Auth.js (credentials + role-aware JWT sessions) |

## Data model

`src/db/schema.ts` is the Phase 1–3 foundation: accounts, offices,
memberships/applications, listings with Cayman-correct fields (Block & Parcel,
district enum, tenure, KYD), append-only status/price history, compliance, and
an immutable audit log. There are **no compensation/cooperation fields** by
design.

## Local development

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL and AUTH_SECRET
npm run db:push              # apply schema to your Neon database
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (next config) |
| `npm run build` | Production build |
| `npm run db:generate` | Generate a SQL migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (dev) |

## Status

Foundation only (roadmap Phases 1–3 base): project scaffold, schema,
auth skeleton, and the public/private route split. Listing lifecycle (Phase 4)
and compliance (Phase 5) follow. See `CIREME_Development_Plan.md`.
