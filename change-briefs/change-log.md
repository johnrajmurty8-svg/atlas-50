# Atlas /50 — Change Log

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
