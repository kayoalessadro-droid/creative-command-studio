import { getL2Frame, ramp } from '@/lib/leo2-timeline';
import { Leo } from './leo';

type Expr = 'curious' | 'happy' | 'surprised' | 'worried' | 'sleeping';

function Teacher({ w }: { w: number }) {
  const arm = -120 + Math.sin(w * 1.6) * 28;
  return <g transform="translate(70 395) scale(.9)" className="l2-teacher">
    <path className="teacher-skirt" d="M-30 150L30 150L40 255L-40 255Z"/>
    <path className="teacher-coat" d="M-34 40Q0 25 34 40L38 155H-38Z"/>
    <g transform={`rotate(${arm} 28 50)`}><path className="teacher-coat" d="M22 42L36 40L40 110L26 112Z"/><circle cx="33" cy="116" r="8" className="pedestrian-skin"/><path d="M33 122L33 150" className="chalk"/></g>
    <circle cy="0" r="27" className="pedestrian-skin"/>
    <path className="teacher-hair" d="M-28 -2Q-30 -32 0 -32Q30 -32 28 -2Q18 -18 0 -16Q-18 -18 -28 -2Z"/><circle cx="0" cy="-36" r="11" className="teacher-hair"/>
    <path d="M-12 -2H-5M5 -2H12M-6 12Q0 16 6 12" className="face-line"/>
    <path d="M-30 255V300M30 255V300" className="pedestrian-leg"/>
  </g>;
}

function Classmate({ x, y, s, w, tone }: { x: number; y: number; s: number; w: number; tone: string }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-38 28H38L46 112H-46Z" className={tone}/>
    <circle cy="-4" r="27" className="pedestrian-skin"/>
    <path d="M-27 -8Q-26 -34 0 -33Q27 -33 26 -8Q12 -20 -2 -18Q-18 -20 -27 -8Z" className="classmate-hair"/>
    <path d="M-12 2H-4M5 2H13" className="face-line"/>
    <path d={`M30 60L${50 + Math.sin(w * 7) * 7} ${96 + Math.cos(w * 7) * 3}`} className="pedestrian-leg"/>
    <rect x="-70" y="104" width="140" height="15" className="desk"/><path d="M-58 119V180M58 119V180" className="diagram-line"/>
    <path d={`M8 98L${44 + Math.sin(w * 7) * 7} 102`} className="paper-line"/>
  </g>;
}

function Room({ w, frozen }: { w: number; frozen: boolean }) {
  return <g className="environment">
    <rect width="540" height="730" className="bedroom-wall"/>
    <rect y="730" width="540" height="230" className="l2-floor"/>
    <path d="M0 730H540" className="diagram-line"/>
    <rect x="34" y="150" width="300" height="170" rx="4" className="board"/>
    {[0, 1, 2].map(i => <path key={i} d={`M60 ${195 + i * 38}Q${110 + i * 20} ${180 + i * 38} ${170 + i * 30} ${195 + i * 38}T${250 + i * 15} ${195 + i * 38}`} className="chalk-scribble"/>)}
    <path d="M60 300L320 300" className="chalk-tray"/>
    <g transform="translate(400 170)"><rect width="110" height="150" rx="6" className="bus-window"/><path d="M55 0V150M0 75H110" className="bus-divider"/>
      <path d={`M0 0Q${12 + Math.sin(w * 1.5) * 6} 75 ${4 + Math.sin(w * 1.5) * 4} 150L-14 150L-14 0Z`} className="curtain"/></g>
    <g transform="translate(455 395)"><circle r="34" className="clock-face"/><path d="M0-27V-22M27 0H22M0 27V22M-27 0H-22" className="clock-tick"/>
      <path d="M0 0V-17" className="clock-hand" transform={`rotate(${w * 10})`}/><path d="M0 0L0 -26" className="clock-second" transform={`rotate(${w * 360 / 60 * 6})`}/></g>
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 67 + Math.sin(w * .7 + i) * 18 + 30) % 540} cy={(i * 97 + w * 9) % 560 + 120} r={1.6 + (i % 3) * .8} className={frozen ? 'dust dust-frozen' : 'dust'}/>)}
  </g>;
}

function Girl({ t, expr, walking, seated, look }: { t: number; expr: Expr; walking: boolean; seated: boolean; look: number }) {
  return <g className="girl-scope" transform={`rotate(${look} 88 200)`}>
    <path className="leo-hair girl-long" d="M40 70Q24 150 40 205Q88 222 136 205Q152 150 136 70Q122 18 88 20Q52 20 40 70Z"/>
    <Leo time={t + 1.3} walking={walking} seated={seated} expression={expr} backpack={false}/>
    <path className="girl-band" d="M50 50Q88 22 128 50"/>
  </g>;
}

export function Leo2Scene({ time }: { time: number }) {
  const f = getL2Frame(time), t = f.t, w = f.world;
  // --- Léo staging ---
  let leoSeated = true, leoX = 47, leoWalk = false, leoExpr: Expr = 'worried';
  if (t >= 19.5 && t < 41.3) { leoSeated = false; leoX = 47 + ramp(t, 21, 29.5) * 190; leoWalk = t >= 21 && t < 29.5; leoExpr = t > 31 ? 'surprised' : 'curious'; }
  if (f.n === 4) leoExpr = t < 41.3 ? 'surprised' : 'worried';
  if (f.n === 5) leoExpr = t >= 64.5 ? 'surprised' : 'worried';
  if (t >= 75) { leoSeated = false; leoX = 47 - ramp(t, 77, 80) * 60; leoWalk = t >= 77 && t < 80; leoExpr = 'worried'; }
  if (t >= RESUME2_LOOK) leoExpr = 'surprised';
  // --- girl staging ---
  const stand = t >= 68.5;
  const walkP = ramp(t, 70, 79);
  let gExpr: Expr = 'sleeping', gLook = 0;
  if (t >= 47 && t < 55.42) { gExpr = 'curious'; gLook = -6; }
  if (f.n === 5) { gLook = -7 * ramp(t, 62, 64.8); gExpr = t >= 63.3 ? 'curious' : 'sleeping'; }
  if (t >= 67.4) { gExpr = 'curious'; gLook = -4; }
  if (t >= 89.6 && t < 93) gLook = -4 - 6 * ramp(t, 89.6, 90.6);
  const gx = stand ? 255 + walkP * (-30) : 266, gy = stand ? 352 + walkP * 95 : 330, gs = stand ? .82 + walkP * .3 : .78;
  // girl fingers tap (moving even while frozen) in scene 03
  const tapping = t >= 31 && t < 40.6;
  // --- camera ---
  let cam = '';
  const z = (cx: number, cy: number, s: number) => `translate(${270 - cx * s} ${480 - cy * s}) scale(${s})`;
  if (f.n === 1) cam = t < 5 ? z(150, 560, 1.7) : t < 9 ? z(270, 520, 1.05) : t < 11.5 ? z(455, 395, 2.6) : z(150, 560, 1.6 + (t - 11.5) * .05);
  if (f.n === 2) cam = t < 19.5 ? z(250, 520, 1.1) : z(140 + ramp(t, 21, 26.9) * 150, 600, 1.25);
  if (f.n === 3) cam = t < 31 ? z(330, 600, 1.25) : t < 34.5 ? z(320, 560, 1.25 + ramp(t, 31, 34.5) * .55) : t < 36.5 ? z(280, 560, 1.7) : z(325, 560, 2.2);
  if (f.n === 4) cam = t < 41.3 ? z(270, 520, 1.05) : t < 47 ? z(150, 560, 1.55) : t < 52 ? z(330, 430, 2.4) : z(240, 520, 1.25);
  if (f.n === 5) cam = t < 59 ? z(150, 560, 1.6) : t < 65.3 ? z(330, 430, 2.2 + ramp(t, 59, 65.3) * .4) : z(150, 520, 2.1);
  if (f.n === 6) cam = t < 75 ? z(260, 540, 1.05 + ramp(t, 70, 75) * .15) : z(170, 560, 1.3);
  if (f.n === 7) cam = t < 94 ? z(160, 540, 1.45) : z(gx + 90 * gs, gy + 85 * gs, 1.6 + ramp(t, 94, 101.8) * 1.4);
  const tint = 1 - f.rate;
  const leoNode = <g transform={`translate(${leoX} ${leoSeated ? 433 : 445}) scale(1.15)`}><Leo time={t} walking={leoWalk} seated={leoSeated} expression={leoExpr} backpack={false}/></g>;
  const girlNode = <g transform={`translate(${gx} ${gy}) scale(${gs})`}><Girl t={t} expr={gExpr} walking={stand && walkP > 0 && walkP < 1} seated={!stand} look={gLook}/></g>;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`Léo parte 2, cena ${f.scene.id}`} className="animation-canvas">
    <defs><clipPath id="l2-clip"><rect width="540" height="960"/></clipPath><radialGradient id="l2-vig"><stop offset=".55" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient></defs>
    <rect width="540" height="960" className="scene-sky"/>
    <g clipPath="url(#l2-clip)"><g transform={cam}>
      <Room w={w} frozen={f.frozen}/>
      <Teacher w={w}/>
      <Classmate x={470} y={470} s={.8} w={w} tone="tone-a"/>
      <Classmate x={440} y={655} s={1.05} w={w + 2} tone="tone-b"/>
      {tint > 0 && <rect x="-200" y="-200" width="940" height="1360" className="l2-freeze-tint" opacity={tint * .55}/>}
      {!stand && girlNode}
      {!stand && <g transform="translate(266 330) scale(.78)"><rect x="-5" y="228" width="265" height="120" className="desk-panel"/><rect x="-15" y="215" width="285" height="18" rx="3" className="desk"/><path d="M60 200L140 206L134 218L52 212Z" className="paper"/>
        {tapping && [0, 1, 2].map(k => <ellipse key={k} cx={150 + k * 9} cy={212 - Math.max(0, Math.sin(t * 9 + k * 1.4)) * 7} rx="4" ry="5" className="leo-skin girl-finger"/>)}</g>}
      {leoSeated && leoNode}
      <g><rect x="30" y="716" width="240" height="190" className="desk-panel"/><rect x="20" y="700" width="260" height="22" rx="4" className="desk"/><path d="M120 662L230 672L222 700L106 694Z" className="paper"/><path d="M128 672L196 680M124 683L176 689" className="skin-detail"/>{leoSeated && <path d="M232 664L262 688" className="pencil"/>}</g>
      {!leoSeated && <>{<ellipse cx={leoX + 103} cy="847" rx="66" ry="11" className="ground-shadow"/>}{leoNode}</>}
      {stand && girlNode}
      {f.waves.map((wv, i) => <circle key={i} cx={leoX + 100} cy="560" r={40 + wv.p * 700} className={wv.resume ? 'l2-wave l2-wave-back' : 'l2-wave'} opacity={1 - wv.p}/>)}
    </g></g>
    {f.waves.map((wv, i) => wv.p < .25 && <rect key={i} width="540" height="960" className="l2-flash" opacity={(.25 - wv.p) * 2.4}/>)}
    <rect width="540" height="960" fill="url(#l2-vig)" opacity={f.n >= 5 ? .55 + tint * .3 : .25 + tint * .3}/>
    {f.black && <rect width="540" height="960" className="tp-black"/>}
  </svg>;
}
const RESUME2_LOOK = 92.75;
