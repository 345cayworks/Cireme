# CIREME Legal Review Status — v1 (U7)

> Tracks the counsel-review exit item (formerly Dev 0b, now folded into U7).
> **The build agent cannot obtain legal sign-off.** This file records what
> must be reviewed, the binding constraints the documents must honour, and
> the current status. Counsel completes the Status column.

## Binding constraints (must hold in every document)

- **Locked Phase 0 positioning** (`Positioning_Statement.md`): Complement +
  Niche, **no compensation / cooperation-fee** mechanics anywhere. CIREME is
  **not a party to any transaction** and sets no fees. Schema is verified
  free of compensation fields and U-phases must not introduce any.
- Public/private data separation is structural (`public-safe.ts`,
  `member-safe.ts`) — privacy policy must describe member-only vs public
  data accordingly.
- No self-serve password reset; admin-mediated access (reflect in T&Cs/
  support language).

## Documents for counsel

| Document | Purpose | Draft exists? | Counsel status |
|---|---|---|---|
| Membership Agreement | Member/broker/agent/advertiser terms; no-compensation stance | ✅ `legal/Membership_Agreement.DRAFT.md` | ☐ pending |
| Acceptable Use Policy (AUP) | Listing accuracy, prohibited conduct, enforcement ladder mapping | ✅ `legal/Acceptable_Use_Policy.DRAFT.md` | ☐ pending |
| Privacy Policy | Personal data, public vs member-only fields, retention, audit log | ✅ `legal/Privacy_Policy.DRAFT.md` | ☐ pending |
| DPA / off-island transfer basis | Cayman → hosting (Netlify/Neon) data transfer lawful basis | ✅ `legal/DPA_Offisland_Transfer_Basis.DRAFT.md` (question set, not a conclusion) | ☐ pending |
| Public disclaimers | Already shipped on tools/listings ("estimates only", "not a valuation/party") | ✅ in product | ☐ confirm wording |

## Status

**DRAFTS PREPARED — PENDING COUNSEL — launch-blocking.** All four drafts
exist under `governance/legal/` (start with `Counsel_Review_Cover_Note.md`)
and are clearly marked "DRAFT — NOT LEGAL ADVICE". They reflect how the
system actually behaves and flag every legal decision as a `[BRACKET]`
placeholder or an explicit open question rather than inventing answers.
**No document has counsel sign-off; drafting is not review.**

Remaining [OWNER] action: engage counsel, supply the bracketed inputs
(entity, processors/regions, retention, governing law), capture approved
final text, record sign-off (date + reviewer) here, then check the U7 gate
item in `Launch_Runbook.md` and the Roadmap.

> Per the recorded U7 owner waiver, launch may proceed without sign-off;
> the residual legal risk remains explicitly owner-accepted until counsel
> completes this. These drafts exist so that risk can still be closed
> properly post-haste.
