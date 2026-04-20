# Atlas /50 — CLAUDE.md

> **READ THIS FIRST, EVERY SESSION.** This file is your persistent context for the Atlas /50 build. Do not skip it. Do not assume you remember previous sessions.

---

## What This Project Is

**Atlas /50** is an interactive 3D globe for discovering the world's 50 most extraordinary travel destinations. Users browse by vibe and mood, not by itinerary. The globe is the hero interaction. The aesthetic is editorial magazine — think Kinfolk crossed with National Geographic cartography.

**One-line pitch:** A living atlas of the world's most extraordinary destinations — curated by editors, illustrated by the light that finds them.

**Owner:** John Raj (solo builder, non-technical PM)
**Stack:** Next.js 14 (App Router) · React 18 · Three.js · Tailwind CSS · Vercel
**Data:** Static JSON (`src/data/destinations.json`) — no database in V1
**Auth:** None in V1
**Target launch:** May 2026

---

## The Prototype (Your Ground Truth)

A complete working HTML prototype exists. **Port it — do not rebuild from scratch.**

The prototype files are in the project knowledge:
- `Atlas_HTML.html` — the compiled single-file prototype (read this to understand the full system)
- `app.jsx` — root app component: state management, layout shell, filters, wishlist, surprise me
- `globe.jsx` — Three.js globe: `CultureGlobe` component with `flyTo()` and `resume()` imperative API
- `moodboard.jsx` — full-screen parallax destination detail panel: `Moodboard` component
- `data.js` — destination data (~35 records populated; needs expansion to 50 + Smart Picker fields)

**The visual output of the prototype is locked.** Your job is to recreate it pixel-perfectly in Next.js/React. Match the visual output; do not copy the prototype's internal structure unless it fits.

---

## Current Project State

### ✅ Exists in prototype (port these)
- `CultureGlobe` — Three.js 3D globe, hotspot dots, flyTo animation, auto-rotate, continent meshes, raycasting hover/click
- `Moodboard` — full-screen parallax panel, bento grid, diptych images, experiences list, wishlist heart toggle
- `App` — root shell, search, theme chip filters, left panel list, bottom bar, wishlist drawer, surprise me
- `data.js` — destination data for ~35 countries with all base fields

### ❌ Does not exist yet (build these)
- `SmartPicker` component — 6 dropdown filters (Vibe, Cost, Weather/Season, Environment, Theme, Group Size)
- Destinations data migration — add `vibe_tags`, `cost_band`, `best_season`, `environment_tags`, `group_size_tags`, `blurb` to all records
- Remaining ~15 destination records to reach full 50
- Next.js project scaffold (App Router, Tailwind config, folder structure)
- `styles/tokens.css` — CSS custom property definitions
- `lib/types.ts` — TypeScript interfaces
- `lib/filterUtils.ts` — pure filter functions
- `lib/globeUtils.ts` — `latLonToVec3` and globe math helpers

---

## Architecture Rules

### Never do these
- Do not rebuild `CultureGlobe` from scratch — port the existing Three.js code
- Do not use `dangerouslySetInnerHTML` anywhere
- Do not put HTML markup in destination data fields (`blurb`, `tagline`) — plain text only
- Do not add `NEXT_PUBLIC_` prefix to any server-side secrets
- Do not use `WidthType.PERCENTAGE` in any table styles
- Do not implement authentication, Supabase, or any database — V1 is static JSON only
- Do not add mobile responsive layouts — V1 is desktop only

### Always do these
- Use `try/catch` around all `localStorage` reads and writes
- Keep the `latLonToVec3` function exactly as it is in the prototype
- Use the locked design tokens (see Design section below) — do not invent new colours
- Clean up Three.js renderer on component unmount (`renderer.dispose()`)
- Import `destinations.json` directly — no `fetch()` calls for static data

---

## Design Tokens (Non-Negotiable)

```css
--color-bg:             #050912;
--color-ocean:          #070f1f;
--color-cream:          #f4ecd4;
--color-accent:         #ffd100;   /* active chips, CTA, hotspot glow, wishlist saved */
--color-cream-60:       rgba(255,240,220,0.60);
--color-cream-45:       rgba(255,220,170,0.45);
--color-cream-25:       rgba(255,220,170,0.25);
--color-cream-15:       rgba(255,220,170,0.15);
--color-cream-08:       rgba(255,220,170,0.08);
--color-overlay-dark:   rgba(7,15,31,0.55);
--color-overlay-heavy:  rgba(7,15,31,0.92);
```

**Fonts:**
- `DM Serif Display` — all headlines, destination names, stat values
- `Inter` — body copy, nav items, search input
- `JetBrains Mono` — all labels, chips, monospaced accents, issue mark

**Border radius: zero everywhere.** Sharp corners only.

---

## Component Map

| Component | File | Source | Status |
|-----------|------|--------|--------|
| `CultureGlobe` | `components/CultureGlobe.tsx` | Port from `globe.jsx` | ❌ To port |
| `Moodboard` | `components/Moodboard.tsx` | Port from `moodboard.jsx` | ❌ To port |
| `App` | `components/App.tsx` | Port from `app.jsx` | ❌ To port |
| `SmartPicker` | `components/SmartPicker.tsx` | New build | ❌ To build |
| `WishlistDrawer` | `components/WishlistDrawer.tsx` | Extract from `app.jsx` | ❌ To extract |
| `HoverCard` | `components/HoverCard.tsx` | Extract from `app.jsx` | ❌ To extract |
| `BottomBar` | `components/BottomBar.tsx` | Extract from `app.jsx` | ❌ To extract |
| `ThemeChips` | `components/ThemeChips.tsx` | Extract from `app.jsx` | ❌ To extract |

---

## Data Model

### Current fields in `data.js` (all 35 records have these):
```typescript
id, name, region, lat, lon, themes[], tagline, weather, dish, playlist, experiences[5], images[6]
```

### Missing fields (must be added before SmartPicker can be built):
```typescript
vibe_tags: string[]       // e.g. ["adventurous", "offbeat"]
cost_band: 1|2|3|4|5      // 1=budget, 5=luxury
best_season: string[]     // e.g. ["spring", "summer"]
environment_tags: string[] // e.g. ["mountains", "coast"]
group_size_tags: string[]  // e.g. ["couple", "friends"]
blurb: string             // 2–3 sentence editorial paragraph for Moodboard bento
country: string           // explicit country field (separate from name)
```

### Tag vocabulary (locked — do not invent new values):
```
vibe_tags:        romantic | adventurous | cultural | social | spiritual | offbeat | luxurious | budget-friendly
best_season:      spring | summer | autumn | winter
environment_tags: mountains | coast | desert | jungle | city | islands | plains | tundra
group_size_tags:  solo | couple | friends | family
themes:           beaches | mountains | culture | food | desert | wildlife | adventure
```

---

## Key Layout Measurements (from prototype)

```
Masthead:          position:absolute, top:0, left:0, right:0, padding:28px 48px, z-index:5
Left panel:        position:absolute, top:130, left:48, bottom:100, width:360px, z-index:4
Smart Picker:      position:absolute, top:~160px, right:48px, width:~220px, z-index:4
Hover card:        position:absolute, right:48, bottom:130, width:320px, z-index:4
Wishlist drawer:   position:absolute, top:100, right:48, width:380px, maxHeight:70vh, z-index:6
Bottom bar:        position:absolute, bottom:32, centred (left:50%, transform:translateX(-50%)), z-index:5
Moodboard:         full-screen overlay, z-index:10
Globe:             full-screen background canvas layer
```

---

## Wishlist Storage

```typescript
// localStorage key
const STORAGE_KEY = 'atlas50-wish';

// Read (always wrap in try/catch)
const [wishlist, setWishlist] = useState<string[]>(() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
});

// Write
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
}, [wishlist]);
```

---

## Globe `flyTo` Implementation

```typescript
// From CultureGlobe imperative API — port exactly
flyTo: (country: Destination) => {
  const phi   = (90 - country.lat) * Math.PI / 180;
  const theta = (country.lon + 180) * Math.PI / 180;
  const targetY = -theta + Math.PI / 2;
  const targetX = Math.PI / 2 - phi;
  stateRef.current.targetRot = { x: targetX, y: targetY };
  stateRef.current.userPaused = true;
}
```

---

## Filter Logic

```typescript
// AND logic across all active dimensions
const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  return destinations.filter(dest => {
    if (activeTheme !== 'all' && !dest.themes.includes(activeTheme)) return false;
    if (q && !dest.name.toLowerCase().includes(q) && !dest.region.toLowerCase().includes(q)) return false;
    if (picker.vibe && !dest.vibe_tags.includes(picker.vibe)) return false;
    if (picker.cost && dest.cost_band !== Number(picker.cost)) return false;
    if (picker.season && !dest.best_season.includes(picker.season)) return false;
    if (picker.environment && !dest.environment_tags.includes(picker.environment)) return false;
    if (picker.theme && !dest.themes.includes(picker.theme)) return false;
    if (picker.groupSize && !dest.group_size_tags.includes(picker.groupSize)) return false;
    return true;
  });
}, [activeTheme, search, picker, destinations]);
```

---

## Surprise Me Logic

```typescript
const surprise = () => {
  const pool = filtered.length ? filtered : destinations;
  const pick  = pool[Math.floor(Math.random() * pool.length)];
  setSearch('');
  setWishlistOpen(false);
  globeRef.current?.flyTo(pick);
  setTimeout(() => setSelected(pick), 1200);
};
```

---

## Resolved Decisions

These were open questions — all are now resolved. Follow them exactly.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Continent shape | **Port exactly from prototype.** Do not change or upgrade the continent geometry in V1. |
| 2 | Unsplash strategy | **Manual image sourcing.** No Unsplash API in V1. All images are manually curated Unsplash URLs. No attribution UI required. |
| 3 | Smart Picker vocabulary | **Use the locked vocabulary in this file** (see Tag Vocabulary section above). Confirmed — do not add or change values. |
| 4 | Analytics | **Plausible.** Add Plausible script to `app/layout.tsx`. Domain TBD — use placeholder until production domain is confirmed. |
| 5 | Production domain | **TBD.** Leave as Vercel default URL (`atlas-50.vercel.app` or similar) until John confirms. |
| 6 | Nav items (Dispatches, Journal, Sign In) | **Visible, non-functional, with "Coming Soon" tooltip on hover.** Style at reduced opacity (rgba(255,240,220,0.35)) to signal unavailability. |
| 7 | Hover card vs Smart Picker collision | **Hover card sits above Smart Picker dropdowns, inside the same right column.** Implementation: Smart Picker panel has two zones — upper zone is the 6 dropdowns (always visible); hover card floats over the lower zone only (bottom:130). Use z-index:5 on hover card so it layers over the Smart Picker when active. If the hover card height pushes into the dropdowns, nudge `bottom` value up until they clear. No hiding of Smart Picker on hover. |

---

## Spec Documents (in Project Knowledge)

| Document | Use for |
|----------|---------|
| `prd.md` | Functional requirements (FR-001–FR-012), acceptance criteria, success metrics |
| `app-flow.md` | Interaction flows, layout zones, edge cases |
| `design.md` | All design tokens, component specs, motion specs |
| `backend-spec.md` | Data models, TypeScript interfaces, folder structure, filter service |
| `security-checklist.md` | Headers config, pre-launch checklist, OWASP coverage |

---

## Session Discipline

- **Start every session by re-reading this file.** Context does not persist between sessions.
- **One component at a time.** Complete and test before moving to the next.
- **Port before building.** `CultureGlobe` and `Moodboard` must be ported and verified before `SmartPicker` or any new component is built.
- **Ask before assuming.** If a spec is ambiguous, flag it — don't invent.
- **No scope creep.** If you find yourself building something not in the spec, stop.
