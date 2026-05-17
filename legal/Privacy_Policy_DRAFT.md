# CIREME Privacy Policy — DRAFT v0.1

> **STATUS: DRAFT FOR CAYMAN COUNSEL REVIEW — NOT YET LEGALLY EFFECTIVE.**
> Companion to the Membership Agreement (§8, §15) and Acceptable Use Policy.
> Governed by the Cayman Islands **Data Protection Act, 2017 ("DPA")**. Not
> legal advice. Bracketed items `[ ]` are open questions for counsel or the
> business. The data inventory in §3 is derived from the actual system schema
> and must be re-verified against the schema before each release.

---

## 1. Who we are

The data controller is **[CIREME operating entity legal name]**, Cayman
Islands. Data-protection contact: **[DPO / privacy contact email]**.

## 2. Scope

This Policy explains how CIREME collects, uses, discloses, retains, and
safeguards personal data when you use the marketplace as a Private Seller,
Independent Broker/Agent, Advertiser, or public visitor.

## 3. Personal data we process

Derived from the platform schema (`src/db/schema.ts`):

| Category | Data | Source | Purpose |
|---|---|---|---|
| Account | email, display name, password hash, role, account status, office link | You, at registration | Authenticate, operate account, enforce roles |
| Membership/application | applicant email, requested type, review metadata | You / reviewer | Assess and manage membership |
| Listing | agent identity link, private remarks, property facts, media | Member | Operate the MLS and public portal |
| Audit & compliance | actor id, before/after change snapshots, compliance issues/actions | System | Integrity, accountability, DPA accountability principle |
| Technical | session token, IP/log metadata, infrastructure logs | Automatic | Security, fraud prevention, service operation |

Enquirer/lead data submitted to a Member is processed by that Member as an
independent controller (see §6).

## 4. Lawful bases (DPA Schedule 2)

- **Performance of a contract** — operating your account and listings.
- **Legitimate interests** — platform security, fraud prevention, audit
  integrity, and the no-compensation-lock-in enforcement model, balanced
  against your rights. `[Counsel: confirm legitimate-interest framing under
  DPA; document the balancing test.]`
- **Consent** — optional analytics/marketing cookies, where used.
- **Legal obligation** — responding to lawful requests.

We do not process special-category data as a core function. `[Counsel: confirm
whether any listing/media content could constitute sensitive data and how to
handle.]`

## 5. How we use data

Authentication and account management; operating listings and the public-safe
portal projection; compliance and accuracy enforcement (access-only);
maintaining the immutable audit log; security and incident response; service
communications; and, with consent, product updates. We do **not** sell personal
data. We do not provide a structured cooperation-compensation field and do not
process compensation arrangements.

## 6. Members as independent controllers

When you contact a Member about a listing, that Member receives your enquiry
data and acts as an **independent data controller**. CIREME is not responsible
for a Member's downstream processing. Members must maintain their own lawful
basis and privacy practices (Membership Agreement §8; AUP §5).

## 7. Disclosure and processors

We share data with infrastructure processors strictly to operate the service,
under written data-processing terms (see the **DPA Processing & Transfer Basis**
memo): hosting/CDN/build, managed database, and media/object storage providers.
We may disclose where required by law or to protect rights, safety, or platform
integrity. The public portal exposes only the public-safe projection; private
fields are structurally excluded and guarded by an automated leak test.

## 8. International transfer

CIREME's infrastructure providers operate **outside the Cayman Islands**.
Transfers rely on the basis set out in the **DPA Processing & Transfer Basis**
memo (DPA Schedule 4). By using the platform you are informed that data is
processed off-island under those safeguards. `[Counsel: confirm transfer basis
and any required notice/consent wording.]`

## 9. Retention

| Data | Retention |
|---|---|
| Account data | Life of account + **[period]** after closure |
| Listings & media | Active life + archival **[retention period]** (Membership Agreement §7) |
| Audit log | **[period]** — append-only; retained for accountability/integrity |
| Technical logs | **[period]** |

`[Counsel/business: confirm periods; reconcile audit-log retention with the
erasure right in §10.]`

## 10. Your rights (DPA)

Subject to the DPA, you may request access, correction, cessation of processing
likely to cause damage/distress, and information about processing. Erasure may
be limited where data must be retained for legal, security, or audit-integrity
reasons (e.g., the immutable audit log) — `[Counsel: confirm lawful limitation
and how to record erasure requests against append-only records]`. Submit
requests to **[privacy contact]**; we respond within the DPA-required time.

## 11. Security

Role-based access control; structural public/private separation with an
automated guard test; hashed credentials; transport encryption; least-privilege
processor access; immutable audit logging. No system is perfectly secure;
suspected incidents are handled per our incident process and DPA breach-
notification obligations. `[Counsel: confirm DPA breach-notification thresholds
and timelines.]`

## 12. Cookies

Strictly-necessary session cookies for authentication; optional analytics only
with consent. `[Business: finalize cookie inventory and consent mechanism.]`

## 13. Changes

We may update this Policy with **[notice period]** notice posted to the account.
Material changes affecting your rights will be highlighted.

---

### Counsel review checklist

- [ ] Controller identity, DPO/contact, and registration status under DPA
- [ ] Lawful-basis mapping (§4) incl. legitimate-interest balancing test
- [ ] Whether any listing/media content is special-category data
- [ ] Members-as-independent-controllers framing (§6) and member obligations
- [ ] International transfer basis (§8) — cross-reference DPA memo
- [ ] Retention periods (§9) vs. erasure right vs. immutable audit log (§10)
- [ ] DPA breach-notification thresholds and timelines (§11)
- [ ] Cookie consent mechanism and analytics lawful basis (§12)
