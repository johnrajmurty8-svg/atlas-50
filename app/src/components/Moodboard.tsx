'use client';

import { useRef, useEffect, useState } from 'react';
import type { Destination } from '../lib/types';

interface MoodboardProps {
  destination: Destination;
  isWished: boolean;
  onToggleWish: (id: string) => void;
  onClose: () => void;
}

export default function Moodboard({ destination, isWished, onToggleWish, onClose }: MoodboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScroll(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    el.scrollTop = 0;
    setScroll(0);
    return () => el.removeEventListener('scroll', onScroll);
  }, [destination.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const images = destination.images;
  const heroY = -scroll * 0.35;
  const heroScale = 1 + Math.min(scroll, 400) * 0.0008;
  const titleY = -scroll * 0.6;
  const titleOpacity = Math.max(0, 1 - scroll / 400);
  const frameY = -scroll * 0.15;

  return (
    <div style={styles.root}>
      <div style={{ ...styles.frame, transform: `translateY(${frameY * 0.2}px)` }} />

      <button style={styles.closeBtn} onClick={onClose} aria-label="Close moodboard">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button
        style={{ ...styles.wishBtn, color: isWished ? '#ffd100' : 'rgba(255,255,255,0.85)' }}
        onClick={() => onToggleWish(destination.id)}
        aria-label={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3">
          <path d="M7 12.5 L2 7.5 A3 3 0 0 1 7 3 A3 3 0 0 1 12 7.5 Z" />
        </svg>
        <span style={{ marginLeft: 8, letterSpacing: '0.22em', fontSize: 10 }}>
          {isWished ? 'SAVED' : 'SAVE'}
        </span>
      </button>

      <div ref={scrollRef} style={styles.scroll}>
        {/* HERO */}
        <section style={styles.hero}>
          <div style={{
            position: 'absolute', inset: 0,
            transform: `translateY(${heroY}px) scale(${heroScale})`,
            backgroundImage: `url(${images[0]})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(7,15,31,0.35) 0%, rgba(7,15,31,0) 40%, rgba(7,15,31,0.85) 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            transform: `translateY(${titleY}px)`, opacity: titleOpacity,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '0 8vw 12vh',
          }}>
            <div style={styles.issueMark}>— ATLAS /50 · No. {destination.id.slice(0, 3).toUpperCase()} ——</div>
            <div style={styles.region}>{destination.region}</div>
            <h1 style={styles.title}>{destination.name}</h1>
            <div style={styles.tagline}>{destination.tagline}</div>
            <div style={styles.scrollHint}>
              <span>Scroll</span>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M6 2 L6 17 M2 13 L6 17 L10 13" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
        </section>

        {/* BENTO */}
        <section style={styles.bento}>
          <div style={styles.bentoGrid}>
            <div style={{ ...styles.bentoCell, gridColumn: 'span 7', gridRow: 'span 2' }}>
              <div style={styles.sectionLabel}>— THE OPENING</div>
              <p style={styles.pull}>{destination.tagline}</p>
              <p style={styles.body}>{destination.blurb}</p>
            </div>
            <div style={{ ...styles.bentoCell, ...styles.accentCell, gridColumn: 'span 5' }}>
              <div style={styles.sectionLabel}>— CLIMATE</div>
              <div style={styles.bigStat}>{destination.weather.split('·')[0].trim()}</div>
              <div style={styles.subtleStat}>{destination.weather.split('·').slice(1).join('·').trim()}</div>
            </div>
            <div style={{ ...styles.bentoCell, gridColumn: 'span 5' }}>
              <div style={styles.sectionLabel}>— SIGNATURE DISH</div>
              <div style={styles.dish}>{destination.dish}</div>
            </div>
            <div style={styles.themeRow}>
              {destination.themes.map(t => (
                <span key={t} style={styles.themeChip}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* DIPTYCH */}
        <section style={styles.diptychSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionLabelLight}>— PART I</div>
            <div style={styles.sectionTitle}>Landscape &amp; light</div>
          </div>
          <div style={styles.diptych}>
            <div style={{
              ...styles.diptychImg,
              backgroundImage: `url(${images[1]})`,
              transform: `translateY(${Math.max(-40, (scroll - 600) * -0.05)}px)`,
            }} />
            <div style={{
              ...styles.diptychImg,
              backgroundImage: `url(${images[2]})`,
              transform: `translateY(${Math.max(-40, (scroll - 600) * -0.08)}px)`,
            }} />
          </div>
        </section>

        {/* EXPERIENCES */}
        <section style={styles.experiences}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionLabelLight}>— PART II</div>
            <div style={styles.sectionTitle}>Five to plan around</div>
          </div>
          <ol style={styles.expList}>
            {destination.experiences.map((x, i) => (
              <li key={i} style={styles.expItem}>
                <span style={styles.expNum}>{String(i + 1).padStart(2, '0')}</span>
                <span style={styles.expText}>{x}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* FULL-BLEED */}
        <section style={{ ...styles.fullBleed, backgroundImage: `url(${images[3]})` }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(7,15,31,0.2), rgba(7,15,31,0.7))',
          }} />
          <div style={styles.fullBleedCopy}>
            <div style={styles.sectionLabel}>— SOUNDTRACK</div>
            <div style={styles.playlist}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ffd100" strokeWidth="1.2" style={{ marginRight: 10 }}>
                <path d="M5 10.5 V4 L11 3 V9" />
                <circle cx="3.8" cy="10.5" r="1.2" fill="#ffd100" stroke="none" />
                <circle cx="9.8" cy="9" r="1.2" fill="#ffd100" stroke="none" />
              </svg>
              <span>{destination.playlist}</span>
            </div>
          </div>
        </section>

        {/* TRIPTYCH */}
        <section style={styles.triptych}>
          <div style={{ ...styles.triCell, backgroundImage: `url(${images[3]})` }} />
          <div style={{ ...styles.triCell, backgroundImage: `url(${images[4]})` }} />
          <div style={{ ...styles.triCell, backgroundImage: `url(${images[5] || images[0]})` }} />
        </section>

        {/* FOOTER */}
        <section style={styles.footer}>
          <div style={styles.footerRule} />
          <div style={styles.footerRow}>
            <div>
              <div style={styles.sectionLabelLight}>— DISPATCH</div>
              <div style={styles.footerTitle}>Still dreaming?</div>
              <div style={styles.footerBody}>
                Save {destination.name} to your wishlist, or spin the globe and find another horizon.
              </div>
            </div>
            <div style={styles.footerActions}>
              <button style={styles.primaryBtn} onClick={() => onToggleWish(destination.id)}>
                {isWished ? '— SAVED TO WISHLIST' : '+ SAVE TO WISHLIST'}
              </button>
              <button style={styles.ghostBtn} onClick={onClose}>
                ← Back to the globe
              </button>
            </div>
          </div>
          <div style={styles.colophon}>
            Atlas /50 · an editorial compilation · images: unsplash · © MMXXVI
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: '#070f1f', color: '#f4ecd4',
    fontFamily: 'var(--font-sans)',
  },
  frame: {
    position: 'absolute', inset: 14,
    border: '3px solid #ffd100',
    pointerEvents: 'none', zIndex: 5,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
  },
  closeBtn: {
    position: 'absolute', top: 36, right: 36,
    width: 44, height: 44,
    background: 'rgba(7,15,31,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', cursor: 'pointer', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  wishBtn: {
    position: 'absolute', top: 36, right: 92,
    padding: '0 18px', height: 44,
    background: 'rgba(7,15,31,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    fontFamily: 'var(--font-mono)',
  },
  scroll: {
    position: 'absolute', inset: 0,
    overflowY: 'auto', overflowX: 'hidden',
    scrollBehavior: 'smooth',
  },
  hero: { position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' },
  issueMark: {
    fontFamily: 'var(--font-mono)', fontSize: 11,
    letterSpacing: '0.3em', color: '#ffd100', marginBottom: 28,
  },
  region: {
    fontFamily: 'var(--font-mono)', fontSize: 11,
    letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)',
    marginBottom: 16, textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(72px, 11vw, 200px)',
    fontWeight: 400, lineHeight: 0.95,
    margin: 0, color: '#fff', letterSpacing: -2,
    textShadow: '0 4px 40px rgba(0,0,0,0.4)',
  },
  tagline: {
    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
    fontSize: 'clamp(18px, 2.2vw, 28px)',
    lineHeight: 1.35, marginTop: 28,
    maxWidth: 720, color: 'rgba(255,240,220,0.92)',
  },
  scrollHint: {
    position: 'absolute', bottom: 40, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: 'rgba(255,255,255,0.5)',
  },
  bento: { padding: '14vh 8vw 8vh', maxWidth: 1400, margin: '0 auto' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 },
  bentoCell: {
    padding: '36px 32px',
    background: 'rgba(255,240,220,0.04)',
    border: '1px solid rgba(255,220,170,0.15)',
    minHeight: 200,
  },
  accentCell: {
    background: 'linear-gradient(135deg, #ffd10011, #ffd10003)',
    border: '1px solid rgba(255,209,0,0.3)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: '#ffd100',
    marginBottom: 20, textTransform: 'uppercase',
  },
  sectionLabelLight: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  sectionHeader: { padding: '8vh 8vw 4vh', maxWidth: 1400, margin: '0 auto' },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(36px, 5vw, 68px)',
    lineHeight: 1.05, color: '#fff', letterSpacing: -0.8,
  },
  pull: {
    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
    fontSize: 'clamp(22px, 2.4vw, 32px)',
    lineHeight: 1.35, color: '#fff', margin: '0 0 20px',
  },
  body: {
    fontSize: 15, lineHeight: 1.65,
    color: 'rgba(255,240,220,0.72)',
    margin: 0, maxWidth: 560,
  },
  bigStat: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(36px, 4vw, 56px)',
    color: '#ffd100', lineHeight: 1,
  },
  subtleStat: { fontSize: 14, color: 'rgba(255,240,220,0.7)', marginTop: 10 },
  dish: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(22px, 2.4vw, 32px)',
    lineHeight: 1.2, color: '#fff',
  },
  themeRow: {
    gridColumn: 'span 12',
    display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4,
  },
  themeChip: {
    padding: '7px 14px',
    border: '1px solid rgba(255,209,0,0.4)',
    color: '#ffd100',
    fontFamily: 'var(--font-mono)',
    fontSize: 10, letterSpacing: '0.25em',
    textTransform: 'uppercase',
  },
  diptychSection: { padding: '0 0 6vh' },
  diptych: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 6, padding: '0 4vw',
    maxWidth: 1400, margin: '0 auto',
  },
  diptychImg: {
    height: '70vh',
    backgroundSize: 'cover', backgroundPosition: 'center',
    willChange: 'transform',
  },
  experiences: { padding: '4vh 8vw 10vh', maxWidth: 1200, margin: '0 auto' },
  expList: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 },
  expItem: {
    display: 'flex', alignItems: 'baseline',
    gap: 28, padding: '28px 0',
    borderTop: '1px solid rgba(255,220,170,0.12)',
  },
  expNum: {
    fontFamily: 'var(--font-mono)', fontSize: 13,
    color: '#ffd100', letterSpacing: '0.2em', minWidth: 44,
  },
  expText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(22px, 2.2vw, 32px)',
    lineHeight: 1.25, color: '#fff',
  },
  fullBleed: {
    position: 'relative', height: '80vh', width: '100%',
    backgroundSize: 'cover', backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex', alignItems: 'flex-end',
  },
  fullBleedCopy: { padding: '0 8vw 10vh', position: 'relative', zIndex: 2 },
  playlist: {
    display: 'flex', alignItems: 'center',
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(22px, 2.4vw, 34px)',
    fontStyle: 'italic', color: '#fff',
  },
  triptych: {
    display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr',
    gap: 6, padding: '6vh 4vw',
    maxWidth: 1600, margin: '0 auto',
  },
  triCell: { height: '52vh', backgroundSize: 'cover', backgroundPosition: 'center' },
  footer: { padding: '8vh 8vw 10vh', maxWidth: 1200, margin: '0 auto' },
  footerRule: { height: 1, background: 'rgba(255,220,170,0.2)', marginBottom: 50 },
  footerRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', gap: 60, flexWrap: 'wrap',
  },
  footerTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(34px, 4vw, 56px)',
    color: '#fff', margin: '6px 0 12px', letterSpacing: -0.5,
  },
  footerBody: {
    fontSize: 15, lineHeight: 1.6,
    color: 'rgba(255,240,220,0.65)', maxWidth: 460,
  },
  footerActions: { display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' },
  primaryBtn: {
    padding: '16px 28px',
    background: '#ffd100', color: '#070f1f',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: 11, letterSpacing: '0.3em', cursor: 'pointer',
  },
  ghostBtn: {
    padding: '16px 28px',
    background: 'transparent', color: '#fff',
    border: '1px solid rgba(255,255,255,0.25)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14, cursor: 'pointer',
  },
  colophon: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.3em', color: 'rgba(255,240,220,0.35)',
    marginTop: 50, textAlign: 'center', textTransform: 'uppercase',
  },
};
