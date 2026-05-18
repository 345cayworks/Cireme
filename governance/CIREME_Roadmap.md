# CIREME Roadmap — Single Unified Track

> **Authoritative forward plan.** This document supersedes the two parallel
> phase systems: `CIREME_Development_Plan.md` (engineering phases 0–10) and
> `governance/CIREME_Design_Plan.md` (design phases 1–10). Those documents are
> retained **as historical reference and detailed phase specs**, but all
> *future* work is planned, numbered, and tracked here on one sequence.
> Design and engineering are no longer separate tracks: each unified phase
> carries both its design and its build to a single approval gate.
>
> Other governance docs remain authoritative within their scope and are
> unchanged: `Positioning_Statement.md`, `Roles_and_Permissions_Matrix.md`,
> `Listing_Rulebook_v1.md`, `Listing_Field_Classification.md`. The locked
> Phase 0 positioning still binds everything.

## Working method

One track. Each phase bundles design + implementation and ends with a single
**owner approval gate** before the next begins. No phase's decisions are final
until approved here. Status values: `Done`, `In progress`, `Pending`,
`Blocked`. Cross-cutting tracks (security/auth, automated testing,
observability) run continuously and are not separate phases.

## Foundation already delivered (closed)

Reconciled from the build ledger and the two prior plans. These are **done**
and are not re-opened except via a recorded override:

| Area | Old phase(s) | State |
|---|---|---|
| Locked positioning; governance artifacts (RBAC matrix, positioning, rulebook, field classification) | Dev 0, 1 · Design 1 | Done |
| Design system foundation (tokens, primitives) | Design 2 | Done |
| Account / role / status layer; MLS data model (Block & Parcel, KYD, district enum, history/compliance tables, migrations) | Dev 2, 3 | Done |
| Listing lifecycle engine (transitions, completeness, immutable audit) | Dev 4 | Done |
| Compliance system (rules, sweep, enforcement ladder, dashboard) | Dev 5 · Design 5 | Done |
| Public portal + public-safe projection; Tools (RPPI, mortgage, market intelligence); maps/geo | Dev 7 (core) · Design 3 | Done |
| Login + role entry | Design 4 | Done |
| Admin workspace (shell, dashboard, members/applications, compliance, listings moderation, audit) | Design 5 | Done (v1) |
| Account provisioning + admin-relayed activation links | (build ledger) | Done |
| Partner Application public intake (`/partners/apply`) | Design 3 intake | Done |

## Unified forward phases

| U# | Phase | Goal | Design + build deliverables | Depends on | Gate | Status |
|---|---|---|---|---|---|---|
| **U1** | Broker experience | The brokerage workspace | Design + build broker workspace in the existing shell: My Agents, Group Listings, Brokerage Profile (read-only office context — no office-mutation backend yet); reuse existing services/state machines | Admin v1 | Yes | **Pending — next** |
| **U2** | Agent experience | First-class listing authoring | Design + build agent workspace: My Listings, Create/Edit Listing UX, Media, optional CSV import; harden the existing authoring path into the unified shell | U1 | Yes | Pending |
| **U3** | Cooperation & member-only data | Cross-listing visibility (no compensation) | Listing brokerage/agent attribution, contact routing, member-only vs public remarks surfaced per the field classification; authorization tests | U2 | Yes | Pending |
| **U4** | Search & market analytics | MLS-grade search + analytics | Advanced filters, map search, staleness/accuracy reporting; Tools-experience design depth (old Design 8) folded in | U3 | Soft | Pending |
| **U5** | API & RESO export | Optional interoperability | Member API; one-way RESO-format export; role-aware access control; RESO Data Dictionary validation | U3 | No | Pending |
| **U6** | MLS-ready UX expansion + build-ready spec | Depth + consolidated spec | Compliance/audit/lifecycle UX depth (drawers, bulk where backend exists, responsive table transforms); the consolidated build-ready spec (old Design 9–10) | U2, U4 | Yes | Pending |
| **U7** | Launch readiness | Operationally launchable | Counsel review (membership agreement, AUP, privacy, DPA transfer basis); admin + membership-approval runbooks; legal text final; QA matrix; backup/restore drill within RTO | U1–U3, U6 | **Yes** | Pending — legal-blocking |

**Critical path:** U1 → U2 → U3 → U6 → U7. U4 and U5 run off the critical
path. U7's counsel-review item (formerly Dev 0b) is legal-blocking for launch
and can begin in parallel now.

**Launch tiers:** *Minimum viable* = foundation + U1, U2, U7. *Full niche* =
+ U3, U6. *Post-launch growth* = U4, U5.

## Phase exit criteria (gate to proceed)

| U# | Objective exit criteria |
|---|---|
| U1 | Broker workspace covered by permission/negative tests; no office-mutation invented; design approved |
| U2 | Every listing-authoring path has automated tests; completeness gate enforced in UI; design approved |
| U3 | No private-classified field resolvable by a non-member role (authorization tests) |
| U4 | Search returns correct results on a seeded dataset within target latency |
| U5 | RESO export validates against the RESO Data Dictionary; access control test-enforced |
| U6 | Consolidated build-ready spec signed; UX-depth items have tests or are explicitly deferred with rationale |
| U7 | Counsel sign-off on agreement/AUP/privacy + DPA basis documented; approval runbook executed end-to-end in staging; restore drill passes within RTO |

## Crosswalk — old phase numbers → unified

| Old Design phase | Old Dev phase | Unified |
|---|---|---|
| D1 Visual, D2 Design system | Dev 0, 1 | Foundation (done) |
| D3 Public experience | Dev 7 (core) | Foundation (done) + U4 (search depth) |
| D4 Login | — | Foundation (done) |
| D5 Admin | Dev 5 (compliance UI) | Foundation (done, v1); depth → U6 |
| D6 Broker | Dev 2/6 (broker layer) | **U1** |
| D7 Agent | Dev 4 (authoring) | **U2** |
| D8 Tools | Dev 8 (search/analytics) | **U4** |
| D9 MLS-ready UX | Dev 5/6 depth | **U6** |
| D10 Build-ready spec | — | **U6** |
| — | Dev 6 Cooperation | **U3** |
| — | Dev 9 API/RESO | **U5** |
| — | Dev 0b Counsel, Dev 10 Launch | **U7** |

---

# Build ledger

> Moved verbatim from the former Design Plan "OPEN-QUESTION RESOLUTIONS
> (implementation log)". This is the running record of what shipped and the
> decisions/overrides behind it. New build entries append here.

- **Risk #1 — map/geodata: RESOLVED, then SUPERSEDED (see override below).**
  Original decision: *district markers now, upgrade-ready*. No per-listing
  coordinates; `src/data/cayman-districts.ts` held approximate district
  centroids as the stable contract for a future precise-pin upgrade; a
  tile-based slippy map was deliberately avoided to preserve the deployed CSP.
- **OVERRIDE — precise pins + Google Maps (supersedes Risk #1 resolution and
  Phase 1 non-negotiable #6 "must not loosen the CSP"). Decision approved by
  the product owner.** Per-listing `latitude`/`longitude` columns added
  (`numeric(10,7)`, nullable, migration `drizzle/0001`); classified **public**
  in `listing-classification.ts` and projected by `toPublicListing` (the
  governance gate tests were updated in lockstep). Agents drop a pin in the
  listing create form (drag/click/"use my location"); the public Listings and
  Listing Detail pages render Google Maps markers with a visitor "use my
  location" control. **CSP deliberately loosened** in `next.config.ts`, scoped
  to Google Maps origins only: `script-src`/`connect-src` +
  `https://maps.googleapis.com https://maps.gstatic.com`,
  `worker-src 'self' blob:`, `font-src` + `https://fonts.gstatic.com`. No
  other third-party origin is permitted. `Permissions-Policy` also relaxed
  from `geolocation=()` to `geolocation=(self)` (both `next.config.ts` and
  `netlify.toml`) so the same-origin "use my location" control works; camera,
  microphone and browsing-topics remain fully disabled. Migrations apply
  automatically on deploy — `netlify.toml` already runs `npm run db:migrate`. Requires
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional in `env.ts`; maps degrade to a
  graceful keyless fallback — manual lat/lng entry for agents, a notice for
  visitors — so build/test never require a key). Privacy/security note:
  coordinates are intentionally coarse, surfaced as "approximate", and never
  a substitute for the (still-private) Block & Parcel; the district-centroid
  contract is retained for listings without a pin.
- **Risk #2 — RPPI source: RESOLVED.** Official Cayman Government RPPI ingested
  (`src/data/rppi.ts`); projection tool ships with the approved low–mid–high
  band and mandated estimates-only disclaimer.
- **Risk #8 — leads: RESOLVED.** Inquiries route to email + the existing
  applications flow; no leads table introduced.
- **Added:** Lands & Survey transaction-activity dataset (`src/data/las.ts`)
  and a richer **Market intelligence** view (`/tools/market`) combining the
  RPPI price index (per-region growth) with transaction volume/mix, with all
  provider caveats surfaced. No new top-nav item (respects the
  no-"Market Trends"-nav decision); reached via Tools.
- **Data correction — LAS transaction volumes (2023–2026).** A reviewer
  flagged the volume figures as off. Verified against the authoritative
  `CIREME_data_2026_next` workbook: 2010–2022 were exact, but 2023–2025 had
  been transcribed from an earlier *partial* export (2023 part-year; 2024/25
  one-month stubs) and were materially understated (e.g. 2024 freehold
  transfers 193 → **2,215**); 2026 was missing. Corrected 2023–2025 to full
  12-month aggregates and added 2026 as an explicit **partial** year
  (Jan–Apr, `partial: true`, `monthsCovered: 4`). `LasAnnualPoint` gained
  optional `partial`/`monthsCovered`; `completeVolumeSeries()` now excludes
  partial years by that flag (replacing a fragile <50%-of-prev magnitude
  heuristic); the market view labels the partial year ("YYYY to date (N mo)")
  and excludes it from the trend, mix and YoY. New test asserts no partial
  year leaks into the complete series.
- **Phase 4 — login: APPROVED & IMPLEMENTED.** `/mls/login` rebuilt to spec:
  centered `--surface` card on `--canvas`, display-serif role-aware title and
  eyebrow derived from the cosmetic `as` hint (admin/broker/agent; never
  trusted for authorization — real role still drives redirect), show/hide
  password, submit loading/disabled state, security-safe generic error
  ("Email or password is incorrect, or the account isn't active yet."), an
  honest "Trouble signing in?" disclosure (no self-serve reset — admin
  restores access; pending applications explained), and a back-to-CIREME
  link. The `as` hint is preserved across the error redirect. Nav Login
  dropdown gained per-role one-line descriptors and menu roles. Open risks
  carried unchanged: no email-based password reset, no rate limiting/lockout,
  MFA out of scope (engineering dependencies, not designed-as-if-existing).
  Phase 5 (Admin experience) is now unblocked.
- **Phase 5 — Admin experience: APPROVED.** Design accepted as delivered
  (workspace shell, admin home, Applications/Members, Listing moderation,
  Compliance, read-only Audit over `auditLog`). Phase 6 (Broker experience)
  is now unblocked and may proceed. Open direction still required before the
  Admin workspace is *built in code*: the high risk that member approval does
  not provision an account — this changes the Applications screen success
  path and must be resolved before implementation, not before Phase 6 design.
- **Account provisioning risk — RESOLVED & IMPLEMENTED.** Decision (product
  owner): approval provisions a *pending* account; the member sets their own
  password via a **single-use, 7-day, admin-relayed activation link**
  (chosen over admin-set temp passwords and stub+reset). No email system
  exists yet, so the admin copies the link from the Members screen and
  delivers it out-of-band; email can replace the manual relay later with no
  schema change. Implementation: `activation_tokens` table (migration
  `drizzle/0002`, stores only a SHA-256 of the token — raw value lives only
  in the link); `transitionApplication` now creates a pending `users` row +
  pending membership with an unusable random password when no account exists
  (pre-existing credentialed accounts keep the prior activate-immediately
  path); `issueActivationToken`/`redeemActivationToken` (single-use + expiry
  enforced in-transaction, prior tokens superseded on re-issue); public
  `/mls/activate` set-password page (added to the auth-exempt list alongside
  `/mls/login`); audit entries `account_provisioned`,
  `activation_link_issued`, `account_activated`. **Role mapping** (recorded,
  one-line change point in `membership-service.roleForMembershipType`):
  `private_seller → agent`, `independent_broker → broker`,
  `advertiser → advertiser`, mirroring the existing RBAC matrix. Password
  minimum 10 chars. Carried-open items unchanged (no email reset, no
  rate-limiting). The Applications success path is now real, so the Phase 5
  Admin workspace is unblocked for implementation.
- **Phase 5 — Admin workspace: IMPLEMENTED (v1).** Built against the
  approved design, reusing existing services/state machines only (no new
  mutations invented). Delivered: the **workspace shell** — `mls/layout.tsx`
  + client `WorkspaceFrame` (dark `--obsidian` rail + context bar, new
  tokens only; Phase 2 public tokens untouched), permission-filtered nav
  (an item hidden when its permission is absent), `Administrator` badge,
  sign-out; pre-auth `/mls/login` + `/mls/activate` bypass the shell.
  **Dashboard** — triage board: permission-aware stat cards linking to
  filtered queues, "Needs you" oldest open applications, recent `auditLog`
  strip, "nothing needs a decision" empty state. **Applications/Members** —
  one route, two tabs; status filter chips; application metadata shown;
  **corrected provisioning honesty** (approval now provisions a pending
  account + admin-relayed activation link — no longer a dead end);
  membership status-history timeline; mandatory audit note; destructive
  account transitions gated by `ConfirmSubmit` (typed-confirmation for
  `inactive`). **Compliance** — enforcement ladder as explicit steps with
  per-issue action history; required notes; typed-confirmation for `removed`
  ("REMOVE") and `account_terminated` ("TERMINATE"); required dismiss
  reason. **Listings moderation** — read-only registry (all listings,
  status chips, agent/price/updated, private-remarks + status/price-history
  detail); guard relaxed so `listing:moderate` admins reach it (closes the
  prior "moderate UI was a stub" risk) while agents keep authoring. Shared
  `ConfirmSubmit` primitive added. Typecheck/lint/build green; 37 tests
  pass. **Deliberately v1 / deferred (consistent with the design's stated
  non-goals & risks):** detail drawers (used inline `<details>` instead),
  global context-bar search, bulk actions (no bulk backend), full
  responsive stacked-card table transform (tables scroll on the dark frame;
  rail collapses at ≤860px), and manual issue-raising from Listings
  (enforcement runs from Compliance — no manual-issue backend action
  exists). These remain engineering dependencies, not faked UI.
- **Phase 3 Partner Application intake — IMPLEMENTED (closes the step 1→2
  gap).** The application-intake form designed in Phase 3 (route
  `/partners/apply`) is now built, so the approval→provision→activation
  chain has a real public starting point (previously the only path into
  `applications` was a DB seed; `/partners` was a `mailto`). Calm
  multi-step form (Type → Details → Review) → `submitApplicationAction`
  (zod-validated) → new `createApplication` service inserting a
  `submitted` row with `{displayName, firm, message}` in
  `applications.metadata` and an audit entry (`application_submitted`,
  `actorId: null` — public, no auth). No account created at apply time
  (per spec). Success screen states the application is recorded and an
  admin will follow up. Partners CTA switched from `mailto:` to the form.
  Spam: an off-screen honeypot field silently drops bot submissions (no
  DB write, success-looking response). Carried risks unchanged: no
  rate-limiting / IP throttling, no applicant-side status tracking
  (admin-side only, Phase 5). Typecheck / lint / build green; 38 tests
  pass.
- **Unified track established.** The parallel design (1–10) and development
  (0–10) phase systems were merged into this single roadmap (phases
  U1–U7 + closed foundation). The former plans are retained as historical
  reference with a superseded banner; this document is now authoritative for
  all future work, and the build ledger lives here.
