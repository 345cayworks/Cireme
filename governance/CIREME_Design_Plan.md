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
| 2 | Design system foundation | **Approved** |
| 3 | Public experience design | **Approved** |
| 4 | Login + role entry | **Approved — implemented to spec** |
| 5 | Admin experience | **Delivered — awaiting approval** |
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

---

# DESIGN PHASE 3 — PUBLIC EXPERIENCE DESIGN

## 1. PHASE SUMMARY
Designs the six public pages — Home, Listings, Listing Detail, Tools, Partners,
Partner Application — applying (not redefining) the Phase 2 system. Grounded in
the real public-safe data (`toPublicListing`: id, publicReference, title,
propertyType, status, district, tenure, priceKyd, bedrooms, bathrooms,
areaSqFt, publicDescription, publishedAt) and media via `/api/media/[...key]`.
Working assumption (Phase 1 risk #1 unanswered): **map = district-centroid
clustering, no precise coordinates**.

## 2. EXPERIENCE GOALS
Aspirational, trustworthy, easy to browse. Photography is the product; data is
honest and scannable; tools are discoverable; one calm inquiry path. Nothing
implies CIREME brokers deals or sets commissions (positioning + legal).

## 3. VISUAL DIRECTION
Public light mode: `--canvas` background, `--surface` cards, Fraunces for hero
and section headers, Inter for everything else, gold reserved for primary CTAs
and the Promoted marker/pill. Generous whitespace; full-bleed imagery; e2 hover
lift on cards; motion ≤200ms.

## 4. UX / INFORMATION ARCHITECTURE
Public shell = sticky top nav (Logo · Home · Listings · Tools · Partners ·
`Login ▾`), content, then a trust-forward footer (who CIREME is/ is not, legal
links, reference to data discipline). Footer is constant across all public
pages. Single inquiry model: every inquiry CTA opens the same Inquiry sheet
(listing-aware). No account required to inquire or use tools.

## 5. PAGE / SCREEN STRUCTURE

**Home** — (1) Hero: full-bleed Cayman property image, Fraunces display-l
headline stating the promise (“Cayman property, listed openly”), one-line
subhead, primary CTA “Browse listings”, secondary “Try the tools”. (2) Compact
search bar overlapping hero base (district select, type, price range) → submits
to Listings. (3) Featured/Promoted strip: 3–4 promoted cards. (4) “How CIREME
is different” triptych (open · independent · Cayman-correct) — editorial, no
hype. (5) Tools teaser: two cards (RPPI, Mortgage). (6) Footer. No “Market
Trends” entry anywhere.

**Listings** — Header with result count + sort. Left = filter panel (district,
type, tenure, price, beds/baths) collapsible; Right = **map + grid pairing**:
desktop map-left/grid-right (50/50), two-way hover/selection sync; clustered
district markers with counts (no geodata). Grid = listing cards, Promoted cards
pinned to top of first page with gold treatment + “Promoted” pill. Status
badges (Active/Pending/Sold) on every card; only publicly visible statuses
shown. Empty state = friendly mark + “No listings match — broaden filters”.
Pagination bottom-right. Mobile = list-first, sticky “Map” toggle, filters in a
full-screen sheet.

**Listing Detail** — (1) Gallery: large primary image + thumbnail strip
(`/api/media`), graceful placeholder if none. (2) Header: title (Fraunces h1),
price (Fraunces, prominent, KYD), district · type · tenure · status badge,
reference number + “Updated {publishedAt}” (trust signals). (3) Key facts row:
beds / baths / area (tabular). (4) Description (publicDescription). (5)
**Tool handoff**: “Estimate mortgage” and “See 5-yr projection” buttons that
deep-link to the tools prefilled with this listing’s price/district. (6)
Inquiry CTA (sticky on mobile) → Inquiry sheet. (7) Disclaimer block. Never
shows private fields (enforced by the public-safe projection + leak test).

**Tools** — Index page: two large tool cards (RPPI Projection, Mortgage
Calculator) with one-line value props. Each tool screen = left input panel /
right result panel (mobile: stacked, result kept prominent). Detailed tool UX
is Design Phase 8; Phase 3 only fixes their entry, layout shell, and the
mandatory estimates-only disclaimer placement (always visible with results).

**Partners** — Editorial page explaining the three partner types
(private seller, independent broker, advertiser — mirrors `membershipType`),
the open/no-lock-in stance, and what membership gives. Primary CTA “Apply”.

**Partner Application** — Single calm multi-step form mapping to the real
`applications` table: applicant email, requested type (`membershipType`),
plus metadata fields (name, brokerage/firm, message) stored in
`applications.metadata`. Steps: Type → Details → Review → Submit. Success
screen states “Application received — you’ll be contacted”; status is tracked
in the Admin workspace (Phase 5). No account is created at apply time.

## 6. COMPONENT GUIDANCE
Reuses Phase 2 primitives only: top nav + login dropdown, listing card,
promoted card, filter bar, map+list pair, gallery (composite of image +
thumb), stat-style key-facts row, multi-step form, inquiry sheet (form +
toast), disclaimer block, footer. The **Inquiry sheet** is the one composite
introduced here; it has a real dependency (no leads table — Phase 1 risk #8).

## 7. RESPONSIVE RULES
Home hero stays impactful at mobile (image crops to portrait safe-area, type
steps down per Phase 2). Listings: ≥lg map+grid 50/50; md = grid + map toggle;
<md = list-first + full-screen map + synced bottom card carousel; filters →
full-screen sheet <md. Detail: gallery becomes swipeable, inquiry CTA sticky
bottom bar <md. Forms single-column <md, step indicator compact.

## 8. OPEN QUESTIONS / RISKS
- **#1 map/geodata (carried, now load-bearing):** Listings is designed for
  district-centroid clustering. If precise pins are wanted, geo columns +
  geocoding are an engineering prerequisite. Decision needed before Listings
  is built.
- **#8 leads modeling (now blocking inquiry):** the Inquiry sheet and the
  Partners/Detail CTAs need a leads/inquiries table + handler — none exists.
  Either model leads, or route inquiries to email/`applications` interim.
  Decision needed before inquiry ships.
- **#2 RPPI source (affects Tools handoff):** Detail’s “5-yr projection”
  deep-link assumes a data source; if none, that CTA is hidden until Phase 8
  resolves the source.
- Promoted eligibility/monetization rule still undefined (affects Listings +
  Home featured strip ordering).

## 9. STOP AND WAIT FOR APPROVAL
Phase 3 delivered. Phase 4 (login + role entry) does not require the open data
decisions and can proceed on approval; but **Listings and inquiry cannot be
built** until #1 (map/geodata) and #8 (leads) get a direction.

---

# DESIGN PHASE 4 — LOGIN + ROLE ENTRY DESIGN

## 1. PHASE SUMMARY
Designs how people enter the right workspace: the public Login dropdown, the
login screen(s), post-login redirect logic, signed-in state, and error/edge
handling. Grounded in the real auth that already exists: a single Auth.js v5
credentials provider at `/mls/login`, role-aware JWT session, middleware
gating `/mls/*`, `requirePermission` at call sites, `authorize()` rejecting
non-`active` accounts, sign-out → `/`.

## 2. EXPERIENCE GOALS
Fast, calm, trustworthy entry. The visitor picks "who they are" for clarity,
but security never depends on that choice. One mechanism, branded entries.
Errors are safe (no account enumeration) and human.

## 3. VISUAL DIRECTION
Login is a quiet, premium moment: `--canvas` page, single centered `--surface`
card (max ~420px), Fraunces h2 title, Inter fields, one gold primary button.
A subtle role label/badge personalizes the card per entry. No marketing
clutter; minimal nav (logo returns to public Home).

## 4. UX / INFORMATION ARCHITECTURE — KEY DECISION (Phase 1 risk #3 resolved)
**One auth mechanism, three branded entry points, one login screen.** The
public `Login ▾` dropdown has Admin / Broker / Agent; each routes to
`/mls/login?as=admin|broker|agent`. The `as` hint is **cosmetic only**
(card title, helper copy, post-login emphasis) and is explicitly NOT trusted
for authorization — access and routing are derived from the account's real
role in the session. Rationale: the backend is a single credentials flow +
role redirect; three separate auth pages would add maintenance and failure
modes with zero security gain (role lives on the account, not the page).

**Redirect logic UX:** after success, route by *actual* role —
`super_admin`/`mls_admin` → Admin home, `broker`/`office_manager` → Broker
home, `agent` → Agent home (all under the existing role-aware `/mls/dashboard`
shell; deep sections are Phases 5–7). If a user was sent to login from a
deep `/mls` URL, return them there post-login (preserve intent). If the `as`
hint and real role disagree (e.g., entered via "Agent" but the account is an
admin), honor the real role silently — never block on the hint.

## 5. PAGE / SCREEN STRUCTURE
- **Login dropdown:** trigger `Login ▾` in public nav; menu items Admin /
  Broker / Agent with one-line descriptors. Keyboard + screen-reader
  compliant (roving focus, Esc closes, `aria-expanded`). Mobile = full-screen
  sheet, not a cramped menu.
- **Login screen (`/mls/login`):** centered card — role label/badge, title
  ("Sign in to the Admin/Broker/Agent workspace" from `as`), email, password
  with show/hide, primary "Sign in", a quiet "Trouble signing in?" link,
  legal/footer minimal. Loading state on submit (button spinner, fields
  locked). Generic error on failure: *"Email or password is incorrect, or the
  account isn't active yet."* — deliberately generic to avoid revealing
  whether an email exists or an account is suspended (matches `authorize()`
  returning null for both). Optional, lower-priority enhancement noted in
  risks: a distinct "pending approval" state.
- **Signed-in state:**
  - Public site while logged in as staff: the `Login ▾` is replaced by a
    "Go to workspace →" button + account menu (name, role badge, Sign out).
  - Workspace: top context bar shows workspace name, **role badge**, global
    search, account menu → Sign out (returns to public Home, matching the
    implemented `signOut({ redirectTo: "/" })`).
  - Session expiry mid-task: on next action, route to login with a calm
    "Your session expired — sign in to continue", then back to intended page.
- **Sign out:** one click, immediate, returns to public Home with a brief
  toast.

## 6. COMPONENT GUIDANCE
Reuses Phase 2 primitives: dropdown, form (input, password+toggle, inline
error, button loading), card, badge, toast. One composite: the auth card.
No new primitives. The role badge component is shared with the workspace
context bar (consistency across Phases 5–7).

## 7. RESPONSIVE RULES
Dropdown → full-screen sheet < md. Login card is full-width with comfortable
gutters < sm, centered max ~420px ≥ sm. Inputs ≥44px touch targets, visible
gold focus ring. "Go to workspace" collapses into the mobile menu when
signed in.

## 8. OPEN QUESTIONS / RISKS
- **Password recovery (high, real gap):** there is no email subsystem, so no
  self-serve "forgot password". Interim UX: "Trouble signing in?" explains
  that an administrator (or the deploy-time bootstrap, for super-admin) resets
  access. A real reset flow needs an email provider — engineering dependency;
  flagged, not designed-as-if-existing.
- **Generic vs specific errors (decision):** chosen generic for security
  (no enumeration). If the business wants a friendlier "your application is
  still pending" message, that intentionally leaks account state — needs an
  explicit decision; default stays generic.
- **Rate limiting/lockout (security):** no brute-force protection exists.
  Design reserves space for a "too many attempts, try again later" state;
  implementing it is an engineering dependency (e.g., the available Arcjet
  extension or app-level throttling).
- **MFA (future):** not in scope; the auth card layout leaves room for a
  later second-factor step without redesign.
- Carried, non-blocking here: #1 map/geodata, #2 RPPI, #8 leads.

## 9. STOP AND WAIT FOR APPROVAL
Phase 4 delivered. Phase 5 (Admin experience) can proceed on approval and is
independent of the open data questions, though the Admin "Leads" and
"Applications" areas will surface risk #8 again.

---

# DESIGN PHASE 5 — ADMIN EXPERIENCE DESIGN

## 1. PHASE SUMMARY
Designs the Admin workspace: the shell (rail + context bar), the admin home,
and the three live oversight surfaces that already exist in code —
**Applications/Members**, **Listing moderation**, **Compliance** — plus a
read-only **Audit** view over the existing append-only `auditLog`. Grounded
in the real RBAC and schema: "admin" = `super_admin` (all permissions incl.
`platform:admin`) and `mls_admin` (`member:approve`, `compliance:review`,
`listing:moderate`). `broker`/`office_manager`/`agent` are *not* admin and
get Phases 6–7. Every admin mutation already runs as an audited Drizzle
transaction guarded by `requirePermission` at the call site; this phase
designs UI over those exact actions and state machines — nothing here
assumes an action the codebase does not have.

## 2. EXPERIENCE GOALS
- **Oversight, not data entry.** Admin's job is to *decide* — approve, deny,
  enforce, correct — over queues others generate. The UI optimizes triage:
  what needs me, in what order, with the context to act in one place.
- **Every action is accountable.** Because the backend writes
  actor/entity/before/after to `auditLog` on every mutation, the UI makes
  that visible (who did what, when) rather than hiding it — accountability
  is a feature, not a side effect.
- **Safe by default.** Irreversible/heavy actions (deny, suspend, terminate,
  unpublish, remove) are deliberate, confirmed, and never optimistic.
- **Truthful about gaps.** Where a workflow has a real backend limitation
  (e.g., application approval needs a pre-existing user account), the UI
  states it plainly instead of pretending it works.
- **Calm under volume.** Designed to stay legible whether there are 3 items
  or 300; queues, filters, and pagination over hero dashboards.

## 3. VISUAL DIRECTION
Workspace dark frame from Phase 2: `--obsidian-900` app base,
`--obsidian-800` rail/context bar, **light `--surface` data cards and
tables** for long reading sessions, Inter throughout (Fraunces not used below
h2 in workspace — density). Gold is reserved for the single primary action
per view and headline metrics only; **status uses the semantic ramp, never
gold** (e.g. pending = warning, active = success, suspended/denied = error,
under-review = info). Hairline `rgba(255,255,255,.08)` borders on the dark
frame; `e1/e2` elevation only on light cards. Role badge ("Administrator")
in the context bar is the shared badge component from Phase 4.

## 4. UX / INFORMATION ARCHITECTURE
**Admin rail (left, 264px / 72 collapsed):** Dashboard · Applications ·
Members · Listings · Compliance · Audit. Rail items map to the real routes
and permissions; an item whose permission the signed-in admin lacks is
hidden, not shown-disabled (mirrors `requirePermission` — `mls_admin` sees
all six; a future limited admin would see a subset). **No "Brokers",
"Agents", "Offices", or "Leads" rail items** — there is no office-management
action, no per-role admin page, and no leads table in code (risk #8); agents
and brokers are managed *within* Members, and inquiries continue to route via
email/applications per the existing resolution. Office is shown as read-only
context on member/listing rows, not an editable area (no office mutation
exists).

**Context bar:** workspace name · **Administrator** role badge · global
search (scopes: applications, members, listings, compliance) · account menu
→ Sign out (→ public Home, per implemented `signOut`). Breadcrumbs appear on
any drill-in (e.g. Compliance → Issue #).

**Decision-queue model:** Applications and Compliance are *queues* (things in
a non-terminal state needing an admin decision) with an explicit terminal
state. Members and Listings are *registries* (browse/filter all, act on one).
This split drives the screen designs below.

## 5. PAGE / SCREEN STRUCTURE

**Admin Dashboard (`/mls/dashboard`, role-aware home).** Not a vanity
dashboard — a triage board. Stat cards (Phase 2 stat card, tabular numerics):
*Applications awaiting review* (status `submitted`/`under_review`), *Open
compliance issues*, *Listings pending moderation*, *Suspended/inactive
members*. Each card's value links straight into the filtered queue. Below:
"Needs you" — the oldest few open applications and compliance issues with a
one-click path to act. Recent activity strip = last N `auditLog` entries
(actor · action · entity · time). Empty state = "Nothing needs a decision
right now."

**Applications (queue; `member:approve`).** Table of `applications`:
applicant email · requested type (`private_seller`/`independent_broker`/
`advertiser`) · status · submitted age · reviewer. Default filter = open
(`submitted`, `under_review`); chips for all states incl. terminal
(`approved`/`denied`/`withdrawn`). Row → detail drawer with `metadata`
(name/firm/message) and the **allowed transitions only**, derived from the
real state machine: `submitted → under_review | withdrawn`;
`under_review → approved | denied | withdrawn`. **Approval honesty (real
backend constraint):** `transitionApplication` only provisions a membership
+ activates the account when a user with the matching `applicantEmail`
already exists; otherwise it approves the application but creates no account.
The drawer surfaces this *before* the admin clicks: a clear inline notice
"No user account exists for this email — approving records the decision but
does not grant access until an account is provisioned." Deny/withdraw require
a confirm modal with an optional note (audited). No bulk approve (no bulk
backend action — see risks).

**Members (registry; `member:approve`).** Table of memberships joined to
users: display name · email · membership type · account status
(`pending`/`active`/`suspended`/`inactive`) · office (read-only) · approved
by/at. Filter by status/type; search by name/email. Row → member panel:
identity, current status, **status history** (`membershipStatusHistory`:
from→to, by, note) rendered as a timeline. Action = change account status
via the allowed transitions with a **mandatory audit note**; suspend/inactive
are destructive → confirm modal (pending state, never optimistic). The panel
shows the user's role but role *editing* is out of scope (no role-change
action exists — flagged, not faked).

**Listings (moderation registry; `listing:moderate`).** Admin sees *all*
listings (not just own). Table: public reference · title · district ·
status (9-state `listing_status`) · agent/office · price (KYD, tabular) ·
updated. Filters by status/district; search by reference/title. Row → listing
moderation panel: public-safe fields **and** `privateRemarks` (admin may see
private; never exposed publicly), media thumbnails, status history and price
history timelines. Moderation actions reuse the real listing transitions and
the compliance action types — flagging or requesting a correction creates a
compliance issue/action rather than a silent edit; `unpublished`/`removed`
are destructive confirms. Admin does not edit listing content here (no admin
content-edit action) — moderation is status/enforcement, authoring stays with
the agent (Phase 7).

**Compliance (queue; `compliance:review`).** Open `complianceIssues` list:
type (`missing_required_fields` · `stale_listing` · `duplicate` ·
`misleading_media` · `incorrect_classification` · `sold_left_active`) ·
linked listing · detail · age. Primary action **"Run sweep"**
(`runComplianceSweep`) with a clear running/result state. Row → issue detail:
the offending listing in context + the `complianceActions` history, and the
enforcement ladder exactly as the enum allows — `flagged` →
`correction_requested` → `unpublished` → `removed`, and the account-level
`account_suspended` / `account_terminated`. Each requires a note;
account-level actions and `removed` require a **typed-confirmation** modal
(Phase 2 destructive rule — termination = type to confirm). "Dismiss as false
positive" (`dismissComplianceIssue`) needs a note and resolves the issue.

**Audit (read-only; `platform:admin`, so `super_admin` only).** Reverse-chron
table over `auditLog`: actor · action · entity/entityId · time, expandable to
the before/after JSON diff (mono token). Filters by entity type, actor, date.
No mutations. If the signed-in admin is `mls_admin` (lacks `platform:admin`),
the rail item is hidden — consistent with the permission model; the
"recent activity" strip on the dashboard gives them a lightweight subset.

## 6. COMPONENT GUIDANCE
Reuses Phase 2 primitives only: workspace rail + context bar, stat card,
data table (desktop sticky-header rows → mobile stacked cards), filter/chip
bar, detail **drawer/panel**, status **badge** (semantic, shared with
Phase 4), confirm modal (incl. typed-confirmation variant), toast, empty/
loading skeletons, and a **status/history timeline** (the one composite
introduced here — a vertical from→to list reused by Members, Listings, and
Compliance; built from existing list + badge + meta primitives, no new
token). The before/after **diff view** in Audit is the mono-token panel from
Phase 2, not a new primitive.

## 7. RESPONSIVE RULES
Per Phase 2 workspace rules: rail icons-only at `md`, drawer at `< md`;
context-bar search collapses to an icon trigger `< md`; every admin table
degrades to stacked cards exposing 3–4 key fields + the primary row action,
rest behind "Details". Detail drawers become full-screen sheets `< md`.
Confirm modals stay centered and dismiss-guarded. Touch targets ≥ 44px;
gold focus ring always visible on the dark frame.

## 8. OPEN QUESTIONS / RISKS
- **Application approval ≠ account creation (high, real backend gap).**
  `transitionApplication` provisions access only if a user already exists for
  the applicant email; there is no self-signup and no admin "create user"
  action. The UI is designed to *disclose* this, but the end-to-end "approve
  → person can log in" journey needs a user-provisioning action/flow
  (engineering dependency). Flagged, not designed-as-if-existing.
- **No bulk actions (medium).** All admin server actions are single-entity.
  Queues are designed single-row; multi-select/bulk approve-deny is a
  deliberate non-goal until a bulk transactional+audited backend exists.
- **No role/office management (medium).** No action changes a user's role or
  edits offices; Members shows role/office read-only. If admins must promote/
  reassign or manage offices, that is new backend work — out of Phase 5.
- **`listing:moderate` UI was a stub (medium).** The permission and state
  machine exist but the moderation surface was not built; this phase specifies
  it strictly within existing transitions/compliance actions (no new mutation
  invented).
- **Leads (carried #8).** No leads table; Admin has no Leads area by design —
  inquiries continue via email/applications per the prior resolution.
- **No password reset / rate limiting (carried from Phase 4).** Admin cannot
  trigger a user password reset (no email subsystem); "restore access" =
  status change only. Unchanged engineering dependency.

## 9. STOP AND WAIT FOR APPROVAL
Phase 5 delivered. Phase 6 (Broker experience) can proceed on approval. The
high risk (approval not provisioning accounts) does not block the *design* of
Phases 6–7 but should get a direction before the Admin workspace is built,
since it changes the Applications screen's success path.

---

# OPEN-QUESTION RESOLUTIONS (implementation log)

- **Risk #1 — map/geodata: RESOLVED, then SUPERSEDED (see override below).**
  Original decision: *district markers now, upgrade-ready*. No per-listing
  coordinates; `src/data/cayman-districts.ts` held approximate district
  centroids as the stable contract for a future precise-pin upgrade; a
  tile-based slippy map was deliberately avoided to preserve the deployed CSP.
- **OVERRIDE — precise pins + Google Maps (supersedes Risk #1 resolution and
  Phase 1 non-negotiable #6 "must not loosen the CSP"). Decision approved by
  the product owner.** Per-listing `latitude`/`longitude` columns added
  (`numeric(10,7)`, nullable, migration `drizzle/0001`); classified **public**
  in `listing-classification.ts` and projected by `toPublicListing` (the
  governance gate tests were updated in lockstep). Agents drop a pin in the
  listing create form (drag/click/"use my location"); the public Listings and
  Listing Detail pages render Google Maps markers with a visitor "use my
  location" control. **CSP deliberately loosened** in `next.config.ts`, scoped
  to Google Maps origins only: `script-src`/`connect-src` +
  `https://maps.googleapis.com https://maps.gstatic.com`,
  `worker-src 'self' blob:`, `font-src` + `https://fonts.gstatic.com`. No
  other third-party origin is permitted. `Permissions-Policy` also relaxed
  from `geolocation=()` to `geolocation=(self)` (both `next.config.ts` and
  `netlify.toml`) so the same-origin "use my location" control works; camera,
  microphone and browsing-topics remain fully disabled. Migrations apply
  automatically on deploy — `netlify.toml` already runs `npm run db:migrate`. Requires
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional in `env.ts`; maps degrade to a
  graceful keyless fallback — manual lat/lng entry for agents, a notice for
  visitors — so build/test never require a key). Privacy/security note:
  coordinates are intentionally coarse, surfaced as "approximate", and never
  a substitute for the (still-private) Block & Parcel; the district-centroid
  contract is retained for listings without a pin.
- **Risk #2 — RPPI source: RESOLVED.** Official Cayman Government RPPI ingested
  (`src/data/rppi.ts`); projection tool ships with the approved low–mid–high
  band and mandated estimates-only disclaimer.
- **Risk #8 — leads: RESOLVED.** Inquiries route to email + the existing
  applications flow; no leads table introduced.
- **Added:** Lands & Survey transaction-activity dataset (`src/data/las.ts`)
  and a richer **Market intelligence** view (`/tools/market`) combining the
  RPPI price index (per-region growth) with transaction volume/mix, with all
  provider caveats surfaced. No new top-nav item (respects the
  no-"Market Trends"-nav decision); reached via Tools.
- **Data correction — LAS transaction volumes (2023–2026).** A reviewer
  flagged the volume figures as off. Verified against the authoritative
  `CIREME_data_2026_next` workbook: 2010–2022 were exact, but 2023–2025 had
  been transcribed from an earlier *partial* export (2023 part-year; 2024/25
  one-month stubs) and were materially understated (e.g. 2024 freehold
  transfers 193 → **2,215**); 2026 was missing. Corrected 2023–2025 to full
  12-month aggregates and added 2026 as an explicit **partial** year
  (Jan–Apr, `partial: true`, `monthsCovered: 4`). `LasAnnualPoint` gained
  optional `partial`/`monthsCovered`; `completeVolumeSeries()` now excludes
  partial years by that flag (replacing a fragile <50%-of-prev magnitude
  heuristic); the market view labels the partial year ("YYYY to date (N mo)")
  and excludes it from the trend, mix and YoY. New test asserts no partial
  year leaks into the complete series.
- **Phase 4 — login: APPROVED & IMPLEMENTED.** `/mls/login` rebuilt to spec:
  centered `--surface` card on `--canvas`, display-serif role-aware title and
  eyebrow derived from the cosmetic `as` hint (admin/broker/agent; never
  trusted for authorization — real role still drives redirect), show/hide
  password, submit loading/disabled state, security-safe generic error
  ("Email or password is incorrect, or the account isn't active yet."), an
  honest "Trouble signing in?" disclosure (no self-serve reset — admin
  restores access; pending applications explained), and a back-to-CIREME
  link. The `as` hint is preserved across the error redirect. Nav Login
  dropdown gained per-role one-line descriptors and menu roles. Open risks
  carried unchanged: no email-based password reset, no rate limiting/lockout,
  MFA out of scope (engineering dependencies, not designed-as-if-existing).
  Phase 5 (Admin experience) is now unblocked.
- **Phase 5 — Admin experience: APPROVED.** Design accepted as delivered
  (workspace shell, admin home, Applications/Members, Listing moderation,
  Compliance, read-only Audit over `auditLog`). Phase 6 (Broker experience)
  is now unblocked and may proceed. Open direction still required before the
  Admin workspace is *built in code*: the high risk that member approval does
  not provision an account — this changes the Applications screen success
  path and must be resolved before implementation, not before Phase 6 design.
- **Account provisioning risk — RESOLVED & IMPLEMENTED.** Decision (product
  owner): approval provisions a *pending* account; the member sets their own
  password via a **single-use, 7-day, admin-relayed activation link**
  (chosen over admin-set temp passwords and stub+reset). No email system
  exists yet, so the admin copies the link from the Members screen and
  delivers it out-of-band; email can replace the manual relay later with no
  schema change. Implementation: `activation_tokens` table (migration
  `drizzle/0002`, stores only a SHA-256 of the token — raw value lives only
  in the link); `transitionApplication` now creates a pending `users` row +
  pending membership with an unusable random password when no account exists
  (pre-existing credentialed accounts keep the prior activate-immediately
  path); `issueActivationToken`/`redeemActivationToken` (single-use + expiry
  enforced in-transaction, prior tokens superseded on re-issue); public
  `/mls/activate` set-password page (added to the auth-exempt list alongside
  `/mls/login`); audit entries `account_provisioned`,
  `activation_link_issued`, `account_activated`. **Role mapping** (recorded,
  one-line change point in `membership-service.roleForMembershipType`):
  `private_seller → agent`, `independent_broker → broker`,
  `advertiser → advertiser`, mirroring the existing RBAC matrix. Password
  minimum 10 chars. Carried-open items unchanged (no email reset, no
  rate-limiting). The Applications success path is now real, so the Phase 5
  Admin workspace is unblocked for implementation.
- **Phase 5 — Admin workspace: IMPLEMENTED (v1).** Built against the
  approved design, reusing existing services/state machines only (no new
  mutations invented). Delivered: the **workspace shell** — `mls/layout.tsx`
  + client `WorkspaceFrame` (dark `--obsidian` rail + context bar, new
  tokens only; Phase 2 public tokens untouched), permission-filtered nav
  (an item hidden when its permission is absent), `Administrator` badge,
  sign-out; pre-auth `/mls/login` + `/mls/activate` bypass the shell.
  **Dashboard** — triage board: permission-aware stat cards linking to
  filtered queues, "Needs you" oldest open applications, recent `auditLog`
  strip, "nothing needs a decision" empty state. **Applications/Members** —
  one route, two tabs; status filter chips; application metadata shown;
  **corrected provisioning honesty** (approval now provisions a pending
  account + admin-relayed activation link — no longer a dead end);
  membership status-history timeline; mandatory audit note; destructive
  account transitions gated by `ConfirmSubmit` (typed-confirmation for
  `inactive`). **Compliance** — enforcement ladder as explicit steps with
  per-issue action history; required notes; typed-confirmation for `removed`
  ("REMOVE") and `account_terminated` ("TERMINATE"); required dismiss
  reason. **Listings moderation** — read-only registry (all listings,
  status chips, agent/price/updated, private-remarks + status/price-history
  detail); guard relaxed so `listing:moderate` admins reach it (closes the
  prior "moderate UI was a stub" risk) while agents keep authoring. Shared
  `ConfirmSubmit` primitive added. Typecheck/lint/build green; 37 tests
  pass. **Deliberately v1 / deferred (consistent with the design's stated
  non-goals & risks):** detail drawers (used inline `<details>` instead),
  global context-bar search, bulk actions (no bulk backend), full
  responsive stacked-card table transform (tables scroll on the dark frame;
  rail collapses at ≤860px), and manual issue-raising from Listings
  (enforcement runs from Compliance — no manual-issue backend action
  exists). These remain engineering dependencies, not faked UI.
- **Phase 3 Partner Application intake — IMPLEMENTED (closes the step 1→2
  gap).** The application-intake form designed in Phase 3 (route
  `/partners/apply`) is now built, so the approval→provision→activation
  chain has a real public starting point (previously the only path into
  `applications` was a DB seed; `/partners` was a `mailto`). Calm
  multi-step form (Type → Details → Review) → `submitApplicationAction`
  (zod-validated) → new `createApplication` service inserting a
  `submitted` row with `{displayName, firm, message}` in
  `applications.metadata` and an audit entry (`application_submitted`,
  `actorId: null` — public, no auth). No account created at apply time
  (per spec). Success screen states the application is recorded and an
  admin will follow up. Partners CTA switched from `mailto:` to the form.
  Carried risks unchanged: no rate-limiting / spam protection, no
  applicant-side status tracking (admin-side only, Phase 5). Typecheck /
  lint / build green; 38 tests pass.
