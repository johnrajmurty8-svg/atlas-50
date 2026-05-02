# Atlas /50 — Change Log

---

## V7 — 2 May 2026

**Change:** Globe Coordinate & FlyTo Math Corrections
**Brief:** `change-brief-v7.md`

### What Changed

- Corrected the canvas copy in `buildTexture()` to apply the horizontal mirror around x=512 that the in-code comment describes; the previous translation-only implementation (introduced V5, untouched by V6) caused all continents to be painted at the negated longitude, with dots landing in the antipodal ocean
- Corrected `flyTo()` Y-axis target rotation in `CultureGlobe.tsx` from `-theta + π/2` to `theta - π/2`; the negated formula had been in place since V1 and caused every destination to rotate to its antipodal longitude (the formulas coincide only at lon=±90, which is why earlier testing missed it)
- V6's shortest-path delta normalisation and the V6 dot-click → flyTo wiring in `App.tsx` are retained as-is; both were correct contributions operating on a broken target value

### What Didn't Change

- `latLonToVec3` formula — locked, not modified
- d3 projection parameters (`.scale(2048 / (2π)).translate([1024, 512])`) — correct as-is
- `tmp` canvas drawing pipeline — base fill, hatching, biome bands, coastline all untouched
- `flyTo` X-axis math (`Math.PI / 2 - phi`) — correct, untouched
- `flyTo` shortest-path delta normalisation — V6 contribution preserved
- `onHotspotClick` handler and Moodboard delay — V6 contribution preserved
- `resume()` API
- `destinations.json` — coordinates were never the problem
- Globe geometry, sphere radius, camera FOV, camera position
- Auto-rotate, halo shader, stars, dot colour, dot pulse
- Graticule lines
- All design tokens, fonts
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips`
- Yellow viewport frame

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | No |
| Backend Spec | No |
| Security Checklist | No |

---

## V6 — 2 May 2026

**Change:** Globe Coordinate & FlyTo Fixes
**Brief:** `change-brief-v6.md`

### What Changed

- Verified and corrected `d3.geoEquirectangular` projection parameters in `buildTexture()` so continent land drawn on the equirectangular texture aligns pixel-perfectly with `latLonToVec3` dot positions
- Audited all destination `lat`/`lon` values in `destinations.json`; corrected any coordinates that placed dots over ocean or coastline
- Fixed `flyTo()` rotation math in `CultureGlobe`: normalises accumulated `group.rotation.y` and computes shortest angular delta before setting `targetRot`, preventing backward multi-rotation spin
- Fixed dot click handler in `App`: `onHotspotClick` now calls `flyTo()` and delays Moodboard open by 1200ms, matching list-click behaviour

### What Didn't Change

- `latLonToVec3` formula — locked, not modified
- `flyTo()` and `resume()` API signatures — unchanged
- Globe geometry, sphere radius, camera FOV, camera position Z
- Auto-rotate speed, star density, atmospheric halo shader
- Hotspot dot colour, radius, halo pulse animation
- Graticule line colours and opacity
- All design tokens and font families
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips`
- Yellow viewport frame
- `destinations.json` field schema

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | Yes — §2 dot click now triggers flyTo before Moodboard opens |
| UI Guide | No |
| Backend Spec | No |
| Security Checklist | No |

---

## V5 — 1 May 2026

**Change:** Globe Continent Upgrade (GeoJSON + Biome Texture)
**Brief:** `change-brief-v5.md`

### What Changed

- Replaced hardcoded simplified polygon `CONTINENTS` array with real GeoJSON continent shapes sourced from `world-atlas` (`countries-110m.json`)
- Replaced per-continent `FILLS` colour array with a single base fill (`#c9b99a`) applied to merged land shape
- Installed `d3-geo` and `topojson-client` packages
- Added `public/data/countries-110m.json` static data file
- Rewrote continent-drawing section of `buildTexture()` to use `d3.geoEquirectangular` projection + `d3.geoPath` on the 2048×1024 canvas
- Added biome-based colour overlay: five lat-band zones (Arctic, N desert, equatorial, S desert, Antarctic) applied via canvas clipping on top of base land fill

### What Didn't Change

- `latLonToVec3` formula — locked, not modified
- `flyTo()` and `resume()` imperative API — locked, not modified
- Globe radius, camera FOV, camera position Z
- Auto-rotate speed
- Hotspot dot colour, radius, hover scale
- Graticule line colours and opacity
- Atmospheric halo shader
- All design tokens
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips`
- `destinations.json`
- Yellow viewport frame
- `SphereGeometry` resolution and `MeshBasicMaterial` approach

### Deferred to V6

- No items deferred from V5

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.1 Globe continent shape decision updated |
| Backend Spec | No |
| Security Checklist | No |

---

## V4 — 1 May 2026

**Change:** Globe Polish & UX Fixes (9 changes shipped)
**Brief:** `change-brief-v4.md`

### What Changed

- **Yellow viewport border** — gold frame (`#ffd100`, `position: fixed`, `inset: 14px`) now frames the entire viewport with a dark gap between frame and content
- **Globe camera zoom** — camera pulled back ~20–30% so the full globe fits comfortably at 100% browser zoom
- **Spin speed slider** — UI slider added to control globe auto-rotation speed in real time (replaces planned static 20% increase)
- **Stars** — made brighter, more numerous, and slightly faster-moving; hue unchanged
- **Hover cards** — shrunk ~35%, now follow the cursor dynamically, gold border and drop shadow added; decoupled from destination list (list hover turns name gold instead of triggering a card)
- **SmartPicker dropdowns** — replaced native `<select>` elements with custom-styled dropdowns: navy background, gold highlight on hover; filter logic unchanged
- **Moodboard tile hover** — each bento tile lifts slightly and shows a gold border glow on hover (pure CSS transition)
- **Bug fix: FlyTo animation** — clicking a destination in the list now visibly rotates the globe to that location before the Moodboard panel opens (was silently skipping rotation)
- **Bug fix: Wishlist removal race** — removing a wishlist item and closing the drawer quickly no longer re-adds the item; removal is now instant and synchronous

### What Didn't Change

- `latLonToVec3` formula — locked, not modified
- Globe geometry, continent meshes, globe radius
- `flyTo()` and `resume()` imperative API signature
- Moodboard props interface — unchanged
- All design tokens and font families
- `destinations.json` field schema
- Authentication, Supabase, database

### Deferred to V5

- Destination coordinate audit — several hotspot dots still appear over ocean rather than land; full lat/lon review carried forward

### Affected Documents

| Document | Changed |
|---|---|
| PRD | Yes — FR-003 hover card behaviour updated |
| App Flow | Yes — §2 list hover behaviour and hover card cursor-follow noted |
| UI Guide | Yes — §4.2, §4.5, §4.6, §4.7 all updated |
| Backend Spec | No |
| Security Checklist | No |

---

## V3 — 30 April 2026

**Change:** Moodboard Complete Rebuild (Bento Dashboard)
**Brief:** `change-brief-v3.md`

### What Changed

- Replaced entire `Moodboard` component with a fixed-viewport bento dashboard (6 tiles, 12-col × 6-row grid, no scroll)
- Added `RegionGlobe` SVG sub-component (pure SVG, no Three.js) for the globe tile
- Removed all scrolling, parallax, and multi-section layout logic
- Added `mounted` state-driven stagger entry animations (pure CSS transitions, no framer-motion)
- Removed `framer-motion` and `lucide-react` imports added in V2
- New topbar: brand, issue number, region label, SAVE/SAVED button, close button
- New bottom colophon row
- Radial gradient background replaces flat `#070f1f`

### What Didn't Change

- Props interface: `{ country, onClose, onToggleWishlist, inWishlist }` — identical
- All data bindings
- Escape key listener
- `localStorage` wishlist logic (lives in App)
- Yellow frame
- Design tokens
- `CultureGlobe`, `App`, `SmartPicker`, `WishlistDrawer`
- `destinations.json`

### Deferred to V4

- No items deferred from V3

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.7 Moodboard full rewrite |
| Backend Spec | No |
| Security Checklist | No |

---

## V2 — 30 April 2026

**Change:** Animated Bento Grid in Moodboard
**Brief:** `change-brief-v2.md`

### What Changed

- Replaced static bento grid in `Moodboard` component with animated `bento-grid-01` from 21st.dev
- Added `framer-motion` entry animations (opacity + translateY, staggered per cell) to bento cells
- Added `lucide-react` icon accents to climate and dish cells
- Installed dependencies: `framer-motion`, `lucide-react`, shadcn bento-grid-01 component

### What Didn't Change

- All other moodboard sections (hero, diptych, experiences, soundtrack, triptych, footer)
- All data bindings (`country.*` props)
- All design tokens (colours, fonts, border radius)
- Yellow outer frame
- Scroll parallax behaviour
- All other components (CultureGlobe, App, SmartPicker, WishlistDrawer)
- `destinations.json` data

### Deferred to V3

- No items deferred from V2

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.7 updated for framer-motion animations and icon accents |
| Backend Spec | No |
| Security Checklist | No |
