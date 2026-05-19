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
| **U1** | Broker experience | The brokerage workspace | Design + build broker workspace in the existing shell: My Agents, Group Listings, Brokerage Profile (read-only office context — no office-mutation backend yet); reuse existing services/state machines | Admin v1 | Yes | **Approved — implemented (v1)** |
| **U1b** | Admin agent↔broker/office assignment | Make U1 populate end-to-end | Pulled forward from the U1 flagged dependency: the one production mutation that sets `users.brokerId`/`users.officeId`, plus an admin UI on the Members tab; audited; validated | U1 | Yes | **Approved — implemented (v1)** |
| **U2** | Agent experience | First-class listing authoring | Design + build agent workspace: My Listings, Create/Edit Listing UX, Media, optional CSV import; harden the existing authoring path into the unified shell | U1 | Yes | **Approved — implemented (v1)** |
| **U3** | Cooperation & member-only data | Cross-listing visibility (no compensation) | Listing brokerage/agent attribution, contact routing, member-only vs public remarks surfaced per the field classification; authorization tests | U2 | Yes | **Approved — implemented (v1)** |
| **U4** | Search & market analytics | MLS-grade search + analytics | Advanced filters, map search, staleness/accuracy reporting; Tools-experience design depth (old Design 8) folded in | U3 | Soft | **Approved — implemented (v1)** |
| **U5** | API & RESO export | Optional interoperability | Member API; one-way RESO-format export; role-aware access control; RESO Data Dictionary validation | U3 | No | **Approved — implemented (v1)** |
| **U6** | MLS-ready UX expansion + build-ready spec | Depth + consolidated spec | Compliance/audit/lifecycle UX depth (drawers, bulk where backend exists, responsive table transforms); the consolidated build-ready spec (old Design 9–10) | U2, U4 | Yes | **Approved — implemented (v1); build-ready spec signed** |
| **U7** | Launch readiness | Operationally launchable | Counsel review (membership agreement, AUP, privacy, DPA transfer basis); admin + membership-approval runbooks; legal text final; QA matrix; backup/restore drill within RTO | U1–U3, U6 | **Yes** | **Approved (OWNER WAIVER) — counsel review & restore drill NOT performed; residual legal/DR risk accepted by owner** |

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
- **U1 — Broker experience: DELIVERED (v1), awaiting approval.** Design +
  build bundled to one gate (unified-track method). Added three
  broker-scoped surfaces in the existing workspace shell, rail items gated
  on `listing:edit:office` (so `broker`/`office_manager`, and `super_admin`,
  see them; `mls_admin`/`agent` do not): **My agents** (roster — users whose
  `brokerId` is this user, or who share their `officeId`), **Group listings**
  (read-only registry of listings authored by the roster or carrying the
  office, status-chip filtered; edits intentionally stay in `/mls/listings`
  where brokers already hold office-edit rights — no duplicate mutation),
  **Brokerage profile** (read-only `offices` row). New read-only helpers
  `current-user.ts` (`getCurrentUser` — session lacks `brokerId`/`officeId`,
  so one DB lookup) and `broker-service.ts` (`listRoster`,
  `listGroupListings`, `getBrokerageOffice`). **No new mutations, no
  state-machine changes.** Honest empty states: because no production flow
  sets `users.brokerId`/`officeId` yet, these scopes are empty for real
  data; each surface says so plainly and names agent↔broker/office
  assignment as the engineering dependency (an admin-assignment flow — a
  candidate for a later unified phase, not faked here). Typecheck / lint /
  build green; 38 tests pass. Follow-on once assignment exists: roster
  status actions and group analytics (deferred, no backend yet).
- **U1b — Admin agent↔broker/office assignment: DELIVERED (v1), awaiting
  approval.** Pulled forward from U1's flagged gap so the broker workspace
  populates with real data. New audited mutation
  `assignUserBrokerage({userId, brokerId, officeId, actorId})` in
  `membership-service.ts` — the only production path that writes
  `users.brokerId`/`users.officeId`. Validates: broker link must point at a
  real `broker` account and not self; office link must exist; either may be
  null (unassign). Audit entry `user_assignment_changed` (before/after).
  Admin UI: per-member "Assign" controls on the Members tab (broker select +
  office select + Save), gated on `member:approve`, via
  `assignBrokerageAction`. No state-machine change. Closes the U1 honest
  gap: My Agents / Group Listings / Brokerage now fill once an admin
  assigns. Typecheck / lint / build green; 38 tests pass.
- **Market intelligence — chart legends/readability.** Made the
  `/tools/market` charts meaningful for a lay audience: price-index chart
  gained a Y-axis scale (min/100/max), a dashed **2015 = 100 baseline**
  with legend entry, X-axis year ticks, and per-region latest-value labels;
  plain-language "higher = pricier vs 2015" framing. Volume chart gained a
  Y-axis transfers scale (0–peak), mid/end year ticks, per-bar hover
  tooltips (`<title>`), an axis caption, and a "each bar = a year of
  registered ownership changes" explainer. Added a one-line glossary for
  the transaction-mix terms (freehold transfer / lease / lease transfer /
  purchase agreement). `role="img"` + `aria-label` on both SVGs. No data
  change. Typecheck / lint / build green; 38 tests pass.
- **U1 + U1b — APPROVED.** Product owner approved the broker workspace and
  the admin assignment flow as delivered (v1). Permission/negative tests
  remain a noted follow-up (consistent with the repo's existing no-DB-test
  pattern for page/query code), not a blocker for approval. U2 (Agent
  experience) is now the active phase on the critical path.
- **U2 — Agent experience: DELIVERED (v1), awaiting approval.** Hardened the
  authoring path into the unified workspace shell and added the missing
  edit capability. New audited mutation `updateListing` in
  `listing-service.ts` (descriptive fields only — price stays in
  `changeListingPrice`, status in `transitionListingStatus`; audit
  before/after carries only changed fields) — the one new mutation U2
  genuinely needed (a draft previously could not be edited at all, so the
  completeness gate was unreachable for fields absent from the create form).
  `updateListingAction` + `editSchema` with `assertCanEdit` (agents own
  only). New per-listing **edit page** `/mls/listings/[id]/edit`: full field
  form, a **publication-readiness checklist** (reuses `validateCompleteness`
  — title/type/district/tenure/price/description/landBlock/landParcel + ≥1
  photo), price (existing `changeListingPrice`), status transitions
  (existing `transitionListingStatus`), media (existing add/delete) — all
  reused, no new state machine. **My Listings** rebuilt into the shell:
  eyebrow/title, status-filter chips, cards showing status badge + price +
  photo count + readiness summary, linking to the edit page. Create form
  moved into the shell and gained bedrooms/bathrooms/area + textarea
  description (createSchema extended; `createListing` already supported
  them). Completeness is enforced server-side by the existing transition
  engine; the UI now surfaces it. Typecheck / lint / build green; 38 tests
  pass. **Deferred (explicit, consistent with the "no bulk backend; flag,
  don't fake" precedent):** optional CSV import — it is a new bulk mutation
  with no backend; left as a flagged follow-on rather than a fake importer.
  Open follow-up unchanged: authoring-path automated tests (repo's no-DB
  test pattern) — noted, not a blocker.
- **Fix — `/mls/login` now shows the activation success message.** The
  activation flow redirected to `/mls/login?activated=1` but the login page
  ignored the param (only read `error`/`as`), so members got no confirmation
  after setting their password. Added a success banner ("Your account is
  activated. You can now sign in.") shown when `activated=1`. No other
  change. Typecheck / lint / build green; 38 tests pass.
- **U2 — APPROVED.** Product owner approved the agent experience as
  delivered (v1). CSV import remains a deferred optional follow-on; authoring
  automated tests remain a noted non-blocking follow-up. U3 (Cooperation &
  member-only data) is now the active phase on the critical path.
- **U3 — Cooperation & member-only data: DELIVERED (v1), awaiting
  approval.** Member-only cross-listing cooperation directory
  (`/mls/cooperation`): marketable inventory (active/pending/sold) across
  ALL agents/offices with listing-agent + office attribution and a direct
  `mailto` contact route, plus member-only depth (Block & Parcel, sold
  price, private remarks). New `requireMlsMember()` gate in `auth-guard.ts`
  (any MLS role; `NotMlsMemberError` for public_user/advertiser) — the
  reusable "is a member" primitive. New **structurally-enforced
  `member-safe.ts`** projection (`toMemberListing`) mirroring
  `public-safe.ts`: an explicit allow-list that INCLUDES the
  `private`-classified member-only fields + attribution and EXCLUDES purely
  `internal` columns. `cooperation-service.ts` (read-only join
  listing→agent→office, publicly-visible statuses only so others' drafts
  never leak). Rail item visible to all members (no permission needed; the
  /mls shell is already isMlsRole-gated by middleware). **No compensation/
  cooperation-fee field introduced or computed** (locked positioning;
  schema verified clean) — cooperation = visibility + contact only.
  **Exit criterion MET — authorization tests:** new `member-safe.test.ts`
  asserts (a) the member projection's exact key set, (b) members can
  resolve every private field, (c) internal columns stay excluded, (d) the
  non-member's only path (`toPublicListing`) leaks no sentinel and exposes
  no private key, (e) the member gate admits exactly the MLS roles
  (public_user/advertiser excluded). 43 tests pass; typecheck/lint/build
  green.
- **U3 — APPROVED.** Product owner approved cooperation & member-only data
  as delivered (v1). Exit criterion (authorization tests) was met at
  delivery. U6 is the next critical-path phase (depends on U2 ✓, U4); U4/U5
  remain off the critical path; U7 (legal) can run in parallel.
- **U4 — Search & market analytics: DELIVERED (v1), awaiting approval.**
  Public `/listings` gained server-side advanced search via shareable GET
  params (keyword/title, district, type, tenure, status, min/max price, min
  beds) applied as Drizzle predicates over the existing `toPublicListing`
  projection (no private leakage); the existing map re-renders markers for
  the filtered set ("map search"); clear/reset + result count + empty-state
  copy. New read-only **`/mls/reports`** (gated `listing:moderate`, rail
  item added): runs the pure compliance rules over current inventory to show
  "what a sweep would find" (stale ≥180d, missing-required, sold-left-active)
  + inventory-by-status — enforcement still only via Compliance (no issues
  opened). Tools-experience depth (old Design 8) is satisfied by the
  already-shipped Market intelligence (legends), RPPI projection and
  mortgage tools — no new build, noted. Exit criterion (correct results on
  a seeded dataset — `npm run db:seed`) verified by construction; no schema
  change. Typecheck/lint/build green; 43 tests pass.
- **U7 — Launch readiness: ARTIFACTS DELIVERED; owner items outstanding
  (legal-blocking).** Authored the operational governance set:
  `Launch_Runbook.md` (membership golden path, lifecycle, compliance,
  recovery, deploy, pre-launch gate over the real system),
  `QA_Matrix.md` (auto vs manual verification map — automated rows already
  green), `Backup_Restore_Drill.md` (RPO/RTO targets + Neon/Netlify
  procedure + result log), `Legal_Review_Status.md` (documents for counsel +
  binding no-compensation/positioning constraints). **Explicitly NOT done —
  [OWNER] only, cannot be agent-completed:** counsel sign-off on
  agreement/AUP/privacy/DPA, and executing the live backup/restore drill
  within RTO. These remain the launch-blocking gate; drafting of the legal
  documents and the DPA analysis can proceed in parallel. No code change.
- **U4 — APPROVED.** Product owner approved search & market analytics as
  delivered (v1). U6 is now fully unblocked (depends on U2 ✓ and U4 ✓).
- **U7 — APPROVED BY OWNER WAIVER (residual risk accepted).** The product
  owner elected to fully approve U7 and **waive the gate**, explicitly
  accepting that the two launch-blocking exit items were **NOT performed**:
  (1) counsel sign-off on the membership agreement, AUP, privacy policy and
  DPA off-island-transfer basis; (2) a passing backup/restore drill within
  RTO. This is a recorded owner decision, not a completed control — the
  build agent did not and cannot perform legal review or a live DR drill.
  Residual risk knowingly carried into launch: operating without legal
  review of member-facing/legal terms and without a verified disaster-
  recovery restore. `Legal_Review_Status.md` and `Backup_Restore_Drill.md`
  remain open and should still be closed post-haste; this waiver does not
  make them done. No code change.
- **U5 — API & RESO export: DELIVERED (v1), awaiting approval.** One-way,
  read-only RESO-aligned listing feed at `GET /api/reso/listings`,
  member-only (JSON 401 if unauthenticated, 403 if not an MLS role — never
  a redirect, since it's an API). New pure `reso-export.ts`: builds the feed
  ONLY from the `PublicListing` projection (no private/internal field can
  reach it — same discipline as public-safe/member-safe), maps to a
  documented RESO Data Dictionary-style `Property` shape (StandardStatus,
  PropertyType, ListPrice, BedroomsTotal, LivingArea, City, Lat/Long,
  ModificationTimestamp, …) with KYD surfaced via the RESO `X_` extension
  convention. **No buyer-agent compensation/cooperation fields emitted**
  (RESO defines them; locked positioning forbids them — a test asserts
  absence). Exit criterion partially met: access control is
  **test-enforced** (`canAccessResoFeed` = `isMlsRole`, asserted across all
  roles) and the export validates against the **documented field/shape
  contract** (`reso-export.test.ts`: exact field set, enum mapping, no
  private/compensation leakage, envelope). 49 tests pass; typecheck/lint/
  build green. **Flagged follow-ups (honest scope):** (1) formal
  certification against the *official* RESO Data Dictionary schema artifact
  (needs the schema; structural contract test stands in for v1);
  (2) machine-to-machine auth — v1 reuses the session (browser/member);
  API-key/OAuth client credentials for true system interop is a follow-on.
- **U5 — APPROVED by owner.** RESO export/API accepted at v1; the two
  flagged follow-ups (official RESO Data Dictionary certification;
  machine-to-machine API auth) are carried forward in `Build_Ready_Spec.md`
  §8, not lost.
- **U6 — MLS-ready UX depth + build-ready spec: DELIVERED (v1), awaiting
  approval.** Two tested pure modules added: `bulk-selection.ts` (selection
  model + eligibility partition — bulk only ever loops an existing audited
  per-item op, never new backend) and `responsive-table.ts`
  (`resolveTableLayout`, md=768 stacked-card decision). Wired a **real**
  bulk action over existing backend: compliance "dismiss false positives"
  loops the existing audited `dismissComplianceIssue` (one audit row per
  issue), driven by a contained client panel placed above the untouched
  per-issue enforcement UI (low regression risk). Opt-in `.data-table--
  stack` responsive CSS added. **Consolidated build-ready spec written**
  (`governance/Build_Ready_Spec.md`) closing old Design 9–10 — marked
  DRAFT awaiting owner sign-off (that sign-off IS the U6 gate). **Honest
  deferrals (per the exit criterion):** detail drawers and the stacked-card
  *paint* are deferred from automated testing with rationale — the repo has
  no UI/E2E harness, so the testable *decisions* were extracted into the
  pure modules above rather than shipping untested presentational code or
  writing non-asserting tests. 57 tests pass; typecheck/lint/build green.
  Spec sign-off does NOT close the U7 legal/DR risks (recorded, still open).
- **U6 — APPROVED by owner; build-ready spec SIGNED (2026-05-19).** The U6
  gate is closed: `governance/Build_Ready_Spec.md` is owner-signed,
  flipped from DRAFT. **All unified build phases U1–U6 are now approved.**
  The signed spec records — and does NOT close — the standing U7 risks:
  counsel review and the backup/restore drill were waived and never
  performed; residual legal/DR risk remains explicitly owner-accepted.
  `Legal_Review_Status.md` and `Backup_Restore_Drill.md` stay open. No
  code change in this step (governance/sign-off only).
- **U7 legal drafting — DRAFTS PREPARED (not sign-off).** Four counsel-
  review drafts written under `governance/legal/` (Membership Agreement,
  AUP, Privacy Policy, off-island transfer-basis question set) plus a
  `Counsel_Review_Cover_Note.md` indexing them, the binding product
  constraints counsel must preserve, every `[BRACKET]` decision left for
  counsel/owner, and the open legal questions (off-island transfer basis;
  immutable audit log vs. erasure rights; member controller/processor
  allocation). All marked "DRAFT — NOT LEGAL ADVICE"; the build agent did
  not and cannot give legal advice or sign-off. `Legal_Review_Status.md`
  updated: drafts ✅, counsel status still ☐ pending. This does NOT close
  the U7 legal item — sign-off remains the owner action and the residual
  risk stays owner-accepted under the recorded waiver. No code change.
- **U7 legal drafts — qualified with licence & hosting facts (still
  drafts).** Membership Agreement, Privacy Policy, off-island transfer-
  basis question set, and the counsel cover note updated to incorporate:
  the provided Trade & Business Licence (Ref 30624 / Lic 95640, TBLA
  (2021 Revision) s.21, licensee ROBERT NORMAN LYNCH T/A CAYMAN ISLANDS
  REAL ESTATE MARKET EXPLORER, activity "real estate marketing, promotion
  and IT support", period 2 Nov 2023–2 Nov 2024) using cautious
  "originally reflected / not asserted as currently active" language; a
  strengthened not-a-broker/agent/valuer/escrow/conveyancer/lender and
  no-compensation distinction; and qualified Netlify-platform / Netlify
  Database / Neon hosting language with deploy-preview database branching
  flagged as a privacy/transfer issue. No data-residency region or final
  processor list asserted. No legal conclusion made; all remain
  counsel-review drafts and the U7 sign-off + licence/entity/processor/
  region confirmations stay launch-blocking and owner-accepted under the
  recorded waiver. No code change.
