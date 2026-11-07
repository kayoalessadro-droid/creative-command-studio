import type { ReactNode } from 'react';
import { Leo, type LeoExpression } from './leo';
import { blob, rnd } from './ice';
import type { V } from './gelo-world';

/* Reusable pieces for "E se você pudesse voltar 5 segundos no tempo?". Coordinates are in the 540×960 frame. */

const pmod = (v: number, m: number) => ((v % m) + m) % m;

/* ---------- characters ---------- */
const GABRIEL_HAIR = <path className="leo-hair" d="M50 58Q44 30 66 22Q80 8 100 16Q122 14 130 36Q134 52 126 64Q120 44 104 40Q96 52 80 44Q70 54 56 50Z"/>;
const GIRL_HAIR = <g>
  <path className="leo-hair" d="M48 52Q30 66 34 110Q36 132 26 146Q50 146 56 118L54 70Z"/>
  <path className="leo-hair" d="M126 52Q146 66 142 110Q140 132 150 146Q126 146 120 118L122 70Z"/>
  <path className="leo-hair" d="M50 66Q46 26 88 24Q130 26 128 66Q112 42 90 40Q68 44 50 66Z"/>
</g>;
export type Who = 'gabriel' | 'girl';
type PersonProps = {
  who: Who; x: number; g: number; s: number; t: number; flip?: boolean; walking?: boolean; running?: boolean;
  expression?: LeoExpression; reach?: number | undefined; armL?: number | undefined; gaze?: V | undefined; shine?: boolean;
  shadow?: boolean; extra?: ReactNode; talk?: number; lean?: number; hideArms?: boolean;
};
/** Gabriel (19) and the distracted girl, both built on the shared Léo rig with their own colour scope. */
export function Person({ who, x, g, s, t, flip = false, walking = false, running = false, expression = 'curious', reach, armL, gaze, shine = false, shadow = true, extra, talk = 0, lean = 0, hideArms = false }: PersonProps) {
  const tx = x - 90 * s, ty = g - 348 * s;
  const tr = flip ? `translate(${tx + s * 180} ${ty}) scale(${-s} ${s})` : `translate(${tx} ${ty}) scale(${s})`;
  const girl = who === 'girl';
  return <g>
    {shadow && <ellipse cx={x} cy={g + 2} rx={62 * s} ry={9 * s} className="gl-shadow"/>}
    <g transform={lean ? `rotate(${flip ? -lean : lean} ${x} ${g})` : ''}><g transform={tr}><g className={girl ? 'rwg-scope' : 'gb-scope'}>
      <Leo time={t + (girl ? 1.3 : 0)} walking={walking} running={running} expression={expression} backpack={false} reach={reach} armL={armL} gaze={gaze} shine={shine} talk={talk} hideArms={hideArms} headExtra={girl ? GIRL_HAIR : GABRIEL_HAIR}/>
      {extra}
    </g></g></g>
  </g>;
}
/** Front-hand position in rig units for a given front-arm angle (see Leo `reach`). */
export function handPt(r: number): V { const a = r * Math.PI / 180; return [115 + 50 * Math.cos(a) - 50 * Math.sin(a), 145 + 50 * Math.sin(a) + 50 * Math.cos(a)]; }
/** World position of a person's front hand. */
export function handAt(x: number, g: number, s: number, reach: number, flip = false): V {
  const [hx, hy] = handPt(reach), tx = x - 90 * s, ty = g - 348 * s;
  return [flip ? tx + s * 180 - s * hx : tx + s * hx, ty + s * hy];
}

/** The hooded man in the yellow raincoat who appears in every rewind. */
export function YellowMan({ x, g, s = 1, t, raise = 0, eyes = 0, flip = false }: { x: number; g: number; s?: number; t: number; raise?: number; eyes?: number; flip?: boolean }) {
  const sway = Math.sin(t * 1.3) * 1.5, arm = -raise * 120;
  return <g transform={`translate(${x} ${g}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx="0" cy="2" rx="34" ry="6" className="gl-shadow"/>
    <path d="M-12 -70L-14 0H-3L0 -50L3 0H14L12 -70Z" className="rw-man-legs"/>
    <path d={`M-30 -60Q-28 -150 0 -160Q28 -150 30 -60Q0 -50 -30 -60Z`} className="rw-coat" transform={`rotate(${sway} 0 -60)`}/>
    <g transform={`rotate(${arm} 22 -140)`}><path d="M18 -146Q34 -120 32 -96L22 -94Q20 -118 12 -136Z" className="rw-coat"/><rect x="21" y="-104" width="12" height="7" rx="2" className="rw-watch-band"/>
      {raise > .6 && <circle cx="27" cy="-100" r={4 + Math.sin(t * 9) * 1.5} className="rw-glint" opacity={(raise - .6) / .4}/>}</g>
    <path d="M-24 -150Q-26 -196 0 -200Q26 -196 24 -150Q0 -140 -24 -150Z" className="rw-coat"/>
    <path d="M-16 -154Q-16 -186 0 -188Q16 -186 16 -154Q0 -148 -16 -154Z" className="rw-hood-in"/>
    {eyes > 0 && <g opacity={eyes}><circle cx="-6" cy="-170" r="2.4" className="rw-eye-glow"/><circle cx="6" cy="-170" r="2.4" className="rw-eye-glow"/></g>}
  </g>;
}

/** Small crowd figure. */
export function Bystander({ x, y, s = 1, t, seed = 1, flip = false, walk = 0, umbrella = false }: { x: number; y: number; s?: number; t: number; seed?: number; flip?: boolean; walk?: number; umbrella?: boolean }) {
  const st = Math.sin(t * 8 + seed * 3) * 8 * walk, cls = ['ex-coat-a', 'ex-coat-b', 'ex-coat-c', 'ex-coat-d'][seed % 4] ?? 'ex-coat-a';
  return <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 8 + seed * 3)) * 2 * walk}) scale(${flip ? -s : s} ${s})`}>
    <path d={`M-3 -24L${-4 - st * .4} 0M3 -24L${4 + st * .4} 0`} className="ex-leg"/>
    <path d="M-9 -26Q-9 -50 0 -52Q9 -50 9 -26Z" className={cls}/>
    <circle cy="-60" r="8" className={seed % 3 ? 'ex-skin-a' : 'ex-skin-b'}/>
    {umbrella && <g transform={`rotate(${Math.sin(t * 2 + seed) * 4} 0 -56)`}><path d="M10 -40V-86" className="gl-pole"/><path d="M-20 -82Q10 -110 40 -82Z" className={seed % 2 ? 'gl-umb-a' : 'gl-umb-b'}/></g>}
  </g>;
}

/* ---------- props ---------- */
export function Mug({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M10 -14Q22 -14 22 -4Q22 6 10 6" className="rw-mug-handle"/>
    <path d="M-12 -18H12L10 12Q0 15 -10 12Z" className="rw-mug"/><path d="M-12 -18H12" className="rw-mug-rim"/>
    <path d="M-7 -6H5" className="rw-mug-stripe"/>
  </g>;
}
/** Mug shards: p=0 together at (x,y), p=1 scattered across the floor. */
export function Shards({ x, y, p, s = 1 }: { x: number; y: number; p: number; s?: number }) {
  return <g>{Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI * (.1 + .8 * rnd(3, i)), d = (40 + rnd(4, i) * 110) * s * p, hop = Math.sin(Math.PI * Math.min(1, p * 1.3)) * 40 * s * rnd(5, i);
    const px = x + Math.cos(a) * d * 1.6, py = y + Math.sin(a) * d * .15 - hop;
    return <path key={i} d={blob(px, py, (4 + rnd(6, i) * 6) * s, i + 2, 5, .5)} className={i % 3 ? 'rw-mug' : 'rw-mug-rim-fill'} transform={`rotate(${p * 300 * (rnd(7, i) - .5)} ${px} ${py})`}/>;
  })}{p > .02 && p < .6 && <ellipse cx={x} cy={y} rx={30 * s * p * 3} ry={6 * s} className="rw-splash" opacity={1 - p / .6}/>}</g>;
}
export function Phone({ x, y, rot = 0, s = 1, lit = 1 }: { x: number; y: number; rot?: number; s?: number; lit?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x="-8" y="-14" width="16" height="28" rx="3" className="rw-phone"/><rect x="-6" y="-11" width="12" height="21" rx="1.5" className="rw-phone-screen" opacity={lit}/></g>;
}
export function Ball({ x, y, r = 16, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><circle r={r} className="rw-ball"/><path d={`M${-r} 0Q0 ${-r * .5} ${r} 0M0 ${-r}Q${r * .4} 0 0 ${r}`} className="rw-ball-line"/></g>;
}
/** Analog watch/clock face. Angles in turns of the dial (0..1 from 12 o'clock). */
export function Dial({ x, y, r, hour, minute, second, glow = 0, cls = 'rw-dial', wedge = 0 }: { x: number; y: number; r: number; hour: number; minute: number; second: number; glow?: number; cls?: string; wedge?: number }) {
  const hand = (turn: number, L: number, w: string) => { const a = turn * Math.PI * 2; return <path d={`M${x} ${y}L${x + Math.sin(a) * L} ${y - Math.cos(a) * L}`} className={w}/>; };
  const wa = second * Math.PI * 2, wb = (second + wedge) * Math.PI * 2;
  return <g>
    {glow > 0 && <circle cx={x} cy={y} r={r * 1.5} fill="url(#rw-blue-glow)" opacity={glow}/>}
    <circle cx={x} cy={y} r={r} className={cls}/>
    {wedge > 0 && <path d={`M${x} ${y}L${x + Math.sin(wa) * r * .92} ${y - Math.cos(wa) * r * .92}A${r * .92} ${r * .92} 0 0 1 ${x + Math.sin(wb) * r * .92} ${y - Math.cos(wb) * r * .92}Z`} className="rw-wedge"/>}
    {Array.from({ length: 60 }, (_, i) => { const a = i / 60 * Math.PI * 2, k = i % 5 ? .93 : .84; return <path key={i} d={`M${x + Math.sin(a) * r * k} ${y - Math.cos(a) * r * k}L${x + Math.sin(a) * r * .97} ${y - Math.cos(a) * r * .97}`} className={i % 5 ? 'rw-tick' : 'rw-tick-big'}/>; })}
    {hand(hour, r * .5, 'rw-hand-h')}{hand(minute, r * .74, 'rw-hand-m')}{hand(second, r * .86, 'rw-hand-s')}
    <circle cx={x} cy={y} r={r * .05} className="rw-hand-cap"/>
  </g>;
}

/* ---------- environments ---------- */
export function Kitchen({ t, man = false }: { t: number; man?: boolean }) {
  return <g>
    <rect x="-400" y="-200" width="1400" height="1100" className="rw-wall"/>
    <g><rect x="280" y="220" width="220" height="260" rx="6" className="rw-window"/>
      <rect x="290" y="230" width="200" height="240" fill="url(#gl-sky-day)"/>
      <path d="M290 400Q350 370 400 390Q450 360 490 380V470H290Z" className="rw-far-bld"/>
      {man && <YellowMan x={440} g={455} s={.28} t={t}/>}
      <path d="M390 230V470M290 350H490" className="rw-window-bar"/><rect x="280" y="220" width="220" height="260" rx="6" className="rw-window-frame"/></g>
    <rect x="-400" y="-200" width="1400" height="1100" fill="url(#rw-sun-beam)"/>
    <rect x="-100" y="80" width="300" height="130" rx="6" className="rw-cabinet"/><path d="M50 80V210" className="rw-line"/>
    <rect x="-400" y="860" width="1400" height="300" className="rw-floor"/>
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-300 + i * 110} 860L${-420 + i * 150} 1100`} className="rw-floor-line"/>)}
    <rect x="300" y="620" width="300" height="240" className="rw-counter"/><rect x="290" y="604" width="320" height="22" rx="4" className="rw-counter-top"/>
    <path d="M330 660H420M460 660H560" className="rw-line"/>
    {[0, 1, 2].map(i => <path key={i} d={`M${340 + i * 14} ${590 - pmod(t * 20 + i * 12, 40)}q6 -8 0 -16`} className="rw-steam" opacity={.5}/>)}
    <rect x="330" y="590" width="40" height="16" rx="4" className="rw-pot"/>
  </g>;
}
export function Living({ t }: { t: number }) {
  return <g>
    <rect x="-400" y="-200" width="1400" height="1100" className="rw-wall-b"/>
    <rect x="40" y="200" width="160" height="200" rx="4" className="rw-frame"/><path d="M60 360L100 290L130 330L150 300L180 360Z" className="rw-art"/>
    <rect x="-400" y="860" width="1400" height="300" className="rw-floor"/>
    <rect x="300" y="640" width="230" height="16" rx="4" className="rw-table"/><path d="M320 656V860M510 656V860" className="rw-table-leg"/>
    <path d="M-60 860V700Q-60 660 -20 660H160Q200 660 200 700V860Z" className="rw-sofa"/>
    <path d={`M450 640q0 -30 20 -40`} className="rw-plant-stem"/><circle cx="472" cy="596" r={14 + Math.sin(t) * .5} className="ex-leaf"/>
  </g>;
}
export function Stairs() {
  return <g>
    <rect x="-400" y="-200" width="1400" height="1400" className="rw-wall"/>
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-40 + i * 70} ${300 + i * 70}H${30 + i * 70}V${370 + i * 70}`} className="rw-step"/>)}
    <path d="M-60 260L620 940" className="rw-rail"/>{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-20 + i * 80} ${300 + i * 80 - 20}V${300 + i * 80 - 80}`} className="rw-rail-post"/>)}
  </g>;
}
export function Park({ t, man = false }: { t: number; man?: boolean }) {
  return <g>
    <rect x="-400" y="-400" width="1400" height="1100" fill="url(#gl-sky-day)"/>
    {[[-20, 180, 1], [380, 120, .8]].map(([x, y, s], i) => <path key={i} d={blob((x ?? 0) + t * 6, y ?? 0, 50 * (s ?? 1), i + 4, 14, .3)} className="gl-cloud"/>)}
    <path d="M-300 620Q100 540 300 600Q460 560 900 610V1200H-300Z" className="gl-hill-far"/>
    <rect x="-300" y="700" width="1200" height="600" className="gl-field"/>
    {[[40, 640, 1.2], [480, 650, 1.4]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0V-80" className="rw-trunk"/><path d={blob(0, -110, 50, i + 9, 16, .3)} className="rw-crown"/></g>)}
    {man && <YellowMan x={330} g={660} s={.3} t={t}/>}
    <path d="M-300 870Q270 830 900 880" className="rw-path"/>
  </g>;
}
export function Skyline({ t, kind = 'gold', lit = .2, base = 760 }: { t: number; kind?: string; lit?: number; base?: number }) {
  const blds: Array<[number, number, number, string]> = [[-60, 90, 16, 'gl-bld-b'], [40, 70, 22, 'gl-bld-a'], [120, 100, 12, 'gl-bld-c'], [230, 80, 26, 'gl-bld-b'], [320, 70, 18, 'gl-bld-a'], [400, 110, 14, 'gl-bld-c'], [500, 80, 20, 'gl-bld-b']];
  return <g>
    <rect x="-600" y="-600" width="1740" height="2000" fill={`url(#gl-sky-${kind})`}/>
    {blds.map(([x, w, f, cls], i) => { const fh = 22, h = f * fh; return <g key={i}><rect x={x} y={base - h} width={w} height={h} className={cls}/>
      {Array.from({ length: f }, (_, r) => Array.from({ length: 3 }, (_, c) => <rect key={`${r}-${c}`} x={x + 8 + c * (w - 16) / 3} y={base - h + r * fh + 6} width={(w - 16) / 3 - 6} height="10" className={rnd(i + 1, r * 5 + c) < lit ? 'gl-win-lit' : 'gl-win'}/>))}</g>; })}
    <rect x="-600" y={base} width="1740" height="900" className="gl-walk"/>
    {[0, 1, 2].map(i => <path key={i} d={`M${-100 + pmod(t * 30 + i * 260, 800)} ${130 + i * 50}q12 -8 24 0q12 -8 24 0`} className="rw-bird"/>)}
  </g>;
}

/* ---------- the perspective street of the near-accident ---------- */
const VP: V = [270, 430];
/** Front view of a car at depth d (0 = far end of the road, 1 = at the crosswalk). */
export function CarFront({ d, t }: { d: number; t: number }) {
  const y = VP[1] + 18 + d * 380, s = .14 + d * 1.15;
  return <g transform={`translate(${270} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="6" rx="120" ry="16" className="gl-shadow"/>
    <path d="M-110 0V-60Q-110 -76 -94 -80L-70 -128Q-64 -140 -48 -140H48Q64 -140 70 -128L94 -80Q110 -76 110 -60V0Z" className="rw-car"/>
    <path d="M-62 -124H62L80 -84H-80Z" className="rw-car-glass"/>
    <rect x="-100" y="-56" width="200" height="34" rx="8" className="rw-car-grill"/>
    <circle cx="-74" cy="-40" r="14" className="rw-headlight"/><circle cx="74" cy="-40" r="14" className="rw-headlight"/>
    <circle cx="-74" cy="-40" r={60 + Math.sin(t * 20) * 3} fill="url(#rw-head-glow)"/><circle cx="74" cy="-40" r={60 + Math.sin(t * 20) * 3} fill="url(#rw-head-glow)"/>
    <rect x="-104" y="-6" width="30" height="12" rx="3" className="gl-wheel"/><rect x="74" y="-6" width="30" height="12" rx="3" className="gl-wheel"/>
  </g>;
}
export function TrafficLight({ x, y, state, s = 1 }: { x: number; y: number; state: 'red' | 'green' | 'yellow'; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0V-200" className="rw-pole-thin"/><rect x="-16" y="-270" width="32" height="80" rx="8" className="rw-light-box"/>
    {(['red', 'yellow', 'green'] as const).map((c, i) => <circle key={c} cx="0" cy={-254 + i * 25} r="9" className={state === c ? `rw-l-${c}` : 'rw-l-off'}/>)}
  </g>;
}
export function Street({ t, night = false, man = false, light = 'green' }: { t: number; night?: boolean; man?: boolean; light?: 'red' | 'green' | 'yellow' }) {
  const [vx, vy] = VP;
  return <g>
    <rect x="-600" y="-600" width="1740" height="2000" fill={`url(#gl-sky-${night ? 'storm' : 'day'})`}/>
    {[[-80, 120, 22, 'gl-bld-a'], [30, 90, 30, 'gl-bld-b'], [110, 100, 26, 'gl-bld-c']].map(([x, w, f, c], i) => <rect key={i} x={x as number} y={vy + 20 - (f as number) * 18} width={w as number} height={(f as number) * 18} className={c as string}/>)}
    {[[330, 100, 28, 'gl-bld-c'], [420, 110, 22, 'gl-bld-a'], [520, 120, 32, 'gl-bld-b']].map(([x, w, f, c], i) => <rect key={i} x={x as number} y={vy + 20 - (f as number) * 18} width={w as number} height={(f as number) * 18} className={c as string}/>)}
    {Array.from({ length: 40 }, (_, i) => { const L = i < 20, col = i % 4, row = Math.floor((i % 20) / 4); return <rect key={i} x={(L ? -60 : 345) + col * 26 + (L ? 0 : 0)} y={vy - 120 + row * 26} width="12" height="14" className={rnd(2, i) < (night ? .55 : .15) ? 'gl-win-lit' : 'gl-win'}/>; })}
    <path d={`M-600 ${vy + 20}H1140V1600H-600Z`} className="gl-walk"/>
    <path d={`M${vx - 30} ${vy + 18}L${vx + 30} ${vy + 18}L760 1100L-220 1100Z`} className="gl-road"/>
    <path d={`M${vx} ${vy + 22}L270 1100`} className="gl-road-dash"/>
    {Array.from({ length: 8 }, (_, i) => { const y0 = 770, y1 = 830, w0 = (y0 - vy) * 1.1, w1 = (y1 - vy) * 1.1, k = i / 8, k2 = (i + .55) / 8;
      return <path key={i} d={`M${vx - w0 + 2 * w0 * k} ${y0}L${vx - w0 + 2 * w0 * k2} ${y0}L${vx - w1 + 2 * w1 * k2} ${y1}L${vx - w1 + 2 * w1 * k} ${y1}Z`} className="rw-zebra"/>; })}
    <TrafficLight x={70} y={760} state={light}/>
    {man && <YellowMan x={440} g={500} s={.33} t={t}/>}
  </g>;
}

/* ---------- storm night ---------- */
export function RainR({ t, n = 90, amount = 1, slant = 8, seed = 6, dir = 1 }: { t: number; n?: number; amount?: number; slant?: number; seed?: number; dir?: number }) {
  return <g opacity={amount}>{Array.from({ length: n }, (_, i) => {
    const x = rnd(seed, i) * 700 - 80, y = pmod(rnd(seed, i + 40) * 1100 + t * 1300 * dir, 1100) - 70;
    return <path key={i} d={`M${x} ${y}l${-slant} 34`} className="rw-rain"/>;
  })}</g>;
}
export function Lamp({ x, g, h = 380, angle = 0, lit = 1, t }: { x: number; g: number; h?: number; angle?: number; lit?: number; t: number }) {
  const fl = lit * (.85 + .15 * Math.sin(t * 31) * Math.sin(t * 7));
  return <g transform={`rotate(${angle} ${x} ${g})`}>
    <circle cx={x + 50} cy={g - h + 20} r="170" fill="url(#ex-lamp-glow)" opacity={fl}/>
    <path d={`M${x} ${g}V${g - h}Q${x} ${g - h - 20} ${x + 30} ${g - h - 10}L${x + 60} ${g - h + 4}`} className="rw-lamp-pole"/>
    <path d={`M${x + 42} ${g - h}H${x + 78}L${x + 70} ${g - h + 14}H${x + 50}Z`} className="rw-lamp-head"/>
    <ellipse cx={x + 60} cy={g - h + 16} rx="10" ry="4" className="rw-lamp-bulb" opacity={fl}/>
  </g>;
}
export function BusStop({ x, g, s = 1 }: { x: number; g: number; s?: number }) {
  return <g transform={`translate(${x} ${g}) scale(${s})`}>
    <path d="M0 0V-170M160 0V-170" className="rw-pole-thin"/><rect x="-14" y="-186" width="188" height="20" rx="4" className="rw-shelter-roof"/>
    <rect x="6" y="-160" width="148" height="110" className="rw-shelter-glass"/><rect x="20" y="-40" width="120" height="10" rx="3" className="rw-bench"/>
  </g>;
}
export function StormStreet({ t, flash = 0 }: { t: number; flash?: number }) {
  return <g>
    <rect x="-600" y="-600" width="1740" height="2000" fill="url(#gl-sky-storm)"/>
    {[[-60, 120, 24], [70, 90, 32], [170, 100, 20], [300, 110, 30], [420, 90, 26], [520, 120, 34]].map(([x, w, f], i) =>
      <g key={i}><rect x={x} y={780 - (f ?? 0) * 18} width={w} height={(f ?? 0) * 18} className="rw-bld-night"/>
        {Array.from({ length: 30 }, (_, k) => <rect key={k} x={(x ?? 0) + 10 + (k % 3) * ((w ?? 0) - 20) / 3} y={790 - (f ?? 0) * 18 + Math.floor(k / 3) * 34} width="12" height="14" className={rnd(i + 3, k) < .4 ? 'gl-win-lit' : 'rw-win-night'}/>)}</g>)}
    <rect x="-600" y="780" width="1740" height="900" className="rw-wet-road"/>
    {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={rnd(9, i) * 600 - 30} cy={820 + rnd(10, i) * 120} rx={30 + 20 * rnd(11, i)} ry="4" className="rw-puddle"/>)}
    {flash > 0 && <rect x="-600" y="-600" width="1740" height="2000" className="gl-flash" opacity={flash * .6}/>}
  </g>;
}
/** Sparks from a fallen lamp. */
export function Sparks({ x, y, p, n = 14 }: { x: number; y: number; p: number; n?: number }) {
  if (p <= 0 || p >= 1) return null;
  return <g>{Array.from({ length: n }, (_, i) => { const a = -Math.PI * rnd(12, i), v = 60 + 160 * rnd(13, i), px = x + Math.cos(a) * v * p, py = y + Math.sin(a) * v * p + 200 * p * p;
    return <path key={i} d={`M${px} ${py}l${Math.cos(a) * 10} ${Math.sin(a) * 10}`} className="rw-spark" opacity={1 - p}/>; })}
    <circle cx={x} cy={y} r={50 * p + 10} fill="url(#ex-fire-glow)" opacity={1 - p}/></g>;
}
export function Dust({ x, y, p, w = 160 }: { x: number; y: number; p: number; w?: number }) {
  if (p <= 0) return null;
  return <g opacity={Math.max(0, 1 - p * .8)}>{Array.from({ length: 8 }, (_, i) => <path key={i} d={blob(x + (rnd(14, i) - .5) * w * (.5 + p), y - 20 * p - rnd(15, i) * 30, 20 + 40 * p, i + 30, 12, .4)} className="rw-dust"/>)}</g>;
}

/* ---------- the rewind effect ---------- */
/** Overlay shown while time runs backwards: cyan wash, tracking bands and counter-rotating clock rings. */
export function RewindFx({ t, p, cx = 270, cy = 480 }: { t: number; p: number; cx?: number; cy?: number }) {
  if (p <= 0) return null;
  return <g opacity={p} pointerEvents="none">
    <rect width="540" height="960" className="rw-wash"/>
    {[0, 1, 2].map(i => <rect key={i} x="0" y={pmod(-t * 900 + i * 380, 1140) - 90} width="540" height={18 + i * 8} className="rw-band"/>)}
    {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M0 ${i * 24 + pmod(-t * 200, 24)}H540`} className="rw-scan"/>)}
    {[150, 240, 330].map((r, i) => <g key={r} transform={`rotate(${-t * (160 + i * 70)} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={r} className="rw-ring" strokeDasharray={`${r * .9} ${r * .35}`}/>
      <path d={`M${cx - 10} ${cy - r - 12}L${cx - 26} ${cy - r}L${cx - 10} ${cy - r + 12}`} className="rw-ring-arrow"/>
    </g>)}
  </g>;
}
/** Brief cyan pulse when time snaps back to normal. */
export function SnapRing({ cx, cy, p }: { cx: number; cy: number; p: number }) {
  if (p <= 0 || p >= 1) return null;
  return <circle cx={cx} cy={cy} r={20 + p * 520} className="rw-snap" opacity={1 - p}/>;
}
