'use client';

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

const hasActivePicker = (picker: SmartPickerState) =>
  Object.values(picker).some(v => v !== '');

export default function SmartPicker({ picker, onChange, filtered }: SmartPickerProps) {
  const active = hasActivePicker(picker);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>LET US HELP YOU PICK</div>

      {FIELDS.map(field => {
        const val = picker[field.key];
        const isSet = val !== '';
        return (
          <div key={field.key} style={styles.fieldRow}>
            <label style={styles.fieldLabel}>{field.label.toUpperCase()}</label>
            <div style={styles.selectWrap}>
              <select
                value={val}
                onChange={e => onChange(field.key, e.target.value)}
                style={{
                  ...styles.select,
                  ...(isSet ? styles.selectActive : {}),
                }}
                aria-label={field.label}
              >
                <option value="">— Any</option>
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div style={styles.arrow}>▾</div>
            </div>
          </div>
        );
      })}

      {active && (
        <button
          style={styles.resetBtn}
          onClick={() => {
            FIELDS.forEach(f => onChange(f.key, ''));
          }}
        >
          CLEAR FILTERS
        </button>
      )}

      {active && (
        <div style={styles.resultCount}>
          <span style={styles.resultLabel}>CUSTOM LIST</span>
          <span style={styles.resultNum}>{filtered.length} matches</span>
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
  selectWrap: { position: 'relative' },
  select: {
    width: '100%',
    padding: '8px 28px 8px 10px',
    background: 'rgba(7,15,31,0.60)',
    border: '1px solid rgba(255,220,170,0.15)',
    color: 'rgba(255,240,220,0.80)',
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    outline: 'none',
  },
  selectActive: {
    borderColor: 'rgba(255,209,0,0.40)',
    color: '#ffd100',
  },
  arrow: {
    position: 'absolute', right: 8, top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'rgba(255,220,170,0.40)',
    pointerEvents: 'none',
  },
  resetBtn: {
    marginTop: 10,
    width: '100%', padding: '8px 0',
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
