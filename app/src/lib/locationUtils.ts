const TIMEZONE_MAP: Record<string, { lat: number; lon: number }> = {
  // Asia
  'Asia/Kuala_Lumpur':   { lat:  3.14, lon: 101.69 },
  'Asia/Singapore':      { lat:  1.35, lon: 103.82 },
  'Asia/Tokyo':          { lat: 35.68, lon: 139.69 },
  'Asia/Shanghai':       { lat: 31.23, lon: 121.47 },
  'Asia/Hong_Kong':      { lat: 22.32, lon: 114.17 },
  'Asia/Seoul':          { lat: 37.57, lon: 126.98 },
  'Asia/Taipei':         { lat: 25.05, lon: 121.53 },
  'Asia/Bangkok':        { lat: 13.75, lon: 100.52 },
  'Asia/Jakarta':        { lat: -6.21, lon: 106.85 },
  'Asia/Kolkata':        { lat: 28.64, lon:  77.22 },
  'Asia/Dubai':          { lat: 25.20, lon:  55.27 },
  'Asia/Riyadh':         { lat: 24.69, lon:  46.72 },
  'Asia/Tehran':         { lat: 35.69, lon:  51.42 },
  'Asia/Karachi':        { lat: 24.86, lon:  67.01 },
  'Asia/Dhaka':          { lat: 23.72, lon:  90.41 },
  'Asia/Manila':         { lat: 14.60, lon: 120.98 },
  // Europe
  'Europe/London':       { lat: 51.51, lon:  -0.13 },
  'Europe/Paris':        { lat: 48.86, lon:   2.35 },
  'Europe/Berlin':       { lat: 52.52, lon:  13.41 },
  'Europe/Madrid':       { lat: 40.42, lon:  -3.70 },
  'Europe/Rome':         { lat: 41.90, lon:  12.50 },
  'Europe/Amsterdam':    { lat: 52.37, lon:   4.90 },
  'Europe/Stockholm':    { lat: 59.33, lon:  18.07 },
  'Europe/Moscow':       { lat: 55.75, lon:  37.62 },
  'Europe/Warsaw':       { lat: 52.23, lon:  21.01 },
  'Europe/Istanbul':     { lat: 41.01, lon:  28.95 },
  // America
  'America/New_York':    { lat: 40.71, lon: -74.01 },
  'America/Los_Angeles': { lat: 34.05, lon:-118.24 },
  'America/Chicago':     { lat: 41.85, lon: -87.65 },
  'America/Denver':      { lat: 39.74, lon:-104.98 },
  'America/Toronto':     { lat: 43.65, lon: -79.38 },
  'America/Vancouver':   { lat: 49.25, lon:-123.12 },
  'America/Sao_Paulo':   { lat:-23.55, lon: -46.63 },
  'America/Mexico_City': { lat: 19.43, lon: -99.13 },
  'America/Buenos_Aires':{ lat:-34.60, lon: -58.38 },
  'America/Bogota':      { lat:  4.71, lon: -74.07 },
  // Africa
  'Africa/Johannesburg': { lat:-26.20, lon:  28.04 },
  'Africa/Cairo':        { lat: 30.04, lon:  31.24 },
  'Africa/Lagos':        { lat:  6.45, lon:   3.40 },
  'Africa/Nairobi':      { lat: -1.29, lon:  36.82 },
  'Africa/Casablanca':   { lat: 33.59, lon:  -7.62 },
  // Australia / Pacific
  'Australia/Sydney':    { lat:-33.87, lon: 151.21 },
  'Australia/Melbourne': { lat:-37.81, lon: 144.96 },
  'Australia/Perth':     { lat:-31.95, lon: 115.86 },
  'Pacific/Auckland':    { lat:-36.87, lon: 174.77 },
  'Pacific/Honolulu':    { lat: 21.31, lon:-157.86 },
};

const REGION_FALLBACK: Record<string, { lat: number; lon: number }> = {
  Asia:      { lat:  3.14, lon: 101.69 },  // KL
  Europe:    { lat: 51.51, lon:  -0.13 },  // London
  America:   { lat: 40.71, lon: -74.01 },  // NYC
  Africa:    { lat:  0.00, lon:  25.00 },  // central Africa
  Australia: { lat:-33.87, lon: 151.21 },  // Sydney
  Pacific:   { lat:-36.87, lon: 174.77 },  // Auckland
};

const FALLBACK = { lat: 3.14, lon: 101.69 };

export function resolveStartingLocation(): { lat: number; lon: number } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_MAP[tz]) return TIMEZONE_MAP[tz];
    const prefix = tz.split('/')[0];
    if (REGION_FALLBACK[prefix]) return REGION_FALLBACK[prefix];
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}
