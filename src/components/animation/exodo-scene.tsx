import type { ReactNode } from 'react';
import { getExodoFrame, ramp, lin, ease, T, earthInWindow, sproutGrowth, EXODO_DURATION } from '@/lib/exodo-timeline';
import { blob, rnd } from './ice';
import { z, mix, Stars, Cloud, Tower, House, Earth } from './gelo-world';
import {
  XSky, Char, headAt, handPt, Sprout, Ark, ArkSide, Flame, Smoke, NewWorld, Moon, Blight, GlowTree, Waterfall, Spores, RuinTower,
  SirenPole, Walker, Shuttle,
} from './exodo-world';

type Shot = { el: ReactNode; cam?: string; shake?: number; flash?: number; vig?: number; night?: number; red?: number; blue?: number };

/** Bia holding her seedling in her front hand (rig units), so the can moves with the arm. */
const held = (reach: number, t: number, grow = 0, pot = false, s = 1.1) => { const [hx, hy] = handPt(reach); return <Sprout x={hx - 4} y={hy + 6} s={s} t={t} grow={grow} pot={pot}/>; };
const Dust = ({ t, n = 30, speed = 380, seed = 2, y0 = 0, h = 960, cls = 'ex-dust' }: { t: number; n?: number; speed?: number; seed?: number; y0?: number; h?: number; cls?: string }) =>
  <g>{Array.from({ length: n }, (_, i) => { const x = (rnd(seed, i) * 700 + t * speed * (.6 + rnd(seed, i + 2) * .8)) % 700 - 80, y = y0 + rnd(seed, i + 5) * h + Math.sin(t * 2 + i) * 10;
    return <path key={i} d={`M${x} ${y}h${10 + rnd(seed, i + 7) * 30}`} className={cls} opacity={.25 + rnd(seed, i + 9) * .5}/>; })}</g>;

/* ---------- Scene 01: the discovery ---------- */
function shot0(t: number): Shot {
  const p = lin(t, 0, 4.4), b = ease(lin(t, 2.7, 4.6));
  return { cam: z(270, 500, 1 + p * .14), vig: .5, el: <>
    <XSky kind="space"/><Stars t={t} n={170} h={960} seed={3}/>
    <circle cx="480" cy="140" r="200" fill="url(#gl-sun-glow)"/><circle cx="480" cy="140" r="22" className="gl-sun"/>
    <Earth x={270} y={520} r={200} t={t} spin={9}/>
    <Blight x={270} y={520} r={200} p={b} t={t}/>
    {b > 0 && [0, 1, 2].map(i => <path key={i} d={blob(180 + i * 80 - t * 6, 440 + i * 60, 30 + b * 40, 70 + i, 14, .6)} className="ex-smoke-plume" opacity={b * .5}/>)}
  </> };
}
function shot1(t: number): Shot {
  const k = lin(t, 4.4, 5.45);
  const skyline: Array<[number, number, number]> = [[-40, 80, 12], [50, 60, 18], [120, 90, 9], [220, 70, 22], [300, 60, 14], [370, 90, 17], [470, 70, 11]];
  return { cam: z(250 + k * 40, 540, 1.12), el: <>
    <XSky kind="orange"/>
    <circle cx="390" cy="250" r="190" fill="url(#ex-haze-glow)"/><circle cx="390" cy="250" r="54" className="ex-sun-haze"/>
    {skyline.map(([x, w, f], i) => <Tower key={i} x={x} base={680} w={w} floors={f} fh={20} cls="ex-bld-haze" seed={i + 2} lit={.15}/>)}
    <rect x="-200" y="430" width="1000" height="260" className="ex-haze" opacity=".55"/>
    <rect x="-200" y="680" width="1000" height="40" className="gl-walk"/><rect x="-200" y="720" width="1000" height="300" className="gl-road"/>
    <path d="M-200 800H900" className="gl-road-dash"/>
    <path d="M60 690V500M60 500Q80 488 100 496" className="gl-pole"/>
    <Char who="miguel" x={170 + k * 70} g={712} s={.92} t={t} walking gaze={[2, -3]} expression="scared"/>
    <path d={blob(420 - k * 300, 560 - Math.sin(t * 6) * 20, 14, 5, 10, .5)} className="ex-bag" transform={`rotate(${t * 200} ${420 - k * 300} 560)`}/>
    <Dust t={t} n={46} speed={520}/>
  </> };
}
function shot2(t: number): Shot {
  const p = lin(t, 5.45, 7.0);
  const cracks = Array.from({ length: 26 }, (_, i) => { const x = rnd(4, i) * 760 - 110, y = 640 + rnd(5, i) * 340, L = 40 + rnd(6, i) * 70, a = rnd(7, i) * Math.PI;
    return <path key={i} d={`M${x} ${y}l${Math.cos(a) * L} ${Math.sin(a) * L * .4}l${Math.cos(a + 1) * L * .6} ${Math.sin(a + 1) * L * .25}`} className="ex-crack"/>; });
  return { cam: z(290 - p * 50, 560, 1.16 - p * .08), el: <>
    <XSky kind="orange"/>
    <circle cx="410" cy="230" r="230" fill="url(#ex-haze-glow)"/><circle cx="410" cy="230" r="40" className="ex-sun-hot"/>
    <path d="M-200 600Q40 520 220 580Q380 530 760 590V700H-200Z" className="ex-hill-dry"/>
    <rect x="-200" y="610" width="1000" height="500" className="ex-dry"/>
    {cracks}
    <path d="M-200 760Q120 700 260 760Q420 820 760 740V820Q420 900 260 840Q120 790 -200 850Z" className="ex-riverbed"/>
    <g transform={`translate(330 800) rotate(-14)`}><path d="M-60 -10H62L44 16H-46Z" className="gl-boat"/><path d="M-60 -10H62" className="gl-boat-rim"/></g>
    <g transform="translate(110 640)"><path d="M0 0V-150M0 -90L-44 -140M0 -110L36 -160M-30 -122L-54 -126M24 -142L42 -140M0 -150L-10 -186" className="ex-deadtree"/></g>
    {Array.from({ length: 6 }, (_, i) => { let d = ''; for (let x = -100; x <= 640; x += 20) d += `${d ? 'L' : 'M'}${x} ${(560 + i * 10 + Math.sin(x * .05 + t * 6 + i) * 3).toFixed(1)}`; return <path key={i} d={d} className="ex-shimmer"/>; })}
    <Dust t={t} n={20} speed={200} seed={5} y0={500} h={300}/>
  </> };
}
function TvGlobe({ x, y, r, p, t }: { x: number; y: number; r: number; p: number; t: number }) {
  return <g><circle cx={x} cy={y} r={r} className="gl-ocean"/>
    <path d={blob(x - r * .3, y - r * .1, r * .4, 3, 14, .5)} className="gl-land"/><path d={blob(x + r * .35, y + r * .2, r * .3, 7, 14, .5)} className="gl-land"/>
    <Blight x={x} y={y} r={r} p={p} t={t * .3} id="ex-tv-blight"/></g>;
}
function shot3(t: number): Shot {
  const p = lin(t, 7.0, 10.0), fl = .32 + .08 * Math.sin(t * 13) + .05 * Math.sin(t * 31);
  return { night: .25, cam: z(270 + p * 30, 560, 1 + p * .14), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-wall"/>
    <rect x="-200" y="700" width="1000" height="500" className="ex-floor"/>
    <g><rect x="30" y="250" width="160" height="210" className="ex-win-frame"/><rect x="40" y="260" width="140" height="190" fill="url(#gl-sky-orange)"/>
      <circle cx="140" cy="320" r="22" className="ex-sun-haze"/>{[[50, 40, 90], [96, 30, 120], [130, 44, 70]].map(([x, w, h], i) => <rect key={i} x={x} y={450 - (h ?? 0)} width={w} height={h} className="ex-bld-haze"/>)}
      <path d="M110 260V450M40 355H180" className="ex-win-bar"/></g>
    <rect x="320" y="550" width="200" height="150" className="ex-stand"/>
    <rect x="322" y="414" width="196" height="132" rx="6" className="ex-tv"/>
    <rect x="332" y="424" width="176" height="112" className="ex-tv-screen"/>
    <TvGlobe x={420} y={474} r={38} p={.25 + p * .75} t={t}/>
    <rect x="332" y="518" width="176" height="18" className="ex-tv-alert" opacity={.6 + .4 * Math.sin(t * 8)}/>
    <rect x="345" y="524" width={60 + (t * 40) % 60} height="6" className="ex-tv-bar"/>
    <path d="M30 600Q30 560 70 560H270Q310 560 310 600V720H30Z" className="ex-sofa"/><rect x="18" y="610" width="40" height="110" rx="14" className="ex-sofa-arm"/><rect x="282" y="610" width="40" height="110" rx="14" className="ex-sofa-arm"/>
    <Char who="miguel" x={150} g={700} s={.78} t={t} seated expression={t > T.news ? 'scared' : 'curious'} gaze={[3, 0]} reach={20} armL={6} backpack={false} shadow={false}/>
    <Char who="bia" x={245} g={706} s={.78} t={t} seated expression="scared" gaze={[3, -1]} reach={20} armL={10} shadow={false}/>
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-tv-light)" opacity={fl}/>
  </> };
}
function shot4(t: number): Shot {
  const p = lin(t, 10.0, 13.85), fl = .38 + .1 * Math.sin(t * 11) + .05 * Math.sin(t * 29);
  const [hx, hy] = headAt('miguel', 300, 1260, 2.6);
  return { night: .2, vig: .55, cam: z(mix(270, hx - 10, p), mix(600, hy + 40, p), 1 + p * .14), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-wall"/>
    <rect x="-20" y="150" width="200" height="300" className="ex-win-frame"/><rect x="-10" y="160" width="180" height="280" fill="url(#gl-sky-orange)"/>
    <circle cx="60" cy="260" r="40" className="ex-sun-haze" opacity=".8"/>
    <Char who="miguel" x={300} g={1260} s={2.6} t={t} expression="surprised" shine gaze={[4, 0]} reach={30} armL={6} backpack={false} shadow={false}/>
    <Char who="bia" x={120} g={1250} s={2.6} t={t} expression="sad" shine gaze={[4, -2]} reach={30} armL={6} shadow={false}/>
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-tv-light)" opacity={fl}/>
  </> };
}

/* ---------- Scene 02: the evacuation ---------- */
function shot5(t: number): Shot {
  const k = t - 13.85, pulse = Math.abs(Math.sin(t * 5));
  return { red: .1 + pulse * .22, shake: .8, cam: z(270, 560, 1.06 + lin(t, 13.85, 15.4) * .06), el: <>
    <XSky kind="reddusk"/><Stars t={t} n={30} op={.4}/>
    {[[-60, 90, 24], [40, 70, 30], [120, 100, 18], [230, 80, 34], [320, 70, 22], [400, 100, 28], [500, 80, 20]].map(([x, w, f], i) => <Tower key={i} x={x ?? 0} base={760} w={w ?? 60} floors={f ?? 10} fh={18} cls={i % 2 ? 'gl-bld-dusk' : 'gl-bld-dusk2'} seed={i + 9} lit={.45}/>)}
    <SirenPole x={90} y={780} t={t} h={190}/><SirenPole x={450} y={780} t={t + .4} h={160}/>
    <rect x="-200" y="760" width="1000" height="30" className="gl-walk"/><rect x="-200" y="790" width="1000" height="300" className="gl-road"/>
    {Array.from({ length: 12 }, (_, i) => { const dir = i % 3 === 0 ? -1 : 1, x = ((rnd(8, i) * 700 + dir * k * (60 + rnd(9, i) * 40)) % 700 + 700) % 700 - 80;
      return <Walker key={i} x={x} y={800 + (i % 4) * 26} s={1.1 + (i % 4) * .12} t={t} seed={i} flip={dir < 0}/>; })}
    <g transform={`translate(${-120 + k * 120} 860)`}><rect x="-120" y="-90" width="240" height="90" rx="12" className="ex-bus"/>{[0, 1, 2, 3, 4].map(i => <rect key={i} x={-104 + i * 44} y="-76" width="34" height="30" rx="4" className="ex-port-lit"/>)}<circle cx="-70" r="16" className="gl-wheel"/><circle cx="70" r="16" className="gl-wheel"/></g>
  </> };
}
function shot6(t: number): Shot {
  const turn = t > 16.9, walkL = t > 16.9 && t < 17.9, mx = mix(270, 175, ramp(t, 16.9, 17.9));
  const key = lin(t, T.door, 16.7) * 90;
  return { red: .08 + Math.abs(Math.sin(t * 4)) * .12, cam: z(mix(300, 220, ramp(t, 16.9, 18.2)), 600, 1.22), el: <>
    <XSky kind="reddusk"/>
    <g transform={`rotate(${(t * 140) % 360} 420 120)`} opacity=".35"><path d="M420 120L900 40L900 200Z" className="ex-siren-beam"/></g>
    <path d="M-80 360L270 200L620 360Z" className="ex-roof"/>
    <rect x="-60" y="360" width="660" height="460" className="ex-house-wall"/>
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-60 ${390 + i * 48}H600`} className="ex-siding"/>)}
    <rect x="60" y="440" width="110" height="120" className="ex-win-frame"/><rect x="68" y="448" width="94" height="104" className="ex-win-dark"/><path d="M115 448V552M68 500H162" className="ex-win-bar"/>
    <rect x="296" y="560" width="112" height="250" className="ex-door-frame"/><rect x="304" y="568" width="96" height="242" className="ex-door"/>
    <circle cx="384" cy="690" r="6" className="ex-knob"/><g transform={`translate(352 650) rotate(${key})`}><rect x="-3" y="-10" width="6" height="20" rx="2" className="ex-key"/></g>
    <rect x="450" y="440" width="110" height="120" className="ex-win-frame"/><rect x="458" y="448" width="94" height="104" className="ex-win-dark"/>
    <rect x="-100" y="806" width="800" height="300" className="ex-porch"/>
    {[230, 470].map(x => <g key={x}><path d={`M${x - 18} 806L${x - 14} 770H${x + 14}L${x + 18} 806Z`} className="ex-pot"/><path d={blob(x, 756, 22, x, 12, .5)} className="ex-plant-dry"/></g>)}
    <Char who="bia" x={95} g={810} s={1.0} t={t} expression="sad" gaze={[3, -1]} reach={30} armL={8}/>
    <Char who="miguel" x={mx} g={810} s={1.0} t={t} flip={walkL} walking={walkL} expression={t > 17.9 ? 'sad' : 'curious'} reach={!turn ? -10 : walkL ? undefined : 30} gaze={t > 17.9 ? [3, -2] : [2, 0]}/>
    <Dust t={t} n={16} speed={260} seed={8} cls="ex-leaf-fly"/>
  </> };
}
function shot7(t: number): Shot {
  const dig = t > 19.6 && t < 20.9, lift = ramp(t, 20.9, 21.6);
  const reach = dig ? 2 + Math.sin(t * 14) * 12 : mix(4, -48, lift);
  const sw = Math.sin(t * 1.6) * 14;
  return { red: .06, cam: z(250 + lin(t, 18.8, 21.85) * 30, 620, 1.22), el: <>
    <XSky kind="orange"/>
    <circle cx="420" cy="300" r="160" fill="url(#ex-haze-glow)"/>
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-100 + i * 46} y="560" width="38" height="170" rx="4" className="ex-fence"/>)}
    <rect x="-100" y="600" width="800" height="12" className="ex-fence-rail"/>
    <path d="M60 760V340Q58 300 90 270M60 420Q20 380 0 340M90 270Q130 250 170 260" className="ex-deadtree-big"/>
    <g transform={`rotate(${sw} 150 262)`}><path d="M128 262V520M172 262V520" className="ex-rope"/><rect x="120" y="516" width="60" height="10" rx="3" className="ex-swing"/></g>
    <rect x="-100" y="730" width="800" height="400" className="ex-dirt"/>
    {[[420, 760], [480, 800], [520, 750]].map(([x, y], i) => <path key={i} d={blob(x ?? 0, y ?? 0, 18, i + 3, 10, .5)} className="ex-plant-dry"/>)}
    <Char who="miguel" x={110} g={812} s={1.02} t={t} expression="sad" gaze={[3, 3]} reach={30} armL={4}/>
    <Char who="bia" x={300} g={812 + 66 * .74} s={1.0} t={t} seated expression={t > 21 ? 'happy' : 'curious'} gaze={[3, 4]} reach={reach} armL={6} shadow={false}
      extra={t > 20.9 ? held(reach, t) : <Sprout x={190} y={268} s={1.1} t={t}/>}/>
    {dig && Array.from({ length: 6 }, (_, i) => { const ph = (t * 3 + i / 6) % 1; return <circle key={i} cx={380 + ph * 40 * (i % 2 ? 1 : -1)} cy={800 - Math.sin(Math.PI * ph) * 40} r="3.5" className="ex-soil"/>; })}
    <Dust t={t} n={20} speed={300} seed={9}/>
  </> };
}
function shot8(t: number): Shot {
  const p = lin(t, 21.85, 23.95);
  return { vig: .55, cam: z(270, 500, 1.04 + p * .08), el: <>
    <XSky kind="orange"/>
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={rnd(2, i) * 540} cy={rnd(3, i) * 600} r={20 + rnd(4, i) * 40} className="ex-bokeh" opacity={.25 + .2 * Math.sin(t + i)}/>)}
    <Char who="bia" x={270} g={880} s={3.0} t={t} expression="happy" shine gaze={[0, 4]} hideArms shadow={false}/>
    <Sprout x={270} y={790} s={3.6} t={t}/>
    <g className="bia-scope">
      <path d="M160 760Q150 700 180 690Q200 690 204 720L206 800Q190 830 168 812Z" className="leo-skin ex-hand"/>
      <path d="M380 760Q390 700 360 690Q340 690 336 720L334 800Q350 830 372 812Z" className="leo-skin ex-hand"/>
      <path d="M186 712Q198 716 204 728M354 712Q342 716 336 728" className="skin-detail"/>
    </g>
    <circle cx="300" cy="610" r="90" fill="url(#ex-haze-glow)" opacity=".5"/>
  </> };
}
function Scaffold({ x, y0, y1, w = 46 }: { x: number; y0: number; y1: number; w?: number }) {
  const n = Math.floor((y0 - y1) / 46);
  return <g>
    <path d={`M${x} ${y0}V${y1}M${x + w} ${y0}V${y1}`} className="ex-truss"/>
    {Array.from({ length: n }, (_, i) => <path key={i} d={`M${x} ${y0 - i * 46}L${x + w} ${y0 - (i + 1) * 46}M${x + w} ${y0 - i * 46}L${x} ${y0 - (i + 1) * 46}M${x} ${y0 - i * 46}H${x + w}`} className="ex-truss-thin"/>)}
  </g>;
}
function shot9(t: number): Shot {
  const tilt = ease(lin(t, 24.3, 27.6)), k = t - 23.95;
  const ramp0: [number, number] = [-20, 930], ramp1: [number, number] = [232, 720];
  return { night: .15, cam: z(270, mix(760, 430, tilt), mix(1.3, .9, tilt)), el: <>
    <XSky kind="reddusk"/><Stars t={t} n={50} op={.6}/>
    {[0, 1, 2].map(i => <path key={i} d="M0 0L60 -900L-60 -900Z" transform={`translate(${80 + i * 190} 940) rotate(${Math.sin(t * .7 + i * 2) * 22})`} className="ex-searchlight"/>)}
    <Ark x={60} base={940} h={560} w={100} lit={.5} seed={4}/>
    <Ark x={490} base={940} h={620} w={110} lit={.55} seed={6}/>
    <Scaffold x={360} y0={940} y1={260}/>
    <g transform={`rotate(${Math.sin(t * .5) * 8 - 6} 383 260)`}><path d="M383 260H160M383 260L330 230H200L160 260" className="ex-truss"/><path d={`M${210 + Math.sin(t * .8) * 30} 260V${330 + Math.sin(t) * 20}`} className="ex-rope"/></g>
    <Ark x={270} base={940} h={800} w={170} lit={.75} seed={2}/>
    <rect x="218" y="700" width="34" height="46" rx="4" className="ex-port-lit"/>
    <path d={`M${ramp0[0]} ${ramp0[1]}L${ramp1[0]} ${ramp1[1]}L${ramp1[0]} ${ramp1[1] + 14}L${ramp0[0]} ${ramp0[1] + 14}Z`} className="ex-ramp"/>
    {Array.from({ length: 10 }, (_, i) => { const u = (k * .06 + i / 10) % 1; return <Walker key={i} x={mix(ramp0[0], ramp1[0], u)} y={mix(ramp0[1], ramp1[1], u)} s={.6} t={t} seed={i + 3}/>; })}
    <rect x="-200" y="940" width="1000" height="300" className="ex-pad"/>
    {Array.from({ length: 14 }, (_, i) => <Walker key={i} x={-40 + i * 44 + Math.sin(i) * 10 + (k * 10) % 44} y={980 + (i % 3) * 16} s={.9} t={t} seed={i + 20}/>)}
    {[[140, 480], [383, 300], [600, 520]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="70" fill="url(#ex-lamp-glow)"/><circle cx={x} cy={y} r="6" className="ex-lamp"/></g>)}
    <Char who="miguel" x={120} g={1030} s={.45} t={t} walking expression="sad"/>
    <Char who="bia" x={170} g={1032} s={.45} t={t} walking expression="sad" reach={-30} extra={held(-30, t)}/>
  </> };
}

/* ---------- Scene 03: the departure ---------- */
function shot10(t: number): Shot {
  const fh = mix(30, 470, ease(lin(t, T.engines, 30.0))), sm = lin(t, 28.9, 31.4) * 1.4, quake = t > T.ground;
  const rise = ease(lin(t, 30.9, 31.4)) * 60;
  return { shake: quake ? 4 : t > T.engines ? 1 : 0, flash: t > 28.5 && t < 28.9 ? (28.9 - t) * 1.2 : 0, night: .1, cam: z(270, 560, 1.02 + lin(t, 28.1, 31.4) * .06), el: <>
    <XSky kind="reddusk"/>
    <Scaffold x={470} y0={700} y1={-100} w={56}/>
    <g transform={`translate(0 ${-rise})`}>
      <path d="M90 -300V470Q90 520 140 520H400Q450 520 450 470V-300Z" className="ex-hull"/>
      <path d="M330 -300V520H400Q450 520 450 470V-300Z" className="ex-hull-shade"/>
      <rect x="88" y="300" width="364" height="22" className="ex-hull-band"/>
      {[170, 270, 370].map(x => <g key={x}><path d={`M${x - 40} 520L${x - 52} 580H${x + 52}L${x + 40} 520Z`} className="ex-nozzle"/><Flame x={x} y={580} w={96} h={fh} t={t + x}/></g>)}
    </g>
    <rect x="-200" y="700" width="1000" height="400" className="ex-pad"/>
    <path d="M40 700L80 640H460L500 700Z" className="ex-pad-top"/>
    <Smoke x={270} y={700} p={sm} n={22} seed={3} spread={420}/>
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-fire-light)" opacity={lin(t, T.engines, 29.5) * .8}/>
  </> };
}
function shot11(t: number): Shot {
  const k = lin(t, 31.4, 33.6), scroll = (t - 31.4) * 700;
  return { shake: 2 * (1 - k), cam: z(270, 480, 1), el: <>
    <XSky kind="orange" op={1 - k}/><XSky kind="space" op={k}/><Stars t={t} n={90} op={k}/>
    {[0, 1, 2, 3, 4, 5].map(i => <Cloud key={i} x={(i * 170) % 640 - 40} y={((i * 260 + scroll * (1 + i * .1)) % 1500) - 300} s={1.6 + (i % 3) * .5} cls="ex-cloud-orange"/>)}
    <path d={`M270 700L250 1100H290Z`} className="ex-trail"/>
    <Smoke x={270} y={1050} p={1} n={10} seed={7} spread={60} cls="ex-smoke"/>
    <g transform="translate(270 300) scale(.62)"><Ark x={0} base={700} h={900} w={150} lit={.8}/><Flame x={0} y={716} w={120} h={360} t={t}/></g>
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${rnd(3, i) * 540} ${(rnd(4, i) * 960 + scroll * 1.6) % 960}v${30 + rnd(5, i) * 40}`} className="ex-speed" opacity={.5 * (1 - k * .5)}/>)}
  </> };
}
function Porthole({ cx, cy, r, children }: { cx: number; cy: number; r: number; children: ReactNode }) {
  return <g>
    <defs><clipPath id="ex-port-clip"><circle cx={cx} cy={cy} r={r}/></clipPath></defs>
    <g clipPath="url(#ex-port-clip)">{children}<path d={`M${cx - r} ${cy - r * .3}L${cx - r * .2} ${cy - r}`} className="ex-glass-hi"/><path d={`M${cx - r * .6} ${cy + r * .2}L${cx + r * .1} ${cy - r * .7}`} className="ex-glass-hi"/></g>
    <circle cx={cx} cy={cy} r={r + 14} className="ex-port-ring"/><circle cx={cx} cy={cy} r={r + 4} className="ex-port-inner"/>
    {Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return <circle key={i} cx={cx + Math.cos(a) * (r + 9)} cy={cy + Math.sin(a) * (r + 9)} r="3" className="ex-rivet"/>; })}
  </g>;
}
function shot12(t: number): Shot {
  const r = earthInWindow(t), p = lin(t, 33.6, 40.15), ex = 330 + (1 - r / 230) * 40, ey = 380 - (1 - r / 230) * 30;
  return { blue: .18, vig: .55, cam: z(mix(260, 300, p), mix(560, 480, p), 1 + p * .16), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-cabin"/>
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-100 + i * 140} -200V1200`} className="ex-panel-line"/>)}
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={40 + i * 66} cy="90" r="3" className={Math.sin(t * 3 + i) > .3 ? 'ex-beacon' : 'ex-port'}/>)}
    <Porthole cx={330} cy={380} r={210}>
      <XSky kind="space"/><Stars t={t} n={120} h={700} seed={7}/>
      <Earth x={ex} y={ey} r={Math.max(3, r)} t={t} spin={9}/>
      <Blight x={ex} y={ey} r={Math.max(3, r)} p={Math.min(1, r / 230) * .7} t={t} id="ex-win-blight"/>
      {r < 30 && <circle cx={ex} cy={ey} r={14 + Math.sin(t * 4) * 3} fill="url(#ex-dot-glow)"/>}
    </Porthole>
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-window-light)" opacity=".55"/>
    <Char who="miguel" x={150} g={1000} s={1.3} t={t} expression="sad" gaze={[3, -4]} shine reach={30} armL={4}/>
    <Char who="bia" x={262} g={1010} s={1.3} t={t} expression="sad" gaze={[3, -4]} shine reach={-30} armL={6} extra={held(-30, t)}/>
  </> };
}
function shot13(t: number): Shot {
  const reach = mix(10, -40, ease(lin(t, T.biaHand, 41.3))), touch = lin(t, 41.3, 41.7), tear = lin(t, 41.6, 42.9);
  const [hx, hy] = handPt(-40), k = .74 * 2.6, wx = 200 - 90 * k + hx * k, wy = 1100 - 348 * k + hy * k;
  return { blue: .2, vig: .6, cam: z(290, 600, 1.04 + lin(t, 40.15, 42.95) * .05), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-cabin"/>
    <rect x={wx - 6} y="-200" width="1000" height="1400" className="ex-glass"/>
    <Stars t={t} n={50} seed={8} h={960}/>
    <circle cx="470" cy="300" r="10" fill="url(#ex-dot-glow)"/><circle cx="470" cy="300" r="2.5" className="gl-ocean"/>
    <Char who="bia" x={200} g={1100} s={2.6} t={t} expression="sad" shine gaze={[4, -1]} reach={reach} armL={6} tear={tear} shadow={false}/>
    {touch > 0 && <ellipse cx={wx + 6} cy={wy} rx={30 * touch} ry={36 * touch} className="ex-fog" opacity={.5 * touch}/>}
    <path d={`M${wx - 6} -200V1200`} className="ex-port-ring-line"/>
    <path d={`M${wx + 60} 100L${wx + 160} 0M${wx + 40} 300L${wx + 220} 120`} className="ex-glass-hi"/>
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-window-light)" opacity=".4"/>
  </> };
}

/* ---------- Scene 04: the search ---------- */
function Nebula({ t }: { t: number }) {
  return <g>
    <ellipse cx={200 - t * 4} cy="300" rx="380" ry="200" fill="url(#ex-neb-a)" transform={`rotate(-20 200 300)`}/>
    <ellipse cx={420 - t * 3} cy="680" rx="340" ry="180" fill="url(#ex-neb-b)" transform={`rotate(15 420 680)`}/>
  </g>;
}
function shot14(t: number): Shot {
  const k = t - 42.95;
  return { vig: .5, cam: z(270, 480, 1.05), el: <>
    <XSky kind="space"/><Nebula t={k}/><Stars t={t} n={120} h={960} seed={11}/>
    {Array.from({ length: 40 }, (_, i) => { const x = ((rnd(12, i) * 900 - k * (300 + rnd(13, i) * 500)) % 900 + 900) % 900 - 180, y = rnd(14, i) * 960;
      return <path key={i} d={`M${x} ${y}h${30 + rnd(15, i) * 80}`} className="ex-speed" opacity={.3 + rnd(16, i) * .5}/>; })}
    <g transform="translate(560 160)"><circle r="60" fill="url(#ex-neb-a)"/>{[0, 1, 2].map(i => <ellipse key={i} rx={50 - i * 14} ry={16 - i * 4} transform={`rotate(${-20 + t * 6})`} className="ex-galaxy"/>)}</g>
    <ArkSide x={170 + k * 30} y={500 + Math.sin(t) * 6} s={.95} t={t}/>
  </> };
}
function shot15(t: number): Shot {
  const g = sproutGrowth(t), day = .5 + .5 * Math.sin((t - 45) * 9), bs = mix(1.15, 1.28, lin(t, 45, 47.6));
  return { blue: .1 + (1 - day) * .15, cam: z(270, 560, 1.12), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-cabin-warm"/>
    <Porthole cx={400} cy={300} r={90}><XSky kind="space"/><Nebula t={(t - 45) * 40}/><Stars t={t * 8} n={40} seed={9} h={600}/></Porthole>
    <rect x="200" y="660" width="320" height="18" rx="6" className="ex-shelf"/>
    <Sprout x={380} y={660 - 20 * 1.6} s={1.6} t={t} grow={g} pot={g > .25}/>
    <rect x="-200" y="780" width="1000" height="400" className="ex-cabin-floor"/>
    <Char who="bia" x={170} g={780 + 66 * .74 * bs} s={bs} t={t} seated expression="happy" gaze={[4, -2]} reach={-20} armL={8} shadow={false}/>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-daylight" opacity={day * .25}/>
  </> };
}
function shot16(t: number): Shot {
  const g = ease(lin(t, 47.6, 51.8)), r = mix(46, 250, g), y = mix(640, 470, g), flare = ramp(t, T.appeared - .3, T.appeared + .6) * (1 - ramp(t, 50.5, 52.6));
  return { vig: .45, cam: z(270, 480, 1 + lin(t, 47.6, 52.6) * .05), el: <>
    <XSky kind="space"/><Stars t={t} n={150} h={960} seed={5}/>
    <Moon x={mix(380, 470, g)} y={mix(560, 240, g)} r={mix(8, 30, g)} cls="ex-moon-b"/>
    <NewWorld x={290} y={y} r={r} t={t}/>
    <Moon x={mix(240, 90, g)} y={mix(600, 720, g)} r={mix(5, 18, g)} cls="ex-moon-a"/>
    {flare > 0 && <g opacity={flare}><circle cx={290 + r * .7} cy={y - r * .7} r={r * 1.1} fill="url(#ex-flare)"/><path d={`M${290 + r * .7 - 260} ${y - r * .7}h520`} className="ex-flare-line"/></g>}
    <g transform={`translate(${mix(150, 220, g)} ${mix(860, 820, g)}) rotate(-10) scale(${mix(.75, .55, g)})`}><ArkSide x={0} y={0} t={t} s={1}/></g>
  </> };
}
function shot17(t: number): Shot {
  const p = lin(t, 52.6, 56.95), sx = (t - 52.6) * 150;
  return { cam: z(mix(200, 340, ease(p)), 520, 1.08), el: <>
    <XSky kind="alien"/>
    <Moon x={110} y={190} r={60} cls="ex-moon-a"/><Moon x={430} y={140} r={22} cls="ex-moon-b"/>
    <Stars t={t} n={30} op={.5} h={300}/>
    <path d="M-200 520L-120 330L-20 320L40 520Z" className="ex-mesa-far"/><path d="M380 520L420 300L560 290L620 520Z" className="ex-mesa-far"/>
    <path d="M140 600L180 380L330 370L370 600Z" className="ex-mesa"/>
    <Waterfall x={255} top={382} bottom={610} w={60} t={t}/><Waterfall x={470} top={300} bottom={560} w={36} t={t + 1}/><Waterfall x={-70} top={330} bottom={560} w={30} t={t + 2}/>
    <path d="M-200 580Q100 550 270 600Q480 560 800 590V700H-200Z" className="ex-alien-hill"/>
    {Array.from({ length: 9 }, (_, i) => <GlowTree key={i} x={-120 + i * 95} y={610 + (i % 2) * 14} s={.7} t={t} seed={i + 1}/>)}
    <path d="M-200 700Q200 660 270 690Q420 720 800 690V1200H-200Z" className="ex-alien-ground"/>
    <path d="M-200 820Q120 760 270 800Q440 850 800 780V880Q440 940 270 890Q120 850 -200 910Z" className="ex-river"/>
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${(i * 80 + t * 30) % 900 - 160} ${830 + (i % 3) * 18}h${30 + i * 4}`} className="gl-glint" opacity={.5 + .4 * Math.sin(t * 3 + i)}/>)}
    {Array.from({ length: 6 }, (_, i) => <GlowTree key={i} x={-160 + i * 150} y={1010} s={1.4} t={t} seed={i + 20}/>)}
    <Shuttle x={-80 + sx * 1.6} y={300 + Math.sin(t * 2) * 8} s={1.1} t={t} rot={-4}/>
    <Spores t={t} n={30}/>
  </> };
}
function shot18(t: number): Shot {
  const cheer = t > 58.2, hop = cheer ? Math.abs(Math.sin(t * 9)) * 16 : 0;
  return { cam: z(270, 600, 1.04 + lin(t, 56.95, 60.6) * .06), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-cabin"/>
    <defs><clipPath id="ex-pano"><rect x="-10" y="120" width="560" height="520" rx="40"/></clipPath></defs>
    <g clipPath="url(#ex-pano)">
      <XSky kind="space"/><Stars t={t} n={60} h={500}/>
      <NewWorld x={270} y={1260} r={760} t={t * .2} ring={false} id="ex-pano-nw"/>
      <rect x="-10" y="120" width="560" height="520" fill="url(#ex-sunrise)" opacity={.5 + lin(t, 56.95, 60) * .4}/>
    </g>
    <rect x="-10" y="120" width="560" height="520" rx="40" className="ex-pano-frame"/>
    <path d="M180 120V640M360 120V640" className="ex-pano-bar"/>
    {Array.from({ length: 9 }, (_, i) => { const x = -30 + i * 70, up = cheer && i % 2 === 0 ? Math.sin(t * 7 + i) * 8 - 30 : 0;
      return <g key={i}><path d={`M${x - 26} 960Q${x - 26} 720 ${x} 712Q${x + 26} 720 ${x + 26} 960Z`} className="ex-crowd"/><circle cx={x} cy={694} r="22" className="ex-crowd"/>{cheer && <path d={`M${x + 18} 740L${x + 34} ${680 + up}`} className="ex-crowd-arm"/>}</g>; })}
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-window-light)" opacity=".5"/>
    <Char who="miguel" x={180} g={1010} s={1.4} t={t} expression={cheer ? 'happy' : 'surprised'} shine gaze={[2, -4]} reach={cheer ? -58 + Math.sin(t * 8) * 6 : 30} armL={4}/>
    <g transform={`translate(0 ${-hop})`}><Char who="bia" x={340} g={1010} s={1.4} t={t} expression="happy" shine gaze={[1, -4]} reach={-30} armL={cheer ? -60 : 8} extra={held(-30, t, 1, true, .9)} shadow={false}/></g>
  </> };
}

/* ---------- Scene 05: the revelation ---------- */
function shot19(t: number): Shot {
  const scan = mix(-40, 1000, lin(t, 61.2, 63.9)), alert = t > 63.4 ? Math.abs(Math.sin(t * 6)) : 0;
  const canopy = Array.from({ length: 90 }, (_, i) => <path key={i} d={blob(rnd(21, i) * 640 - 50, rnd(22, i) * 1000 - 20, 26 + rnd(23, i) * 30, i, 12, .5)} className={['ex-top-a', 'ex-top-b', 'ex-top-c'][i % 3] ?? 'ex-top-a'}/>);
  const grid: string[] = [];
  for (let i = 0; i < 7; i++) grid.push(`M${40 + i * 75} 60V940`);
  for (let i = 0; i < 12; i++) grid.push(`M20 ${80 + i * 75}H520`);
  return { red: alert * .22, cam: z(270, 480, 1.05 + lin(t, 60.6, 64.9) * .1), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-alien-ground"/>
    <path d="M-200 300Q100 360 300 260Q480 180 800 260" className="ex-river-top"/>
    {canopy}
    <defs><clipPath id="ex-scan-clip"><rect x="-200" y="-200" width="1000" height={scan + 200}/></clipPath></defs>
    <g clipPath="url(#ex-scan-clip)">
      <rect x="-200" y="-200" width="1000" height="1400" className="ex-scan-tint"/>
      <path d={grid.join('')} className="ex-scan-grid"/>
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={50 + (i % 6) * 75} y={95 + Math.floor(i / 6) * 225 + (i % 2) * 75} width="56" height="56" className="ex-scan-block"/>)}
      <ellipse cx="300" cy="700" rx="170" ry="60" transform="rotate(-18 300 700)" className="ex-scan-ship"/>
    </g>
    <rect x="-200" y={scan - 6} width="1000" height="12" className="ex-scan-line"/>
    <rect x="-200" y={scan - 80} width="1000" height="80" fill="url(#ex-scan-fade)"/>
    {[0, 1].map(i => <circle key={i} cx="300" cy="700" r={60 + i * 40 + Math.sin(t * 4) * 6} className="ex-reticle" opacity={t > 63.2 ? 1 : 0}/>)}
  </> };
}
function shot20(t: number): Shot {
  const p = lin(t, 64.9, 67.4);
  return { shake: t < 65.4 ? 2.5 : 0, cam: z(270, 520, 1 + p * .12), el: <>
    <XSky kind="alienDusk"/><Moon x={420} y={170} r={46} cls="ex-moon-a"/><Moon x={140} y={120} r={16} cls="ex-moon-b"/>
    <rect x="-200" y="460" width="1000" height="200" className="ex-fog" opacity=".35"/>
    {[[-40, 80, 300, 1], [60, 100, 420, 2], [190, 70, 260, 3], [280, 120, 500, 4], [420, 90, 360, 5], [520, 80, 280, 6]].map(([x, w, h, sd], i) => <RuinTower key={i} x={x ?? 0} base={720} w={w ?? 80} h={h ?? 300} seed={sd ?? 1} t={t} cls={i % 2 ? 'ex-ruin' : 'ex-ruin-b'}/>)}
    <rect x="-200" y="600" width="1000" height="160" className="ex-fog" opacity=".5"/>
    <path d="M-200 720Q100 690 270 720Q460 750 800 700V1200H-200Z" className="ex-alien-ground"/>
    {Array.from({ length: 6 }, (_, i) => <GlowTree key={i} x={-130 + i * 150} y={900 + (i % 2) * 40} s={1.5} t={t} seed={i + 40}/>)}
    <Spores t={t} n={34} seed={6}/>
  </> };
}
function shot21(t: number): Shot {
  const k = t - 67.4, beam = (dx: number, x: number, y: number) => <path d={`M${x} ${y}L${x + 200} ${y - 70 + dx}L${x + 200} ${y + 40 + dx}Z`} className="ex-beam"/>;
  return { cam: z(260 + k * 20, 600, 1.1), el: <>
    <XSky kind="alienDusk"/><Moon x={90} y={200} r={40} cls="ex-moon-a"/>
    <path d="M-200 820Q60 600 300 640Q520 600 800 760V1200H-200Z" className="ex-alien-hill"/>
    <g transform="translate(330 640) rotate(-16)">
      <path d="M-300 -60L200 -80Q320 -76 360 0Q320 70 200 80L-300 60Z" className="ex-hull-old"/>
      <ellipse cx="-20" cy="0" rx="50" ry="130" className="ex-ring-old"/>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-260 + i * 50} -66V66`} className="ex-rib"/>)}
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-240 + i * 90} -64Q${-230 + i * 90} -20 ${-250 + i * 90} 30`} className="ex-vine"/>)}
    </g>
    <path d="M-200 900Q100 760 300 800Q520 770 800 860V1200H-200Z" className="ex-alien-ground"/>
    <path d="M300 760Q330 700 370 760Z" className="ex-hole"/>
    <Shuttle x={60} y={810} s={.9} t={0} rot={4}/>
    {beam(Math.sin(t * 3) * 10, 200 + k * 30, 762)}
    <Char who="miguel" x={170 + k * 30} g={800} s={.42} t={t} walking reach={-40} expression="curious" extra={<rect x="166" y="150" width="22" height="10" rx="3" className="ex-torch"/>}/>
    <Char who="bia" x={130 + k * 30} g={806} s={.42} t={t} walking expression="scared" reach={-30} extra={held(-30, t, 1, true, .9)}/>
    {Array.from({ length: 5 }, (_, i) => <GlowTree key={i} x={-60 + i * 160} y={1010} s={1.3} t={t} seed={i + 60}/>)}
    <Spores t={t} n={20} seed={9}/>
  </> };
}
function Figure({ x, y, s = 1, step = 0 }: { x: number; y: number; s?: number; step?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} className="ex-carve">
    <circle cy="-62" r="9"/><path d="M0 -52V-22M0 -44L-12 -30M0 -44L14 -32M0 -22L${-8 - step} 0M0 -22L${8 + step} 0"/>
  </g>;
}
function Mural({ lit }: { lit: boolean }) {
  return <g className={lit ? 'ex-mural-lit' : 'ex-mural-dim'}>
    <circle cx="120" cy="400" r="74" className="ex-carve"/>
    <path d="M70 360L110 400L90 440M150 350L130 400L170 430M100 470L120 420" className="ex-carve"/>
    {[0, 1, 2, 3].map(i => <path key={i} d={`M${80 + i * 28} 330Q${74 + i * 28} ${310 - i * 4} ${86 + i * 28} 296Q${96 + i * 28} 314 ${88 + i * 28} 330Z`} className="ex-carve-fill"/>)}
    {Array.from({ length: 6 }, (_, i) => <Figure key={i} x={210 + i * 44} y={570 - i * 8} s={1.35} step={i % 2 ? 4 : -2}/>)}
    <g transform="translate(530 440) rotate(-28) scale(.42)"><path d="M-140 -40L120 -40Q200 -38 230 0Q200 38 120 40L-140 40Z" className="ex-carve"/><ellipse rx="36" ry="84" className="ex-carve"/></g>
    <path d="M600 380Q660 320 760 300" className="ex-carve-dots"/>
    <path d="M30 640H1100M30 200H1100" className="ex-carve"/>
  </g>;
}
function MuralSun() {
  return <g>
    <path d="M760 300Q840 290 900 300" className="ex-carve-dots"/>
    <circle cx="1080" cy="420" r="40" className="ex-carve-fill"/>
    {[80, 120, 165, 215].map(r => <circle key={r} cx="1080" cy="420" r={r} className="ex-carve-orbit"/>)}
    <circle cx={1080 - 80 * .7} cy={420 - 80 * .7} r="9" className="ex-carve-fill"/>
    <circle cx={1080 + 120} cy={420} r="10" className="ex-carve-fill"/>
    <circle cx={1080 + 215 * .6} cy={420 + 215 * .8} r="14" className="ex-carve-fill"/>
  </g>;
}
const EARTH_DOT: [number, number] = [1080 - 165 * .82, 420 - 165 * .57];
function wallShot(t: number, spot: [number, number], camX: number, camY: number, s: number, blueGlow: number): ReactNode {
  return <>
    <rect x="-400" y="-200" width="2000" height="1400" className="ex-stone"/>
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + (i % 10) * 160} ${150 + Math.floor(i / 10) * 260}h${100 + rnd(30, i) * 40}`} className="ex-stone-line"/>)}
    <defs><mask id="ex-spot-mask"><rect x="-400" y="-200" width="2000" height="1400" fill="black"/><circle cx={spot[0]} cy={spot[1]} r="190" fill="url(#ex-spot-grad)"/></mask></defs>
    <Mural lit={false}/><MuralSun/>
    <g opacity=".22"><circle cx={EARTH_DOT[0]} cy={EARTH_DOT[1]} r="12" className="ex-earth-stone"/></g>
    <g mask="url(#ex-spot-mask)">
      <rect x="-400" y="-200" width="2000" height="1400" className="ex-stone-lit"/>
      <Mural lit/><g className="ex-mural-lit"><MuralSun/></g>
      <circle cx={EARTH_DOT[0]} cy={EARTH_DOT[1]} r="12" className="ex-earth-stone"/>
    </g>
    {blueGlow > 0 && <g opacity={blueGlow}><circle cx={EARTH_DOT[0]} cy={EARTH_DOT[1]} r={60 + Math.sin(t * 6) * 6} fill="url(#ex-dot-glow)"/><circle cx={EARTH_DOT[0]} cy={EARTH_DOT[1]} r="12" className="ex-earth-stone-lit"/></g>}
    {Array.from({ length: 16 }, (_, i) => { const ph = (t * .15 + rnd(40, i)) % 1; return <circle key={i} cx={spot[0] + (rnd(41, i) - .5) * 300} cy={spot[1] + (ph - .5) * 300} r={1.5 + rnd(42, i) * 1.5} className="ex-mote" opacity={Math.sin(Math.PI * ph)}/>; })}
    <path d={`M${camX - 330 / s} ${camY + 560 / s}L${spot[0] - 120} ${spot[1] - 120}L${spot[0] + 120} ${spot[1] + 120}Z`} className="ex-beam" opacity=".45"/>
  </>;
}
function shot22(t: number): Shot {
  const keys: Array<[number, number, number]> = [[69.0, 120, 400], [70.4, 140, 410], [T.people, 300, 520], [T.fleeing + .5, 470, 470], [73.2, 640, 340]];
  let sx = 120, sy = 400;
  for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (a && b && t >= a[0] && t <= b[0]) { const u = ease((t - a[0]) / (b[0] - a[0])); sx = mix(a[1], b[1], u); sy = mix(a[2], b[2], u); } else if (b && t > b[0]) { sx = b[1]; sy = b[2]; } }
  const cx = mix(200, 460, lin(t, 69, 73.2)), cy = 460;
  return { vig: .65, night: .1, cam: z(cx, cy, 1.3), el: wallShot(t, [sx, sy], cx, cy, 1.3, 0) };
}
function shot23(t: number): Shot {
  const u = ease(lin(t, 73.2, 74.4)), sx = mix(700, EARTH_DOT[0], u), sy = mix(320, EARTH_DOT[1], u), zoom = ease(lin(t, 74.2, 75.4));
  const cx = mix(mix(760, 940, u), EARTH_DOT[0], zoom), cy = mix(380, EARTH_DOT[1], zoom), s = mix(1, 2.4, zoom);
  return { vig: .7, night: .1, flash: t > T.earth && t < T.earth + .35 ? (T.earth + .35 - t) * 1.4 : 0, cam: z(cx, cy, s), el: wallShot(t, [sx, sy], cx, cy, s, ramp(t, T.earth - .2, T.earth + .3)) };
}
function shot24(t: number): Shot {
  const p = lin(t, 75.5, 81.7), [hx, hy] = headAt('miguel', 230, 1250, 2.5);
  const expr = t < T.returned ? 'surprised' : 'sad';
  return { night: .12, vig: .6, blue: .2 + .06 * Math.sin(t * 3), cam: z(mix(270, hx + 40, p), mix(620, hy + 60, p), 1 + p * .16), el: <>
    <rect x="-200" y="-200" width="1000" height="1400" className="ex-stone"/>
    <circle cx="520" cy="260" r="160" fill="url(#ex-dot-glow)" opacity=".7"/>
    <Char who="miguel" x={230} g={1250} s={2.5} t={t} expression={expr} shine gaze={[4, -2]} reach={-36} armL={6} backpack={false} shadow={false} extra={<rect x="166" y="150" width="26" height="12" rx="3" className="ex-torch"/>}/>
    <Char who="bia" x={440} g={1300} s={2.5} t={t} flip expression="sad" shine gaze={[3, -4]} reach={28} armL={6} shadow={false} extra={held(28, t, 1, true, .55)}/>
    {Array.from({ length: 18 }, (_, i) => { const ph = (t * .1 + rnd(50, i)) % 1; return <circle key={i} cx={rnd(51, i) * 540} cy={960 - ph * 960} r={1.5 + rnd(52, i) * 2} className="ex-mote" opacity={Math.sin(Math.PI * ph) * .8}/>; })}
    <rect x="-200" y="-200" width="1000" height="1400" fill="url(#ex-torch-light)" opacity=".5"/>
  </> };
}
function shot25(t: number): Shot {
  const place = ease(lin(t, 81.7, 83.0)), p = lin(t, 81.7, 85.75), g0 = 790;
  const reach = mix(-30, 10, place);
  return { cam: z(mix(330, 290, p), mix(700, 600, p), mix(1.45, 1.08, ease(p))), el: <>
    <XSky kind="alienDusk"/><Moon x={110} y={200} r={50} cls="ex-moon-a"/><Moon x={440} y={150} r={18} cls="ex-moon-b"/>
    <circle cx="400" cy="560" r="220" fill="url(#ex-flare)" opacity=".55"/>
    {[[-60, 70, 260, 11], [40, 90, 340, 12], [420, 100, 300, 13], [520, 70, 220, 14]].map(([x, w, h, sd], i) => <RuinTower key={i} x={x ?? 0} base={680} w={w ?? 80} h={h ?? 300} seed={sd ?? 1} t={t} cls="ex-ruin-far"/>)}
    <rect x="-200" y="600" width="1000" height="120" className="ex-fog" opacity=".45"/>
    <path d="M-200 700Q120 660 270 690Q460 720 800 680V1200H-200Z" className="ex-alien-hill"/>
    <path d={`M-200 ${g0}Q200 ${g0 - 20} 800 ${g0}V1200H-200Z`} className="ex-alien-ground"/>
    {Array.from({ length: 30 }, (_, i) => { const x = -100 + i * 26, sw = Math.sin(t * 2 + i) * 4; return <path key={i} d={`M${x} ${g0 + 4}Q${x + sw} ${g0 - 10} ${x + sw * 2} ${g0 - 20 - (i % 3) * 6}`} className="ex-alien-blade"/>; })}
    <Char who="miguel" x={170} g={g0 + 66} s={1.0} t={t} seated expression="sad" gaze={[4, 3]} reach={20} armL={6} shadow={false}/>
    {place >= 1 && <Sprout x={398} y={g0 + 4} s={1.1} t={t} grow={1} bare/>}
    <Char who="bia" x={300} g={g0 + 66 * .74} s={1.0} t={t} seated expression={place >= 1 ? 'happy' : 'curious'} gaze={[3, 4]} reach={reach} armL={6} shadow={false} extra={place < 1 ? held(reach, t, 1, false, .9) : null}/>
    <GlowTree x={-30} y={1000} s={1.6} t={t} seed={70}/><GlowTree x={560} y={1010} s={1.5} t={t} seed={71}/>
    <Spores t={t} n={28} seed={12}/>
  </> };
}
function shot26(t: number): Shot {
  const up = ease(lin(t, 85.75, 87.8)), x = ease(lin(t, 87.2, 88.2)), out = ease(lin(t, 87.6, 91.5));
  const ground = <g opacity={1 - x}>
    <XSky kind="alienDusk"/><Stars t={t} n={60} h={400} op={up}/>
    <Moon x={110} y={200} r={50} cls="ex-moon-a"/>
    <path d="M-200 700Q120 660 270 690Q460 720 800 680V1200H-200Z" className="ex-alien-hill"/>
    <path d="M-200 790Q200 770 800 790V1200H-200Z" className="ex-alien-ground"/>
    <Sprout x={398} y={794} s={1.1} t={t} grow={1} bare/>
    <Char who="bia" x={300} g={790 + 66 * .74} s={1} t={t} seated expression="happy" gaze={[3, 2]} reach={10} armL={6} shadow={false}/>
    <Char who="miguel" x={170} g={856} s={1} t={t} seated expression="happy" gaze={[4, 2]} reach={0} armL={6} shadow={false}/>
  </g>;
  return { vig: .5, cam: x < 1 ? z(mix(340, 300, up), mix(730, 420, up), mix(1.6, 1.0, up)) : z(270, 480, 1), el: <>
    {x < 1 && ground}
    {x > 0 && <g opacity={x}><g transform={z(270, 480, mix(1.8, 1, out))}>
      <XSky kind="space"/><Stars t={t} n={160} h={960} seed={13}/>
      <Moon x={110} y={260} r={24} cls="ex-moon-a"/>
      <NewWorld x={270} y={560} r={220} t={t} id="ex-final-nw"/>
      <Moon x={430} y={760} r={12} cls="ex-moon-b"/>
      <g transform={`translate(${380 + (t - 87.2) * 6} 300) scale(.18)`}><ArkSide x={0} y={0} t={t}/></g>
      <circle cx="470" cy="90" r={18 + Math.sin(t * 3) * 3} fill="url(#ex-dot-glow)" opacity={out}/><circle cx="470" cy="90" r="3" className="gl-ocean" opacity={out}/>
    </g></g>}
  </> };
}

const SHOTS = [shot0, shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot9, shot10, shot11, shot12, shot13, shot14, shot15, shot16, shot17, shot18,
  shot19, shot20, shot21, shot22, shot23, shot24, shot25, shot26];
const SKIES = ['polar', 'day', 'night', 'storm', 'sunset', 'gold', 'space', 'memory'] as const;
const EX_SKIES = ['orange', 'reddusk', 'alien', 'alienDusk', 'cabin'] as const;

export function ExodoScene({ time }: { time: number }) {
  const f = getExodoFrame(time), t = f.t;
  const s = (SHOTS[f.shot] ?? shot0)(t);
  const shake = s.shake ?? 0, sx = shake ? Math.sin(t * 90) * shake : 0, sy = shake ? Math.cos(t * 77) * shake : 0;
  const fade = ramp(t, T.fade, EXODO_DURATION - .2), open = 1 - ramp(t, 0, .5);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`E se a humanidade precisasse abandonar a Terra, cena ${f.scene.id}`} className="animation-canvas gelo-film exodo-film" data-shot={f.shot}>
    <defs>
      <clipPath id="ex-clip"><rect width="540" height="960"/></clipPath>
      {SKIES.map(k => <linearGradient key={k} id={`gl-sky-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset=".3" className={`gl-${k}-top`}/><stop offset=".43" className={`gl-${k}-mid`}/><stop offset=".55" className={`gl-${k}-low`}/></linearGradient>)}
      {EX_SKIES.map(k => <linearGradient key={k} id={`gl-sky-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset=".15" className={`ex-${k}-top`}/><stop offset=".45" className={`ex-${k}-mid`}/><stop offset=".7" className={`ex-${k}-low`}/></linearGradient>)}
      <radialGradient id="gl-sun-glow"><stop offset="0" className="gl-glow-in"/><stop offset="1" className="gl-glow-out"/></radialGradient>
      <radialGradient id="gl-atmo"><stop offset=".8" className="gl-atmo-in"/><stop offset=".86" className="gl-atmo-mid"/><stop offset="1" className="gl-atmo-out"/></radialGradient>
      <radialGradient id="gl-earth-shade" cx=".35" cy=".35" r=".75"><stop offset=".45" className="gl-shade-in"/><stop offset="1" className="gl-shade-out"/></radialGradient>
      <radialGradient id="gl-vig" r=".75"><stop offset=".5" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient>
      <radialGradient id="ex-nw-atmo"><stop offset=".8" className="ex-nw-atmo-in"/><stop offset=".87" className="ex-nw-atmo-mid"/><stop offset="1" className="ex-nw-atmo-out"/></radialGradient>
      <radialGradient id="ex-haze-glow"><stop offset="0" className="ex-haze-in"/><stop offset="1" className="ex-haze-out"/></radialGradient>
      <radialGradient id="ex-fire-glow"><stop offset="0" className="ex-fireglow-in"/><stop offset="1" className="ex-fireglow-out"/></radialGradient>
      <radialGradient id="ex-red-glow"><stop offset="0" className="ex-redglow-in"/><stop offset="1" className="ex-redglow-out"/></radialGradient>
      <radialGradient id="ex-lamp-glow"><stop offset="0" className="ex-lampglow-in"/><stop offset="1" className="ex-lampglow-out"/></radialGradient>
      <radialGradient id="ex-moon-glow"><stop offset=".4" className="ex-moonglow-in"/><stop offset="1" className="ex-moonglow-out"/></radialGradient>
      <radialGradient id="ex-dot-glow"><stop offset="0" className="ex-dotglow-in"/><stop offset="1" className="ex-dotglow-out"/></radialGradient>
      <radialGradient id="ex-flare"><stop offset="0" className="ex-flare-in"/><stop offset="1" className="ex-flare-out"/></radialGradient>
      <radialGradient id="ex-neb-a"><stop offset="0" className="ex-neba-in"/><stop offset="1" className="ex-neba-out"/></radialGradient>
      <radialGradient id="ex-neb-b"><stop offset="0" className="ex-nebb-in"/><stop offset="1" className="ex-nebb-out"/></radialGradient>
      <radialGradient id="ex-spot-grad"><stop offset=".55" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient>
      <radialGradient id="ex-tv-light" cx=".85" cy=".5" r=".9"><stop offset="0" className="ex-tvlight-in"/><stop offset="1" className="ex-tvlight-out"/></radialGradient>
      <radialGradient id="ex-window-light" cx=".6" cy=".35" r=".8"><stop offset="0" className="ex-winlight-in"/><stop offset="1" className="ex-winlight-out"/></radialGradient>
      <radialGradient id="ex-torch-light" cx=".7" cy=".75" r=".8"><stop offset="0" className="ex-torchlight-in"/><stop offset="1" className="ex-torchlight-out"/></radialGradient>
      <radialGradient id="ex-fire-light" cx=".5" cy="1" r="1"><stop offset="0" className="ex-firelight-in"/><stop offset="1" className="ex-firelight-out"/></radialGradient>
      <linearGradient id="ex-sunrise" x1="0" y1="1" x2="0" y2="0"><stop offset="0" className="ex-sunrise-in"/><stop offset=".7" className="ex-sunrise-out"/></linearGradient>
      <linearGradient id="ex-scan-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="ex-scanfade-out"/><stop offset="1" className="ex-scanfade-in"/></linearGradient>
    </defs>
    <rect width="540" height="960" className="gl-base"/>
    <g clipPath="url(#ex-clip)"><g transform={`translate(${sx} ${sy})`}><g transform={s.cam ?? ''}>{s.el}</g></g>
      {(s.night ?? 0) > 0 && <rect width="540" height="960" className="gl-night" opacity={s.night}/>}
      {(s.red ?? 0) > 0 && <rect width="540" height="960" className="ex-red-wash" opacity={s.red}/>}
      {(s.blue ?? 0) > 0 && <rect width="540" height="960" className="ex-blue-wash" opacity={s.blue}/>}
    </g>
    <rect width="540" height="960" fill="url(#gl-vig)" opacity={s.vig ?? .38}/>
    {(s.flash ?? 0) > 0 && <rect width="540" height="960" className="gl-flash" opacity={Math.min(1, s.flash ?? 0)}/>}
    {open > 0 && <rect width="540" height="960" className="tp-black" opacity={open}/>}
    {fade > 0 && <rect width="540" height="960" className="tp-black" opacity={fade}/>}
  </svg>;
}
