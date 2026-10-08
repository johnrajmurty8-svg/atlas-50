# Change Brief: V12 — Bin 2/3 Resize & Swap, Fun Facts Formatting, Bin 4 Responsive Fixes

**Product:** Atlas /50
**Date:** 10 May 2026
**Version:** V12
**Prepared for:** Claude Code

---

## Summary

This brief covers six targeted changes across Bins 2, 3, and 4 of the Moodboard. Bins 2 and 3 are being resized and swapped, with BIN3 shrunk by ~30% and that space redistributed to BIN2. BIN3's fun facts copy grows by ~25% to fill the card and each sentence is forced to its own line. BIN4's Smart Widget graphics are made fully responsive across viewport widths, and the Cost Breakdown card (Card 5) is redesigned so the donut chart and legend render as one unified visual unit.

---

## What's Changing

### BIN2 & BIN3 — Tile Sizing

- **BIN3 height/flex share reduced by ~30%.** The fun facts carousel rarely fills the full tile; right-size it so it feels intentionally compact rather than sparse.
- **BIN2 receives the reclaimed space.** Increase BIN2's height/flex proportionally so the total bento grid height is unchanged and no reflow occurs in other bins.
- Both changes are CSS-only — adjust `grid-row` span, `flex` weight, or explicit `height` values on the two tile containers. Do not alter BIN1, BIN4, BIN5, or BIN6.

### BIN2 & BIN3 — Position Swap

- **Swap BIN2 and BIN3's positions on the bento grid.** BIN3 (fun facts) moves to BIN2's former slot; BIN2 (curated lists) moves to BIN3's former slot.
- Achieved by swapping `grid-area` values or reordering the JSX tiles — whichever is cleaner given the current grid layout. Do not change any internal component logic.

### BIN3 — Fun Facts Copy Length

- **Increase each fun fact string in `destinations.json` by approximately 25% in word count.** The goal is for each fact to comfortably fill the resized (smaller) BIN3 card without looking sparse.
- Apply to Italy's `fun_facts` array first (the only fully populated destination). Other destinations use placeholders — update those placeholders to similarly longer template strings.
- Do not change the number of fun facts (10 items), the carousel logic, or the transition timing.

### BIN3 — Sentence Line Breaks

- **Each sentence in the fun facts text must render on its own line.** Currently two sentences can share a single wide line.
- Preferred implementation: in the BIN3 carousel render function, split each fact string on sentence boundaries (`. ` or `! ` or `? `) and join with `\n`, then wrap the text element with `style={{ whiteSpace: 'pre-line' }}`. Alternatively, render each sentence as its own `<p>` or `<span>` with `display: block`.
- Do not change font size, colour, or carousel behaviour.

### BIN4 — Smart Widget: Full Responsive Scaling

- **All five card graphics must scale responsively to the viewport and browser width.** Currently they render correctly at ~1280px (Surface Pro 12") but overflow, shift, or misalign on wider desktop displays (~1920px+).
- Audit every card for hardcoded pixel dimensions on SVG elements, container divs, or canvas elements:
  - Remove fixed `width` and `height` attributes from SVG elements; replace with `viewBox` only and set `width="100%"` so the browser scales them.
  - Replace any fixed-pixel container widths (`width: 280px`, etc.) with `width: 100%` or `max-width` with `%` or `rem` values.
  - Use `aspect-ratio` CSS where needed to maintain chart proportions without fixed heights.
- **BIN4 must centre correctly at all viewport widths.** Verify that the BIN4 tile container uses `display: flex; align-items: center; justify-content: center` (or equivalent) and that no child element has a fixed left/right offset that breaks centring on wide screens.
- Test at two breakpoints minimum: ~1280px and ~1920px.
- Do not change any chart data logic, data bindings, or card crossfade transitions.

### BIN4 Card 5 — Cost Breakdown: Unified Chart + Legend

- **The donut chart and its legend must be one cohesive visual unit.** Currently the chart sits far left while the percentages and values appear as a separate block with a large gap between them.
- **Preferred fix — inline legend with values:** Remove the separate percentage/value column entirely. Move all data (category name, percentage, and formatted currency amount) into the legend itself, rendered directly alongside each colour swatch. Example format per row: `● Accommodation 34% · RM 890`. This makes the legend self-contained and eliminates the gap.
- If the donut chart component accepts a custom legend renderer, use that. Otherwise, rebuild the legend block as a flex column of swatch + label rows positioned adjacent to (not below, not far right of) the chart.
- The chart + legend assembly should be centred as a unit within the card, matching the centring behaviour established in V10.
- Retain: the card title, the budget traveller strip at the bottom, the card counter (05/05), and the crossfade transition. Do not alter the cost data or field names in `destinations.json`.

---

## What's NOT Changing

- BIN1 (hero carousel) — size, position, and all internal logic untouched
- BIN5, BIN6 — size, position, and all internal logic untouched
- BIN4 Cards 1–4 — Globe, Season Wheel, Vibe Radar, Crowd Calendar unchanged
- BIN4 nav arrows, pip dots, card counter, crossfade transition — all untouched
- BIN2's curated list widget internal logic (chevron nav, pips, category data) — untouched
- BIN3's carousel logic (5s auto-transition, chevron override, pip indicators, fade) — untouched
- All chart data logic and data bindings across all cards
- `destinations.json` field names, types, and schema
- `lib/types.ts` interfaces
- All design tokens, fonts, and colour values
- CultureGlobe, App, SmartPicker, WishlistDrawer, BottomBar, ThemeChips
- `latLonToVec3` formula — locked
- `flyTo()`, `resume()` API — locked
- Yellow viewport frame
- Wishlist localStorage logic
- Escape key listener
- Vercel deployment config and GitHub pipeline

---

## Design Notes

- The BIN2/BIN3 size swap should feel intentional. BIN3 is now a denser, tighter card — the shorter height and longer text per item should create a snug, readable card. BIN2 gets more breathing room for the 3-card curated list navigation.
- For BIN3 sentence breaks: avoid wrapping in block-level elements if the carousel uses inline rendering — `white-space: pre-line` with `\n`-joined sentences is the least invasive fix.
- For BIN4 responsive fixes: prefer CSS-only solutions. Avoid `useEffect` resize listeners if a `viewBox`-only SVG + `width: 100%` container achieves the same result.
- For the Cost Breakdown legend fix: the swatch rows should align on a fixed left edge, with name, percentage, and amount on a single line per category. Keep text size at 9px (set in V10) and near-white opacity (0.90). Do not introduce a second column or table layout — a simple `flex-col` of `flex-row` rows is sufficient.

---

## Affected Documents

- [ ] PRD — No changes required
- [ ] App Flow — No changes required
- [ ] UI Guide — Yes: §4.7 BIN2/BIN3 tile sizing and order; BIN3 text rendering rule; BIN4 responsive rules; Cost Breakdown legend spec
- [ ] Backend Spec — Yes: §2.1 fun_facts string length guidance (copy only, no schema change)
- [ ] Security Checklist — No changes required

---

## Test Checklist

- [ ] BIN3 tile is visibly ~30% smaller than before; BIN2 is visibly larger; no other bins have changed size or position
- [ ] BIN2 and BIN3 have swapped grid positions — curated list is now where fun facts was, and vice versa
- [ ] Italy's fun facts text is ~25% longer in word count per item; placeholder fun facts are similarly extended
- [ ] Each sentence in BIN3 renders on its own line — no two sentences share a single line
- [ ] BIN4 Smart Widget renders correctly at ~1280px (Surface Pro 12") — no regressions
- [ ] BIN4 Smart Widget renders correctly at ~1920px+ (wide desktop) — no clipping, overflow, or misalignment
- [ ] BIN4 is horizontally centred at all tested widths
- [ ] BIN4 Card 5: legend and donut chart appear as one visual unit — no large gap between them
- [ ] BIN4 Card 5: each legend row shows colour swatch + category name + percentage + currency amount
- [ ] BIN4 Card 5: budget traveller strip, card title, and 05/05 counter are untouched
- [ ] BIN4 Cards 1–4 are visually unchanged
- [ ] All other Moodboard bins (1, 5, 6) are visually unchanged
- [ ] Regression: globe flyTo, moodboard open/close, SmartPicker, and wishlist all function correctly after changes

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v12.md` and `change-log.md` in this project folder.

This is a V12 update to Atlas /50. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
