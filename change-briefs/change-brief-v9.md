# Change Brief: V9 — Moodboard Bin 1 & Bin 4 Upgrade

**Product:** Atlas /50
**Date:** 3 May 2026
**Version:** V9
**Prepared for:** Claude Code

---

## Summary

Two Moodboard bins are being upgraded. Bin 1 (hero image) becomes a slow ambient photo carousel with 5 images per destination and manual navigation arrows. Bin 4 (location card) replaces the existing static `RegionGlobe` SVG with a 5-card paginated info widget — Globe, Season Wheel, Vibe Radar, Crowd Calendar, and Cost Breakdown — each graphically distinct and data-driven. Both changes require new fields in `destinations.json`.

---

## What's Changing

### Frontend — `components/Moodboard.tsx` — Bin 1 (Hero Image)

- Replace the current single hero image with a crossfade photo carousel
- Carousel cycles through exactly 5 images from `country.images` (expanded from 4–6)
- Auto-rotation: 6.5s per image, 1.2s CSS crossfade transition — slow and ambient
- Pause auto-rotation on mouse hover over the bin; resume on mouse leave
- Back/forward arrow buttons positioned bottom-right of the bin, minimal style — small chevrons (`‹ ›`), low opacity at rest (`rgba(244,236,212,0.45)`), brighten to full cream on hover
- Arrows cycle through images (wraps around)
- Add a `// TODO: clicking this bin should open a full-screen image collage view (V10)` comment on the bin's root element — do not add a click handler yet
- Carousel state is local to `Moodboard` — no global state changes
- Images preloaded on mount to prevent flash on first transition

### Frontend — `components/Moodboard.tsx` — Bin 4 (Location Card)

- Replace the `RegionGlobe` SVG sub-component entirely with a new inline 5-card paginated widget
- The widget renders inside the existing Bin 4 bento tile — no layout changes to the surrounding grid
- Cards are navigated via back/forward chevron buttons (bottom-centre of the tile) and 5 dot indicators
- Cards cycle endlessly (wrap around)
- Transition between cards: opacity crossfade, 0.4s

**Card 1 — Globe · Location**
- Miniature SVG globe (no Three.js — pure SVG)
- Atmosphere ring: three concentric circles outside the globe edge in pale blue (`rgba(110,165,255,0.23/0.10/0.04)`)
- Globe base fill: `#040d1e`
- Longitude ellipses and central meridian as faint grid lines (`rgba(255,220,170,0.05)`)
- Tropic of Cancer and Equator as dashed arcs with small text labels
- Destination country silhouette drawn as an amber SVG path (`rgba(255,209,0,0.68)`) — use the simplified country shape from `country.globe_path` (new field, see Data section)
- Globe edge ring: `rgba(255,220,170,0.22)`
- Amber pin at destination lat/lon with two pulsing halos
- Bottom strip (below globe): left = live local time in destination timezone (`country.timezone`), right = flight time from LHR (`country.flight_time_lhr`)
- Local time updates every 30s using `Intl.DateTimeFormat` — no external library

**Card 2 — Season Wheel · Best Season**
- Circular SVG calendar ring: 12 arc segments, one per month
- Peak months (`country.peak_months` — array of 0-indexed month numbers) filled amber (`rgba(255,209,0,0.72)`)
- Off-peak months filled pale blue (`rgba(140,185,255,0.26)`)
- Month initial letters inside each arc segment
- Average monthly temperatures (`country.monthly_temps` — array of 12 °C values) rendered as text labels just outside the ring, one per month
- Temperature label colour follows the season: amber tones for peak months, blue tones for off-peak
- Inner disc shows `AVG / °C` label at low opacity
- Legend: amber swatch = PEAK, blue swatch = OFF SEASON

**Card 3 — Vibe Radar · Vibe Fingerprint**
- Pentagon SVG radar chart, 5 axes: CULTURAL, ROMANTIC, SOCIAL, SPIRITUAL, ADVENTURE
- Three concentric pentagon grid rings at 33%, 66%, 100% opacity `rgba(255,220,170,0.08)`
- Axis lines: `rgba(255,220,170,0.06)`
- Filled polygon from `country.vibe_scores` (object with 5 keys, each 0–1)
- Polygon fill: `rgba(255,209,0,0.10)`, stroke: `#ffd100`, stroke-width 1
- Amber dot at each vertex of the filled polygon
- Axis labels in JetBrains Mono 8px, `rgba(244,236,212,0.45)`

**Card 4 — Crowd Calendar · When to Go**
- 12 vertical bars, one per month, spanning the full tile width
- Bar height proportional to `country.crowd_index[i]` (1–10 scale)
- Bar fill: `rgba(255,209,0, alpha)` where alpha scales from 0.10 (quiet) to 0.82 (busy)
- Thin border on each bar: `rgba(255,220,170,0.08)`
- Month labels (JAN / JUN / DEC) below the bars at low opacity
- Gradient legend strip: QUIET → BUSY

**Card 5 — Cost Breakdown · Est. Daily Spend**
- Donut SVG chart from `country.cost_breakdown` object (5 keys: `accommodation`, `food`, `activities`, `transport`, `other` — each a percentage, summing to 100)
- Segment colour palette:
  - Accommodation: `rgba(255,209,0,0.82)`
  - Food & Drink: `rgba(255,209,0,0.42)`
  - Activities: `rgba(140,185,255,0.62)`
  - Transport: `rgba(140,185,255,0.30)`
  - Other: `rgba(255,220,170,0.16)`
- Small gap (0.03 rad) between each segment
- Donut centre text: `country.cost_daily_total` (e.g. `€185`) in DM Serif Display, `EST/DAY` and `PER PERSON` labels in JetBrains Mono at low opacity
- Legend to the right of donut: category label, percentage, estimated euro amount (`country.cost_breakdown_amounts` — object with matching keys)
- Bottom strip: `BUDGET TRAVELLER` label left, `country.cost_budget_daily` right (e.g. `~€90/DAY`)

### Data — `src/data/destinations.json`

Add the following new fields to **all existing destination records** (Italy/Rome values shown as reference — all other records will need their own values authored):

| Field | Type | Example (Italy) | Notes |
|---|---|---|---|
| `images` | `string[]` | (existing) | Trim or expand to exactly 5 URLs — no longer 4–6 |
| `monthly_temps` | `number[12]` | `[8,9,13,17,22,27,30,29,25,19,13,9]` | Avg °C Jan–Dec |
| `peak_months` | `number[]` | `[3,4,5,6,7,8,9]` | 0-indexed month numbers |
| `crowd_index` | `number[12]` | `[2,2,3,5,6,8,9,9,7,5,3,2]` | 1–10 scale Jan–Dec |
| `vibe_scores` | `object` | `{ cultural:0.9, romantic:0.85, social:0.75, spiritual:0.4, adventure:0.35 }` | All values 0–1 |
| `cost_breakdown` | `object` | `{ accommodation:38, food:26, activities:18, transport:12, other:6 }` | Percentages summing to 100 |
| `cost_breakdown_amounts` | `object` | `{ accommodation:"€70", food:"€48", activities:"€33", transport:"€22", other:"€12" }` | Display strings |
| `cost_daily_total` | `string` | `"€185"` | Est. mid-range daily spend |
| `cost_budget_daily` | `string` | `"~€90/DAY"` | Budget traveller reference |
| `timezone` | `string` | `"Europe/Rome"` | Valid IANA timezone string |
| `flight_time_lhr` | `string` | `"~2h 55m"` | From London Heathrow |
| `globe_path` | `string` | SVG path `d` attribute string | Simplified country silhouette for the miniature globe SVG — keep to ~20–40 path commands |

> ⚠️ **Authoring priority:** Italy must be fully populated before testing. Remaining destinations can be populated incrementally — the card widget must degrade gracefully if new fields are absent (fallback: show `—` for missing text values, skip chart rendering if array is absent).

---

## What's NOT Changing

- All other Moodboard bins (Bin 2 Themes/Seasonal, Bin 3 Weather, Bin 5 Itinerary, Bin 6 Signature Dish/Gramophone) — touch nothing
- Moodboard props interface `{ country, onClose, onToggleWishlist, inWishlist }` — identical
- Topbar, colophon row, SAVE button, close button — do not touch
- All design tokens: `#070f1f`, `#ffd100`, `#f4ecd4`, DM Serif Display / Inter / JetBrains Mono — do not change
- `CultureGlobe`, `App`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — do not touch
- `latLonToVec3` formula — locked
- `flyTo()`, `resume()` API — locked
- Globe geometry, camera FOV, atmosphere shader, star particles — locked
- Yellow viewport frame — do not touch
- `destinations.json` schema fields that already exist — existing field names and types unchanged; only new fields are added
- Wishlist localStorage logic — unchanged
- Escape key listener — unchanged

---

## Design Notes

- All SVG in Bin 4 is pure SVG rendered inline — no Three.js, no canvas, no external charting library
- All fonts inside the widget must use the Atlas token fonts (DM Serif Display, Inter, JetBrains Mono) — not browser defaults
- The card widget sits inside the existing bento tile and must not overflow its boundaries — use `overflow: hidden` on the tile
- Bin 1 carousel images must be absolutely positioned and stacked — use `opacity` + `transition` for crossfade, not `display:none`/`display:block`
- Arrow buttons in Bin 1 and Bin 4 must not interfere with each other — they are in separate bins with separate state
- The Bin 4 widget card height must not cause the bento grid to reflow — pin the tile to a fixed height

---

## Affected Documents

- [ ] PRD — FR-005 (Moodboard Panel) — update acceptance criteria for Bin 1 carousel and Bin 4 widget
- [ ] App Flow — no navigation changes
- [ ] UI Guide — §4.7 Moodboard: update Bin 1 and Bin 4 specs
- [ ] Backend Spec — §2.1 Destination schema: add 12 new fields to the data model table
- [ ] Security Checklist — no auth/encryption changes

---

## Test Checklist

- [ ] Bin 1: carousel auto-advances every 6.5s with a visible crossfade
- [ ] Bin 1: hovering over the hero image pauses rotation; mouse leave resumes
- [ ] Bin 1: back/forward arrows cycle through all 5 images and wrap correctly
- [ ] Bin 1: arrows are visible and correctly positioned in the bottom-right of the bin
- [ ] Bin 4: all 5 cards render without overflow clipping
- [ ] Bin 4: chevron navigation and dot indicators work correctly; card counter updates
- [ ] Bin 4 Card 1: Italy silhouette renders amber in correct globe position; atmosphere ring visible
- [ ] Bin 4 Card 1: local Rome time shows current time and updates every 30s
- [ ] Bin 4 Card 2: peak months render amber; off-peak render pale blue; temperatures appear outside ring
- [ ] Bin 4 Card 3: radar polygon reflects `vibe_scores` values correctly
- [ ] Bin 4 Card 4: crowd bars scale correctly to `crowd_index` array
- [ ] Bin 4 Card 5: donut segments sum to 360°; legend values match `cost_breakdown`
- [ ] All new `destinations.json` fields present and valid for Italy record
- [ ] Graceful fallback: opening a destination without new fields does not throw an error
- [ ] Regression: Bins 2, 3, 5, 6 render identically to pre-V9
- [ ] Regression: globe flyTo, wishlist, SmartPicker, Surprise Me all unaffected

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v9.md` and `change-log.md` in this project folder.

This is a V9 update. Make ONLY the changes listed in the brief.

A reference implementation file is included in this project folder:

`bin4-location-widget.reference.tsx`

This file contains the approved visual design, SVG geometry, colour tokens, and interaction logic for the Bin 4 five-card location widget. Use it as your primary reference when implementing the Bin 4 changes inside `components/Moodboard.tsx`:

- Match all colour values exactly from the `T` design tokens object
- Match all SVG geometry for each card (globe, season wheel, radar, crowd bars, donut)
- Match all font families, sizes, and letter-spacing values
- Match the nav/pip/transition interaction pattern
- Adapt the `LocationWidgetData` interface to consume the new `destinations.json` fields
- Do NOT import or use this reference file directly — it is reference only

Do not use any external charting libraries. All charts are pure SVG as shown in the reference.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
