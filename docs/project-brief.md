# Atlas /50 — Project Brief

**VOL. XXVI · SPRING · 2026**

---

## The Idea

Atlas /50 is an interactive 3D globe for discovering the world's 50 most extraordinary travel destinations. It is not a booking tool. It is not a search engine. It is a place to arrive without a plan and leave with three destinations you want to dig deeper on.

The globe is the interface. You rotate it, zoom in, hover over glowing hotspots, and click through to full-screen editorial destination cards — each one a mood board, a climate note, a signature dish, a playlist, and five reasons to book the flight. You can filter by theme (beaches, mountains, culture, desert), narrow by vibe and budget and group size using a Smart Picker, or hand control to the globe entirely and hit **Surprise Me**.

The aesthetic is editorial — a travel magazine that happens to be interactive. The issue mark reads *VOL. XXVI · Spring · 2026*. The typeface is DM Serif Display on deep navy. The accent is a single gold. It should feel like something you'd find in a Kinfolk shoot or a National Geographic archive, not in an app store.

---

## The Problem It Solves

Travellers in the inspiration phase — people who know they want to go somewhere interesting in the next few months but haven't committed to a destination — have nowhere beautiful to browse.

Every tool they currently use is search-first. TripAdvisor, Lonely Planet, and Google Travel require you to already know where you want to go. Pinterest and Instagram are visually rich but structurally useless for making a decision. Reddit travel threads are helpful but slow and scattered.

Nothing combines editorial curation, geographic exploration, and mood-based filtering in one experience. Atlas /50 is that missing thing.

---

## Who It's For

**The Mood-First Traveller.** Planning a trip in the next 3–12 months. Knows they want to go somewhere extraordinary, but hasn't committed. Drawn to aesthetics, vibe, and experience type — "adventurous + affordable + mountains" is more useful to them than a country name. Accesses the web on a desktop browser. Uses Pinterest and Instagram for inspiration but finds neither gives them a destination.

They arrive at Atlas /50 without a plan. They leave with 1–3 destinations they want to dig deeper on. That's the entire success metric.

---

## The Experience

1. **Land** — the globe appears immediately, rotating, hotspots glowing
2. **Browse** — drag to rotate, scroll to zoom, hover to see destination names and taglines
3. **Filter** — theme chips narrow the globe to beaches, mountains, culture, etc; the Smart Picker adds six more dimensions (vibe, cost, season, environment, theme, group size)
4. **Click** — a destination detail panel opens: full-screen parallax hero image, editorial blurb, climate stat, signature dish, a diptych, and five experiences to plan around
5. **Save** — heart the destination to add it to your wishlist; view your list from the bottom bar
6. **Explore** — hit Surprise Me to be flown to a random destination from your current filtered set

The globe does not tell you where to book. It tells you where to dream.

---

## What's Being Built (V1)

| Feature | Status |
|---------|--------|
| Interactive 3D globe (Three.js) with 50 hotspot destinations | Building |
| Destination detail panel — parallax mood board, editorial content | Building |
| Theme filter chips (Beaches, Mountains, Culture, Food, Desert, Wildlife, Adventure) | Building |
| Smart Picker — 6 dropdowns (Vibe, Cost, Season, Environment, Theme, Group Size) | Building |
| Surprise Me — random destination from filtered set | Building |
| Wishlist — localStorage, no auth | Building |
| Search by country or region | Building |
| Desktop web only | In scope |
| Static destination data (50 records, JSON file) | Building |
| Vercel deployment | In scope |

---

## What's Not Being Built Yet

- User accounts and sign-in (V2)
- Account-backed wishlist (V2)
- Mobile responsive layout (V1.5)
- Weighted / ML-powered Smart Picker (V1.5)
- Supabase database integration (V1.5)
- Unsplash API with attribution (V1.5)
- Journal / memories tab (V2)
- Dispatches / editorial articles (V2)

---

## The Roadmap

| Phase | Timeline | What Changes |
|-------|----------|-------------|
| **V1 — The Globe** | May 2026 | Desktop web: globe, moodboard, filters, smart picker, wishlist, search, surprise me. Static data. |
| **V1.5 — Mobile + Smarter** | TBD | Mobile responsive layout. Weighted smart picker with scoring. Supabase data layer. Unsplash API with attribution. |
| **V2 — Accounts + Editorial** | TBD | User authentication. Account-backed wishlist. Journal (personal notes + photos per destination). Dispatches (editorial articles). |

---

## The Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Production-grade React; Vercel-native; static export for V1 |
| UI | React 18 + Tailwind CSS | Prototype already in React; Tailwind for utility layout |
| 3D | Three.js | Existing globe prototype; not rebuilding |
| Data | Static JSON | No database needed in V1; zero ops overhead |
| State | React `useState` / `useMemo` + `localStorage` | Simple, zero dependencies |
| Hosting | Vercel | Instant deploys; HTTPS automatic; zero configuration |
| Fonts | Google Fonts (DM Serif Display, Inter, JetBrains Mono) | Already in prototype |

No backend server. No database. No auth. No paid services in V1. Total infrastructure cost: $0.

---

## What Makes It Different

| Dimension | Atlas /50 | Everyone Else |
|-----------|-----------|--------------|
| Starting point | The globe — you explore from geography | A search bar — you need a destination already |
| Design language | Editorial magazine | Utility / booking interface |
| Curation | 50 handpicked destinations, editorially written | Millions of user-generated reviews |
| Discovery mode | Mood-first (vibe, cost, season, group) | Search-first (destination name required) |
| Experience | Browsing for inspiration | Researching a chosen destination |

---

## The 7 Decisions Still Open

These must be resolved before build begins on the affected features.

| # | Decision | Affects |
|---|----------|---------|
| 1 | **Continent shape** — GeoJSON meshes / hand-traced SVG / textured sphere? | Entire globe aesthetic |
| 2 | **Smart Picker tag vocabulary** — confirmed values per dimension? | All 50 destination records + SmartPicker component |
| 3 | **Nav items in V1** — Dispatches/Journal/Sign In: disabled / hidden / "Coming soon"? | Masthead |
| 4 | **Right-column collision** — hover card vs Smart Picker: which takes priority? | Layout |
| 5 | **Unsplash approach** — API (V1.5, needs attribution UI) or manual (V1, needs licensing check)? | Moodboard images |
| 6 | **Deep-link URLs** — `?destination=japan` in V1 or defer to V1.5? | Routing |
| 7 | **Analytics** — Plausible / PostHog / nothing for V1? | `app/layout.tsx` |

---

## Success Looks Like

A person opens Atlas /50 on a Tuesday afternoon with nothing more specific than "I want to go somewhere interesting this autumn." Forty minutes later they've been to Iceland, Peru, and Ethiopia on the globe. They've saved two destinations to their wishlist. They leave knowing exactly where to start digging.

That's it. That's the whole product.

---

*Atlas /50 — John Raj — May 2026 · Confidential*
