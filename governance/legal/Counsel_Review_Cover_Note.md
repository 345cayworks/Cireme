# CIREME — Counsel Review Pack (Cover Note)

> **DRAFT — NOT LEGAL ADVICE. PREPARED BY A BUILD AGENT FOR COUNSEL
> REVIEW.** None of the documents in `governance/legal/` have any legal
> force until a qualified Cayman Islands attorney has reviewed, corrected,
> and the owner has adopted final text. They are starting points for
> redlining, written to reflect how the system actually behaves — not
> legal opinions.

## What this pack is

Drafts for the four U7 launch-blocking legal items, plus this note:

| # | File | Reviews |
|---|---|---|
| 1 | `Membership_Agreement.DRAFT.md` | Member/broker/agent/advertiser terms |
| 2 | `Acceptable_Use_Policy.DRAFT.md` | Conduct, listing accuracy, enforcement |
| 3 | `Privacy_Policy.DRAFT.md` | Personal data, public vs member-only, retention |
| 4 | `DPA_Offisland_Transfer_Basis.DRAFT.md` | Cayman → off-island hosting transfer basis |

## Hard product constraints counsel must preserve

These are not negotiable in drafting — they are how the system is built
and positioned. If counsel's wording would change any of these, that is a
**product/positioning decision for the owner**, not a drafting tweak:

1. **No compensation / cooperation-fee mechanics anywhere.** CIREME is
   **not a party to any real-estate transaction**, sets no fees, and
   carries no buyer-agent compensation data (verified in code and tests).
   Documents must not imply otherwise.
2. **Estimates are not valuations.** Pricing/market tools are indicative
   only; product already disclaims this.
3. **Public vs member-only data is structural.** The public sees only the
   public projection; member-only fields require an active MLS role; the
   one-way RESO export carries public data only.
4. **No self-serve password reset.** Access is admin-mediated; support
   language must not promise self-service credential recovery.
5. **Cayman-specific.** Cayman Islands law governs; Block & Parcel, KYD,
   district model. No off-island legal assumptions.

## Business Licence Qualification

A Cayman Islands Trade & Business Licence document was provided and is
*reflected* in the drafts on a **qualified, historical basis only**:

- Ref No. 30624; Licence No. 95640.
- Issued under the **Trade and Business Licensing Act (2021 Revision),
  section 21**.
- Licensee (as recorded): **ROBERT NORMAN LYNCH T/A CAYMAN ISLANDS REAL
  ESTATE MARKET EXPLORER**.
- Premises (as recorded): Block 20B, Parcel 342 H49, Unit 112 Canon
  Place, George Town, Grand Cayman, Cayman Islands.
- Licensed activity (as recorded): **REAL ESTATE MARKETING, PROMOTION,
  AND IT SUPPORT**.
- Effective period (as recorded): **2 November 2023 to 2 November 2024**.
- Condition (as recorded): no advertising signs at the premises without
  Central Planning Authority approval.

The drafts use cautious language ("originally reflected", "historically
licensed for") and **do not assert the licence is currently active** — the
recorded period has elapsed and no renewed licence has been provided.
CIREME is positioned strictly within the recorded licensed activity:
real-estate **marketing, promotion, listing information, and IT support**.
It is **not** described as, and must not be described as, a broker,
real-estate agent, valuer/appraiser, escrow provider, conveyancer, lender,
or transaction party, and not as setting/collecting/brokering/facilitating
commissions, buyer-agent compensation, cooperation fees, or transaction
payments. **Launch-blocking confirmation:** owner + counsel must confirm
current licensing status, the renewed licence (if any), and the correct
contracting legal entity/registered address before adoption.

## Server / Database Qualification

Hosting language in the drafts is **qualified to Netlify's published
documentation and is not verified against the live account**:

- The app is built on the **Netlify platform** and uses **Netlify
  Database** — documented by Netlify as a fully managed Postgres database
  built into the platform; Netlify handles provisioning, migrations, and
  branching; usable from Functions, Edge Functions, Builds, and Agent
  Runners.
- Netlify's platform documentation describes Netlify Database as
  provisioning a Postgres instance **with Neon**.
- Netlify documents production deploys as accessing the **main database**
  and **deploy previews as receiving their own database branch copied
  from production data** — so preview branches may contain production
  personal data (treated as a privacy/transfer issue in the Privacy
  Policy §6.3 and the transfer-basis question set).

**No specific data-residency region, server location, or final processor/
sub-processor list is asserted.** Launch-blocking confirmations (owner +
counsel): production database provider, region(s), processors,
sub-processors, data-processing/DPA terms, whether preview database
branches contain personal data, and the off-island transfer safeguards —
together with current licensing status, contracting legal entity, and
regions — **remain open and launch-blocking** (subject to the recorded
U7 owner waiver, which does not close them).

## Decisions counsel / owner must supply (left as `[BRACKETS]`)

The drafts deliberately do **not** invent these. Each appears as a
bracketed placeholder and is listed here so nothing is missed:

- `[LEGAL ENTITY NAME]`, `[REGISTERED ADDRESS]`, `[CONTACT EMAIL]`,
  `[DPO / PRIVACY CONTACT]`.
- `[GOVERNING LAW]` / `[DISPUTE FORUM]` — expected Cayman Islands; counsel
  to confirm and add arbitration vs. courts choice.
- `[DATA RETENTION PERIODS]` — audit log, closed listings, terminated
  accounts, application records. Audit log is **immutable by design**;
  counsel must square this with any erasure obligations.
- `[HOSTING PROCESSORS]` — current build references Netlify (app) and a
  managed Postgres (e.g. Neon). Owner to confirm actual processors and
  regions before the DPA analysis is finalised.
- `[CAYMAN DPA APPLICABILITY]` — whether and how the Cayman Islands Data
  Protection Act applies to CIREME's processing, and the lawful transfer
  basis for off-island hosting. Counsel opinion required (see doc 4).
- `[BREACH NOTIFICATION TIMELINE]`, `[COMPLAINT / SUPERVISORY AUTHORITY
  ROUTE]`.

## Open legal questions flagged for counsel

1. **Off-island transfer (doc 4):** does hosting personal data outside the
   Cayman Islands trigger a transfer-restriction under the Cayman DPA, and
   what is the lawful basis (consent, contractual necessity, adequacy,
   safeguards)? The build cannot answer this.
2. **Immutable audit log vs. data-subject erasure/rectification:** the
   audit log is append-only and security-critical. Counsel must advise how
   to reconcile this with rectification/erasure rights (e.g. restriction,
   pseudonymisation, retention justification).
3. **Member vs. data-subject role:** members are both users and processors
   of others' contact data routed through the platform — counsel to
   confirm controller/processor allocation and whether a member-facing
   data-handling clause is needed in the Membership Agreement/AUP.
4. **Advertiser tier:** confirm advertisers' reduced rights/obligations are
   adequately separated from MLS-member obligations.

## Status

All four drafts: **prepared, PENDING COUNSEL.** Drafting is complete;
**sign-off remains the launch-blocking U7 item** and is an owner action
(engage counsel → capture final text → record sign-off in
`governance/Legal_Review_Status.md` → check the U7 gate). Per the recorded
U7 owner waiver, launch may proceed without this; these drafts exist so
the waived risk can still be properly closed.
