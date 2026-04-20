# Atlas /50 — App Flow & Navigation

---

## 1. Route Map

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `IndexPage` | Hero — full-screen globe, left panel, smart picker, bottom bar |
| `/?destination=[id]` | `IndexPage` + `Moodboard` | Deep-link: opens globe with destination detail panel open |

> **V1 is a single-page application.** All state (active filter, selected destination, wishlist open/closed) lives in React state on the root `IndexPage`. No additional routes in V1.
>
> [⚠️ ATTENTION NEEDED] Deep-linking to a destination via URL parameter (`?destination=japan`) is not implemented in the prototype. Confirm whether this is required for V1 or deferred to V1.5. Resolution: Deferred to V1.5.

---

## 2. Authentication Flow

**V1 has no authentication.** The Sign In nav item in the masthead is present in the prototype but should be visually present as a disabled/greyed state in V1 (not removed, as it is part of the editorial masthead aesthetic).

> [⚠️ ATTENTION NEEDED] Confirm whether nav items (Dispatches, Journal, Sign In) should be: (a) visible but non-functional, (b) hidden, or (c) shown with a "Coming soon" tooltip in V1. Resolution: (c) shown with a "coming soon" tooltip in V1

---

## 3. Onboarding Flow

Atlas /50 has no formal onboarding in V1. The globe auto-rotates on load and is immediately interactive. The editorial left column ("Fifty places, this season.") provides implicit orientation.

**First-visit experience sequence:**
1. Page loads → globe appears, auto-rotating
2. Hotspots glow on globe surface
3. Left panel loads with full list, grouped by region
4. Bottom bar is immediately visible (Destinations: 50 / On Your List: 00 / Surprise Me / Wishlist)
5. No modal, no splash, no tutorial overlay

---

## 4. Main App Layout

### Layout Zones (desktop, 1440px reference)

```
┌─────────────────────────────────────────────────────────────────┐
│  MASTHEAD (z:5) — fixed top, full width                         │
│  Atlas/50    VOL. XXVI · SPRING · 2026    [nav items]           │
├────────────┬────────────────────────────┬───────────────────────┤
│            │                            │                       │
│ LEFT PANEL │    GLOBE (full screen bg)  │  SMART PICKER         │
│ (z:4)      │    Three.js canvas         │  (z:4, right panel)   │
│ top:130    │    auto-rotate             │  top: ~160px          │
│ left:48    │    hotspots                │  right: 48px          │
│ w:360      │                            │  w: ~220px            │
│            │                            │                       │
│  [search]  │        ●  ●               │  Let us help you pick │
│  [chips]   │    ●       ●              │  [Vibe ▼]             │
│  [list]    │         ●   ●             │  [Cost ▼]             │
│            │                            │  [Weather/Season ▼]   │
│            │    HOVER CARD (on hover)   │  [Environment ▼]      │
│            │    right:48, bottom:130    │  [Theme ▼]            │
│            │                            │  [Group Size ▼]       │
│            │                            │  [Custom list]        │
│            │                            │  [filtered results]   │
├────────────┴────────────────────────────┴───────────────────────┤
│  BOTTOM BAR (z:5) — centered, bottom:32                         │
│  DESTINATIONS 50  |  ON YOUR LIST 00  | [SURPRISE ME] [WISHLIST]│
└─────────────────────────────────────────────────────────────────┘
```

> [⚠️ ATTENTION NEEDED] Hover card (right:48, bottom:130) and Smart Picker panel (right:48) occupy the same horizontal column. When a hotspot is hovered, the hover card should either appear above the smart picker or replace it temporarily. Exact z-index / collision behaviour must be resolved during build.

---

## 5. Screen-by-Screen Interaction Flows

### 5.1 Index / Hero (Default State)

**What loads:**
- Three.js globe renders, auto-rotating at 0.028 rad/frame
- All 50 hotspot dots visible (yellow #ffd100)
- Left panel: heading, search bar, theme chips (ALL active), full destination list grouped by region
- Bottom bar: "50" destinations, "00" on list, Surprise Me, Wishlist (0)
- Smart Picker: all dropdowns empty/placeholder state

**What user can do:**
- Drag globe → rotates freely
- Scroll on globe → zoom in/out
- Hover hotspot → hover card appears (right panel)
- Click hotspot → flyTo + Moodboard opens (→ Section 5.3)
- Click theme chip → filter applied (→ Section 5.2)
- Type in search → list and globe filter (→ Section 5.4)
- Select Smart Picker dropdown → filter applied (→ Section 5.5)
- Click Surprise Me → random destination (→ Section 5.6)
- Click Wishlist → drawer opens (→ Section 5.7)

---

### 5.2 Theme Filter Active State

**Trigger:** User clicks a theme chip (e.g. "BEACHES")

**What happens:**
1. Clicked chip renders: background #ffd100, text #070f1f
2. Globe hotspots for non-matching destinations fade to opacity 0
3. Matching hotspots remain visible
4. Left panel list filters to matching destinations only, re-grouped by region
5. Region headers that have 0 matches are hidden
6. Bottom bar still shows total: "50" (total count is static, does not filter)

**What user can do:**
- Click another chip (e.g. "MOUNTAINS") → theme changes to new chip
- Click "ALL" → all hotspots restored, list restored
- Combine with Smart Picker for AND-logic filtering

**Edge case:** If a Smart Picker filter + theme chip combination results in 0 destinations, show empty state: "No destinations match that filter." in the list; all globe hotspots fade out.

---

### 5.3 Destination Detail (Moodboard) Open State

**Trigger:** Hotspot click, list item click, Surprise Me, or wishlist item click

**Sequence:**
1. Globe `flyTo()` fires — globe tweens to face selected destination (700–1200ms)
2. After 700ms delay: `Moodboard` component mounts, covering the full viewport
3. Moodboard scroll starts at top (forced on each open)
4. Escape key or × button closes Moodboard → globe resumes auto-rotation

**Moodboard scroll sections (in order):**

| Section | Content | Parallax |
|---------|---------|----------|
| Hero | Full-bleed image [0], destination name, tagline, region | heroY = scroll × −0.35, scale grows |
| Bento | Editorial blurb, Climate stat (accent), Signature dish | None |
| Part I | "Landscape & light" — diptych images [1] and [2] | Individual vertical parallax |
| Part II | "Five to plan around" — ordered experience list | None |
| Final image | Image [3] or [4] full-width | Mild parallax |

**Actions available in Moodboard:**
- Scroll down → reveals sections with parallax
- Click heart (top-right) → toggles wishlist save; icon fills yellow when saved, label changes SAVE → SAVED
- Press Escape or click × → Moodboard closes, globe resumes

**Issue mark format:** `— ATLAS /50 · No. [ID_PREFIX] ——`

---

### 5.4 Search Active State

**Trigger:** User types in search input

**What happens:**
1. On keypress (no debounce needed for 50 items): filter applies
2. Globe hotspots: only matching destinations remain visible
3. List: filtered to name/region matches (case-insensitive)
4. If combined with theme chip: AND logic (both must match)

**Edge cases:**
- Empty search + theme chip: chip filter applies
- Non-matching search: empty state message, all hotspots fade

**Auto-clear triggers:**
- Surprise Me fires → search clears
- Wishlist drawer item clicked → search clears (`setSearch('')`)

---

### 5.5 Smart Picker Active State

**Trigger:** User selects a value in any of the 6 Smart Picker dropdowns

**Dropdowns and their data dimensions:**

| Dropdown | Data Field | Example Values |
|----------|-----------|----------------|
| Vibe | `vibe_tags[]` | Romantic, Adventurous, Cultural, Offbeat |
| Cost | `cost_band` | Budget (1–2), Mid-range (3), Luxury (4–5) |
| Weather/Season | `best_season[]` | Spring, Summer, Autumn, Winter |
| Environment | `environment_tags[]` | Mountains, Coast, Desert, Jungle, City |
| Theme | `theme_tags[]` | Beaches, Mountains, Culture, Food |
| Group Size | `group_size_tags[]` | Solo, Couple, Friends, Family |

**Filter logic:**
- Multiple dropdowns selected: AND logic (destination must match all)
- Multiple values within same dropdown: OR logic within that dimension
- Compatible with theme chips (additional AND filter)
- "Custom list" label appears above results when any Smart Picker dropdown has a value

**What changes:**
- Globe hotspots: only matching destinations visible
- Smart Picker "Custom list" label activates
- List of matching destinations appears below "Custom list" in right panel (replaces hover card area)

> [⚠️ ATTENTION NEEDED] The Smart Picker result list in the right panel (showing Brazil, Croatia, Singapore etc. as in the prototype screenshot) is a separate display from the left panel list. Confirm whether both panels update simultaneously or if the right panel list is the Smart Picker's exclusive output.

---

### 5.6 Surprise Me Flow

**Trigger:** User clicks SURPRISE ME button

**Sequence:**
1. Active search is cleared (`setSearch('')`)
2. Wishlist drawer closes if open (`setWishlistOpen(false)`)
3. Pick pool: `filtered` destinations if any filter active, else all 50
4. One destination is selected at random: `pool[Math.floor(Math.random() * pool.length)]`
5. Globe `flyTo(pick)` fires immediately
6. After 1200ms: `setSelected(pick)` — Moodboard opens
7. Globe auto-rotation pauses during flyTo, resumes if Moodboard closed

---

### 5.7 Wishlist Drawer

**Trigger:** User clicks WISHLIST (N) button in bottom bar

**What renders:**
- Drawer slides in from right edge (top:100, right:48, w:380, maxHeight:70vh)
- Header: "Your List" (DM Serif 28px) + × close button
- Empty state: italic placeholder if 0 saved destinations
- Each item: 60×48px thumbnail | name (DM Serif 18px) | region · theme (JetBrains Mono) | × remove button

**Actions:**
- Click destination item → `handleFly(c)` + search clears + drawer closes + Moodboard opens after 700ms
- Click × on item → removes from wishlist
- Click × on drawer header → closes drawer
- Click WISHLIST button again → toggles drawer closed

---

## 6. Error & Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Image fails to load (Unsplash URL error) | Fallback: show dark navy (#050912) placeholder. No broken image icon. |
| localStorage unavailable | Wishlist silently degrades — `try/catch` already in prototype. State still works in-session. |
| All filters produce 0 results | Empty state message in list: "No destinations match that filter." All globe hotspots fade. |
| Surprise Me on 0-result filter | Falls back to full pool of 50 |
| Globe WebGL not supported | [⚠️ ATTENTION NEEDED] No fallback defined. Add a static fallback page for non-WebGL browsers. |
| User resizes browser window | [⚠️ ATTENTION NEEDED] V1 is desktop-only. Add a minimum width warning (e.g. < 1024px) with a message: "Atlas /50 is best experienced on a larger screen." |
| Moodboard open + Surprise Me fires | Moodboard closes → new flyTo → new Moodboard opens |
| Hotspot at same lat/lon | No two destinations share exact coordinates in current data.js. Monitor if destinations added. |
