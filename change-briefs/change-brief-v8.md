# Change Brief: V8 — Cinematic Opening Animation (Location-Aware Globe Reveal)

**Product:** Atlas /50
**Date:** 2 May 2026
**Version:** V8
**Prepared for:** Claude Code

---

## Summary

Add a cinematic opening animation to the homepage. On first page load, the globe begins deeply zoomed in on the user's approximate region and rapidly zooms out to the standard view over ~600ms, after which auto-rotation resumes as normal. Location is detected via timezone — instant, no permission prompt, no network call — with Malaysia (Kuala Lumpur) as the universal fallback.

---

## What's Changing

### Frontend — New helper: `lib/locationUtils.ts`

- New file. Exports a single synchronous function:
  ```typescript
  export function resolveStartingLocation(): { lat: number; lon: number }
  ```
- Reads `Intl.DateTimeFormat().resolvedOptions().timeZone` (returns strings like `"Asia/Kuala_Lumpur"`)
- Looks up the timezone in a static map of ~35 major IANA timezones → city lat/lon
- Three-tier fallback chain:
  1. **Exact timezone match** (e.g. `"Asia/Tokyo"` → Tokyo)
  2. **Regional fallback** by continent prefix: `Asia` → KL, `Europe` → London, `America` → NYC, `Africa` → central Africa, `Australia` → Sydney, `Pacific` → Auckland
  3. **Final fallback:** Kuala Lumpur (lat: 3.14, lon: 101.69)
- Entire body wrapped in `try/catch` — any throw returns Malaysia
- **Pure synchronous function** — no network call, no Geolocation API, no permission prompt, no async

### Frontend — `components/CultureGlobe.tsx`

- New optional prop on `CultureGlobeProps`:
  ```typescript
  startingLocation?: { lat: number; lon: number } | null;
  ```
- New module-level constants at top of file:
  ```typescript
  const INTRO_DURATION_MS = 600;
  const INTRO_START_Z = 1.8;
  const INTRO_END_Z   = 5.0;   // matches existing default camera.position.z
  ```
- New ref to ensure the intro fires only once per session (survives re-mounts):
  ```typescript
  const introPlayedRef = useRef(false);
  ```
- Inside the main `useEffect` mount, after `stateRef.current = { group, camera, ... }` is assigned and **before** `tick()` is called for the first time:
  - If `startingLocation` is provided AND `introPlayedRef.current === false` AND `window.matchMedia('(prefers-reduced-motion: reduce)').matches === false`:
    - Compute initial group rotation using the **same lat/lon → rotation formula already used by `flyTo()`**. **Do not duplicate the formula.** Extract it into a private helper inside the component file (e.g. `function computeGlobeRotation(lat, lon)`) and call it from both `flyTo` and the intro setup.
    - Apply the result directly: `group.rotation.x = targetX; group.rotation.y = targetY` — no tween, no shortest-path normalisation needed because rotation starts at zero on a fresh mount.
    - Set `camera.position.z = INTRO_START_Z` (1.8 — close zoom; the wheel zoom min is 2.4 but that bound only applies to wheel events, so a programmatic write is fine).
    - Set `stateRef.current.userPaused = true` to suppress auto-rotate during the intro.
    - Set local closure variables `introActive = true` and `introStartT = performance.now()`.
  - Otherwise (reduced-motion, no starting location, or already played): mount at default state — auto-rotate runs as today.
- Inside `tick()`, **before** the existing `targetRot` lerp block, add a new branch:
  ```typescript
  if (introActive && s.camera) {
    const elapsed = performance.now() - introStartT;
    const progress = Math.min(elapsed / INTRO_DURATION_MS, 1);
    // Cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    s.camera.position.z = INTRO_START_Z + (INTRO_END_Z - INTRO_START_Z) * eased;
    if (progress >= 1) {
      s.camera.position.z = INTRO_END_Z;
      introActive = false;
      s.userPaused = false;
      introPlayedRef.current = true;
    }
  }
  ```
- The intro tween shares the existing `requestAnimationFrame` loop. Do **not** create a second RAF.

### Frontend — `components/App.tsx`

- Import the new helper:
  ```typescript
  import { resolveStartingLocation } from '../lib/locationUtils';
  ```
- Add component state:
  ```typescript
  const [startingLocation, setStartingLocation] = useState<{ lat: number; lon: number } | null>(null);
  ```
- In a mount-only `useEffect` (or extend the existing `setClientReady` effect), call:
  ```typescript
  setStartingLocation(resolveStartingLocation());
  ```
- Pass to `<CultureGlobe />`:
  ```jsx
  <CultureGlobe
    ...existing props
    startingLocation={startingLocation}
  />
  ```
- The `GlobeLoading` placeholder logic does **not** need to change — `resolveStartingLocation()` is synchronous, so `startingLocation` is non-null on the same render that flips `clientReady` true.

---

## What's NOT Changing

- `latLonToVec3` formula in `lib/globeUtils.ts` — locked
- `flyTo()` math, signature, behaviour — locked. The intro reuses the same lat/lon → rotation formula via the new shared helper; it does not modify `flyTo`'s body.
- `resume()` API — unchanged
- Globe geometry, sphere radius, camera FOV (42°)
- Auto-rotate speed, spin speed slider, `spinSpeedRef` mechanism — auto-rotate simply pauses during the intro and resumes at whatever the slider says when the intro ends
- Wheel zoom range (2.4–6.5) — applies only to wheel events; the intro's programmatic `camera.position.z = 1.8` is intentionally outside this range and is correct
- Texture pipeline (continent fill, hatching, biome bands, coastline, graticule)
- Hotspot dots, halo pulse animation, raycasting hover/click
- Atmospheric halo shader, star/dust particles
- `Moodboard`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — do not touch
- Yellow viewport frame
- All design tokens, fonts
- `destinations.json` — neither schema nor values
- Wishlist localStorage logic, hover card, search, filter logic, Surprise Me, theme chips

---

## Design Notes

- **Duration:** 600ms with cubic ease-out. The user requested "within half a second"; 600ms reads as fast while still allowing the deceleration to feel cinematic. Tunable via `INTRO_DURATION_MS` — drop to 500ms if a snappier feel is preferred.
- **Starting zoom:** `camera.position.z = 1.8` puts the camera ~0.4 units from the globe surface (radius 1.4). At 42° FOV this fills the view with a single country-sized region — exactly the "deeply zoomed in" feel described.
- **Privacy / no permission popup:** Browser Geolocation API is intentionally NOT used. It would trigger a permission popup that interrupts the opening moment. Timezone-based detection is silent and instant. For users in Kuala Lumpur (the build owner) this resolves to Malaysia directly; for any other timezone it lands on a near-region city.
- **Re-mount safety:** The intro is first-mount only, guarded by `introPlayedRef`. If `CultureGlobe` re-mounts (e.g. due to a `destinations` prop change), the intro does not replay.
- **Accessibility:** `prefers-reduced-motion: reduce` users see the standard mounted state with no intro animation.
- **Interaction during intro:** During the 600ms intro, auto-rotate is suppressed but pointer events are still wired up. If a user manages to drag or click during this window, the existing handlers will set `userPaused = true` (already true) and `targetRot = null`. The intro tween only modifies `camera.position.z`, not group rotation, so dragging during intro is safe — it rotates the globe while the camera continues to pull back. This is acceptable.

---

## Affected Documents

- [x] PRD — add FR-013 (or extend FR-001) for the opening animation
- [x] App Flow — §2 opening sequence: globe mounts deeply zoomed on user's region and zooms out to default view over 600ms; auto-rotation resumes after
- [x] UI Guide — §4.1 Globe: intro animation locked at 600ms cubic ease-out, `z` 1.8 → 5.0
- [ ] Backend Spec — no change (no data model or API change)
- [ ] Security Checklist — no change (no auth, no new external network call)

---

## Test Checklist

- [ ] On first load in Kuala Lumpur, the globe starts zoomed on Malaysia and zooms out over ~600ms
- [ ] Spoof browser timezone to `America/New_York` (DevTools → Sensors) — globe starts zoomed on NYC
- [ ] Spoof timezone to `Pacific/Fiji` (not in the lookup table) — falls back to Pacific/Auckland regional default
- [ ] Mock `Intl.DateTimeFormat` to throw — globe starts on Malaysia (final fallback) with no console errors
- [ ] Enable `prefers-reduced-motion: reduce` in the OS — intro is skipped, globe mounts at default state immediately
- [ ] After intro completes, auto-rotate resumes at the current spin slider value
- [ ] After intro, click a destination dot — `flyTo` works correctly, no orientation glitches
- [ ] After intro, drag the globe — drag works normally; rotation accumulates as expected
- [ ] After intro, change spin speed via slider — rotation speed updates in real time
- [ ] Trigger a re-render of `<CultureGlobe />` (e.g. by toggling something that changes its key/props) — intro does NOT replay
- [ ] Camera position is exactly 5.0 immediately after the intro ends (no half-pixel drift from incomplete easing)
- [ ] Regression: Surprise Me, wishlist add/remove, search, theme chips, SmartPicker filters all work normally after intro

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v8.md` and `change-log.md` in this project folder.

This is a V8 update. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify or create
2. Describe what you will change in each file, including:
   - The exact `INTRO_DURATION_MS`, `INTRO_START_Z`, and `INTRO_END_Z` values
   - How you will extract the lat/lon → rotation formula into a shared helper without changing `flyTo()` behaviour
   - How `introPlayedRef` guards against replay on re-mount
   - How the intro tween integrates with the existing `tick()` RAF loop
3. Show me the full `lib/locationUtils.ts` file contents (timezone map and fallback chain)
4. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only. Do not modify `latLonToVec3`, `flyTo` math (the formula stays — just refactored into a shared helper), the texture pipeline, or any unrelated component.

---
