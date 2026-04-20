# Atlas /50 — Startup Prompts

> **How to use these:** At the start of each Claude Code session, paste the relevant prompt in full. Each prompt is self-contained — it gives Claude Code everything it needs for that session. Work through sessions in order. Do not skip ahead.

---

## Before You Start Any Session

Make sure these are in your Claude Project knowledge base:
- `CLAUDE.md`
- `prd.md`
- `app-flow.md`
- `design.md`
- `backend-spec.md`
- `security-checklist.md`
- `Atlas_HTML.html` (the prototype)
- `app.jsx`, `globe.jsx`, `moodboard.jsx`, `data.js` (prototype source files)

---

---

# SESSION 1 — Project Scaffold + Globe Port

**Paste this at the start of your first Claude Code session.**

```
Read CLAUDE.md in full before doing anything else.

We're building Atlas /50 — an interactive 3D globe travel discovery app. 
The full spec is in prd.md, app-flow.md, design.md, and backend-spec.md.
A complete working HTML prototype exists in Atlas_HTML.html and the 
associated source files (app.jsx, globe.jsx, moodboard.jsx, data.js).

This session has two goals:

GOAL 1 — PROJECT SCAFFOLD
Set up the Next.js 14 project with the exact folder structure from 
backend-spec.md §6. Include:
- app/layout.tsx (Google Fonts import: DM Serif Display, Inter, JetBrains Mono)
- app/page.tsx (renders <App />)
- app/globals.css (background #050912, scrollbar styles, placeholder colour 
  from prototype)
- styles/tokens.css (all CSS custom properties from design.md §2)
- lib/types.ts (full TypeScript interfaces from backend-spec.md §7)
- lib/globeUtils.ts (latLonToVec3 function — copy exactly from globe.jsx)
- lib/filterUtils.ts (pure filter function stub — implement fully in Session 3)
- src/data/destinations.json (migrate all records from data.js exactly as-is; 
  add empty placeholder fields for vibe_tags:[], cost_band:3, best_season:[], 
  environment_tags:[], group_size_tags:[], blurb:"" — to be filled later)
- tailwind.config.js (extend with design tokens)
- .env.local (empty, with comment: "# V1: No environment variables required")
- vercel.json (with security headers from security-checklist.md §4)

GOAL 2 — PORT CULTUREGLOBE
Read globe.jsx in full. Then recreate it as components/CultureGlobe.tsx — 
a TypeScript React component that is functionally identical to the original.
Requirements:
- Same Three.js scene setup (camera FOV 42°, position z:4.0)
- Same continent mesh geometry (do not change the CONTINENTS array or FILLS array)
- Same hotspot placement using latLonToVec3
- Same auto-rotate behaviour (pauses on drag, resumes after idle)
- Same flyTo and resume imperative API via forwardRef
- Same raycasting for hover and click detection
- Props: countries, onHotspotClick, onHotspotHover, autoRotateSpeed, tweaks
- Clean up renderer on unmount (renderer.dispose())
- Export as default

Do not rebuild the globe from scratch. Port the existing code.

After completing both goals, confirm what was built and flag any issues or 
decisions needed before Session 2.
```

---

---

# SESSION 2 — Moodboard + App Shell

**Paste this at the start of your second Claude Code session.**

```
Read CLAUDE.md in full before doing anything else.

Session 1 should have completed: Next.js scaffold + CultureGlobe component.
If either is incomplete or broken, fix those first before proceeding.

This session has two goals:

GOAL 1 — PORT MOODBOARD
Read moodboard.jsx in full. Then recreate it as components/Moodboard.tsx.
Requirements:
- Full-screen overlay (position:fixed, inset:0, z-index:10, overflow-y:scroll)
- Hero section: full-bleed images[0], parallax scroll (heroY = -scroll * 0.35, 
  heroScale = 1 + min(scroll,400) * 0.0008), gradient overlay, destination 
  name (DM Serif Display ~72px), tagline, region, issue mark, scroll hint arrow
- Title fade: opacity = max(0, 1 - scroll/400) with translateY(-scroll * 0.6)
- Bento grid section: editorial blurb cell (gridColumn:'span 7', gridRow:'span 2'), 
  climate cell (span 5, yellow accent background rgba(255,209,0,0.08)), 
  signature dish cell (span 5), theme chip row
- Diptych section: "— PART I: Landscape & light" header, two side-by-side 
  images[1] and images[2] with independent parallax offsets
- Experiences section: "— PART II: Five to plan around" header, ordered list 
  of country.experiences[0..4]
- Close button (top-right, 18×18 SVG ×, white) and Escape key listener
- Wishlist heart toggle button (top-right, beside close): fills #ffd100 when saved, 
  shows "SAVED" / "SAVE" label in JetBrains Mono 10px
- Props: country (Destination), onClose, onToggleWishlist, inWishlist
- Scroll position resets to 0 on each country change (useEffect on country.id)
- All fonts, colours, and sizes exactly from design.md component spec §4.7

GOAL 2 — BUILD APP SHELL
Read app.jsx in full. Port it as components/App.tsx.
This is the root component — it manages all state and renders the full layout.
Required state: activeTheme, search, selected (open destination), hovered, 
wishlist (localStorage), wishlistOpen.
Required layout: globe (full-screen), masthead, left panel (search + chips + 
list), bottom bar, hover card (when hovered), wishlist drawer (when open), 
moodboard overlay (when selected). Use measurements from app-flow.md §4.
Wire up: CultureGlobe + Moodboard + bottom bar + wishlist drawer + hover card.
The SmartPicker panel (right side) should render as a placeholder div for now 
— it will be built in Session 3.
Wishlist stored in localStorage key 'atlas50-wish' with try/catch.
Surprise Me: picks random from filtered set, fires flyTo, opens Moodboard after 
1200ms, clears search, closes wishlist drawer.
Left panel destination list: grouped by region (Europe, Asia, Africa, Americas, 
Oceania), region header format "— EUROPE · 16", items show number / name / 
theme / ✦ if wishlisted. Click: flyTo + open Moodboard after 700ms.

All styling from design.md. All behaviour from app-flow.md. All measurements 
from the prototype source in app.jsx (copy pixel values exactly).

After both goals are complete, run the dev server and confirm:
1. Globe renders and auto-rotates
2. Clicking a hotspot triggers flyTo and opens Moodboard
3. Moodboard parallax scrolls correctly
4. Wishlist saves and loads from localStorage
5. Surprise Me flies to a random destination

Flag any issues before Session 3.
```

---

---

# SESSION 3 — Smart Picker + Filter System

**Paste this at the start of your third Claude Code session.**

```
Read CLAUDE.md in full before doing anything else.

Sessions 1 and 2 should have completed: scaffold, CultureGlobe, Moodboard, 
App shell with theme chips, search, wishlist, and surprise me.
If anything from Sessions 1–2 is broken, fix it first.

This session has two goals:

GOAL 1 — SMART PICKER COMPONENT
Build components/SmartPicker.tsx — the right-panel 6-dropdown filter.
Design: right panel positioned absolute, top:~160px, right:48px, width:~220px.
Structure from the prototype screenshot:
- Header: "Let us help you pick" (JetBrains Mono 10px, cream-60)
- 6 styled <select> dropdowns stacked vertically with 8px gap:
  Vibe | Cost | Weather/Season | Environment | Theme | Group Size
- Each dropdown: full width, background rgba(255,240,220,0.04), 
  border 1px solid rgba(255,220,170,0.15), colour #f4ecd4, 
  JetBrains Mono 10px, no border radius, padding 10px 12px
- "Custom list" label (JetBrains Mono 9px, #ffd100, tracking 0.35em) 
  appears below dropdowns when any dropdown has a value selected
- Dropdown option values must use the locked vocabulary from backend-spec.md §2.2
- Props: value (SmartPickerState), onChange (callback), className?

GOAL 2 — COMPLETE FILTER SYSTEM
Implement lib/filterUtils.ts fully — the pure filter function that combines 
theme chip, search query, and all 6 Smart Picker dimensions using AND logic 
across dimensions (see backend-spec.md §4.4 for the complete implementation).

Wire SmartPicker into App.tsx:
- Add SmartPickerState to App state (all fields default to "")
- Pass picker state and setter to SmartPicker component  
- Include picker state in the filtered useMemo (replace placeholder)
- Globe hotspot visibility: non-matching destinations should fade to opacity 0 
  with a 300ms transition (see design.md §5 motion table)
- "Custom list" in right panel should show filtered destination names when 
  Smart Picker is active (see app-flow.md §4.5)

Test the complete filter chain:
1. Theme chip filters globe + list correctly
2. Smart Picker filters globe + list correctly
3. Theme chip + Smart Picker combination uses AND logic
4. Search + any filter uses AND logic  
5. "Custom list" label and results appear in right panel when Smart Picker active
6. Clearing all filters restores all 50 destinations
7. 0-result state shows empty state message in list

After completing, confirm filter system works end-to-end before Session 4.
```

---

---

# SESSION 4 — Data Expansion + Polish + Launch Prep

**Paste this at the start of your fourth (final V1) Claude Code session.**

```
Read CLAUDE.md in full before doing anything else.

Sessions 1–3 should have completed: scaffold, globe, moodboard, app shell, 
smart picker, full filter system. Everything should be wired and tested.

This session completes the V1 build. Four goals:

GOAL 1 — DESTINATIONS DATA MIGRATION
Open src/data/destinations.json. Every record needs the 5 missing Smart 
Picker fields added: vibe_tags[], cost_band, best_season[], environment_tags[], 
group_size_tags[]. Also add blurb (2–3 sentence editorial paragraph).
Use only the locked vocabulary from backend-spec.md §2.2.
If the remaining ~15 destination records have not been authored yet, add them 
now — each needs all fields including the Smart Picker fields.
All 50 records must be complete before this session ends.
Validate: every record has all required fields; all tag values are from the 
locked vocabulary; no free-text tags.

GOAL 2 — EDGE CASES + HARDENING
Implement all edge cases from app-flow.md §6:
- Image load failure: dark navy fallback (#050912), no broken image icon
- localStorage unavailable: already has try/catch — verify it degrades cleanly
- 0-result filter: empty state message, all hotspots fade
- Surprise Me on 0-result filter: falls back to full 50
- Minimum width warning for viewports < 1024px: friendly message, 
  "Atlas /50 is designed for desktop. Please open on a larger screen."
- Moodboard + Surprise Me interaction: moodboard closes, then new flyTo fires
- WebGL not supported: add a static fallback element behind the canvas

GOAL 3 — SECURITY HEADERS
Add vercel.json with all security headers from security-checklist.md §4:
Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, 
X-XSS-Protection, Referrer-Policy, Permissions-Policy.
Remove unsafe-inline from script-src (not needed in Next.js builds).

GOAL 4 — PRE-LAUNCH CHECKLIST
Run through every item in security-checklist.md §8:
☐ .env.local is in .gitignore
☐ npm audit shows no high/critical vulnerabilities (run it, fix any that appear)
☐ No dangerouslySetInnerHTML anywhere
☐ All image URLs in destinations.json are images.unsplash.com only
☐ Destination blurb and tagline are plain text (no HTML)
☐ localStorage try/catch in place
☐ vercel.json headers configured
☐ All 50 destinations have complete data

When all 4 goals are done, run the full build:
  npm run build

Fix any build errors. Then deploy to Vercel:
  vercel --prod

Confirm the production URL loads, globe renders, and a destination detail 
panel opens correctly.

Atlas /50 V1 is live.
```

---

---

## Supplementary Prompts

### Fix a Bug (use any time)

```
Read CLAUDE.md before starting.

Bug to fix: [describe the bug — what you expected, what actually happened, 
any error messages or console output]

Before touching any code:
1. Identify which component and which file the bug is in
2. Describe what you think is causing it
3. Describe the fix you're going to make
4. Confirm with me before changing anything

After fixing: describe what changed and how to verify the fix.
```

---

### Add a Single Destination Record (use any time)

```
Add a new destination record to src/data/destinations.json.

Destination: [COUNTRY/PLACE NAME]

Follow the exact schema from backend-spec.md §2.1. Every field is required:
id, name, country, region, lat, lon, tagline, blurb, weather, dish, playlist,
experiences (exactly 5), images (4–6 Unsplash URLs at ?w=1600),
themes[], vibe_tags[], cost_band (1–5), best_season[], 
environment_tags[], group_size_tags[].

Use only locked vocabulary from backend-spec.md §2.2 for all tag fields.
The blurb should be 2–3 sentences in an editorial travel magazine voice — 
match the tone of the existing entries.
The tagline should be a single evocative line, max 100 characters.
```

---

### Tag All Destinations for Smart Picker (use before Session 3)

```
Read CLAUDE.md and backend-spec.md §2.2 before starting.

Open src/data/destinations.json. Every destination record is currently 
missing the Smart Picker fields. For each of the 50 records, add:

  vibe_tags: []       — 1–3 values from: romantic | adventurous | cultural | 
                        social | spiritual | offbeat | luxurious | budget-friendly
  cost_band: [1–5]    — 1=budget (<$100/day), 3=mid-range, 5=luxury ($400+/day)
  best_season: []     — 1–3 values from: spring | summer | autumn | winter
  environment_tags: [] — 1–3 values from: mountains | coast | desert | jungle | 
                        city | islands | plains | tundra
  group_size_tags: [] — 1–3 values from: solo | couple | friends | family

Use the existing destination data (weather, themes, tagline, experiences) as 
context to choose appropriate tags — don't guess blindly.

Do not invent new tag values. Use only the locked vocabulary above.

After completing all 50, output a summary table: destination name, cost_band, 
vibe_tags (first 2), environment_tags (first 2) — so I can review quickly.
```

---

### Deploy to Vercel (use after Session 4)

```
Read CLAUDE.md before starting.

Prepare Atlas /50 for production deployment on Vercel.

1. Run npm run build — fix any TypeScript or build errors before proceeding
2. Confirm vercel.json exists with security headers (from security-checklist.md §4)
3. Confirm .env.local is in .gitignore
4. Run npm audit — fix any high or critical vulnerabilities
5. Push to GitHub: git add . && git commit -m "Atlas /50 V1 — production build" && git push
6. Deploy: vercel --prod

After deployment, test the production URL:
- Globe renders and auto-rotates ✓
- Hotspot click opens Moodboard ✓
- Surprise Me works ✓  
- Wishlist saves across page reload ✓
- Theme chip filter works ✓
- Smart Picker filter works ✓

Report the production URL and confirm all 6 checks pass.
```
