'use client';

import type { Destination } from '../lib/types';

interface HoverCardProps {
  destination: Destination;
}

export default function HoverCard({ destination }: HoverCardProps) {
  return (
    <div style={styles.card} aria-hidden="true">
      <div style={styles.label}>— {destination.region.toUpperCase()}</div>
      <div style={styles.name}>{destination.name}</div>
      <div style={styles.tagline}>{destination.tagline}</div>
      <div style={styles.meta}>Click to open the dispatch ↗</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'absolute', right: 48, bottom: 130, width: 320,
    zIndex: 5, padding: '22px 24px',
    background: 'rgba(7,15,31,0.75)',
    border: '1px solid rgba(255,220,170,0.20)',
    backdropFilter: 'blur(14px)',
    pointerEvents: 'none',
  },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: '#ffd100', marginBottom: 10,
  },
  name: {
    fontFamily: 'var(--font-serif)', fontSize: 32,
    color: '#fff', lineHeight: 1.05, letterSpacing: -0.3,
  },
  tagline: {
    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
    fontSize: 14, color: 'rgba(255,240,220,0.75)',
    marginTop: 10, lineHeight: 1.4,
  },
  meta: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.3em', color: 'rgba(255,220,170,0.45)',
    marginTop: 14,
  },
};
