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
| Membership Agreement | Member/broker/agent/advertiser terms; no-compensation stance | ☐ draft needed | ☐ pending |
| Acceptable Use Policy (AUP) | Listing accuracy, prohibited conduct, enforcement ladder mapping | ☐ draft needed | ☐ pending |
| Privacy Policy | Personal data, public vs member-only fields, retention, audit log | ☐ draft needed | ☐ pending |
| DPA / off-island transfer basis | Cayman → hosting (Netlify/Neon) data transfer lawful basis | ☐ analysis needed | ☐ pending |
| Public disclaimers | Already shipped on tools/listings ("estimates only", "not a valuation/party") | ✅ in product | ☐ confirm wording |

## Status

**PENDING COUNSEL — launch-blocking.** No document has counsel sign-off.
This is an [OWNER] action: engage counsel, capture approved final text,
record sign-off (date + reviewer) here, then check the U7 gate item in
`Launch_Runbook.md` and the Roadmap.

> Recommendation: drafting the four documents and the DPA transfer analysis
> can proceed in parallel with U4/U6 engineering; only **sign-off** gates
> launch. If you want, the agent can draft starting text for counsel to
> redline (clearly marked "DRAFT — NOT LEGAL ADVICE"), but that does not
> substitute for review.
