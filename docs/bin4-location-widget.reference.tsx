/**
 * ATLAS /50 — BIN 4 LOCATION WIDGET
 * Reference Implementation · V9
 *
 * This file is a DESIGN REFERENCE for Claude Code.
 * It contains the approved visual design, layout, colours, and SVG chart logic
 * for the 5-card paginated location widget that replaces RegionGlobe in Bin 4
 * of the Moodboard component.
 *
 * HOW TO USE THIS FILE:
 * ─────────────────────
 * Do NOT copy this file wholesale into the codebase.
 * Instead, use it as a reference when modifying components/Moodboard.tsx:
 *   1. Study the SVG geometry for each card (globe, wheel, radar, crowd, donut)
 *   2. Match the colour tokens exactly (see DESIGN TOKENS section below)
 *   3. Match the font usage (JetBrains Mono for labels, DM Serif Display for values)
 *   4. Match the nav/pip interaction pattern
 *   5. Adapt prop types to consume the new destinations.json fields
 *
 * STACK NOTES:
 * ─────────────
 * - All charts are pure SVG — no Three.js, no canvas, no external chart library
 * - Local time uses Intl.DateTimeFormat only — no date-fns or moment
 * - Tailwind is NOT used inside this widget — all styles are inline or CSS-in-JS
 *   to keep the widget self-contained. When integrating into Moodboard.tsx,
 *   match the existing styling approach of that component.
 */

import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// Match these exactly. Do not approximate.
// ─────────────────────────────────────────────
const T = {
  bg:          '#070f1f',
  bgDeep:      '#040d1e',
  border:      'rgba(255,220,170,0.15)',
  cream:       '#f4ecd4',
  creamDim:    'rgba(244,236,212,0.45)',
  creamFaint:  'rgba(244,236,212,0.28)',
  amber:       '#ffd100',
  amberHi:     'rgba(255,209,0,0.82)',
  amberMid:    'rgba(255,209,0,0.72)',
  amberLo:     'rgba(255,209,0,0.42)',
  blue:        'rgba(140,185,255,0.62)',
  blueMid:     'rgba(140,185,255,0.30)',
  blueAtm1:    'rgba(110,165,255,0.23)',
  blueAtm2:    'rgba(110,165,255,0.10)',
  blueAtm3:    'rgba(110,165,255,0.04)',
  blueSeason:  'rgba(140,185,255,0.26)',
  other:       'rgba(255,220,170,0.16)',
  fontSerif:   "'DM Serif Display', serif",
  fontSans:    "'Inter', sans-serif",
  fontMono:    "'JetBrains Mono', monospace",
};

// ─────────────────────────────────────────────
// DESTINATION DATA SHAPE (new V9 fields only)
// Full type lives in src/types/destination.ts
// ─────────────────────────────────────────────
interface LocationWidgetData {
  name:       string;
  region:     string;
  lat:        number;
  lon:        number;
  // Card 1
  timezone:        string;        // IANA e.g. "Europe/Rome"
  flight_time_lhr: string;        // e.g. "~2h 55m"
  globe_path:      string;        // SVG path d= attribute for country silhouette
  // Card 2
  monthly_temps: number[];        // [12] avg °C Jan–Dec
  peak_months:   number[];        // 0-indexed month numbers
  // Card 3
  vibe_scores: {
    cultural:   number;           // 0–1
    romantic:   number;
    social:     number;
    spiritual:  number;
    adventure:  number;
  };
  // Card 4
  crowd_index: number[];          // [12] 1–10 scale Jan–Dec
  // Card 5
  cost_breakdown: {
    accommodation: number;        // percentage, all 5 sum to 100
    food:          number;
    activities:    number;
    transport:     number;
    other:         number;
  };
  cost_breakdown_amounts: {
    accommodation: string;        // e.g. "€70"
    food:          string;
    activities:    string;
    transport:     string;
    other:         string;
  };
  cost_daily_total:  string;      // e.g. "€185"
  cost_budget_daily: string;      // e.g. "~€90/DAY"
}

// ─────────────────────────────────────────────
// CARD NAMES (shown in the meta label row)
// ─────────────────────────────────────────────
const CARD_NAMES = [
  'GLOBE — LOCATION',
  'SEASON WHEEL',
  'VIBE RADAR',
  'CROWD CALENDAR',
  'COST BREAKDOWN',
];

// ─────────────────────────────────────────────
// CARD 1: GLOBE
// ─────────────────────────────────────────────
function GlobeCard({ data }: { data: LocationWidgetData }) {
  const [localTime, setLocalTime] = useState('—');

  // Live local time — updates every 30 seconds
  useEffect(() => {
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: data.timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
      } catch { return '—'; }
    };
    setLocalTime(fmt());
    const id = setInterval(() => setLocalTime(fmt()), 30000);
    return () => clearInterval(id);
  }, [data.timezone]);

  // SVG dimensions
  const CX = 93, CY = 86, R = 67;

  return (
    <>
      {/* Tag + title + subtitle */}
      <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>
        01 of 05 — Location
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, marginBottom: 3 }}>
        {data.region} · {data.name}
      </div>
      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.creamDim, letterSpacing: '0.03em', marginBottom: 10 }}>
        {data.lat.toFixed(1)}°N · {data.lon.toFixed(1)}°E
      </div>

      {/* Globe SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <svg width={186} height={172} viewBox="0 0 186 172">
          <defs>
            <clipPath id="gc">
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>
          </defs>

          {/* Atmosphere rings — three concentric, fading outward */}
          <circle cx={CX} cy={CY} r={R + 3.5} fill="none" stroke={T.blueAtm1} strokeWidth={3.5} />
          <circle cx={CX} cy={CY} r={R + 7.5} fill="none" stroke={T.blueAtm2} strokeWidth={3.5} />
          <circle cx={CX} cy={CY} r={R + 12}  fill="none" stroke={T.blueAtm3} strokeWidth={5} />

          {/* Globe base */}
          <circle cx={CX} cy={CY} r={R} fill={T.bgDeep} />

          <g clipPath="url(#gc)">
            {/* Longitude grid ellipses */}
            <ellipse cx={CX} cy={CY} rx={33.5} ry={R} fill="none" stroke="rgba(255,220,170,0.05)" strokeWidth={0.5} />
            <ellipse cx={CX} cy={CY} rx={58}   ry={R} fill="none" stroke="rgba(255,220,170,0.04)" strokeWidth={0.5} />
            {/* Central meridian */}
            <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="rgba(255,220,170,0.05)" strokeWidth={0.5} />

            {/* Tropic of Cancer — dashed arc, bezier approx of orthographic */}
            <path d="M26,67 C59,108 127,108 160,67" fill="none" stroke="rgba(255,220,170,0.20)" strokeWidth={0.6} strokeDasharray="2.5,2.5" />
            {/* Equator — dashed arc */}
            <path d="M26,86 C59,132 127,132 160,86" fill="none" stroke="rgba(255,220,170,0.12)" strokeWidth={0.6} strokeDasharray="2.5,2.5" />

            {/*
              Country silhouette — amber filled path from data.globe_path
              The path is a simplified shape positioned for the miniature globe.
              Each destination needs its own globe_path value authored.
            */}
            <path d={data.globe_path} fill="rgba(255,209,0,0.68)" stroke="rgba(255,209,0,0.20)" strokeWidth={0.5} />

            {/* Arc labels */}
            <text x={120} y={70} fontFamily={T.fontMono} fontSize={6} fill="rgba(255,220,170,0.30)" letterSpacing="0.05em">TROPIC OF CANCER</text>
            <text x={120} y={89} fontFamily={T.fontMono} fontSize={6} fill="rgba(255,220,170,0.20)" letterSpacing="0.05em">EQUATOR</text>
          </g>

          {/* Globe edge */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,220,170,0.22)" strokeWidth={0.5} />

          {/* Destination pin */}
          <circle cx={CX} cy={84} r={3.5} fill={T.amber} />
          <circle cx={CX} cy={84} r={7.5} fill="none" stroke="rgba(255,209,0,0.48)" strokeWidth={0.9} />
          <circle cx={CX} cy={84} r={12}  fill="none" stroke="rgba(255,209,0,0.18)" strokeWidth={0.6} />
        </svg>
      </div>

      {/* Bottom info strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `0.5px solid rgba(255,220,170,0.10)`, paddingTop: 10, marginTop: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.creamFaint, letterSpacing: '0.08em' }}>
            LOCAL TIME · {data.name.toUpperCase()}
          </span>
          <span style={{ fontFamily: T.fontSerif, fontSize: 15, color: T.cream }}>{localTime}</span>
        </div>
        <div style={{ width: 0.5, height: 28, background: 'rgba(255,220,170,0.10)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.creamFaint, letterSpacing: '0.08em' }}>FROM LHR</span>
          <span style={{ fontFamily: T.fontSerif, fontSize: 15, color: T.cream }}>{data.flight_time_lhr}</span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CARD 2: SEASON WHEEL
// ─────────────────────────────────────────────
function SeasonWheelCard({ data }: { data: LocationWidgetData }) {
  const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const CX = 100, CY = 100, R_OUT = 62, R_IN = 38, R_TEMP = 82;

  // Build arc segments
  const segments = MONTHS.map((m, i) => {
    const a0   = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const a1   = ((i + 0.85) / 12) * Math.PI * 2 - Math.PI / 2;
    const aMid = ((i + 0.5)  / 12) * Math.PI * 2 - Math.PI / 2;
    const isPeak = data.peak_months.includes(i);
    const temp = data.monthly_temps[i];
    const warmRatio = (temp - 5) / 28; // normalise for opacity scaling

    const x1 = CX + Math.cos(a0) * R_IN,  y1 = CY + Math.sin(a0) * R_IN;
    const x2 = CX + Math.cos(a0) * R_OUT, y2 = CY + Math.sin(a0) * R_OUT;
    const x3 = CX + Math.cos(a1) * R_OUT, y3 = CY + Math.sin(a1) * R_OUT;
    const x4 = CX + Math.cos(a1) * R_IN,  y4 = CY + Math.sin(a1) * R_IN;
    const d  = `M${x1},${y1} L${x2},${y2} A${R_OUT},${R_OUT},0,0,1,${x3},${y3} L${x4},${y4} A${R_IN},${R_IN},0,0,0,${x1},${y1}Z`;

    const mx = CX + Math.cos(aMid) * (R_IN + (R_OUT - R_IN) * 0.5);
    const my = CY + Math.sin(aMid) * (R_IN + (R_OUT - R_IN) * 0.5);
    const tx = CX + Math.cos(aMid) * R_TEMP;
    const ty = CY + Math.sin(aMid) * R_TEMP;

    return { m, i, isPeak, temp, warmRatio, d, mx, my, tx, ty };
  });

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>
        02 of 05 — Best Season
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, marginBottom: 3 }}>Spring → Autumn</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.creamDim, marginBottom: 10 }}>
        Peak travel {MONTHS[data.peak_months[0]]} — {MONTHS[data.peak_months[data.peak_months.length - 1]]}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={200} height={200} viewBox="0 0 200 200">
          {/* Arc segments */}
          {segments.map(({ i, isPeak, d, mx, my, tx, ty, m, temp, warmRatio }) => (
            <g key={i}>
              <path
                d={d}
                fill={isPeak ? T.amberMid : T.blueSeason}
                stroke={T.bg}
                strokeWidth={1.5}
              />
              {/* Month letter inside arc */}
              <text x={mx} y={my + 3} textAnchor="middle" fontFamily={T.fontMono} fontSize={7}
                fill={isPeak ? 'rgba(7,15,31,0.9)' : 'rgba(160,200,255,0.7)'}>
                {m}
              </text>
              {/* Temperature outside arc */}
              <text x={tx} y={ty + 3} textAnchor="middle" fontFamily={T.fontMono} fontSize={9}
                fill={isPeak
                  ? `rgba(255,209,0,${0.5 + warmRatio * 0.5})`
                  : `rgba(140,195,255,${0.38 + (1 - warmRatio) * 0.3})`}>
                {temp}°
              </text>
            </g>
          ))}

          {/* Outer + inner rings */}
          <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke="rgba(255,220,170,0.12)" strokeWidth={0.5} />
          <circle cx={CX} cy={CY} r={R_IN}  fill={T.bg} stroke="rgba(255,220,170,0.10)" strokeWidth={0.5} />

          {/* Centre labels */}
          <text x={CX} y={CY - 3} textAnchor="middle" fontFamily={T.fontMono} fontSize={7}
            fill="rgba(244,236,212,0.20)" letterSpacing="0.1em">AVG</text>
          <text x={CX} y={CY + 9} textAnchor="middle" fontFamily={T.fontMono} fontSize={7}
            fill="rgba(244,236,212,0.20)" letterSpacing="0.1em">°C</text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
        {[
          { color: T.amberMid, label: 'PEAK' },
          { color: T.blueSeason, label: 'OFF SEASON' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, background: color }} />
            <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.35)', letterSpacing: '0.06em' }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CARD 3: VIBE RADAR
// ─────────────────────────────────────────────
function VibeRadarCard({ data }: { data: LocationWidgetData }) {
  const AXES = [
    { key: 'cultural'  as const, label: 'CULTURAL',  offsetX: 0,   offsetY: -64 },
    { key: 'romantic'  as const, label: 'ROMANTIC',  offsetX: 58,  offsetY: -22 },
    { key: 'social'    as const, label: 'SOCIAL',    offsetX: 38,  offsetY: 44  },
    { key: 'spiritual' as const, label: 'SPIRITUAL', offsetX: -38, offsetY: 44  },
    { key: 'adventure' as const, label: 'ADVENTURE', offsetX: -62, offsetY: -22 },
  ];
  const N = 5, R = 52;
  const CX = 95, CY = 92;

  // Grid polygon points for each ring
  const gridRings = [0.33, 0.66, 1].map(s =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      return `${Math.cos(a) * R * s},${Math.sin(a) * R * s}`;
    }).join(' ')
  );

  // Filled polygon from vibe_scores
  const filledPoints = AXES.map(({ key }, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const v = data.vibe_scores[key];
    return `${Math.cos(a) * R * v},${Math.sin(a) * R * v}`;
  }).join(' ');

  // Axis endpoints for dot placement
  const dots = AXES.map(({ key }, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const v = data.vibe_scores[key];
    return { cx: Math.cos(a) * R * v, cy: Math.sin(a) * R * v };
  });

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>
        03 of 05 — Vibe Fingerprint
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, marginBottom: 3 }}>{data.name}</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.creamDim, marginBottom: 10 }}>
        {/* Top 3 vibes by score */}
        {Object.entries(data.vibe_scores)
          .sort(([,a],[,b]) => b - a)
          .slice(0, 3)
          .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
          .join(' · ')}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={200} height={185} viewBox="0 0 200 185">
          <g transform={`translate(${CX},${CY})`}>
            {/* Grid rings */}
            {gridRings.map((pts, i) => (
              <polygon key={i} points={pts} fill="none" stroke="rgba(255,220,170,0.08)" strokeWidth={0.5} />
            ))}
            {/* Axis lines */}
            {AXES.map(({ key }, i) => {
              const a = (i / N) * Math.PI * 2 - Math.PI / 2;
              return <line key={key} x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R}
                           stroke="rgba(255,220,170,0.06)" strokeWidth={0.5} />;
            })}
            {/* Filled polygon */}
            <polygon points={filledPoints} fill="rgba(255,209,0,0.10)" stroke={T.amber} strokeWidth={1} />
            {/* Dots at vertices */}
            {dots.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r={2.5} fill={T.amber} />
            ))}
            {/* Axis labels */}
            {AXES.map(({ label, offsetX, offsetY, key }) => (
              <text key={key} x={offsetX} y={offsetY}
                    textAnchor={offsetX < 0 ? 'end' : offsetX > 0 ? 'start' : 'middle'}
                    fontFamily={T.fontMono} fontSize={8} fill="rgba(244,236,212,0.45)">
                {label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CARD 4: CROWD CALENDAR
// ─────────────────────────────────────────────
function CrowdCalendarCard({ data }: { data: LocationWidgetData }) {
  const BAR_W = 19, MAX_H = 75, GAP = 4, START_X = 4;
  const SVG_W = 280, SVG_H = 100;

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>
        04 of 05 — Crowd Index
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, marginBottom: 3 }}>When to Go</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.creamDim, marginBottom: 10 }}>
        Bar height = tourist volume
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {data.crowd_index.map((v, i) => {
            const barH = Math.round((v / 10) * MAX_H);
            const x    = START_X + i * (BAR_W + GAP);
            const alpha = 0.10 + (v / 10) * 0.72;
            return (
              <rect key={i}
                x={x} y={MAX_H - barH + 10}
                width={BAR_W} height={barH}
                fill={`rgba(255,209,0,${alpha})`}
                stroke="rgba(255,220,170,0.08)" strokeWidth={0.5}
              />
            );
          })}
        </svg>

        {/* Month axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: SVG_W, padding: '0 2px' }}>
          {['JAN','JUN','DEC'].map(m => (
            <span key={m} style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.25)', letterSpacing: '0.06em' }}>{m}</span>
          ))}
        </div>

        {/* Legend strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: SVG_W }}>
          <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.creamFaint }}>QUIET</span>
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right,rgba(255,220,170,0.12),rgba(255,209,0,0.70))' }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 8, color: T.creamFaint }}>BUSY</span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// CARD 5: COST BREAKDOWN DONUT
// ─────────────────────────────────────────────
function CostBreakdownCard({ data }: { data: LocationWidgetData }) {
  const CX = 57, CY = 57, R_OUT = 50, R_IN = 30;

  // Segment definitions — order and colours are locked
  const SEGMENTS = [
    { key: 'accommodation' as const, label: 'ACCOMMODATION', color: T.amberHi },
    { key: 'food'          as const, label: 'FOOD & DRINK',  color: T.amberLo },
    { key: 'activities'    as const, label: 'ACTIVITIES',    color: T.blue },
    { key: 'transport'     as const, label: 'TRANSPORT',     color: T.blueMid },
    { key: 'other'         as const, label: 'OTHER',         color: T.other },
  ];

  // Build donut arcs
  let angle = -Math.PI / 2;
  const arcs = SEGMENTS.map(seg => {
    const pct   = data.cost_breakdown[seg.key] / 100;
    const sweep = pct * Math.PI * 2;
    const GAP   = 0.03;
    const a0    = angle + GAP;
    const a1    = angle + sweep - GAP;
    const large = sweep > Math.PI ? 1 : 0;

    const x1 = CX + Math.cos(a0) * R_IN,  y1 = CY + Math.sin(a0) * R_IN;
    const x2 = CX + Math.cos(a0) * R_OUT, y2 = CY + Math.sin(a0) * R_OUT;
    const x3 = CX + Math.cos(a1) * R_OUT, y3 = CY + Math.sin(a1) * R_OUT;
    const x4 = CX + Math.cos(a1) * R_IN,  y4 = CY + Math.sin(a1) * R_IN;
    const d   = `M${x1},${y1} L${x2},${y2} A${R_OUT},${R_OUT},0,${large},1,${x3},${y3} L${x4},${y4} A${R_IN},${R_IN},0,${large},0,${x1},${y1}Z`;

    angle += sweep;
    return { ...seg, d, pct };
  });

  return (
    <>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.12em', color: T.amber, textTransform: 'uppercase', marginBottom: 5 }}>
        05 of 05 — Cost Breakdown
      </div>
      <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, marginBottom: 3 }}>
        {/* Derive label from cost_band if needed */}
        Est. Daily Spend
      </div>
      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.creamDim, marginBottom: 10 }}>
        Per person · {data.name}
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Donut */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={114} height={114} viewBox="0 0 114 114">
            {arcs.map(({ key, d, color }) => (
              <path key={key} d={d} fill={color} stroke={T.bg} strokeWidth={1.5} />
            ))}
          </svg>
          {/* Centre text — absolutely positioned over SVG */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 7, color: 'rgba(244,236,212,0.28)', letterSpacing: '0.07em' }}>EST/DAY</span>
            <span style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.cream, lineHeight: 1.1 }}>{data.cost_daily_total}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 6, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.06em' }}>PER PERSON</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {arcs.map(({ key, label, color, pct }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.45)', letterSpacing: '0.05em', flex: 1 }}>{label}</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.75)' }}>{Math.round(pct * 100)}%</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.30)', minWidth: 34, textAlign: 'right' }}>
                {data.cost_breakdown_amounts[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget reference strip */}
      <div style={{
        borderTop: '0.5px solid rgba(255,220,170,0.08)',
        marginTop: 10, paddingTop: 10,
        display: 'flex', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.05em' }}>BUDGET TRAVELLER</span>
        <span style={{ fontFamily: T.fontMono, fontSize: 8, color: 'rgba(244,236,212,0.22)', letterSpacing: '0.05em' }}>{data.cost_budget_daily}</span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN WIDGET — 5-card paginated container
// This is what gets embedded in Moodboard Bin 4.
// ─────────────────────────────────────────────
export function Bin4LocationWidget({ data }: { data: LocationWidgetData }) {
  const [cur, setCur] = useState(0);
  const total = 5;
  const prev  = () => setCur(c => (c + total - 1) % total);
  const next  = () => setCur(c => (c + 1) % total);

  const CARDS = [
    <GlobeCard         key="globe"  data={data} />,
    <SeasonWheelCard   key="season" data={data} />,
    <VibeRadarCard     key="vibe"   data={data} />,
    <CrowdCalendarCard key="crowd"  data={data} />,
    <CostBreakdownCard key="cost"   data={data} />,
  ];

  // Chevron button shared style
  const btnStyle: React.CSSProperties = {
    width: 32, height: 32,
    background: 'rgba(255,220,170,0.06)',
    border: `0.5px solid rgba(255,220,170,0.18)`,
    color: 'rgba(244,236,212,0.60)',
    fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    fontFamily: T.fontSans,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/*
        Card frame — fixed height so the bento grid never reflows.
        Adjust height to match the Bin 4 tile's inner content area.
      */}
      <div style={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
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
      </div>

      {/* Navigation row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 12, flexShrink: 0 }}>
        <button style={btnStyle} onClick={prev}>‹</button>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i}
              onClick={() => setCur(i)}
              style={{
                width: 5, height: 5, borderRadius: '50%', cursor: 'pointer',
                background: i === cur ? T.amber : 'rgba(255,220,170,0.18)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
        <button style={btnStyle} onClick={next}>›</button>
      </div>

      {/* Meta label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 9, color: 'rgba(244,236,212,0.28)', letterSpacing: '0.08em' }}>
          {CARD_NAMES[cur]}
        </span>
        <span style={{ fontFamily: T.fontMono, fontSize: 9, color: 'rgba(244,236,212,0.28)', letterSpacing: '0.08em' }}>
          {String(cur + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
