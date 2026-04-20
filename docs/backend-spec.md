# Atlas /50 — Backend Specification

---

## 1. Architecture Overview

Atlas /50 V1 is a **fully static, client-rendered application** with no backend server, no database, and no API routes. All data is bundled at build time as a static JSON file. All state is managed client-side in React (with localStorage for wishlist persistence).

**V1 Stack:**
- Next.js 14 (App Router, static export or SSG)
- React 18
- Three.js (globe rendering)
- Tailwind CSS
- Static JSON (destination data)
- localStorage (wishlist)
- Vercel (hosting)

**V1.5 additions** (out of scope now, but schema must be forward-compatible):
- Supabase (PostgreSQL) for destination data
- Unsplash API for images
- Auth (Supabase Auth / NextAuth)

---

## 2. Data Models

### 2.1 Destination

This is the core data object. All 50 destination records live in `src/data/destinations.json`.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `string` | PK, UNIQUE, NOT NULL | URL-safe slug (e.g. `"japan"`, `"costa-rica"`) |
| `name` | `string` | NOT NULL | Display name (e.g. `"Japan"`) |
| `country` | `string` | NOT NULL | Country name (may differ from `name` for city-entries) |
| `region` | `string` | NOT NULL | One of: `"Europe"`, `"Asia"`, `"Africa"`, `"Americas"`, `"Oceania"` |
| `lat` | `number` | NOT NULL | Latitude (decimal degrees, e.g. `35.7`) |
| `lon` | `number` | NOT NULL | Longitude (decimal degrees, e.g. `139.7`) |
| `tagline` | `string` | NOT NULL | One-line editorial hook (max 100 chars) |
| `weather` | `string` | NOT NULL | Format: `"18–28°C · [descriptor]"` |
| `dish` | `string` | NOT NULL | Signature local dish + drink |
| `playlist` | `string` | NOT NULL | Format: `"Artist — Song Title"` |
| `experiences` | `string[]` | NOT NULL, length: 5 | Ordered list of 5 experiences |
| `images` | `string[]` | NOT NULL, length: 4–6 | Unsplash source URLs (`?w=1600`) |
| `themes` | `string[]` | NOT NULL, min 1 | Subset of theme vocabulary (see below) |
| `vibe_tags` | `string[]` | NOT NULL, min 1 | Smart Picker dimension 1 |
| `cost_band` | `number` | NOT NULL, range 1–5 | 1=budget, 5=luxury |
| `best_season` | `string[]` | NOT NULL, min 1 | Smart Picker dimension 3 |
| `environment_tags` | `string[]` | NOT NULL, min 1 | Smart Picker dimension 4 |
| `group_size_tags` | `string[]` | NOT NULL, min 1 | Smart Picker dimension 6 |
| `blurb` | `string` | NOT NULL | 2–3 sentence editorial paragraph for Moodboard bento |

> [⚠️ ATTENTION NEEDED] The current `data.js` prototype file is **missing the Smart Picker fields**: `vibe_tags`, `cost_band`, `best_season`, `environment_tags`, and `group_size_tags`. These must be added to all 50 destination records before the Smart Picker can be built. The `blurb` field is also absent — the prototype uses `tagline` as a placeholder.
>
> Additionally, the current data.js has approximately **35 destination records**. The remaining ~15 must be authored to reach the full Atlas /50 of 50 destinations.

### 2.2 Tag Vocabulary (Smart Picker Schema)

All tag values must be drawn exclusively from the following locked vocabularies. **Do not use free-text tags.**

Tag vocabulary confirmed and locked. Do not add or rename values without re-tagging all destinations.

**Themes (FR-007 chips + theme_tags):**
```
beaches | mountains | culture | food | desert | wildlife | adventure
```

**Vibe tags:**
```
romantic | adventurous | cultural | social | spiritual | offbeat | luxurious | budget-friendly
```

**Cost band:**
```
1 = Budget (under $100/day)
2 = Low-mid ($100–150/day)
3 = Mid-range ($150–250/day)
4 = High ($250–400/day)
5 = Luxury ($400+/day)
```

**Best season:**
```
spring | summer | autumn | winter
```

**Environment tags:**
```
mountains | coast | desert | jungle | city | islands | plains | tundra
```

**Group size tags:**
```
solo | couple | friends | family
```

### 2.3 User Wishlist (localStorage)

Stored client-side only. No server-side model in V1.

| Field | Type | Notes |
|-------|------|-------|
| Key | `"atlas50-wish"` | localStorage key |
| Value | `string[]` | JSON-serialised array of destination `id` strings |

**Example:**
```json
["japan", "iceland", "peru"]
```

### 2.4 App Config (Tweak Defaults)

Stored as a constant in the application. These are the design-time tweakable parameters:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `oceanColor` | `string` | `"#070f1f"` | Globe ocean hex colour |
| `graticule` | `boolean` | `true` | Show/hide grid lines on globe |
| `rotationSpeed` | `number` | `28` | Divided by 1000 to get rad/frame (0.028) |
| `showLabels` | `boolean` | `true` | Show destination labels on hover |
| `haloIntensity` | `number` | `1` | Globe edge glow multiplier |
| `accentColor` | `string` | `"#ffd100"` | Hotspot and UI accent colour |

---

## 3. API Endpoints

**V1 has no API routes.** All data is served as static JSON.

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| — | — | None | V1: static only |

**V1.5 planned endpoints (for reference — do not build now):**

| Route | Method | Description |
|-------|--------|-------------|
| `GET /api/destinations` | GET | Return all destinations from Supabase |
| `GET /api/destinations/[id]` | GET | Single destination by ID |
| `POST /api/wishlist` | POST | Save wishlist to account (auth required) |
| `GET /api/wishlist` | GET | Retrieve account wishlist |

---

## 4. Services

### 4.1 Destination Data Service (V1)

**File:** `src/data/destinations.json`
**Type:** Static JSON imported at build time

Responsibilities:
- Single source of truth for all destination content
- Imported in `app/page.tsx` (or equivalent) and passed down as props
- Client-side `useMemo` performs all filtering (theme, search, Smart Picker)

No API calls in V1. No server component data fetching required.

### 4.2 Wishlist Service (V1)

**File:** Inline in `components/App.tsx`
**Storage:** `localStorage`

```typescript
// Read
const [wishlist, setWishlist] = useState<string[]>(() => {
  try {
    return JSON.parse(localStorage.getItem('atlas50-wish') || '[]');
  } catch {
    return [];
  }
});

// Write (useEffect)
useEffect(() => {
  localStorage.setItem('atlas50-wish', JSON.stringify(wishlist));
}, [wishlist]);

// Toggle
const toggleWish = (id: string) => {
  setWishlist(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
};
```

### 4.3 Globe Service (V1)

**File:** `components/CultureGlobe.tsx`
**Dependencies:** Three.js

Responsibilities:
- Three.js scene, camera, renderer lifecycle (mount/unmount)
- Continent mesh geometry rendering
- Hotspot dot placement via `latLonToVec3(lat, lon, radius)`
- Mouse interaction (raycasting for hover + click detection)
- flyTo animation (tween rotation to face target lat/lon)
- Auto-rotate loop with pause-on-interaction behaviour
- Exposes imperative API via `forwardRef`: `{ flyTo(country), resume() }`

**Key function:**
```typescript
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

### 4.4 Filter Service (V1)

**File:** Inline `useMemo` in `components/App.tsx`

Responsibilities:
- Combines theme chip filter, search query, and Smart Picker selections
- Returns filtered destination array
- Pure function — no side effects

```typescript
const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  return destinations.filter(dest => {
    // Theme chip filter
    if (activeTheme !== 'all' && !dest.themes.includes(activeTheme)) return false;
    // Search filter
    if (q && !dest.name.toLowerCase().includes(q) && !dest.region.toLowerCase().includes(q)) return false;
    // Smart Picker filters
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

## 5. Environment Variables

V1 requires no environment variables (fully static, no external API calls).

> [⚠️ ATTENTION NEEDED] V1.5 will require:

| Variable | Description | Required In |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | V1.5 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | V1.5 |
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key | V1.5 |
| `NEXTAUTH_SECRET` | NextAuth session secret | V2 |
| `NEXTAUTH_URL` | Production URL | V2 |

For V1, create a `.env.local` file with a placeholder comment only:
```bash
# V1: No environment variables required.
# V1.5 additions listed in backend-spec.md §5
```

---

## 6. Folder Structure

```
atlas-50/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata, global styles
│   ├── page.tsx            # Index page — renders <App />
│   └── globals.css         # Global CSS (background, scrollbar, placeholder styles)
├── components/
│   ├── App.tsx             # Root app component — state, layout shell
│   ├── CultureGlobe.tsx    # Three.js globe (ported from prototype)
│   ├── Moodboard.tsx       # Destination detail panel (ported from prototype)
│   ├── SmartPicker.tsx     # Right-panel 6-dropdown filter (new build)
│   ├── WishlistDrawer.tsx  # Wishlist overlay panel
│   ├── HoverCard.tsx       # Hotspot hover tooltip card
│   ├── BottomBar.tsx       # Stats + Surprise Me + Wishlist buttons
│   └── ThemeChips.tsx      # Filter chip row
├── src/
│   └── data/
│       └── destinations.json   # All 50 destination records
├── public/
│   └── fonts/              # Self-hosted fonts (optional — using Google Fonts CDN in V1)
├── styles/
│   └── tokens.css          # CSS custom properties (design tokens)
├── lib/
│   ├── types.ts            # TypeScript interfaces (Destination, WishlistState, etc.)
│   ├── filterUtils.ts      # Pure filter functions
│   └── globeUtils.ts       # latLonToVec3 and globe math helpers
├── .env.local              # Environment variables (empty in V1)
├── next.config.js          # Next.js config (static export settings)
├── tailwind.config.js      # Tailwind config (extend with design tokens)
├── tsconfig.json
└── package.json
```

---

## 7. TypeScript Interfaces

```typescript
// lib/types.ts

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Africa' | 'Americas' | 'Oceania';
  lat: number;
  lon: number;
  tagline: string;
  blurb: string;
  weather: string;
  dish: string;
  playlist: string;
  experiences: [string, string, string, string, string]; // exactly 5
  images: string[]; // 4–6 Unsplash URLs
  themes: ThemeTag[];
  vibe_tags: VibeTag[];
  cost_band: 1 | 2 | 3 | 4 | 5;
  best_season: Season[];
  environment_tags: EnvironmentTag[];
  group_size_tags: GroupSizeTag[];
}

export type ThemeTag = 'beaches' | 'mountains' | 'culture' | 'food' | 'desert' | 'wildlife' | 'adventure';
export type VibeTag = 'romantic' | 'adventurous' | 'cultural' | 'social' | 'spiritual' | 'offbeat' | 'luxurious' | 'budget-friendly';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type EnvironmentTag = 'mountains' | 'coast' | 'desert' | 'jungle' | 'city' | 'islands' | 'plains' | 'tundra';
export type GroupSizeTag = 'solo' | 'couple' | 'friends' | 'family';

export interface SmartPickerState {
  vibe: VibeTag | '';
  cost: string; // "1" | "2" | "3" | "4" | "5" | ""
  season: Season | '';
  environment: EnvironmentTag | '';
  theme: ThemeTag | '';
  groupSize: GroupSizeTag | '';
}

export interface GlobeRef {
  flyTo: (destination: Destination) => void;
  resume: () => void;
}
```

---

## 8. Performance Notes

- **Three.js canvas:** Mount with `useEffect`, clean up renderer on unmount (`renderer.dispose()`). Avoid re-instantiating scene on re-render.
- **Destination list:** 50 items renders fine without virtualisation. Do not add complexity unnecessarily.
- **Image loading:** Unsplash source URLs (`?w=1600`) are large. Consider adding `?w=800&q=80` for thumbnails (wishlist drawer) and `?w=1600&q=85` for Moodboard hero.
- **Static JSON:** Import `destinations.json` directly — no `fetch()` call needed. Next.js bundles it at build time.
