# CIREME Listing Rulebook — v1

> Phase 1 governance deliverable ("listing rulebook v1"). Defines the rules a
> listing must follow. These rules are operationalized by the Phase 4 lifecycle
> engine and the Phase 5 compliance engine; this document is the human-readable
> specification those modules implement.

## 1. Status model

`draft → incomplete → active → pending → sold` plus `withdrawn`, `expired`,
`canceled`, `off_market`. Transitions are restricted by a state machine
(`src/lib/listing-lifecycle.ts`); `sold` and `canceled` are terminal. Public
visibility is limited to `active`, `pending`, and `sold`.

## 2. Completeness (publication gate)

A listing may enter a publicly visible status only if it has: title, property
type, district, tenure, price (KYD), public description, Block & Parcel, and at
least one media item. Enforced by `validateCompleteness`; entering a public
status while incomplete is blocked and is a compliance finding if it occurs.

## 3. Accuracy obligations

All stated facts must be accurate and not misleading at submission. Status must
be updated promptly when the property goes pending/sold/withdrawn/off-market
(window: **[X business days]** — must match Membership Agreement §4 / AUP §2).
No duplicate records for the same property (same district + Block & Parcel).

## 4. No-compensation-lock-in

No field, free-text, media, or upload may publish or impose buyer-broker
cooperation compensation. The schema provides no such field; circumvention is a
material breach (Membership Agreement §3, AUP §3).

## 5. Media

Media must depict the actual subject property; the submitter must hold the
rights (Membership Agreement §7). Misleading media is a manual compliance
finding.

## 6. Compliance findings (automated)

The sweep raises: `missing_required_fields`, `stale_listing` (no update in 180
days while active), `sold_left_active`, `duplicate`. `misleading_media` and
`incorrect_classification` are raised by human review, not the sweep. Findings
are auditable and enforced access-only (flag → correction → unpublish → remove
→ account suspend/terminate).

## 7. Audit

Every create, status change, price change, and compliance action writes an
immutable audit row (actor + before/after). Audit rows are append-only.

## Change control

Rule changes require updating the corresponding lifecycle/compliance code and
tests in the same pull request, and must remain consistent with the Membership
Agreement, AUP, and Positioning Statement.
