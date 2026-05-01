# Change Brief: V2 — Animated Bento Grid in Moodboard

**Product:** Atlas /50
**Date:** 30 April 2026
**Version:** V2
**Prepared for:** Claude Code

---

## Summary

Replace the static bento grid info section inside the `Moodboard` component with the animated `bento-grid-01` component from 21st.dev (by Awanish Verma). The new grid introduces `framer-motion` entry animations and `lucide-react` icons while preserving all existing Atlas /50 design tokens, data bindings, and the surrounding moodboard scroll structure.

---

## What's Changing

### Dependencies

- Install `framer-motion` via npm (already required by bento-grid-01)
- Install `lucide-react` via npm (already required by bento-grid-01)
- Install the component via: `npx shadcn@latest add https://21st.dev/r/avanishverma4/bento-grid-01`

### Frontend — `components/Moodboard.tsx`

- Replace the existing static bento grid `<section style={styles.bento}>` block with the new animated bento component
- The bento grid must retain its 12-column layout and the same three cells:
  - **Opening cell** (gridColumn: span 7, gridRow: span 2): `— THE OPENING` label + tagline as pull quote + blurb body text + theme chips
  - **Climate cell** (gridColumn: span 5): `— CLIMATE` label + `country.weather` rendered as large yellow `DM Serif Display` stat
  - **Dish cell** (gridColumn: span 5): `— SIGNATURE DISH` label + `country.dish`
- Add `framer-motion` `motion.div` wrappers to each bento cell with `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}`, and staggered `transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}`
- Add a relevant `lucide-react` icon as a subtle decorative accent in the climate cell (e.g. `<Thermometer />`) and dish cell (e.g. `<UtensilsCrossed />`), rendered at 16px, `rgba(255,209,0,0.5)` colour

### Frontend — Component Registration

- If using the shadcn install path, ensure the generated component file at `@/components/ui/bento-grid-01` is wired into `Moodboard.tsx` correctly

---

## What's NOT Changing

- All other moodboard sections: hero, diptych, experiences list, full-bleed soundtrack, triptych, footer — touch nothing
- All data bindings: `country.images`, `country.tagline`, `country.name`, `country.themes`, `country.weather`, `country.dish`, `country.experiences`, `country.playlist` — all must remain wired exactly as before
- All design tokens: `#070f1f` background, `#ffd100` accent, `#f4ecd4` cream text, DM Serif Display / Inter / JetBrains Mono fonts — do not change
- Border radius: zero everywhere — no rounded corners anywhere in the bento cells
- The yellow outer frame (`3px solid #ffd100`, fixed, inset 14px) — do not touch
- The fixed UI elements: close button and wishlist toggle — do not touch
- Scroll parallax behaviour: `heroY`, `heroScale`, `titleY`, `titleOpacity`, diptych `translateY` — do not change
- `CultureGlobe`, `App`, `SmartPicker`, and all other components — do not touch
- `destinations.json` data — do not modify

---

## Design Notes

The bento-grid-01 component uses a dark card aesthetic that maps cleanly onto the existing Atlas /50 bento cells. Apply these overrides when integrating:

- Cell background: `rgba(255,240,220,0.04)` — not the component's default
- Cell border: `1px solid rgba(255,220,170,0.15)` — not the component's default
- Climate cell accent background: `linear-gradient(135deg, #ffd10011, #ffd10003)` with border `1px solid rgba(255,209,0,0.3)`
- All font families must be overridden to Atlas tokens (DM Serif Display, Inter, JetBrains Mono) — the component ships with its own font settings
- Do NOT use the component's default colour palette — remap everything to Atlas tokens
- Animation should feel editorial and unhurried: `duration: 0.5`, stagger `0.1s` per cell

---

## Affected Documents

- [ ] PRD — FR-005 (Moodboard Panel) — acceptance criteria unchanged, animation is additive
- [ ] App Flow — no navigation changes
- [x] UI Guide — §4.7 Moodboard bento grid section — update to note framer-motion animations and lucide-react icon accents
- [ ] Backend Spec — no data changes
- [ ] Security Checklist — no auth/encryption changes

---

## Test Checklist

- [ ] Bento cells animate in on scroll with staggered entry (opacity 0→1, y 24→0)
- [ ] Climate cell renders `country.weather` correctly (e.g. "20–32°C · Dry heat")
- [ ] Theme chips render correctly from `country.themes[]`
- [ ] `country.dish` renders in dish cell with correct serif font
- [ ] Lucide icons appear at 16px, yellow-tinted, in climate and dish cells
- [ ] No border radius appears on any bento cell
- [ ] Yellow frame is unaffected and still visible
- [ ] Close (Escape / × button) still works after change
- [ ] Wishlist toggle still functions and persists to localStorage
- [ ] Switching destinations resets scroll to top and re-triggers animations
- [ ] Regression: hero parallax, diptych parallax, experiences list all unaffected
- [ ] Regression: CultureGlobe, SmartPicker, WishlistDrawer all unaffected

---

## Claude Code Prompt

Paste this into a new Claude Code session:

---

Read `change-brief-v2.md` and `CLAUDE.md` in this project folder.

This is a V2 update to Atlas /50. Make ONLY the changes listed in the brief.

**Before writing any code:**
1. List every file you will modify
2. Describe what you will change in each file
3. Wait for my approval before proceeding

Do not rebuild from scratch. Surgical edits only.
