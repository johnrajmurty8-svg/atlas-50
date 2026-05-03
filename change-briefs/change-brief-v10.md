# Change Brief: V10 — Bin 4 Widget UI Polish (7 Fixes)

**Product:** Atlas /50
**Date:** 3 May 2026
**Version:** V10
**Prepared for:** Claude Code

---

## Summary

Seven UI polish fixes to the Bin 4 five-card location widget introduced in V9. The changes address layout, legibility, sizing, and clipping issues observed in the live implementation. No new features are added — this is a surgical refinement pass only.

---

## What's Changing

### Frontend — `components/Moodboard.tsx` — Bin 4 Widget

**Fix 1 — Navigation arrows moved to top-right**
- Remove the bottom-centre nav row (back/forward arrows + pip dots) from its current position below the card body
- Reposition as an absolutely-positioned element in the top-right corner of the card tile, overlaying all cards
- Use `position: absolute; top: 16px; right: 16px; z-index: 10` on the nav container
- The card counter (e.g. `01 / 05`) stays bottom-right only — the bottom-left card name label is removed entirely (see Fix 3)
- Arrow buttons: `width: 26px; height: 26px` (slightly smaller than V9 to fit the top-right corner cleanly)
- Pip dots remain between the arrows, same behaviour
- Add `padding-right: 70px` to the card title in all 5 cards so the title text does not overlap the nav buttons

**Fix 2 — Globe, Season Wheel, Vibe Radar graphics ~18% larger and centred**
- Globe SVG: increase rendered size from `width="186" height="172"` to `width="214" height="200"` (keeping the same `viewBox="0 0 186 178"`)
- Season Wheel SVG: increase rendered size from `width="200" height="200"` to `width="222" height="222"` (keeping `viewBox="0 0 200 200"`)
- Vibe Radar SVG: increase rendered `viewBox` from `"0 0 200 185"` to `"0 0 240 212"`, increase `transform translate` from `(95,92)` to `(120,110)`, increase radar radius `R` from `52` to `60`
- All three SVG containers must be centred within their `.cbody` flex container (`align-items: center; justify-content: center`)

**Fix 3 — Remove bottom-left card name label**
- Delete the `<span>` element showing the card name (e.g. `GLOBE — LOCATION`, `SEASON WHEEL`) from the bottom-left of each card
- The card counter (e.g. `01 / 05`) in the bottom-right must remain — do not remove it

**Fix 4 — Text legibility improvements across all 5 cards**
- Card tag (01 of 05 label): unchanged, stays amber `#ffd100`
- Card title (DM Serif Display): change colour from `#f4ecd4` to `#f0e8d0` — slightly brighter
- Card subtitle (Inter): change from `rgba(244,236,212,0.45)` to `rgba(240,232,208,0.65)` — more legible
- All JetBrains Mono labels inside card bodies (axis labels, month labels, legend text, strip labels): increase opacity to minimum `0.65`, target `0.75–0.90` for primary labels
- Specifically: Vibe Radar axis labels → `rgba(240,232,208,0.85)`, Crowd Calendar axis labels → `rgba(240,232,208,0.65)`, Cost legend labels → `rgba(240,232,208,0.90)`

**Fix 5 — Crowd Calendar graph narrower**
- Reduce SVG width from `280` to `216` (both the `width` attribute and `viewBox`)
- Reduce bar width `cw` from `19` to `14`, keep gap at `3`, keep start offset at `4`
- The month axis label row and QUIET/BUSY legend strip below the bars must also shrink to `width: 216px`
- Keep bar height calculation identical — only horizontal dimensions change

**Fix 6 — Cost Breakdown card layout tightened and centred**
- Centre the entire donut + legend group within the card body using `justify-content: center` on the flex container
- Reduce gap between donut and legend from `14px` to `18px` (tighter but not cramped)
- Cost legend item rows: increase label font size from `8px` to `9px`; set label colour to `rgba(240,232,208,0.90)` (near white)
- Percentage value colour: `#f0e8d0` (full cream, was previously dimmer)
- Euro amount colour: `rgba(240,232,208,0.55)` (secondary but readable)
- Legend swatch size: keep at `8×8px`

**Fix 7 — Vibe Radar ADVENTURE label no longer clipped**
- Increase the SVG `viewBox` width from `200` to `240` (already covered in Fix 2 — confirm both are applied together)
- Update the ADVENTURE label `x` offset from `-62` to `-78` with `text-anchor="end"` — this pushes it further left within the wider viewBox, preventing clipping
- Update all other label offsets to match the larger radar radius `R=60`:
  - CULTURAL: `x="0" y="-80"`
  - ROMANTIC: `x="76" y="-27"` (`text-anchor="start"`)
  - SOCIAL: `x="48" y="55"` (`text-anchor="start"`)
  - SPIRITUAL: `x="-48" y="55"` (`text-anchor="end"`)
  - ADVENTURE: `x="-78" y="-27"` (`text-anchor="end"`)

---

## What's NOT Changing

- All 5 card graphics and their data logic — globe path, season wheel arcs, radar polygon, crowd bars, donut arcs — no changes to chart calculations or data bindings
- Card content: titles, subtitles, all `country.*` data fields
- The bottom-right card counter (`01 / 05`) — stays in place
- Card transition behaviour (opacity crossfade 0.4s)
- Pip dot navigation logic — behaviour identical, only position changes
- The info strip at the bottom of Card 1 (local time + LHR flight time)
- The legend at the bottom of Card 2 (PEAK / OFF SEASON swatches)
- The budget traveller strip at the bottom of Card 5
- All other Moodboard bins (Bin 1 carousel, Bins 2, 3, 5, 6) — do not touch
- `destinations.json` — no data changes
- `CultureGlobe`, `App`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — do not touch
- All design tokens: `#070f1f`, `#ffd100`, `#f0e8d0`, DM Serif Display / Inter / JetBrains Mono
- Yellow viewport frame — do not touch
- `flyTo()`, `resume()` — locked

---

## Design Notes

- A reference implementation of the corrected widget is available at `bin4-location-widget.reference.tsx` in the `/docs/` folder. The reference file has NOT been updated for V10 — use the specific measurements listed in this brief. The V10 fix values take precedence over the reference file wherever they differ.
- The nav repositioning to top-right is the most structurally significant change. The absolute positioning must overlay all 5 cards uniformly — place it as a sibling to the card stack, not inside any individual card.
- The `padding-right: 70px` on card titles prevents visual collision between the title text and the nav buttons on cards with long titles (e.g. "Est. Daily Spend", "Europe · Italy").
- All opacity increases for text legibility should be applied globally within the widget — search for the old rgba values and update them in one pass rather than card by card.

---

## Affected Documents

- [ ] PRD — No change
- [ ] App Flow — No change
- [ ] UI Guide — Yes — §4.7 Bin 4 widget: update nav position spec, text opacity values, chart dimension values
- [ ] Backend Spec — No change
- [ ] Security Checklist — No change

---

## Test Checklist

- [ ] Nav arrows appear in the top-right corner of every card and do not overlap card titles
- [ ] Pip dots are visible and correctly positioned between the arrows in the top-right
- [ ] Card titles have `padding-right` applied and do not overlap nav buttons on any of the 5 cards
- [ ] Globe SVG is visibly larger than V9 and centred in the card body
- [ ] Season Wheel SVG is visibly larger than V9 and centred in the card body
- [ ] Vibe Radar SVG is visibly larger than V9 and centred in the card body
- [ ] Bottom-left card name label is absent from all 5 cards
- [ ] Bottom-right counter (e.g. `01 / 05`) is still present on all 5 cards
- [ ] All card body text is noticeably more legible — no label falls below 0.65 opacity
- [ ] Vibe Radar: ADVENTURE label is fully visible and not clipped on any screen width
- [ ] Vibe Radar: all 5 axis labels are fully visible and correctly positioned
- [ ] Crowd Calendar: graph is narrower (216px) and does not overflow the card
- [ ] Cost Breakdown: donut and legend are centred together within the card body
- [ ] Cost Breakdown: legend text is near-white and legible at glance distance
- [ ] Card transitions still crossfade correctly at 0.4s
- [ ] Regression: Bin 1 carousel unaffected
- [ ] Regression: Bins 2, 3, 5, 6 render identically to pre-V10
- [ ] Regression: globe flyTo, wishlist, SmartPicker, Surprise Me all unaffected

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v10.md` and `change-log.md` in this project folder.

This is a V10 update — 7 UI polish fixes to the Bin 4 location widget built in V9. Make ONLY the changes listed in the brief.

A reference implementation exists at `bin4-location-widget.reference.tsx` in `/docs/`. The V10 brief values take precedence over the reference file wherever they differ.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
