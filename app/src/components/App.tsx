'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Destination, SmartPickerState, GlobeRef } from '../lib/types';
import { filterDestinations } from '../lib/filterUtils';
import ThemeChips from './ThemeChips';
import HoverCard from './HoverCard';
import BottomBar from './BottomBar';
import WishlistDrawer from './WishlistDrawer';
import SmartPicker from './SmartPicker';
import Moodboard from './Moodboard';

const GlobeLoading = () => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 60% 50%, #0a1324 0%, #050912 60%, #020408 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: 48, height: 48,
      border: '1px solid rgba(255,220,170,0.20)',
      borderTopColor: '#ffd100',
      borderRadius: '50%',
      animation: 'globeSpin 1.1s linear infinite',
    }} />
    <style>{`@keyframes globeSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const CultureGlobe = dynamic(() => import('./CultureGlobe'), {
  ssr: false,
  loading: GlobeLoading,
});

const STORAGE_KEY = 'atlas50-wish';
const REGIONS = ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania'];

interface AppProps {
  destinations: Destination[];
}

export default function App({ destinations }: AppProps) {
  const [activeTheme, setActiveTheme] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Destination | null>(null);
  const [hovered, setHovered] = useState<Destination | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  const [picker, setPicker] = useState<SmartPickerState>({
    vibe: '', cost: '', season: '', environment: '', theme: '', groupSize: '',
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist)); }
    catch { /* noop */ }
  }, [wishlist]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const globeRef = useRef<GlobeRef>(null);

  const filtered = useMemo(
    () => filterDestinations(destinations, activeTheme, search, picker),
    [destinations, activeTheme, search, picker]
  );

  const visibleIds = useMemo(() => filtered.map(d => d.id), [filtered]);

  const handleFly = useCallback((dest: Destination) => {
    setSearch('');
    setWishlistOpen(false);
    globeRef.current?.flyTo(dest);
  }, []);

  const handleListClick = useCallback((dest: Destination) => {
    handleFly(dest);
    setTimeout(() => setSelected(dest), 700);
  }, [handleFly]);

  const handleGlobeClick = useCallback((dest: Destination) => {
    handleFly(dest);
    setTimeout(() => setSelected(dest), 700);
  }, [handleFly]);

  const toggleWish = useCallback((id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const surprise = useCallback(() => {
    const pool = filtered.length ? filtered : destinations;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSearch('');
    setWishlistOpen(false);
    globeRef.current?.flyTo(pick);
    setTimeout(() => setSelected(pick), 1200);
  }, [filtered, destinations]);

  const handlePickerChange = useCallback((key: keyof SmartPickerState, value: string) => {
    setPicker(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleMoodboardClose = useCallback(() => {
    setSelected(null);
    globeRef.current?.resume();
  }, []);

  const handleWishlistSelect = useCallback((dest: Destination) => {
    handleFly(dest);
    setWishlistOpen(false);
    setTimeout(() => setSelected(dest), 700);
  }, [handleFly]);

  // Minimum width guard
  if (windowWidth < 1024) {
    return (
      <div style={styles.minWidthGuard}>
        <div style={styles.minWidthInner}>
          <div style={styles.minWidthBrand}>
            Atlas<span style={{ color: '#ffd100' }}>/</span>50
          </div>
          <div style={styles.minWidthMsg}>
            Atlas /50 is designed for desktop.<br />Please open on a larger screen.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Globe canvas layer */}
      <div style={styles.globeWrap}>
        <CultureGlobe
          ref={globeRef}
          destinations={destinations}
          visibleIds={visibleIds}
          onHover={setHovered}
          onClick={handleGlobeClick}
        />
        <div style={styles.vignette} />
      </div>

      {/* Masthead */}
      <header style={styles.masthead}>
        <div style={styles.mastheadLeft}>
          <div style={styles.brand}>
            Atlas<span style={styles.slash}>/</span>50
          </div>
          <div style={styles.issue}>VOL. XXVI · SPRING · 2026</div>
        </div>
        <nav style={styles.nav}>
          <span style={styles.navItem}>— The Index</span>
          <span title="Coming Soon" style={{ ...styles.navItem, ...styles.navItemDim }} aria-disabled="true" role="link">Dispatches</span>
          <span title="Coming Soon" style={{ ...styles.navItem, ...styles.navItemDim }} aria-disabled="true" role="link">Journal</span>
          <span title="Coming Soon" style={{ ...styles.navItem, ...styles.navItemDim }} aria-disabled="true" role="link">Sign In</span>
        </nav>
      </header>

      {/* Left panel */}
      <aside style={styles.leftPanel}>
        <div style={styles.panelHead}>
          <div style={styles.panelLabel}>— The Index</div>
          <div style={styles.panelTitle}>Fifty places,<br />this season.</div>
          <p style={styles.panelIntro}>
            A living atlas of the world&apos;s most extraordinary destinations —
            curated by our editors, illustrated by the light that finds them.
          </p>
        </div>

        <div style={styles.searchRow} role="search">
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: 0.5, flexShrink: 0 }} aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 9.5 L13 13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <input
            id="destination-search"
            style={styles.searchInput}
            placeholder="Search country or region…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search destinations"
            aria-controls="destination-list"
            maxLength={80}
            autoComplete="off"
            spellCheck={false}
          />
          {search && (
            <button
              style={styles.searchClear}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <ThemeChips activeTheme={activeTheme} onChange={setActiveTheme} />

        <div id="destination-list" style={styles.listScroll} aria-live="polite" aria-atomic="false">
          {REGIONS.map(region => {
            const items = filtered.filter(d => d.region === region);
            if (!items.length) return null;
            return (
              <div key={region} style={styles.regionBlock}>
                <div style={styles.regionLabel}>
                  — {region.toUpperCase()} · {String(items.length).padStart(2, '0')}
                </div>
                <ul style={styles.list}>
                  {items.map(dest => {
                    const inWish = wishlist.includes(dest.id);
                    const globalIdx = destinations.indexOf(dest);
                    return (
                      <li
                        key={dest.id}
                        style={styles.listItem}
                        onMouseEnter={() => setHovered(dest)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => handleListClick(dest)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleListClick(dest); } }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${dest.name}`}
                      >
                        <span style={styles.listNum}>{String(globalIdx + 1).padStart(2, '0')}</span>
                        <span style={styles.listName}>{dest.name}</span>
                        <span style={styles.listMeta}>{dest.themes[0]}</span>
                        {inWish && <span style={styles.listWish} aria-label="Saved">✦</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {!filtered.length && (
            <div style={styles.empty}>No destinations match that filter.</div>
          )}
        </div>
      </aside>

      {/* Smart Picker */}
      <SmartPicker picker={picker} onChange={handlePickerChange} filtered={filtered} />

      {/* Hover card — only when no moodboard open */}
      {hovered && !selected && (
        <HoverCard destination={hovered} />
      )}

      {/* Wishlist drawer */}
      {wishlistOpen && (
        <WishlistDrawer
          destinations={destinations}
          wishlist={wishlist}
          onRemove={toggleWish}
          onSelect={handleWishlistSelect}
          onClose={() => setWishlistOpen(false)}
        />
      )}

      {/* Bottom bar */}
      <BottomBar
        total={destinations.length}
        wishlistCount={wishlist.length}
        onSurprise={surprise}
        onWishlistToggle={() => setWishlistOpen(v => !v)}
        wishlistOpen={wishlistOpen}
      />

      {/* Moodboard takeover */}
      {selected && (
        <Moodboard
          destination={selected}
          isWished={wishlist.includes(selected.id)}
          onToggleWish={toggleWish}
          onClose={handleMoodboardClose}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed', inset: 0, overflow: 'hidden',
    background: 'radial-gradient(ellipse at 60% 50%, #0a1324 0%, #050912 60%, #020408 100%)',
    color: '#f4ecd4',
    fontFamily: 'var(--font-sans)',
  },
  globeWrap: { position: 'absolute', inset: 0 },
  vignette: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 60% 50%, transparent 40%, rgba(0,0,0,0.55) 90%)',
  },

  masthead: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '28px 48px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    zIndex: 5, pointerEvents: 'none',
  },
  mastheadLeft: { pointerEvents: 'auto' },
  brand: {
    fontFamily: 'var(--font-serif)', fontSize: 36,
    color: '#fff', letterSpacing: -0.5, lineHeight: 1,
  },
  slash: { color: '#ffd100', margin: '0 2px' },
  issue: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: 'rgba(255,220,170,0.55)', marginTop: 8,
  },
  nav: { display: 'flex', gap: 36, pointerEvents: 'auto' },
  navItem: {
    fontSize: 12, letterSpacing: '0.15em',
    color: 'rgba(255,240,220,0.70)',
    textTransform: 'uppercase', cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  navItemDim: {
    color: 'rgba(255,240,220,0.48)',
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },

  leftPanel: {
    position: 'absolute', top: 130, left: 48, bottom: 100, width: 360,
    display: 'flex', flexDirection: 'column', zIndex: 4,
    pointerEvents: 'auto',
  },
  panelHead: { marginBottom: 22 },
  panelLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: '#ffd100', marginBottom: 10,
  },
  panelTitle: {
    fontFamily: 'var(--font-serif)', fontSize: 42,
    color: '#fff', lineHeight: 1.02, letterSpacing: -0.5,
  },
  panelIntro: {
    fontSize: 13, lineHeight: 1.6,
    color: 'rgba(255,240,220,0.60)',
    margin: '14px 0 0', maxWidth: 320,
    fontFamily: 'var(--font-sans)',
  },

  searchRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: 'rgba(255,240,220,0.04)',
    border: '1px solid rgba(255,220,170,0.15)',
    color: '#f4ecd4', marginBottom: 14,
  },
  searchInput: {
    flex: 1, background: 'transparent',
    border: 'none', outline: 'none',
    color: '#f4ecd4', fontSize: 13,
    fontFamily: 'var(--font-sans)',
  },
  searchClear: {
    background: 'transparent', border: 'none',
    color: 'rgba(255,220,170,0.50)', fontSize: 18,
    cursor: 'pointer', padding: '0 2px', lineHeight: 1,
    display: 'flex', alignItems: 'center',
  },

  listScroll: { flex: 1, overflowY: 'auto', paddingRight: 8 },
  regionBlock: { marginBottom: 20 },
  regionLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: 'rgba(255,220,170,0.50)', marginBottom: 6,
  },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: {
    display: 'flex', alignItems: 'baseline', gap: 12,
    padding: '9px 4px',
    borderBottom: '1px solid rgba(255,220,170,0.08)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  listNum: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'rgba(255,220,170,0.45)', minWidth: 22,
  },
  listName: {
    fontFamily: 'var(--font-serif)', fontSize: 18,
    color: '#fff', flex: 1, letterSpacing: -0.2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    minWidth: 0,
  },
  listMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.20em', color: 'rgba(255,220,170,0.40)',
    textTransform: 'uppercase',
  },
  listWish: { color: '#ffd100', fontSize: 11, marginLeft: 4 },
  empty: {
    padding: '24px 0',
    color: 'rgba(255,240,220,0.40)',
    fontSize: 13, fontStyle: 'italic',
    fontFamily: 'var(--font-sans)',
  },

  minWidthGuard: {
    position: 'fixed', inset: 0,
    background: '#050912',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#f4ecd4',
  },
  minWidthInner: { textAlign: 'center', padding: '0 32px' },
  minWidthBrand: {
    fontFamily: 'var(--font-serif)', fontSize: 36,
    color: '#fff', marginBottom: 24,
  },
  minWidthMsg: {
    fontFamily: 'var(--font-sans)', fontSize: 15,
    lineHeight: 1.7, color: 'rgba(255,240,220,0.60)',
  },
};
