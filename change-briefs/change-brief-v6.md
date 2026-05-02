# Change Brief: V6 — Globe Coordinate & FlyTo Fixes

**Product:** Atlas /50
**Date:** 2 May 2026
**Version:** V6
**Prepared for:** Claude Code

---

## Summary

Two core globe interaction bugs are blocking the product from feeling navigable. First, hotspot dots appear over ocean rather than on their correct land masses because the texture coordinate system and the 3D sphere coordinate system are misaligned. Second, the `flyTo()` animation fails to spin the globe to the correct destination both when clicking from the country list and when clicking a hotspot dot directly — the list trigger uses flawed rotation math, and the dot trigger bypasses `flyTo()` entirely.

---

## What's Changing

### Bug 1 — Hotspot Dot Placement (CultureGlobe)

The hotspot dots are positioned using `latLonToVec3(lat, lon, R)`, which places them at the mathematically correct spherical coordinate for each destination. The bug is a mismatch between that 3D position and where the continent shapes are drawn on the equirectangular texture canvas.

**Root cause to investigate (in order):**

1. **GeoJSON texture projection alignment** — The `buildTexture()` function uses a `d3.geoEquirectangular` projection to draw continents onto a 2048×1024 canvas. For the dots and land to align, the projection must map `[-180, 180]` longitude exactly to `[0, 2048]` pixels and `[90, -90]` latitude exactly to `[0, 1024]` pixels. Check the projection's `.translate()` and `.scale()` values:
   - Correct: `projection.translate([1024, 512]).scale(2048 / (2 * Math.PI))`
   - Any deviation from these exact values shifts the land relative to the dots.

2. **Destination lat/lon audit** — After confirming the projection is correct, audit every entry in `destinations.json`. Dots appearing over ocean most often mean the stored `lat`/`lon` is wrong for that destination (e.g. off by a degree or two, pointing to a bay or strait instead of the city). Fix any coordinates that don't land clearly on land.

**Fix:**
- Verify and correct the d3 projection parameters in `buildTexture()` so land drawn on the texture is pixel-perfect equirectangular
- Audit all destination `lat`/`lon` values in `destinations.json` and correct any that place the dot over water; use city-centre coordinates for each destination

### Bug 2 — FlyTo Animation (CultureGlobe + App)

There are two separate sub-bugs:

**Sub-bug 2a — Rotation math produces wrong target (list clicks and Surprise Me)**

The `flyTo()` imperative method computes an absolute `targetY`:

```javascript
const targetY = -theta + Math.PI / 2;
```

The animation loop then lerps `group.rotation.y` toward `targetY`. After the user has dragged the globe, `group.rotation.y` accumulates beyond `[-Math.PI, Math.PI]` — it can be any value (e.g. `14.7`). Lerping from `14.7` to `targetY ≈ -1.5` causes the globe to spin backward through 16 radians (nearly 3 full rotations) in the wrong direction before arriving, or to visibly overshoot.

**Fix:** Before setting `targetRot`, normalise the current rotation and compute the shortest-path delta:

```javascript
flyTo(country) {
  const s = stateRef.current;
  if (!s.group) return;

  const phi   = (90 - country.lat) * Math.PI / 180;
  const theta = (country.lon + 180) * Math.PI / 180;

  const rawTargetY = -theta + Math.PI / 2;
  const rawTargetX = Math.PI / 2 - phi;

  // Normalise current rotation to [-PI, PI] range for shortest-path delta
  const currentY = ((s.group.rotation.y % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  const currentX = s.group.rotation.x;

  // Compute shortest angular delta on Y axis
  let deltaY = rawTargetY - currentY;
  if (deltaY >  Math.PI) deltaY -= Math.PI * 2;
  if (deltaY < -Math.PI) deltaY += Math.PI * 2;

  // Set absolute target from current accumulated value + short delta
  s.targetRot = {
    x: rawTargetX,
    y: s.group.rotation.y + deltaY,
  };
  s.userPaused = true;
}
```

**Sub-bug 2b — Dot clicks never call flyTo (App)**

In `App`, the globe is rendered with:

```jsx
onHotspotClick={handleSelect}
```

And `handleSelect` only calls `setSelected(c)` — it never calls `globeRef.current.flyTo(c)`. Clicking a dot opens the Moodboard panel immediately without any globe rotation, even though the globe should animate to centre that destination first.

**Fix:** Change `onHotspotClick` to trigger a fly-then-open sequence, matching the behaviour of list clicks:

```javascript
// Replace handleSelect with this pattern for dot clicks:
onHotspotClick={(c) => {
  if (globeRef.current) globeRef.current.flyTo(c);
  setTimeout(() => setSelected(c), 1200);
}}
```

---

## What's NOT Changing

- `latLonToVec3` formula — locked, do not modify the math
- Globe geometry, sphere radius, camera FOV, camera position Z
- `resume()` API — signature and behaviour unchanged
- Auto-rotate speed, star density, atmospheric halo shader
- Hotspot dot colour (`#ffd100`), dot radius, halo pulse animation
- Graticule line colours and opacity
- All design tokens and font families
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — do not touch
- All other app-level state logic (`wishlist`, `search`, `activeTheme`, `surprise`)
- Yellow viewport frame
- `destinations.json` field schema — only coordinate values change, not structure

---

## Design Notes

When the dot click triggers `flyTo`, there should be a visible 1–1.2 second globe spin before the Moodboard panel opens. The delay (`setTimeout 1200ms`) already exists in the list-click handler — use the same value for dot clicks. Do not open the Moodboard instantly on dot click.

---

## Affected Documents

- [ ] PRD — No change
- [ ] App Flow — Minor note: dot clicks now trigger flyTo before opening Moodboard (§2 interaction flow)
- [ ] UI Guide — No change
- [ ] Backend Spec — Only if lat/lon data corrections are documented
- [ ] Security Checklist — No change

---

## Test Checklist

- [ ] Click "Japan" in the country list — globe visibly rotates to centre Japan (East Asia) before Moodboard opens
- [ ] Click "Brazil" in the list — globe rotates west across the Atlantic to centre South America
- [ ] After manually dragging the globe many times, click any country from the list — globe takes the short path to the destination, not a multi-rotation backward spin
- [ ] Click a hotspot dot directly on the globe — globe animates to centre that dot, then Moodboard opens after ~1.2s delay
- [ ] Surprise Me — globe rotates to a random destination before Moodboard opens
- [ ] Each destination dot sits visibly on land, not over ocean or a coastline
- [ ] Spot-check: Tokyo (35.6, 139.6), London (51.5, -0.1), Sydney (-33.8, 151.2), New York (40.7, -74.0) — all on land
- [ ] Regression: dragging the globe still works after flyTo completes; auto-rotate resumes after calling `resume()`
- [ ] Regression: Moodboard closes correctly; wishlist toggle still functions

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v6.md` and `change-log.md` in this project folder.

This is a V6 update. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
