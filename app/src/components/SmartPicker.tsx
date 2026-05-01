'use client';

import { useState, useRef, useEffect } from 'react';
import type { Destination, SmartPickerState } from '../lib/types';

interface SmartPickerProps {
  picker: SmartPickerState;
  onChange: (key: keyof SmartPickerState, value: string) => void;
  filtered: Destination[];
}

const FIELDS: Array<{
  key: keyof SmartPickerState;
  label: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: 'vibe',
    label: 'Vibe',
    options: [
      { value: 'romantic', label: 'Romantic' },
      { value: 'adventurous', label: 'Adventurous' },
      { value: 'cultural', label: 'Cultural' },
      { value: 'social', label: 'Social' },
      { value: 'spiritual', label: 'Spiritual' },
      { value: 'offbeat', label: 'Offbeat' },
      { value: 'luxurious', label: 'Luxurious' },
      { value: 'budget-friendly', label: 'Budget-friendly' },
    ],
  },
  {
    key: 'cost',
    label: 'Cost',
    options: [
      { value: '1', label: 'Budget' },
      { value: '2', label: 'Low-mid' },
      { value: '3', label: 'Mid-range' },
      { value: '4', label: 'High' },
      { value: '5', label: 'Luxury' },
    ],
  },
  {
    key: 'season',
    label: 'When to go',
    options: [
      { value: 'spring', label: 'Spring' },
      { value: 'summer', label: 'Summer' },
      { value: 'autumn', label: 'Autumn' },
      { value: 'winter', label: 'Winter' },
    ],
  },
  {
    key: 'environment',
    label: 'Landscape',
    options: [
      { value: 'mountains', label: 'Mountains' },
      { value: 'coast', label: 'Coast' },
      { value: 'desert', label: 'Desert' },
      { value: 'jungle', label: 'Jungle' },
      { value: 'city', label: 'City' },
      { value: 'islands', label: 'Islands' },
      { value: 'plains', label: 'Plains' },
      { value: 'tundra', label: 'Tundra' },
    ],
  },
  {
    key: 'theme',
    label: 'Theme',
    options: [
      { value: 'beaches', label: 'Beaches' },
      { value: 'mountains', label: 'Mountains' },
      { value: 'culture', label: 'Culture' },
      { value: 'food', label: 'Food' },
      { value: 'desert', label: 'Desert' },
      { value: 'wildlife', label: 'Wildlife' },
      { value: 'adventure', label: 'Adventure' },
    ],
  },
  {
    key: 'groupSize',
    label: 'Travelling as',
    options: [
      { value: 'solo', label: 'Solo' },
      { value: 'couple', label: 'Couple' },
      { value: 'friends', label: 'Friends' },
      { value: 'family', label: 'Family' },
    ],
  },
];

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  ariaLabel: string;
}

function CustomSelect({ value, onChange, options, ariaLabel }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSet = value !== '';
  const selectedLabel = options.find(o => o.value === value)?.label;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          padding: '8px 28px 8px 10px',
          background: 'rgba(7,15,31,0.60)',
          border: isSet ? '1px solid rgba(255,209,0,0.40)' : '1px solid rgba(255,220,170,0.15)',
          color: isSet ? '#ffd100' : 'rgba(255,240,220,0.80)',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.15em',
          cursor: 'pointer', textAlign: 'left',
          display: 'block',
        }}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedLabel ?? '— Any'}
      </button>
      <div style={{
        position: 'absolute', right: 8, top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(255,220,170,0.40)',
        pointerEvents: 'none',
      }}>▾</div>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#070f1f',
            border: '1px solid rgba(255,220,170,0.20)',
            borderTop: 'none',
            zIndex: 20,
            maxHeight: 180, overflowY: 'auto',
          }}
        >
          {/* "Any" option */}
          <div
            role="option"
            aria-selected={value === ''}
            style={{
              padding: '8px 10px',
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.15em', cursor: 'pointer',
              background: hoveredValue === '__any' ? '#ffd100' : 'transparent',
              color: hoveredValue === '__any' ? '#050912' : 'rgba(255,240,220,0.50)',
            }}
            onMouseEnter={() => setHoveredValue('__any')}
            onMouseLeave={() => setHoveredValue(null)}
            onMouseDown={() => { onChange(''); setOpen(false); }}
          >
            — Any
          </div>

          {options.map(opt => (
            <div
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              style={{
                padding: '8px 10px',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.15em', cursor: 'pointer',
                background: hoveredValue === opt.value ? '#ffd100' : 'transparent',
                color: hoveredValue === opt.value ? '#050912' : 'rgba(255,240,220,0.80)',
              }}
              onMouseEnter={() => setHoveredValue(opt.value)}
              onMouseLeave={() => setHoveredValue(null)}
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const hasActivePicker = (picker: SmartPickerState) =>
  Object.values(picker).some(v => v !== '');

export default function SmartPicker({ picker, onChange, filtered }: SmartPickerProps) {
  const active = hasActivePicker(picker);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>FIND YOUR DISPATCH</div>

      {FIELDS.map(field => (
        <div key={field.key} style={styles.fieldRow}>
          <label style={styles.fieldLabel}>{field.label.toUpperCase()}</label>
          <CustomSelect
            value={picker[field.key]}
            onChange={value => onChange(field.key, value)}
            options={field.options}
            ariaLabel={field.label}
          />
        </div>
      ))}

      {active && (
        <button
          style={styles.resetBtn}
          onClick={() => { FIELDS.forEach(f => onChange(f.key, '')); }}
        >
          CLEAR FILTERS
        </button>
      )}

      {active && (
        <div style={styles.resultCount}>
          <span style={styles.resultLabel}>CUSTOM LIST</span>
          {filtered.length > 0
            ? <span style={styles.resultNum}>{filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}</span>
            : <span style={{ ...styles.resultNum, fontStyle: 'italic', opacity: 0.7 }}>No matches — try clearing a filter</span>
          }
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', top: 160, right: 48,
    width: 220, zIndex: 4,
  },
  header: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: 'rgba(255,220,170,0.55)',
    marginBottom: 14,
  },
  fieldRow: { marginBottom: 8 },
  fieldLabel: {
    display: 'block',
    fontFamily: 'var(--font-mono)', fontSize: 8,
    letterSpacing: '0.25em', color: 'rgba(255,220,170,0.40)',
    marginBottom: 4,
  },
  resetBtn: {
    marginTop: 10,
    width: '100%', padding: '14px 0',
    background: 'transparent',
    border: '1px solid rgba(255,220,170,0.20)',
    color: 'rgba(255,240,220,0.50)',
    fontFamily: 'var(--font-mono)', fontSize: 8,
    letterSpacing: '0.25em', cursor: 'pointer',
  },
  resultCount: {
    marginTop: 14,
    padding: '10px 0',
    borderTop: '1px solid rgba(255,220,170,0.12)',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  resultLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.30em', color: '#ffd100',
  },
  resultNum: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    color: 'rgba(255,220,170,0.50)',
    letterSpacing: '0.15em',
  },
};
