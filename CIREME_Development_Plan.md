# CIREME Development Plan — Phased Roadmap

> Consolidated execution table derived from the *MLS Expansion Roadmap* and its
> Addendums, reflecting the **locked Phase 0 decision: Complement + Niche, no
> compensation lock-in**. Estimates assume a small team (~2–3 engineers + 1
> product/governance lead). Durations are planning estimates for sequencing,
> not commitments.

## Phased roadmap

| # | Phase | Goal | Key deliverables | Duration | Effort (eng-wks) | Owner | Depends on | Gate | Track |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Strategy decision | Lock the product positioning | Complement + Niche decision; no-compensation-lock-in stance | Done | n/a | Product/Founder | — | Closed | Critical |
| 0b | Counsel review | De-risk legal commitments | Membership agreement, AUP, privacy policy reviewed; DPA transfer basis confirmed | 1–2 wks | n/a | Product + Counsel | 0 | **Yes** | Critical |
| 1 | Governance & MLS design | Define what CIREME is as a governed system | Roles/permissions matrix; positioning statement; listing rulebook v1; public/private field classification; DPA processing register | 3–4 wks | 2 | Product/Governance | 0b | Yes | Critical |
| 2 | Broker/seller & account layer | Add the account & light brokerage structure | Seller/broker/advertiser accounts; account status states; role-based permissions; office (optional, flat) | 3–5 wks | 6–8 | Eng | 1 | Yes | Critical |
| 3 | MLS data model refactor | RESO-shaped, Cayman-correct schema | Standardized listing schema; Block & Parcel; tenure; district enum; KYD; history/compliance tables; **no compensation fields**; data migration | 4–5 wks | 7 | Eng | 1, 2 | Yes | Critical |
| 4 | Listing lifecycle engine | Replace CRUD with controlled MLS records | Status model; transition rules; validation; completeness rules; publish rules; immutable audit trail | 5–7 wks | 10–12 | Eng | 3 | Yes | Critical |
| 5 | Compliance system | Light-touch accuracy/AUP enforcement | Compliance dashboard; automated accuracy checks; violation log; access-only enforcement workflow | 3–4 wks | 5–6 | Eng | 4 | Soft | High |
| 6 | Cooperation & member-only data | Cross-listing visibility (no compensation) | Listing brokerage/agent ID; contact routing; public vs. private remarks; member-only fields | 3–4 wks | 6 | Eng | 2, 4 | Soft | High |
| 7 | Public portal sync | Separate public display from MLS truth | Public-safe projection/view; publication rules; sold/pending visibility; promoted listings; guard test | 3–4 wks | 6 | Eng | 4, (6) | Soft | High |
| 8 | Search & market analytics | MLS-grade public + member search | Advanced filters; map search; staleness/accuracy reporting; market analytics | 4–5 wks | 8 | Eng | 7 | No | Medium |
| 9 | API & RESO export | Optional interoperability | Member API; one-way RESO-format export; role-aware access control | 4–6 wks | 8–10 | Eng | 3 (+7) | No | Medium |
| 10 | Launch readiness | Make it operationally launchable | Admin runbooks; membership approval process; legal text final; QA matrix; backup/restore drill | 3–4 wks | 6 | All | core phases | **Yes** | Critical |

**Critical path:** 0b → 1 → 2 → 3 → 4 → 5 → 7 → 10  ≈ **6–9 months** elapsed.
Phases 6, 8, 9 run in parallel off the critical path. Cross-cutting tracks
(security/auth, automated testing, observability) run continuously from Phase 2.

## Launch tiers

| Tier | Phases required |
|---|---|
| Minimum viable marketplace | 0b, 1, 2, 3, 4, 7, 10 |
| Full niche launch | + 5, 6 |
| Post-launch growth | 8, 9, advanced analytics, advertiser expansion |

## Phase exit criteria (gate to proceed)

| Phase | Objective exit criteria |
|---|---|
| 0b | Counsel sign-off on agreement/AUP/privacy; DPA off-island transfer basis documented |
| 1 | Roles/permissions matrix signed; positioning statement published; 100% of listing fields classified public/private; DPA register drafted |
| 2 | All account types + status transitions covered by automated tests; role permissions verified by negative tests |
| 3 | 100% of existing listings migrated, zero unexplained loss (row-count + checksum); Block & Parcel ≥95% on active; every field RESO-mapped |
| 4 | Every status transition has an automated test; no listing publishes while failing completeness (negative tests pass) |
| 5 | Every listing edit writes an immutable audit row; dashboard surfaces 100% of seeded violation fixtures |
| 6 | Private fields never resolvable by a non-member role (authorization tests) |
| 7 | Automated test fails if any private-classified field appears in the public projection |
| 8 | Search returns correct results against a seeded dataset within target latency |
| 9 | RESO export validates against the RESO Data Dictionary schema; access control enforced by tests |
| 10 | Membership approval runbook executed end-to-end in staging; legal text counsel-approved; restore drill passes within RTO |
