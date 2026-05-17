# CIREME Design Plan — Visual Direction & UX Architecture

> Companion to `CIREME_Development_Plan.md`. The development plan governs
> engineering phases (0–10); this governs the **design track** (Design Phases
> 1–10). They run in parallel: design phases feed the engineering UI work
> (notably Dev Phase 7 public portal and the `/mls` workspaces). Authoritative
> for visual and UX decisions; bound by the locked Phase 0 positioning and the
> `governance/Positioning_Statement.md`.

## Working method

Phased. Each design phase ends with a decision summary and **stops for
approval** before the next begins. No phase's decisions are final until
approved here.

| Design phase | Scope | Status |
|---|---|---|
| 1 | Visual strategy + UX foundation | **Delivered — awaiting approval** |
| 2 | Design system foundation | Pending P1 approval |
| 3 | Public experience design | Pending |
| 4 | Login + role entry | Pending |
| 5 | Admin experience | Pending |
| 6 | Broker experience | Pending |
| 7 | Agent experience | Pending |
| 8 | Tools experience | Pending |
| 9 | MLS-ready UX expansion | Pending |
| 10 | Final build-ready spec | Pending |

## Incorporated original public-face design guidance (preserved)

The earlier public-face guidance is folded in as the seed for Design Phases
2–3 and the visual tone in Phase 1:

1. **Communicate:** trustworthy, unmistakably Cayman, open & simple — the
   opposite of a closed incumbent.
2. **Look & feel:** restrained palette, generous whitespace, photography is
   the product, mobile-first.
3. **Priority pages:** Home, Listings grid, Listing detail, Trust/footer.
4. **Trust signals:** reference numbers, "last updated", Sold/Pending badges,
   honest disclaimers, no dark patterns.
5. **Avoid:** the bare scaffold styling, heavy/slow frameworks, anything
   implying CIREME brokers deals or sets commissions (positioning + legal).
6. **Non-negotiables:** contrast, keyboard nav, alt text, real font sizes,
   speed; must not require loosening the existing CSP/security headers.

This guidance is now superseded in *ambition* (premium black/gold platform,
not just a tidy site) but retained in *principle* (trust, openness, Cayman,
performance, accessibility, security).

---

# DESIGN PHASE 1 — VISUAL STRATEGY + UX FOUNDATION

## 1. PHASE SUMMARY

Phase 1 sets the experience vision, the role-based experience layers, the
hard separation between the public showcase and the professional workspaces,
the navigation model, the product information architecture, the major user
journeys, and the visual tone. No component or token specs yet (Phase 2). All
decisions are grounded in the **already-built** role model, route structure,
and security boundaries so the design is buildable, not aspirational fiction.

## 2. EXPERIENCE GOALS

- **One brand, two worlds.** A serene, editorial **public showcase** and
  disciplined, data-dense **professional workspaces** — visibly the same
  brand, deliberately different modes.
- **Quiet luxury.** Premium is conveyed by restraint, space, typography, and
  photography — not ornament. Black/gold/white signals confidence and trust,
  appropriate to high-value property and money decisions.
- **Trust by structure.** The design reinforces the platform's real security
  model: the public surface can only ever show public-safe data; the
  workspaces are a separate, gated environment. The visual split mirrors the
  code split (`(public)` vs `/mls`) — not cosmetic.
- **Calm under complexity.** Workspaces must stay legible as MLS features
  (lifecycle, compliance, audit) land. Future MLS UI must feel like the same
  product, one tier deeper.
- **Cayman-specific.** Districts, KYD, Block & Parcel, island context are
  first-class, not localized afterthoughts.

## 3. VISUAL DIRECTION (strategy level; full system in Phase 2)

- **Palette intent:** near-black primary surfaces (not pure #000), warm
  restrained **gold** as the single accent (primary actions, key metrics,
  brand moments — never large fills), **off-white** content surfaces, a
  muted neutral ramp for secondary text/dividers, plus reserved
  success/warning/error. Gold is earned, not sprayed.
- **Mode split:**
  - *Public:* light, warm, editorial. Off-white canvas, black type,
    full-bleed property photography, gold for calls-to-action and accents.
  - *Workspace:* dark, premium, operational. Deep charcoal app frame, light
    data surfaces (cards/tables) for readability, gold for primary actions and
    headline metrics only.
- **Typography intent:** a two-typeface system — a refined **display/editorial
  face** for public brand moments (hero, section headers) and a precise,
  highly legible **grotesque/sans** for all UI, dashboards, tables, and forms.
  Rationale: the display face carries luxury presence where it's seen by
  buyers; the sans guarantees stability and density where professionals work.
  Specific families and the type scale are a Phase 2 deliverable.
- **Imagery & motion:** photography-forward public, data-forward workspace.
  Motion is minimal and easeful (fades, slides ≤200ms); no decorative
  animation. Speed is part of the premium feel.

## 4. UX / INFORMATION ARCHITECTURE

**Two shells:**

- **Public shell** — marketing top nav, full-width editorial layouts, light
  surfaces. Routes already exist: `/`, `/listings`, `/listings/[id]`; new:
  `/tools`, `/tools/rppi`, `/tools/mortgage`, `/partners`, `/partners/apply`.
- **Workspace shell** — persistent left navigation rail (role-specific) +
  top context bar (workspace name, role badge, search, account/sign-out);
  dark frame, light data cards. Under `/mls/*` (already gated by middleware +
  `requirePermission`). Existing: `/mls/login`, `/mls/dashboard`,
  `/mls/listings`, `/mls/members`, `/mls/compliance`.

**Information architecture (target):**

```
PUBLIC
├─ Home
├─ Listings (map + grid, filters, promoted)
│   └─ Listing Detail (gallery, data, tool handoff, inquiry)
├─ Tools
│   ├─ RPPI Projection
│   └─ Mortgage Calculator
├─ Partners
│   └─ Partner Application
└─ Login ▾  (Admin / Broker / Agent)

WORKSPACE (role-aware, one shell)
├─ Admin      → Dashboard · Brokers · Agents · Listings · Leads · Applications · (Compliance*)
├─ Broker     → Dashboard · My Agents · Group Listings · Group Leads · Brokerage Profile
└─ Agent      → Dashboard · My Listings · Create/Edit Listing · Media · CSV Import
        (* Compliance / audit / lifecycle = MLS-ready, Design Phase 9)
```

**Design roles mapped to the real RBAC roles already implemented** (so this
is buildable):

| Design role | Real role(s) | Emotional register | Cares about |
|---|---|---|---|
| Public visitor | `public_user` | Aspirational, trusting | Finding property, tools, confidence |
| Agent | `agent` | Practical, action-oriented | Listing fast, media, status |
| Broker | `broker`, `office_manager` | Managerial, team-aware | Team, group performance, brokerage identity |
| Admin | `super_admin`, `mls_admin` | Powerful, oversight | Approvals, control, accuracy, leads |
| Advertiser/Partner | `advertiser` | Onboarding | Application status, presence |
| Future analyst | (future tier) | Insight | Market intelligence (post-MVP) |

**Public ↔ workspace boundary:** entered only via the Login dropdown; no
shared chrome; signing out returns to the public Home. This is a deliberate
psychological + security boundary, matching the code's structural separation
and the public-safe projection.

## 5. PAGE / SCREEN STRUCTURE (Phase-1 level)

- **Public top nav:** Logo · Home · Listings · Tools · Partners · `Login ▾`.
  Login dropdown: **Admin Login / Broker Login / Agent Login**. Sticky;
  transparent over hero, solidifies on scroll. **No "Market Trends"** nav item
  — market intelligence appears contextually on listing/detail and inside
  Tools, never as a top-level destination.
- **Workspace frame:** left rail (role items, collapsible to icons) · top bar
  (workspace + role badge, global search, account menu) · content region with
  breadcrumbs for deep flows. Admin/Broker/Agent share the frame; rail
  contents and dashboard widgets differ by role.
- **Tone per workspace:** Admin = structured oversight (broad tables, approval
  controls). Broker = managerial (team rollups, group views). Agent =
  focused doing (listing-centric, minimal chrome, fast create/edit).

## 6. COMPONENT GUIDANCE (direction only; specs in Phase 2)

Phase 1 names the component families the system will need so Phase 2 can spec
them: top nav + login dropdown; workspace rail + context bar; listing card;
promoted card; stat/metric card; data table with mobile fallback; filter bar;
map + list pairing; multi-step form (create/edit listing); media uploader;
CSV import flow; tool input + result/chart panel; empty/loading/skeleton/
error/toast/confirm states; role badge; disclaimer block. No visual specs
yet — that is explicitly Phase 2.

## 7. RESPONSIVE RULES (foundation)

- **Desktop-first**, gracefully down to tablet and mobile.
- Public: hero and photography stay impactful on mobile; nav collapses to a
  single menu; Login becomes a full-screen sheet, not a cramped dropdown.
- Listings: desktop = map + grid side by side; tablet = toggle map/list;
  mobile = list-first with a map toggle (see map risk below).
- Workspace: rail collapses to icons on tablet, becomes a bottom/drawer nav
  on mobile; tables degrade to stacked cards with primary row action exposed.
- Tools remain fully usable and readable at mobile width (single column,
  result kept prominent).

## 8. OPEN QUESTIONS / RISKS

Grounded in the actual codebase/schema:

1. **Map-first listings vs. no geodata (high).** "Map-first browsing" is a
   core ask, but the `listings` schema has **no latitude/longitude** — only
   `district` enum + Block & Parcel. Options: (a) approximate markers by
   district centroid, (b) add geocoding + geo columns (engineering work), (c)
   defer true map to post-MVP and ship district-clustered browse first.
   Needs a decision; affects Phases 3 & 10 and the data model.
2. **RPPI data source (high).** The RPPI projection tool needs an actual
   Residential Property Price Index dataset/methodology per district. None
   exists in the repo. Is there a licensed/official source, or is this a
   modeled estimate? Drives Phase 8 and the disclaimer language.
3. **One login vs three role logins (medium).** Brief asks for separate
   Admin/Broker/Agent login pages, but the implemented auth is a single
   credentials form + role-aware redirect. Three visual entries over one
   mechanism is fine; confirm we want distinct pages vs one page with a role
   hint (less maintenance, fewer ways to fail).
4. **Promoted listings model (medium).** Placement is a design slot, but the
   monetization/eligibility rule (paid? curated? per district?) is undefined
   and there's no schema field for it. Affects card system and Listings UX.
5. **Workspace light vs dark (medium).** Strategy proposes dark frame + light
   data surfaces. Confirm appetite; full-dark dashboards look premium but can
   hurt long data sessions and accessibility.
6. **Brand assets (medium).** Is there a CIREME logo, wordmark, or licensed
   typefaces? If not, Phase 2 must specify freely-licensable families and a
   typographic wordmark as interim.
7. **Advertiser/Partner depth (low/medium).** `advertiser` role exists but its
   workspace is undefined. Is the partner experience just application +
   profile, or a light dashboard? Scoping affects Phases 4–6.
8. **Leads (medium).** Admin/Broker "Leads" views are required, but there is
   **no leads/inquiry table** in the schema yet. Inquiry CTA + leads
   management imply new data modeling (engineering dependency).

## 9. STOP AND WAIT FOR APPROVAL

Phase 1 is delivered. I will not start Phase 2 (design system foundation)
until these decisions are approved and the high-risk open questions
(especially map/geodata, RPPI source, and leads modeling) are directionally
answered.
