# CIREME QA Matrix — v1 (U7)

> Pre-launch verification checklist over the as-built system. "Auto" = a
> committed automated test guards it; "Manual" = staging walkthrough.
> Run the full column before sign-off.

| Area | Check | Type | Status |
|---|---|---|---|
| Public-safe projection | No private/internal field in `toPublicListing`; sentinel never serializes; exact key set | Auto (`public-safe.test.ts`, `listing-classification.test.ts`) | ✅ |
| Member-only data | Member projection allow-list; non-member path leaks no private field; gate admits exactly MLS roles | Auto (`member-safe.test.ts`) | ✅ |
| RBAC matrix | Every role×permission pair correct | Auto (`rbac.test.ts`) | ✅ |
| Listing lifecycle | Every status transition; completeness blocks publish | Auto (`listing-lifecycle.test.ts`) | ✅ |
| Compliance rules | Stale / missing / sold-left-active detection | Auto (`compliance-rules.test.ts`) | ✅ |
| Activation tokens | Single-use, expiry, supersede | Auto (`activation-token.test.ts`) | ✅ |
| Market data integrity | LAS verified vs source; partial year excluded from trend/YoY | Auto (`market-intel.test.ts`) | ✅ |
| Membership golden path | Apply → approve → provision → activation link → set password → login | Manual (Runbook §1) | ☐ |
| Agent authoring | Create draft → edit to completeness → publish; price/status/media | Manual | ☐ |
| Broker workspace | My agents / group listings / brokerage populate after assignment | Manual | ☐ |
| Cooperation directory | Members see attribution + member-only depth; public site does not | Manual + Auto | ☐ |
| Public search (U4) | Filters return correct seeded results; clear/reset; shareable URL | Manual (seed via `npm run db:seed`) | ☐ |
| Reports (U4) | Staleness/accuracy counts match a seeded fixture | Manual | ☐ |
| AuthZ negative | public_user/advertiser blocked from `/mls/*`; per-permission 403s | Manual | ☐ |
| Security headers | CSP/Permissions-Policy present; geolocation=self; HTTPS canonical | Manual | ☐ |
| Build/CI | `typecheck`, `lint`, `test`, `build` all green | Auto (CI) | ✅ |

**Known non-blocking follow-ups:** broker- and authoring-path automated
tests (repo's current no-DB-test pattern); CSV import deferred. Track in the
build ledger, not launch-blocking.
