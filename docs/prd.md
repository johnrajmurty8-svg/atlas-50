# Atlas /50 — Product Requirements Document

---

## 1. Document Control

| Field | Value |
|-------|-------|
| Product | Atlas /50 |
| Version | 1.0 — V1 Scope |
| Owner | John Raj |
| Last Updated | May 2026 |
| Status | Draft — Pre-Build |
| Target Launch | May 2026 (soft) |

---

## 2. Problem Statement

Travellers in the inspiration phase of trip planning have no beautiful, low-effort way to browse destinations by feel. They piece together inspiration from review sites, Reddit, and Pinterest — scattered, slow, and editorially uncurated.

Existing tools (TripAdvisor, Lonely Planet, Google Travel) are search-first — they require you to already know where you want to go. Pinterest and Instagram are visual but structurally useless for decision-making. Nothing combines editorial curation, geographic exploration, and mood-based filtering in a single, beautiful experience.

**Atlas /50** solves this by making the globe the interface — browse 50 extraordinary destinations by vibe, not by itinerary. The experience is editorial-first. Users come to be inspired, not to book.

---

## 3. User Personas

### Primary: The Mood-First Traveller
- Planning a trip in the next 3–12 months
- Knows they want to go somewhere interesting, but hasn't committed to a destination
- Inspired by aesthetics, vibe, and experience type (e.g. "adventurous + affordable + mountains")
- Not very technical; accesses via desktop web browser
- Currently uses Pinterest, Reddit travel subreddits, and Instagram for inspiration — none give them a definitive answer

### Secondary Users
None in V1.

---

## 4. Goals & Success Metrics

### North Star
Users arrive with no destination in mind and leave with 1–3 destinations they want to dig deeper on.

### Qualitative Goals
- The experience feels beautiful and editorial — not like a travel booking tool
- The globe is the hero interaction — users touch it before reading anything
- The aesthetic immediately signals: this is curated, not algorithmic

### V1 Quantitative Metrics

| Metric | Target |
|--------|--------|
| Globe interaction rate (rotate/zoom) | > 80% of sessions |
| Destination detail opens per session | ≥ 2 |
| Wishlist saves per session | ≥ 1 |
| Surprise Me usage | > 30% of sessions |
| Bounce rate (< 10s session) | < 25% |

> [⚠️ ATTENTION NEEDED] Analytics tooling (e.g. Plausible, PostHog) has not been selected. Confirm before build to ensure metric tracking is in place at launch. Resolution: Plausible

---

## 5. Functional Requirements

### Epic 1: Globe & Navigation

**FR-001 — 3D Interactive Globe**
- Priority: Must Have
- Description: Render a 3D globe using Three.js, ported directly from the existing HTML prototype (`CultureGlobe` component). Auto-rotates at 0.028 rad/frame. Users can rotate (drag), zoom (scroll), and interact with hotspots.
- Acceptance Criteria:
  - Globe renders on page load within 2s
  - Auto-rotation begins immediately, pauses on user interaction, resumes after 3s idle
  - Hotspots glow as yellow (#ffd100) dots positioned at correct lat/lon coordinates
  - Dragging rotates the globe on X and Y axes
  - Scroll wheel zooms between min and max bounds (no infinite zoom)
  - Port existing continent mesh geometry exactly — do not rebuild from scratch

**FR-002 — Hotspot Hover State**
- Priority: Must Have
- Description: Hovering a hotspot displays a hover card (destination name, tagline, region label, primary theme) in the right panel area.
- Acceptance Criteria:
  - Hover card appears within 150ms of cursor entering hotspot
  - Hover card displays: region label (JetBrains Mono), destination name (DM Serif Display 32px), tagline (italic), primary theme tag
  - Hover card disappears when cursor leaves hotspot

**FR-003 — Hotspot Click / flyTo**
- Priority: Must Have
- Description: Clicking a hotspot triggers a flyTo animation (globe rotates to face that destination) then opens the destination detail panel (Moodboard).
- Acceptance Criteria:
  - Globe tweens to face the clicked destination within 1200ms
  - Moodboard opens after 700ms delay (mid-animation)
  - flyTo also triggered from list item click and Surprise Me

**FR-004 — Hotspot Density Management**
- Priority: Must Have
- Description: Europe and SE Asia will cluster. Hotspots at close proximity must remain individually clickable.
- Acceptance Criteria:
  - Minimum 18px separation between rendered hotspot dots at default zoom
  - Zoom in reveals clustered hotspots individually
  - [⚠️ ATTENTION NEEDED] Specific zoom-level reveal behaviour (e.g. threshold zoom level for cluster expansion) not yet defined. Resolve in App Flow.

### Epic 2: Destination Detail (Moodboard)

**FR-005 — Moodboard Panel**
- Priority: Must Have
- Description: Full-screen parallax takeover displaying destination content. Ported from existing `Moodboard` component.
- Acceptance Criteria:
  - Hero image section with parallax scroll (heroY = scroll × −0.35, heroScale grows with scroll)
  - Title fades out at scroll depth 400px (titleOpacity = max(0, 1 − scroll/400))
  - Bento grid section: editorial blurb (7/12 cols), climate stat (5/12 cols, yellow accent), signature dish (5/12 cols)
  - Diptych section: Part I "Landscape & light" with 2 side-by-side images, individual parallax
  - Experiences section: Part II "Five to plan around" as ordered list
  - Close via Escape key or × button
  - Wishlist toggle (heart icon, fills yellow when saved)

**FR-006 — Destination Data Fields**
- Priority: Must Have
- Description: Each destination renders: name, region, tagline, weather, dish, playlist, experiences[], images[6], themes[]
- Acceptance Criteria:
  - All 50 destinations have complete data before launch
  - [⚠️ ATTENTION NEEDED] Current data.js has ~35 destinations populated. Remaining 15 must be authored before V1. Resolution: remaining 15 built in V1.5
  - Images sourced from Unsplash (manual curation in V1)
  - [⚠️ ATTENTION NEEDED] Unsplash image sourcing strategy (manual vs API) must be decided before build — see Risks. Resolution: unsplash image sourced manually for V1

### Epic 3: Filtering

**FR-007 — Theme Filter Chips**
- Priority: Must Have
- Description: 8 filter chips (All, Beaches, Mountains, Culture, Food, Desert, Wildlife, Adventure). Selecting a chip filters both the globe hotspots and the left-panel list to matching destinations.
- Acceptance Criteria:
  - Active chip renders with yellow background (#ffd100), dark text (#070f1f)
  - Inactive chips have transparent background, cream border (rgba(255,220,170,0.25))
  - Globe hotspots for non-matching destinations fade to invisible (opacity 0)
  - List updates in real-time without page reload
  - "All" chip resets all filters

**FR-008 — Smart Picker**
- Priority: Must Have
- Description: Right-panel stack of 6 dropdown filters: Vibe, Cost, Weather/Season, Environment, Theme, Group Size. Filters visible hotspots by tag intersection. V1 is tag-based only (no weighted scoring).
- Acceptance Criteria:
  - Dropdowns render as styled select elements in right panel
  - Selecting values from multiple dropdowns applies AND logic (intersection)
  - "Custom list" label appears above filtered results when Smart Picker is active
  - Clearing all dropdowns returns to full 50
  - [⚠️ ATTENTION NEEDED] Smart Picker vocabulary (all valid tag values per dimension) must be locked in Backend Spec before building the picker UI. Each destination needs tagging across all 6 dimensions (~300-cell job).

**FR-009 — Search**
- Priority: Must Have
- Description: Text search bar in left panel filters by country name or region.
- Acceptance Criteria:
  - Filter applies on keypress (no submit button)
  - Matches on name and region (case-insensitive)
  - Empty state message shown when no results: "No destinations match that filter."
  - Search clears when Surprise Me fires or wishlist item is clicked

### Epic 4: Wishlist

**FR-010 — Save to Wishlist**
- Priority: Must Have
- Description: Users can save/remove destinations. Wishlist persisted in localStorage.
- Acceptance Criteria:
  - Toggle wishlist from Moodboard (heart button) and wishlist drawer (remove button)
  - localStorage key: `atlas50-wish`, value: array of destination IDs
  - "On Your List" counter in bottom bar updates immediately
  - Saved destinations marked with ✦ in left panel list
  - Wishlist state persists across page reloads

**FR-011 — Wishlist Drawer**
- Priority: Must Have
- Description: Clicking "Wishlist (N)" in bottom bar opens a drawer (top-right) showing saved destinations with thumbnail, name, region, and remove button.
- Acceptance Criteria:
  - Drawer opens/closes by toggling bottom bar button
  - Each item shows: 60×48px thumbnail, name (DM Serif Display 18px), region + theme (JetBrains Mono)
  - Clicking a wishlist item fires flyTo + opens Moodboard
  - Empty state: italic placeholder text

### Epic 5: Surprise Me

**FR-012 — Surprise Me**
- Priority: Must Have
- Description: Button in bottom bar picks a random destination from the current filtered set and flies the globe to it, then opens the Moodboard.
- Acceptance Criteria:
  - If no filter active: picks from all 50
  - If filter active: picks from filtered subset
  - Globe flyTo fires immediately; Moodboard opens after 1200ms
  - Clears search text and closes wishlist drawer before animating

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Initial page load (LCP) | < 3s on broadband |
| NFR-002 | Globe render performance | 60fps on modern desktop Chrome/Safari |
| NFR-003 | Browser support | Chrome 100+, Safari 15+, Firefox 100+ (desktop only, V1) |
| NFR-004 | Accessibility | Keyboard navigation for list and filters; ARIA labels on globe controls |
| NFR-005 | Mobile | Not supported in V1 — desktop web only |
| NFR-006 | Uptime | Vercel-hosted; 99.9% SLA via platform |
| NFR-007 | Image loading | Unsplash images load progressively; no broken-image states |

---

## 7. Scope

### In Scope (V1)
- Interactive 3D globe with 50 hotspots
- Destination detail panel (Moodboard) with parallax
- Theme filter chips
- Smart Picker (6 dropdowns, tag-based)
- Surprise Me
- Wishlist (localStorage)
- Search by country/region
- Desktop web only
- Static JSON destination data
- Vercel deployment

### Out of Scope (V1)
- User accounts / authentication
- Account-backed wishlist (Supabase)
- Mobile responsive layout
- Weighted / ML smart picker
- Journal / memories tab
- Dispatches / editorial articles
- Unsplash API integration (manual images in V1)
- Real GeoJSON continent meshes (TBD — see Risks)

---

## 8. Technical Architecture

### Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS
- **3D:** Three.js (ported from existing prototype)
- **Data:** Static JSON file (destinations.json)
- **State:** React useState / useMemo; localStorage for wishlist
- **Hosting:** Vercel

### Key Components
| Component | Source | Notes |
|-----------|--------|-------|
| `CultureGlobe` | Port from HTML prototype | Three.js scene, hotspots, flyTo |
| `Moodboard` | Port from HTML prototype | Parallax detail panel |
| `App` | Port from HTML prototype | Shell, state, filters |
| `SmartPicker` | New build | 6 dropdown filters (not in prototype) |

### Data Flow
Static `destinations.json` → imported at build time → passed as props to `CultureGlobe` and rendered in left panel list. All filtering is client-side via `useMemo`. localStorage persists wishlist array.

> [⚠️ ATTENTION NEEDED] No API routes required in V1. If CDN image caching or analytics are added, confirm environment variable strategy.

---

## 9. Release Plan

| Milestone | Target | Deliverables |
|-----------|--------|--------------|
| V1 Alpha | April 2026 | Globe render, hotspots, moodboard, theme chips |
| V1 Beta | Early May 2026 | Smart picker, wishlist, search, surprise me, full 50 destinations |
| V1 Launch | May 2026 | Vercel production deploy, domain, all 50 destinations with images |
| V1.5 | TBD | Mobile, weighted smart picker, Supabase, Unsplash API |
| V2 | TBD | Auth, account wishlist, journal, dispatches |

---

## 10. Go / No-Go Criteria

| Criterion | Required for Launch |
|-----------|-------------------|
| All 50 destinations have complete data + images | ✅ Yes |
| Globe renders at 60fps on Chrome/Safari desktop | ✅ Yes |
| Smart Picker filters correctly across all 6 dimensions | ✅ Yes |
| Wishlist persists across page reload | ✅ Yes |
| No broken image states in Moodboard | ✅ Yes |
| Vercel deploy completes without errors | ✅ Yes |
| Image licensing confirmed for all 50 destination images | ✅ Yes |

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Continent shape decision (GeoJSON vs SVG vs textured sphere) | High — affects whole aesthetic | High | Decide in Design Guide before build. Three paths: real GeoJSON meshes (accurate), hand-traced SVG (editorial), textured map sphere (easiest). |
| Smart Picker tagging job | High — picker non-functional without | Medium | Lock vocabulary schema first (backend-spec.md). Tag all 50 destinations before building picker UI. |
| Hotspot density (Europe/SE Asia clustering) | Medium — usability issue | High | Implement zoom-level threshold reveal. Define in App Flow. |
| Unsplash image licensing | High — legal | Low | Either use Unsplash API (with attribution, rate limits) or source with explicit license. Decide before build. |
| Three.js port complexity | Medium — rebuild risk | Low | Port existing CultureGlobe component as-is. Do not rebuild from scratch. |
| Data completeness (15 destinations missing) | High — launch blocker | High | Treat as content milestone on release plan. |

---

## 12. Open Questions

1. **Continent mesh approach:** Which of the three paths (GeoJSON, SVG, textured sphere)? Decision affects the entire visual identity. Resolution: Port the continent geometry exactly from the prototype — do not change or upgrade it in V1.
2. **Unsplash strategy:** API (requires attribution UI, rate limits) or manual (requires license confirmation per image)? Resolution: Manual
3. **Smart Picker vocabulary:** What are the exact allowed values per dimension? Must be locked before tagging and before building the picker UI. Resolution: lock in suggested vocabulary.
4. **Analytics:** What tool? Plausible, PostHog, or none for V1? Resolution: Plausible
5. **Domain:** What is the production domain for Vercel? Resolution: TBD
6. **Nav items (Dispatches, Journal, Sign In):** These appear in the masthead of the prototype but are V2 features. Should they be visible but disabled, or hidden in V1? Resolution: Visible but tagged with coming soon
7. **Hover card position:** Currently right:48, bottom:130. Does this conflict with Smart Picker panel at the same side? Confirm layout in App Flow. Resolution: Decide for me

---

## 13. Appendix — Destination Tag Schema (Draft)

> [⚠️ ATTENTION NEEDED] The following schema is proposed based on the intake form. Values must be confirmed and applied to all 50 destinations before building the Smart Picker.

```
vibe_tags: ["romantic", "adventurous", "cultural", "social", "spiritual", "offbeat", "luxurious", "budget-friendly"]
cost_band: 1–5 (1 = budget, 5 = luxury)
best_season: ["spring", "summer", "autumn", "winter"]
environment_tags: ["mountains", "coast", "desert", "jungle", "city", "islands", "plains"]
theme_tags: ["beaches", "mountains", "culture", "food", "desert", "wildlife", "adventure"]
group_size_tags: ["solo", "couple", "friends", "family"]
```
