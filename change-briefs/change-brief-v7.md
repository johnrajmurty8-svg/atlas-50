# Change Brief: V7 — Globe Coordinate & FlyTo Math Corrections

**Product:** Atlas /50
**Date:** 2 May 2026
**Version:** V7
**Prepared for:** Claude Code

---

## Summary

V6 attempted to fix two globe bugs but addressed the wrong root causes. The continent texture is east-west mirrored relative to dot positions because the canvas copy operation in `buildTexture()` only translates — it never applies the horizontal mirror that the comment above it describes. The `flyTo()` target rotation has had a sign error since V1 that V6 did not touch: the globe rotates to the antipodal longitude of every destination. This brief replaces both with surgical corrections totalling six lines of code.

---

## What's Changing

### Fix 1 — Continent texture mirror in `CultureGlobe.tsx`

**Where:** `components/CultureGlobe.tsx`, the two `ctx.drawImage` calls inside the `if (worldRef.current)` block (currently lines 173–174).

**Why this is broken:** d3 and Three.js use opposite longitude conventions for an equirectangular canvas:

| Texture x | d3 places | Three.js samples |
|---|---|---|
| 0 | lon = -180 | lon = 0 |
| 512 | lon = -90 | lon = -90 |
| 1024 | lon = 0 | lon = ±180 |
| 1536 | lon = +90 | lon = +90 |
| 2048 | lon = +180 | lon = 0 |

The two conventions intersect only at lon = ±90. Everywhere else d3 paints land at the *negated* longitude relative to what Three.js samples there. To reconcile them, the canvas needs a horizontal mirror around x = 512 (equivalently: `x_main = (1024 - x_tmp) mod 2048`). The comment at the top of the copy block describes exactly this transform. The implementation skips the mirror and only translates, which is why dots land in the ocean opposite their continents.

**Replace:**

```typescript
ctx.drawImage(tmp, -1024, 0);
ctx.drawImage(tmp, 1024, 0);
```

**With:**

```typescript
ctx.save();
ctx.setTransform(-1, 0, 0, 1, 1024, 0);
ctx.drawImage(tmp, 0, 0);
ctx.setTransform(-1, 0, 0, 1, 3072, 0);
ctx.drawImage(tmp, 0, 0);
ctx.restore();
```

This matches the two-pass mirror specified in the comment block immediately above the copy.

### Fix 2 — `flyTo` target Y rotation sign in `CultureGlobe.tsx`

**Where:** `components/CultureGlobe.tsx`, inside `useImperativeHandle`'s `flyTo` method (currently line 48).

**Why this is broken:** Solving for the rotation that brings `latLonToVec3(lat, lon, R)` to the front of the sphere `(0, 0, R)`, working through `R_x(rx) · R_y(ry) · P = (0, 0, R)` with the standard Three.js rotation matrices, yields:

```
ry = theta - π/2     (where theta = (lon + 180) * π / 180)
```

The current code computes `-theta + π/2`, which is the **negation** of the correct value. A negated Y rotation displays the antipodal longitude. flyTo(Tokyo, lon=139.6) sends the camera to lon=-139.6 (mid-Pacific). flyTo(Brazil, lon=-50) sends it to lon=+50 (Saudi Arabia). The two formulas happen to coincide at lon = ±90, which is why the bug was never caught — most ad-hoc testing landed near those longitudes.

**Replace:**

```typescript
const rawTargetY = -theta + Math.PI / 2;
```

**With:**

```typescript
const rawTargetY = theta - Math.PI / 2;
```

The X-axis math (`Math.PI / 2 - phi`) is correct and stays. The shortest-path delta normalisation immediately below (added in V6) is correct and stays — it operates on whatever `rawTargetY` is and continues to work after the sign correction.

---

## What's NOT Changing

- `latLonToVec3` formula in `lib/globeUtils.ts` — locked, do not modify
- The d3 projection parameters: `.scale(2048 / (2 * Math.PI)).translate([1024, 512])` — these are correct, do not change
- The `tmp` canvas drawing pipeline (base fill, hatching, biome bands, coastline) — only the copy from `tmp` to `ctx` changes
- The shortest-path delta normalisation block (lines 52–55) — V6's contribution, retained verbatim
- `flyTo` X-axis computation `Math.PI / 2 - phi` — correct, untouched
- `resume()` API
- `onHotspotClick` handler in `App.tsx` and the 1200ms Moodboard delay — V6's contribution, retained
- `destinations.json` — no coordinate audit needed; the dots have always been at the right 3D positions, the texture was wrong
- Globe geometry, sphere radius, camera position, FOV
- Auto-rotate, halo shader, stars, dot colour and pulse
- All design tokens, fonts, yellow frame
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips`

---

## Design Notes

After both fixes, dragging the globe and clicking dots should feel coherent for the first time: clicking Japan rotates eastward to Japan, the Tokyo dot sits on Japan's east coast, the Galapagos dot sits in the eastern Pacific west of Ecuador, and so on. No animation timing changes; no visual style changes.

---

## Affected Documents

- [ ] PRD — No change
- [ ] App Flow — No change
- [ ] UI Guide — No change
- [ ] Backend Spec — No change
- [ ] Security Checklist — No change

---

## Test Checklist

- [ ] Each destination dot sits visibly on land (not over ocean) — sanity-check Tokyo, London, Sydney, New York, Cairo, Rio
- [ ] Click "Japan" in the country list — globe rotates east and centres Japan; the Japan dot is on Japan
- [ ] Click "Brazil" in the list — globe rotates west; the Brazil dot is on Brazil
- [ ] Click "Iceland" — globe rotates to the North Atlantic; dot is on Iceland
- [ ] Click a dot directly on the globe — it animates to centre that dot, then opens the Moodboard ~1.2s later (V6 behaviour preserved)
- [ ] Surprise Me — globe rotates to the picked destination, dot is centred
- [ ] After heavy manual dragging, fly to any destination — short path, lands in the right place (V6 shortest-path math preserved)
- [ ] Regression: drag, zoom, auto-rotate, halo, stars, dot pulse all unchanged
- [ ] Regression: Moodboard opens and closes correctly; wishlist toggles work

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v7.md` and `change-log.md` in this project folder.

This is a V7 update. It supersedes V6's claimed fixes for the same two bugs — V6 addressed the wrong root causes and left both bugs in place. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify (expect: only `components/CultureGlobe.tsx`)
2. Show the exact before/after diff for each change
3. Wait for my approval before proceeding

Total diff should be approximately six added lines and three replaced lines. If you find yourself touching `latLonToVec3`, `destinations.json`, the d3 projection parameters, the X-axis flyTo math, or any file other than `CultureGlobe.tsx`, stop and ask.

Do not rebuild from scratch. Surgical edits only.

---
