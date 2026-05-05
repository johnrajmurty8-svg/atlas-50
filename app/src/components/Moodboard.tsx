'use client';

import { useEffect, useRef, useState } from 'react';
import type { Destination } from '../lib/types';

interface MoodboardProps {
  destination: Destination;
  isWished: boolean;
  onToggleWish: (id: string) => void;
  onClose: () => void;
}

// ─── Design tokens shared by all Bin 4 card components ───────
const T = {
  bg:         '#070f1f',
  bgDeep:     '#040d1e',
  cream:      '#f4ecd4',
  creamDim:   'rgba(240,232,208,0.65)',
  creamFaint: 'rgba(244,236,212,0.28)',
  amber:      '#ffd100',
  amberHi:    'rgba(255,209,0,0.82)',
  amberMid:   'rgba(255,209,0,0.72)',
  amberLo:    'rgba(255,209,0,0.42)',
  blue:       'rgba(140,185,255,0.62)',
  blueMid:    'rgba(140,185,255,0.30)',
  blueAtm1:   'rgba(110,165,255,0.23)',
  blueAtm2:   'rgba(110,165,255,0.10)',
  blueAtm3:   'rgba(110,165,255,0.04)',
  blueSeason: 'rgba(140,185,255,0.26)',
  other:      'rgba(255,220,170,0.16)',
  fontSerif:  "'DM Serif Display', serif",
  fontSans:   "'Inter', sans-serif",
  fontMono:   "'JetBrains Mono', monospace",
};

const CARD_NAMES = [
  'GLOBE — LOCATION',
  'SEASON WHEEL',
  'VIBE RADAR',
  'CROWD CALENDAR',
  'COST BREAKDOWN',
];

// ─── Card 1: Globe ────────────────────────────────────────────
function GlobeCard({ d }: { d: Destination }) {
  const [localTime, setLocalTime] = useState('—');
  const planeRef  = useRef<SVGGElement>(null);
  const planeRef2 = useRef<SVGGElement>(null);
  const planeRef3 = useRef<SVGGElement>(null);
  const planeRef4 = useRef<SVGGElement>(null);
  const planeRef5 = useRef<SVGGElement>(null);
  const planeRef6 = useRef<SVGGElement>(null);

  useEffect(() => {
    const fmt = () => {
      if (!d.timezone) return '—';
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: d.timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
      } catch { return '—'; }
    };
    setLocalTime(fmt());
    const id = setInterval(() => setLocalTime(fmt()), 30000);
    return () => clearInterval(id);
  }, [d.timezone]);

  useEffect(() => {
    const GCX = 93, GCY = 86;
    // Orbit 1 — primary, -30° tilt (rx=82, ry=28)
    const ORX1 = 82, ORY1 = 28, TILT1 = -30 * Math.PI / 180;
    const cosTilt1 = Math.cos(TILT1), sinTilt1 = Math.sin(TILT1);
    // Orbit 2 — secondary, +22° tilt (rx=82, ry=18)
    const ORX2 = 82, ORY2 = 18, TILT2 = 22 * Math.PI / 180;
    const cosTilt2 = Math.cos(TILT2), sinTilt2 = Math.sin(TILT2);
    // Orbit 3 — horizontal equatorial (rx=82, ry=14), right-to-left
    const ORX3 = 82, ORY3 = 14, cosTilt3 = 1, sinTilt3 = 0;
    const speed = 0.0148;
    let t = 0;
    let rafId: number;
    // dir: 1 = CCW (left→right across front), -1 = CW (right→left across front)
    const animPlane = (
      ref: React.RefObject<SVGGElement>,
      angle: number,
      ORX: number, ORY: number,
      cosTilt: number, sinTilt: number,
      dir: 1 | -1 = 1
    ) => {
      const c = Math.cos(angle), s = Math.sin(angle);
      const px = GCX + ORX * c * cosTilt - ORY * s * sinTilt;
      const py = GCY + ORX * c * sinTilt + ORY * s * cosTilt;
      const vx = dir * (-ORX * s * cosTilt - ORY * c * sinTilt);
      const vy = dir * (-ORX * s * sinTilt + ORY * c * cosTilt);
      const heading = Math.atan2(vy, vx) * 180 / Math.PI + 90;
      const opacity = Math.max(0, Math.min(1, (-s + 0.15) / 0.30));
      if (ref.current) {
        ref.current.setAttribute('transform', `translate(${px.toFixed(2)},${py.toFixed(2)}) rotate(${heading.toFixed(1)})`);
        ref.current.setAttribute('opacity', opacity.toFixed(3));
      }
    };
    const tick = () => {
      t = (t + speed) % (Math.PI * 2);
      // Orbit 1 — two planes at opposite phases; always one visible
      animPlane(planeRef,  t,           ORX1, ORY1, cosTilt1, sinTilt1);
      animPlane(planeRef3, t + Math.PI, ORX1, ORY1, cosTilt1, sinTilt1);
      // Orbit 2 — two planes at opposite phases; always one visible
      const t2offset = Math.PI * 0.6;
      animPlane(planeRef2, t + t2offset,           ORX2, ORY2, cosTilt2, sinTilt2);
      animPlane(planeRef4, t + t2offset + Math.PI, ORX2, ORY2, cosTilt2, sinTilt2);
      // Orbit 3 — horizontal, right-to-left (dir = -1)
      const t3offset = Math.PI * 1.2;
      animPlane(planeRef5, t + t3offset,           ORX3, ORY3, cosTilt3, sinTilt3, 1);
      animPlane(planeRef6, t + t3offset + Math.PI, ORX3, ORY3, cosTilt3, sinTilt3, 1);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const CX = 93, CY = 86, R = 67;
  const latStr = `${Math.abs(d.lat).toFixed(1)}°${d.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(d.lon).toFixed(1)}°${d.lon >= 0 ? 'E' : 'W'}`;

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
        01 of 05 — Location
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 27, color: '#f0e8d0', marginBottom: 4, paddingRight: 70 }}>
        {d.region} · {d.name}
      </div>
      <div style={{ fontFamily: T.fontSans, fontSize: 16, color: T.creamDim, letterSpacing: '0.03em', marginBottom: 15 }}>
        {latStr} · {lonStr}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <svg width={308} height={288} viewBox="0 0 186 172">
          <defs>
            <clipPath id="gc">
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>
          </defs>
          {/* Atmosphere rings — slow pulse */}
          <g style={{ animation: 'gc-halo-pulse 4s ease-in-out infinite' }}>
            <circle cx={CX} cy={CY} r={R + 3.5}  fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
            <circle cx={CX} cy={CY} r={R + 7.5}  fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
            <circle cx={CX} cy={CY} r={R + 12}   fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={4.5} />
          </g>
          {/* Globe base */}
          <circle cx={CX} cy={CY} r={R} fill={T.bgDeep} />
          <g clipPath="url(#gc)">
            <ellipse cx={CX} cy={CY} rx={33.5} ry={R} fill="none" stroke="rgba(255,220,170,0.05)" strokeWidth={0.5} />
            <ellipse cx={CX} cy={CY} rx={58}   ry={R} fill="none" stroke="rgba(255,220,170,0.04)" strokeWidth={0.5} />
            <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="rgba(255,220,170,0.05)" strokeWidth={0.5} />
            <path d="M26,67 C59,108 127,108 160,67" fill="none" stroke="rgba(255,220,170,0.20)" strokeWidth={0.6} strokeDasharray="2.5,2.5" />
            <path d="M26,86 C59,132 127,132 160,86" fill="none" stroke="rgba(255,220,170,0.12)" strokeWidth={0.6} strokeDasharray="2.5,2.5" />
            {d.globe_path && <path d={d.globe_path} fill="rgba(255,209,0,0.68)" stroke="rgba(255,209,0,0.20)" strokeWidth={0.5} />}
            <text x={120} y={70}  fontFamily={T.fontMono} fontSize={6} fill="rgba(255,220,170,0.30)" letterSpacing="0.05em">TROPIC OF CANCER</text>
            <text x={120} y={89}  fontFamily={T.fontMono} fontSize={6} fill="rgba(255,220,170,0.20)" letterSpacing="0.05em">EQUATOR</text>
          </g>
          {/* Globe edge */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,220,170,0.22)" strokeWidth={0.5} />
          {/* Destination pin */}
          <circle cx={CX} cy={84} r={3.5} fill={T.amber} />
          <circle cx={CX} cy={84} r={7.5} fill="none" stroke="rgba(255,209,0,0.48)" strokeWidth={0.9} />
          <circle cx={CX} cy={84} r={12}  fill="none" stroke="rgba(255,209,0,0.18)" strokeWidth={0.6} />
          {/* Orbit paths — three dotted routes */}
          <ellipse cx={CX} cy={CY} rx={82} ry={28}
            transform={`rotate(-30,${CX},${CY})`}
            fill="none" stroke="rgba(255,209,0,0.32)" strokeWidth={0.7} strokeDasharray="3,2.5" />
          <ellipse cx={CX} cy={CY} rx={82} ry={18}
            transform={`rotate(22,${CX},${CY})`}
            fill="none" stroke="rgba(255,209,0,0.32)" strokeWidth={0.7} strokeDasharray="3,2.5" />
          <ellipse cx={CX} cy={CY} rx={82} ry={14}
            fill="none" stroke="rgba(255,209,0,0.32)" strokeWidth={0.7} strokeDasharray="3,2.5" />
          {/* Planes — 2 per orbit at opposite phases, always one visible per orbit */}
          <g ref={planeRef}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
          <g ref={planeRef3}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
          <g ref={planeRef2}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
          <g ref={planeRef4}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
          <g ref={planeRef5}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
          <g ref={planeRef6}>
            <path d="M0,-6.25 L1.5,-2.5 L5.6,0.6 L1.9,0 L1.5,4.4 L0,3.1 L-1.5,4.4 L-1.9,0 L-5.6,0.6 L-1.5,-2.5 Z" fill={T.amber} />
          </g>
        </svg>
      </div>

      {/* Bottom info strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid rgba(255,220,170,0.10)', paddingTop: 15, marginTop: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.creamFaint, letterSpacing: '0.08em' }}>
            LOCAL TIME · {d.name.toUpperCase()}
          </span>
          <span style={{ fontFamily: T.fontSerif, fontSize: 22, color: T.cream }}>{localTime}</span>
        </div>
        <div style={{ width: 0.5, height: 42, background: 'rgba(255,220,170,0.10)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.creamFaint, letterSpacing: '0.08em' }}>FROM LHR</span>
          <span style={{ fontFamily: T.fontSerif, fontSize: 22, color: T.cream }}>{d.flight_time_lhr ?? '—'}</span>
        </div>
      </div>
    </>
  );
}

// ─── Card 2: Season Wheel ─────────────────────────────────────
function SeasonWheelCard({ d }: { d: Destination }) {
  const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const CX = 100, CY = 100, R_OUT = 62, R_IN = 38, R_TEMP = 82;
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const peakMonths = d.peak_months ?? [];
  const temps = d.monthly_temps ?? [];

  if (peakMonths.length === 0 || temps.length === 0) {
    return (
      <>
        <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
          02 of 05 — Best Season
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.creamFaint, fontFamily: T.fontMono, fontSize: 15 }}>—</div>
      </>
    );
  }

  const peakStart = MONTH_NAMES[peakMonths[0]];
  const peakEnd   = MONTH_NAMES[peakMonths[peakMonths.length - 1]];

  const segments = MONTHS.map((m, i) => {
    const a0   = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const a1   = ((i + 0.85) / 12) * Math.PI * 2 - Math.PI / 2;
    const aMid = ((i + 0.5)  / 12) * Math.PI * 2 - Math.PI / 2;
    const isPeak = peakMonths.includes(i);
    const temp = temps[i] ?? 0;
    const warmRatio = Math.max(0, Math.min(1, (temp - 5) / 28));

    const x1 = CX + Math.cos(a0) * R_IN,  y1 = CY + Math.sin(a0) * R_IN;
    const x2 = CX + Math.cos(a0) * R_OUT, y2 = CY + Math.sin(a0) * R_OUT;
    const x3 = CX + Math.cos(a1) * R_OUT, y3 = CY + Math.sin(a1) * R_OUT;
    const x4 = CX + Math.cos(a1) * R_IN,  y4 = CY + Math.sin(a1) * R_IN;
    const pathD = `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${R_OUT},${R_OUT},0,0,1,${x3.toFixed(2)},${y3.toFixed(2)} L${x4.toFixed(2)},${y4.toFixed(2)} A${R_IN},${R_IN},0,0,0,${x1.toFixed(2)},${y1.toFixed(2)}Z`;

    const mx = CX + Math.cos(aMid) * (R_IN + (R_OUT - R_IN) * 0.5);
    const my = CY + Math.sin(aMid) * (R_IN + (R_OUT - R_IN) * 0.5);
    const tx = CX + Math.cos(aMid) * R_TEMP;
    const ty = CY + Math.sin(aMid) * R_TEMP;

    return { m, i, isPeak, temp, warmRatio, pathD, mx, my, tx, ty };
  });

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
        02 of 05 — Best Season
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 27, color: '#f0e8d0', marginBottom: 4, paddingRight: 70 }}>
        {peakStart} → {peakEnd}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <svg width={350} height={350} viewBox="0 0 200 200" style={{ marginTop: -19 }}>
          {segments.map(({ i, isPeak, pathD, mx, my, tx, ty, m, temp, warmRatio }) => {
            const isHov = hoveredMonth === i;
            const dim   = hoveredMonth !== null && !isHov;
            return (
              <g key={i}
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                <path d={pathD} fill={isPeak ? T.amberMid : T.blueSeason} stroke={T.bg} strokeWidth={1.5}
                  style={{
                    opacity: dim ? 0.45 : 1,
                    filter: isHov ? 'brightness(1.4)' : 'none',
                    transform: isHov ? 'scale(1.20)' : 'scale(1)',
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    transition: 'opacity 0.2s, filter 0.2s, transform 0.2s ease',
                  }} />
                <text x={mx} y={my + 3} textAnchor="middle" fontFamily={T.fontMono} fontSize={7}
                  fill={isPeak ? 'rgba(7,15,31,0.9)' : 'rgba(160,200,255,0.7)'}>
                  {m}
                </text>
                <text x={tx} y={ty + 3} textAnchor="middle" fontFamily={T.fontMono} fontSize={9}
                  fill={isPeak
                    ? `rgba(255,209,0,${(0.5 + warmRatio * 0.5).toFixed(2)})`
                    : `rgba(140,195,255,${(0.38 + (1 - warmRatio) * 0.3).toFixed(2)})`}>
                  {temp}°
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke="rgba(255,220,170,0.12)" strokeWidth={0.5} />
          <circle cx={CX} cy={CY} r={R_IN}  fill={T.bg} stroke="rgba(255,220,170,0.10)" strokeWidth={0.5} />
          <text x={CX} y={CY - 10} textAnchor="middle" fontFamily={T.fontMono} fontSize={6}
            fill="rgba(244,236,212,0.30)" letterSpacing="0.1em">AVG</text>
          <text x={CX} y={CY + 5} textAnchor="middle" fontFamily={T.fontSerif} fontSize={18}
            fill="rgba(244,236,212,0.75)">{Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length)}</text>
          <text x={CX} y={CY + 17} textAnchor="middle" fontFamily={T.fontMono} fontSize={6}
            fill="rgba(244,236,212,0.30)" letterSpacing="0.1em">°C</text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
        {[
          { color: T.amberMid,   label: 'PEAK' },
          { color: T.blueSeason, label: 'OFF SEASON' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 12, height: 12, background: color }} />
            <span style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(244,236,212,0.35)', letterSpacing: '0.06em' }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Card 3: Vibe Radar ───────────────────────────────────────
function VibeRadarCard({ d }: { d: Destination }) {
  const AXES = [
    { key: 'cultural'  as const, label: 'CULTURAL',  offsetX: 0,   offsetY: -80 },
    { key: 'romantic'  as const, label: 'ROMANTIC',  offsetX: 76,  offsetY: -27 },
    { key: 'social'    as const, label: 'SOCIAL',    offsetX: 48,  offsetY: 55  },
    { key: 'spiritual' as const, label: 'SPIRITUAL', offsetX: -48, offsetY: 55  },
    { key: 'adventure' as const, label: 'ADVENTURE', offsetX: -78, offsetY: -27 },
  ];
  const N = 5, R = 60, CX = 120, CY = 110;
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  if (!d.vibe_scores) {
    return (
      <>
        <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
          03 of 05 — Vibe Fingerprint
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.creamFaint, fontFamily: T.fontMono, fontSize: 15 }}>—</div>
      </>
    );
  }

  const gridRings = [0.33, 0.66, 1].map(s =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      return `${(Math.cos(a) * R * s).toFixed(2)},${(Math.sin(a) * R * s).toFixed(2)}`;
    }).join(' ')
  );

  const filledPoints = AXES.map(({ key }, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const v = d.vibe_scores![key];
    return `${(Math.cos(a) * R * v).toFixed(2)},${(Math.sin(a) * R * v).toFixed(2)}`;
  }).join(' ');

  const dots = AXES.map(({ key }, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const v = d.vibe_scores![key];
    return { cx: Math.cos(a) * R * v, cy: Math.sin(a) * R * v };
  });

  const topVibes = Object.entries(d.vibe_scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(' · ');

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
        03 of 05 — Vibe Fingerprint
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 27, color: '#f0e8d0', marginBottom: 4, paddingRight: 70 }}>{d.name}</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 16, color: T.creamDim, marginBottom: 15 }}>{topVibes}</div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={461} height={408} viewBox="0 0 240 212" style={{ marginTop: -38 }}>
          <g transform={`translate(${CX},${CY})`}>
            {gridRings.map((pts, i) => (
              <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth={0.5} />
            ))}
            {AXES.map(({ key }, i) => {
              const a = (i / N) * Math.PI * 2 - Math.PI / 2;
              return (
                <line key={key} x1={0} y1={0}
                  x2={parseFloat((Math.cos(a) * R).toFixed(2))}
                  y2={parseFloat((Math.sin(a) * R).toFixed(2))}
                  stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
              );
            })}
            <polygon points={filledPoints}
              fill={hoveredAxis ? 'rgba(255,209,0,0.16)' : 'rgba(255,209,0,0.10)'}
              stroke={T.amber} strokeWidth={1}
              style={{ transition: 'fill 0.2s' }} />
            {AXES.map(({ label, offsetX, offsetY, key }, i) => {
              const isHov = hoveredAxis === key;
              return (
                <g key={key}
                  onMouseEnter={() => setHoveredAxis(key)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  style={{ cursor: 'default' }}
                >
                  <circle cx={dots[i].cx} cy={dots[i].cy} r={2.5} fill={T.amber}
                    style={{
                      transform: isHov ? 'scale(1.9)' : 'scale(1)',
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease',
                    }} />
                  <text x={offsetX} y={offsetY}
                    textAnchor={offsetX < 0 ? 'end' : offsetX > 0 ? 'start' : 'middle'}
                    fontFamily={T.fontMono} fontSize={8}
                    fill={isHov ? 'rgba(255,209,0,0.95)' : 'rgba(240,232,208,0.85)'}
                    style={{ transition: 'fill 0.2s' }}>
                    {label}
                  </text>
                  <text x={offsetX} y={offsetY + 12}
                    textAnchor={offsetX < 0 ? 'end' : offsetX > 0 ? 'start' : 'middle'}
                    fontFamily={T.fontMono} fontSize={9}
                    fill={T.amber}
                    style={{ opacity: isHov ? 1 : 0, transition: 'opacity 0.2s' }}>
                    {(d.vibe_scores![key] * 5).toFixed(1)} / 5
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </>
  );
}

// ─── Card 4: Crowd Calendar ───────────────────────────────────
function CrowdCalendarCard({ d }: { d: Destination }) {
  const BAR_W = 22, MAX_H = 179, GAP = 5, START_X = 6;
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const SVG_W = 346, SVG_H = 240;

  if (!d.crowd_index || d.crowd_index.length < 12) {
    return (
      <>
        <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
          04 of 05 — Crowd Index
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.creamFaint, fontFamily: T.fontMono, fontSize: 15 }}>—</div>
      </>
    );
  }

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
        04 of 05 — Crowd Index
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 27, color: '#f0e8d0', marginBottom: 4, paddingRight: 70 }}>When to Go</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 16, color: T.creamDim, marginBottom: 15 }}>
        Bar height = tourist volume
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <svg width={SVG_W} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {d.crowd_index.map((v, i) => {
            const barH  = Math.round((v / 10) * MAX_H);
            const x     = START_X + i * (BAR_W + GAP);
            const alpha = 0.10 + (v / 10) * 0.72;
            const isHov = hoveredBar === i;
            const dim   = hoveredBar !== null && !isHov;
            return (
              <rect key={i}
                x={x} y={MAX_H - barH + 10}
                width={BAR_W} height={barH}
                fill={`rgba(255,209,0,${(isHov ? Math.min(1, alpha * 1.6) : dim ? alpha * 0.35 : alpha).toFixed(2)})`}
                stroke={isHov ? 'rgba(255,209,0,0.55)' : 'rgba(255,220,170,0.08)'} strokeWidth={0.5}
                style={{
                  transition: 'fill 0.15s, stroke 0.15s, transform 0.15s ease',
                  cursor: 'default',
                  transform: isHov ? 'scaleY(1.07)' : 'scaleY(1)',
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              />
            );
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: 346, padding: '0 2px' }}>
          {['JAN', 'JUN', 'DEC'].map(m => (
            <span key={m} style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(240,232,208,0.65)', letterSpacing: '0.06em' }}>{m}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 346 }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(240,232,208,0.65)' }}>QUIET</span>
          <div style={{ flex: 1, height: 3, background: 'linear-gradient(to right,rgba(255,220,170,0.12),rgba(255,209,0,0.70))' }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(240,232,208,0.65)' }}>BUSY</span>
        </div>
      </div>
    </>
  );
}

// ─── Card 5: Cost Breakdown ───────────────────────────────────
function CostBreakdownCard({ d }: { d: Destination }) {
  const CX = 85, CY = 85, R_OUT = 75, R_IN = 45;
  const [hoveredSeg, setHoveredSeg] = useState<string | null>(null);

  const SEGMENTS = [
    { key: 'accommodation' as const, label: 'ACCOMMODATION', color: T.amberHi },
    { key: 'food'          as const, label: 'FOOD & DRINK',  color: T.amberLo },
    { key: 'activities'    as const, label: 'ACTIVITIES',    color: T.blue    },
    { key: 'transport'     as const, label: 'TRANSPORT',     color: T.blueMid },
    { key: 'other'         as const, label: 'OTHER',         color: T.other   },
  ];

  if (!d.cost_breakdown || !d.cost_breakdown_amounts) {
    return (
      <>
        <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
          05 of 05 — Cost Breakdown
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.creamFaint, fontFamily: T.fontMono, fontSize: 15 }}>—</div>
      </>
    );
  }

  let angle = -Math.PI / 2;
  const arcs = SEGMENTS.map(seg => {
    const pct   = d.cost_breakdown![seg.key] / 100;
    const sweep = pct * Math.PI * 2;
    const GAP   = 0.03;
    const a0    = angle + GAP;
    const a1    = angle + sweep - GAP;
    const large = sweep > Math.PI ? 1 : 0;

    const x1 = CX + Math.cos(a0) * R_IN,  y1 = CY + Math.sin(a0) * R_IN;
    const x2 = CX + Math.cos(a0) * R_OUT, y2 = CY + Math.sin(a0) * R_OUT;
    const x3 = CX + Math.cos(a1) * R_OUT, y3 = CY + Math.sin(a1) * R_OUT;
    const x4 = CX + Math.cos(a1) * R_IN,  y4 = CY + Math.sin(a1) * R_IN;
    const pathD = `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${R_OUT},${R_OUT},0,${large},1,${x3.toFixed(2)},${y3.toFixed(2)} L${x4.toFixed(2)},${y4.toFixed(2)} A${R_IN},${R_IN},0,${large},0,${x1.toFixed(2)},${y1.toFixed(2)}Z`;

    angle += sweep;
    return { ...seg, pathD, pct };
  });

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 13, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>
        05 of 05 — Cost Breakdown
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 27, color: '#f0e8d0', marginBottom: 4, paddingRight: 70 }}>
        Est. Daily Spend
      </div>
      <div style={{ fontFamily: T.fontSans, fontSize: 16, color: T.creamDim, marginBottom: 15 }}>
        Per person · {d.name}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {/* Donut SVG */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={171} height={171} viewBox="0 0 171 171">
            {arcs.map(({ key, pathD, color }) => (
              <path key={key} d={pathD} fill={color} stroke={T.bg} strokeWidth={1.5}
                style={{
                  transform: hoveredSeg === key ? 'scale(1.07)' : 'scale(1)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  opacity: hoveredSeg === null || hoveredSeg === key ? 1 : 0.45,
                  transition: 'transform 0.2s ease, opacity 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={() => setHoveredSeg(key)}
                onMouseLeave={() => setHoveredSeg(null)}
              />
            ))}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: 'rgba(244,236,212,0.28)', letterSpacing: '0.07em' }}>EST/DAY</span>
            <span style={{ fontFamily: T.fontSerif, fontSize: 27, color: T.cream, lineHeight: 1.1 }}>{d.cost_daily_total ?? '—'}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.06em' }}>PER PERSON</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {arcs.map(({ key, label, color, pct }) => (
            <div key={key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9,
                opacity: hoveredSeg === null || hoveredSeg === key ? 1 : 0.4,
                transition: 'opacity 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredSeg(key)}
              onMouseLeave={() => setHoveredSeg(null)}
            >
              <div style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: T.fontMono, fontSize: 13, color: 'rgba(240,232,208,0.90)', letterSpacing: '0.05em', flex: 1 }}>{label}</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 13, color: '#f0e8d0' }}>{Math.round(pct * 100)}%</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 13, color: 'rgba(240,232,208,0.55)', minWidth: 51, textAlign: 'right' }}>
                {d.cost_breakdown_amounts![key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid rgba(255,220,170,0.08)', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.05em' }}>BUDGET TRAVELLER</span>
        <span style={{ fontFamily: T.fontMono, fontSize: 12, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.05em' }}>{d.cost_budget_daily ?? '—'}</span>
      </div>
    </>
  );
}

// ─── Bin 4: 5-card paginated location widget ──────────────────
function Bin4LocationWidget({ d, cur, setCur }: { d: Destination; cur: number; setCur: (n: number) => void }) {
  const total = 5;
  const prev  = () => setCur((cur + total - 1) % total);
  const next  = () => setCur((cur + 1) % total);

  const CARDS = [
    <GlobeCard         key="globe"  d={d} />,
    <SeasonWheelCard   key="season" d={d} />,
    <VibeRadarCard     key="vibe"   d={d} />,
    <CrowdCalendarCard key="crowd"  d={d} />,
    <CostBreakdownCard key="cost"   d={d} />,
  ];

  const btnStyle: React.CSSProperties = {
    width: 26, height: 26,
    background: 'rgba(255,220,170,0.06)',
    border: '0.5px solid rgba(255,220,170,0.18)',
    color: 'rgba(244,236,212,0.60)',
    fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card frame */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            opacity: i === cur ? 1 : 0,
            pointerEvents: i === cur ? 'auto' : 'none',
            transition: 'opacity 0.4s ease',
          }}>
            {card}
          </div>
        ))}

        {/* Nav — absolutely positioned top-right, overlays all cards */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={btnStyle} onClick={prev}>‹</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: total }, (_, i) => (
              <div key={i} onClick={() => setCur(i)} style={{
                width: 5, height: 5, borderRadius: '50%', cursor: 'pointer',
                background: i === cur ? T.amber : 'rgba(255,220,170,0.18)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <button style={btnStyle} onClick={next}>›</button>
        </div>
      </div>

      {/* Meta label row — counter only, right-aligned */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 9, flexShrink: 0 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 13, color: 'rgba(244,236,212,0.28)', letterSpacing: '0.08em' }}>
          {String(cur + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// ─── Main Moodboard component ─────────────────────────────────
export default function Moodboard({ destination, isWished, onToggleWish, onClose }: MoodboardProps) {
  const [mounted,        setMounted]        = useState(false);
  const [hoveredTile,    setHoveredTile]    = useState<number | null>(null);
  // Bin 1 carousel state
  const [carouselIdx,    setCarouselIdx]    = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselHover,  setCarouselHover]  = useState<'prev' | 'next' | null>(null);
  // Bin 4 widget state
  const [bin4Cur,        setBin4Cur]        = useState(0);

  // Reset all per-destination state when destination changes
  useEffect(() => {
    setMounted(false);
    setCarouselIdx(0);
    setCarouselPaused(false);
    setBin4Cur(0);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [destination.id]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Inject animation + carousel button hover CSS
  useEffect(() => {
    if (!document.getElementById('moodboard-anim')) {
      const s = document.createElement('style');
      s.id = 'moodboard-anim';
      s.textContent = [
        '@keyframes mb-fade { from { opacity:0 } to { opacity:1 } }',
        '.mb-carousel-btn:hover { color: #f4ecd4 !important; }',
        '@keyframes gc-halo-pulse { 0%,100% { opacity:0.08 } 50% { opacity:1 } }',
      ].join('\n');
      document.head.appendChild(s);
    }
  }, []);

  // Preload all 5 carousel images for this destination
  useEffect(() => {
    destination.images.slice(0, 5).forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, [destination.images]);

  // Carousel auto-advance — 6.5s interval, pauses when carouselPaused
  useEffect(() => {
    if (carouselPaused) return;
    const count = Math.min(destination.images.length, 5);
    const id = setInterval(() => setCarouselIdx(i => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [carouselPaused, destination.images.length]);

  const imgCount = Math.min(destination.images.length, 5);
  const img      = destination.images;
  const issueNo  = String((destination.id.length * 7 % 80) + 10).padStart(3, '0');
  const weatherTemp = destination.weather.split('·')[0].trim();
  const weatherSub  = destination.weather.split('·').slice(1).join(' · ').trim() || 'Mediterranean climate';

  const tile = (i: number, hovered = false): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted
      ? (hovered ? 'translateY(-5px) scale(1.014)' : 'translateY(0) scale(1)')
      : 'translateY(18px)',
    transition: mounted
      ? `opacity .7s cubic-bezier(.2,.8,.2,1) ${80 + i * 70}ms, transform 0.13s cubic-bezier(.2,.8,.2,1), border-color 0.1s ease, box-shadow 0.1s ease`
      : `opacity .7s cubic-bezier(.2,.8,.2,1) ${80 + i * 70}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${80 + i * 70}ms, border-color 0.1s ease, box-shadow 0.1s ease`,
    borderColor: hovered ? 'rgba(255,209,0,0.75)' : 'rgba(255,220,170,0.08)',
    ...(hovered ? {
      boxShadow: '0 14px 40px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,209,0,0.08)',
    } : {}),
  });

  return (
    <div style={S.root}>
      {/* Yellow magazine frame */}
      <div style={S.frame} />

      {/* Top chrome — brand + issue + save + close */}
      <div style={S.topbar}>
        <div style={S.topLeft}>
          <span style={S.brandDot} />
          <span style={S.brandText}>ATLAS / 50</span>
          <span style={S.topSep}>·</span>
          <span style={S.topMeta}>VOL. XXVI</span>
          <span style={S.topSep}>·</span>
          <span style={S.topMeta}>No. {issueNo}</span>
          <span style={S.topSep}>·</span>
          <span style={S.topMeta}>{destination.region.toUpperCase()}</span>
        </div>
        <div style={S.topRight}>
          <button
            style={{
              ...S.wishBtn,
              color: isWished ? '#ffd100' : '#f4ecd4',
              borderColor: isWished ? '#ffd100' : 'rgba(255,255,255,0.18)',
            }}
            onClick={() => onToggleWish(destination.id)}
          >
            <svg width="11" height="11" viewBox="0 0 14 14"
              fill={isWished ? '#ffd100' : 'none'}
              stroke="currentColor" strokeWidth="1.4">
              <path d="M7 12.5 L2 7.5 A3 3 0 0 1 7 3 A3 3 0 0 1 12 7.5 Z" />
            </svg>
            <span>{isWished ? 'SAVED' : 'SAVE'}</span>
          </button>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bento grid — 12 cols × 6 rows */}
      <div style={S.grid}>

        {/* TILE 1 — Hero: ambient crossfade carousel */}
        {/* TODO: clicking this bin should open a full-screen image collage view (V10) */}
        <div style={{ ...S.cell, ...S.tileHero, ...tile(0, hoveredTile === 0) }}
          onMouseEnter={() => { setHoveredTile(0); setCarouselPaused(true); }}
          onMouseLeave={() => { setHoveredTile(null); setCarouselPaused(false); }}>
          <div style={S.heroBg} aria-hidden="true">
            {destination.images.slice(0, 5).map((src, i) => (
              <div key={src} style={{
                ...S.heroImg,
                backgroundImage: `url(${src})`,
                opacity: i === carouselIdx ? 1 : 0,
                transition: 'opacity 1.2s ease',
              }} />
            ))}
            <div style={S.heroVeil} />
          </div>
          <div style={S.heroInner}>
            <div style={S.heroDisplay} aria-hidden="true">
              <span style={S.heroDisplayChar}>{destination.name[0]}</span>
              {destination.name[1] && (
                <span style={S.heroDisplayCharSm}>{destination.name[1].toLowerCase()}</span>
              )}
            </div>
            <div>
              <div style={S.heroTitle}>{destination.name}</div>
              <div style={S.heroSub}>{destination.tagline}</div>
            </div>
          </div>
          {/* Carousel arrows — bottom right, minimal style */}
          <div style={S.carouselArrows}>
            <button
              className="mb-carousel-btn"
              style={{ ...S.carouselBtn, color: carouselHover === 'prev' ? '#f4ecd4' : 'rgba(244,236,212,0.45)' }}
              onMouseEnter={() => setCarouselHover('prev')}
              onMouseLeave={() => setCarouselHover(null)}
              onClick={() => setCarouselIdx(i => (i + imgCount - 1) % imgCount)}
              aria-label="Previous image"
            >‹</button>
            <button
              className="mb-carousel-btn"
              style={{ ...S.carouselBtn, color: carouselHover === 'next' ? '#f4ecd4' : 'rgba(244,236,212,0.45)' }}
              onMouseEnter={() => setCarouselHover('next')}
              onMouseLeave={() => setCarouselHover(null)}
              onClick={() => setCarouselIdx(i => (i + 1) % imgCount)}
              aria-label="Next image"
            >›</button>
          </div>
        </div>

        {/* TILE 2 — Themes */}
        <div style={{ ...S.cell, ...S.tileThemes, ...tile(1, hoveredTile === 1) }}
          onMouseEnter={() => setHoveredTile(1)} onMouseLeave={() => setHoveredTile(null)}>
          <div style={S.themesGlyph}>
            <span style={{ ...S.themesBar, width: '74%' }} />
            <span style={{ ...S.themesBar, width: '58%' }} />
            <span style={{ ...S.themesBar, width: '68%' }} />
          </div>
          <div style={S.tileTitle}>Themes</div>
          <div style={S.tileBody}>
            {destination.themes.map(t => t[0].toUpperCase() + t.slice(1)).join(' · ')}
          </div>
        </div>

        {/* TILE 3 — Climate: SVG seasonal curve + weather data */}
        <div style={{ ...S.cell, ...S.tileClimate, ...tile(2, hoveredTile === 2) }}
          onMouseEnter={() => setHoveredTile(2)} onMouseLeave={() => setHoveredTile(null)}>
          <div style={S.climateChart}>
            <div style={S.climateLabel}>seasonal swing</div>
            <svg viewBox="0 0 200 36" style={S.climateSvg} preserveAspectRatio="none">
              <path d="M0 28 C 30 18, 60 8, 100 6 S 170 22, 200 28"
                stroke="#ffd100" strokeWidth="1.2" fill="none" />
              <path d="M0 28 C 30 18, 60 8, 100 6 S 170 22, 200 28 L200 36 L0 36 Z"
                fill="rgba(255,209,0,0.08)" />
            </svg>
            <div style={S.climateAxis}>
              <span>jan</span><span>apr</span><span>jul</span><span>oct</span>
            </div>
          </div>
          <div style={S.tileTitle}>{weatherTemp}</div>
          <div style={S.tileBody}>{weatherSub}</div>
        </div>

        {/* TILE 4 — Location widget: 5-card paginated info panel */}
        <div style={{ ...S.cell, ...S.tileGlobe, ...tile(3, hoveredTile === 3) }}
          onMouseEnter={() => setHoveredTile(3)} onMouseLeave={() => setHoveredTile(null)}>
          <Bin4LocationWidget d={destination} cur={bin4Cur} setCur={setBin4Cur} />
        </div>

        {/* TILE 5 — Itinerary: 5 experiences in 2-col grid */}
        <div style={{ ...S.cell, ...S.tileItinerary, ...tile(4, hoveredTile === 4) }}
          onMouseEnter={() => setHoveredTile(4)} onMouseLeave={() => setHoveredTile(null)}>
          <div style={S.itinHead}>
            <svg width="13" height="13" viewBox="0 0 14 14"
              fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="7" cy="5" r="2.5" />
              <path d="M7 8 L7 13 M3 13 L11 13" />
            </svg>
            <span style={S.tileTitle}>Itinerary</span>
            <span style={S.itinCount}>05 stops</span>
          </div>
          <ol style={S.itinList}>
            {destination.experiences.slice(0, 5).map((x, i) => (
              <li key={i} style={S.itinItem}>
                <span style={S.itinNum}>{String(i + 1).padStart(2, '0')}</span>
                <span style={S.itinText}>{x}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* TILE 6 — Finale: dish + soundtrack over image */}
        <div style={{ ...S.cell, ...S.tileFinale, ...tile(5, hoveredTile === 5) }}
          onMouseEnter={() => setHoveredTile(5)} onMouseLeave={() => setHoveredTile(null)}>
          <div style={S.finaleBg} aria-hidden="true">
            <div style={{ ...S.finaleImg, backgroundImage: `url(${img[2] || img[0]})` }} />
            <div style={S.finaleVeil} />
          </div>
          <div style={S.finaleInner}>
            <div style={S.finaleRow}>
              <div style={S.finaleLabel}>— SIGNATURE DISH</div>
              <div style={S.finaleDish}>{destination.dish}</div>
            </div>
            <div style={S.finaleSep} />
            <div style={S.finaleRow}>
              <div style={S.finaleLabel}>— ON THE GRAMOPHONE</div>
              <div style={S.finalePlay}>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="6" fill="none" stroke="#ffd100" strokeWidth="0.9" />
                  <circle cx="7" cy="7" r="1.4" fill="#ffd100" />
                </svg>
                <span>{destination.playlist}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom colophon */}
      <div style={S.colophon}>
        <span>EST. 1899</span>
        <span style={S.colSep}>· · ·</span>
        <span>FILED FROM {destination.name.toUpperCase()}</span>
        <span style={S.colSep}>· · ·</span>
        <span>SPRING MMXXVI</span>
      </div>
    </div>
  );
}

const cellBase: React.CSSProperties = {
  position: 'relative',
  background: 'rgba(20, 26, 44, 0.55)',
  border: '1px solid rgba(255,220,170,0.08)',
  borderRadius: 14,
  padding: '22px 24px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  willChange: 'opacity, transform',
};

const S: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'radial-gradient(ellipse at 50% 30%, #0d1733 0%, #060b1a 65%, #03060f 100%)',
    color: '#f4ecd4',
    fontFamily: 'var(--font-sans)',
    animation: 'mb-fade 0.45s ease',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 14,
    paddingBottom: 14,
  },
  frame: {
    position: 'fixed',
    top: 14, left: 14, right: 14, bottom: 14,
    border: '3px solid #ffd100',
    pointerEvents: 'none',
    zIndex: 200,
  },

  // Top chrome
  topbar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 38px 16px',
    borderBottom: '1px solid rgba(255,220,170,0.08)',
    margin: '0 14px',
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.3em',
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#ffd100',
    display: 'inline-block',
    flexShrink: 0,
  },
  brandText: { color: '#ffd100', fontWeight: 700 },
  topSep:    { color: 'rgba(244,236,212,0.3)' },
  topMeta:   { color: 'rgba(244,236,212,0.7)' },
  topRight:  { display: 'flex', gap: 8, alignItems: 'center' },
  wishBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '8px 14px',
    background: 'rgba(7,15,31,0.6)',
    border: '1px solid rgba(255,220,170,0.18)',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.25em',
    transition: 'all 0.2s',
  },
  closeBtn: {
    width: 32,
    height: 32,
    background: 'rgba(7,15,31,0.6)',
    border: '1px solid rgba(255,220,170,0.18)',
    cursor: 'pointer',
    color: '#f4ecd4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bento grid
  grid: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(6, 1fr)',
    gap: 14,
    padding: '18px 38px 14px',
    margin: '0 14px',
  },

  cell: cellBase,

  // Tile 1 — Hero carousel
  tileHero: {
    gridColumn: '1 / span 4',
    gridRow: '1 / span 4',
    padding: 0,
  },
  heroBg: { position: 'absolute', inset: 0, zIndex: 0 },
  heroImg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'saturate(0.85) contrast(1.05)',
  },
  heroVeil: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'linear-gradient(180deg, rgba(7,15,31,0.55) 0%, rgba(7,15,31,0.78) 100%)',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    padding: '30px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  heroDisplay: {
    fontFamily: 'var(--font-serif)',
    color: '#fff',
    lineHeight: 0.85,
    letterSpacing: -4,
    display: 'flex',
    alignItems: 'baseline',
  },
  heroDisplayChar:   { fontSize: 'clamp(140px, 13vw, 220px)' },
  heroDisplayCharSm: {
    fontSize: 'clamp(80px, 7vw, 120px)',
    opacity: 0.85,
    fontStyle: 'italic',
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(28px, 2.2vw, 38px)',
    color: '#fff',
    lineHeight: 1.05,
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 'clamp(13px, 1vw, 16px)',
    color: 'rgba(244,236,212,0.78)',
    lineHeight: 1.45,
    maxWidth: 380,
  },
  // Carousel arrows — absolutely positioned bottom-right of Tile 1
  carouselArrows: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 3,
    display: 'flex',
    gap: 6,
  },
  carouselBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 22,
    lineHeight: 1,
    padding: '2px 5px',
    transition: 'color 0.15s',
    fontFamily: "'Inter', sans-serif",
  },

  // Tile 2 — Themes
  tileThemes: {
    gridColumn: '5 / span 4',
    gridRow: '1 / span 2',
  },
  themesGlyph: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 'auto',
  },
  themesBar: {
    height: 8,
    background: 'rgba(244,236,212,0.32)',
    borderRadius: 0,
    display: 'block',
  },

  // Tile 3 — Climate
  tileClimate: {
    gridColumn: '5 / span 4',
    gridRow: '3 / span 2',
  },
  climateChart: { marginBottom: 'auto', position: 'relative' },
  climateLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 8.5,
    letterSpacing: '0.25em',
    color: 'rgba(244,236,212,0.5)',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  climateSvg:  { width: '100%', height: 36, display: 'block' },
  climateAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-mono)',
    fontSize: 8,
    color: 'rgba(244,236,212,0.4)',
    letterSpacing: '0.2em',
    marginTop: 2,
  },

  // Tile 4 — Location widget (replaces RegionGlobe)
  tileGlobe: {
    gridColumn: '9 / span 4',
    gridRow: '1 / span 4',
    padding: '20px 22px 16px',
  },

  // Shared tile typography
  tileTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(20px, 1.6vw, 26px)',
    color: '#fff',
    lineHeight: 1.1,
    marginTop: 6,
  },
  tileBody: {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'rgba(255,240,220,0.60)',
  },

  // Tile 5 — Itinerary
  tileItinerary: {
    gridColumn: '1 / span 7',
    gridRow: '5 / span 2',
    padding: '20px 26px',
  },
  itinHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
    marginBottom: 10,
  },
  itinCount: {
    marginLeft: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.25em',
    color: '#ffd100',
  },
  itinList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: 24,
    rowGap: 6,
    listStyle: 'none',
    padding: 0,
    margin: 0,
    flex: 1,
    alignContent: 'center',
  },
  itinItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    paddingBottom: 6,
    borderBottom: '1px solid rgba(255,220,170,0.08)',
  },
  itinNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.2em',
    color: '#ffd100',
    flexShrink: 0,
    minWidth: 20,
  },
  itinText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(13px, 1.05vw, 16px)',
    color: '#f4ecd4',
    lineHeight: 1.3,
  },

  // Tile 6 — Finale
  tileFinale: {
    gridColumn: '8 / span 5',
    gridRow: '5 / span 2',
    padding: 0,
  },
  finaleBg: { position: 'absolute', inset: 0, zIndex: 0 },
  finaleImg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'saturate(0.8) contrast(1.05)',
  },
  finaleVeil: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(115deg, rgba(7,15,31,0.92) 0%, rgba(7,15,31,0.7) 60%, rgba(7,15,31,0.5) 100%)',
  },
  finaleInner: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    padding: '22px 26px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 14,
  },
  finaleRow:  { display: 'flex', flexDirection: 'column', gap: 5 },
  finaleLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.3em',
    color: '#ffd100',
    textTransform: 'uppercase',
  },
  finaleDish: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: 'clamp(20px, 1.7vw, 28px)',
    color: '#fff',
    lineHeight: 1.2,
  },
  finalePlay: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(15px, 1.15vw, 19px)',
    color: '#f4ecd4',
  },
  finaleSep: {
    width: 40,
    height: 1,
    background: 'rgba(255,220,170,0.25)',
  },

  // Colophon
  colophon: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: '12px 38px 0',
    margin: '0 14px',
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.3em',
    color: 'rgba(244,236,212,0.4)',
  },
  colSep: { color: 'rgba(244,236,212,0.2)' },
};
