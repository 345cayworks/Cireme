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

### A.1 Competitive reality: CIREBA

The Cayman Islands Real Estate Brokers Association (CIREBA) already operates the
de-facto national MLS, used by the large majority of active brokerages. The
original roadmap never mentions it. This is the central strategic risk and must
be answered before any code is written.

**Decision required (pick one explicitly):**

| Strategy | Description | Implication for roadmap |
|---|---|---|
| **A. Compete** | CIREME becomes an independent MLS rivaling CIREBA | Requires a membership/adoption strategy and a moat (see A.2). Highest risk. |
| **B. Complement** | CIREME is a technology/portal layer; listings sync from/to CIREBA | Workstreams 11–12 become primary, not deferred. Lower risk, lower control. |
| **C. Niche** | CIREME serves non-CIREBA brokers, FSBO, advertisers, or a vertical | Governance and compliance scope shrinks; growth ceiling lower. |

No technical workstream should start until ownership selects A, B, or C. Every
downstream estimate in Addendum B assumes a choice has been made.

### A.2 Adoption moat (only required if Strategy A)

If competing, the roadmap must add a workstream the original omitted entirely —
**why a broker switches.** Candidate moats: superior listing input UX, real
compliance/accuracy guarantees, public-portal lead volume, lower cost, better
data exports. This belongs in Phase 1 governance as a written value proposition,
not as a feature.

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

### A.5 Cooperation/compensation caution

The original roadmap imports "cooperation/compensation fields" (Workstream 6)
from the US model uncritically. Buyer-broker compensation display is the most
legally volatile area in the industry post-NAR settlement. **Recommendation:**
ship the cooperation *visibility/contact-routing* model in Phase 6, but treat
**compensation fields as a separate, legally-gated sub-phase** that does not
block Phase 6, and is signed off by counsel and CIREBA-strategy decision (A.1).

---

## Addendum B — Operational Plan Layer

The original roadmap's 10 phases are nearly all labeled "Critical" with no time,
effort, owners, or exit criteria. It is a taxonomy, not a plan. This addendum
makes it executable. Estimates assume a small team (≈2–3 engineers, 1
product/governance lead) and **Strategy A.1 decided**; adjust proportionally.

### B.1 Sized, sequenced phase plan

| Phase | Name | Est. duration | Effort (eng-wks) | Owner | Hard gate to next? |
|---|---|---|---|---|---|
| 0 | **Strategy decision (A.1) + counsel review (A.3)** | 2–3 wks | n/a (lead + counsel) | Product/Founder | **Yes** |
| 1 | Governance & MLS design | 3–4 wks | 2 | Product/Governance | Yes |
| 2 | Broker & office layer | 4–6 wks | 8–10 | Eng | Yes |
| 3 | MLS data model refactor (incl. A.4) | 4–5 wks | 8 | Eng | Yes |
| 4 | Listing lifecycle engine | 5–7 wks | 10–12 | Eng | Yes |
| 5 | Compliance system (contractual model A.3) | 4–6 wks | 8–10 | Eng | Soft |
| 6 | Cooperation & member-only data | 4–5 wks | 8 | Eng | Soft |
| 6b | Compensation fields (legally gated) | gated | 2 | Eng + Counsel | No (parallel) |
| 7 | Public portal synchronization | 3–4 wks | 6 | Eng | Soft |
| 8 | MLS search & analytics | 4–5 wks | 8 | Eng | No |
| 9 | API & RESO alignment (Addendum C) | 4–6 wks | 8–10 | Eng | No |
| 10 | Launch readiness | 3–4 wks | 6 | All | Yes |

Indicative critical path (Strategy A): **0 → 1 → 2 → 3 → 4 → 5 → 7 → 10**,
≈8–11 months elapsed for a small team. Phases 6, 8, 9 run in parallel off the
critical path. These are planning estimates for sequencing, not commitments.

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
| No Cayman/CIREBA strategy | A.1 mandatory Phase 0 decision; A.2 moat |
| Generic legal section | A.3 DPA, contractual (not regulatory) enforcement, counsel gate |
| US-style schema | A.4 Block & Parcel, tenure, district enum, KYD |
| Compensation imported blindly | A.5 legally-gated parallel sub-phase 6b |
| No time/effort/owners | B.1 sized phase plan + critical path |
| "Everything Critical" | B.2 re-prioritization |
| Unmeasurable success | B.3 objective per-phase exit criteria |
| Security/test/observability missing | B.4 cross-cutting tracks |
| No migration plan | C.1 five-step plan in Phase 3 |
| Standard unnamed | C.2 explicit RESO Data Dictionary + Web API target |
| Public/private filtered in app code | C.3 structural public-safe projection + guard test |

**Net effect on scores:** Cayman relevance 3 → ~8, Usability 6 → ~8,
Effectiveness 7 → ~8, with growth potential preserved at ~8 and now defensible.
