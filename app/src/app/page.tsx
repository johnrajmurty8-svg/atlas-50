'use client';

// Phase 4: <App /> will be imported here once built.
export default function IndexPage() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050912',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-dm-serif), serif',
      color: '#f4ecd4',
      fontSize: '36px',
      letterSpacing: '-0.5px',
    }}>
      Atlas <span style={{ color: '#ffd100', margin: '0 2px' }}>/</span>50
    </div>
  );
}
