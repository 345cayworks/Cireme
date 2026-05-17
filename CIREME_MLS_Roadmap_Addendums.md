# CIREME → MLS Expansion Roadmap — Addendums

> Companion to *CIREME → MLS Expansion Roadmap*. These addendums close the three
> gaps that prevent the original roadmap from being executed: (A) it is not
> grounded in the Cayman Islands market or legal context, (B) it has no
> operational substance (time, effort, owners, exit criteria), and (C) it has no
> migration path or interoperability target.
>
> The original roadmap's conceptual spine — governance-first, two-layer
> architecture, lifecycle → compliance → cooperation sequencing — is retained
> unchanged. These addendums sit on top of it.

---

## Addendum A — Cayman Islands Localization Layer

The original roadmap is a generic US/NAR-style MLS template. In the Cayman
market that template is not just incomplete, it is strategically wrong on the
single most important question: **CIREME is not entering an empty market.**

### A.1 Competitive reality: CIREBA — DECISION LOCKED

The Cayman Islands Real Estate Brokers Association (CIREBA) operates the
de-facto national MLS, used by the large majority of active brokerages, and
enforces a cooperation/compensation model on its members. The original roadmap
never mentioned it.

**Phase 0 decision (locked):** CIREME is **Complement + Niche** (a hybrid of
Strategies B and C below). It does **not** compete with CIREBA head-on and does
**not** replicate CIREBA's locked-in compensation model.

| Strategy | Status |
|---|---|
| A. Compete with CIREBA as a rival MLS | **Rejected** — out of scope |
| **B. Complement** — interoperate; do not depend on CIREBA membership | **Adopted** |
| **C. Niche** — serve private sellers (FSBO) and independent / non-CIREBA brokers | **Adopted** |

**Product thesis (the locked positioning):** CIREME is the open marketplace for
**private sellers and independent brokers to list, share, and sell without a
mandatory cooperation/compensation lock-in.** The compensation model is not a
deferred feature — it is a deliberate product *non-goal* and a differentiator.

Consequences that ripple through every later phase:

- CIREBA is treated as an adjacent ecosystem, **not** a competitor or a
  dependency. No CIREBA membership, data feed, or sync is required to operate.
  Optional one-way interoperability (Addendum C.2 RESO export) is a *later*
  convenience, not a blocker.
- Compliance/enforcement scope **shrinks materially** (see A.3, B.1 Phase 5):
  CIREME has no licensed-broker association mandate and does not want one.
  Enforcement is light-touch contractual (accuracy + acceptable-use), not
  professional-conduct adjudication.
- The compensation/cooperation sub-phase is **deleted, not gated** (see A.5,
  B.1 — former Phase 6b is removed).
- The growth ceiling is lower than a national MLS but the regulatory and legal
  surface is far smaller, which is consistent with a small team.

### A.2 Niche value proposition (replaces "adoption moat")

Because CIREME is not competing with CIREBA, the question is not "why does a
broker switch" but **"why does an independent seller or broker list here at
all."** The moat is the positioning itself:

- No mandatory buyer-broker compensation; sellers set their own terms or none.
- Open to FSBO and independent/non-CIREBA brokers who are excluded from or
  unwilling to join the CIREBA MLS.
- Low friction listing input + public-portal lead volume.
- Transparent, no compensation-lock marketplace as the brand.

This belongs in Phase 1 governance as a one-page written positioning statement
and as the public portal's primary marketing message.

### A.3 Legal and regulatory grounding

The original roadmap's Workstream 15 ("Legal, compliance, trust") is a generic
list. Replace its contents with Cayman-specific obligations:

- **Data Protection Act, 2017 (in force 2019).** Lawful basis for processing
  agent, lead, and member personal data; data-subject access/erasure;
  cross-border transfer rules (relevant because Netlify infrastructure is
  off-island). Add a DPA compliance deliverable to Phase 1, not Phase 10.
- **No statutory MLS regulator.** Cayman has no government real-estate
  licensing regime. CIREME's "compliance enforcement" (Workstream 5) therefore
  has **no legal authority** unless it derives from a contractual membership
  agreement. The enforcement model must be re-framed as *contractual sanction
  (suspension of access)*, not regulatory penalty. This changes the compliance
  data model: violations attach to a membership contract, not a license.
  Under the locked Phase 0 niche positioning (A.1) this is scoped down further:
  enforcement covers **listing accuracy and acceptable-use only** (stale/sold
  listings, duplicates, misleading media, missing required fields) — **not**
  professional-conduct adjudication or compensation policing. CIREME is a
  marketplace operator, not a self-regulatory body.
- **Property transfer context.** Stamp duty (one-time, on transfer) and the
  absence of annual property tax shape what "sold" and valuation fields should
  capture; no recurring-tax fields are needed, unlike US templates.
- **Disclaimers.** Valuation/market-projection tools need an explicit "not a
  formal valuation" disclaimer aligned to Cayman practice.

> These are material legal points but should be **confirmed with Cayman counsel**
> before launch. The roadmap should name the obligation and the open question,
> not assert legal certainty.

### A.4 Cayman data model corrections

Replace the original roadmap's generic schema assumptions:

| Original (generic) | Cayman-correct replacement |
|---|---|
| `district` free/loose | Fixed enum: George Town, West Bay, Bodden Town, North Side, East End, Cayman Brac, Little Cayman |
| US-style address only | Add **Block & Parcel** identifiers (Registered Land Act / Lands & Survey). This is the canonical property key in Cayman, more reliable than street address. |
| `tenure` absent / optional | First-class field: **Freehold**, **Strata** (Strata Titles Registration Act), **Leasehold / Crown lease**. Drives mandatory-field rules per type. |
| Generic "ownership type" | Add foreign-ownership note field (no restriction on foreign ownership in Cayman — relevant to public portal marketing copy, not a gate). |
| Currency implicit USD | Explicit **KYD** with USD display option (KYD pegged ~1 KYD = 1.20 USD). |

These changes ripple into Workstream 7 (standardized data model) and Workstream
4 (mandatory fields by property type) and must be reflected in the Phase 3 data
model refactor.

### A.5 Cooperation/compensation: REMOVED by Phase 0 decision

The original roadmap imports "cooperation/compensation fields" (Workstream 6)
from the US model uncritically. Given the locked Phase 0 positioning (A.1),
this is no longer a legally-gated sub-phase — it is **out of scope entirely.**

- **No buyer-broker compensation fields** in the data model or UI. Absence of
  the lock-in is the product, so building the field set would contradict the
  positioning and re-introduce the legal volatility CIREME is avoiding.
- Workstream 6 is **retained only for its non-compensation parts**: listing
  brokerage/agent identification, contact routing, public vs. private remarks,
  member-only fields. The "internal compensation/cooperation fields" bullet is
  struck.
- Former **Phase 6b is deleted** from the plan (see B.1). No counsel gate is
  needed because the field set does not exist.
- A seller *may* free-text any terms they wish in the public description; the
  platform takes no structured position on compensation and displays no
  cooperation-fee field. This stance should be stated in the membership
  agreement and acceptable-use policy (A.3 / Phase 1).

---

## Addendum B — Operational Plan Layer

The original roadmap's 10 phases are nearly all labeled "Critical" with no time,
effort, owners, or exit criteria. It is a taxonomy, not a plan. This addendum
makes it executable. Estimates assume a small team (≈2–3 engineers, 1
product/governance lead) and **Strategy A.1 decided**; adjust proportionally.

### B.1 Sized, sequenced phase plan

| Phase | Name | Est. duration | Effort (eng-wks) | Owner | Hard gate to next? |
|---|---|---|---|---|---|
| 0 | **Strategy decision — LOCKED: Complement + Niche (A.1)** | done | n/a | Product/Founder | **Closed** |
| 0b | Counsel review (DPA, membership terms, no-compensation stance) | 1–2 wks | n/a (lead + counsel) | Product/Founder | **Yes** |
| 1 | Governance & MLS design (incl. positioning statement A.2) | 3–4 wks | 2 | Product/Governance | Yes |
| 2 | Broker/seller & account layer | 3–5 wks | 6–8 | Eng | Yes |
| 3 | MLS data model refactor (incl. A.4, **no compensation fields**) | 4–5 wks | 7 | Eng | Yes |
| 4 | Listing lifecycle engine | 5–7 wks | 10–12 | Eng | Yes |
| 5 | Compliance system (light-touch accuracy/AUP only — A.3) | 3–4 wks | 5–6 | Eng | Soft |
| 6 | Cooperation & member-only data (**compensation removed — A.5**) | 3–4 wks | 6 | Eng | Soft |
| 7 | Public portal synchronization | 3–4 wks | 6 | Eng | Soft |
| 8 | Search & market analytics | 4–5 wks | 8 | Eng | No |
| 9 | API & RESO export (one-way, optional CIREBA interop) | 4–6 wks | 8–10 | Eng | No |
| 10 | Launch readiness | 3–4 wks | 6 | All | Yes |

Former **Phase 6b (compensation fields) is deleted** per A.5. Phase 2 and 5
shrink because the niche positioning removes brokerage-hierarchy depth and
professional-conduct enforcement.

Indicative critical path: **0b → 1 → 2 → 3 → 4 → 5 → 7 → 10**, ≈6–9 months
elapsed for a small team (reduced from the original ~8–11 by the niche scope
cuts). Phases 6, 8, 9 run in parallel off the critical path. These are planning
estimates for sequencing, not commitments.

### B.2 Re-prioritization (replaces "everything is Critical")

- **Must-have for any launch:** Phases 0, 1, 2, 3, 4, 7, 10.
- **Must-have before *MLS* launch (Strategy A):** add 5, 6.
- **Post-launch:** 8, 9, 6b, advanced analytics, advertising marketplace.

### B.3 Measurable exit criteria (replaces qualitative Section 9)

Each phase ships only when its criteria are objectively met. Examples:

- **Phase 1:** Roles/permissions matrix signed off; listing rulebook v1;
  public/private field classification covering 100% of current listing fields;
  DPA processing register drafted.
- **Phase 3:** 100% of existing listings migrated (Addendum C) with zero data
  loss verified by row-count + checksum reconciliation; every field mapped to
  public/private; Block & Parcel populated for ≥95% of active listings.
- **Phase 4:** Every status transition covered by an automated test; no listing
  can publish while failing completeness rules (verified by negative tests).
- **Phase 5:** Every listing edit produces an immutable audit row; compliance
  dashboard surfaces 100% of seeded violation fixtures.
- **Phase 10:** Membership approval runbook executed end-to-end in staging;
  legal text counsel-approved; backup + restore drill passes within RTO.

### B.4 Cross-cutting items the original roadmap omitted

Add as continuous tracks, not phases:

- **Security & auth** (more than "auth helpers"): session model, role-aware
  authorization tests, rate limiting, secrets handling, audit-log tamper
  resistance. Owned from Phase 2 onward.
- **Test strategy**: lifecycle/permission logic is unit + integration tested as
  built — not deferred to a Phase 10 "QA matrix."
- **Observability**: structured logging and an admin error/health view by
  Phase 4 (an MLS that silently drops listings loses trust instantly).

---

## Addendum C — Migration & Interoperability Layer

The original roadmap refactors the data model (Phase 3) and adds an API (Phase
9) but never says how existing CIREME data gets there, nor names the
interoperability standard. Both are required.

### C.1 Data migration plan (slots into Phase 3)

1. **Inventory & profile** current listings/agents/leads/applications: counts,
   field cardinality, null rates, duplicates.
2. **Mapping spec**: every legacy field → new canonical field, with
   public/private classification and Cayman corrections (A.4). Unmapped fields
   explicitly marked drop/defer with rationale.
3. **Backfill rules**: Block & Parcel, district enum, tenure — defined defaults
   and a manual-review queue for records that can't be auto-mapped.
4. **Dry-run on a copy**: reconcile by row counts and per-field checksums;
   produce a discrepancy report; zero unexplained loss is the gate.
5. **Cutover**: freeze writes, migrate, verify against B.3 Phase 3 criteria,
   then reopen. Documented rollback to the frozen snapshot.

### C.2 Interoperability target: name RESO explicitly

The original roadmap says "align with MLS data standards" without naming one.
The standard is **RESO** (Real Estate Standards Organization):

- **RESO Data Dictionary** — adopt its field names/enumerations as the canonical
  naming target in Workstream 7 / Phase 3, so the schema is RESO-shaped from day
  one rather than retrofitted. Map Cayman-specific fields (Block & Parcel,
  tenure, district enum) as documented local extensions.
- **RESO Web API** — the target shape for the Phase 9 member/export API
  (OData-style resource model), even if full conformance is post-launch.

Designing Phase 3 to RESO now is near-zero extra cost; retrofitting it after
Phase 9 is a second full data-model refactor. This is the highest-leverage
single change in these addendums.

### C.3 Public/private enforcement at the boundary

Reinforces Workstream 12: the public portal must read only from a **public-safe
view/projection** that physically cannot express private fields — not from the
core tables with filtering in application code. A leaked private remark or
compensation field destroys MLS trust irrecoverably; make the separation
structural, and add a test that fails if any private-classified field appears in
the public projection.

---

## Summary of changes to the original roadmap

| Original gap | Addendum fix |
|---|---|
| No Cayman/CIREBA strategy | A.1 **LOCKED: Complement + Niche**; A.2 niche positioning |
| Generic legal section | A.3 DPA, light-touch contractual enforcement, counsel gate |
| US-style schema | A.4 Block & Parcel, tenure, district enum, KYD |
| Compensation imported blindly | A.5 **removed entirely** — anti-lock-in is the product |
| No time/effort/owners | B.1 sized phase plan + critical path (~6–9 mo, niche-scoped) |
| "Everything Critical" | B.2 re-prioritization |
| Unmeasurable success | B.3 objective per-phase exit criteria |
| Security/test/observability missing | B.4 cross-cutting tracks |
| No migration plan | C.1 five-step plan in Phase 3 |
| Standard unnamed | C.2 explicit RESO Data Dictionary + Web API target |
| Public/private filtered in app code | C.3 structural public-safe projection + guard test |

**Net effect on scores:** Cayman relevance 3 → ~8, Usability 6 → ~8,
Effectiveness 7 → ~8, with growth potential preserved at ~8 and now defensible.
