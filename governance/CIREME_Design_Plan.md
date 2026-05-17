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
| 1 | Visual strategy + UX foundation | **Approved** |
| 2 | Design system foundation | **Delivered — awaiting approval** |
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

---

# DESIGN PHASE 2 — DESIGN SYSTEM FOUNDATION

## 1. PHASE SUMMARY
Defines the concrete visual language: color tokens, typography system + scale,
spacing, radii, elevation, and the behavior rules for buttons, forms, cards,
tables, feedback, and the map. Tokens are named so engineering can implement
them as CSS variables. Values are real decisions, not placeholders.

## 2. EXPERIENCE GOALS
- A single token set that expresses **light editorial public** and **dark-frame
  / light-data workspace** without two separate systems.
- Gold is reserved and accessible: accent + fills only, never body text.
- Self-hosted fonts so the existing CSP (`font-src 'self' data:`) is respected
  — no third-party font CDN.

## 3. VISUAL DIRECTION — TOKENS

### Color
Brand & surface:
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0E0F12` | Public primary text; deepest surface |
| `--obsidian-900` | `#16181D` | Workspace app frame base |
| `--obsidian-800` | `#1B1E24` | Workspace raised frame (rail, bars) |
| `--gold` | `#C8A24A` | Accent: primary buttons, key metrics, brand |
| `--gold-hover` | `#B68F3C` | Gold interactive hover/active |
| `--gold-soft` | `#F4ECD8` | Gold tint: badges, highlight backgrounds |
| `--canvas` | `#F7F5F1` | Public warm off-white page background |
| `--surface` | `#FFFFFF` | Content/data cards (public + workspace) |

Neutral ramp: `--n-900 #14161A` · `800 #232730` · `700 #3A3F4A` ·
`600 #5A616E` · `500 #7C8492` · `400 #A2A9B4` · `300 #C9CED6` ·
`200 #E4E7EC` · `100 #F1F2F5` · `050 #F7F5F1`.

Text: light surfaces — primary `--n-900`, secondary `--n-600`, meta `--n-500`,
on-gold `--ink`. Dark frame — primary `#F5F6F8`, secondary `--n-400`.

Semantic (never gold; gold stays brand-only):
| Token | Hex | Soft bg |
|---|---|---|
| success | `#2E7D5B` | `#E3F2EC` |
| warning | `#C2701C` | `#FBEEDD` |
| error | `#B23B3B` | `#F7E4E4` |
| info | `#2F6F9F` | `#E4EEF5` |

**Accessibility rule:** `--gold` on white ≈ 2.1:1 → **fails as text**. Gold is
permitted only as a fill (with `--ink` text, ≥ 8:1) or as a non-text accent
(borders, ≤ icons, large brand display ≥ 24px bold). Body/meta text never gold.

### Typography
Self-hosted, SIL OFL (free, commercial-ok):
- **Display / editorial — “Fraunces” (variable).** Public hero, large section
  headers, listing price hero, wordmark. Optical sizing = editorial luxury.
- **UI / data — “Inter” (variable).** All workspace UI, body copy everywhere,
  tables, forms; uses `tabular-nums` for figures/money.
- **Mono — “IBM Plex Mono.”** Only references, API keys, audit/IDs.

Scale (token · font · px / line-height / weight / tracking):
| Token | Font | px | LH | Wt |
|---|---|---|---|---|
| display-xl | Fraunces | 64 | 1.05 | 600 |
| display-l | Fraunces | 48 | 1.10 | 600 |
| h1 | Fraunces | 36 | 1.15 | 600 |
| h2 | Fraunces | 28 | 1.20 | 600 |
| h3 | Inter | 22 | 1.25 | 600 |
| h4 | Inter | 18 | 1.30 | 600 |
| body-l | Inter | 17 | 1.55 | 400 |
| body-m | Inter | 15 | 1.55 | 400 |
| body-s | Inter | 13.5 | 1.5 | 400 |
| label | Inter | 13 | 1.2 | 600 |
| meta | Inter | 12 | 1.3 | 500 |
| mono | IBM Plex Mono | 13 | 1.4 | 400 |
Public uses Fraunces display→h2; workspace stays Inter h3 and below for density.

### Spacing — 4px base
`0 2 4 8 12 16 20 24 32 40 48 64 80 96 128`. Public content max-width 1280,
gutter 24 (mobile) → 80 (xl); hero full-bleed. Workspace: rail 264px
(collapsed 72), content gutter 24, card padding 24, section gap 32–48,
12-col grid, 24 gutter.

### Radius & elevation
Radii: `sm 6` (inputs, chips) · `md 10` (buttons, cards) · `lg 16` (modals,
feature cards) · `pill 999` (badges/filters). Tables use 0 radius rules.
Elevation (light surfaces only): `e1` 0 1 2 rgba(20,22,26,.06);
`e2` 0 4 12 rgba(20,22,26,.08); `e3` 0 12 28 rgba(20,22,26,.12). Dark frame
uses 1px `rgba(255,255,255,.08)` borders + tint layering, not shadow.

## 4. UX / COMPONENT BEHAVIOR RULES

**Buttons** — variants: primary (gold fill, ink text), secondary (n-900 fill
on light / n-200 on dark contexts), outline (1px n-300, n-900 text), ghost
(transparent, n-700 text), destructive (error fill), quiet/link (gold-hover
underline). Sizes sm 36 / md 44 / lg 52, radius md. States: hover (−8% lum),
active (−14%), focus (2px gold ring, 2px offset, always visible), disabled
(40% opacity, no pointer), loading (inline spinner, label retained, button
width locked).

**Forms** — label above field (label token), input md 44 / sm 36, radius sm,
1px n-300 border, `--surface` bg. Focus = 2px gold ring. Error = error border
+ error-soft fill + message with icon below. Required = `*` in n-500. Helper
text meta token. Validate on blur, re-validate on change after first error,
full check on submit; scroll to first error. Success = field check + toast.
Disabled/readonly visually distinct (n-100 fill). Components: text, textarea
(auto-grow cap), select (custom, keyboard + type-ahead), combobox, date,
file/media dropzone (drag + click, thumbnail list, progress, remove), CSV
import (dropzone → column-map preview table → validation summary → confirm).

**Cards** — *Listing*: 4:3 image, status badge top-left, price (Fraunces h3)
+ district/type/tenure meta, hover `e2` + 2px translate (light only). *Promoted*:
1px gold border + “Promoted” gold-soft pill, `e2` resting. *Stat*: label
(meta) + value (Inter 28 tabular) + delta (success/error) + sparkline slot.
*Dashboard*: header (h4 + optional action) / divider / content, padding 24,
radius md, `e1`. *Detail*: sectioned, hairline dividers, no nested shadows.

**Tables / grid** — desktop: header sticky, row 52, hairline `--n-200`
dividers, numerics right-aligned tabular, row hover `--n-050`, single row
action as right-aligned `⋯` menu, multi-select checkbox col when bulk actions
exist. Controls region above table: search + filters left, column/sort +
pagination right. Sort = caret in header label. Mobile (< md): each row → card
with 3–4 key fields + primary action button; rest behind “Details” expand.

**Feedback** — skeletons mirror final layout (no spinners for page loads);
buttons use inline spinner. Empty state = mark/icon + one-line explanation +
primary action. Error block = title + cause + Retry. Toasts top-right
(desktop) / top (mobile), auto-dismiss 4s, success/error/info only (never
gold), max 3 stacked. Destructive actions (remove listing, suspend/terminate
account) require a modal confirm; account termination requires typed
confirmation. Optimistic UI only where reversible; otherwise pending state.

**Map UX** — default works **without precise coordinates** (Phase 1 risk #1):
district-centroid clustered markers with count bubbles; standard pin = neutral,
promoted = gold pin. Desktop = map left / list right, selecting a card focuses
+ enlarges its marker and vice-versa. Tablet = map/list toggle. Mobile =
list-first, full-screen map toggle, swipeable bottom card carousel synced to
markers. Markers are minimal geometric brand shapes, no default provider pins.
Upgrades cleanly to precise points if geodata is later added.

## 5. PAGE / SCREEN IMPLICATIONS
Tokens + components above are sufficient to build: public nav/login dropdown,
listing grid + promoted slots, listing detail, tool panels, workspace rail +
context bar, all dashboards, management tables, the listing create/edit form,
media + CSV flows, and feedback states — i.e., everything in Design Phases
3–8. MLS Phase 9 reuses table/card/feedback tokens unchanged.

## 6. COMPONENT GUIDANCE
Component inventory is now token-complete. Phase 3+ will apply (not redefine)
these to specific screens. No new primitives expected before Phase 9, which
adds only composite views (audit panel, lifecycle timeline, compliance table)
from existing primitives.

## 7. RESPONSIVE RULES
Breakpoints: `xs <480 · sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
Public content max 1280 (hero full-bleed); workspace fluid beside rail.
Display scale steps down one stop below md (display-xl→h1, h1→h2). Touch
targets ≥ 44px. Rail: icons-only at md, drawer at < md. Tables → cards < md.

## 8. OPEN QUESTIONS / RISKS
Carried from Phase 1, still unanswered (do not block Phase 2; block 3/8):
map/geodata (#1), RPPI source (#2), leads modeling (#8). New in Phase 2:
- **Font hosting (resolved-as-decision):** fonts MUST be self-hosted + subset
  + `preload`; using Google Fonts CDN would violate the deployed CSP. Flagged
  so engineering self-hosts under `/public` and `font-src 'self'` stays.
- **Dark workspace confirm:** dark frame + light data cards chosen; confirm vs
  fully light workspace (accessibility/long sessions). Reversible via tokens.
- **Fraunces on data screens:** intentionally excluded below h2 in workspace
  for density; confirm acceptable.

## 9. STOP AND WAIT FOR APPROVAL
Phase 2 delivered. Phase 3 (public experience design) will not start until
this system is approved and, ideally, Phase 1 risk #1 (map/geodata) has a
direction since it shapes the Listings page.
