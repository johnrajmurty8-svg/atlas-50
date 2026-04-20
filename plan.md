# Atlas /50 — Build Plan

> **Status:** In progress — Phases 1–5 complete. Phase 6 (Polish) next.
> **Working directory:** `atlas-50/app/` (Next.js 14 App Router scaffold already exists)
> **Reference:** `docs/prd.md`, `docs/app-flow.md`, `docs/design.md`, `docs/backend-spec.md`, `CLAUDE.md`

---

## Pre-Build Checklist

Before Phase 1 begins, these decisions are confirmed in the spec docs:

| Item | Resolution |
|------|------------|
| Continent geometry | Port exactly from prototype — no rebuild |
| Image sourcing | Manual Unsplash URLs — no API |
| Smart Picker vocabulary | Locked (see CLAUDE.md) |
| Analytics | Plausible (placeholder domain until prod confirmed) |
| Auth | None in V1 |
| Database | None in V1 — static JSON only |
| Mobile | Not supported in V1 — desktop only |
| Nav items (Dispatches, Journal, Sign In) | Visible, non-functional, "Coming Soon" tooltip |

---

## ✅ Phase 1 — Project Setup

**Goal:** Clean, correctly configured Next.js project with all dependencies, folder structure, design tokens, and TypeScript types in place. Nothing visual yet — just the skeleton.

### 1.1 Install Dependencies

**Files modified:** `app/package.json`, `app/package-lock.json`

Install:
- `three` — Three.js globe rendering
- `@types/three` — TypeScript types for Three.js

No other runtime dependencies needed. All other packages (React, Next.js, Tailwind) are already installed.

### 1.2 Create Folder Structure

**New directories to create:**

```
app/src/
├── components/          (all React components live here)
├── data/                (destinations.json)
├── lib/                 (types, utilities)
└── styles/              (tokens.css)
```

**Current scaffold has:** `app/src/app/` only. No `components/`, `lib/`, `data/`, or `styles/` directories.

### 1.3 Design Tokens

**New file:** `app/src/styles/tokens.css`

Define all CSS custom properties from `design.md`:
- All `--color-*` tokens (bg, ocean, cream, accent, overlay variants)
- All continent fill colours
- All `--type-*` tokens (font families, sizes, weights)
- All `--space-*` tokens

Import in `app/src/app/globals.css`.

### 1.4 TypeScript Interfaces

**New file:** `app/src/lib/types.ts`

Port the full interface set from `backend-spec.md §7`:
- `Destination` interface (all fields including new Smart Picker fields)
- `ThemeTag`, `VibeTag`, `Season`, `EnvironmentTag`, `GroupSizeTag` union types
- `SmartPickerState` interface
- `GlobeRef` interface (imperative API for `forwardRef`)

### 1.5 Utility Functions

**New file:** `app/src/lib/globeUtils.ts`

Port `latLonToVec3` exactly as written in `backend-spec.md §4.3` and `CLAUDE.md`. No changes to this function.

**New file:** `app/src/lib/filterUtils.ts`

Extract the `useMemo` filter logic from `CLAUDE.md` into a pure function `filterDestinations(destinations, activeTheme, search, picker)` — testable in isolation.

### 1.6 Environment Config

**New file:** `app/.env.local`

```bash
# V1: No environment variables required.
# V1.5 additions listed in docs/backend-spec.md §5
```

**Modified file:** `app/next.config.mjs`

Add image domain allowlist for `images.unsplash.com` (for `next/image` if used in Moodboard thumbnails).

### 1.7 Tailwind Config

**Modified file:** `app/tailwind.config.ts`

- Set content paths to include `./src/**/*.{ts,tsx}`
- Remove default Geist font references
- Add `fontFamily` extensions for `dm-serif-display`, `inter`, `jetbrains-mono`
- Keep border-radius at 0 (no `rounded-*` classes should be needed)

### 1.8 Google Fonts

**Modified file:** `app/src/app/layout.tsx`

Replace default Next.js font imports (Geist) with:
- `DM_Serif_Display` (regular + italic)
- `Inter` (300, 400, 500, 600)
- `JetBrains_Mono` (400, 500)

Set `<html>` background to `#050912`, add CSS variable font assignments.

Add Plausible `<Script>` tag (placeholder domain `atlas-50.vercel.app` until production domain confirmed).

---

## ✅ Phase 2 — Database Schema and Authentication

> **V1 STATUS: DEFERRED.** Atlas /50 V1 uses static JSON only. No database, no auth.
>
> This phase is intentionally empty for V1. All items below are V1.5/V2 scope.

**V1.5 (future):**
- Supabase project setup
- `destinations` table migration from JSON
- `wishlists` table (user_id FK, destination_id)
- Row-level security policies

**V2 (future):**
- Supabase Auth (or NextAuth)
- Session management
- Account-backed wishlist

**Action required now:** None. Static JSON is the data layer. `localStorage` is the persistence layer.

---

## ✅ Phase 3 — Core API Endpoints

> **V1 STATUS: NONE REQUIRED.** All data is static JSON imported at build time.
>
> No `app/api/` routes are created in V1.

**Data flow (V1):**
```
app/src/data/destinations.json
  → imported in components/App.tsx
  → passed as prop to CultureGlobe and left panel list
  → filtered client-side via useMemo (filterUtils.ts)
```

**Action required now:**
- Create `app/src/data/destinations.json` — migrate and augment `data.js` from prototype (see Phase 5.1)

---

## ✅ Phase 4 — Frontend Shell

**Goal:** Render the full layout skeleton with correct positioning, fonts, and colours — but with placeholder content (no globe, no real data). After this phase, the layout zones should be visually correct.

### 4.1 Root Layout

**Modified file:** `app/src/app/layout.tsx`

- Add Google Fonts (Phase 1.8 above)
- Set `<body>` background `#050912`, overflow hidden, font defaults
- Import `globals.css` and `tokens.css`
- Add Plausible script

### 4.2 Index Page

**Modified file:** `app/src/app/page.tsx`

- Replace default Next.js page with `<App />` component render
- Mark as `'use client'` (globe requires browser APIs)
- Import `destinations` from `../data/destinations.json`
- Pass as prop to `<App destinations={destinations} />`

### 4.3 App Shell Component

**New file:** `app/src/components/App.tsx`

Port from `app.jsx` prototype. This is the root state container and layout shell. Build in this order:

1. All state declarations (`search`, `activeTheme`, `picker`, `selected`, `hovered`, `wishlist`, `wishlistOpen`)
2. `localStorage` wishlist init with `try/catch` (exact pattern from CLAUDE.md)
3. `useEffect` wishlist persistence
4. `filtered` useMemo using `filterUtils.ts`
5. `surprise()` function (exact logic from CLAUDE.md)
6. Layout shell: absolute-positioned zones (masthead, left panel, globe area, smart picker area, bottom bar)
7. Wire child component slots (placeholders first, real components in later phases)

**Layout measurements (from CLAUDE.md and design.md):**
- Masthead: `position:absolute, top:0, left:0, right:0, padding:28px 48px, z-index:5`
- Left panel: `position:absolute, top:130px, left:48px, bottom:100px, width:360px, z-index:4`
- Smart Picker: `position:absolute, top:~160px, right:48px, width:~220px, z-index:4`
- Hover card: `position:absolute, right:48px, bottom:130px, width:320px, z-index:5`
- Wishlist drawer: `position:absolute, top:100px, right:48px, width:380px, maxHeight:70vh, z-index:6`
- Bottom bar: `position:absolute, bottom:32px, left:50%, transform:translateX(-50%), z-index:5`
- Moodboard: full-screen, `z-index:10`

### 4.4 Masthead

Built inline in `App.tsx` (not a separate component — it's simple enough).

Content:
- Brand: "Atlas" + `<span style="color:#ffd100">/</span>` + "50" — DM Serif Display 36px
- Issue line: "VOL. XXVI · SPRING · 2026" — JetBrains Mono 10px, tracking 0.35em, `rgba(255,220,170,0.55)`
- Nav items: "DISPATCHES", "JOURNAL", "SIGN IN" — Inter 12px uppercase, `rgba(255,240,220,0.35)` opacity
- Each nav item wraps in a `<span title="Coming Soon">` for tooltip on hover (Resolved Decision #6)

### 4.5 Minimum Width Warning

Built inline in `App.tsx`.

If viewport width < 1024px, render a full-screen fallback message: "Atlas /50 is designed for desktop. Please open on a larger screen." — covers the globe canvas, styled with design tokens.

---

## ✅ Phase 5 — Feature Pages (Component by Component)

**Build order is strict. Port before building new.**

### 5.1 Data Migration

**New file:** `app/src/data/destinations.json`

Migrate all records from prototype `data.js` and add missing fields. Each record must have:

- All existing fields: `id, name, region, lat, lon, tagline, weather, dish, playlist, experiences[5], images[4-6], themes[]`
- New fields required: `country, blurb, vibe_tags[], cost_band, best_season[], environment_tags[], group_size_tags[]`
- Tag values must come from the locked vocabulary in CLAUDE.md only

**Scope:** All ~35 existing prototype records get augmented. Remaining ~15 records to reach 50 are flagged as V1.5 (per PRD resolution — "remaining 15 built in V1.5"). Placeholder stubs with all fields will be created so SmartPicker doesn't break on undefined.

### 5.2 CultureGlobe Component

**New file:** `app/src/components/CultureGlobe.tsx`

Port from prototype `globe.jsx`. This is the most complex component — port exactly, do not rebuild.

Port sequence:
1. Three.js scene setup (camera FOV 42°, position Z 4.0)
2. Ocean sphere (`#070f1f`)
3. Continent mesh geometry (8 shapes with locked fill colours from design.md)
4. Graticule (lat/lon grid lines)
5. Globe halo (ambient glow effect)
6. Vignette overlay
7. Hotspot dots — positioned via `latLonToVec3` from `globeUtils.ts`, yellow `#ffd100`
8. Auto-rotation loop (0.028 rad/frame), pauses on drag, resumes after 3s idle
9. Drag interaction (mouse/touch: update targetRot)
10. Scroll zoom (bounded min/max)
11. Raycasting — hover (scale 1.4×, 150ms) and click detection
12. `flyTo()` implementation — exact code from CLAUDE.md, no changes
13. `resume()` implementation
14. `forwardRef` with `useImperativeHandle` exposing `{ flyTo, resume }`
15. `renderer.dispose()` on unmount
16. Hotspot visibility controlled by `visibleIds` prop (array of destination IDs from filtered set)

**Props interface:**
```typescript
interface CultureGlobeProps {
  destinations: Destination[];
  visibleIds: string[];      // filtered destination IDs — controls hotspot opacity
  onHover: (dest: Destination | null) => void;
  onClick: (dest: Destination) => void;
}
```

**Verify before moving on:** Globe renders, rotates, hotspots glow, drag works, flyTo animates.

### 5.3 HoverCard Component

**New file:** `app/src/components/HoverCard.tsx`

Extract from prototype `app.jsx`. Renders when `hovered` state is non-null.

Content (from design.md §4.5):
- Region label: JetBrains Mono 10px, `#ffd100`
- Destination name: DM Serif Display 32px, white
- Tagline: DM Serif Display italic 14px, `rgba(255,240,220,0.75)`
- Theme tags: JetBrains Mono 9px, `rgba(255,220,170,0.45)`
- Background: `rgba(7,15,31,0.75)` + `backdrop-filter:blur(14px)`
- Border: `1px solid rgba(255,220,170,0.20)`
- `pointer-events: none` (non-interactive — just a display card)
- Position: `right:48px, bottom:130px` — z-index:5 (above Smart Picker)

### 5.4 ThemeChips Component

**New file:** `app/src/components/ThemeChips.tsx`

Extract from prototype `app.jsx`.

Chips: ALL · BEACHES · MOUNTAINS · CULTURE · FOOD · DESERT · WILDLIFE · ADVENTURE

Styling (design.md §4.3):
- Default: transparent bg, `border: 1px solid rgba(255,220,170,0.25)`, `rgba(255,240,220,0.70)` text
- Active: `background: #ffd100`, `color: #070f1f`, `border: #ffd100`
- JetBrains Mono 9px, tracking 0.20em, uppercase, padding 5px 10px, no border-radius
- Transition 150ms ease on background/color

**Props:** `activeTheme: string`, `onChange: (theme: string) => void`

### 5.5 Left Panel List

Built inside `App.tsx` (not a separate component).

Content (design.md §4.3):
- Panel label: JetBrains Mono 10px, `#ffd100`, tracking 0.35em — "THE EDIT"
- Panel headline: DM Serif Display 42px — "Fifty places, this season."
- Intro copy: Inter 13px, `rgba(255,240,220,0.60)`, line-height 1.6
- Search bar: `rgba(255,240,220,0.04)` bg, `1px solid rgba(255,220,170,0.15)` border, no radius
- `<ThemeChips />` slot
- Scrollable destination list grouped by region:
  - Region header: JetBrains Mono 10px, tracking 0.35em, `rgba(255,220,170,0.50)`
  - Each item: index number, name (DM Serif Display 18px), region · theme metadata (JetBrains Mono 9px)
  - Wishlist indicator: `✦` in `#ffd100` when saved
  - Click handler: `handleFly(dest)` → flyTo + open Moodboard after 700ms
  - Empty state: "No destinations match that filter." when `filtered.length === 0`
  - Hover: subtle background `rgba(255,220,170,0.05)` transition 0.15s

### 5.6 BottomBar Component

**New file:** `app/src/components/BottomBar.tsx`

Extract from prototype `app.jsx`. Content (design.md §4.4):
- Three stat items: "DESTINATIONS 50", "ON YOUR LIST [N]", each with JetBrains Mono 9px label + DM Serif Display 22px value
- Vertical dividers between items
- "SURPRISE ME" button: `background: #ffd100`, `color: #070f1f`, JetBrains Mono 11px, padding 14px 22px, no border-radius. SVG wavy-line icon.
- "WISHLIST (N)" button: transparent bg, `border: 1px solid rgba(255,255,255,0.25)`, JetBrains Mono 11px. Small heart SVG.
- Container: `background: rgba(7,15,31,0.55)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,220,170,0.15)`, padding 12px 16px

**Props:** `total: number`, `wishlistCount: number`, `onSurprise: () => void`, `onWishlistToggle: () => void`, `wishlistOpen: boolean`

### 5.7 WishlistDrawer Component

**New file:** `app/src/components/WishlistDrawer.tsx`

Extract from prototype `app.jsx`. Renders when `wishlistOpen === true`. Content (design.md §4.6):
- Position: `top:100px, right:48px, width:380px, maxHeight:70vh`
- Background: `rgba(7,15,31,0.92)` + `backdrop-filter: blur(16px)`
- Border: `1px solid rgba(255,220,170,0.20)`, z-index:6
- Header: "Your List" DM Serif Display 28px + × close button
- Empty state: italic placeholder "Nothing saved yet. Explore the globe and save destinations to your list."
- Each item: 60×48px thumbnail (`background-size: cover`) | name (DM Serif Display 18px) | region · theme (JetBrains Mono 9px) | × remove button
- Item click: `flyTo(dest)` + `setSearch('')` + `setWishlistOpen(false)` + open Moodboard after 700ms
- Remove click: `toggleWish(dest.id)`

**Props:** `destinations: Destination[]`, `wishlist: string[]`, `onRemove: (id: string) => void`, `onSelect: (dest: Destination) => void`, `onClose: () => void`

### 5.8 SmartPicker Component

**New file:** `app/src/components/SmartPicker.tsx`

New build (not in prototype). Positioned right panel, top:~160px, right:48px, width:~220px, z-index:4.

Six styled `<select>` dropdowns:

| Label | Field | Options |
|-------|-------|---------|
| Vibe | `vibe` | Romantic, Adventurous, Cultural, Social, Spiritual, Offbeat, Luxurious, Budget-friendly |
| Cost | `cost` | Budget (1), Low-mid (2), Mid-range (3), High (4), Luxury (5) |
| Weather / Season | `season` | Spring, Summer, Autumn, Winter |
| Environment | `environment` | Mountains, Coast, Desert, Jungle, City, Islands, Plains, Tundra |
| Theme | `theme` | Beaches, Mountains, Culture, Food, Desert, Wildlife, Adventure |
| Group Size | `groupSize` | Solo, Couple, Friends, Family |

Styling:
- Section header: JetBrains Mono 10px, `rgba(255,220,170,0.55)`, "LET US HELP YOU PICK"
- Each select: full-width, `background: rgba(7,15,31,0.60)`, `border: 1px solid rgba(255,220,170,0.15)`, no border-radius, JetBrains Mono 9px, cream text
- Active state (value selected): `border-color: rgba(255,209,0,0.40)`
- "CUSTOM LIST" label appears above results list when any picker value is set — JetBrains Mono 10px, `#ffd100`
- Results list below dropdowns: filtered destinations matching all picker values, same styling as left panel list items (but narrower)

**Props:** `picker: SmartPickerState`, `onChange: (key: keyof SmartPickerState, value: string) => void`, `filtered: Destination[]`

### 5.9 Moodboard Component

**New file:** `app/src/components/Moodboard.tsx`

Port from prototype `moodboard.jsx`. Renders when `selected` state is non-null. Full-screen overlay.

Port sequence:
1. Scroll tracking with `useRef` on container — drives all parallax values
2. Hero section (100vh): full-bleed `images[0]`, gradient overlay, parallax `translateY(scrollY × -0.35)`, `scale` grows with scroll
3. Title fade: `opacity = max(0, 1 - scrollY/400)`
4. Destination name (DM Serif Display ~72px), tagline (italic)
5. Issue mark format: `— ATLAS /50 · No. [ID_PREFIX] ——`
6. Bento grid (12-col): editorial blurb (7 cols, 2 rows), Climate stat (5 cols, accent yellow bg), Signature dish (5 cols)
7. Part I section: "LANDSCAPE & LIGHT" label, diptych — `images[1]` and `images[2]` side by side with individual parallax
8. Part II section: "FIVE TO PLAN AROUND" label, ordered `experiences[]` list (5 items)
9. Final image: `images[3]` or `images[4]` full-width with mild parallax
10. Close button (top-right): × SVG, closes on click and Escape key
11. Heart/wishlist button (top-right, beside close): fills `#ffd100` when saved, SAVE → SAVED label

**Props:** `destination: Destination`, `isWished: boolean`, `onToggleWish: (id: string) => void`, `onClose: () => void`

**Verify before moving on:** All scroll sections render, parallax works, wishlist toggle works, Escape closes.

---

## Phase 6 — Polish

**Goal:** All error states, edge cases, accessibility labels, and performance checks. V1 scope only.

### 6.1 Error States

**File:** `app/src/components/Moodboard.tsx`, inline in App.tsx

- Image load error: `onError` handler sets fallback background `#050912` — no broken image icon
- Empty filter state: "No destinations match that filter." message in left panel list, all hotspots fade
- Surprise Me on 0-result filter: falls back to full pool of 50 (already in logic spec)

### 6.2 Globe WebGL Fallback

**File:** `app/src/components/CultureGlobe.tsx`

Detect WebGL support before instantiating Three.js renderer. If unavailable, render a static dark panel with the message: "Your browser doesn't support WebGL. Atlas /50 requires a modern browser."

### 6.3 Hotspot Filtering Animation

**File:** `app/src/components/CultureGlobe.tsx`

Non-matching hotspots fade to `opacity 0` over 300ms ease when filter changes. Matching hotspots remain at `opacity 1`. Driven by `visibleIds` prop.

### 6.4 Scroll Arrow

Per prototype, a scroll-down arrow appears in the Moodboard hero section to invite scrolling. SVG path from design.md §6. Fades out on scroll.

### 6.5 Minimum Width Guard

**File:** `app/src/components/App.tsx`

Full-screen overlay when `window.innerWidth < 1024`. Listens to `resize` event. Message: "Atlas /50 is designed for desktop. Please open on a larger screen."

### 6.6 Keyboard Navigation

- Moodboard: `Escape` key closes panel
- List items: `Enter` key triggers flyTo + open
- ARIA labels on globe canvas, search input, all buttons

### 6.7 localStorage Guards

All `localStorage` reads/writes already wrapped in `try/catch` per CLAUDE.md. Verify none are missing.

### 6.8 Plausible Analytics

**File:** `app/src/app/layout.tsx`

Add `<Script src="https://plausible.io/js/plausible.js" data-domain="atlas-50.vercel.app" defer />`. Placeholder domain — update before production launch.

---

## Phase 7 — Testing and Deployment

### 7.1 Manual QA Checklist

Run through each flow from `docs/app-flow.md §5`:

| Flow | Test |
|------|------|
| 5.1 Index default state | Globe loads, auto-rotates, all 50 hotspots visible |
| 5.2 Theme filter | Chip activates, hotspots filter, list updates, empty state works |
| 5.3 Moodboard | flyTo fires, panel opens, all sections render, close works |
| 5.4 Search | Filters on keypress, AND logic with chips, empty state |
| 5.5 Smart Picker | All 6 dropdowns filter, AND logic, custom list label appears |
| 5.6 Surprise Me | Random destination selected, search clears, Moodboard opens after 1200ms |
| 5.7 Wishlist | Save/remove from Moodboard and drawer, counter updates, persists on reload |

### 7.2 Go / No-Go Criteria (from PRD)

| Criterion | Check |
|-----------|-------|
| All 35 destinations have complete data + images | ✅ Required |
| Globe renders at 60fps on Chrome/Safari desktop | ✅ Required |
| Smart Picker filters correctly across all 6 dimensions | ✅ Required |
| Wishlist persists across page reload | ✅ Required |
| No broken image states in Moodboard | ✅ Required |
| Vercel deploy completes without errors | ✅ Required |

> Note: "All 50 destinations" criterion — 35 fully tagged records are the V1 launch target. Remaining 15 are V1.5 per PRD resolution.

### 7.3 Vercel Deployment

**Files to verify:** `app/next.config.mjs`

Confirm:
- No `output: 'export'` static export needed (Vercel handles SSG natively)
- Image domain `images.unsplash.com` in `remotePatterns`
- No server-side routes (none needed in V1)

Push `main` branch → Vercel auto-deploys. No manual deploy steps.

### 7.4 Post-Deploy Checks

- Verify Plausible is receiving events (check Plausible dashboard)
- Confirm all Unsplash images load (no CORS issues — direct `<img>` tags, not `next/image` API proxies)
- Test on Chrome + Safari desktop
- Confirm minimum-width warning shows below 1024px

---

## File Index

Complete list of files to be created or modified:

### Modified (scaffold already exists)
| File | Phase | Change |
|------|-------|--------|
| `app/package.json` | 1.1 | Add `three`, `@types/three` |
| `app/src/app/globals.css` | 1.3 | Import `tokens.css`, set base styles |
| `app/src/app/layout.tsx` | 1.8 / 4.1 | Google Fonts, body styles, Plausible script |
| `app/src/app/page.tsx` | 4.2 | Replace default page with `<App />` |
| `app/tailwind.config.ts` | 1.7 | Font families, content paths |
| `app/next.config.mjs` | 7.3 | Unsplash image domain |

### Created (new files)
| File | Phase | Description |
|------|-------|-------------|
| `app/src/styles/tokens.css` | 1.3 | CSS custom properties |
| `app/src/lib/types.ts` | 1.4 | TypeScript interfaces |
| `app/src/lib/globeUtils.ts` | 1.5 | `latLonToVec3` |
| `app/src/lib/filterUtils.ts` | 1.5 | `filterDestinations` pure function |
| `app/.env.local` | 1.6 | Empty placeholder |
| `app/src/data/destinations.json` | 5.1 | All destination records with full fields |
| `app/src/components/App.tsx` | 4.3 | Root shell + state |
| `app/src/components/CultureGlobe.tsx` | 5.2 | Three.js globe (ported) |
| `app/src/components/HoverCard.tsx` | 5.3 | Hotspot hover tooltip |
| `app/src/components/ThemeChips.tsx` | 5.4 | Filter chips |
| `app/src/components/BottomBar.tsx` | 5.6 | Stats bar + buttons |
| `app/src/components/WishlistDrawer.tsx` | 5.7 | Wishlist overlay |
| `app/src/components/SmartPicker.tsx` | 5.8 | 6-dropdown filter |
| `app/src/components/Moodboard.tsx` | 5.9 | Destination detail panel (ported) |

---

## Build Order Summary

```
Phase 1 → Phase 4.1–4.5 (shell with no globe) → verify layout
Phase 5.1 (data) → Phase 5.2 (globe) → verify globe renders
Phase 5.3–5.6 (hover, chips, list, bottom bar) → verify interactions
Phase 5.7–5.8 (wishlist, smart picker) → verify filtering
Phase 5.9 (moodboard) → verify full flow end-to-end
Phase 6 (polish) → Phase 7 (QA + deploy)
```

---

*Plan authored 2026-04-20. Awaiting John's approval before code is written.*
