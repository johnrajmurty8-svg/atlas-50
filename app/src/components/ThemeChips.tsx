'use client';

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
  return (
    <div style={styles.row} role="group" aria-label="Filter by theme">
      {THEMES.map(t => (
        <button
          key={t.id}
          style={{
            ...styles.chip,
            ...(activeTheme === t.id ? styles.chipActive : {}),
          }}
          onClick={() => onChange(t.id)}
          aria-pressed={activeTheme === t.id}
        >
          {t.label}
        </button>
      ))}
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
  chipActive: {
    background: '#ffd100',
    color: '#070f1f',
    borderColor: '#ffd100',
  },
};
