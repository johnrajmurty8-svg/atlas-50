# Atlas /50 — Change Log

---

## V11 — 5 May 2026
**Change:** Moodboard Bin 2 & Bin 3 Redesign (Curated Lists + Fun Facts Widgets)
**Brief:** `change-brief-v11.md`

### What Changed
- Bin 2: replaced static Themes chips + Seasonal Swing chart with a 3-card curated list widget — Culture Top 5, Nature Top 5, Food Top 5 — manual chevron navigation, 3 pip indicators
- Bin 3: replaced static weather temperature/description with a 10-item Fun Facts & Quotes carousel — 5s auto-transition, manual chevron override, 10 pip indicators, fade transition
- destinations.json: 2 new fields added — `curated_lists` (3 categories × 5 entries each) and `fun_facts` (array of 10 strings); both populated for Italy; other destinations use placeholders
- lib/types.ts: added `CuratedEntry`, `CuratedLists` interfaces; added optional `curated_lists` and `fun_facts` to `Destination`

### What Didn't Change
- Moodboard Bins 1, 4, 5, 6 — untouched
- Moodboard props interface — identical
- Topbar, colophon, SAVE/close buttons
- Bento grid layout and tile dimensions — no reflow
- All design tokens and fonts
- CultureGlobe, App, SmartPicker, WishlistDrawer, BottomBar, ThemeChips
- latLonToVec3 formula — locked
- flyTo(), resume() API — locked
- Yellow viewport frame
- Wishlist localStorage logic
- Escape key listener
- Existing destinations.json field names and types

### Affected Documents

| Document | Changed |
|---|---|
| PRD | Yes — FR-005 Bin 2 and Bin 3 acceptance criteria |
| App Flow | No |
| UI Guide | Yes — §4.7 Bin 2 and Bin 3 specs |
| Backend Spec | Yes — §2.1 schema: curated_lists, fun_facts fields |
| Security Checklist | No |

---

## V10 — 3 May 2026

**Change:** Bin 4 Widget UI Polish (7 Fixes)
**Brief:** `change-brief-v10.md`

### What Changed
- Nav arrows and pip dots moved from bottom-centre to top-right of the card tile (absolutely positioned, overlays all 5 cards)
- Card title `padding-right: 70px` added across all 5 cards to prevent title/nav overlap
- Globe, Season Wheel, and Vibe Radar graphics increased ~18% in size and centred in card body
- Bottom-left card name label (GLOBE — LOCATION, SEASON WHEEL, etc.) removed; bottom-right counter retained
- Text legibility improved across all cards — all label opacities raised, minimum 0.65, primary labels 0.85–0.90
- Crowd Calendar graph narrowed from 280px to 216px (bar width reduced from 19 to 14)
- Cost Breakdown card centred; legend text increased to 9px and set to near-white (0.90 opacity)
- Vibe Radar viewBox widened to 240×212, radar radius increased to R=60, all 5 axis label positions updated; ADVENTURE no longer clips

### What Didn't Change
- All chart data logic and data bindings — no calculation changes
- Card 1 local time strip and LHR flight time
- Card 2 PEAK / OFF SEASON legend
- Card 5 budget traveller strip
- Card counter (01 / 05) bottom-right — retained
- Card crossfade transition (0.4s)
- All other Moodboard bins (Bin 1 carousel, Bins 2, 3, 5, 6)
- destinations.json — no data changes
- All design tokens and fonts
- CultureGlobe, App, SmartPicker, WishlistDrawer, BottomBar, ThemeChips
- Yellow viewport frame, flyTo(), resume()

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.7 nav position, text opacity, chart dimensions |
| Backend Spec | No |
| Security Checklist | No |

---

## V9 — 3 May 2026

**Change:** Moodboard Bin 1 & Bin 4 Upgrade (Hero Carousel + Location Card Widget)
**Brief:** `change-brief-v9.md`

### What Changed
- Bin 1 (Hero Image): replaced single static image with a 5-image ambient crossfade carousel — 6.5s auto-rotation, 1.2s crossfade, pause on hover, back/forward arrows bottom-right
- Bin 4 (Location Card): replaced static RegionGlobe SVG with a 5-card paginated info widget — Globe, Season Wheel, Vibe Radar, Crowd Calendar, Cost Breakdown
- Globe card: atmosphere ring, amber country silhouette, tropic/equator lines, live local time, flight time from LHR
- Season Wheel card: amber peak months, pale blue off-season, average monthly temperatures outside ring
- Vibe Radar card: 5-axis pentagon chart from vibe_scores data
- Crowd Calendar card: 12-month bar chart from crowd_index data
- Cost Breakdown card: donut chart with 5-category spend split and daily total
- destinations.json: 12 new fields added — monthly_temps, peak_months, crowd_index, vibe_scores, cost_breakdown, cost_breakdown_amounts, cost_daily_total, cost_budget_daily, timezone, flight_time_lhr, globe_path; images standardised to exactly 5
- TODO comment added to Bin 1 root element for future V10 click-to-collage feature

### What Didn't Change
- Moodboard Bins 2, 3, 5, 6 — untouched
- Moodboard props interface — identical
- Topbar, colophon, SAVE/close buttons
- All design tokens and fonts
- CultureGlobe, globe math, flyTo, resume API
- SmartPicker, WishlistDrawer, BottomBar, ThemeChips, App
- Yellow viewport frame · Wishlist localStorage logic
- Existing destinations.json field names and types

### Affected Documents

| Document | Changed |
|---|---|
| PRD | Yes — FR-005 |
| App Flow | No |
| UI Guide | Yes — §4.7 |
| Backend Spec | Yes — §2.1 12 new fields |
| Security Checklist | No |

---

## V8 — 2 May 2026

**Change:** Cinematic Opening Animation (Location-Aware Globe Reveal)
**Brief:** `change-brief-v8.md`

### What Changed
- Added lib/locationUtils.ts with resolveStartingLocation() — timezone-based, permission-free, Malaysia default
- CultureGlobe mounts at z=1.8, animates to z=5.0 over 600ms; auto-rotation suppressed during intro
- prefers-reduced-motion skips intro; introPlayedRef prevents replay
- Lat/lon formula shared between intro and flyTo(); startingLocation prop added to CultureGlobe

### What Didn't Change
- latLonToVec3 formula — locked · flyTo() math — locked · resume() API
- Globe geometry, textures, hotspots, atmosphere, stars
- Moodboard, SmartPicker, WishlistDrawer, BottomBar, ThemeChips · destinations.json

### Affected Documents

| Document | Changed |
|---|---|
| PRD | Yes — FR-013 |
| App Flow | Yes — §2 |
| UI Guide | Yes — §4.1 |
| Backend Spec | No |
| Security Checklist | No |

---

## V7 — 2 May 2026

**Change:** Globe Coordinate & FlyTo Math Corrections
**Brief:** `change-brief-v7.md`

### What Changed
- Corrected buildTexture() canvas mirror around x=512
- Corrected flyTo() Y-axis formula from -theta + π/2 to theta - π/2
- V6 shortest-path normalisation and dot-click wiring retained

### What Didn't Change
- latLonToVec3 — locked · d3 projection — correct · flyTo X-axis — correct
- All tokens, fonts, components · destinations.json coordinates

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
- Corrected d3.geoEquirectangular projection parameters in buildTexture()
- Audited and corrected destination lat/lon values
- Fixed flyTo() shortest-path delta normalisation
- Fixed dot click: onHotspotClick now calls flyTo() then delays Moodboard by 1200ms

### What Didn't Change
- latLonToVec3 — locked · flyTo()/resume() signatures · globe geometry
- All design tokens · destinations.json field schema

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | Yes — §2 |
| UI Guide | No |
| Backend Spec | No |
| Security Checklist | No |

---

## V5 — 1 May 2026

**Change:** Globe Continent Upgrade (GeoJSON + Biome Texture)
**Brief:** `change-brief-v5.md`

### What Changed
- Replaced hardcoded CONTINENTS array with GeoJSON from world-atlas
- d3-geo + topojson-client installed; countries-110m.json added
- buildTexture() rewritten with d3.geoEquirectangular + 5 biome lat-band zones

### What Didn't Change
- latLonToVec3 — locked · flyTo()/resume() — locked · all design tokens
- Moodboard, SmartPicker, WishlistDrawer, BottomBar, ThemeChips · destinations.json

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.1 |
| Backend Spec | No |
| Security Checklist | No |

---

## V4 — 1 May 2026

**Change:** Globe Polish & UX Fixes (9 changes)
**Brief:** `change-brief-v4.md`

### What Changed
- Yellow viewport border · camera zoom · spin speed slider · brighter stars
- Hover cards cursor-follow + gold border · SmartPicker custom dropdowns
- Moodboard tile hover lift · flyTo bug fix · wishlist race condition fix

### What Didn't Change
- latLonToVec3 — locked · globe geometry · flyTo()/resume() signatures
- All design tokens · destinations.json schema

### Affected Documents

| Document | Changed |
|---|---|
| PRD | Yes — FR-003 |
| App Flow | Yes — §2 |
| UI Guide | Yes — §4.2, 4.5, 4.6, 4.7 |
| Backend Spec | No |
| Security Checklist | No |

---

## V3 — 30 April 2026

**Change:** Moodboard Complete Rebuild (Bento Dashboard)
**Brief:** `change-brief-v3.md`

### What Changed
- Full Moodboard rebuild as fixed-viewport 6-tile bento dashboard
- RegionGlobe SVG sub-component added · stagger entry animations
- New topbar + colophon · radial gradient background

### What Didn't Change
- Props interface · data bindings · Escape key · localStorage wishlist
- Yellow frame · design tokens · CultureGlobe, App, SmartPicker, WishlistDrawer

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.7 full rewrite |
| Backend Spec | No |
| Security Checklist | No |

---

## V2 — 30 April 2026

**Change:** Animated Bento Grid in Moodboard
**Brief:** `change-brief-v2.md`

### What Changed
- Animated bento-grid-01 from 21st.dev · framer-motion stagger animations
- lucide-react icon accents · installed framer-motion, lucide-react, shadcn bento-grid-01

### What Didn't Change
- All moodboard sections · data bindings · design tokens · yellow frame
- CultureGlobe, App, SmartPicker, WishlistDrawer · destinations.json

### Affected Documents

| Document | Changed |
|---|---|
| PRD | No |
| App Flow | No |
| UI Guide | Yes — §4.7 |
| Backend Spec | No |
| Security Checklist | No |
