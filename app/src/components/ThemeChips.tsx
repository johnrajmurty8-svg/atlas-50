'use client';

import { useState } from 'react';

const THEMES = [
  { id: 'all', label: 'All' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'desert', label: 'Desert' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'adventure', label: 'Adventure' },
];

interface ThemeChipsProps {
  activeTheme: string;
  onChange: (theme: string) => void;
}

export default function ThemeChips({ activeTheme, onChange }: ThemeChipsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={styles.row} role="group" aria-label="Filter by theme">
      {THEMES.map(t => {
        const isActive = activeTheme === t.id;
        const isHovered = hoveredId === t.id;
        return (
          <button
            key={t.id}
            style={{
              ...styles.chip,
              ...(isActive ? styles.chipActive : {}),
              ...(!isActive && isHovered ? styles.chipHover : {}),
            }}
            onClick={() => onChange(t.id)}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
            aria-pressed={isActive}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 },
  chip: {
    padding: '5px 10px',
    background: 'transparent',
    border: '1px solid rgba(255,220,170,0.25)',
    color: 'rgba(255,240,220,0.70)',
    fontFamily: 'var(--font-mono)',
    fontSize: 9, letterSpacing: '0.20em',
    textTransform: 'uppercase', cursor: 'pointer',
    transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
  },
  chipHover: {
    borderColor: 'rgba(255,220,170,0.55)',
    color: 'rgba(255,240,220,0.95)',
  },
  chipActive: {
    background: '#ffd100',
    color: '#070f1f',
    borderColor: '#ffd100',
  },
};
