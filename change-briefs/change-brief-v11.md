# Change Brief: V11 — Moodboard Bin 2 & Bin 3 Redesign

**Product:** Atlas /50
**Date:** 5 May 2026
**Version:** V11
**Prepared for:** Claude Code

---

## Summary

Two Moodboard bins are being redesigned. Bin 2 (currently a static Themes chip list + Seasonal Swing chart) becomes a 3-card curated list widget — Culture Top 5, Nature Top 5, and Food Top 5 — with manual chevron navigation. Bin 3 (currently a static temperature/weather readout) becomes a 10-item Fun Facts & Quotes widget with automatic timed transitions and manual chevron navigation. Both changes require two new fields in `destinations.json`.

---

## What's Changing

### Frontend — `components/Moodboard.tsx` — Bin 2 (Curated Lists Widget)

- Replace the current static Themes chips + Seasonal Swing chart with a 3-card paginated list widget
- Three cards: **Culture Top 5**, **Nature Top 5**, **Food Top 5**
- Each card displays:
  - Card header label (e.g. `CULTURE · TOP 5`) — JetBrains Mono, uppercase, amber, small
  - A numbered list of 5 entries formatted as `"[Location]: [tagline]"` — e.g. `"Tuscany: Where every hillside tells a story"`
  - Location name in DM Serif Display or bold Inter; tagline in Inter at reduced opacity (0.60)
- Navigation: a single chevron `›` bottom-right of the tile; clicking cycles forward through the 3 cards (wraps); add a `‹` chevron for backwards navigation too
- Card indicator: 3 small square pip dots top-right (or bottom-right beside chevrons), the active one filled amber
- No auto-transition — user navigates manually only
- Card transition: opacity crossfade 0.35s
- Widget renders inside the existing Bin 2 bento tile — no grid layout changes
- Bin 2 tile pinned to fixed height — no bento reflow

### Frontend — `components/Moodboard.tsx` — Bin 3 (Fun Facts & Quotes Widget)

- Replace the current static weather temperature/description readout with a 10-item fun fact/quote carousel
- Each item is a short string (1–2 sentences) from `country.fun_facts[i]`
- Display one fact at a time — large enough to read comfortably, centered vertically in the tile
- Typography: fact text in DM Serif Display italic, cream, moderate font size (~15–17px)
- Above the fact text: a small label `— FILED FROM [country.name.toUpperCase()] —` in JetBrains Mono, amber, very small (8–9px), letter-spaced
- Auto-transition: cycle to the next fact every **5 seconds**, looping back to 0 after item 10
- Timer resets whenever the user manually navigates
- Manual navigation: `‹ ›` chevrons bottom-right of the tile
- Pip indicator: 10 small dots (or a thin progress bar) showing current position — dots preferred, very small
- Transition: fade out / fade in, 0.5s
- Widget renders inside the existing Bin 3 bento tile — no grid layout changes
- Bin 3 tile pinned to fixed height — no bento reflow

### Data — `src/data/destinations.json`

- Add `curated_lists` field to every destination record:
```json
"curated_lists": {
  "culture": [
    { "location": "Tuscany", "tagline": "Where every hillside tells a story" },
    { "location": "Rome", "tagline": "Two thousand years under open sky" },
    { "location": "Venice", "tagline": "A city that defies the logic of land" },
    { "location": "Ravenna", "tagline": "Byzantine mosaics hidden in plain sight" },
    { "location": "Naples", "tagline": "Loud, proud, and magnificently alive" }
  ],
  "nature": [
    { "location": "Dolomites", "tagline": "Peaks that glow rose-gold at dusk" },
    ...
  ],
  "food": [
    { "location": "Bologna", "tagline": "The city that invented Sunday lunch" },
    ...
  ]
}
```
- Add `fun_facts` field to every destination record — array of exactly 10 strings:
```json
"fun_facts": [
  "Italy has more UNESCO World Heritage Sites than any other country on Earth.",
  "The average Italian drinks 14kg of pasta per year — and considers it a light habit.",
  ...
]
```
- Populate both fields for **Italy** first (primary test record); other destinations can use placeholder arrays initially
- Graceful fallback: if `curated_lists` is absent, show a single card with a `—` placeholder; if `fun_facts` is absent or empty, display a default string `"More dispatches coming soon."`

### TypeScript — `lib/types.ts`

- Add `CuratedEntry` interface: `{ location: string; tagline: string }`
- Add `CuratedLists` interface: `{ culture: CuratedEntry[]; nature: CuratedEntry[]; food: CuratedEntry[] }`
- Add optional fields to `Destination` interface: `curated_lists?: CuratedLists` and `fun_facts?: string[]`

---

## What's NOT Changing

- All other Moodboard bins (Bin 1 carousel, Bin 4 location widget, Bin 5 Itinerary, Bin 6 Signature Dish/Gramophone) — touch nothing
- Moodboard props interface `{ country, onClose, onToggleWishlist, inWishlist }` — identical
- Topbar, colophon row, SAVE button, close button — do not touch
- Bento grid layout and tile dimensions — do not reflow anything
- All design tokens: `#070f1f`, `#ffd100`, `#f4ecd4`, DM Serif Display / Inter / JetBrains Mono — do not change
- `CultureGlobe`, `App`, `SmartPicker`, `WishlistDrawer`, `BottomBar`, `ThemeChips` — do not touch
- `latLonToVec3` formula — locked
- `flyTo()`, `resume()` API — locked
- Yellow viewport frame — do not touch
- All existing `destinations.json` field names and types — do not rename or remove anything
- Wishlist localStorage logic — unchanged
- Escape key listener — unchanged

---

## Design Notes

- Bin 2 cards use the same tile background as the rest of the bento (`#070f1f` / `--color-ocean`) — no separate card background needed; the numbered list can use a subtle left-rule accent in amber to anchor each row
- Bin 3 quote display should feel editorial — think pull-quote in a magazine. The fact text sits alone in the tile with generous breathing room; the label above it acts as a dateline
- Both widgets should use the same chevron style as Bin 4 (small `‹ ›`, `rgba(244,236,212,0.45)` at rest, cream on hover, cursor pointer) for visual consistency across the Moodboard
- Pip dots: 4×4px squares (not circles) to stay consistent with Atlas /50's sharp-corners-only rule. Active pip filled `#ffd100`; inactive filled `rgba(255,220,170,0.20)`
- Do not use any external libraries for the transition or animation — CSS opacity transitions only
- All font families inside the widgets must use the Atlas token fonts, not browser defaults

---

## Affected Documents

- [ ] PRD — FR-005 (Moodboard Panel) — update Bin 2 and Bin 3 acceptance criteria
- [ ] App Flow — no navigation changes
- [ ] UI Guide — §4.7 Moodboard: update Bin 2 and Bin 3 specs
- [ ] Backend Spec — §2.1 Destination schema: add `curated_lists` and `fun_facts` fields
- [ ] Security Checklist — no auth/encryption changes

---

## Test Checklist

- [ ] Bin 2: all 3 cards (Culture, Nature, Food) render with 5 entries each for Italy
- [ ] Bin 2: forward and backward chevrons cycle correctly and wrap from card 3 → card 1
- [ ] Bin 2: active pip dot updates correctly on each navigation step
- [ ] Bin 2: location name and tagline are visually distinct (weight/opacity contrast)
- [ ] Bin 2: tile height is fixed — no bento grid reflow when switching cards
- [ ] Bin 3: first fact renders immediately on Moodboard open
- [ ] Bin 3: auto-transition fires every 5s and loops back to fact 1 after fact 10
- [ ] Bin 3: manual chevron navigation works and resets the 5s timer
- [ ] Bin 3: pip/progress indicator updates on each transition
- [ ] Bin 3: tile height is fixed — no bento grid reflow during transitions
- [ ] Graceful fallback: destination with no `curated_lists` field shows placeholder without crashing
- [ ] Graceful fallback: destination with no `fun_facts` field shows default string without crashing
- [ ] Regression: Bins 1, 4, 5, 6 render identically to pre-V11
- [ ] Regression: globe flyTo, wishlist, SmartPicker, Surprise Me all unaffected
- [ ] TypeScript: no new type errors introduced in `lib/types.ts` or `Moodboard.tsx`

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v11.md` and `change-log.md` in this project folder.

This is a V11 update. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.

---
