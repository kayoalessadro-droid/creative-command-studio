import type { ReactNode } from 'react';
import { clamp } from '@/lib/enzo-timeline';

/** Deterministic pseudo-random in [0,1). */
export const rnd = (seed: number, i: number) => { const v = Math.sin(seed * 91.7 + i * 12.9898) * 43758.5453; return v - Math.floor(v); };

/** Renders an object normally, then an icy copy clipped by a circle growing from the contact point. */
export function Freezable({ id, cx, cy, p, R, children }: { id: string; cx: number; cy: number; p: number; R: number; children: ReactNode }) {
  const r = clamp(p) * R;
  return <g>
    {children}
    {r > 0.5 && <>
      <defs><clipPath id={id}><path d={blob(cx, cy, r, id.length * 3.1)}/></clipPath></defs>
      <g clipPath={`url(#${id})`}><g className="iced">{children}</g><g className="iced-tex">{children}</g></g>
    </>}
  </g>;
}

/** Irregular circle path so ice fronts never look like perfect discs. */
export function blob(cx: number, cy: number, r: number, seed: number, n = 22, jitter = .18) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i % n) / n * Math.PI * 2, rr = r * (1 - jitter / 2 + jitter * rnd(seed, i % n));
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}

/** Branching frost veins growing from a point. dir/spread in degrees limit the fan (default: all around). */
export function FrostBurst({ x, y, p, size, seed = 1, n = 8, dir = 0, spread = 360, t = 0, flash = true }: { x: number; y: number; p: number; size: number; seed?: number; n?: number; dir?: number; spread?: number; t?: number; flash?: boolean }) {
  const q = clamp(p);
  if (q <= 0) return null;
  const veins: string[] = [], tips: Array<[number, number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a0 = (dir + (spread >= 360 ? i / n * 360 : (i / Math.max(1, n - 1) - .5) * spread) + (rnd(seed, i) - .5) * 24) * Math.PI / 180;
    const L = size * q * (.65 + .5 * rnd(seed, i + 40));
    let px = x, py = y, a = a0, d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = 5;
    for (let k = 1; k <= steps; k++) {
      a += (rnd(seed, i * 7 + k) - .5) * .5;
      const nx = px + Math.cos(a) * L / steps, ny = py + Math.sin(a) * L / steps;
      d += `L${nx.toFixed(1)} ${ny.toFixed(1)}`;
      if (k >= 2 && k <= 4) {
        const side = k % 2 ? 1 : -1, tl = L * .22 * (1 - k / 6);
        veins.push(`M${nx.toFixed(1)} ${ny.toFixed(1)}L${(nx + Math.cos(a + side * .8) * tl).toFixed(1)} ${(ny + Math.sin(a + side * .8) * tl).toFixed(1)}`);
      }
      px = nx; py = ny;
    }
    veins.push(d); tips.push([px, py, rnd(seed, i + 90)]);
  }
  return <g className="frost-burst">
    {flash && q < .35 && <circle cx={x} cy={y} r={size * (.15 + q)} className="frost-flash" opacity={(.35 - q) * 2.2}/>}
    <path d={veins.join('')} className="frost-vein-glow"/>
    <path d={veins.join('')} className="frost-vein"/>
    {tips.map(([tx, ty, r], i) => <Star key={i} x={tx} y={ty} r={(3 + r * 4) * (0.6 + .4 * Math.sin(t * 6 + i))}/>)}
  </g>;
}

export function Star({ x, y, r }: { x: number; y: number; r: number }) {
  return <path className="ice-star" d={`M${x} ${y - r}L${x + r * .25} ${y - r * .25}L${x + r} ${y}L${x + r * .25} ${y + r * .25}L${x} ${y + r}L${x - r * .25} ${y + r * .25}L${x - r} ${y}L${x - r * .25} ${y - r * .25}Z`}/>;
}

/** Twinkling ice sparkles scattered in a box. */
export function Sparkles({ x, y, w, h, t, n = 10, seed = 3, amount = 1 }: { x: number; y: number; w: number; h: number; t: number; n?: number; seed?: number; amount?: number }) {
  if (amount <= 0) return null;
  return <g opacity={clamp(amount)}>{Array.from({ length: n }, (_, i) => {
    const tw = Math.max(0, Math.sin(t * (2 + rnd(seed, i) * 3) + i * 2.1));
    return tw > .05 ? <Star key={i} x={x + rnd(seed, i) * w} y={y + rnd(seed, i + 20) * h} r={2 + tw * 5}/> : null;
  })}</g>;
}

/** Soft cold vapour rising and drifting. */
export function ColdMist({ x, y, t, n = 7, w = 80, rise = 90, amount = 1, seed = 5, size = 1 }: { x: number; y: number; t: number; n?: number; w?: number; rise?: number; amount?: number; seed?: number; size?: number }) {
  if (amount <= 0) return null;
  return <g>{Array.from({ length: n }, (_, i) => {
    const ph = (t * .32 + i / n + rnd(seed, i) * .3) % 1;
    const cx = x + (rnd(seed, i + 10) - .5) * w + Math.sin(t * 1.3 + i) * 10 + ph * 18, cy = y - ph * rise;
    return <ellipse key={i} cx={cx} cy={cy} rx={(14 + ph * 30) * size} ry={(9 + ph * 18) * size} fill="url(#enzo-mist)" opacity={clamp(amount) * Math.sin(Math.PI * ph) * .85}/>;
  })}</g>;
}

/** Ice spreading across a floor, seen in perspective (flattened). */
export function IceSheet({ cx, cy, r, flat = .28, seed = 7, cracks = 0, t = 0 }: { cx: number; cy: number; r: number; flat?: number; seed?: number; cracks?: number; t?: number }) {
  if (r <= 1) return null;
  const lines: string[] = [];
  if (cracks > 0) for (let i = 0; i < 9; i++) {
    const a = rnd(seed, i) * Math.PI * 2, L = r * (.4 + .5 * rnd(seed, i + 9)) * clamp(cracks);
    const mx = cx + Math.cos(a + .2) * L * .5, my = cy + Math.sin(a + .2) * L * .5 * flat;
    lines.push(`M${cx} ${cy}L${mx.toFixed(1)} ${my.toFixed(1)}L${(cx + Math.cos(a) * L).toFixed(1)} ${(cy + Math.sin(a) * L * flat).toFixed(1)}`);
  }
  return <g>
    <g transform={`translate(${cx} ${cy}) scale(1 ${flat}) translate(${-cx} ${-cy})`}>
      <path d={blob(cx, cy, r, seed, 28, .22)} className="ice-sheet"/>
      <path d={blob(cx, cy, r * .72, seed + 2, 24, .3)} className="ice-sheet-inner"/>
    </g>
    {[0, 1, 2].map(i => <path key={i} d={`M${cx - r * (.5 - i * .25)} ${cy - r * flat * .2 + i * 6}l${r * .25} ${-r * flat * .12}`} className="ice-glint" opacity={.5 + .5 * Math.sin(t * 2 + i)}/>)}
    {lines.length > 0 && <path d={lines.join('')} className="ice-crack"/>}
  </g>;
}

/** Frost creeping in from the frame edges. */
export function EdgeFrost({ p, t }: { p: number; t: number }) {
  if (p <= 0) return null;
  const pts: Array<[number, number, number]> = [[0, 0, 45], [540, 0, 135], [0, 960, -45], [540, 960, -135], [0, 480, 0], [540, 480, 180], [270, 0, 90], [270, 960, -90]];
  return <g>
    <rect width="540" height="960" fill="url(#enzo-edge)" opacity={clamp(p)}/>
    {pts.map(([x, y, d], i) => <FrostBurst key={i} x={x} y={y} p={p} size={i < 4 ? 300 : 170} seed={30 + i} n={7} dir={d} spread={100} t={t} flash={false}/>)}
  </g>;
}

function Hand({ crystals, t, seed }: { crystals: number; t: number; seed: number }) {
  const fingers: Array<[number, number]> = [[-33, 68], [-11, 82], [11, 78], [32, 62]];
  return <g className="big-hand">
    <rect x="-56" y="86" width="112" height="150" rx="18" className="leo-shirt hand-sleeve"/>
    <path d="M-56 98H56" className="sleeve-cuff"/>
    <path className="leo-skin" d="M-47 -4Q-50 66 -24 94L24 94Q50 66 47 -4Z"/>
    {fingers.map(([x, L], i) => <rect key={i} x={x - 10} y={-L} width="20" height={L + 14} rx="10" className="leo-skin"/>)}
    <rect x="34" y="6" width="22" height="62" rx="11" className="leo-skin" transform="rotate(-38 45 62)"/>
    <path d="M-28 34Q0 48 30 26M-22 58Q4 64 26 52" className="skin-detail"/>
    {crystals > 0 && fingers.map(([x, L], i) => <g key={i} transform={`translate(${x} ${-L + 2})`}>
      {[0, 1, 2].map(k => { const s = clamp(crystals * 1.6 - k * .3 - i * .08) * (0.7 + .5 * rnd(seed, i * 3 + k)); const a = -25 + k * 25 + (rnd(seed, i + k) - .5) * 20;
        return s > 0 ? <path key={k} transform={`rotate(${a}) scale(${s})`} d="M0 -26L7 -12L7 4L0 10L-7 4L-7 -12Z" className="ice-crystal"/> : null; })}
      <Star x={0} y={-8} r={3 + 3 * Math.max(0, Math.sin(t * 5 + i))}/>
    </g>)}
  </g>;
}

/** Close-up of Enzo's hands, palms toward camera, with crystals growing from the fingers. */
export function BigHands({ t, crystals, frost, glow, tremble = 1, y = 760, id = 'hands' }: { t: number; crystals: number; frost: number; glow: number; tremble?: number; y?: number; id?: string }) {
  const j = Math.sin(t * 37) * 1.4 * tremble, k = Math.cos(t * 29) * 1.1 * tremble;
  const left = <g transform={`translate(${150 + j} ${y + k}) rotate(-14) scale(1.6)`}><Hand crystals={crystals} t={t} seed={11}/></g>;
  const right = <g transform={`translate(${390 - k} ${y + j}) rotate(14) scale(-1.6 1.6)`}><Hand crystals={crystals} t={t + .7} seed={17}/></g>;
  return <g className="enzo-scope">
    {glow > 0 && <ellipse cx="270" cy={y - 60} rx="270" ry="230" fill="url(#enzo-glow)" opacity={clamp(glow)}/>}
    <Freezable id={`${id}-l`} cx={150} cy={y - 130} p={frost} R={230}>{left}</Freezable>
    <Freezable id={`${id}-r`} cx={390} cy={y - 130} p={frost} R={230}>{right}</Freezable>
    <FrostBurst x={150} y={y - 110} p={frost * .8} size={90} seed={4} n={6} dir={-90} spread={150} t={t}/>
    <FrostBurst x={390} y={y - 110} p={frost * .8} size={90} seed={9} n={6} dir={-90} spread={150} t={t}/>
  </g>;
}
