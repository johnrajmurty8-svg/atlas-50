'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
      ));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, []);

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleRemove = (id: string, name: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onRemove(id); // remove immediately so drawer close doesn't cancel it
    setPendingRemove({ id, name });
    timerRef.current = setTimeout(() => setPendingRemove(null), 3000);
  };

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onRemove(pendingRemove!.id); // toggleWish re-adds the item
    setPendingRemove(null);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const visibleItems = saved; // wishlist state already updated immediately

  return (
    <div ref={drawerRef} style={styles.drawer} role="dialog" aria-label="Your wishlist" aria-modal="true">
      <div style={styles.head}>
        <div>
          <div style={styles.savedLabel}>— SAVED</div>
          <div style={styles.title}>Your List</div>
        </div>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close wishlist">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5"/></svg>
        </button>
      </div>

      {pendingRemove && (
        <div style={styles.toast} role="status">
          <span style={styles.toastText}>Removed {pendingRemove.name}</span>
          <button style={styles.undoBtn} onClick={handleUndo}>← Undo</button>
        </div>
      )}

      {visibleItems.length === 0 && !pendingRemove && (
        <div style={styles.empty}>
          Nothing saved yet. Explore the globe and save destinations to your list.
        </div>
      )}

      {visibleItems.map(dest => (
        <div
          key={dest.id}
          style={styles.item}
          onClick={() => onSelect(dest)}
          role="button"
          tabIndex={0}
          aria-label={`View ${dest.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(dest); } }}
        >
          <div style={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dest.images[0]}
              alt=""
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.itemName}>{dest.name}</div>
            <div style={styles.itemMeta}>{dest.region} · {dest.themes.slice(0, 2).join(' · ')}</div>
          </div>
          <button
            style={styles.removeBtn}
            onClick={e => { e.stopPropagation(); handleRemove(dest.id, dest.name); }}
            aria-label={`Remove ${dest.name} from wishlist`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3"/></svg>
          </button>
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
    width: 40, height: 40,
    background: 'transparent', border: 'none',
    color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  toast: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', marginBottom: 12,
    background: 'rgba(255,220,170,0.08)',
    border: '1px solid rgba(255,220,170,0.20)',
  },
  toastText: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.20em', color: 'rgba(255,240,220,0.70)',
  },
  undoBtn: {
    background: 'transparent', border: 'none',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.20em', color: '#ffd100',
    cursor: 'pointer', padding: '4px 0',
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
    flexShrink: 0,
    background: '#070f1f',
    overflow: 'hidden',
  },
  itemName: {
    fontFamily: 'var(--font-serif)', fontSize: 18, color: '#fff',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.20em', color: 'rgba(255,220,170,0.45)',
    textTransform: 'uppercase', marginTop: 3,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  removeBtn: {
    width: 36, height: 36,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
