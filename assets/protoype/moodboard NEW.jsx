// Bento moodboard — fixed viewport, no scroll. 6 tiles modeled on the reference.
// Exports: window.Moodboard
(function(){
  const { useEffect, useState } = React;

  function Moodboard({ country, onClose, onToggleWishlist, inWishlist }){
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(false);
      const t = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(t);
    }, [country.id]);

    useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const img = country.images;
    const issueNo = String((country.id.length * 7 % 80) + 10).padStart(3,'0');
    const weatherTemp = country.weather.split('·')[0].trim();
    const weatherSub  = country.weather.split('·').slice(1).join(' · ').trim() || 'Mediterranean climate';

    // Each tile gets a stagger delay
    const tile = (i) => ({
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity .7s cubic-bezier(.2,.8,.2,1) ${80 + i*70}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${80 + i*70}ms`,
    });

    return (
      <div style={S.root}>
        {/* Yellow magazine frame */}
        <div style={S.frame} />

        {/* Top chrome — issue + close + save */}
        <div style={S.topbar}>
          <div style={S.topLeft}>
            <span style={S.brandDot}/>
            <span style={S.brandText}>ATLAS / 50</span>
            <span style={S.topSep}>·</span>
            <span style={S.topMeta}>VOL. XXVI</span>
            <span style={S.topSep}>·</span>
            <span style={S.topMeta}>No. {issueNo}</span>
            <span style={S.topSep}>·</span>
            <span style={S.topMeta}>{country.region.toUpperCase()}</span>
          </div>
          <div style={S.topRight}>
            <button style={{
              ...S.wishBtn,
              color: inWishlist ? '#ffd100' : '#f4ecd4',
              borderColor: inWishlist ? '#ffd100' : 'rgba(255,255,255,0.18)'
            }} onClick={() => onToggleWishlist(country)}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill={inWishlist ? '#ffd100' : 'none'} stroke="currentColor" strokeWidth="1.4">
                <path d="M7 12.5 L2 7.5 A3 3 0 0 1 7 3 A3 3 0 0 1 12 7.5 Z"/>
              </svg>
              <span>{inWishlist ? 'SAVED' : 'SAVE'}</span>
            </button>
            <button style={S.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.3"/></svg>
            </button>
          </div>
        </div>

        {/* Bento grid — fills available area between top bar and footer */}
        <div style={S.grid}>
          {/* TILE 1 — TYPOGRAPHY (big square left, spans 2 rows) */}
          <div style={{ ...S.cell, ...S.tileHero, ...tile(0) }}>
            <div style={S.heroBg} aria-hidden>
              <div style={{...S.heroImg, backgroundImage:`url(${img[0]})`}}/>
              <div style={S.heroVeil}/>
            </div>
            <div style={S.heroInner}>
              <div style={S.heroDisplay}>
                <span style={S.heroDisplayChar}>{country.name[0]}</span>
                <span style={S.heroDisplayCharSm}>{country.name[1] && country.name[1].toLowerCase()}</span>
              </div>
              <div>
                <div style={S.heroTitle}>{country.name}</div>
                <div style={S.heroSub}>{country.tagline}</div>
              </div>
            </div>
          </div>

          {/* TILE 2 — THEMES (top middle, small wide) */}
          <div style={{ ...S.cell, ...S.tileThemes, ...tile(1) }}>
            <div style={S.themesGlyph}>
              <span style={{...S.themesBar, width:'74%'}}/>
              <span style={{...S.themesBar, width:'58%'}}/>
              <span style={{...S.themesBar, width:'68%'}}/>
            </div>
            <div style={S.tileTitle}>Themes</div>
            <div style={S.tileBody}>{country.themes.map(t => t[0].toUpperCase() + t.slice(1)).join(' · ')}</div>
          </div>

          {/* TILE 3 — CLIMATE (mid middle, small wide) */}
          <div style={{ ...S.cell, ...S.tileClimate, ...tile(2) }}>
            <div style={S.climateChart}>
              <div style={S.climateLabel}>seasonal swing</div>
              <svg viewBox="0 0 200 36" style={S.climateSvg} preserveAspectRatio="none">
                <path d="M0 28 C 30 18, 60 8, 100 6 S 170 22, 200 28" stroke="#ffd100" strokeWidth="1.2" fill="none"/>
                <path d="M0 28 C 30 18, 60 8, 100 6 S 170 22, 200 28 L200 36 L0 36 Z" fill="rgba(255,209,0,0.08)"/>
              </svg>
              <div style={S.climateAxis}>
                <span>jan</span><span>apr</span><span>jul</span><span>oct</span>
              </div>
            </div>
            <div style={S.tileTitle}>{weatherTemp}</div>
            <div style={S.tileBody}>{weatherSub}</div>
          </div>

          {/* TILE 4 — REGION / GLOBE (right column, spans 2 rows) */}
          <div style={{ ...S.cell, ...S.tileGlobe, ...tile(3) }}>
            <RegionGlobe lat={country.lat} lon={country.lon}/>
            <div style={S.globeFoot}>
              <div style={{...S.tileTitle, display:'flex', gap:8, alignItems:'center'}}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M1 7 H13 M7 1 C 4 4, 4 10, 7 13 M7 1 C 10 4, 10 10, 7 13"/>
                </svg>
                <span>{country.region}</span>
              </div>
              <div style={S.tileBody}>
                {Math.abs(country.lat).toFixed(1)}°{country.lat >= 0 ? 'N' : 'S'} · {Math.abs(country.lon).toFixed(1)}°{country.lon >= 0 ? 'E' : 'W'}
              </div>
            </div>
          </div>

          {/* TILE 5 — ITINERARY (bottom left, wide) */}
          <div style={{ ...S.cell, ...S.tileItinerary, ...tile(4) }}>
            <div style={S.itinHead}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="7" cy="5" r="2.5"/>
                <path d="M7 8 L7 13 M3 13 L11 13"/>
              </svg>
              <span style={S.tileTitle}>Itinerary</span>
              <span style={S.itinCount}>05 stops</span>
            </div>
            <ol style={S.itinList}>
              {country.experiences.slice(0, 5).map((x, i) => (
                <li key={i} style={S.itinItem}>
                  <span style={S.itinNum}>{String(i+1).padStart(2,'0')}</span>
                  <span style={S.itinText}>{x}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* TILE 6 — DISH + SOUNDTRACK (bottom right, wide) */}
          <div style={{ ...S.cell, ...S.tileFinale, ...tile(5) }}>
            <div style={S.finaleBg} aria-hidden>
              <div style={{...S.finaleImg, backgroundImage:`url(${img[2] || img[0]})`}}/>
              <div style={S.finaleVeil}/>
            </div>
            <div style={S.finaleInner}>
              <div style={S.finaleRow}>
                <div style={S.finaleLabel}>— SIGNATURE DISH</div>
                <div style={S.finaleDish}>{country.dish}</div>
              </div>
              <div style={S.finaleSep}/>
              <div style={S.finaleRow}>
                <div style={S.finaleLabel}>— ON THE GRAMOPHONE</div>
                <div style={S.finalePlay}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0}}>
                    <circle cx="7" cy="7" r="6" fill="none" stroke="#ffd100" strokeWidth="0.9"/>
                    <circle cx="7" cy="7" r="1.4" fill="#ffd100"/>
                  </svg>
                  <span>{country.playlist}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom colophon */}
        <div style={S.colophon}>
          <span>EST. 1899</span>
          <span style={S.colSep}>· · ·</span>
          <span>FILED FROM {country.name.toUpperCase()}</span>
          <span style={S.colSep}>· · ·</span>
          <span>SPRING MMXXVI</span>
        </div>
      </div>
    );
  }

  // Tiny SVG region globe — shows hotspot on a stylized sphere
  function RegionGlobe({ lat, lon }){
    const r = 70;
    const cx = 90, cy = 90;
    // Project lat/lon onto a 2D circle (orthographic) — assume globe is centered on country
    const dotX = cx, dotY = cy;
    return (
      <svg viewBox="0 0 180 180" style={{ width:'68%', maxWidth:200, opacity:0.95 }}>
        <defs>
          <radialGradient id="rgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd100" stopOpacity="0.45"/>
            <stop offset="60%" stopColor="#ffd100" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r+18} fill="url(#rgGlow)"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,220,170,0.28)" strokeWidth="0.8"/>
        {/* Latitude lines */}
        {[-60,-30,0,30,60].map(l => {
          const ry = r * Math.cos(l * Math.PI/180);
          const oy = cy + r * Math.sin(l * Math.PI/180) * 0.6;
          return <ellipse key={l} cx={cx} cy={oy} rx={r * Math.cos(l * Math.PI/180)} ry={ry * 0.18}
                          fill="none" stroke="rgba(255,220,170,0.16)" strokeWidth="0.5"/>;
        })}
        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map(l => (
          <ellipse key={l} cx={cx} cy={cy} rx={r * Math.abs(Math.sin(l * Math.PI/180)) || 0.5} ry={r}
                   fill="none" stroke="rgba(255,220,170,0.16)" strokeWidth="0.5"/>
        ))}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,220,170,0.45)" strokeWidth="1"/>
        {/* Hotspot pulse */}
        <circle cx={dotX} cy={dotY} r="9" fill="#ffd100" opacity="0.18">
          <animate attributeName="r" from="6" to="14" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx={dotX} cy={dotY} r="3" fill="#ffd100"/>
        <circle cx={dotX} cy={dotY} r="3" fill="none" stroke="#fff7d0" strokeWidth="0.6"/>
      </svg>
    );
  }

  // ────────── STYLES ──────────
  const cellBase = {
    position:'relative',
    background:'rgba(20, 26, 44, 0.55)',
    border:'1px solid rgba(255,220,170,0.10)',
    borderRadius:14,
    padding:'22px 24px',
    overflow:'hidden',
    display:'flex', flexDirection:'column',
    willChange:'opacity, transform',
  };

  const S = {
    root: {
      position:'fixed', inset:0, zIndex:100,
      background:'radial-gradient(ellipse at 50% 30%, #0d1733 0%, #060b1a 65%, #03060f 100%)',
      color:'#f4ecd4', fontFamily:"'Inter', sans-serif",
      animation:'mb-fade 0.45s ease',
      display:'flex', flexDirection:'column',
      paddingTop:14, paddingBottom:14,
    },
    frame: {
      position:'fixed', top:14, left:14, right:14, bottom:14,
      border:'3px solid #ffd100', pointerEvents:'none', zIndex:200,
    },

    // Top chrome
    topbar: {
      flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 38px 16px',
      borderBottom:'1px solid rgba(255,220,170,0.08)',
      margin:'0 14px',
    },
    topLeft: {
      display:'flex', alignItems:'center', gap:14,
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing:'0.3em',
    },
    brandDot: { width:7, height:7, borderRadius:'50%', background:'#ffd100', display:'inline-block' },
    brandText: { color:'#ffd100', fontWeight:700 },
    topSep: { color:'rgba(244,236,212,0.3)' },
    topMeta: { color:'rgba(244,236,212,0.7)' },
    topRight: { display:'flex', gap:8, alignItems:'center' },
    wishBtn: {
      display:'flex', alignItems:'center', gap:7,
      padding:'8px 14px', background:'rgba(7,15,31,0.6)',
      border:'1px solid rgba(255,255,255,0.18)', cursor:'pointer',
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.25em',
      transition:'all 0.2s',
    },
    closeBtn: {
      width:32, height:32, background:'rgba(7,15,31,0.6)',
      border:'1px solid rgba(255,255,255,0.18)',
      cursor:'pointer', color:'#f4ecd4',
      display:'flex', alignItems:'center', justifyContent:'center',
    },

    // BENTO grid — 12 cols × 6 rows fills the available height
    grid: {
      flex:1, minHeight:0,
      display:'grid',
      gridTemplateColumns:'repeat(12, 1fr)',
      gridTemplateRows:'repeat(6, 1fr)',
      gap:14,
      padding:'18px 38px 14px',
      margin:'0 14px',
    },

    cell: cellBase,

    // 1 — Hero / typography (left column, all 6 rows on top — spans 4×4)
    tileHero: {
      gridColumn:'1 / span 4',
      gridRow:'1 / span 4',
      padding:0,
    },
    heroBg: { position:'absolute', inset:0, zIndex:0 },
    heroImg: {
      position:'absolute', inset:0,
      backgroundSize:'cover', backgroundPosition:'center',
      filter:'saturate(0.85) contrast(1.05)',
    },
    heroVeil: {
      position:'absolute', inset:0,
      background:'linear-gradient(180deg, rgba(7,15,31,0.55) 0%, rgba(7,15,31,0.78) 100%)',
    },
    heroInner: {
      position:'relative', zIndex:1, height:'100%',
      padding:'30px 32px',
      display:'flex', flexDirection:'column', justifyContent:'space-between',
    },
    heroDisplay: {
      fontFamily:"'DM Serif Display', serif",
      color:'#fff',
      lineHeight:0.85,
      letterSpacing:-4,
      display:'flex', alignItems:'baseline',
    },
    heroDisplayChar: { fontSize:'clamp(140px, 13vw, 220px)' },
    heroDisplayCharSm: { fontSize:'clamp(80px, 7vw, 120px)', opacity:0.85, fontStyle:'italic' },
    heroTitle: {
      fontFamily:"'DM Serif Display', serif",
      fontSize:'clamp(28px, 2.2vw, 38px)',
      color:'#fff',
      lineHeight:1.05,
      marginBottom:8,
    },
    heroSub: {
      fontFamily:"'DM Serif Display', serif", fontStyle:'italic',
      fontSize:'clamp(13px, 1vw, 16px)',
      color:'rgba(244,236,212,0.78)',
      lineHeight:1.45, maxWidth:380,
    },

    // 2 — Themes
    tileThemes: {
      gridColumn:'5 / span 4',
      gridRow:'1 / span 2',
    },
    themesGlyph: {
      display:'flex', flexDirection:'column', gap:6,
      marginBottom:'auto',
    },
    themesBar: {
      height:8, background:'rgba(244,236,212,0.32)', borderRadius:4,
    },

    // 3 — Climate
    tileClimate: {
      gridColumn:'5 / span 4',
      gridRow:'3 / span 2',
    },
    climateChart: { marginBottom:'auto', position:'relative' },
    climateLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:8.5,
      letterSpacing:'0.25em', color:'rgba(244,236,212,0.5)',
      textAlign:'center', textTransform:'uppercase', marginBottom:4,
    },
    climateSvg: { width:'100%', height:36, display:'block' },
    climateAxis: {
      display:'flex', justifyContent:'space-between',
      fontFamily:"'JetBrains Mono', monospace", fontSize:8,
      color:'rgba(244,236,212,0.4)', letterSpacing:'0.2em',
      marginTop:2,
    },

    // 4 — Globe (right col, spans 4 rows)
    tileGlobe: {
      gridColumn:'9 / span 4',
      gridRow:'1 / span 4',
      alignItems:'center', justifyContent:'space-between',
      padding:'30px 28px',
    },
    globeFoot: {
      width:'100%', display:'flex', flexDirection:'column', gap:6,
    },

    // Generic title / body
    tileTitle: {
      fontFamily:"'DM Serif Display', serif",
      fontSize:'clamp(20px, 1.6vw, 26px)',
      color:'#fff', lineHeight:1.1, marginTop:6,
    },
    tileBody: {
      fontFamily:"'Inter', sans-serif",
      fontSize:13, lineHeight:1.5,
      color:'rgba(123, 162, 217, 0.85)', // bluish secondary like the reference
    },

    // 5 — Itinerary (bottom-left wide)
    tileItinerary: {
      gridColumn:'1 / span 7',
      gridRow:'5 / span 2',
      padding:'20px 26px',
    },
    itinHead: {
      display:'flex', alignItems:'center', gap:10,
      color:'#fff', marginBottom:10,
    },
    itinCount: {
      marginLeft:'auto',
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.25em', color:'#ffd100',
    },
    itinList: {
      display:'grid', gridTemplateColumns:'1fr 1fr',
      columnGap:24, rowGap:6,
      listStyle:'none', padding:0, margin:0,
      flex:1, alignContent:'center',
    },
    itinItem: {
      display:'flex', alignItems:'baseline', gap:10,
      paddingBottom:6,
      borderBottom:'1px solid rgba(255,220,170,0.08)',
    },
    itinNum: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.2em', color:'#ffd100', flexShrink:0, minWidth:20,
    },
    itinText: {
      fontFamily:"'DM Serif Display', serif",
      fontSize:'clamp(13px, 1.05vw, 16px)',
      color:'#f4ecd4', lineHeight:1.3,
    },

    // 6 — Finale (dish + soundtrack)
    tileFinale: {
      gridColumn:'8 / span 5',
      gridRow:'5 / span 2',
      padding:0,
    },
    finaleBg: { position:'absolute', inset:0, zIndex:0 },
    finaleImg: {
      position:'absolute', inset:0,
      backgroundSize:'cover', backgroundPosition:'center',
      filter:'saturate(0.8) contrast(1.05)',
    },
    finaleVeil: {
      position:'absolute', inset:0,
      background:'linear-gradient(115deg, rgba(7,15,31,0.92) 0%, rgba(7,15,31,0.7) 60%, rgba(7,15,31,0.5) 100%)',
    },
    finaleInner: {
      position:'relative', zIndex:1, height:'100%',
      padding:'22px 26px',
      display:'flex', flexDirection:'column', justifyContent:'center', gap:14,
    },
    finaleRow: { display:'flex', flexDirection:'column', gap:5 },
    finaleLabel: {
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.3em', color:'#ffd100', textTransform:'uppercase',
    },
    finaleDish: {
      fontFamily:"'DM Serif Display', serif", fontStyle:'italic',
      fontSize:'clamp(20px, 1.7vw, 28px)', color:'#fff', lineHeight:1.2,
    },
    finalePlay: {
      display:'flex', alignItems:'center', gap:9,
      fontFamily:"'DM Serif Display', serif",
      fontSize:'clamp(15px, 1.15vw, 19px)', color:'#f4ecd4',
    },
    finaleSep: {
      width:40, height:1, background:'rgba(255,220,170,0.25)',
    },

    // Colophon
    colophon: {
      flexShrink:0,
      display:'flex', justifyContent:'center', alignItems:'center', gap:16,
      padding:'12px 38px 0',
      margin:'0 14px',
      fontFamily:"'JetBrains Mono', monospace", fontSize:9,
      letterSpacing:'0.3em', color:'rgba(244,236,212,0.4)',
    },
    colSep: { color:'rgba(244,236,212,0.2)' },
  };

  // Inject keyframes
  if (!document.getElementById('moodboard-anim')){
    const s = document.createElement('style');
    s.id = 'moodboard-anim';
    s.textContent = `@keyframes mb-fade { from { opacity:0 } to { opacity:1 } }`;
    document.head.appendChild(s);
  }

  window.Moodboard = Moodboard;
})();
