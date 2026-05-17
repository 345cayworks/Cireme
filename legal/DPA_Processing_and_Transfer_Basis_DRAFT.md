# CIREME — DPA Processing Register & Off-Island Transfer Basis — DRAFT v0.1

> **STATUS: DRAFT FOR CAYMAN COUNSEL REVIEW — NOT YET LEGALLY EFFECTIVE.**
> Addresses the recurring open item in the Membership Agreement (§8, review
> checklist) and Privacy Policy (§8): the **Data Protection Act, 2017 ("DPA")**
> controller/processor mapping and the **cross-border transfer basis** for
> off-island infrastructure. Not legal advice. Bracketed items `[ ]` require
> counsel or business confirmation. This memo must be re-verified whenever the
> infrastructure stack or data model changes.

---

## 1. Controller / processor mapping

| Role | Party |
|---|---|
| **Data controller** | [CIREME operating entity], Cayman Islands |
| Processor — hosting, build, CDN, serverless functions, object/Blob storage | Netlify, Inc. (United States) |
| Processor — managed Postgres database (Neon serverless) | Neon, Inc. / chosen cloud region |
| Sub-component — authentication/session (Auth.js) | Runs within CIREME's own hosted functions; no third-party identity provider in the credentials flow |
| **Independent controllers** | Members, for enquirer/lead data they receive (Privacy Policy §6) |

CIREME is the controller for account, listing, membership, audit, and
compliance data. Infrastructure vendors are processors acting on documented
instructions only.

## 2. Processing register (DPA accountability principle)

| # | Processing activity | Personal data | Lawful basis (Sch. 2) | Location | Retention |
|---|---|---|---|---|---|
| P1 | Account registration & authentication | email, display name, password hash, role, status | Contract | Neon DB (off-island) | Account life + [period] |
| P2 | Membership/application review | applicant email, requested type, review metadata | Contract / legitimate interest | Neon DB | [period] |
| P3 | Listing operation | agent link, property facts, private remarks, media | Contract | Neon DB + Netlify Blobs | Active + archival [period] |
| P4 | Public portal display | public-safe projection only (no private fields) | Legitimate interest | Netlify CDN | While published |
| P5 | Compliance & audit | actor id, before/after snapshots, issues/actions | Legitimate interest / legal | Neon DB (append-only) | [period] |
| P6 | Security & operations logs | IP/session/log metadata | Legitimate interest | Netlify / Neon | [period] |

`[Counsel: confirm lawful-basis column and that legitimate-interest balancing
tests are documented for P4–P6.]`

## 3. Cross-border transfer analysis (DPA Schedule 4)

**Fact:** all personal data is processed **outside the Cayman Islands** (United
States / chosen cloud regions) because Netlify and Neon have no Cayman-resident
infrastructure. Under DPA s.5 principle 8 and Schedule 4, a controller must not
transfer personal data outside the Islands unless a Schedule 4 condition is met.

**Recommended basis (for counsel confirmation):**

1. **Necessity for performance of the contract with the data subject**
   (Schedule 4 condition) — hosting account/listing data off-island is
   necessary to provide the marketplace the Member contracted for. Primary
   basis for P1–P4.
2. **Adduced adequate safeguards via processor contracts** — executed Data
   Processing Agreements with Netlify and Neon incorporating equivalent
   protection, purpose limitation, security, sub-processor control, breach
   notification, and deletion/return on termination. Supports P1–P6.
3. **Transparency/notice** — the Privacy Policy (§8) informs data subjects that
   processing occurs off-island under these safeguards.

Consent is **not** relied on as the primary transfer basis (it is not freely
revocable in a way compatible with continuous hosting). `[Counsel: confirm
whether Schedule 4 "necessary for the contract" is sufficient standalone, or
whether adequacy/standard contractual protections must be expressly adduced;
confirm no additional registration/notification to the Ombudsman is required.]`

## 4. Required actions to satisfy the basis

- [ ] Execute / retain **Netlify Data Processing Addendum** and confirm
      sub-processor list and breach-notification terms.
- [ ] Execute / retain **Neon DPA**; record the **selected database region**
      `[business: choose region; consider EU/US adequacy posture]`.
- [ ] Document legitimate-interest balancing tests for P4–P6.
- [ ] Confirm whether DPA notification/registration with the Office of the
      Ombudsman (Cayman) is required for this processing. `[Counsel]`
- [ ] Define and record retention periods (replace every `[period]`),
      reconciling the append-only audit log (P5) with the erasure right.
- [ ] Maintain this register as a living document; review on any stack or
      schema change and at least annually.

## 5. Data minimization & security posture (already implemented)

- Public/private field classification is **structural**; the public projection
  excludes private fields and an automated test fails CI on any leak
  (`src/lib/public-safe.ts` + leak-guard test).
- Role-based access control enforced at every state-changing call site.
- Credentials stored as bcrypt hashes; no plaintext secrets in the repo;
  runtime secrets supplied via the deployment environment only.
- Immutable audit log records actor and before/after for accountability.

These reduce, but do not by themselves satisfy, the Schedule 4 obligation — the
processor contracts and counsel confirmation in §§3–4 are still required.

---

### Counsel sign-off (Phase 0b gate)

| Item | Confirmed | Counsel | Date |
|---|---|---|---|
| Controller/processor mapping (§1) | ☐ | | |
| Processing register & lawful bases (§2) | ☐ | | |
| Schedule 4 transfer basis (§3) | ☐ | | |
| Required actions complete (§4) | ☐ | | |
