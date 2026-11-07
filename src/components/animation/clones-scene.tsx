import type { ReactNode } from 'react';
import { getClonesFrame, ramp, lin, clamp, handPos, T, talkAmount, appearAt } from '@/lib/clones-timeline';
import { Leo, type LeoExpression } from './leo';
import { Sparkles, rnd } from './ice';

const S = 1.15, G = 840;
type V = readonly [number, number];
const z = (cx: number, cy: number, s: number) => `translate(${270 - cx * s} ${480 - cy * s}) scale(${s})`;
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------- Lucas: one rig for the original and every copy ---------- */
const QUIFF = <>
  <path className="leo-hair" d="M52 54Q46 14 88 8Q128 4 136 40Q122 26 104 28Q118 44 108 60Q96 38 74 40Q62 44 52 54Z"/>
  <path className="leo-hair" d="M98 40Q110 56 99 68Q94 56 86 50Z"/>
</>;
function Hoodie() {
  return <g>
    <path d="M66 129Q88 151 112 131" className="hood-collar"/>
    <path d="M81 141L79 172M96 141L98 172" className="hood-string"/>
    <circle cx="79" cy="174" r="2.6" className="hood-tip"/><circle cx="98" cy="174" r="2.6" className="hood-tip"/>
    <path d="M68 194Q89 188 110 194L112 214Q89 220 66 214Z" className="hood-pocket"/>
    <path d="M57 219Q88 231 121 221" className="hood-hem"/>
  </g>;
}
function CrossedArms() {
  return <g className="leo-rig">
    <path className="leo-shirt" d="M62 132Q45 134 44 156L46 180L64 178L68 152Z"/>
    <path className="leo-shirt" d="M113 132Q130 134 132 156L130 180L112 178L108 152Z"/>
    <path className="leo-shirt" d="M46 166Q86 158 124 172L121 189Q85 178 49 184Z"/>
    <path className="leo-skin" d="M120 170Q135 167 137 178Q136 190 122 189Z"/>
    <path className="leo-shirt" d="M130 164Q92 162 54 178L58 194Q94 180 128 182Z"/>
    <path className="leo-skin" d="M58 176Q43 178 43 188Q45 199 59 194Z"/>
  </g>;
}
type LP = {
  x: number; t: number; g?: number; s?: number; flip?: boolean; walking?: boolean; running?: boolean; seated?: boolean;
  expression?: LeoExpression; reach?: number | undefined; armL?: number | undefined; gaze?: V | undefined; shine?: boolean;
  crossed?: boolean; talk?: number; appear?: number; pop?: number; flicker?: number; jitter?: number; lift?: number; rot?: number;
  extra?: ReactNode; shadow?: boolean; pace?: number;
};
function Lucas({ x, t, g = G, s = S, flip = false, walking = false, running = false, seated = false, expression = 'curious', reach, armL, gaze, shine = true, crossed = false, talk = 0, appear = 1, pop = -1, flicker = 0, jitter = 0, lift = 0, rot = 0, extra, shadow = true, pace = 1 }: LP) {
  if (appear <= 0) return null;
  const tx = x - 90 * s, ty = g - 348 * s - lift;
  const jx = jitter ? (rnd(Math.floor(t * 30), 1) - .5) * jitter : 0, jy = jitter ? (rnd(Math.floor(t * 30), 2) - .5) * jitter : 0;
  const k = pop >= 0 && pop < 1 ? 1 + .16 * Math.exp(-pop * 5) * Math.sin(pop * 22) : 1;
  const tr = flip ? `translate(${tx + s * 180 + jx} ${ty + jy}) scale(${-s} ${s})` : `translate(${tx + jx} ${ty + jy}) scale(${s})`;
  const body = (cls: string) => <g transform={tr}><g className={cls}>
    <Leo time={t * pace} walking={walking} running={running} seated={seated} expression={expression} backpack={false} reach={reach} armL={armL} gaze={gaze} shine={shine} hideArms={crossed} talk={talk} headExtra={QUIFF}/>
    <Hoodie/>{crossed && <CrossedArms/>}{extra}
  </g></g>;
  const ghost = Math.max(appear < 1 ? Math.sin(Math.PI * appear) : 0, flicker);
  const hip = g - 126 * s;
  return <g transform={`translate(${x} ${g}) scale(${k}) translate(${-x} ${-g})${rot ? ` rotate(${rot} ${x} ${hip})` : ''}`}>
    {shadow && !rot && !seated && <ellipse cx={x} cy={g + 2} rx={70 * s * (1 - lift / 300)} ry={11 * s} className="cl-shadow" opacity={appear}/>}
    <g opacity={appear * (1 - flicker * .6)}>{body('lucas-scope')}</g>
    {ghost > .02 && <g opacity={ghost}>{body('lucas-scope clone-ghost')}</g>}
  </g>;
}
const hand = (x: number, angle: number, flip = false, s = S, g = G) => handPos(angle, x - 90 * s, g - 348 * s, s, flip);
const headOf = (x: number, flip = false, s = S, g = G): V => [x - 90 * s + (flip ? 92 : 88) * s, g - 348 * s + 80 * s];
/** Arm sweep used to create or erase copies. */
function swing(t: number, at: number, a = -18, b = -118, back = -45) {
  if (t < at) return a;
  if (t < at + .45) return mix(a, b, ramp(t, at, at + .45));
  return mix(b, back, ramp(t, at + .6, at + 1.1));
}

/* ---------- effects ---------- */
function Glow({ x, y, r, a }: { x: number; y: number; r: number; a: number }) {
  return a > 0 ? <circle cx={x} cy={y} r={r} fill="url(#cl-glow)" opacity={clamp(a)}/> : null;
}
function SpawnFx({ x, p, t, s = S, g = G }: { x: number; p: number; t: number; s?: number; g?: number }) {
  if (p < -.2 || p > 1.3) return null;
  const h = 370 * s, q = clamp((p + .2) / 1.5), beam = Math.sin(Math.PI * q);
  return <g>
    <rect x={x - 72 * s} y={g - h - 30} width={144 * s} height={h + 34} fill="url(#cl-beam)" opacity={beam * .9}/>
    {[0, 1, 2].map(i => { const r = clamp((p - i * .14) / .8); return r > 0 && r < 1 ? <ellipse key={i} cx={x} cy={g - 2} rx={(40 + r * 120) * s} ry={(40 + r * 120) * s * .2} className="clone-ring" opacity={1 - r}/> : null; })}
    {p > -.02 && p < .25 && <circle cx={x} cy={g - 200 * s} r={(60 + p * 320) * s} className="clone-flash" opacity={(.25 - p) * 3}/>}
    <Sparkles x={x - 95 * s} y={g - h} w={190 * s} h={h} t={t} n={16} seed={Math.round(x) % 50 + 3} amount={beam}/>
  </g>;
}
function Dissolve({ x, p, t, s = S, g = G }: { x: number; p: number; t: number; s?: number; g?: number }) {
  if (p <= 0 || p >= 1.4) return null;
  return <g>{Array.from({ length: 26 }, (_, i) => {
    const k = clamp(p * 1.2 - rnd(11, i) * .3);
    const px = x + (rnd(7, i) - .5) * 150 * s + Math.sin(t * 3 + i) * 8, py = g - rnd(9, i) * 380 * s - k * 170;
    return k > 0 && k < 1 ? <circle key={i} cx={px} cy={py} r={(2.5 + rnd(13, i) * 4.5) * (1 - k)} className="clone-particle"/> : null;
  })}</g>;
}
function Trail({ x, at, t, flip = false, a = -18, b = -118 }: { x: number; at: number; t: number; flip?: boolean; a?: number; b?: number }) {
  const p = (t - at) / .45;
  if (p <= 0 || p >= 1.6) return null;
  const head = clamp(p), tail = clamp(p - .5);
  const d = Array.from({ length: 13 }, (_, i) => { const h = hand(x, mix(a, b, ease3(tail + (head - tail) * i / 12)), flip); return `${i ? 'L' : 'M'}${h.x.toFixed(1)} ${h.y.toFixed(1)}`; }).join('');
  return <g opacity={1 - clamp((p - 1) / .6)}><path d={d} className="clone-trail-glow"/><path d={d} className="clone-trail"/></g>;
}
const ease3 = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };
function Note({ x, y, o }: { x: number; y: number; o: number }) {
  return o > 0 ? <g opacity={o} transform={`translate(${x} ${y})`}><path d="M0 0V-26L14 -30V-6" className="cl-note-stem"/><ellipse cx="-4" cy="1" rx="6" ry="4.5" className="cl-note"/><ellipse cx="10" cy="-5" rx="6" ry="4.5" className="cl-note"/></g> : null;
}

/* ---------- props held in rig units ---------- */
const GUITAR = <g>
  <path d="M120 196L216 138" className="cl-neck"/><rect x="208" y="128" width="20" height="14" rx="3" transform="rotate(-31 218 135)" className="cl-wood-dark"/>
  <circle cx="98" cy="214" r="27" className="cl-guitar"/><circle cx="122" cy="196" r="20" className="cl-guitar"/><circle cx="110" cy="205" r="7" className="cl-hole"/>
</g>;
const CONTROLLER = <g transform="translate(180 156)"><rect x="-18" y="-9" width="36" height="18" rx="8" className="cl-controller"/><circle cx="8" cy="-1" r="2.6" className="cl-btn"/><circle cx="-8" cy="-1" r="2.6" className="cl-btn2"/></g>;
const BASKET = <g transform="translate(176 150)"><path d="M-40 -14H40L32 34H-32Z" className="cl-basket"/><path d="M-36 0H36M-34 14H34" className="cl-basket-line"/><path d="M-30 -14Q-20 -32 -4 -18Q8 -34 22 -16" className="cl-cloth"/></g>;

/* ---------- environments ---------- */
const MESS: Array<[number, number, string]> = [[110, 880, 'shirt'], [330, 905, 'sock'], [400, 868, 'ball'], [40, 918, 'shirt2'], [250, 928, 'can'], [180, 860, 'sock']];
function MessItem({ kind, x, y, r }: { kind: string; x: number; y: number; r: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r})`}>
    {kind === 'shirt' || kind === 'shirt2' ? <path d="M-26 -14L-12 -20Q0 -14 12 -20L26 -14L20 -2L12 -6L12 16H-12L-12 -6L-20 -2Z" className={kind === 'shirt' ? 'cl-cloth' : 'cl-cloth2'}/>
      : kind === 'sock' ? <path d="M-6 -16H6V4Q6 10 14 10V18H-4Q-8 18 -8 12Z" className="cl-sock"/>
      : kind === 'ball' ? <circle r="10" className="cl-paper"/> : <rect x="-7" y="-12" width="14" height="24" rx="3" className="cl-can"/>}
  </g>;
}
function Bedroom({ t, mess }: { t: number; mess: number }) {
  return <g>
    <rect x="-400" y="-400" width="1400" height="1220" className="cl-wall"/>
    {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${-360 + i * 70} -400V812`} className="cl-wall-stripe"/>)}
    <rect x="40" y="190" width="170" height="220" rx="6" className="cl-window-sky"/>
    <circle cx="160" cy="300" r="26" className="cl-sunset"/>
    <path d="M40 410V350H70V320H100V360H130V300H165V345H210V410Z" className="cl-city"/>
    <rect x="40" y="190" width="170" height="220" rx="6" className="cl-frame"/><path d="M125 190V410M40 300H210" className="cl-frame-line"/>
    <path d="M24 176Q46 290 28 430H8V176Z" className="cl-curtain"/><path d="M226 176Q204 290 222 430H242V176Z" className="cl-curtain"/>
    <rect x="270" y="220" width="86" height="124" rx="4" className="cl-poster"/>
    <path d="M313 240Q328 262 326 300L300 300Q298 262 313 240Z" className="cl-rocket"/><path d="M300 300L292 316L304 306M326 300L334 316L322 306" className="cl-rocket"/><circle cx="313" cy="270" r="6" className="cl-window-sky"/>
    <rect x="440" y="420" width="190" height="10" className="cl-shelf"/>
    {[[448, 'a'], [466, 'b'], [484, 'c'], [504, 'a'], [530, 'b']].map(([x, c], i) => <rect key={i} x={Number(x)} y={i === 3 ? 386 : 378} width="16" height={i === 3 ? 34 : 42} className={`cl-book-${c}`}/>)}
    {/* bed */}
    <rect x="-46" y="600" width="30" height="214" rx="6" className="cl-bed-frame"/>
    <rect x="-40" y="760" width="420" height="40" rx="6" className="cl-bed-frame"/>
    <path d="M-30 800V820M360 800V820" className="cl-leg"/>
    <rect x="-34" y="738" width="406" height="28" rx="12" className="cl-mattress"/>
    <ellipse cx="34" cy="728" rx="48" ry="16" className="cl-pillow"/>
    <path d="M120 742Q240 728 372 744L376 790Q250 800 118 792Z" className="cl-blanket"/>
    {/* desk & chair */}
    <rect x="384" y="560" width="14" height="150" rx="4" className="cl-chair"/><rect x="384" y="702" width="84" height="12" rx="4" className="cl-chair"/><path d="M394 714V812M460 714V812" className="cl-leg"/>
    <rect x="470" y="628" width="230" height="16" rx="3" className="cl-desk"/><path d="M490 644V812M680 644V812" className="cl-leg"/>
    <path d="M640 628V570L610 548" className="cl-lamp-arm"/><path d="M598 534H626L636 558H588Z" className="cl-lamp-head"/>
    <rect x="590" y="612" width="44" height="16" className="cl-book-a"/><rect x="596" y="600" width="36" height="12" className="cl-book-c"/>
    {/* floor */}
    <rect x="-400" y="812" width="1400" height="600" className="cl-floor"/>
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-400 + i * 120} 812L${-560 + i * 150} 1400`} className="cl-plank"/>)}
    <ellipse cx="300" cy="900" rx="220" ry="40" className="cl-rug"/>
    <path d="M440 850H500L494 900H446Z" className="cl-basket"/><path d="M444 866H496M446 882H494" className="cl-basket-line"/>
    {MESS.map(([x, y, kind], i) => {
      const k = ramp(1 - mess, i * .12, i * .12 + .35), bx = 470, by = 852;
      const px = mix(x, bx, k), py = mix(y, by, k) - Math.sin(Math.PI * k) * 110;
      return k < .98 ? <MessItem key={i} kind={kind} x={px} y={py} r={i * 40 + k * 300 + Math.sin(t + i) * 2}/> : null;
    })}
  </g>;
}
function LivingRoom({ t, chaos, tv, wallShadow }: { t: number; chaos: number; tv: number; wallShadow?: ReactNode }) {
  return <g>
    <rect x="-900" y="-500" width="2200" height="1312" className="cl-lr-wall"/>
    {wallShadow}
    {/* kitchen */}
    <rect x="-340" y="520" width="440" height="116" className="cl-backsplash"/>
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-340 + (i % 11) * 40} y={520 + Math.floor(i / 11) * 58} width="40" height="58" className="cl-tile"/>)}
    <rect x="-340" y="300" width="440" height="140" rx="4" className="cl-cabinet"/>
    {[-230, -120, -10].map(x => <path key={x} d={`M${x} 300V440M${x - 14} 410V430M${x + 14} 410V430`} className="cl-cab-line"/>)}
    <rect x="-350" y="636" width="460" height="18" className="cl-counter-top"/><rect x="-340" y="654" width="440" height="158" className="cl-cabinet"/>
    <rect x="-280" y="630" width="140" height="10" rx="3" className="cl-stove"/>
    <rect x="-262" y="680" width="104" height="100" rx="6" className="cl-oven"/>
    {/* window */}
    <rect x="160" y="230" width="210" height="230" rx="6" className="cl-day-sky"/>
    <path d="M160 460V380Q210 350 260 380Q310 340 370 372V460Z" className="cl-hill"/>
    <rect x="160" y="230" width="210" height="230" rx="6" className="cl-frame"/><path d="M265 230V460M160 345H370" className="cl-frame-line"/>
    <rect x="420" y="270" width="96" height="76" rx="4" className="cl-poster"/><path d="M432 336L456 300L474 318L488 304L506 336Z" className="cl-hill"/>
    {/* sofa */}
    <rect x="250" y="650" width="260" height="100" rx="26" className="cl-sofa"/>
    <rect x="262" y="740" width="236" height="48" rx="12" className="cl-sofa-seat"/>
    <rect x="236" y="700" width="40" height="96" rx="16" className="cl-sofa"/><rect x="486" y="700" width="40" height="96" rx="16" className="cl-sofa"/>
    <path d="M262 796V812M498 796V812" className="cl-leg"/>
    {/* lamp */}
    <path d="M560 812V560" className="cl-lamp-pole"/><path d="M528 560H592L578 512H542Z" className="cl-lamp-shade"/>
    {/* tv */}
    <rect x="620" y="720" width="220" height="92" rx="6" className="cl-tvstand"/>
    <rect x="640" y="560" width="180" height="128" rx="8" className="cl-tv"/>
    <rect x="652" y="572" width="156" height="104" rx="3" className="cl-screen"/>
    {tv > 0 && <g opacity={tv}>
      <rect x="652" y="572" width="156" height="104" rx="3" className={Math.sin(t * 9) > 0 ? 'cl-game-a' : 'cl-game-b'}/>
      <rect x={662 + ((t * 80) % 120)} y="640" width="16" height="16" className="cl-game-hero"/>
      {[0, 1, 2].map(i => <rect key={i} x={700 + ((i * 60 - t * 60) % 150 + 150) % 150 - 40} y={600 + i * 12} width="26" height="10" className="cl-game-block"/>)}
    </g>}
    <rect x="-900" y="812" width="2200" height="700" className="cl-floor2"/>
    {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${-700 + i * 120} 812L${-1000 + i * 170} 1500`} className="cl-plank2"/>)}
    <ellipse cx="420" cy="900" rx="300" ry="48" className="cl-rug2"/>
    <ellipse cx="560" cy="806" rx="58" ry="26" className="cl-beanbag"/>
    {chaos > 0 && <Flying t={t} amount={chaos}/>}
  </g>;
}
function Flying({ t, amount }: { t: number; amount: number }) {
  return <g opacity={clamp(amount * 2)}>{Array.from({ length: 9 }, (_, i) => {
    const ph = (t * (.5 + rnd(4, i) * .4) + rnd(5, i)) % 1, x = -200 + rnd(6, i) * 900 + ph * (rnd(8, i) - .5) * 300, y = 760 - Math.sin(Math.PI * ph) * (250 + rnd(9, i) * 250);
    return i % 3 === 0 ? <rect key={i} x={x - 22} y={y - 14} width="44" height="28" rx="10" className="cl-pillow2" transform={`rotate(${ph * 360 + i * 30} ${x} ${y})`}/>
      : i % 3 === 1 ? <path key={i} d={`M${x - 14} ${y - 18}h28v36h-28Z`} className="cl-paper" transform={`rotate(${ph * 540} ${x} ${y})`}/>
      : <MessItem key={i} kind={i % 2 ? 'sock' : 'shirt2'} x={x} y={y} r={ph * 400}/>;
  })}</g>;
}

/* ---------- living-room copies (scenes 4–6) ---------- */
const COOK = -60, GUITAR_X = 120, SOFA_X = 380, GAMER_X = 560;
function runner(t: number, seed: number, lo: number, hi: number) {
  const span = hi - lo, speed = 210 + seed * 30, d = ((t * speed + seed * 377) % (span * 2) + span * 2) % (span * 2);
  return { x: d < span ? lo + d : hi - (d - span), flip: d >= span };
}

export function ClonesScene({ time }: { time: number }) {
  const f = getClonesFrame(time), t = f.t, n = f.n;
  let cam = '', world: ReactNode = null, shake = 0, mood = 0, fade = 0, vig = .32, lamp = 0, black = 0;

  /* ---------- 01 · O gancho ---------- */
  if (n === 1) {
    const turned = t >= T.firstCopy + .2;
    let lx = 330, lflip = true, walking = false, expr: LeoExpression = 'curious', reach: number | undefined, armL: number | undefined, gaze: V | undefined = [2, 1];
    if (t < 2.6) gaze = t > 1.9 ? [3, 0] : [1, 1];
    else if (t < 5.2) gaze = [Math.sin(t * 1.6) * 2.5, 0];
    else if (t < 8.4) { lx = mix(330, 190, ramp(t, 5.3, 8.3)); walking = t < 8.3; expr = 'happy'; gaze = undefined; }
    else { lx = 190; }
    if (t >= 8.4 && t < 10.9) { const k = ramp(t, 8.5, 9.2) * (1 - ramp(t, 10.0, 10.6)); reach = -22 - k * 140; armL = -k * 140; expr = 'happy'; gaze = [0, -2]; }
    if (turned) { lflip = false; expr = 'surprised'; gaze = [2, -1]; }
    else if (t >= T.firstCopy - .05 && t >= 8.4) expr = 'surprised';
    const hop = t > 11.1 && t < 11.55 ? Math.sin(Math.PI * (t - 11.1) / .45) * 26 : 0;
    const c1 = appearAt(t, T.firstCopy, .5);
    const teaser = t > 1.45 && t < 2.6 ? (.32 + Math.sin(t * 40) * .12) * (1 - lin(t, 2.3, 2.6)) : 0;
    world = <><Bedroom t={t} mess={1}/>
      {teaser > 0 && <Lucas x={228} t={t} flip={false} appear={teaser} expression="cold" gaze={[2, 0]} shadow={false}/>}
      <Lucas x={400} t={t} flip appear={c1} pop={t - T.firstCopy} expression={t > 11.5 ? 'surprised' : 'curious'} gaze={[2, -1]}/>
      <SpawnFx x={400} p={t - T.firstCopy} t={t}/>
      <Lucas x={lx} t={t} flip={lflip} walking={walking} expression={expr} reach={reach} armL={armL} gaze={gaze} lift={hop}/>
    </>;
    const [hx, hy] = headOf(400, true);
    cam = t < 2.6 ? z(322, 522, 2.5 + lin(t, 0, 2.6) * .3)
      : t < 5.2 ? z(290, 600, .95 + lin(t, 2.6, 5.2) * .08)
      : t < 8.4 ? z(lx - 30, 600, 1.3)
      : t < T.firstCopy ? z(250, 590, 1.2 + lin(t, 8.4, 10.9) * .1)
      : t < 12.9 ? z(300, 610, 1.08)
      : t < 14.2 ? z(hx - 14 + lin(t, 12.9, 14.2) * 28, hy - 38, 3.1)
      : t < 15.3 ? z(hx, mix(640, 720, lin(t, 14.2, 15.3)), 2.3)
      : z(296, 528, 1.85 + lin(t, 15.3, 16.75) * .12);
    if (t > T.firstCopy && t < T.firstCopy + .3) shake = 4;
    vig = t < 2.6 ? .5 : .32;
  }

  /* ---------- 02 · A descoberta ---------- */
  if (n === 2) {
    const sw1 = 21.4, sw2 = 24.3;
    let reach = -12, expr: LeoExpression = 'surprised', gaze: V = [3, -3];
    if (t < 21.4) reach = -75 + Math.sin(t * 2) * 3;
    else if (t < 24.3) { reach = swing(t, sw1, -75, -125, -40); gaze = [2, -1]; expr = 'happy'; }
    else { reach = swing(t, sw2, -40, -130, -30); gaze = [2, -1]; expr = t > 25.4 ? 'happy' : 'surprised'; }
    const hp = hand(190, reach);
    const glow = t < 21.4 ? .4 + ramp(t, 16.8, 20) * .6 + Math.sin(t * 8) * .08 : t < 24.3 ? .5 : .7;
    const c2 = appearAt(t, T.spawn2), c3 = appearAt(t, T.spawn3);
    const snap = t > T.ready && t < T.ready + .4 ? 1 - (t - T.ready) / .4 : 0;
    world = <><Bedroom t={t} mess={1}/>
      <Lucas x={560} t={t + .7} flip appear={c2} pop={t - T.spawn2} expression="happy" gaze={[2, 0]}/>
      <SpawnFx x={560} p={t - T.spawn2} t={t}/>
      <Lucas x={30} t={t + 1.3} appear={c3} pop={t - T.spawn3} expression="happy" gaze={[2, 0]} reach={-40 + Math.sin(t * 6) * 18}/>
      <SpawnFx x={30} p={t - T.spawn3} t={t}/>
      <Lucas x={400} t={t + .3} flip expression={t < 18.8 ? 'surprised' : 'happy'} gaze={[2, 0]}/>
      <Lucas x={190} t={t} expression={expr} reach={reach} gaze={gaze}/>
      <Trail x={190} at={sw1} t={t} a={-75} b={-125}/><Trail x={190} at={sw2} t={t} a={-40} b={-130}/>
      <Glow x={hp.x} y={hp.y} r={60 + glow * 30} a={glow}/>
      <Sparkles x={hp.x - 40} y={hp.y - 40} w={80} h={80} t={t} n={9} amount={glow}/>
      {snap > 0 && <circle cx={hp.x} cy={hp.y} r={30 + (1 - snap) * 90} className="clone-ring-solid" opacity={snap}/>}
    </>;
    const [lhx, lhy] = headOf(190);
    cam = t < 18.8 ? z(hp.x - 30, hp.y + 20, 2.6 - lin(t, 16.75, 18.8) * .2)
      : t < 20.9 ? z((lhx + hp.x) / 2 + 20, lhy + 40, 1.6 + lin(t, 18.8, 20.9) * .1)
      : t < 23.7 ? z(300, 600, .86)
      : t < 26.4 ? z(hand(190, -80).x - 10, hand(190, -80).y + 10, 2.2)
      : z(290, 600, .8);
    if (t > T.spawn2 && t < T.spawn2 + .25) shake = 3;
    if (t > T.spawn3 && t < T.spawn3 + .25) shake = 3;
  }

  /* ---------- 03 · As vantagens ---------- */
  if (n === 3) {
    const lying = t >= 32.1;
    const writeReach = -48 + Math.sin(t * 11) * 5;
    const wp = hand(430, writeReach, false, S, 850);
    const sweep = Math.sin(t * 6);
    const bp = hand(250, -22 + sweep * 14);
    const flop = lying ? clamp((t - 32.1) / .5) : 0;
    const bounce = lying && t < 32.9 ? Math.sin(Math.PI * clamp((t - 32.45) / .45)) * 12 : 0;
    const walkerX = mix(-150, 640, lin(t, 36.9, 39.6));
    const checks = [35.35, 35.6, 35.85].map(a => ramp(t, a, a + .2));
    const desk = <><Lucas x={430} g={850} t={t + .4} seated expression="curious" reach={writeReach} gaze={[3, 4]}/>
      <path d={`M${wp.x - 2} ${wp.y + 6}L${wp.x + 24} ${wp.y - 22}`} className="cl-pencil"/>
      <rect x="512" y="616" width="70" height="12" rx="2" className="cl-notebook"/>
      {checks.map((c, i) => c > 0 && <path key={i} d={`M${520 + i * 20} ${620}l4 4l8 -9`} className="cl-check" opacity={c}/>)}</>;
    let content: ReactNode;
    if (t < 29.8) {
      content = <>
        <Lucas x={560} t={t + .7} flip expression="happy" gaze={[2, 0]} reach={-30 + Math.sin(t * 5) * 14}/>
        <Lucas x={30} t={t + 1.3} expression="happy" gaze={[2, 0]}/>
        <Lucas x={400} t={t + .3} flip expression="happy" gaze={[2, 0]}/>
        <Lucas x={190} t={t} expression="happy" reach={-62 + Math.sin(t * 4) * 4} gaze={[2, -1]}/>
      </>;
    } else if (t < 31.0) content = desk;
    else if (t < 32.1) content = <>
      <Lucas x={250} t={t + 1.3} expression="curious" reach={-22 + sweep * 14} gaze={[2, 4]}/>
      <path d={`M${bp.x + 4} ${bp.y - 46}L${bp.x + 40 + sweep * 10} ${G - 20}`} className="cl-stick"/>
      <path d={`M${bp.x + 14 + sweep * 10} ${G - 22}L${bp.x + 64 + sweep * 10} ${G - 22}L${bp.x + 76 + sweep * 10} ${G + 4}L${bp.x + 2 + sweep * 10} ${G + 4}Z`} className="cl-bristle"/>
      {[0, 1, 2].map(i => { const ph = (t * 1.6 + i / 3) % 1; return <circle key={i} cx={bp.x + 60 + ph * 50} cy={G - ph * 30} r={6 + ph * 14} className="cl-dust" opacity={1 - ph}/>; })}
    </>;
    else content = <>
      {desk}
      <Lucas x={220} g={830 - bounce} s={1} t={t} rot={-90 * flop} expression="happy" reach={-165} armL={-160} gaze={[-2, 0]} shadow={false}/>
      {t > 36.9 && t < 39.7 && <Lucas x={walkerX} g={905} s={1.25} t={t + 2} walking expression="curious" reach={-50} armL={-55} extra={BASKET}/>}
    </>;
    world = <><Bedroom t={t} mess={1 - ramp(t, 34.35, 35.2)}/>{content}</>;
    cam = t < 29.8 ? z(290, 600, .8 + lin(t, 27.75, 29.8) * .05)
      : t < 31.0 ? z(500, 610, 2.0)
      : t < 32.1 ? z(300, 690, 1.75)
      : t < 34.3 ? z(170, 690, 1.9 - lin(t, 32.1, 34.3) * .15)
      : t < 35.2 ? z(290, 800, 1.3)
      : t < 36.0 ? z(548, 618, 3.4)
      : t < 39.6 ? z(240, 680, 1.15 + lin(t, 36, 39.6) * .15)
      : z(90, 690, 2.2 + lin(t, 39.6, 41.1) * .3);
    if (t > 32.45 && t < 32.65) shake = 2.5;
  }

  /* ---------- 04–07 · living room ---------- */
  if (n >= 4) {
    const spawns = { cook: 41.5, gamer: 41.5, guitar: 41.6, sofa: 42.0, rebel: 42.4, run: 42.8 };
    const vanish = { cook: 59.2, gamer: 59.5, guitar: 59.8, sofa: 60.1, run: 60.4 };
    const stareStart = 54.3;
    const stilled = t >= stareStart, gone = (k: keyof typeof vanish) => clamp(1 - (t - vanish[k]) / .6);
    const ap = (k: keyof typeof spawns, v?: keyof typeof vanish) => Math.min(appearAt(t, spawns[k]), v ? gone(v) : 1);
    const busy = !stilled;
    // background copies
    const cookReach = busy ? -50 + Math.sin(t * 7) * 6 : -20;
    const cookHand = hand(COOK, cookReach, true);
    const flipUp = busy ? Math.abs(Math.sin(t * 3.4)) * 70 : 0;
    const strum = busy ? 18 + Math.sin(t * 16) * 9 : 15;
    const jump = busy ? Math.abs(Math.sin(t * 5.2)) * 70 : 0;
    const runA = runner(t, 1, -120, 700), runB = runner(t + 3, 2, -200, 760);
    // rebel
    let rx = runA.x, rflip = runA.flip, rWalk = true, rRun = true, rExpr: LeoExpression = 'happy', rCross = false, rReach: number | undefined, rArmL: number | undefined, rFlicker = 0, rJit = 0, rTalk = 0, rGaze: V | undefined = [2, 0], rG = 820, rS = 1.1;
    if (t >= 53.1) {
      const k = ramp(t, 53.2, 54.3);
      rx = mix(-80, 430, k); rflip = k >= 1; rRun = k < .85; rWalk = k < 1; rG = mix(820, G, k); rS = mix(1.1, S, k); rExpr = t < 54.4 ? 'curious' : 'cold';
      if (t >= 55.9) rCross = true;
      if (t > 56.9) rExpr = 'angry';
    }
    if (n >= 6) {
      rx = 430; rflip = true; rWalk = false; rRun = false; rCross = t < 68.6 || (t > 73.4 && t < 78.6); rExpr = t < 64.0 ? 'angry' : 'cold';
      if (t > 63.0 && t < 64.0) { rFlicker = .5 + .5 * Math.sin(t * 46); rJit = 10; }
      if (t >= 68.6 && t < 73.4) { rReach = t < T.think - .1 ? -10 : t < T.feel ? -135 : -12; rArmL = t >= T.feel ? -92 : 0; rTalk = talkAmount(t, 'copy'); rGaze = [2, 0]; }
    }
    if (n === 7) {
      rCross = false; rExpr = 'cold';
      rx = mix(430, 350, ramp(t, 78.8, 82.0)); rWalk = t > 78.8 && t < 82.0; rReach = 6;
      rTalk = talkAmount(t, 'copy');
    }
    // Lucas
    let lx = 250, lflip = false, lExpr: LeoExpression = 'happy', lReach: number | undefined, lArmL: number | undefined, lWalk = false, lJit = 0, lTalk = 0, lGaze: V | undefined = [2, 0];
    if (n === 4) {
      if (t < 43.0) { lReach = t < 42.2 ? swing(t, 41.4, -20, -120, -60) : swing(t, 42.2, -60, -130, -40); lExpr = 'happy'; }
      else if (t < 50.6) { lflip = (t > 44.0 && t < 45.0) || t > 46.0; lExpr = 'surprised'; lGaze = [2, -1]; }
      else { lReach = -160 + Math.sin(t * 9) * 4; lArmL = -160; lExpr = 'scared'; lJit = 2; }
    }
    if (n === 5) { lExpr = t < 55 ? 'scared' : 'surprised'; if (t > 56.9) { lReach = -62; lExpr = 'angry'; } }
    if (n === 6) {
      lExpr = 'angry'; lReach = t < 61.0 ? swing(t, 58.9, -30, -125, -62) : -62 + Math.sin(t * 30) * (t < 63 ? 2 : 0);
      if (t >= 62.9 && t < 65.9) { lExpr = 'surprised'; lReach = mix(-62, -15, ramp(t, 64.0, 64.6)); }
      if (t >= 65.9 && t < 68.6) { lReach = -64; lExpr = 'angry'; lTalk = talkAmount(t, 'lucas'); }
      if (t >= 68.6) { lReach = -10; lExpr = 'surprised'; }
      if (t >= 73.4) { lx = mix(250, 160, ramp(t, 73.9, 75.8)); lWalk = t > 73.9 && t < 75.8; lExpr = 'scared'; }
    }
    if (n === 7) { lx = 160; lReach = 10; lExpr = 'scared'; lJit = t > 85.4 ? 1.6 : .8; lGaze = [2, 0]; }
    const lHand = hand(lx, lReach ?? -20, lflip);
    const handGlow = (n === 4 && t < 43.2) || (n === 5 && t > 56.9) || (n === 6 && t < 63.0) ? .55 + Math.sin(t * 10) * .1 : 0;
    // swap at the end: two identical figures trade places in the dark
    const swapped = n === 7 && ((t > 93.45 && t < 93.55) || t > 93.8);
    let A = <Lucas x={lx} t={t} flip={lflip} walking={lWalk} expression={lExpr} reach={lReach} armL={lArmL} gaze={lGaze} jitter={lJit} talk={lTalk}/>;
    let B = <Lucas x={rx} g={rG} s={rS} t={t + 2.2} flip={rflip} walking={rWalk} running={rRun} expression={rExpr} crossed={rCross} reach={rReach} armL={rArmL} flicker={rFlicker} jitter={rJit} talk={rTalk} gaze={rGaze} appear={appearAt(t, spawns.rebel)} pop={t - spawns.rebel} pace={n === 7 ? .55 : 1}/>;
    if (n === 7 && t > 93.3) {
      A = <Lucas x={swapped ? 350 : 160} t={t} flip={swapped} expression="scared" reach={10} gaze={[2, 0]} jitter={.8}/>;
      B = <Lucas x={swapped ? 160 : 350} t={t + 2.2} flip={!swapped} expression="scared" reach={10} gaze={[2, 0]} jitter={.8}/>;
    }
    const shadowCopy = n === 6 && t > 73.4 ? <g opacity={ramp(t, 73.6, 76) * .45}><g transform={`translate(490 812) scale(${1.25 + lin(t, 73.6, 78.6) * .45}) translate(-490 -812)`}><g className="cl-wall-shadow"><Lucas x={490} g={812} t={t} flip crossed expression="cold" shadow={false} shine={false}/></g></g></g> : null;
    const bgCopies = n <= 6 && t < 61.5 ? <>
      <Lucas x={COOK} t={t + .5} flip appear={ap('cook', 'cook')} expression={stilled ? 'surprised' : 'happy'} reach={cookReach} gaze={stilled ? [-2, 0] : [2, 3]}
        extra={null}/>
      {ap('cook', 'cook') > 0 && <g transform={`translate(${cookHand.x} ${cookHand.y}) scale(-1 1)`} opacity={ap('cook', 'cook')}><path d="M0 0L44 -4" className="cl-handle"/><ellipse cx="70" cy="-6" rx="30" ry="9" className="cl-pan"/><ellipse cx="70" cy={-14 - flipUp} rx="17" ry="5" className="cl-pancake" transform={`rotate(${flipUp * 4} 70 ${-14 - flipUp})`}/></g>}
      <Lucas x={GUITAR_X} t={t + 1.1} appear={ap('guitar', 'guitar')} pop={t - spawns.guitar} expression={stilled ? 'surprised' : 'happy'} reach={strum} armL={-80} gaze={stilled ? [2, 0] : [2, 3]} extra={GUITAR}/>
      <Lucas x={t >= 53.1 ? 700 : SOFA_X} g={t >= 53.1 ? G : 748} t={t + 1.7} appear={ap('sofa', 'sofa')} pop={t - spawns.sofa} lift={t >= 53.1 ? 0 : jump} flip={t >= 53.1} expression={stilled ? 'surprised' : 'happy'} reach={busy ? -150 : -10} armL={busy ? -140 : 0} gaze={[2, -1]} shadow={t >= 53.1}/>
      <Lucas x={GAMER_X} g={935} t={t + 2.8} seated appear={ap('gamer', 'gamer')} expression={stilled ? 'surprised' : 'happy'} reach={-40 + (busy ? Math.sin(t * 20) * 3 : 0)} armL={-70} gaze={stilled ? [-2, 0] : [3, 0]} extra={CONTROLLER} flip={stilled}/>
      <Lucas x={stilled ? 40 : runB.x} g={820} s={1.1} t={t + 3.3} flip={stilled ? false : runB.flip} walking={busy} running={busy} appear={ap('run', 'run')} pop={t - spawns.run} expression={stilled ? 'surprised' : 'happy'} gaze={[2, 0]}/>
      {n === 4 && [0, 1, 2].map(i => <Note key={i} x={GUITAR_X + 40 + i * 26 + Math.sin(t * 3 + i) * 8} y={560 - ((t * 40 + i * 30) % 90)} o={busy ? 1 - ((t * 40 + i * 30) % 90) / 90 : 0}/>)}
      {n === 4 && busy && [0, 1, 2].map(i => { const ph = (t * .8 + i / 3) % 1; return <circle key={i} cx={-226 + Math.sin(t * 2 + i) * 10} cy={600 - ph * 90} r={8 + ph * 18} className="cl-dust" opacity={(1 - ph) * .8}/>; })}
      {Object.entries(vanish).map(([k, v]) => {
        const x = k === 'cook' ? COOK : k === 'guitar' ? GUITAR_X : k === 'sofa' ? 700 : k === 'gamer' ? GAMER_X : 40;
        const g = k === 'sofa' ? G : k === 'gamer' ? 900 : k === 'run' ? 820 : G;
        return <Dissolve key={k} x={x} g={g} p={(t - v) / .9} t={t}/>;
      })}
      {n === 4 && ([['guitar', GUITAR_X, G], ['sofa', SOFA_X, 748], ['run', runB.x, 820], ['rebel', runA.x, 820]] as Array<[keyof typeof spawns, number, number]>).map(([k, x, g]) => <SpawnFx key={k} x={x} g={g} p={t - spawns[k]} t={t}/>)}
    </> : null;
    world = <><LivingRoom t={t} chaos={n === 4 ? ramp(t, 50.4, 51.2) : n === 5 ? 1 - ramp(t, 53.1, 54.4) : 0} tv={n <= 5 && t < 56.9 ? appearAt(t, 41.5) : 0} wallShadow={shadowCopy}/>
      {bgCopies}{B}{A}
      <Trail x={250} at={41.4} t={t} a={-20} b={-120}/><Trail x={250} at={42.2} t={t} a={-60} b={-130}/><Trail x={250} at={58.9} t={t} a={-30} b={-125}/>
      <Glow x={lHand.x} y={lHand.y} r={70} a={handGlow}/>
      {n === 6 && t > 61 && t < 63 && <Sparkles x={lHand.x - 40} y={lHand.y - 40} w={80} h={80} t={t} n={10}/>}
    </>;
    // camera
    const [lhx, lhy] = headOf(lx, lflip), [rhx, rhy] = headOf(rx, true);
    if (n === 4) {
      cam = t < 43.0 ? z(300, 590, .92)
        : t < 46.4 ? z(250, 560, .64 - lin(t, 43, 46.4) * .05)
        : t < 47.4 ? z(-130, 580, 1.7)
        : t < 48.5 ? z(640, 660, 1.75)
        : t < 49.6 ? z(GUITAR_X - 15, 610, 2.3)
        : t < 50.6 ? z(SOFA_X, 560, 1.5)
        : z(260, 560, .7 + Math.sin(t * 3) * .01);
      if (t > 50.6) shake = 2 + ramp(t, 50.6, 52) * 3;
      if ([41.6, 42.0, 42.4, 42.8].some(a => t > a && t < a + .18)) shake = 3;
    } else if (n === 5) {
      mood = ramp(t, 53.1, 58.7) * .45;
      cam = t < 55.0 ? z(330, 590, 1.12) : t < 56.9 ? z(rhx, rhy + 30 + lin(t, 55, 56.9) * 40, 2.4 - lin(t, 55, 56.9) * .5) : z(340, 560, 1.32 + lin(t, 56.9, 58.75) * .1);
      vig = .4;
    } else if (n === 6) {
      mood = .45 + ramp(t, 58.75, 78.6) * .4;
      cam = t < 61.0 ? z(280, 580, .78)
        : t < 62.9 ? z(lHand.x - 40, lHand.y + 10, 2.2)
        : t < 64.9 ? z(rhx - 10, 600, 1.7)
        : t < 65.9 ? z(lhx + 10, lhy + 10, 2.5)
        : t < 68.6 ? z(lhx + 30, lhy + 50, 2.2 + lin(t, 65.9, 68.6) * .2)
        : t < 73.4 ? z(rhx - 30, rhy + 50, 2.2 + lin(t, 68.6, 73.4) * .35)
        : z(290, 570, 1.35 - lin(t, 73.4, 78.6) * .3);
      if ((t > 63.96 && t < 64.2) || (t > 67.8 && t < 68.1)) shake = 4;
      lamp = mood; vig = .5;
    } else {
      mood = .85; lamp = .9; vig = .62;
      const [ahx, ahy] = headOf(160), [bhx, bhy] = headOf(rx, true);
      cam = t < 82.2 ? z(255, 640, 1.18 + lin(t, 78.6, 82.2) * .15)
        : t < 85.4 ? z(bhx - 20, bhy - 4, 5.0 + lin(t, 82.2, 85.4) * .5)
        : t < 86.6 ? z(bhx - 20, bhy + 10, 3.1)
        : t < 89.8 ? z(ahx + 18, ahy - 4, 3.6 + lin(t, 86.6, 89.8) * 1.2)
        : t < 93.3 ? z(255, 560, 1.3 + lin(t, 89.8, 93.3) * .1)
        : t < 95.0 ? z(255, 545, 1.45)
        : z(255, 530, 1.45 + lin(t, 95, 96.6) * .5);
      if (t > 93.3 && t < 94.0) black = (t < 93.45 || (t > 93.55 && t < 93.7) || t > 93.8) ? .94 : .2;
      if (t > 88.6 && t < 89.8) lamp = .9 - .5 * Math.abs(Math.sin(t * 13));
      if (t > 95.8 && t < 96.05) shake = 3;
      fade = ramp(t, T.fade, 97.5);
    }
  }

  const sx = shake ? Math.sin(t * 90) * shake : 0, sy = shake ? Math.cos(t * 77) * shake : 0;
  const sig = ramp(t, 97.6, 98.2);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`Lucas, cena ${f.scene.id}`} className="animation-canvas">
    <defs>
      <clipPath id="clones-clip"><rect width="540" height="960"/></clipPath>
      <radialGradient id="cl-glow"><stop offset="0" className="cl-glow-in"/><stop offset=".45" className="cl-glow-mid"/><stop offset="1" className="cl-glow-out"/></radialGradient>
      <radialGradient id="cl-lamp"><stop offset="0" className="cl-lamp-in"/><stop offset="1" className="cl-lamp-out"/></radialGradient>
      <linearGradient id="cl-beam" x1="0" x2="1"><stop offset="0" className="cl-beam-edge"/><stop offset=".5" className="cl-beam-core"/><stop offset="1" className="cl-beam-edge"/></linearGradient>
      <radialGradient id="cl-vig" r=".75"><stop offset=".5" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient>
    </defs>
    <rect width="540" height="960" className="cl-wall"/>
    <g clipPath="url(#clones-clip)"><g transform={`translate(${sx} ${sy})`}><g transform={cam}>
      {world}
      {mood > 0 && <rect x="-1200" y="-1200" width="3200" height="3400" className="cl-night" opacity={mood * .62}/>}
      {lamp > 0 && <ellipse cx="560" cy="560" rx="380" ry="420" fill="url(#cl-lamp)" opacity={lamp * .55}/>}
    </g></g></g>
    <rect width="540" height="960" fill="url(#cl-vig)" opacity={vig}/>
    {black > 0 && <rect width="540" height="960" className="tp-black" opacity={black}/>}
    {fade > 0 && <rect width="540" height="960" className="tp-black" opacity={fade}/>}
    {sig > 0 && <text x="270" y="905" textAnchor="middle" className="enz-signature" opacity={sig}>AURAX OCULTO</text>}
  </svg>;
}
