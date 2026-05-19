# CIREME — Consolidated Build-Ready Specification

> **Status: DRAFT — awaiting owner sign-off (U6 gate exit criterion).**
> This is the single consolidated implementation reference that closes the
> old Design phases 9–10. It describes **what is actually built and on
> `main`**, not aspiration. It does not supersede `CIREME_Roadmap.md`
> (forward plan) or the locked Phase 0 positioning; it consolidates them
> into one reviewable spec. Sign-off = the U6 gate.

## 1. Positioning constraints (locked, binding)

- No buyer-agent compensation, commission, or cooperation-fee data
  anywhere in the system — including the RESO export (asserted by
  `src/lib/reso-export.test.ts`).
- Cayman-specific data model: Block & Parcel, KYD currency, district
  enumeration. No off-island assumptions baked into projections.
- Public/member/private field classification is the single source of
  truth for what each audience may resolve.

## 2. Architecture

- Next.js App Router (RSC) + server actions; Drizzle ORM; Postgres.
- NextAuth session; role on the session user; permission guard layer
  (`src/lib/auth-guard.ts`, `src/lib/rbac.ts`).
- Pure logic is factored into `src/lib/*.ts` and tested with the Node
  test runner (`node --test`, `*.test.ts`). UI is server-rendered with
  small client components only where interaction requires it.

## 3. Data model & migrations

- Accounts/roles/status; MLS listing model with Block & Parcel, KYD
  price, district enum, status/price history, compliance tables.
- Migrations under `drizzle/`. Notable recorded override:
  per-listing `latitude`/`longitude` (`drizzle/0001`), classified
  **public**, owner-approved (see build ledger).

## 4. Safety projections (the security spine)

| Audience | Projection | Test |
|---|---|---|
| Public | `toPublicListing` / `isPubliclyVisible` | public-safe tests |
| Member | member projection | member-safe tests |
| RESO feed | `toResoProperty` (built from PublicListing only) | `reso-export.test.ts` |

Invariant: no private/internal source field name can reach a
lower-trust projection; the RESO feed is built **only** from the public
projection, so member-gating restricts *who pulls the feed*, not extra
fields.

## 5. Listing lifecycle

State machine in `src/lib/listing-lifecycle.ts`
(`draft|incomplete|active|pending|withdrawn|expired|off_market|sold|
canceled`); public statuses require completeness. All transitions go
through the service and are audited immutably. Tested:
`listing-lifecycle.test.ts`.

## 6. Compliance & enforcement

Pure rules (`compliance-rules.ts`) → idempotent sweep
(`compliance-service.ts`) → enforcement ladder (flag → request
correction → unpublish → remove → suspend → terminate). Every action is
audited in-transaction. Destructive steps require typed confirmation.
**U6 addition:** bulk "dismiss false positives" — a loop over the
existing per-issue audited `dismissComplianceIssue` (no new backend
semantics), selection correctness owned by the tested
`src/lib/bulk-selection.ts`.

## 7. RBAC

Roles and permissions in `src/lib/rbac.ts` /
`Roles_and_Permissions_Matrix.md`. MLS roles: `super_admin`,
`mls_admin`, `office_manager`, `broker`, `agent`. Non-members:
`advertiser`, `public_user`. `isMlsRole` is the single membership
predicate; the RESO feed access rule (`canAccessResoFeed`) is defined as
exactly `isMlsRole` and asserted across every role.

## 8. API & interoperability (U5)

`GET /api/reso/listings` — one-way, read-only, member-only RESO-aligned
Property feed. JSON 401/403 (never a redirect). RESO field set, enum
mapping, no-private/no-compensation leakage, and access rule are
test-enforced. **Known limitations (carried forward):** validation is
against the documented field/shape contract, *not* the official RESO
Data Dictionary schema artifact; auth is session-based, not
machine-to-machine. Both are flagged follow-ups.

## 9. MLS-ready UX depth (U6)

| Item | State | Evidence / rationale |
|---|---|---|
| Bulk action where backend exists | **Built** | Compliance bulk-dismiss; logic in `bulk-selection.ts` (tested) |
| Responsive table transform | **Built (decision tested; CSS deferred)** | `resolveTableLayout` tested in `responsive-table.test.ts`; `.data-table--stack` CSS is presentational |
| Detail drawers | **Deferred** | No UI test harness in repo; would be untested presentational code. Deferred with rationale per the exit criterion rather than shipped untested |

**Explicitly deferred (with rationale):** purely presentational pieces
(drawer chrome, the stacked-card CSS paint) are deferred from automated
testing because the repo has **no UI/E2E test framework** (Node test
runner covers pure logic only). The *decisions* behind them are
extracted into tested pure modules; the paint is documented here. This
satisfies the U6 exit criterion ("tests **or** explicitly deferred with
rationale") honestly rather than by adding tests that don't assert
behaviour.

## 10. Test inventory

`npm test` → 57 passing (Node test runner, pure logic): public-safe,
member-safe, listing-lifecycle, account-lifecycle, compliance-rules,
reso-export, bulk-selection, responsive-table. `npm run typecheck`,
`npm run lint`, `npm run build` all green on `main`.

## 11. Open launch risks (carried, not closed by this spec)

- **U7 owner waiver:** counsel review (membership agreement, AUP,
  privacy, DPA off-island-transfer basis) and the backup/restore drill
  within RTO were **NOT performed**; residual legal/DR risk explicitly
  accepted by the owner. `Legal_Review_Status.md` and
  `Backup_Restore_Drill.md` remain open and should be closed before real
  launch. This spec records the risk; it does not resolve it.
- RESO official-DD certification and machine-token API auth (§8).

## 12. Sign-off

Owner sign-off on this document satisfies the U6 gate. Sign-off does
**not** close the §11 risks.
