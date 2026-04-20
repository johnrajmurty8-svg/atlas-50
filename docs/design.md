# Atlas /50 — UI Design Guide (DESIGN.md)

---

## 1. Design Philosophy

Atlas /50 is an editorial travel magazine expressed as an interactive globe. Every design decision must reinforce two qualities: **beautiful** and **curated**. It should feel like a Kinfolk spread crossed with a National Geographic cartographic object — not a travel app.

The locked composition is derived from the existing HTML prototype and hero image. Globe centre-right, editorial left column, vertical smart picker right, footer stats bar. This layout is non-negotiable in V1.

---

## 2. Design Tokens

### 2.1 Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#050912` | Page background |
| `--color-ocean` | `#070f1f` | Globe ocean surface, card backgrounds |
| `--color-cream` | `#f4ecd4` | Primary text, body copy |
| `--color-accent` | `#ffd100` | Active states, CTA, hotspot glow, wishlist saved |
| `--color-cream-60` | `rgba(255,240,220,0.60)` | Secondary text, intro copy |
| `--color-cream-45` | `rgba(255,220,170,0.45)` | Muted labels, metadata |
| `--color-cream-25` | `rgba(255,220,170,0.25)` | Chip borders, subtle dividers |
| `--color-cream-15` | `rgba(255,220,170,0.15)` | Card borders, list dividers, scrollbar |
| `--color-cream-08` | `rgba(255,220,170,0.08)` | List item dividers |
| `--color-overlay-dark` | `rgba(7,15,31,0.55)` | Bottom bar backdrop |
| `--color-overlay-heavy` | `rgba(7,15,31,0.92)` | Wishlist drawer backdrop |
| `--color-overlay-mid` | `rgba(7,15,31,0.75)` | Hover card backdrop |
| `--color-white-85` | `rgba(255,255,255,0.85)` | Wishlist heart button (unsaved) |

**Continent fill colours (globe mesh, 8 continent shapes):**

| Continent | Hex |
|-----------|-----|
| North America | `#d9c79a` |
| South America | `#c9a877` |
| Europe | `#d4bb8a` |
| Africa | `#b89566` |
| Asia | `#c6a877` |
| SE Asia / Oceania | `#b89763` |
| Australia | `#c49a66` |
| Antarctica | `#e8ddc3` |

### 2.2 Typography Scale

| Token | Family | Size | Weight | Letter-spacing | Usage |
|-------|--------|------|--------|----------------|-------|
| `--type-brand` | DM Serif Display | 36px | 400 | −0.5px | Masthead brand "Atlas/50" |
| `--type-hero-title` | DM Serif Display | 42px | 400 | −0.5px | Left panel headline |
| `--type-hover-name` | DM Serif Display | 32px | 400 | −0.3px | Hover card destination name |
| `--type-moodboard-h1` | DM Serif Display | ~72px | 400 | −1px | Moodboard hero title |
| `--type-list-name` | DM Serif Display | 18px | 400 | −0.2px | Destination list items |
| `--type-wish-title` | DM Serif Display | 28px | 400 | 0 | Wishlist drawer title |
| `--type-stat-value` | DM Serif Display | 22px | 400 | 0 | Bottom bar stat values |
| `--type-body` | Inter | 13px | 400 | 0 | Intro copy, search placeholder, body text |
| `--type-label` | JetBrains Mono | 10px | 400 | 0.35em | Section labels, issue mark, region headers |
| `--type-chip` | JetBrains Mono | 9px | 400 | 0.20em | Theme chips, list metadata, Smart Picker |
| `--type-bar-label` | JetBrains Mono | 9px | 400 | 0.30em | Bottom bar labels |
| `--type-nav` | Inter | 12px | 400 | 0.15em | Navigation items (uppercase) |
| `--type-cta` | JetBrains Mono | 11px | 500 | 0.30em | Surprise Me, Wishlist button text |

**Google Fonts import:**
```
DM Serif Display: ital@0;1
Inter: wght@300;400;500;600
JetBrains Mono: wght@400;500
```

### 2.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 6px | Gap between chips |
| `--space-sm` | 10px | Chip padding horizontal |
| `--space-md` | 14px | Search bar margin-bottom, panel internal gaps |
| `--space-lg` | 22px | Panel head margin-bottom, theme row margin |
| `--space-xl` | 28px | Masthead padding top, wishlist padding |
| `--space-2xl` | 48px | Masthead padding left/right, left panel left offset |

### 2.4 Border Radius

Atlas /50 uses **zero border radius** throughout. All cards, buttons, chips, and panels are sharp-cornered rectangles. This is intentional — it reinforces the editorial / print aesthetic.

### 2.5 Shadows & Blur

| Component | Effect |
|-----------|--------|
| Bottom bar | `backdrop-filter: blur(12px)` |
| Hover card | `backdrop-filter: blur(14px)` |
| Wishlist drawer | `backdrop-filter: blur(16px)` |
| Globe halo | Radial glow: amber/gold gradient ring around globe edge |
| Vignette | `radial-gradient(ellipse at 60% 50%, transparent 40%, rgba(0,0,0,0.55) 90%)` |

---

## 3. Breakpoints & Responsive Behaviour

**V1 is desktop-only.** No responsive breakpoints are implemented.

| Breakpoint | Behaviour |
|-----------|-----------|
| ≥ 1280px | Full layout — all panels visible |
| 1024–1279px | [⚠️ ATTENTION NEEDED] Layout may degrade. Test and add warning banner if needed. |
| < 1024px | Show minimum-width warning: "Atlas /50 is designed for desktop. Please open on a larger screen." |

> V1.5 milestone: Full mobile responsive layout. At that point, define breakpoints for left panel collapse, smart picker as bottom sheet, and moodboard as full-screen overlay.

---

## 4. Component Specifications

### 4.1 Globe (CultureGlobe)

| Property | Value |
|----------|-------|
| Camera FOV | 42° |
| Camera position Z | 4.0 |
| Auto-rotate speed | 0.028 rad/frame (28 / 1000) |
| Ocean colour | `#070f1f` (tweakable) |
| Graticule (grid lines) | On (tweakable) |
| Halo intensity | 1 (tweakable) |
| Hotspot dot radius | ~8px rendered |
| Hotspot colour | `#ffd100` |
| Hotspot hover scale | 1.4× |
| Continent fill | See colour palette above |
| Globe position | Centre-right (~55–60% from left edge) |

**Continent shape decision:**

> [⚠️ ATTENTION NEEDED] Three paths available for continent geometry:
> 1. **Real GeoJSON meshes** — most geographically accurate; requires GeoJSON → Three.js ShapeGeometry conversion
> 2. **Hand-traced SVG continents** — most editorial feel; mapped to sphere surface via custom projection
> 3. **Textured world map sphere** — easiest to implement; uses an equirectangular map texture on a SphereGeometry; loses the "paper cutout" aesthetic of the prototype
>
> The current prototype uses simplified polygon approximations (Option 2 spirit, but lower fidelity). **Recommend hand-traced SVG continents for V1** to preserve aesthetic — but this is a decision for John to confirm before build begins. Resolution: Port the continent geometry exactly from the prototype — do not change or upgrade it in V1

### 4.2 Masthead

| Property | Value |
|----------|-------|
| Position | Absolute, top:0, left:0, right:0 |
| Padding | 28px 48px |
| Z-index | 5 |
| Brand text | DM Serif Display 36px, white |
| Slash colour | `#ffd100` |
| Issue line | JetBrains Mono 10px, `rgba(255,220,170,0.55)`, tracking 0.35em |
| Nav items | Inter 12px, `rgba(255,240,220,0.70)`, uppercase, tracking 0.15em |
| Nav gap | 36px |

### 4.3 Left Panel

| Property | Value |
|----------|-------|
| Position | Absolute, top:130, left:48, bottom:100, width:360 |
| Z-index | 4 |
| Panel label | JetBrains Mono 10px, `#ffd100`, tracking 0.35em |
| Panel title | DM Serif Display 42px, white, line-height 1.02 |
| Intro copy | Inter 13px, `rgba(255,240,220,0.60)`, line-height 1.6, max-width 320px |

**Search bar:**
- Background: `rgba(255,240,220,0.04)`
- Border: `1px solid rgba(255,220,170,0.15)`
- Padding: 10px 14px
- No border radius

**Theme chips:**
- Default: `border: 1px solid rgba(255,220,170,0.25)`, transparent bg, `rgba(255,240,220,0.70)` text
- Active: bg `#ffd100`, text `#070f1f`, border `#ffd100`
- Font: JetBrains Mono 9px, tracking 0.20em, uppercase
- Padding: 5px 10px
- No border radius

**Destination list:**
- Region label: JetBrains Mono 10px, tracking 0.35em, `rgba(255,220,170,0.50)`
- Item: flex row, padding 9px 4px, border-bottom `rgba(255,220,170,0.08)`
- Number: JetBrains Mono 10px, `rgba(255,220,170,0.45)`, min-width 22px
- Name: DM Serif Display 18px, white
- Meta: JetBrains Mono 9px, `rgba(255,220,170,0.40)`, uppercase
- Wishlist star: `#ffd100`, ✦ character
- Hover: subtle background transition 0.15s

### 4.4 Bottom Bar

| Property | Value |
|----------|-------|
| Position | Absolute, bottom:32, centred (left:50%, transform:translateX(-50%)) |
| Background | `rgba(7,15,31,0.55)` + `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(255,220,170,0.15)` |
| Padding | 12px 16px |
| Z-index | 5 |
| Item gap | 24px |

**Surprise Me button:**
- Background: `#ffd100`
- Text: `#070f1f`, JetBrains Mono 11px, tracking 0.30em
- Padding: 14px 22px
- No border radius

**Wishlist button:**
- Background: transparent
- Border: `1px solid rgba(255,255,255,0.25)`
- Text: white, JetBrains Mono 11px, tracking 0.30em
- Padding: 14px 22px

### 4.5 Hover Card

| Property | Value |
|----------|-------|
| Position | Absolute, right:48, bottom:130 |
| Width | 320px |
| Z-index | 4 |
| Background | `rgba(7,15,31,0.75)` + blur(14px) |
| Border | `1px solid rgba(255,220,170,0.20)` |
| Pointer events | None (non-interactive) |
| Label | JetBrains Mono 10px, `#ffd100` |
| Name | DM Serif Display 32px, white, line-height 1.05 |
| Tagline | DM Serif Display italic 14px, `rgba(255,240,220,0.75)` |
| Meta | JetBrains Mono 9px, `rgba(255,220,170,0.45)` |

### 4.6 Wishlist Drawer

| Property | Value |
|----------|-------|
| Position | Absolute, top:100, right:48 |
| Width | 380px |
| Max-height | 70vh |
| Background | `rgba(7,15,31,0.92)` + blur(16px) |
| Border | `1px solid rgba(255,220,170,0.20)` |
| Z-index | 6 |
| Title | DM Serif Display 28px, white |
| Thumbnail | 60×48px, background-size cover |

### 4.7 Moodboard (Destination Detail)

| Section | Key Styling |
|---------|-------------|
| Root | Full-screen overlay, z-index 10, `#050912` bg, overflow-y scroll |
| Hero | 100vh height, full-bleed image, gradient overlay `linear-gradient(180deg, rgba(7,15,31,0.35) 0%, rgba(7,15,31,0) 40%, rgba(7,15,31,0.85) 100%)` |
| Issue mark | JetBrains Mono, `rgba(255,220,170,0.60)`, tracking 0.35em |
| Destination name (h1) | DM Serif Display ~72px, white, tracking −1px |
| Tagline | DM Serif Display italic ~22px, `rgba(255,240,220,0.85)` |
| Bento grid | 12-column grid, editorial cell span 7/row 2, climate cell span 5 (accent bg), dish cell span 5 |
| Climate accent cell | Yellow-tinted background (`rgba(255,209,0,0.08)`), `--color-accent` header |
| Section labels | `— THE OPENING`, `— CLIMATE`, `— SIGNATURE DISH`, `— PART I`, `— PART II` |
| Close button | Top-right, 18×18 SVG X, white |
| Heart button | Top-right (beside close), fills `#ffd100` when saved |

---

## 5. Motion & Animation

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Globe flyTo | Tween rotation X and Y | 700–1200ms | Ease-out cubic |
| Globe auto-rotate | Continuous rotation | — | Linear |
| Hotspot hover scale | Scale 1.0 → 1.4 | 150ms | Ease-out |
| Moodboard open | Fade in / slide up | 300ms | Ease-out |
| Moodboard hero parallax | Continuous on scroll | — | Linear |
| Moodboard title fade | Opacity 1 → 0 over 400px scroll | — | Linear |
| Diptych parallax | Independent vertical offset | — | Linear |
| Chip active state | Background colour switch | 150ms | Ease |
| List item hover | Background fade | 150ms | Ease |
| Wishlist drawer open | Appear (no slide animation in V1) | — | — |
| Globe hotspot filter | Opacity 1 → 0 (non-matching) | 300ms | Ease |

---

## 6. Iconography

Atlas /50 uses inline SVG icons only — no icon library.

| Icon | Dimensions | Path |
|------|-----------|------|
| Search | 14×14 | Circle cx:6 cy:6 r:4.5 + diagonal line |
| Close (×) | 18×18 | Two diagonal lines M3,3 L15,15 / M15,3 L3,15 |
| Heart | 14×14 | Custom heart path: `M7 12.5 L2 7.5 A3 3 0 0 1 7 3 A3 3 0 0 1 12 7.5 Z` |
| Heart (small, bottom bar) | 12×12 | Same path scaled |
| Wavy line (Surprise Me) | 12×12 | `M1 6 Q3 1 6 6 T11 6` + circle |
| Scroll arrow | 12×20 | `M6 2 L6 17 M2 13 L6 17 L10 13` |

---

## 7. Design System Notes for Claude Code

### Tailwind Usage
- Use Tailwind for layout utilities, spacing scale, and responsive guards
- Override with inline styles for pixel-exact values from the prototype (matching exact hex colours and positioning)
- Do not use Tailwind's colour system — use CSS custom properties (`var(--color-accent)`) or direct hex values from this guide

### Porting the Prototype
- The prototype uses `style` objects (React inline styles). When porting to Next.js components, convert to Tailwind classes where practical, keeping inline styles only for dynamic/computed values (parallax transforms, scroll-driven opacity)
- Match all measurements exactly to the prototype before any design exploration

### Dark Mode
Not applicable — Atlas /50 is permanently dark. Do not implement a light mode toggle.
