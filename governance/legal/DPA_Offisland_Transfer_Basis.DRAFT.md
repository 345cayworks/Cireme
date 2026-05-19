# CIREME — Off-Island Data Transfer Basis Analysis — DRAFT v0.1

> **DRAFT — NOT LEGAL ADVICE. THIS IS A STRUCTURED QUESTION SET FOR
> COUNSEL, NOT A LEGAL CONCLUSION.** The build agent cannot determine the
> lawful basis for transferring personal data outside the Cayman Islands.
> This document states the facts the platform can assert and the legal
> questions counsel must answer.

## 1. Factual basis (what the build can assert)

1.1 CIREME processes personal data of Cayman-based members, applicants,
and enquirers (see Privacy Policy §2).

1.2 The application is hosted on, and personal data is stored/processed
by, **off-island service providers**. Based on Netlify's published
documentation (qualified — not verified against the live account):

- The application is built on the **Netlify platform** and uses **Netlify
  Database**, which Netlify documents as a fully managed Postgres database
  built into the Netlify platform, with Netlify handling provisioning,
  migrations, and branching, and usable from Functions, Edge Functions,
  Builds, and Agent Runners.
- Netlify's platform documentation describes Netlify Database as
  provisioning a Postgres database instance **with Neon**.
- Netlify documents production deploys as accessing the **main database**
  and **deploy previews as receiving their own database branch copied
  from production data when created** — so preview branches may contain
  copies of production personal data.

**No specific data-residency region, server location, or final processor/
sub-processor list is asserted.** The owner must confirm the actual
production database provider, region(s), processors, sub-processors,
contractual/DPA terms, and the preview-branch data position from the live
Netlify/Neon account and vendor terms before counsel finalises this
analysis (see §3 checklist).

1.3 Data leaving the Cayman Islands includes: account/membership data,
application records, routed contact data, and operational/audit logs, and
**potentially copies of the foregoing in deploy-preview database
branches**.

1.4 The one-way RESO export and public portal expose **public data only**;
member-only and private data remain access-controlled but are still
**stored** by the off-island processors (and potentially copied into
preview branches per 1.2).

## 2. Legal questions for counsel (unanswered by design)

> The build agent must not guess these. Each requires a Cayman Islands
> data-protection legal opinion.

1. **Applicability:** Does the **Cayman Islands Data Protection Act** (and
   any successor/related guidance) apply to CIREME's processing here, and
   in what controller/processor configuration?

2. **Transfer restriction:** Does the Act restrict transfer of personal
   data to the jurisdictions where `[HOSTING PROCESSORS]` operate? Is an
   adequacy/whitelist concept available, or is a specified safeguard
   required?

3. **Lawful basis for transfer:** Which basis applies — data-subject
   consent, necessity for performance of the membership contract,
   adequacy, contractual safeguards (e.g. standard/processor contractual
   clauses), or another? What documentation/clauses must be in place with
   each processor?

4. **Notice obligations:** What must the Privacy Policy and Membership
   Agreement disclose to data subjects about the off-island transfer and
   its safeguards?

5. **Processor agreements:** Are the existing `[HOSTING PROCESSOR]` data
   processing addenda sufficient under Cayman law, or are bespoke terms
   required?

6. **Audit-log interaction:** The audit log is immutable and stored
   off-island; does this affect the transfer analysis or data-subject
   rights handling (cross-reference Privacy Policy §5)?

7. **Deploy-preview branches:** If preview deploys receive a database
   branch copied from production data, does that copy constitute a further
   transfer and/or additional processing requiring its own lawful basis,
   safeguards, access controls, and retention/deletion handling
   (cross-reference Privacy Policy §6.3)?

8. **Breach/incident:** Cross-border breach notification obligations and
   timelines.

## 3. Decisions required from owner (inputs to counsel)

**3.1 Hosting/database confirmation checklist** (owner to verify from the
live Netlify/Neon account and vendor terms; counsel cannot proceed
without these):

| # | Item to confirm | Confirmed? |
|---|---|---|
| a | Production database **provider** (Netlify Database / Neon) and contracting relationship | ☐ |
| b | Production database **region(s)** / data-residency | ☐ |
| c | Netlify platform **service region(s)** (Functions/Edge/Builds/Agent Runners) | ☐ |
| d | Full **processor** list and each party's role (Netlify, Neon, any others) | ☐ |
| e | Full **sub-processor** list | ☐ |
| f | Applicable **data-processing terms / DPA** with each processor and sub-processor | ☐ |
| g | Whether **deploy-preview database branches contain personal data** (copied from production), who can access them, and their retention/deletion | ☐ |
| h | Whether data residency can be **constrained** (e.g. region pinning) if counsel advises it materially reduces risk | ☐ |

3.2 Acceptable risk posture if a clean lawful transfer basis is not
readily available (owner decision, recorded).

## 4. Outcome to record (counsel completes)

| Question | Counsel determination | Date / reviewer |
|---|---|---|
| DPA applicability | `[ ]` | `[ ]` |
| Transfer restricted? | `[ ]` | `[ ]` |
| Lawful basis relied on | `[ ]` | `[ ]` |
| Required safeguards/clauses | `[ ]` | `[ ]` |
| Required notice text | `[ ]` | `[ ]` |
| Sign-off | `[ ]` | `[ ]` |

---
*Until §4 is completed by counsel and the owner has actioned any required
processor clauses, the off-island transfer basis is **unresolved**. Per
the recorded U7 owner waiver, launch may proceed without this; the residual
legal risk remains explicitly owner-accepted and is not closed by this
draft.*
