# CIREME Privacy Policy — DRAFT v0.1

> **DRAFT — NOT LEGAL ADVICE. FOR COUNSEL REVIEW ONLY.** Not binding until
> reviewed by a qualified Cayman Islands attorney (with specific regard to
> the **Cayman Islands Data Protection Act** and its applicability) and
> adopted by `[LEGAL ENTITY NAME]`. Retention periods and the
> audit-log/erasure reconciliation are flagged for counsel.

## 1. Who we are

`[LEGAL ENTITY NAME]`, `[REGISTERED ADDRESS]`, operating the CIREME
platform. Privacy contact / `[DPO IF APPLICABLE]`: `[PRIVACY CONTACT]`.

## 2. Data we process

| Category | Examples | Source |
|---|---|---|
| Account data | Name, email, role, membership status | You / administrator |
| Application data | Eligibility/registration details, application history | You |
| Listing data | Property details, media, public & member-only remarks | You (member) |
| Contact-routing data | Enquiry/contact details routed to members | Enquirers |
| Operational logs | Immutable audit log of actions (actor, action, entity, time, before/after) | System |
| Indicative tooling inputs | Values entered into market/pricing tools | You |

## 3. Public vs. member-only vs. private data (structural)

3.1 CIREME enforces data separation **in code**, not just by policy:

- **Public projection** — what unauthenticated visitors and the one-way
  RESO export see. Contains only fields classified public.
- **Member-only** — additional fields (e.g. member remarks, routed
  contacts) visible only to authenticated users holding an active MLS
  role.
- **Private/internal** — never exposed to lower-trust audiences; used for
  operations, compliance, and audit.

3.2 The one-way RESO export is member-access-controlled and carries
**public data only**; it does not export member-only or private fields.

## 4. Purposes and lawful basis

We process personal data to: operate membership and listings; route
enquiries; run compliance and enforcement; maintain security and an
immutable audit trail; and provide indicative tools. Lawful basis under
`[CAYMAN DPA / APPLICABLE LAW — counsel to map each purpose to a basis:
contract, legitimate interests, consent, legal obligation]`.

## 5. The audit log (important)

5.1 The audit log is **append-only and immutable by design** for security,
integrity, and compliance. It records who did what and when, including
before/after states of records.

5.2 `[COUNSEL: reconcile the immutable audit log with data-subject
rectification/erasure rights — e.g. restriction, pseudonymisation, or a
documented retention/overriding-interest justification. The build cannot
silently delete or alter audit entries; advise the lawful approach.]`

## 6. Sharing and processors

6.1 We do not sell personal data. We share it with:

- **Members**, for legitimate real-estate contact (routed enquiries,
  member-only remarks).
- **Platform / hosting processors** (qualified — see 6.2).

6.2 **Hosting and database (qualified — not yet confirmed).** Based on
Netlify's published platform documentation, the application is built on
the Netlify platform and uses **Netlify Database**, which Netlify
documents as a fully managed Postgres database built into the Netlify
platform, with Netlify handling provisioning, migrations, and branching,
and usable from Functions, Edge Functions, Builds, and Agent Runners.
Netlify's platform documentation further describes Netlify Database as
provisioning a Postgres database instance **with Neon**. The **exact
processors and sub-processors (including Netlify and Neon's roles),
database region(s), service region(s), and the applicable data-processing
terms are NOT yet confirmed** and must be verified from the live
Netlify/Neon account and the vendors' contractual terms before this
policy is finalised. No specific data-residency region or server location
is asserted here.

6.3 **Deploy-preview database branches (privacy/compliance issue).**
Netlify's documentation describes production deploys as accessing the
main database and **deploy previews as receiving their own database branch
copied from production data when created**. A preview branch may therefore
**contain copies of production personal data**. Counsel and the owner must
assess and document: whether preview branches contain personal data; who
can access preview environments; the lifecycle, retention, and deletion of
preview branches; and whether this constitutes additional processing or a
further transfer requiring a lawful basis and safeguards. See
`DPA_Offisland_Transfer_Basis.DRAFT.md`.

6.4 Off-island hosting transfer basis: see
`DPA_Offisland_Transfer_Basis.DRAFT.md` — `[COUNSEL OPINION REQUIRED]`.

## 7. Retention

| Data | Retention | Note |
|---|---|---|
| Account / membership | `[PERIOD]` after termination | counsel |
| Application records | `[PERIOD]` | counsel |
| Listings (closed/removed) | `[PERIOD]` | counsel |
| Audit log | `[PERIOD — likely long/indefinite for integrity]` | immutable; see §5 |
| Tool inputs | `[PERIOD]` | counsel |

## 8. Your rights

Subject to applicable law and §5, you may request access, rectification,
erasure/restriction, and lodge a complaint. Requests: `[PRIVACY CONTACT]`.
Supervisory authority / complaint route: `[CAYMAN OMBUDSMAN / AUTHORITY —
counsel to confirm]`. Note: there is **no self-serve password reset**;
account-access requests are administrator-mediated and identity-checked.

## 9. Security

Role-based access control, structural data projections, audited actions,
and `[ADDITIONAL CONTROLS]`. Breach handling: `[NOTIFICATION TIMELINE /
PROCESS — counsel to Cayman DPA requirements]`.

## 10. Changes

Updated with `[NOTICE METHOD]`; material changes notified to members.

---
*Counsel review checklist: Cayman DPA applicability and lawful-basis
mapping (§4); audit-log vs. erasure reconciliation (§5 — critical);
processor/sub-processor list, regions and DPA terms still unconfirmed
(§6.2); deploy-preview branches potentially containing production personal
data (§6.3 — critical); transfer basis (doc 4); retention periods (§7);
breach-notification obligations (§9); supervisory-authority route (§8).*
