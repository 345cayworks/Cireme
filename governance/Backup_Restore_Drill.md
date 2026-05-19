# CIREME Backup & Restore Drill — v1 (U7)

> Procedure for the U7 exit criterion "restore drill passes within RTO".
> **Status: NOT YET EXECUTED — [OWNER] task.** The build agent cannot run a
> live drill against production infrastructure; this is the procedure to run
> and the result to record here.

## Targets

- **RPO** (max data loss): ≤ 24h (tighten with Neon PITR if required).
- **RTO** (max time to restore service): ≤ 2h.
- Scope: the Postgres database (Neon via Netlify DB). Blob media (Netlify
  Blobs) and the stateless app (redeployable from `main`) are out of the DB
  drill but noted below.

## Backup posture

- DB: Neon provides automated backups + point-in-time recovery. Confirm PITR
  retention window in the Neon project settings; record it here.
- Schema/migrations are versioned in `drizzle/`; a rebuilt DB is brought to
  current schema with `npm run db:migrate`.
- Media: Netlify Blobs durability is provider-managed; a lost blob degrades a
  listing image only (no data-model corruption).

## Drill procedure (staging, [OWNER] to execute)

1. Snapshot current row counts against the **source** DB (read-only, no
   writes):
   `DATABASE_URL=<source> npm run db:drill-snapshot -- snapshot governance/drill-before.json`
   (covers `users`, `applications`, `memberships`, `listings`,
   `listingMedia`, `complianceIssues`, `complianceActions`, `auditLog`).
2. Create a fresh Neon branch/restore point from the latest backup (or PITR
   to T-1h).
3. Point a staging deploy at the restored DB; run `npm run db:migrate`
   (idempotent) and start the app.
4. Verify:
   - Machine check (read-only) against the **restored** DB:
     `DATABASE_URL=<restored> npm run db:drill-snapshot -- verify governance/drill-before.json`
     — exits non-zero if any table fell below the RPO tolerance
     (`DRILL_RPO_TOLERANCE`, default 0) or if `auditLog` lost any rows
     (append-only integrity). Do **not** commit the `drill-before.json`
     snapshot (it is a local drill artifact).
   - Manual check: login works; a known listing renders publicly; admin
     dashboard counts look right.
5. Record elapsed wall-clock time (start of step 2 → step 4 verified).

## Result log

| Date | Executor | RPO observed | RTO observed | Pass/Fail | Notes |
|---|---|---|---|---|---|
| _pending_ | _[OWNER]_ | | | | Drill not yet run |

**Exit gate:** this table has a Pass row with RTO ≤ 2h before launch.
