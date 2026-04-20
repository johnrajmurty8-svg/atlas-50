// Main app — chrome, country list, filters, wishlist, surprise-me, Tweaks.
// Exports: window.App
(function(){
  const { useRef, useEffect, useState, useMemo } = React;

  // Tweak defaults — persisted by host between edit-mode sessions.
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "oceanColor": "#070f1f",
    "graticule": true,
    "rotationSpeed": 28,
    "showLabels": true,
    "haloIntensity": 1,
    "accentColor": "#ffd100"
  }/*EDITMODE-END*/;

  const REGIONS = ['Europe','Asia','Africa','Americas','Oceania'];

  function App(){
    const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      const onMsg = (e) => {
        if (!e.data || typeof e.data !== 'object') return;
        if (e.data.type === '__activate_edit_mode') setEditMode(true);
        else if (e.data.type === '__deactivate_edit_mode') setEditMode(false);
      };
      window.addEventListener('message', onMsg);
      window.parent.postMessage({ type:'__edit_mode_available' }, '*');
      return () => window.removeEventListener('message', onMsg);
    }, []);

    const updateTweak = (k, v) => {
      setTweaks(prev => ({ ...prev, [k]: v }));
      window.parent.postMessage({ type:'__edit_mode_set_keys', edits: { [k]: v } }, '*');
    };

    const [activeTheme, setActiveTheme] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);
    const [wishlist, setWishlist] = useState(() => {
      try { return JSON.parse(localStorage.getItem('atlas50-wish') || '[]'); } catch { return []; }
    });
    const [wishlistOpen, setWishlistOpen] = useState(false);

    useEffect(() => {
      localStorage.setItem('atlas50-wish', JSON.stringify(wishlist));
    }, [wishlist]);

    const countries = window.COUNTRIES;

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      return countries.filter(c => {
        if (activeTheme !== 'all' && !c.themes.includes(activeTheme)) return false;
        if (q && !c.name.toLowerCase().includes(q) && !c.region.toLowerCase().includes(q)) return false;
        return true;
      });
    }, [activeTheme, search, countries]);

    const globeRef = useRef(null);

    const handleSelect = (c) => {
      setSelected(c);
    };
    const handleFly = (c) => {
      setSearch(''); setWishlistOpen(false);
      if (globeRef.current) globeRef.current.flyTo(c);
    };

    const toggleWish = (c) => {
      setWishlist(prev => prev.includes(c.id) ? prev.filter(x => x!==c.id) : [...prev, c.id]);
    };

    const surprise = () => {
      const pool = filtered.length ? filtered : countries;
      const pick = pool[Math.floor(Math.random()*pool.length)];
      handleFly(pick);
      setTimeout(() => setSelected(pick), 1200);
    };

    const rotationSpeed = (tweaks.rotationSpeed || 28) / 1000;

    return (
      <div style={styles.root}>
        {/* Globe canvas */}
        <div style={styles.globeWrap}>
          <window.CultureGlobe
            ref={globeRef}
            countries={countries}
            autoRotateSpeed={rotationSpeed}
            tweaks={tweaks}
            onHotspotClick={handleSelect}
            onHotspotHover={setHovered}
          />
          {/* radial vignette overlay */}
          <div style={styles.vignette} />
        </div>

        {/* Constellation lines overlay (pure CSS dots connecting hotspots into regions) */}
        {/* Masthead */}
        <header style={styles.masthead}>
          <div style={styles.mastheadLeft}>
            <div style={styles.brand}>Atlas<span style={styles.slash}>/</span>50</div>
            <div style={styles.issue}>VOL. XXVI · SPRING · 2026</div>
          </div>
          <nav style={styles.nav}>
            <a style={styles.navItem}>— The Index</a>
            <a style={styles.navItem}>Dispatches</a>
            <a style={styles.navItem}>Journal</a>
            <a style={styles.navItem}>Sign In</a>
          </nav>
        </header>

        {/* Left panel — search + filters + list */}
        <aside style={styles.leftPanel}>
          <div style={styles.panelHead}>
            <div style={styles.panelLabel}>— The Index</div>
            <div style={styles.panelTitle}>Fifty places,<br/>this season.</div>
            <p style={styles.panelIntro}>
              A living atlas of the world's most extraordinary destinations —
              curated by our editors, illustrated by the light that finds them.
            </p>
          </div>

          <div style={styles.searchRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{opacity:0.5}}>
              <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5 L13 13" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <input
              style={styles.search}
              placeholder="Search country or region…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.themeRow}>
            {window.THEMES.map(t => (
              <button
                key={t.id}
                style={{
                  ...styles.themeChip,
                  ...(activeTheme === t.id ? styles.themeChipActive : {}),
                }}
                onClick={() => setActiveTheme(t.id)}
              >{t.label}</button>
            ))}
          </div>

          <div style={styles.listScroll}>
            {REGIONS.map(r => {
              const items = filtered.filter(c => c.region === r);
              if (!items.length) return null;
              return (
                <div key={r} style={styles.regionBlock}>
                  <div style={styles.regionLabel}>— {r.toUpperCase()} · {String(items.length).padStart(2,'0')}</div>
                  <ul style={styles.list}>
                    {items.map(c => {
                      const inWish = wishlist.includes(c.id);
                      return (
                        <li key={c.id} style={styles.listItem}
                            onMouseEnter={() => setHovered(c)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => { handleFly(c); setTimeout(() => setSelected(c), 700); }}>
                          <span style={styles.listNum}>{String(countries.indexOf(c)+1).padStart(2,'0')}</span>
                          <span style={styles.listName}>{c.name}</span>
                          <span style={styles.listMeta}>{c.themes[0]}</span>
                          {inWish && <span style={styles.listWish}>✦</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {!filtered.length && (
              <div style={styles.empty}>No destinations match that filter.</div>
            )}
          </div>
        </aside>

        {/* Bottom bar — surprise-me + stats */}
        <div style={styles.bottomBar}>
          <div style={styles.bottomItem}>
            <div style={styles.bottomLabel}>— DESTINATIONS</div>
            <div style={styles.bottomValue}>{String(countries.length).padStart(2,'0')}</div>
          </div>
          <div style={styles.bottomItem}>
            <div style={styles.bottomLabel}>— ON YOUR LIST</div>
            <div style={styles.bottomValue}>{String(wishlist.length).padStart(2,'0')}</div>
          </div>
          <button style={styles.surpriseBtn} onClick={surprise}>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{marginRight:10}}>
              <path d="M1 6 Q3 1 6 6 T11 6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <circle cx="11" cy="6" r="1" fill="currentColor"/>
            </svg>
            SURPRISE ME
          </button>
          <button style={styles.wishlistBtn} onClick={() => setWishlistOpen(v => !v)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" style={{marginRight:10}}>
              <path d="M6 10.5 L1.8 6.5 A2.5 2.5 0 0 1 6 3 A2.5 2.5 0 0 1 10.2 6.5 Z"/>
            </svg>
            WISHLIST ({wishlist.length})
          </button>
        </div>

        {/* Hover card */}
        {hovered && !selected && (
          <div style={styles.hoverCard}>
            <div style={styles.hoverLabel}>— {hovered.region.toUpperCase()}</div>
            <div style={styles.hoverName}>{hovered.name}</div>
            <div style={styles.hoverTag}>{hovered.tagline}</div>
            <div style={styles.hoverMeta}>Click to open the dispatch ↗</div>
          </div>
        )}

        {/* Wishlist drawer */}
        {wishlistOpen && (
          <div style={styles.wishDrawer}>
            <div style={styles.wishHead}>
              <div>
                <div style={styles.panelLabel}>— SAVED</div>
                <div style={styles.wishTitle}>Your wishlist</div>
              </div>
              <button style={styles.wishClose} onClick={() => setWishlistOpen(false)}>×</button>
            </div>
            {wishlist.length === 0 && (
              <div style={styles.wishEmpty}>
                Nothing saved yet. Click the ✦ on a dispatch to start a list.
              </div>
            )}
            {wishlist.map(id => {
              const c = countries.find(x => x.id === id);
              if (!c) return null;
              return (
                <div key={id} style={styles.wishItem} onClick={() => { handleFly(c); setTimeout(() => setSelected(c), 700); setWishlistOpen(false); }}>
                  <div style={{...styles.wishThumb, backgroundImage:`url(${c.images[0]})`}} />
                  <div style={{flex:1}}>
                    <div style={styles.wishItemName}>{c.name}</div>
                    <div style={styles.wishItemMeta}>{c.region} · {c.themes.slice(0,2).join(' · ')}</div>
                  </div>
                  <button style={styles.wishRemove} onClick={(e) => { e.stopPropagation(); toggleWish(c); }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tweaks panel */}
        {editMode && (
          <div style={styles.tweaks}>
            <div style={styles.tweaksHead}>
              <div style={styles.tweaksTitle}>Tweaks</div>
              <div style={styles.tweaksSub}>Globe graphics</div>
            </div>
            <TweakField label="Ocean color">
              <div style={{display:'flex', gap:8}}>
                {['#070f1f','#0a1a2e','#1a1028','#0a1f1a','#1e0a0a','#050510'].map(col => (
                  <button key={col} onClick={() => updateTweak('oceanColor', col)} style={{
                    width:26, height:26, borderRadius:13, background:col,
                    border: tweaks.oceanColor === col ? '2px solid #ffd100' : '1px solid rgba(255,255,255,0.2)',
                    cursor:'pointer', padding:0,
                  }}/>
                ))}
              </div>
            </TweakField>
            <TweakField label={`Rotation speed · ${tweaks.rotationSpeed}`}>
              <input type="range" min="0" max="100" value={tweaks.rotationSpeed}
                     onChange={e => updateTweak('rotationSpeed', +e.target.value)}
                     style={{width:'100%'}} />
            </TweakField>
            <TweakField label="Graticule">
              <div style={{display:'flex', gap:8}}>
                <TweakToggle active={tweaks.graticule} onClick={() => updateTweak('graticule', true)}>On</TweakToggle>
                <TweakToggle active={!tweaks.graticule} onClick={() => updateTweak('graticule', false)}>Off</TweakToggle>
              </div>
            </TweakField>
            <TweakField label="Accent color">
              <div style={{display:'flex', gap:8}}>
                {['#ffd100','#e85d3e','#f4ecd4','#5dcbe8','#b8e85d'].map(col => (
                  <button key={col} onClick={() => updateTweak('accentColor', col)} style={{
                    width:26, height:26, borderRadius:13, background:col,
                    border: tweaks.accentColor === col ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                    cursor:'pointer', padding:0,
                  }}/>
                ))}
              </div>
            </TweakField>
          </div>
        )}

        {/* Moodboard takeover */}
        {selected && (
          <window.Moodboard
            country={selected}
            onClose={() => { setSelected(null); if (globeRef.current) globeRef.current.resume(); }}
            onToggleWishlist={toggleWish}
            inWishlist={wishlist.includes(selected.id)}
          />
        )}
      </div>
    );
  }

  function TweakField({ label, children }){
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase',
                      color:'rgba(255,255,255,0.5)', marginBottom:8,
                      fontFamily:"'JetBrains Mono', monospace" }}>{label}</div>
        {children}
      </div>
    );
  }
  function TweakToggle({ active, onClick, children }){
    return (
      <button onClick={onClick} style={{
        padding:'6px 12px', background: active ? '#ffd100' : 'transparent',
        color: active ? '#070f1f' : '#fff',
        border: `1px solid ${active ? '#ffd100' : 'rgba(255,255,255,0.2)'}`,
        borderRadius:4, cursor:'pointer', fontFamily:"'JetBrains Mono', monospace",
        fontSize:10, letterSpacing:'0.2em',
      }}>{children}</button>
    );
  }

  const styles = {
    root: {
      position:'fixed', inset:0, overflow:'hidden',
      background:'radial-gradient(ellipse at 60% 50%, #0a1324 0%, #050912 60%, #020408 100%)',
      color:'#f4ecd4', fontFamily:"'Inter', sans-serif",
    },
    globeWrap: { position:'absolute', inset:0 },
    vignette: {
      position:'absolute', inset:0, pointerEvents:'none',
      background:'radial-gradient(ellipse at 60% 50%, transparent 40%, rgba(0,0,0,0.55) 90%)',
    },

    masthead: {
      position:'absolute', top:0, left:0, right:0, padding:'28px 48px',
      display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      zIndex:5, pointerEvents:'none',
    },
    mastheadLeft: { pointerEvents:'auto' },
    brand: {
      fontFamily:"'DM Serif Display', serif", fontSize:36, color:'#fff',
      letterSpacing:-0.5, lineHeight:1,
    },
    slash: { color:'#ffd100', margin:'0 2px' },
    issue: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing:'0.35em', color:'rgba(255,220,170,0.55)', marginTop:8,
    },
    nav: { display:'flex', gap:36, pointerEvents:'auto' },
    navItem: {
      fontSize:12, letterSpacing:'0.15em', color:'rgba(255,240,220,0.7)',
      textTransform:'uppercase', textDecoration:'none', cursor:'pointer',
    },

    leftPanel: {
      position:'absolute', top:130, left:48, bottom:100, width:360,
      display:'flex', flexDirection:'column', zIndex:4,
      pointerEvents:'auto',
    },
    panelHead: { marginBottom:22 },
    panelLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing:'0.35em', color:'#ffd100', marginBottom:10,
    },
    panelTitle: {
      fontFamily:"'DM Serif Display', serif", fontSize:42, color:'#fff',
      lineHeight:1.02, letterSpacing:-0.5,
    },
    panelIntro: {
      fontSize:13, lineHeight:1.6, color:'rgba(255,240,220,0.6)',
      margin:'14px 0 0', maxWidth:320,
    },

    searchRow: {
      display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
      background:'rgba(255,240,220,0.04)', border:'1px solid rgba(255,220,170,0.15)',
      color:'#f4ecd4', marginBottom:14,
    },
    search: {
      flex:1, background:'transparent', border:'none', outline:'none',
      color:'#f4ecd4', fontSize:13, fontFamily:'inherit',
    },
    themeRow: { display:'flex', gap:6, flexWrap:'wrap', marginBottom:22 },
    themeChip: {
      padding:'5px 10px', background:'transparent',
      border:'1px solid rgba(255,220,170,0.25)', color:'rgba(255,240,220,0.7)',
      fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:'0.2em',
      textTransform:'uppercase', cursor:'pointer',
    },
    themeChipActive: {
      background:'#ffd100', color:'#070f1f', borderColor:'#ffd100',
    },

    listScroll: {
      flex:1, overflowY:'auto', paddingRight:8,
    },
    regionBlock: { marginBottom:20 },
    regionLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing:'0.35em', color:'rgba(255,220,170,0.5)', marginBottom:6,
    },
    list: { listStyle:'none', padding:0, margin:0 },
    listItem: {
      display:'flex', alignItems:'baseline', gap:12, padding:'9px 4px',
      borderBottom:'1px solid rgba(255,220,170,0.08)',
      cursor:'pointer', transition:'background 0.15s',
    },
    listNum: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      color:'rgba(255,220,170,0.45)', minWidth:22,
    },
    listName: {
      fontFamily:"'DM Serif Display', serif", fontSize:18, color:'#fff',
      flex:1, letterSpacing:-0.2,
    },
    listMeta: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.2em', color:'rgba(255,220,170,0.4)',
      textTransform:'uppercase',
    },
    listWish: { color:'#ffd100', fontSize:11, marginLeft:4 },
    empty: { padding:'24px 0', color:'rgba(255,240,220,0.4)', fontSize:13, fontStyle:'italic' },

    bottomBar: {
      position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)',
      display:'flex', alignItems:'center', gap:24, zIndex:5,
      padding:'12px 16px', background:'rgba(7,15,31,0.55)',
      border:'1px solid rgba(255,220,170,0.15)', backdropFilter:'blur(12px)',
    },
    bottomItem: { padding:'0 12px' },
    bottomLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.3em', color:'rgba(255,220,170,0.5)',
    },
    bottomValue: {
      fontFamily:"'DM Serif Display', serif", fontSize:22, color:'#fff', marginTop:2,
    },
    surpriseBtn: {
      display:'flex', alignItems:'center', padding:'14px 22px',
      background:'#ffd100', color:'#070f1f', border:'none',
      fontFamily:"'JetBrains Mono', monospace", fontSize:11,
      letterSpacing:'0.3em', cursor:'pointer',
    },
    wishlistBtn: {
      display:'flex', alignItems:'center', padding:'14px 22px',
      background:'transparent', color:'#fff',
      border:'1px solid rgba(255,255,255,0.25)',
      fontFamily:"'JetBrains Mono', monospace", fontSize:11,
      letterSpacing:'0.3em', cursor:'pointer',
    },

    hoverCard: {
      position:'absolute', right:48, bottom:130, width:320, zIndex:4,
      padding:'22px 24px', background:'rgba(7,15,31,0.75)',
      border:'1px solid rgba(255,220,170,0.2)', backdropFilter:'blur(14px)',
      pointerEvents:'none',
    },
    hoverLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing:'0.35em', color:'#ffd100', marginBottom:10,
    },
    hoverName: {
      fontFamily:"'DM Serif Display', serif", fontSize:32,
      color:'#fff', lineHeight:1.05, letterSpacing:-0.3,
    },
    hoverTag: {
      fontFamily:"'DM Serif Display', serif", fontStyle:'italic',
      fontSize:14, color:'rgba(255,240,220,0.75)', marginTop:10, lineHeight:1.4,
    },
    hoverMeta: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.3em', color:'rgba(255,220,170,0.45)', marginTop:14,
    },

    wishDrawer: {
      position:'absolute', top:100, right:48, width:380, maxHeight:'70vh',
      background:'rgba(7,15,31,0.92)', border:'1px solid rgba(255,220,170,0.2)',
      backdropFilter:'blur(16px)', zIndex:6, padding:28, overflowY:'auto',
    },
    wishHead: {
      display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      marginBottom:20,
    },
    wishTitle: {
      fontFamily:"'DM Serif Display', serif", fontSize:28, color:'#fff', lineHeight:1,
    },
    wishClose: {
      width:32, height:32, background:'transparent', border:'none',
      color:'#fff', fontSize:22, cursor:'pointer',
    },
    wishEmpty: {
      padding:'32px 0', color:'rgba(255,240,220,0.5)',
      fontStyle:'italic', fontSize:13,
    },
    wishItem: {
      display:'flex', alignItems:'center', gap:12, padding:'10px 0',
      borderTop:'1px solid rgba(255,220,170,0.12)', cursor:'pointer',
    },
    wishThumb: {
      width:60, height:48, backgroundSize:'cover', backgroundPosition:'center',
      flexShrink:0,
    },
    wishItemName: {
      fontFamily:"'DM Serif Display', serif", fontSize:18, color:'#fff',
    },
    wishItemMeta: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.2em', color:'rgba(255,220,170,0.45)',
      textTransform:'uppercase', marginTop:3,
    },
    wishRemove: {
      width:28, height:28, borderRadius:14, background:'transparent',
      border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)',
      cursor:'pointer', fontSize:16,
    },

    tweaks: {
      position:'absolute', bottom:32, right:48, width:280,
      background:'rgba(7,15,31,0.88)', border:'1px solid rgba(255,220,170,0.2)',
      padding:'20px 22px', zIndex:8, backdropFilter:'blur(14px)',
    },
    tweaksHead: { marginBottom:18 },
    tweaksTitle: {
      fontFamily:"'DM Serif Display', serif", fontSize:20, color:'#fff',
    },
    tweaksSub: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.3em', color:'rgba(255,220,170,0.5)', marginTop:2,
    },
  };

  window.App = App;
})();
