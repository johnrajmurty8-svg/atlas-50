# Change Brief: V3 — Moodboard Complete Rebuild (Bento Dashboard)

**Product:** Atlas /50
**Date:** 30 April 2026
**Version:** V3
**Prepared for:** Claude Code

---

## Summary

Complete replacement of the `Moodboard` component. The existing scrolling parallax layout (hero, bento, diptych, experiences, full-bleed, triptych, footer) is retired entirely. It is replaced with a fixed-viewport bento dashboard — 6 tiles arranged in a 12-column × 6-row grid that fills the screen with no scroll. The new design is modelled on the attached reference image and implemented exactly as specified in the new `moodboard.jsx` source file, which is to be ported to `components/Moodboard.tsx`.

---

## What's Changing

### Architecture

- Remove all scrolling, parallax, and multi-section layout logic from `Moodboard`
- Remove `useRef`, `scrollTop` tracking, `heroY`, `heroScale`, `titleY`, `titleOpacity`, `frameY` — none of these exist in the new design
- Replace with a fixed-viewport (`position:fixed, inset:0`) flex column layout: topbar → bento grid → colophon
- Introduce `mounted` state (boolean) driven by `requestAnimationFrame` on `country.id` change — this powers stagger animations
- Add a new internal `RegionGlobe` sub-component (SVG-only, no Three.js) — renders a stylised sphere with lat/lon lines and a pulsing yellow hotspot dot at the destination's position

### Layout — 6 Bento Tiles (12-col × 6-row grid, `gap: 14px`)

| Tile | Grid position | Content |
|---|---|---|
| 1 Hero | col 1–4 / row 1–4 | `images[0]` full-bleed bg + dark veil. Giant first letter of `country.name` in DM Serif Display (clamp 140–220px) + second letter italic smaller. Full name + tagline at bottom. |
| 2 Themes | col 5–8 / row 1–2 | 3 decorative bars (glyph) + "Themes" title + `country.themes` joined with ` · ` |
| 3 Climate | col 5–8 / row 3–4 | SVG seasonal swing chart (hardcoded curve, yellow stroke + fill) + "SEASONAL SWING" label + axis (jan/apr/jul/oct) + `country.weather` split on `·`: temp as title, condition as body |
| 4 Globe | col 9–12 / row 1–4 | `RegionGlobe` SVG component + region name with globe icon + lat/lon formatted as `9.2°S · 75.0°W` |
| 5 Itinerary | col 1–7 / row 5–6 | Pin icon + "Itinerary" title + "05 stops" counter. `country.experiences.slice(0, 5)` in a 2-column grid, each item: zero-padded number (JetBrains Mono yellow) + experience text (DM Serif Display cream) |
| 6 Finale | col 8–12 / row 5–6 | `images[2]` full-bleed bg + dark veil. `— SIGNATURE DISH` label + `country.dish` (italic serif). Yellow hairline separator. `— ON THE GRAMOPHONE` label + `country.playlist` with vinyl circle SVG icon. |

### Top Chrome (replaces old close/wish buttons)

- Full-width topbar: `ATLAS / 50` brand (yellow dot + yellow bold mono text) + `VOL. XXVI · No. [NNN] · [REGION]` in cream mono
- SAVE/SAVED button: `inWishlist` toggles heart fill + border to yellow
- Close button: 32×32, frosted glass, no border radius

### Bottom Colophon

- Single centred row: `EST. 1899 · · · FILED FROM [COUNTRY] · · · SPRING MMXXVI` in JetBrains Mono 9px, `rgba(244,236,212,0.4)`

### Background

- Replace flat `#070f1f` with: `radial-gradient(ellipse at 50% 30%, #0d1733 0%, #060b1a 65%, #03060f 100%)`

### Cell Styling

- `cellBase`: `position:relative`, `background:rgba(20,26,44,0.55)`, `border:1px solid rgba(255,220,170,0.10)`, `borderRadius:14`, `overflow:hidden`, flex column
- **Note on border radius:** The new `moodboard.jsx` uses `borderRadius:14` on tiles only. This is intentional and specific to the bento tile cards — it does NOT apply to buttons, chips, or any other UI element.

### Entry Animation

- Each tile uses inline CSS `transition` on `opacity` and `translateY` driven by `mounted` state
- `mounted` false → `opacity:0, translateY(18px)` | `mounted` true → `opacity:1, translateY(0)`
- Stagger: `80 + i * 70`ms delay per tile (i = 0–5)
- No framer-motion required — pure CSS transition
- `@keyframes mb-fade` injected once into `<head>` for the root fade-in

### `RegionGlobe` Sub-component

- Pure SVG, no Three.js
- Renders: radial yellow glow, outer circle, latitude ellipses (−60, −30, 0, 30, 60), longitude ellipses (0, 30, 60, 90, 120, 150), outer border ring, pulsing hotspot at centre (`cx=90, cy=90`) with SVG `<animate>` for pulse
- Props: `lat`, `lon` (used for display only in this version — dot is always at centre)
- Size: 68% width, maxWidth 200px

---

## What's NOT Changing

- Props interface: `{ country, onClose, onToggleWishlist, inWishlist }` — identical, no changes
- All data bindings: `country.name`, `country.tagline`, `country.region`, `country.themes`, `country.weather`, `country.dish`, `country.playlist`, `country.experiences`, `country.images`, `country.lat`, `country.lon`, `country.id` — all used
- Escape key listener — remains exactly as before
- `localStorage` wishlist logic — not in Moodboard, lives in App — do not touch
- The yellow frame (`3px solid #ffd100`, `position:fixed`, inset 14px, `z-index:200`) — stays
- Design tokens: `#ffd100`, `#f4ecd4`, `#070f1f`, DM Serif Display / Inter / JetBrains Mono — all used in new design
- `CultureGlobe`, `App`, `SmartPicker`, `WishlistDrawer`, and all other components — do not touch
- `destinations.json` data — do not modify
- `CLAUDE.md` architecture rules — all apply

---

## Design Notes

- The `moodboard.jsx` file attached to this brief is the source of truth. Port it to `components/Moodboard.tsx` precisely. Do not improvise tile layout or styling.
- `tileBody` colour is `rgba(123,162,217,0.85)` — a cool bluish secondary tone used for subtext like region, climate condition, themes list. This is intentional.
- The climate SVG chart uses a hardcoded bezier curve path — it is decorative, not data-driven. Port it exactly.
- `issueNo` is derived as: `String((country.id.length * 7 % 80) + 10).padStart(3, '0')` — port this formula exactly.
- `RegionGlobe` always places the hotspot dot at `cx=90, cy=90` (centre) in V3. Accurate projection is a future enhancement.
- The `mb-fade` keyframe must be injected into `document.head` once on mount (guard with `document.getElementById('moodboard-anim')`). In Next.js/TSX, use a `useEffect` to do this injection.
- Remove any imports of `framer-motion` that were added in V2 — they are no longer needed.

---

## Affected Documents

- [ ] PRD — FR-005 (Moodboard Panel) — acceptance criteria change: remove "parallax scroll" and "scroll depth" references; update to fixed-viewport bento grid
- [ ] App Flow — minor: Moodboard is no longer a scroll experience; remove scroll-related interaction notes in §3
- [x] UI Guide — §4.7 Moodboard — full rewrite to document new 6-tile bento layout
- [ ] Backend Spec — no data changes
- [ ] Security Checklist — no auth/encryption changes

---

## Test Checklist

- [ ] Moodboard opens as a fixed-viewport overlay — no scroll, no overflow
- [ ] All 6 tiles appear in correct grid positions (verify against reference image)
- [ ] Tile 1 (Hero): `images[0]` renders, first letter giant, name + tagline at bottom
- [ ] Tile 2 (Themes): 3 decorative bars + themes joined with ` · `
- [ ] Tile 3 (Climate): SVG curve chart renders, temp and condition display correctly
- [ ] Tile 4 (Globe): `RegionGlobe` SVG renders with lat/lon lines, pulsing dot, region name + coordinates below
- [ ] Tile 5 (Itinerary): 5 experiences in 2-column grid, yellow mono numbers
- [ ] Tile 6 (Finale): `images[2]` renders, dish name and playlist visible over veil
- [ ] Stagger animation plays on open — tiles fade+slide in sequentially
- [ ] Switching destinations re-triggers stagger animation (mounted resets to false then true)
- [ ] Topbar: brand, issue number, region label, SAVE button, close button all present
- [ ] SAVE button turns yellow when wishlisted; SAVED label appears
- [ ] Escape key closes the moodboard
- [ ] Yellow frame is visible at all times (z-index 200)
- [ ] Colophon at bottom renders with correct country name
- [ ] No framer-motion imports remain
- [ ] Regression: CultureGlobe, App, SmartPicker, WishlistDrawer all unaffected

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v3.md`, `change-log.md`, and `CLAUDE.md` in this project folder. Also read the new `moodboard.jsx` file — it is the source of truth for this change.

This is a V3 update to Atlas /50. The entire `Moodboard` component is being replaced. Make ONLY the changes listed in the brief. Do not touch any other component.

**Before writing any code:**
1. List every file you will modify or create
2. Describe what you will change in each file
3. Confirm you have read the new moodboard.jsx in full
4. Wait for my approval before proceeding

Port the new moodboard.jsx to components/Moodboard.tsx precisely. The component is used like this — it receives props and is embedded in the app, not used as a standalone page:

```tsx
import Component from "@/components/ui/bento-grid-01"; // only if still needed
// Props: { country, onClose, onToggleWishlist, inWishlist }
```

Do not rebuild from scratch beyond what the new moodboard.jsx specifies. Surgical replacement of Moodboard.tsx only.
