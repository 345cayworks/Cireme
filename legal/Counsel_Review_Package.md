# CIREME — Phase 0b Counsel Review Package

> Cover memo and tracking sheet for the **Phase 0b — Counsel review** gate in
> `CIREME_Development_Plan.md`. Phase 0b is a governance gate: the engineering/
> governance work (assembling a complete, internally consistent, review-ready
> package and drafting the DPA basis) is **done**; the gate itself **closes only
> on qualified Cayman counsel sign-off**, which is recorded below.

## 1. Gate definition

**Exit criteria (from the Development Plan):** *Counsel sign-off on
agreement/AUP/privacy; DPA off-island transfer basis documented.*

## 2. Documents in scope

| Doc | File | Status |
|---|---|---|
| Membership Agreement | `legal/Membership_Agreement_DRAFT.md` | Draft — ready for review |
| Acceptable Use Policy | `legal/Acceptable_Use_Policy_DRAFT.md` | Draft — ready for review |
| Privacy Policy | `legal/Privacy_Policy_DRAFT.md` | Draft — ready for review |
| DPA Processing & Transfer Basis | `legal/DPA_Processing_and_Transfer_Basis_DRAFT.md` | Draft — ready for review |

The four documents are cross-referenced and internally consistent
(no-compensation-lock-in, access-only enforcement, status-update window,
notice periods, controller/processor mapping). The Privacy Policy data
inventory and the DPA register are grounded in the live schema
(`src/db/schema.ts`).

## 3. Consolidated open items for counsel

Engineering/business owners should pre-fill bracketed `[ ]` business facts
(entity name, fees, retention periods, notice periods) before counsel review.

**Legal-judgement items (counsel):**
- [ ] Operating entity legal name, structure, capacity to contract
- [ ] Cayman real-estate practice requirements (if any) for the Independent
      Broker/Agent tier
- [ ] Applicable Cayman anti-discrimination / fair-marketing statute(s)
- [ ] DPA Schedule 4 transfer basis sufficiency (contract necessity vs. adduced
      safeguards) and any Ombudsman notification/registration requirement
- [ ] DPA breach-notification thresholds and timelines
- [ ] Enforceability of liability cap and "as is" disclaimer under Cayman law
- [ ] Governing law / dispute resolution (courts vs. arbitration)
- [ ] §3 no-compensation-lock-in wording vs. competition-law exposure
- [ ] Consumer-protection rules for the Private Seller (consumer) tier
- [ ] Retention vs. erasure-right reconciliation against the immutable audit log

**Business/engineering pre-fill items:**
- [ ] Entity name; fee model & tax treatment (KYD); refund policy
- [ ] Status-update window `[X business days]` (single value across docs)
- [ ] Notice periods (changes, termination) — single value across docs
- [ ] Retention periods for account / listings / audit / logs
- [ ] Executed Netlify DPA and Neon DPA; selected DB region recorded

## 4. Phase 0b sign-off (gate closes here)

This section is the authoritative record. Phase 0b remains **OPEN** until all
rows are signed by qualified Cayman Islands counsel.

| Deliverable | Counsel-approved | Counsel name | Date |
|---|---|---|---|
| Membership Agreement | ☐ | | |
| Acceptable Use Policy | ☐ | | |
| Privacy Policy | ☐ | | |
| DPA processing register & transfer basis | ☐ | | |
| **Phase 0b gate — CLEARED** | ☐ | | |

## 5. Status summary

- **Engineering/governance deliverables:** complete — package assembled,
  cross-checked, DPA basis drafted and mapped to the real stack and schema.
- **Gate status:** **OPEN — awaiting external counsel sign-off** (cannot be
  satisfied internally; this is by design for a legal gate).
- **Recommended next step:** route this package to Cayman counsel; in parallel,
  unblock the non-legal critical-path item (Phase 2 account/permission negative
  tests), which does not depend on 0b.
