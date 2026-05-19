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
by, **off-island service providers**. Current build references:
`[CONFIRM: application hosting — e.g. Netlify; managed Postgres database —
e.g. Neon; their processing regions]`. Owner must confirm the actual
processors, contractual terms, and data-residency regions before counsel
finalises this analysis.

1.3 Data leaving the Cayman Islands includes: account/membership data,
application records, routed contact data, and operational/audit logs.

1.4 The one-way RESO export and public portal expose **public data only**;
member-only and private data remain access-controlled but are still
**stored** by the off-island processors.

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

7. **Breach/incident:** Cross-border breach notification obligations and
   timelines.

## 3. Decisions required from owner (inputs to counsel)

- Confirmed list of processors, sub-processors, contractual terms, and
  hosting regions.
- Whether data residency can be constrained (e.g. region pinning) if
  counsel advises it materially reduces risk.
- Acceptable risk posture if a clean lawful basis is not readily
  available.

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
