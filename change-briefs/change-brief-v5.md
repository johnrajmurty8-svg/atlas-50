# Change Brief: V5 — Globe Continent Upgrade (GeoJSON + Biome Texture)

**Product:** Atlas /50
**Date:** 1 May 2026
**Version:** V5
**Prepared for:** Claude Code

---

## Summary

Replace the current simplified polygon approximations in `CultureGlobe` with geographically accurate continent shapes sourced from real GeoJSON data (via `world-atlas`). Continent fills, graticule, halo, hotspot dots, and all existing design tokens remain identical. Add a subtle biome-based colour overlay — using latitude-band clipping — to give land areas a faint topographic character (equatorial green-brown, desert ochre, polar near-white) without any photorealism.

---

## What's Changing

### Globe Component (`globe.jsx` / `CultureGlobe`)

- **Remove** the hardcoded `CONTINENTS` array (8 simplified polygon point arrays, normalised 0..1)
- **Remove** the `FILLS` array (per-continent colour array, no longer needed)
- **Install** two new packages: `d3-geo` and `topojson-client`
- **Add** a static data file: copy `countries-110m.json` from `world-atlas` into `public/data/countries-110m.json`
- **Rewrite the continent-drawing section** inside `buildTexture()` as follows:
  1. Fetch `/data/countries-110m.json` on component mount (async, once)
  2. Convert TopoJSON → GeoJSON using `topojson.feature(world, world.objects.land)` — use the merged `land` object for a clean single landmass shape
  3. Create a `d3.geoEquirectangular()` projection scaled to the 2048×1024 canvas: `scale(2048 / (2 * Math.PI))`, `translate([1024, 512])`
  4. Create a `d3.geoPath(projection, ctx)` path generator using the canvas 2D context directly
  5. Draw base continent fill: `ctx.fillStyle = '#c9b99a'` → `path(land)` → `ctx.fill()`
  6. Apply biome overlay (see Design Notes below)
  7. Draw coastline stroke: `ctx.strokeStyle = 'rgba(255,220,170,0.55)'`, `ctx.lineWidth = 2` → `path(land)` → `ctx.stroke()`
- **Retain** all existing `buildTexture()` logic that is not continent-drawing: bathymetric ocean bands, graticule lines (including stronger equator/tropics lines), the `CanvasTexture` creation, and `tex.anisotropy = 8`

### New Files

- `public/data/countries-110m.json` — TopoJSON world atlas at 110m resolution (copy from `node_modules/world-atlas/`)

### Dependencies

- `npm install d3-geo topojson-client`

---

## What's NOT Changing

- `latLonToVec3` formula — **locked, do not touch**
- `flyTo()` and `resume()` imperative API — **locked, do not touch**
- Globe radius, camera FOV, camera position Z — **locked**
- Auto-rotate speed — **locked**
- Hotspot dot colour (`#ffd100`), radius, hover scale — **locked**
- Graticule line colours and opacity values — **locked**
- Atmospheric halo shader — **locked**
- All design tokens (`--color-ocean`, `--color-cream`, `--color-accent`, all others) — **locked**
- All other components: `App`, `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — **do not touch**
- `destinations.json` — **do not touch**
- Yellow viewport frame — **do not touch**
- `SphereGeometry` resolution (128, 128) — **locked**
- `MeshBasicMaterial` + `CanvasTexture` approach — **keep as-is**

---

## Design Notes

### Biome Overlay — Implementation Spec

After drawing the base continent fill (`#c9b99a`), clip the canvas to the land shape and draw the following lat-band overlays in order. Each band is a full-width canvas rectangle at the appropriate y range. Use low-opacity fills — these are whispers, not blocks of colour.

| Zone | Lat range | Canvas Y range (on 1024px canvas) | Fill colour |
|---|---|---|---|
| Arctic / Antarctic | > 65° N and < 65° S | y: 0–142 and y: 882–1024 | `rgba(230,220,200,0.18)` — lighter, near-white |
| Subarctic / temperate high | 45°–65° N and S | y: 142–256 and y: 768–882 | no overlay (base fill shows through) |
| N Desert belt | 15°–32° N | y: 330–427 | `rgba(195,155,70,0.22)` — sandy ochre |
| Equatorial | 12° S–12° N | y: 444–580 | `rgba(60,50,20,0.15)` — dark warm tint (forest) |
| S Desert belt | 15°–32° S | y: 597–694 | `rgba(195,155,70,0.18)` — sandy ochre (slightly lighter than N) |

Clip sequence:
```javascript
ctx.save();
path(land);     // use the same d3 path generator
ctx.clip();
// draw each band as ctx.fillRect(0, yStart, 2048, height)
ctx.restore();
```

### Tone

The end result should look like a muted, aged cartographic reference globe — not a terrain satellite view. The biome overlays should be barely perceptible at normal viewing distance, adding warmth and geographic suggestion without introducing photorealism or noise.

### Continent Fill Colour

Use `#c9b99a` as the base fill for all land (replaces the per-continent `FILLS` array). This is consistent with the existing cream/parchment palette and sits well against `#070f1f` ocean.

---

## Affected Documents

- [x] UI Guide — §4.1 Globe: update continent shape decision from "hand-traced SVG prototype geometry" to "GeoJSON / d3-geo rendered on canvas texture"
- [ ] PRD — no change
- [ ] App Flow — no change
- [ ] Backend Spec — no change
- [ ] Security Checklist — no change

---

## Test Checklist

- [ ] All hotspot dots still appear at correct lat/lon positions on the globe surface
- [ ] Africa is recognisably Africa — visible horn, Gulf of Guinea indentation, correct southern taper
- [ ] Europe, Asia, Americas, Australia all render with accurate coastlines
- [ ] Biome overlays are visible but subtle — desert bands on Sahara/Arabia, equatorial darkening on Congo/Amazon
- [ ] Graticule lines still render at correct opacity and spacing
- [ ] Halo still visible around globe edge
- [ ] `flyTo()` still animates smoothly to correct destinations
- [ ] Globe auto-rotates as before
- [ ] No console errors on component mount (GeoJSON fetch succeeds)
- [ ] Moodboard, SmartPicker, WishlistDrawer all unaffected — regression check
- [ ] Yellow frame border still visible at viewport edge

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v5.md` and `change-log.md` in this project folder.

This is a V5 update. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
