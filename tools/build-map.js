#!/usr/bin/env node
/* Generate an accurately-projected Minnesota outline + city coords for index.html.
   Projection: Albers Equal Area Conic — the standard choice for US state maps.
   Standard parallels set by the 1/6 rule over Minnesota's latitude span. */

const fs = require('fs');

const geo = JSON.parse(fs.readFileSync(__dirname + '/minnesota.geojson', 'utf8'));
const ring = geo.geometry.coordinates[0];

// --- Albers Equal Area Conic ------------------------------------------------
const D = Math.PI / 180;
const LAT0 = 46.44, LON0 = -93.364;   // center of MN's bbox
const P1 = 44.48, P2 = 48.40;          // 1/6 and 5/6 of the 43.50–49.38 span

const n = (Math.sin(P1 * D) + Math.sin(P2 * D)) / 2;
const C = Math.cos(P1 * D) ** 2 + 2 * n * Math.sin(P1 * D);
const rho0 = Math.sqrt(C - 2 * n * Math.sin(LAT0 * D)) / n;

function albers(lon, lat) {
  const theta = n * (lon - LON0) * D;
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * D)) / n;
  return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
}

// --- project the ring, find true extent -------------------------------------
const proj = ring.map(([lon, lat]) => albers(lon, lat));
const xs = proj.map(p => p[0]), ys = proj.map(p => p[1]);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const wSpan = maxX - minX, hSpan = maxY - minY;

// Lock the viewBox to the TRUE projected aspect ratio -> no distortion.
const PAD = 16;
const VW = 520;
const scale = (VW - PAD * 2) / wSpan;
const VH = Math.round(hSpan * scale + PAD * 2);

// Albers y grows NORTHWARD; SVG y grows downward — so invert it.
const toSvg = ([x, y]) => [
  (x - minX) * scale + PAD,
  (maxY - y) * scale + PAD,
];

// --- Douglas–Peucker simplify (keeps shape, trims bytes) --------------------
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (!len2) return Math.hypot(p[0] - a[0], p[1] - a[1]);   // degenerate segment
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = segDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) {
    return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
  }
  return [pts[0], pts[pts.length - 1]];
}

// A closed ring degenerates under RDP (first === last), so split it at the
// vertex farthest from the start, simplify each half, then rejoin.
function rdpRing(ring, eps) {
  const pts = ring.slice(0, -1);                 // drop the duplicated closing point
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const a = rdp(pts.slice(0, far + 1), eps);
  const b = rdp(pts.slice(far), eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

const svgPts = proj.map(toSvg);
const simplified = rdpRing(svgPts, 0.35);
const r2 = v => Math.round(v * 10) / 10;
const d = simplified.map((p, i) => (i ? 'L' : 'M') + r2(p[0]) + ' ' + r2(p[1])).join('') + 'Z';

// --- real Minnesota places (verified lat/lon), projected the same way -------
const PLACES = [
  ['Minneapolis',        44.9778, -93.2650, 1],
  ['St. Paul',           44.9537, -93.0900, 1],
  ['Duluth',             46.7867, -92.1005, 1],
  ['Rochester',          44.0121, -92.4802, 1],
  ['St. Cloud',          45.5579, -94.1632, 1],
  ['Moorhead',           46.8738, -96.7678, 1],
  ['Mankato',            44.1636, -93.9994, 0],
  ['Bemidji',            47.4716, -94.8827, 0],
  ['Brainerd',           46.3580, -94.2008, 0],
  ['Grand Marais',       47.7504, -90.3343, 0],
  ["Int'l Falls",        48.6009, -93.4110, 0],
  ['Alexandria',         45.8852, -95.3775, 0],
  ['Willmar',            45.1219, -95.0433, 0],
  ['Winona',             44.0500, -91.6393, 0],
  ['Thief River Falls',  48.1191, -96.1811, 0],
  ['Hibbing',            47.4271, -92.9377, 0],
  ['Marshall',           44.4469, -95.7889, 0],
  ['Fergus Falls',       46.2830, -96.0776, 0],
  ['Worthington',        43.6199, -95.5964, 0],
  ['Virginia',           47.5232, -92.5366, 0],
  ['Grand Rapids',       47.2372, -93.5303, 0],
  ['Ely',                47.9032, -91.8671, 0],
  ['Red Wing',           44.5625, -92.5338, 0],
];

const cities = PLACES.map(([name, lat, lon, major]) => {
  const [x, y] = toSvg(albers(lon, lat));
  return { name, x: r2(x), y: r2(y), lat, lon, major: !!major };
});

// --- report -----------------------------------------------------------------
console.log('viewBox: 0 0 ' + VW + ' ' + VH);
console.log('true projected aspect (h/w): ' + (hSpan / wSpan).toFixed(4));
console.log('viewBox aspect (h/w):        ' + ((VH - PAD * 2) / (VW - PAD * 2)).toFixed(4));
console.log('outline points: ' + ring.length + ' -> ' + simplified.length);
console.log('path bytes: ' + d.length);
console.log('cities: ' + cities.length);

fs.writeFileSync(__dirname + '/mn-out.json', JSON.stringify({ viewBox: `0 0 ${VW} ${VH}`, VW, VH, d, cities }, null, 1));

// sanity: every city must land inside the polygon bbox
const bad = cities.filter(c => c.x < 0 || c.x > VW || c.y < 0 || c.y > VH);
console.log('cities out of bounds: ' + bad.length);
