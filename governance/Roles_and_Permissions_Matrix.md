# CIREME Roles & Permissions Matrix — v1

> Phase 1 governance deliverable. This matrix is the authoritative specification
> and **mirrors the enforced implementation** in `src/lib/rbac.ts`. The two must
> stay in lockstep; a change here requires the corresponding code change (and
> the Phase 2 negative authorization tests) in the same pull request.

## Roles

| Role | Description | MLS-core access |
|---|---|---|
| `super_admin` | Platform operator; full authority | Yes |
| `mls_admin` | Moderation & membership administration | Yes |
| `broker` | Independent broker; manages own + office listings | Yes |
| `office_manager` | Manages an office's listings | Yes |
| `agent` | Independent agent; manages own listings | Yes |
| `advertiser` | Non-property advertiser/partner | No |
| `public_user` | Unauthenticated/registered public | No |

"MLS-core access" mirrors `isMlsRole()` (everyone except `advertiser` and
`public_user`).

## Permission matrix

| Permission | super_admin | mls_admin | broker | office_manager | agent | advertiser | public_user |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `listing:create` | ✅ | — | ✅ | — | ✅ | — | — |
| `listing:edit:own` | ✅ | — | ✅ | — | ✅ | — | — |
| `listing:edit:office` | ✅ | — | ✅ | ✅ | — | — | — |
| `listing:moderate` | ✅ | ✅ | — | — | — | — | — |
| `compliance:review` | ✅ | ✅ | — | — | — | — | — |
| `member:approve` | ✅ | ✅ | — | — | — | — | — |
| `platform:admin` | ✅ | — | — | — | — | — | — |

## Enforcement model

- Authentication boundary: middleware admits only MLS-core roles to `/mls/*`.
- Authority boundary: every state-changing server action calls
  `requirePermission(<permission>)` (`src/lib/auth-guard.ts`) — middleware
  proves *who*, this proves *may they*.
- Ownership: agents are additionally scoped to their own listings unless they
  hold `listing:edit:office`.

## Sign-off (Phase 1 gate: "roles/permissions matrix signed")

| Reviewer | Role | Approved | Date |
|---|---|:--:|---|
| [Product/Governance lead] | Owner | ☐ | |
| [Engineering lead] | Implementer | ☐ | |

Gate item remains **OPEN** until both rows are signed. The artifact itself is
complete and matches the enforced code.
