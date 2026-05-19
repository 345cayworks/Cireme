# CIREME Launch & Operations Runbook — v1 (U7)

> Operational procedures over the **as-built** system. Routes/services named
> here are real. This runbook is executable by an admin; the items marked
> **[OWNER]** require a human (legal sign-off, executing a live drill) and are
> not — and cannot be — completed by the build agent.

## 1. Membership approval — end-to-end (the golden path)

1. Applicant submits `/partners/apply` (Type → Details → Review). A
   `submitted` row lands in `applications` (honeypot drops bots silently).
2. Admin (`member:approve`) → **Members → Applications**: review metadata;
   transition `submitted → under_review → approved` (deny/withdraw require a
   confirmation + are audited).
3. On `approved` with no existing account: a **pending** `users` row +
   pending membership are provisioned (unusable random password); role is
   mapped (`private_seller→agent`, `independent_broker→broker`,
   `advertiser→advertiser`).
4. Admin → **Members tab** → the pending member → **Generate activation
   link**; relay the single-use, 7-day link out-of-band.
5. Member opens `/mls/activate`, sets a password (≥10 chars) → account +
   membership go **active** → redirected to `/mls/login?activated=1`
   (success banner shown).
6. (Optional) Admin → **Members** → **Assign** broker/office so the member
   appears in broker surfaces and cooperation attribution.

**Staging acceptance:** run steps 1–6 with a test applicant; confirm audit
rows `application_submitted`, `application_status_change`,
`account_provisioned`, `activation_link_issued`, `account_activated`.

## 2. Listing lifecycle (agent)

- Create draft (`/mls/listings` → New listing) → open **Edit**
  (`/mls/listings/[id]/edit`) → complete fields + ≥1 photo until the
  readiness checklist is green → transition to `active` (server enforces
  completeness; non-public→public is blocked otherwise).
- Price changes go through the price form (separate history); status via the
  transition control.

## 3. Compliance enforcement

- **Reports** (`/mls/reports`) = read-only "what a sweep would find".
- **Compliance** (`/mls/compliance`) → **Run sweep** opens issues →
  enforcement ladder (flag → correction_requested → unpublish → remove;
  account_suspended/terminated). `removed` and `account_terminated` require
  typed confirmation. Every action is audited and requires a note.

## 4. Account access recovery

- No self-serve password reset (by design). To restore access: admin sets
  the member active if suspended; if credentials are lost, re-issue an
  activation link from the Members tab (supersedes prior tokens).

## 5. Deploy

- Push to `main`. Netlify build runs `npm run db:migrate` automatically when
  a DB is configured (`netlify.toml`); `SKIP_DB_MIGRATE=1` escape hatch.
- Required env: `DATABASE_URL`/`NETLIFY_DATABASE_URL`, `AUTH_SECRET`,
  `AUTH_URL`; optional `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (maps degrade
  gracefully without it), `SUPER_ADMIN_EMAIL`/`SUPERADMIN_MASTER_KEY` for
  `npm run db:bootstrap-admin`.
- Verify HTTPS + canonical domain; security headers and scoped CSP are in
  `next.config.ts` + `netlify.toml`.

## 6. Pre-launch gate (U7 exit)

- [ ] §1 membership runbook executed end-to-end in staging
- [ ] QA matrix (`governance/QA_Matrix.md`) green
- [ ] Backup/restore drill passes within RTO **[OWNER]**
- [ ] Counsel sign-off recorded (`governance/Legal_Review_Status.md`) **[OWNER]**
