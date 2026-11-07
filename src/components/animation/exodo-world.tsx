import type { ReactNode } from 'react';
import { Leo, type LeoExpression } from './leo';
import { blob, rnd } from './ice';
import type { V } from './gelo-world';

/* Reusable pieces for "E se a humanidade precisasse abandonar a Terra?". All coordinates are in the 540×960 frame. */

export type ExSkyKind = 'orange' | 'reddusk' | 'alien' | 'cabin' | 'space' | 'night' | 'sunset' | 'day' | 'gold' | 'storm' | 'alienDusk';
export function XSky({ kind, op = 1 }: { kind: ExSkyKind; op?: number }) {
  if (op <= 0) return null;
  return <rect x="-1500" y="-1500" width="3540" height="4000" fill={`url(#gl-sky-${kind})`} opacity={op}/>;
}

/* ---------- characters ---------- */
const MIGUEL_HAIR = <path className="leo-hair" d="M58 34Q62 16 80 20Q90 6 106 16Q124 14 126 34Q112 26 100 31Q88 23 76 31Q66 28 58 34Z"/>;
const BIA_HAIR = <g>
  <path className="leo-hair" d="M48 48Q24 40 18 62Q14 84 30 94Q34 76 50 64Z"/>
  <path className="leo-hair" d="M126 48Q150 40 156 62Q160 84 144 94Q140 76 124 64Z"/>
  <circle cx="47" cy="54" r="5.5" className="bia-tie"/><circle cx="127" cy="54" r="5.5" className="bia-tie"/>
  <path className="leo-hair" d="M64 40Q78 30 92 44Q100 30 114 40Q104 26 88 26Q72 26 64 40Z"/>
</g>;
export type Who = 'miguel' | 'bia';
export const kidScale = (who: Who, s: number) => who === 'bia' ? s * .74 : s;
type CharProps = {
  who: Who; x: number; g: number; s: number; t: number; flip?: boolean; walking?: boolean; running?: boolean; seated?: boolean;
  expression?: LeoExpression; reach?: number | undefined; armL?: number | undefined; gaze?: V | undefined; shine?: boolean; backpack?: boolean;
  shadow?: boolean; tear?: number; extra?: ReactNode; hideArms?: boolean;
};
/** Miguel (19) and his little sister Bia, both built on the shared Léo rig with their own colour scope. */
export function Char({ who, x, g, s, t, flip = false, walking = false, running = false, seated = false, expression = 'curious', reach, armL, gaze, shine = false, backpack, shadow = true, tear = 0, extra, hideArms = false }: CharProps) {
  const k = kidScale(who, s), tx = x - 90 * k, ty = g - 348 * k;
  const tr = flip ? `translate(${tx + k * 180} ${ty}) scale(${-k} ${k})` : `translate(${tx} ${ty}) scale(${k})`;
  const bia = who === 'bia';
  return <g>
    {shadow && <ellipse cx={x} cy={g + 2} rx={62 * k} ry={9 * k} className="gl-shadow"/>}
    <g transform={tr}><g className={bia ? 'bia-scope' : 'mg-scope'}>
      <Leo time={t + (bia ? 1.7 : 0)} walking={walking} running={running} seated={seated} expression={expression} backpack={backpack ?? !bia} reach={reach} armL={armL} gaze={gaze} shine={shine} hideArms={hideArms} headExtra={bia ? BIA_HAIR : MIGUEL_HAIR}/>
      {tear > 0 && <path d={`M64 92Q60 ${100 + tear * 8} 64 ${104 + tear * 8}Q68 ${100 + tear * 8} 64 92Z`} className="ex-tear" opacity={Math.min(1, tear * 2)}/>}
      {extra}
    </g></g>
  </g>;
}
export const headAt = (who: Who, x: number, g: number, s: number, flip = false): V => { const k = kidScale(who, s); return [x - 90 * k + (flip ? 92 : 88) * k, g - 348 * k + 80 * k]; };
/** Front-hand position in rig units for a given front-arm angle (see Leo `reach`). */
export function handPt(r: number): V { const a = r * Math.PI / 180, dx = 50, dy = 50; return [115 + dx * Math.cos(a) - dy * Math.sin(a), 145 + dx * Math.sin(a) + dy * Math.cos(a)]; }

/** Bia's seedling: a tin can with a sprout (grow 0) that becomes a little potted tree (grow 1). */
export function Sprout({ x, y, s = 1, t, grow = 0, pot = false, bare = false }: { x: number; y: number; s?: number; t: number; grow?: number; pot?: boolean; bare?: boolean }) {
  const h = 22 + grow * 120, sw = Math.sin(t * 2.4) * (3 + grow * 2);
  const leaves = 2 + Math.floor(grow * 9);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 -16Q${sw * .4} ${-16 - h * .5} ${sw} ${-16 - h}`} className={grow > .4 ? 'ex-stem-wood' : 'ex-stem'}/>
    {Array.from({ length: leaves }, (_, i) => {
      const k = .35 + .65 * (i / Math.max(1, leaves - 1)), ly = -16 - h * k, lx = sw * k * k, side = i % 2 ? 1 : -1, L = 9 + grow * 10 * (1 - k * .3);
      return <path key={i} d={`M${lx} ${ly}Q${lx + side * L * .6} ${ly - L * .8} ${lx + side * L * 1.4} ${ly - L * .2}Q${lx + side * L * .7} ${ly + L * .25} ${lx} ${ly}Z`} className="ex-leaf" transform={`rotate(${Math.sin(t * 2 + i) * 6} ${lx} ${ly})`}/>;
    })}
    {grow > .55 && <g opacity={(grow - .55) / .45}>{[[-14, 4, 15], [14, 2, 15], [0, -12, 18], [-6, 10, 12], [8, 12, 12]].map(([dx, dy, r], i) => <circle key={i} cx={sw + (dx ?? 0) * grow} cy={-16 - h + (dy ?? 0) * grow} r={(r ?? 12) * grow} className="ex-leaf"/>)}</g>}
    {bare ? <path d="M-30 -14Q0 -26 30 -14Q0 -6 -30 -14Z" className="ex-soil"/> : pot ? <><path d="M-22 -18H22L16 20H-16Z" className="ex-pot"/><path d="M-24 -22H24V-14H-24Z" className="ex-pot-rim"/></>
      : <><rect x="-17" y="-18" width="34" height="38" rx="3" className="ex-can"/><path d="M-17 -4H17M-17 8H17" className="ex-can-rib"/><ellipse cx="0" cy="-18" rx="17" ry="4" className="ex-soil"/></>}
  </g>;
}

/* ---------- the arks ---------- */
/** Vertical colony ark standing on its pad. `base` is the y of its feet. */
export function Ark({ x, base, h = 520, w = 120, lit = 1, seed = 1, cls = 'ex-hull' }: { x: number; base: number; h?: number; w?: number; lit?: number; seed?: number; cls?: string }) {
  const top = base - h, r = w / 2;
  return <g>
    <path d={`M${x - r - 34} ${base}L${x - r} ${base - 120}L${x - r} ${base - 40}Z`} className="ex-fin"/>
    <path d={`M${x + r + 34} ${base}L${x + r} ${base - 120}L${x + r} ${base - 40}Z`} className="ex-fin"/>
    <rect x={x - r - 26} y={base - h * .55} width="24" height={h * .55 - 10} rx="12" className={cls}/>
    <rect x={x + r + 2} y={base - h * .55} width="24" height={h * .55 - 10} rx="12" className={cls}/>
    <path d={`M${x - r} ${base - 10}L${x - r} ${top + r * 1.6}Q${x - r} ${top} ${x} ${top - r * .3}Q${x + r} ${top} ${x + r} ${top + r * 1.6}L${x + r} ${base - 10}Z`} className={cls}/>
    <path d={`M${x + r * .35} ${base - 10}L${x + r * .35} ${top + r * 1.5}Q${x + r * .4} ${top + r * .4} ${x} ${top - r * .3}Q${x + r} ${top} ${x + r} ${top + r * 1.6}L${x + r} ${base - 10}Z`} className="ex-hull-shade"/>
    {[.25, .5, .72].map(k => <rect key={k} x={x - r - 1} y={top + h * k} width={w + 2} height="14" className="ex-hull-band"/>)}
    {Array.from({ length: 9 }, (_, row) => Array.from({ length: 5 }, (_, c) => <rect key={`${row}-${c}`} x={x - r + 10 + c * (w - 20) / 5} y={top + r * 1.4 + row * (h * .7 / 9)} width={(w - 20) / 5 - 6} height="8" rx="2" className={rnd(seed, row * 7 + c) < lit ? 'ex-port-lit' : 'ex-port'}/>))}
    <path d={`M${x - r * .7} ${base - 10}L${x - r * .9} ${base + 14}H${x + r * .9}L${x + r * .7} ${base - 10}Z`} className="ex-nozzle"/>
  </g>;
}
/** Side view of an ark cruising to the right. */
export function ArkSide({ x, y, s = 1, t, engine = 1 }: { x: number; y: number; s?: number; t: number; engine?: number }) {
  const fl = 1 + Math.sin(t * 30) * .08;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {engine > 0 && <g opacity={engine}><ellipse cx={-210} cy="0" rx={90 * fl} ry="22" className="ex-plume"/><ellipse cx={-180} cy="0" rx={46 * fl} ry="13" className="ex-plume-core"/></g>}
    <path d="M-170 -26H-130V26H-170Z" className="ex-nozzle"/>
    <path d="M-140 -40L120 -40Q200 -38 230 0Q200 38 120 40L-140 40Z" className="ex-hull"/>
    <path d="M-140 10L120 10Q190 12 226 4Q200 38 120 40L-140 40Z" className="ex-hull-shade"/>
    <ellipse cx="0" cy="0" rx="36" ry="84" className="ex-ring-back"/>
    <path d="M-36 -2A36 84 0 0 0 36 -2" className="ex-ring"/>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-120 + i * 20} y="-14" width="12" height="7" rx="2" className={i % 4 === 1 ? 'ex-port' : 'ex-port-lit'}/>)}
    <path d="M-60 -40L-90 -66H-40L-20 -40Z" className="ex-fin"/><path d="M-60 40L-90 66H-40L-20 40Z" className="ex-fin"/>
    <rect x="-140" y="-46" width="40" height="92" rx="4" className="ex-hull-band"/>
    <circle cx="196" cy="-6" r="6" className="ex-port-lit"/>
    <circle cx="210" cy="-30" r="3" className={Math.sin(t * 5) > 0 ? 'ex-beacon' : 'ex-port'}/>
  </g>;
}
/** Flickering engine flame pointing down from (x, y). */
export function Flame({ x, y, w, h, t, op = 1 }: { x: number; y: number; w: number; h: number; t: number; op?: number }) {
  if (op <= 0 || h <= 1) return null;
  const f = (k: number) => 1 + Math.sin(t * 41 + k) * .06 + Math.sin(t * 23 + k * 2) * .05;
  const tear = (ww: number, hh: number) => `M${x - ww / 2} ${y}Q${x - ww * .6} ${y + hh * .45} ${x} ${y + hh}Q${x + ww * .6} ${y + hh * .45} ${x + ww / 2} ${y}Z`;
  return <g opacity={op}>
    <ellipse cx={x} cy={y + h * .4} rx={w * 1.4} ry={h * .7} fill="url(#ex-fire-glow)"/>
    <path d={tear(w, h * f(1))} className="ex-fire-outer"/>
    <path d={tear(w * .66, h * .75 * f(2))} className="ex-fire-mid"/>
    <path d={tear(w * .34, h * .45 * f(3))} className="ex-fire-core"/>
  </g>;
}
/** Billowing launch smoke spreading from (x, y) with progress p (0..1+). */
export function Smoke({ x, y, p, n = 18, seed = 3, spread = 340, cls = 'ex-smoke' }: { x: number; y: number; p: number; n?: number; seed?: number; spread?: number; cls?: string }) {
  if (p <= 0) return null;
  return <g>{Array.from({ length: n }, (_, i) => {
    const side = i % 2 ? 1 : -1, d = (.2 + rnd(seed, i) * .8) * spread * Math.min(1.4, p), up = rnd(seed, i + 9) * 90 * p;
    const r = (30 + rnd(seed, i + 3) * 50) * (.4 + Math.min(1.3, p));
    return <circle key={i} cx={x + side * d} cy={y - up} r={r} className={i % 3 ? cls : `${cls}-light`}/>;
  })}</g>;
}

/* ---------- planets ---------- */
/** The new world: teal oceans, emerald land, a ring. Draws ring back/front around the globe. */
export function NewWorld({ x, y, r, t, ring = true, id = 'ex-nw' }: { x: number; y: number; r: number; t: number; ring?: boolean; id?: string }) {
  const off = (t * 6) % 900;
  const lands: Array<[number, number, number, number]> = [[80, -60, 80, 5], [260, 50, 70, 9], [420, -90, 60, 12], [560, 30, 90, 15], [760, -20, 70, 21]];
  const ringPath = (front: boolean) => `M${x - r * 1.75} ${y + r * .1}A${r * 1.75} ${r * .42} -12 0 ${front ? 0 : 1} ${x + r * 1.75} ${y - r * .1}`;
  return <g>
    <circle cx={x} cy={y} r={r * 1.16} fill="url(#ex-nw-atmo)"/>
    {ring && <path d={ringPath(false)} className="ex-ring-band" transform={`rotate(-12 ${x} ${y})`}/>}
    <defs><clipPath id={`${id}-clip`}><circle cx={x} cy={y} r={r}/></clipPath></defs>
    <g clipPath={`url(#${id}-clip)`}>
      <circle cx={x} cy={y} r={r} className="ex-nw-ocean"/>
      {lands.map(([cx, cy, rr, sd], i) => { const px = x - r + ((cx - off) % 900 + 900) % 900 - 160, py = y + cy * r / 170, k = r / 170;
        return <g key={i}><path d={blob(px, py, rr * k, sd, 18, .5)} className="ex-nw-land"/><path d={blob(px + 8 * k, py - 6 * k, rr * k * .5, sd + 2, 14, .5)} className="ex-nw-high"/></g>; })}
      {[0, 1, 2, 3].map(i => <path key={i} d={blob(x - r + ((i * 190 - t * 9) % 760 + 760) % 760 - 100, y - r * .55 + i * r * .34, r * .2, 60 + i, 12, .6)} className="gl-cloud" opacity=".6"/>)}
      <circle cx={x} cy={y} r={r} fill="url(#gl-earth-shade)"/>
    </g>
    <circle cx={x} cy={y} r={r} className="ex-nw-rim"/>
    {ring && <path d={ringPath(true)} className="ex-ring-band" transform={`rotate(-12 ${x} ${y})`}/>}
  </g>;
}
export function Moon({ x, y, r, cls = 'ex-moon-a' }: { x: number; y: number; r: number; cls?: string }) {
  return <g><circle cx={x} cy={y} r={r * 2.2} fill="url(#ex-moon-glow)"/><circle cx={x} cy={y} r={r} className={cls}/><circle cx={x - r * .3} cy={y - r * .2} r={r * .22} className="ex-crater"/><circle cx={x + r * .35} cy={y + r * .3} r={r * .14} className="ex-crater"/></g>;
}
/** Dusty sickness spreading over a globe at (x, y, r). */
export function Blight({ x, y, r, p, t, id = 'ex-blight' }: { x: number; y: number; r: number; p: number; t: number; id?: string }) {
  if (p <= 0) return null;
  const spots: Array<[number, number, number]> = [[-.35, -.2, 1], [.25, .1, 2], [-.05, .45, 3], [.45, -.45, 4], [-.6, .35, 5], [.1, -.6, 6]];
  return <g>
    <defs><clipPath id={id}><circle cx={x} cy={y} r={r}/></clipPath></defs>
    <g clipPath={`url(#${id})`}>
      <circle cx={x} cy={y} r={r} className="ex-blight-tint" opacity={p * .45}/>
      {spots.map(([dx, dy, sd], i) => { const k = Math.min(1, Math.max(0, p * 1.4 - i * .12));
        return k > 0 ? <path key={i} d={blob(x + dx * r - t * 4, y + dy * r, r * (.08 + .32 * k), sd * 7, 24, .3)} className={i % 2 ? 'ex-blight' : 'ex-blight-dark'} opacity={.6}/> : null; })}
    </g>
  </g>;
}

/* ---------- alien nature ---------- */
export function GlowTree({ x, y, s = 1, t, seed = 1 }: { x: number; y: number; s?: number; t: number; seed?: number }) {
  const sw = Math.sin(t * 1.3 + seed) * 4;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0Q-6 -40 ${sw} -86`} className="ex-alien-trunk"/>
    <path d={blob(sw, -112, 46, seed * 5, 18, .4)} className="ex-alien-canopy"/>
    <path d={blob(sw + 10, -122, 24, seed * 5 + 1, 14, .4)} className="ex-alien-canopy-hi"/>
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={sw + (rnd(seed, i) - .5) * 70} cy={-100 + (rnd(seed, i + 4) - .5) * 60 + 12} r={2.5 + rnd(seed, i + 8) * 2} className="ex-glow-dot" opacity={.5 + .5 * Math.sin(t * 2.5 + i + seed)}/>)}
  </g>;
}
export function Waterfall({ x, top, bottom, w = 40, t }: { x: number; top: number; bottom: number; w?: number; t: number }) {
  return <g>
    <path d={`M${x - w / 2} ${top}Q${x - w * .6} ${(top + bottom) / 2} ${x - w * .7} ${bottom}L${x + w * .7} ${bottom}Q${x + w * .6} ${(top + bottom) / 2} ${x + w / 2} ${top}Z`} className="ex-fall"/>
    {[0, 1, 2, 3].map(j => <path key={j} d={`M${x - w * .35 + j * w * .22} ${top + 4}L${x - w * .45 + j * w * .3} ${bottom - 4}`} className="gl-fall-streak" strokeDashoffset={-t * 260 - j * 30}/>)}
    {[0, 1, 2].map(j => { const ph = (t * .8 + j / 3) % 1; return <ellipse key={j} cx={x + (j - 1) * w * .5} cy={bottom - ph * 50} rx={w * .7 + ph * w} ry={12 + ph * 14} className="gl-mist" opacity={(1 - ph) * .7}/>; })}
  </g>;
}
export function Spores({ t, n = 26, seed = 4, op = 1 }: { t: number; n?: number; seed?: number; op?: number }) {
  return <g opacity={op}>{Array.from({ length: n }, (_, i) => {
    const x = (rnd(seed, i) * 620 + Math.sin(t * .6 + i) * 30) % 620 - 40, y = 960 - ((rnd(seed, i + 3) * 1000 + t * (18 + rnd(seed, i) * 26)) % 1000);
    return <circle key={i} cx={x} cy={y} r={1.5 + rnd(seed, i + 6) * 2.5} className="ex-glow-dot" opacity={.35 + .5 * Math.abs(Math.sin(t * 2 + i))}/>;
  })}</g>;
}
/** Overgrown ruined tower: broken top, dark windows, hanging vines. */
export function RuinTower({ x, base, w, h, seed = 1, t, cls = 'ex-ruin' }: { x: number; base: number; w: number; h: number; seed?: number; t: number; cls?: string }) {
  const top = base - h;
  let crown = `M${x} ${top + 20}`;
  for (let i = 1; i < 6; i++) crown += `L${x + w * i / 6} ${top + rnd(seed, i) * 46}`;
  crown += `L${x + w} ${top + 30}L${x + w} ${base}L${x} ${base}Z`;
  const rows = Math.floor((h - 60) / 34), cols = Math.max(2, Math.round(w / 26));
  return <g>
    <path d={crown} className={cls}/>
    {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => rnd(seed + 2, r * 9 + c) > .18 && <rect key={`${r}-${c}`} x={x + 6 + c * (w - 12) / cols} y={top + 56 + r * 34} width={(w - 12) / cols - 7} height="16" className="ex-ruin-hole"/>))}
    {Array.from({ length: 4 }, (_, i) => { const vx = x + 8 + rnd(seed + 4, i) * (w - 16), L = 60 + rnd(seed + 5, i) * h * .5, sw = Math.sin(t * 1.2 + i) * 4;
      return <path key={i} d={`M${vx} ${top + 30}Q${vx + sw} ${top + 30 + L * .5} ${vx - sw} ${top + 30 + L}`} className="ex-vine"/>; })}
    <path d={blob(x + w * .3, top + 26, w * .35, seed + 7, 14, .5)} className="ex-moss"/>
    <path d={blob(x + w * .8, top + 40, w * .25, seed + 8, 14, .5)} className="ex-moss"/>
  </g>;
}

/* ---------- city & people ---------- */
export function SirenPole({ x, y, t, h = 150 }: { x: number; y: number; t: number; h?: number }) {
  const a = (t * 260) % 360;
  return <g>
    <path d={`M${x} ${y}V${y - h}`} className="gl-pole"/>
    <g transform={`translate(${x} ${y - h - 8})`}>
      <path d="M0 0L320 -60L320 60Z" className="ex-siren-beam" transform={`rotate(${a})`} opacity=".5"/>
      <rect x="-12" y="-10" width="24" height="20" rx="6" className="ex-siren"/>
      <circle r="22" fill="url(#ex-red-glow)" opacity={.6 + .4 * Math.abs(Math.sin(t * 8))}/>
    </g>
  </g>;
}
/** Tiny walking refugee with a suitcase, for crowds. */
export function Walker({ x, y, s = 1, t, seed = 1, flip = false, bag = true }: { x: number; y: number; s?: number; t: number; seed?: number; flip?: boolean; bag?: boolean }) {
  const st = Math.sin(t * 8 + seed * 3) * 8, cls = ['ex-coat-a', 'ex-coat-b', 'ex-coat-c', 'ex-coat-d'][seed % 4] ?? 'ex-coat-a';
  return <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 8 + seed * 3)) * 2}) scale(${flip ? -s : s} ${s})`}>
    <path d={`M-3 -24L${-4 - st * .4} 0M3 -24L${4 + st * .4} 0`} className="ex-leg"/>
    <path d="M-9 -26Q-9 -50 0 -52Q9 -50 9 -26Z" className={cls}/>
    <circle cy="-60" r="8" className={seed % 3 ? 'ex-skin-a' : 'ex-skin-b'}/>
    {bag && <><rect x="10" y="-22" width="14" height="16" rx="2" className="gl-suitcase"/><path d="M8 -36L14 -22" className="ex-leg"/></>}
  </g>;
}
export function Shuttle({ x, y, s = 1, t, rot = 0 }: { x: number; y: number; s?: number; t: number; rot?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx="-58" cy="2" rx={26 + Math.sin(t * 30) * 3} ry="7" className="ex-plume"/>
    <path d="M-44 -12H30Q58 -10 66 4Q50 16 30 16H-44Z" className="ex-hull"/>
    <path d="M18 -10Q46 -8 56 2L22 2Z" className="ex-cockpit"/>
    <path d="M-30 14L-48 30H-14L-4 14Z" className="ex-fin"/><path d="M-30 -12L-44 -26H-14L-4 -12Z" className="ex-fin"/>
  </g>;
}
