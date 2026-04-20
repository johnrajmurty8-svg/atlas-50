'use client';

import type { Destination } from '../lib/types';

interface WishlistDrawerProps {
  destinations: Destination[];
  wishlist: string[];
  onRemove: (id: string) => void;
  onSelect: (dest: Destination) => void;
  onClose: () => void;
}

export default function WishlistDrawer({
  destinations, wishlist, onRemove, onSelect, onClose,
}: WishlistDrawerProps) {
  const saved = wishlist.map(id => destinations.find(d => d.id === id)).filter(Boolean) as Destination[];

  return (
    <div style={styles.drawer} role="dialog" aria-label="Your wishlist">
      <div style={styles.head}>
        <div>
          <div style={styles.savedLabel}>— SAVED</div>
          <div style={styles.title}>Your List</div>
        </div>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close wishlist">×</button>
      </div>

      {saved.length === 0 && (
        <div style={styles.empty}>
          Nothing saved yet. Explore the globe and save destinations to your list.
        </div>
      )}

      {saved.map(dest => (
        <div
          key={dest.id}
          style={styles.item}
          onClick={() => onSelect(dest)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(dest)}
        >
          <div
            style={{ ...styles.thumb, backgroundImage: `url(${dest.images[0]})` }}
            onError={(e) => {
              (e.target as HTMLDivElement).style.background = '#050912';
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={styles.itemName}>{dest.name}</div>
            <div style={styles.itemMeta}>{dest.region} · {dest.themes.slice(0, 2).join(' · ')}</div>
          </div>
          <button
            style={styles.removeBtn}
            onClick={e => { e.stopPropagation(); onRemove(dest.id); }}
            aria-label={`Remove ${dest.name} from wishlist`}
          >×</button>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  drawer: {
    position: 'absolute', top: 100, right: 48,
    width: 380, maxHeight: '70vh',
    background: 'rgba(7,15,31,0.92)',
    border: '1px solid rgba(255,220,170,0.20)',
    backdropFilter: 'blur(16px)',
    zIndex: 6, padding: 28,
    overflowY: 'auto',
  },
  head: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  savedLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.35em', color: '#ffd100', marginBottom: 6,
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: 28,
    color: '#fff', lineHeight: 1,
  },
  closeBtn: {
    width: 32, height: 32,
    background: 'transparent', border: 'none',
    color: '#fff', fontSize: 22, cursor: 'pointer',
  },
  empty: {
    padding: '32px 0',
    color: 'rgba(255,240,220,0.5)',
    fontStyle: 'italic', fontSize: 13,
    fontFamily: 'var(--font-sans)',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0',
    borderTop: '1px solid rgba(255,220,170,0.12)',
    cursor: 'pointer',
  },
  thumb: {
    width: 60, height: 48,
    backgroundSize: 'cover', backgroundPosition: 'center',
    flexShrink: 0,
    background: '#070f1f',
  },
  itemName: {
    fontFamily: 'var(--font-serif)', fontSize: 18, color: '#fff',
  },
  itemMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.20em', color: 'rgba(255,220,170,0.45)',
    textTransform: 'uppercase', marginTop: 3,
  },
  removeBtn: {
    width: 28, height: 28,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', fontSize: 16,
  },
};
