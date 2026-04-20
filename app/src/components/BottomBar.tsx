'use client';

interface BottomBarProps {
  total: number;
  wishlistCount: number;
  onSurprise: () => void;
  onWishlistToggle: () => void;
  wishlistOpen: boolean;
}

export default function BottomBar({
  total, wishlistCount, onSurprise, onWishlistToggle, wishlistOpen,
}: BottomBarProps) {
  return (
    <div style={styles.bar}>
      <div style={styles.item}>
        <div style={styles.label}>— DESTINATIONS</div>
        <div style={styles.value}>{String(total).padStart(2, '0')}</div>
      </div>
      <div style={styles.divider} />
      <div style={styles.item}>
        <div style={styles.label}>— ON YOUR LIST</div>
        <div style={styles.value}>{String(wishlistCount).padStart(2, '0')}</div>
      </div>
      <button style={styles.surpriseBtn} onClick={onSurprise} aria-label="Surprise me">
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginRight: 10 }}>
          <path d="M1 6 Q3 1 6 6 T11 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <circle cx="11" cy="6" r="1" fill="currentColor" />
        </svg>
        SURPRISE ME
      </button>
      <button
        style={styles.wishlistBtn}
        onClick={onWishlistToggle}
        aria-label="Open wishlist"
        aria-expanded={wishlistOpen}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ marginRight: 10 }}>
          <path d="M6 10.5 L1.8 6.5 A2.5 2.5 0 0 1 6 3 A2.5 2.5 0 0 1 10.2 6.5 Z" />
        </svg>
        WISHLIST ({wishlistCount})
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'absolute', bottom: 32, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 24,
    zIndex: 5, padding: '12px 16px',
    background: 'rgba(7,15,31,0.55)',
    border: '1px solid rgba(255,220,170,0.15)',
    backdropFilter: 'blur(12px)',
  },
  item: { padding: '0 12px' },
  divider: { width: 1, height: 32, background: 'rgba(255,220,170,0.15)' },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    letterSpacing: '0.3em', color: 'rgba(255,220,170,0.5)',
  },
  value: {
    fontFamily: 'var(--font-serif)', fontSize: 22,
    color: '#fff', marginTop: 2,
  },
  surpriseBtn: {
    display: 'flex', alignItems: 'center',
    padding: '14px 22px',
    background: '#ffd100', color: '#070f1f',
    border: 'none',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    letterSpacing: '0.3em', cursor: 'pointer',
  },
  wishlistBtn: {
    display: 'flex', alignItems: 'center',
    padding: '14px 22px',
    background: 'transparent', color: '#fff',
    border: '1px solid rgba(255,255,255,0.25)',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    letterSpacing: '0.3em', cursor: 'pointer',
  },
};
