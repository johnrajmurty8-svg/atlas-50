# Change Brief: V4 — Globe Polish & UX Fixes

**Product:** Atlas /50
**Date:** 1 May 2026
**Version:** V4
**Prepared for:** Claude Code

> ⚠️ **This brief has been updated to reflect what was actually implemented.** The original brief listed 6 planned changes; 9 changes were ultimately shipped. This document is the authoritative record.

---

## Summary

Nine targeted polish fixes and UX improvements shipped in V4, spanning the globe component, hover card behaviour, SmartPicker dropdowns, Moodboard tile interactions, and two bug fixes (flyTo animation, wishlist removal). The yellow viewport frame was also confirmed active. No new top-level components were introduced and no data model schema was changed.

---

## What Was Implemented

### 1. Yellow Viewport Border Frame
- A gold (`#ffd100`) border now frames the entire viewport with a visible dark gap between it and the page content
- Rendered as a `position: fixed` overlay at `z-index: 200`, `pointer-events: none`

### 2. Globe Camera Zoom
- Camera was pulled back so the full globe sits comfortably within the viewport frame at 100% browser zoom
- Only camera distance was changed — globe radius and geometry untouched

### 3. Spin Speed Slider
- A UI slider was added to allow the user to control globe auto-rotation speed in real time
- Replaces the planned static 20% speed increase — the slider provides dynamic control instead

### 4. Stars — Brightness, Count & Speed
- Stars made brighter and more numerous
- Stars move slightly faster (subtle drift/twinkle effect enhanced)
- No hue change — still white/near-white

### 5. Hover Cards — Resized, Cursor-Following, Styled, Decoupled from List
- Hover cards shrunk by ~35% vs previous size
- Cards now follow the cursor position (dynamic positioning) rather than being anchored to a fixed screen location
- Gold (`#ffd100`) border and drop shadow added to hover cards
- **Decoupled from destination list:** hovering the left-panel destination list no longer triggers the hover card — instead, the hovered destination name turns gold in the list. Hover cards only appear on globe dot hover.

### 6. SmartPicker — Custom Dropdowns
- Replaced unstyled native browser `<select>` dropdowns with custom-styled ones
- Custom dropdown style: navy background, gold (`#ffd100`) highlight on hover
- Behaviour (filter logic, option values, tag vocabulary) unchanged

### 7. Moodboard Tile Hover Effect
- Each bento tile in the Moodboard now has a hover state: slight lift (translateY up) + gold border glow
- Pure CSS transition — no framer-motion required
- Applied to all 6 tiles uniformly

### 8. Bug Fix — Globe FlyTo Animation on List Click
- Fixed a bug where clicking a destination in the left-panel list silently skipped the globe rotation
- The globe now visibly rotates to the destination's coordinates before the Moodboard detail panel opens
- Root cause: the `flyTo()` call was being bypassed or the timeout before `setSelected()` was missing/too short

### 9. Bug Fix — Wishlist Removal Race Condition
- Fixed a bug where removing an item from the wishlist and closing the drawer too quickly would leave the item still present in the list on next open
- Removal now happens instantly and synchronously — no async gap between state update and drawer close

---

## What's NOT Changing

- `latLonToVec3` function formula — untouched
- Globe geometry, continent meshes, globe radius
- Destination coordinate values in `destinations.json` (coordinate audit deferred — dots still need review)
- Moodboard props interface: `{ country, onClose, onToggleWishlist, inWishlist }` — unchanged
- All design tokens: `#ffd100`, `#f4ecd4`, `#050912`, `#070f1f`, font families
- `destinations.json` field schema
- Authentication, Supabase, database — V1 static JSON only
- Mobile layouts — V1 desktop only
- `CLAUDE.md` architecture rules

> **Note on deferred item:** The destination coordinate audit (hotspot dots appearing in ocean) was listed in the original brief but was **not implemented** in V4. This should be carried forward to V5.

---

## Design Notes

- The SmartPicker custom dropdowns must respect the locked design tokens — navy background aligns with `--color-ocean: #070f1f` or a close variant; gold hover aligns with `--color-accent: #ffd100`.
- The Moodboard tile lift should be subtle — recommended: `translateY(-3px)` to `translateY(-5px)` with a `transition: 0.2s ease`. The gold border glow should use `box-shadow: 0 0 0 1px #ffd100` or a similar inset ring, not a thick border.
- Hover cards following the cursor: use `mouseX` and `mouseY` from a `mousemove` event on the globe canvas to position the card. Offset slightly so the card doesn't sit under the cursor tip (e.g. `left: x + 12, top: y - cardHeight - 12`).
- Spin speed slider: store the speed value in component state; pass it into the Three.js animation loop. Do not persist to `localStorage` — slider resets to default on page reload is acceptable for V4.

---

## Affected Documents

- [x] PRD — FR-003 (Globe Interaction) — hover card now cursor-following, decoupled from list; spin slider added
- [x] App Flow — §2 Globe Interaction — list hover behaviour changed (gold name, no card); hover card cursor-follow noted
- [x] UI Guide — §4.2 Globe (stars, spin slider, camera), §4.5 HoverCard (size, style, position), §4.6 SmartPicker (custom dropdowns), §4.7 Moodboard (tile hover state)
- [ ] Backend Spec — no changes
- [ ] Security Checklist — no changes

---

## Test Checklist

- [x] Yellow gold border frames the full viewport with a visible dark gap — present at all times including when Moodboard is open
- [x] Globe fits fully within the viewport at 100% browser zoom
- [x] Spin speed slider is present in the UI and adjusts globe rotation speed in real time
- [x] Stars are visibly brighter and more numerous than V3
- [x] Hover card is ~35% smaller than before
- [x] Hover card follows the cursor as it moves across the globe
- [x] Hover card has gold border and drop shadow
- [x] Hovering a destination in the left-panel list turns the name gold — no hover card appears
- [x] Hover card still appears correctly when hovering globe dots
- [x] SmartPicker dropdowns have navy background and gold hover highlight
- [x] SmartPicker filter logic is unchanged — all 6 filters still work correctly
- [x] Moodboard tiles lift and show gold border glow on hover
- [x] Clicking a destination in the list triggers visible globe rotation before Moodboard opens
- [x] Removing a wishlist item and immediately closing the drawer does not re-add the item
- [x] Regression: Moodboard opens and closes correctly
- [x] Regression: `flyTo()` still works from SmartPicker and Surprise Me
- [x] Regression: All design tokens respected throughout — no off-brand colours introduced
- [ ] **Deferred:** Destination coordinate audit (dots in ocean) — carry to V5

---

## Claude Code Prompt

*(Retained for reference — this brief documents completed work and does not require a new Claude Code session.)*

---

Read `change-brief-v4.md`, `change-log.md`, and `CLAUDE.md` in this project folder.

This is a V4 update to Atlas /50. This brief documents 9 changes that have already been implemented. Use it as the reference record for what changed in V4.

If a V5 session references this brief, the key deferred item is: **destination coordinate audit** — hotspot dots appearing in the ocean rather than on land. This should be the first item addressed in V5.

---
