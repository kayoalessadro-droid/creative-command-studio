import type { ReactNode } from 'react';
import { Leo, type LeoExpression } from './leo';
import { blob, rnd } from './ice';

/* Reusable pieces for "E se todo o gelo da Terra derretesse?". All coordinates are in the 540×960 frame. */

export type V = readonly [number, number];
export const z = (cx: number, cy: number, s: number) => `translate(${270 - cx * s} ${480 - cy * s}) scale(${s})`;
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Wavy water surface filled down to `bottom`. */
export function waveLine(y: number, t: number, amp = 6, k = .035, w = 1.6, x0 = -500, x1 = 1040, ph = 0) {
  let d = '';
  for (let x = x0; x <= x1; x += 16) d += `${d ? 'L' : 'M'}${x} ${(y + Math.sin(x * k + t * w + ph) * amp + Math.sin(x * k * 2.3 - t * w * 1.3 + ph) * amp * .4).toFixed(1)}`;
  return d;
}
export function wavePath(y: number, t: number, amp = 6, k = .035, w = 1.6, x0 = -500, x1 = 1040, bottom = 2600, ph = 0) {
  return `M${x0} ${bottom}L` + waveLine(y, t, amp, k, w, x0, x1, ph).slice(1) + `L${x1} ${bottom}Z`;
}
export function Water({ y, t, amp = 6, x0 = -500, x1 = 1040, bottom = 2600, deep = false, foam = true, glints = true, op = 1 }: { y: number; t: number; amp?: number; x0?: number; x1?: number; bottom?: number; deep?: boolean; foam?: boolean; glints?: boolean; op?: number }) {
  return <g opacity={op}>
    <path d={wavePath(y - amp * .8, t * .8, amp * .7, .028, 1.2, x0, x1, bottom, 2)} className="gl-sea-back"/>
    <path d={wavePath(y, t, amp, .035, 1.6, x0, x1, bottom)} className={deep ? 'gl-sea-deep' : 'gl-sea'}/>
    {foam && <path d={waveLine(y, t, amp, .035, 1.6, x0, x1)} className="gl-foam-line"/>}
    <rect x={x0} y={y + 90} width={x1 - x0} height={bottom - y} className="gl-sea-depth" opacity={deep ? .55 : .3}/>
    {glints && Array.from({ length: 9 }, (_, i) => {
      const gx = x0 + 80 + ((i * 137 + t * 14) % (x1 - x0 - 160)), gy = y + 18 + (i % 4) * 22;
      return <path key={i} d={`M${gx} ${gy}h${16 + (i % 3) * 8}`} className="gl-glint" opacity={.35 + .35 * Math.sin(t * 3 + i)}/>;
    })}
  </g>;
}

/* ---------- skies & weather ---------- */
export function Sky({ kind, op = 1 }: { kind: 'polar' | 'day' | 'night' | 'storm' | 'sunset' | 'gold' | 'space' | 'memory'; op?: number }) {
  return <rect x="-1500" y="-1500" width="3540" height="4000" fill={`url(#gl-sky-${kind})`} opacity={op}/>;
}
export function Stars({ t, n = 60, seed = 2, h = 520, op = 1 }: { t: number; n?: number; seed?: number; h?: number; op?: number }) {
  if (op <= 0) return null;
  return <g opacity={op}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={rnd(seed, i) * 540} cy={rnd(seed, i + 99) * h} r={.6 + rnd(seed, i + 7) * 1.4} className="gl-star" opacity={.4 + .6 * Math.abs(Math.sin(t * (1 + rnd(seed, i)) + i))}/>)}</g>;
}
export function Aurora({ t, y = 150, op = 1 }: { t: number; y?: number; op?: number }) {
  if (op <= 0) return null;
  const band = (k: number, ph: number) => { let d = ''; for (let x = -60; x <= 600; x += 20) d += `${d ? 'L' : 'M'}${x} ${(y + k * 40 + Math.sin(x * .012 + t * .5 + ph) * 38 + Math.sin(x * .03 - t * .3) * 12).toFixed(1)}`; return d; };
  return <g opacity={op}>
    {[0, 1, 2].map(i => <g key={i}><path d={band(i, i * 1.7)} className="gl-aurora-wide"/><path d={band(i, i * 1.7)} className={i === 1 ? 'gl-aurora-core2' : 'gl-aurora-core'}/></g>)}
  </g>;
}
export function Snow({ t, n = 40, amount = 1, wind = 20, seed = 4 }: { t: number; n?: number; amount?: number; wind?: number; seed?: number }) {
  if (amount <= 0) return null;
  return <g opacity={amount}>{Array.from({ length: n }, (_, i) => {
    const sp = 30 + rnd(seed, i) * 50, x = (rnd(seed, i + 3) * 640 + t * wind + Math.sin(t + i) * 10) % 640 - 50, y = (rnd(seed, i + 9) * 1000 + t * sp) % 1000 - 20;
    return <circle key={i} cx={x} cy={y} r={1 + rnd(seed, i + 5) * 2.2} className="gl-snow"/>;
  })}</g>;
}
export function Rain({ t, n = 70, amount = 1, slant = 10, seed = 6 }: { t: number; n?: number; amount?: number; slant?: number; seed?: number }) {
  if (amount <= 0) return null;
  return <g opacity={amount}>{Array.from({ length: n }, (_, i) => {
    const x = (rnd(seed, i) * 700 - t * slant * 20) % 700, y = (rnd(seed, i + 40) * 1100 + t * (900 + rnd(seed, i) * 300)) % 1100 - 70;
    return <path key={i} d={`M${(x < 0 ? x + 700 : x) - 60} ${y}l${-slant} 28`} className="gl-rain"/>;
  })}</g>;
}
export function Bolt({ x, y, h, seed, op }: { x: number; y: number; h: number; seed: number; op: number }) {
  if (op <= 0) return null;
  let d = `M${x} ${y}`, px = x;
  for (let i = 1; i <= 7; i++) { px += (rnd(seed, i) - .5) * 60; d += `L${px.toFixed(1)} ${y + h * i / 7}`; }
  return <g opacity={op}><path d={d} className="gl-bolt-glow"/><path d={d} className="gl-bolt"/></g>;
}
export function Cloud({ x, y, s = 1, cls = 'gl-cloud' }: { x: number; y: number; s?: number; cls?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} className={cls} d="M-70 20Q-92 18 -88 -2Q-84 -22 -60 -18Q-54 -46 -24 -44Q2 -64 30 -40Q58 -50 66 -22Q92 -20 88 4Q86 22 64 20Z"/>;
}
export function Sun({ x, y, r = 40, cls = 'gl-sun' }: { x: number; y: number; r?: number; cls?: string }) {
  return <g><circle cx={x} cy={y} r={r * 3.2} fill="url(#gl-sun-glow)"/><circle cx={x} cy={y} r={r} className={cls}/></g>;
}

/* ---------- polar ---------- */
export function Mountains({ y, t = 0, snow = 1, far = false }: { y: number; t?: number; snow?: number; far?: boolean }) {
  const peaks: V[] = far ? [[-40, 120], [60, 190], [170, 140], [280, 210], [390, 150], [500, 200], [600, 130]] : [[-60, 150], [80, 230], [200, 170], [330, 250], [450, 180], [590, 220]];
  const d = 'M-200 ' + (y + 40) + peaks.map(([x, h]) => `L${x} ${y - h}L${x + 55} ${y - h * .55}`).join('') + `L760 ${y + 40}Z`;
  return <g transform={`translate(${-t} 0)`}>
    <path d={d} className={far ? 'gl-mtn-far' : 'gl-mtn'}/>
    {snow > 0 && peaks.map(([x, h], i) => { const c = h * .42 * snow; return <path key={i} d={`M${x - c * .55} ${y - h + c}L${x} ${y - h}L${x + c * .5} ${y - h + c * .9}L${x + c * .2} ${y - h + c * .7}L${x - c * .1} ${y - h + c * 1.05}Z`} className="gl-mtn-snow"/>; })}
  </g>;
}
/** Tabular ice shelf: flat top at `top`, vertical cliff face down to the water line `base`. */
export function IceShelf({ x0, x1, top, base, seed = 3, thin = 0 }: { x0: number; x1: number; top: number; base: number; seed?: number; thin?: number }) {
  const tp = top + thin;
  let face = `M${x0} ${tp}`;
  for (let x = x0; x <= x1; x += 22) face += `L${x} ${(tp + (rnd(seed, x) - .5) * 6).toFixed(1)}`;
  face += `L${x1} ${base}`;
  for (let x = x1; x >= x0; x -= 26) face += `L${x} ${(base + rnd(seed + 1, x) * 10).toFixed(1)}`;
  face += 'Z';
  const lines: string[] = [];
  for (let x = x0 + 14; x < x1; x += 30 + rnd(seed, x) * 20) lines.push(`M${x.toFixed(0)} ${tp + 12}L${(x + (rnd(seed + 3, x) - .5) * 14).toFixed(0)} ${base - 6}`);
  return <g>
    <path d={face} className="gl-ice-face"/>
    <path d={lines.join('')} className="gl-ice-stria"/>
    <rect x={x0} y={base - (base - tp) * .35} width={x1 - x0} height={(base - tp) * .35} className="gl-ice-deep" opacity=".45"/>
    <path d={`M${x0} ${tp}L${x1} ${tp}L${x1} ${tp - 16}Q${(x0 + x1) / 2} ${tp - 26} ${x0} ${tp - 14}Z`} className="gl-ice-top"/>
  </g>;
}
export function Iceberg({ x, y, s = 1, t = 0, seed = 1 }: { x: number; y: number; s?: number; t?: number; seed?: number }) {
  const bob = Math.sin(t * 1.3 + seed) * 2;
  return <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <path d="M-60 0L-48 -34L-20 -46L8 -40L30 -58L56 -30L62 0Z" className="gl-ice-face"/>
    <path d="M-48 -34L-20 -46L8 -40L30 -58L56 -30L40 -26L20 -34L-6 -28L-30 -32Z" className="gl-ice-top"/>
    <path d="M-60 0L62 0L48 26L-44 30Z" className="gl-ice-under" opacity=".55"/>
  </g>;
}
export function Penguin({ x, y, s = 1, t, look = 0, hop = 0, flip = false }: { x: number; y: number; s?: number; t: number; look?: number; hop?: number; flip?: boolean }) {
  const wob = Math.sin(t * 6 + x) * 3, flap = Math.sin(t * 9 + x) * 10;
  return <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 9)) * hop}) scale(${flip ? -s : s} ${s}) rotate(${wob})`}>
    <ellipse cx="0" cy="-30" rx="17" ry="30" className="gl-peng-back"/>
    <ellipse cx="3" cy="-24" rx="11" ry="22" className="gl-peng-belly"/>
    <path d={`M-14 -34Q-26 -18 -${18 + flap * .3} -6`} className="gl-peng-wing"/>
    <g transform={`rotate(${look} 0 -52)`}><circle cx="2" cy="-54" r="12" className="gl-peng-back"/><circle cx="7" cy="-57" r="2.2" className="gl-peng-eye"/><path d="M12 -54L21 -51L12 -49Z" className="gl-peng-beak"/></g>
    <path d="M-8 0L-1 0L-4 -4ZM3 0L11 0L7 -4Z" className="gl-peng-beak"/>
  </g>;
}
export function Crack({ x, y0, y1, p, seed = 5, w = 26 }: { x: number; y0: number; y1: number; p: number; seed?: number; w?: number }) {
  if (p <= 0) return null;
  const pts: V[] = []; const n = 9;
  for (let i = 0; i <= n; i++) pts.push([x + (rnd(seed, i) - .5) * w * (i ? 1 : 0), y0 + (y1 - y0) * i / n]);
  const k = Math.max(1, Math.round(n * Math.min(1, p)));
  const d = pts.slice(0, k + 1).map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
  const br = pts.slice(2, k).map(([px, py], i) => `M${px.toFixed(1)} ${py.toFixed(1)}l${(i % 2 ? 1 : -1) * (12 + rnd(seed, i + 30) * 14)} ${8 + rnd(seed, i + 20) * 10}`).join('');
  return <g><path d={d + br} className="gl-crack-glow"/><path d={d + br} className="gl-crack"/></g>;
}
export function Splash({ x, y, p, s = 1, seed = 8 }: { x: number; y: number; p: number; s?: number; seed?: number }) {
  if (p <= 0 || p >= 1) return null;
  return <g opacity={1 - p * p}>
    <ellipse cx={x} cy={y} rx={(40 + p * 160) * s} ry={(10 + p * 30) * s} className="gl-foam"/>
    {Array.from({ length: 22 }, (_, i) => {
      const a = -Math.PI * (.08 + .84 * rnd(seed, i)), v = (120 + rnd(seed, i + 9) * 200) * s;
      const px = x + Math.cos(a) * v * p, py = y + Math.sin(a) * v * p * 1.4 + 300 * p * p * s;
      return <circle key={i} cx={px} cy={py} r={(4 + rnd(seed, i + 3) * 9) * s * (1 - p * .6)} className="gl-foam"/>;
    })}
  </g>;
}

/* ---------- city ---------- */
export function Tower({ x, base, w, floors, fh = 24, cls = 'gl-bld-a', lit = 0, seed = 1, cols, roof = 0 }: { x: number; base: number; w: number; floors: number; fh?: number; cls?: string; lit?: number; seed?: number; cols?: number; roof?: number }) {
  const h = floors * fh, c = cols ?? Math.max(2, Math.round(w / 22)), ww = w / c;
  return <g>
    <rect x={x} y={base - h} width={w} height={h} className={cls}/>
    {Array.from({ length: floors }, (_, f) => Array.from({ length: c }, (_, i) => <rect key={`${f}-${i}`} x={x + i * ww + ww * .22} y={base - h + f * fh + fh * .25} width={ww * .56} height={fh * .5} className={rnd(seed, f * 13 + i) < lit ? 'gl-win-lit' : 'gl-win'}/>))}
    {roof === 1 && <path d={`M${x + w / 2} ${base - h}V${base - h - 40}`} className="gl-antenna"/>}
    {roof === 2 && <rect x={x + w * .2} y={base - h - 14} width={w * .6} height="14" className={cls}/>}
    <rect x={x} y={base - h} width={w} height={h} className="gl-bld-edge"/>
  </g>;
}
export function Palm({ x, y, s = 1, sway = 0 }: { x: number; y: number; s?: number; sway?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0Q${6 + sway * .3} -60 ${10 + sway} -120`} className="gl-palm-trunk"/>
    <g transform={`translate(${10 + sway} -120) rotate(${sway * .6})`}>
      {[-150, -110, -60, -20, 20].map((a, i) => <path key={i} transform={`rotate(${a + Math.sin(sway * .1 + i) * 6})`} d="M0 0Q30 -16 62 4Q30 -2 0 0Z" className="gl-palm-leaf"/>)}
    </g>
  </g>;
}
export function Umbrella({ x, y, cls = 'gl-umb-a', tilt = 0 }: { x: number; y: number; cls?: string; tilt?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt})`}><path d="M0 0V-34" className="gl-pole"/><path d="M-26 -30Q0 -54 26 -30Z" className={cls}/></g>;
}
export function Car({ x, y, cls = 'gl-car-a', rot = 0, s = 1 }: { x: number; y: number; cls?: string; rot?: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-44 -8L-40 -22Q-36 -28 -28 -28L-18 -42Q-14 -46 -6 -46L18 -46Q26 -46 30 -40L38 -28Q46 -28 46 -20L46 -8Z" className={cls}/>
    <path d="M-14 -40L-6 -30H10V-42H-6ZM14 -42V-30H32L26 -40Z" className="gl-win"/>
    <circle cx="-26" cy="-6" r="9" className="gl-wheel"/><circle cx="28" cy="-6" r="9" className="gl-wheel"/>
  </g>;
}
export function House({ x, y, s = 1, cls = 'gl-house-a', roof = 'gl-roof-a', lit = false }: { x: number; y: number; s?: number; cls?: string; roof?: string; lit?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-24" y="-30" width="48" height="30" className={cls}/><path d="M-30 -30L0 -54L30 -30Z" className={roof}/>
    <rect x="-14" y="-22" width="10" height="10" className={lit ? 'gl-win-lit' : 'gl-win'}/><rect x="6" y="-20" width="9" height="20" className="gl-door"/>
  </g>;
}
export function Tree({ x, y, s = 1, sway = 0 }: { x: number; y: number; s?: number; sway?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0V-26" className="gl-trunk"/><ellipse cx={sway} cy="-40" rx="20" ry="24" className="gl-tree"/></g>;
}
export function Boat({ x, y, t, s = 1, flip = false, children }: { x: number; y: number; t: number; s?: number; flip?: boolean; children?: ReactNode }) {
  const rock = Math.sin(t * 2.1 + x * .01) * 3;
  return <g transform={`translate(${x} ${y + Math.sin(t * 1.7) * 2}) rotate(${rock}) scale(${flip ? -s : s} ${s})`}>
    {children}
    <path d="M-60 -10H62L44 16H-46Z" className="gl-boat"/><path d="M-60 -10H62" className="gl-boat-rim"/>
  </g>;
}

/* ---------- people ---------- */
const SCARF_TAIL = (t: number) => `M78 132Q${66 - Math.sin(t * 7) * 6} ${150 + Math.sin(t * 5) * 4} ${56 - Math.sin(t * 6) * 10} ${170 + Math.sin(t * 8) * 6}L${66 - Math.sin(t * 6) * 8} ${174 + Math.sin(t * 8) * 4}Q${74 - Math.sin(t * 7) * 4} ${156} 88 136Z`;
type PersonProps = {
  x: number; g: number; s: number; t: number; scope?: string; flip?: boolean; walking?: boolean; running?: boolean; seated?: boolean;
  expression?: LeoExpression; reach?: number | undefined; armL?: number | undefined; gaze?: V | undefined; shine?: boolean; backpack?: boolean; scarf?: boolean; extra?: ReactNode; shadow?: boolean;
};
/** Any character built on the shared Léo rig; `scope` picks the colour set (Théo is `theo-scope`). */
export function Person({ x, g, s, t, scope = 'theo-scope', flip = false, walking = false, running = false, seated = false, expression = 'curious', reach, armL, gaze, shine = false, backpack = true, scarf = false, extra, shadow = true }: PersonProps) {
  const tx = x - 90 * s, ty = g - 348 * s;
  const tr = flip ? `translate(${tx + s * 180} ${ty}) scale(${-s} ${s})` : `translate(${tx} ${ty}) scale(${s})`;
  return <g>
    {shadow && <ellipse cx={x} cy={g + 2} rx={62 * s} ry={9 * s} className="gl-shadow"/>}
    <g transform={tr}><g className={scope}>
      <Leo time={t} walking={walking} running={running} seated={seated} expression={expression} backpack={backpack} reach={reach} armL={armL} gaze={gaze} shine={shine}/>
      {scarf && <g className="leo-rig"><path d={SCARF_TAIL(t)} className="gl-scarf"/><path d="M72 124Q90 140 108 124L106 138Q90 150 74 138Z" className="gl-scarf"/></g>}
      {extra}
    </g></g>
  </g>;
}
export const headOf = (x: number, g: number, s: number, flip = false): V => [x - 90 * s + (flip ? 92 : 88) * s, g - 348 * s + 80 * s];

/* ---------- planet & map ---------- */
const CONTINENTS: Array<[number, number, number, number]> = [[60, -40, 70, 3], [180, 40, 55, 7], [300, -70, 90, 11], [420, 30, 60, 13], [540, -20, 80, 17], [660, 60, 50, 19], [760, -60, 65, 23]];
export function Earth({ x, y, r, t, shrink = 0, spin = 18 }: { x: number; y: number; r: number; t: number; shrink?: number; spin?: number }) {
  const W = 840, off = (t * spin) % W;
  const land = (dx: number) => CONTINENTS.map(([cx, cy, rr, sd], i) => {
    const px = x - r + ((cx - off + dx) % W + W) % W - 120, py = y + cy * r / 170;
    const k = (1 - shrink * .42) * r / 170;
    return <g key={`${dx}-${i}`}>
      <path d={blob(px, py, rr * k, sd, 18, .5)} className="gl-land"/>
      <path d={blob(px + 6 * k, py - 4 * k, rr * k * .55, sd + 1, 14, .5)} className="gl-land-high"/>
    </g>;
  });
  return <g>
    <circle cx={x} cy={y} r={r * 1.18} fill="url(#gl-atmo)"/>
    <defs><clipPath id="gl-earth-clip"><circle cx={x} cy={y} r={r}/></clipPath></defs>
    <g clipPath="url(#gl-earth-clip)">
      <circle cx={x} cy={y} r={r} className={shrink > .5 ? 'gl-ocean-deep' : 'gl-ocean'}/>
      {shrink > 0 && <circle cx={x} cy={y} r={r} className="gl-ocean-deep" opacity={Math.min(1, shrink)}/>}
      {land(0)}
      <path d={blob(x - r * .1, y - r * .92, r * .55 * (1 - shrink * .8), 41, 16, .2)} className="gl-polar-cap"/>
      {[0, 1, 2, 3].map(i => <path key={i} d={blob(x - r + ((i * 160 - t * spin * 1.4) % 700 + 700) % 700 - 80, y - r * .5 + i * r * .32, r * .22, 50 + i, 12, .55)} className="gl-cloud" opacity=".7"/>)}
      <circle cx={x} cy={y} r={r} fill="url(#gl-earth-shade)"/>
    </g>
    <circle cx={x} cy={y} r={r} className="gl-atmo-rim"/>
  </g>;
}
export function MapSheet({ flood, t }: { flood: number; t: number }) {
  const land: Array<[number, number, number, number]> = [[-120, -40, 70, 3], [-20, 50, 48, 7], [70, -60, 60, 11], [130, 40, 46, 13], [-140, 70, 30, 17]];
  return <g>
    <path d="M-200 -140L200 -150L210 140L-196 150Z" className="gl-map-paper"/>
    <path d="M-200 -140L200 -150L210 140L-196 150Z" className="gl-map-sea"/>
    {land.map(([cx, cy, r, sd], i) => <g key={i}>
      <path d={blob(cx, cy, r, sd, 18, .5)} className="gl-map-coast-old"/>
      <path d={blob(cx, cy, r * (1 - flood * .45), sd, 18, .5)} className="gl-map-land"/>
    </g>)}
    {[-66, 0, 66].map(x => <path key={x} d={`M${x} -146L${x + 4} 146`} className="gl-map-fold"/>)}
    <path d="M-198 0L206 -4" className="gl-map-fold"/>
    {flood > 0 && <path d={wavePath(140 - flood * 300, t, 4, .06, 3, -200, 210, 150)} className="gl-map-wet" opacity={.35}/>}
  </g>;
}
