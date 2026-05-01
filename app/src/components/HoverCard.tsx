'use client';

import type { Destination } from '../lib/types';

interface HoverCardProps {
  destination: Destination;
  x: number;
  y: number;
}

export default function HoverCard({ destination, x, y }: HoverCardProps) {
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    transform: 'translateX(-50%) translateY(calc(-100% - 8px))',
    width: 208,
    zIndex: 5,
    background: 'rgba(7,15,31,0.75)',
    border: '3px solid #ffd100',
    borderRadius: 8,
    boxShadow: '0 8px 40px rgba(0,0,0,0.70), 0 0 24px rgba(255,209,0,0.10)',
    backdropFilter: 'blur(14px)',
    pointerEvents: 'none',
    // Edge-case note: card may clip near top of viewport; left for a future brief
  };

  return (
    <div style={cardStyle} aria-hidden="true">
      <img
        src={destination.images[0]}
        alt=""
        style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', display: 'block', background: '#070f1f', borderRadius: '8px 8px 0 0' }}
        loading="lazy"
      />
      <div style={styles.body}>
        <div style={styles.label}>— {destination.region.toUpperCase()}</div>
        <div style={styles.name}>{destination.name}</div>
        <div style={styles.tagline}>{destination.tagline}</div>
        <div style={styles.meta}>Click to open the dispatch ↗</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    padding: '14px 16px',
  },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 8,
    letterSpacing: '0.35em', color: '#ffd100', marginBottom: 7,
  },
  name: {
    fontFamily: 'var(--font-serif)', fontSize: 21,
    color: '#f4ecd4', lineHeight: 1.05, letterSpacing: -0.2,
  },
  tagline: {
    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
    fontSize: 10, color: 'rgba(255,240,220,0.75)',
    marginTop: 7, lineHeight: 1.4,
  },
  meta: {
    fontFamily: 'var(--font-mono)', fontSize: 7,
    letterSpacing: '0.3em', color: 'rgba(255,220,170,0.45)',
    marginTop: 9,
  },
};
