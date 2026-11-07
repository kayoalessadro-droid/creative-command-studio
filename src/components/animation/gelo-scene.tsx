import type { ReactNode } from 'react';
import { getGeloFrame, ramp, lin, clamp, ease, T } from '@/lib/gelo-timeline';
import { rnd } from './ice';
import {
  z, mix, Water, waveLine, Sky, Stars, Aurora, Snow, Rain, Bolt, Cloud, Sun, Mountains, IceShelf, Iceberg, Penguin, Crack, Splash,
  Tower, Palm, Umbrella, Car, House, Tree, Boat, Person, headOf, Earth, MapSheet,
} from './gelo-world';

type Shot = { el: ReactNode; cam?: string; shake?: number; flash?: number; vig?: number; night?: number; tint?: number };

/* ---------- Scene 01: Antarctica ---------- */
function Floe({ x, y, w = 150 }: { x: number; y: number; w?: number }) {
  return <g><path d={`M${x - w / 2} ${y}Q${x - w / 2 + 10} ${y - 16} ${x} ${y - 18}Q${x + w / 2 - 6} ${y - 16} ${x + w / 2} ${y}Q${x} ${y + 14} ${x - w / 2} ${y}Z`} className="gl-ice-top"/><path d={`M${x - w / 2} ${y}Q${x} ${y + 14} ${x + w / 2} ${y}L${x + w / 2 - 12} ${y + 12}Q${x} ${y + 24} ${x - w / 2 + 10} ${y + 10}Z`} className="gl-ice-face"/></g>;
}
function glacierWide(t: number, m = 0, extra: ReactNode = null): ReactNode {
  return <>
    <Mountains y={480} far snow={1 - m * 1.4}/>
    <IceShelf x0={-120} x1={480 - m * 220} top={455} base={612 - m * 10} thin={m * 95}/>
    <Water y={612 - m * 22} t={t} amp={4}/>
    <Iceberg x={440 + m * 120} y={650} s={.8} t={t} seed={2}/>
    <Iceberg x={60 - m * 60} y={700} s={.5} t={t} seed={5}/>
    {extra}
  </>;
}
function shot0(t: number): Shot {
  const crack = lin(t, T.melt, T.melt + .7) * .45;
  return { cam: z(280, 580, 1.08 + lin(t, 0, 3.6) * .12), el: <>
    <Sky kind="polar"/><Stars t={t} op={.7}/><Aurora t={t} y={160}/>
    {glacierWide(t, 0, <Crack x={300} y0={455} y1={612} p={crack} seed={4}/>)}
    <Floe x={140} y={800} w={210}/>
    {[90, 130, 175].map((x, i) => <Penguin key={x} x={x} y={790} s={.9} t={t + i} look={t > T.melt ? 18 : 0}/>)}
    <Iceberg x={440} y={860} s={1.6} t={t} seed={8}/>
    <Snow t={t} n={36} wind={25}/>
  </> };
}
function shot1(t: number): Shot {
  const p = lin(t, 3.6, 5.8), pan = p * 160;
  const rows = Array.from({ length: 12 }, (_, i) => { const y = 340 + i * i * 4.6, sp = .2 + i * .14; let d = ''; for (let x = -100; x <= 660; x += 30) d += `${d ? 'L' : 'M'}${x} ${(y + Math.sin((x + pan * sp * 4) * (.02 - i * .0008) + i) * (2 + i * .6)).toFixed(1)}`; return <path key={i} d={d} className="gl-sastrugi" opacity={.35 + i * .04}/>; });
  return { cam: z(270, 480, 1.25 - ease(p) * .3), el: <>
    <Sky kind="polar"/><Sun x={420} y={300} r={26} cls="gl-sun-cold"/>
    <Mountains y={350} far t={pan * .3}/>
    <rect x="-400" y="330" width="1400" height="900" fill="url(#gl-plain)"/>
    {rows}
    {[[120, 420, .5], [380, 460, .8], [-40, 520, 1.1], [600, 560, 1.3]].map(([x, y, s], i) => <path key={i} transform={`translate(${(x ?? 0) - pan * (s ?? 1)} ${y}) scale(${s})`} d="M-50 0L-18 -46L2 -28L22 -60L54 0Z" className="gl-rock"/>)}
    <Snow t={t} n={50} wind={160} amount={.8}/>
  </> };
}
function shot2(t: number): Shot {
  const p = ease(lin(t, 6.0, 9.7)), cy = mix(470, 1860, p);
  const bands = Array.from({ length: 16 }, (_, i) => <path key={i} d={`M-100 ${2400}L` + waveLine(340 + i * 100, 0, 10 + i, .012, 0, -100, 640).slice(1) + 'L640 2400Z'} className={i % 2 ? 'gl-band-a' : 'gl-band-b'}/>);
  return { cam: z(270, cy, 1), el: <>
    <Sky kind="polar"/><Aurora t={t} y={120} op={.5}/>
    {bands}
    <rect x="-100" y="330" width="740" height="1600" fill="url(#gl-ice-depth)"/>
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(3, i) * 540} cy={420 + rnd(4, i) * 1450} r={2 + rnd(5, i) * 4} className="gl-bubble"/>)}
    <path d="M-100 2400L-100 1930L20 1880L90 1915L170 1860L260 1905L340 1850L430 1900L520 1870L640 1920L640 2400Z" className="gl-rock"/>
    <ellipse cx="300" cy="1885" rx="110" ry="14" className="gl-lake" opacity={.6 + .3 * Math.sin(t * 3)}/>
    <path d="M40 340V1880" className="gl-measure"/>
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M40 ${340 + i * 96}h${i % 4 ? 12 : 26}`} className="gl-measure-tick"/>)}
    <path d="M-100 340H640" className="gl-surface-line"/>
    <path d="M300 340L318 306L336 340Z" className="gl-tent"/><path d="M370 340V296" className="gl-pole"/><path d="M370 298L392 305L370 312Z" className="gl-flag"/>
    <Person x={262} g={340} s={.12} t={t} scope="gl-p2" shadow={false} backpack={false}/>
    <Snow t={t} n={20} wind={40} amount={1 - p}/>
  </> };
}
function shot3(t: number): Shot {
  const cp = lin(t, T.crack, T.wall + .2), fp = ease(lin(t, T.tip, 14.25)), sp = lin(t, 14.15, 14.75);
  const shake = t > T.tip && t < 14.2 ? 1.6 : t >= 14.2 ? 8 * (1 - sp) : 0;
  const debris = cp > 0 && fp < 1 ? Array.from({ length: 10 }, (_, i) => { const ph = (t * .9 + rnd(2, i)) % 1; return <circle key={i} cx={330 + (rnd(3, i) - .5) * 30} cy={260 + ph * 440} r={2 + rnd(4, i) * 3} className="gl-ice-top" opacity={(1 - ph) * cp}/>; }) : null;
  const flee = t > 13.5 ? (t - 13.5) * 70 : 0;
  return { shake, cam: z(300, 470, 1.04 + lin(t, 9.9, 13.3) * .14 - fp * .1), el: <>
    <Sky kind="polar"/><Stars t={t} op={.5}/><Aurora t={t} y={90} op={.6}/>
    <Mountains y={260} far/>
    <IceShelf x0={-80} x1={336} top={240} base={700} seed={7}/>
    <g transform={`translate(${fp * 40} ${fp * fp * 300}) rotate(${fp * 24} 600 700)`}><IceShelf x0={326} x1={640} top={240} base={700} seed={9}/></g>
    <Crack x={331} y0={240} y1={700} p={cp} seed={6} w={30}/>
    {debris}
    <Water y={700} t={t} amp={4 + sp * 8}/>
    <Splash x={480} y={704} p={sp} s={1.7}/>
    <Floe x={150} y={850} w={230}/>
    {[100, 145, 195].map((x, i) => <Penguin key={x} x={x - flee * (1 + i * .2)} y={840} s={1.05} t={t + i} look={t > T.crack ? -24 : 0} hop={t > 13.5 ? 6 : 0} flip={t > 13.5}/>)}
    <Snow t={t} n={28} wind={20}/>
  </> };
}

/* ---------- Scene 02: centuries of melt ---------- */
function shot4(t: number): Shot {
  const k = t - 14.75, ph = k * .45 + k * k * .32, fr = ph % 1;
  const day = fr < .55 ? Math.sin(Math.PI * fr / .55) : 0, m = lin(t, 14.75, 19.1) * .55;
  const sa = Math.PI * Math.min(1, fr / .55);
  return { night: (1 - day) * .35, cam: z(270, 520, 1.02), el: <>
    <Sky kind="night"/><Stars t={t} op={1 - day}/><Sky kind="day" op={day}/><Aurora t={t} op={(1 - day) * .7}/>
    {fr < .55 && <Sun x={270 - Math.cos(sa) * 330} y={470 - Math.sin(sa) * 330} r={30}/>}
    {[0, 1, 2, 3].map(i => <Cloud key={i} x={((k * (220 + i * 60) + i * 230) % 900) - 160} y={170 + i * 55} s={.7 + i * .15}/>)}
    {glacierWide(t * 4, m)}
    <Floe x={150} y={800} w={210}/>
  </> };
}
function shot5(t: number): Shot {
  const p = lin(t, 19.1, 22.5), down = ease(lin(t, T.fall - .3, 22.2));
  const rivers = [[40, 110], [210, 290], [360, 430]].map(([a, b], i) => <g key={i}>
    <path d={`M${(a ?? 0) - 60} 384Q${a} 420 ${b} 474`} className="gl-river-bed"/>
    <path d={`M${(a ?? 0) - 60} 384Q${a} 420 ${b} 474`} className="gl-river" strokeDashoffset={-t * 90}/>
  </g>);
  const falls = [110, 290, 430].map((x, i) => <g key={i}>
    <path d={`M${x - 16} 474Q${x - 20} 600 ${x - 26} 770L${x + 26} 770Q${x + 20} 600 ${x + 16} 474Z`} className="gl-fall"/>
    {[0, 1, 2, 3].map(j => <path key={j} d={`M${x - 12 + j * 8} 480Q${x - 14 + j * 8} 620 ${x - 18 + j * 10} 768`} className="gl-fall-streak" strokeDashoffset={-t * 260 - j * 30}/>)}
    {[0, 1, 2].map(j => { const ph = (t * .8 + j / 3 + i * .2) % 1; return <ellipse key={j} cx={x + (j - 1) * 20} cy={770 - ph * 60} rx={30 + ph * 40} ry={14 + ph * 16} className="gl-mist" opacity={(1 - ph) * .8}/>; })}
  </g>);
  return { cam: z(mix(180, 300, p), mix(450, 640, down), mix(1.4, 1.05, down)), el: <>
    <Sky kind="day"/><Sun x={420} y={160} r={34}/>
    <Mountains y={380} far snow={.4}/>
    <path d="M-200 474L740 474L740 380L-200 380Z" className="gl-ice-top"/>
    {[[60, 430, 30], [250, 410, 22], [470, 440, 26]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={(r ?? 0) * .3} className="gl-pond"/>)}
    {rivers}
    <IceShelf x0={-200} x1={740} top={474} base={770} seed={12}/>
    {falls}
    <Water y={770} t={t} amp={5}/>
  </> };
}
function shot6(t: number): Shot {
  const y = mix(730, 600, ease(lin(t, 22.5, 24.1)));
  const hits = [22.9, 23.6].map((a, i) => <Splash key={i} x={150 + i * 230} y={y - 10} p={lin(t, a, a + .7)} s={.7} seed={i + 3}/>);
  return { cam: z(270, 560, 1.05 + lin(t, 22.5, 24.15) * .05), el: <>
    <Sky kind="storm" op={.5}/><Sky kind="day" op={.5}/>
    {[0, 1].map(i => <Cloud key={i} x={120 + i * 260 + t * 8} y={180 + i * 40} s={1 + i * .3} cls="gl-cloud-grey"/>)}
    <path d="M300 640L320 450H372L392 640Z" className="gl-light-tower"/><path d="M314 520H378M308 580H384" className="gl-light-band"/><rect x="322" y="420" width="48" height="32" className="gl-light-top"/><path d="M316 420L346 396L376 420Z" className="gl-roof-a"/>
    <path d="M-100 960L-100 640L60 600L160 650L260 610L420 640L560 600L640 960Z" className="gl-rock"/>
    <path d="M-100 700L80 660L200 700L300 670L460 700L640 680L640 960L-100 960Z" className="gl-rock-dark"/>
    <Water y={y} t={t} amp={8}/>
    {hits}
  </> };
}
function shot7(t: number): Shot {
  const wl = t < T.meters ? mix(780, 752, ease(lin(t, 24.3, 26.2))) : mix(752, 430, ease(lin(t, T.meters, 27.75)));
  const fly = lin(t, 26.9, 27.8);
  const gull = <g transform={`translate(${360 + fly * 260} ${448 - fly * 300 - Math.sin(fly * 3) * 20})`}>
    <ellipse rx="16" ry="8" className="gl-gull"/><circle cx="14" cy="-6" r="6" className="gl-gull"/><path d="M19 -6l8 2" className="gl-gull-beak"/>
    <path d={`M-6 -2Q-20 ${fly > 0 ? -20 - Math.sin(t * 20) * 14 : -6} -34 ${fly > 0 ? -10 - Math.sin(t * 20) * 16 : 0}`} className="gl-gull-wing"/>
  </g>;
  return { cam: z(270, mix(600, 520, lin(t, T.meters, 27.8)), 1.12), el: <>
    <Sky kind="day"/><Cloud x={120} y={180}/><Cloud x={420} y={250} s={.8}/>
    <path d="M-100 620H640" className="gl-horizon"/>
    <rect x="-100" y="620" width="740" height="400" className="gl-sea-back"/>
    {[110, 270, 430].map(x => <g key={x}><rect x={x - 16} y={460} width="32" height="520" className="gl-wood"/>{[0, 1, 2, 3, 4].map(i => <rect key={i} x={x - 16} y={560 + i * 70} width="32" height="10" className="gl-tide-mark"/>)}<path d={`M${x - 16} ${770}h32`} className="gl-barnacle"/></g>)}
    <rect x="-100" y="442" width="740" height="22" className="gl-wood-dark"/>
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-90 + i * 54} 442v22`} className="gl-plank"/>)}
    {fly < 1 && gull}
    <Water y={wl} t={t} amp={5}/>
  </> };
}
function shot8(t: number): Shot {
  const rise = ease(lin(t, 27.9, 33.55)), wl = mix(1400, 712, rise);
  const back = ease(lin(t, 33.45, 34.6));
  const neighbours = [[-60, 6, 'gl-bld-b'], [400, 9, 'gl-bld-c'], [500, 4, 'gl-bld-b']] as const;
  return { night: rise * .25, shake: t > 33.55 && t < 34.2 ? 3 : 0, cam: back > 0 ? z(270, mix(wl - 40, 860, back), mix(1.3, .62, back)) : z(270, wl - 40, 1.3), el: <>
    <Sky kind="storm" op={rise}/><Sky kind="day" op={1 - rise}/>
    {[0, 1, 2].map(i => <Cloud key={i} x={60 + i * 220 + t * 6} y={480 + i * 40} s={1.4} cls="gl-cloud-grey"/>)}
    {neighbours.map(([x, f, c]) => <Tower key={x} x={x} base={1400} w={110} floors={f} fh={34} cls={c}/>)}
    <Tower x={170} base={1400} w={200} floors={20} fh={34} cls="gl-bld-a" cols={6} roof={1}/>
    <Water y={wl} t={t} amp={7 + rise * 6} bottom={3000}/>
    <Splash x={270} y={716} p={lin(t, 33.55, 34.5)} s={1.6} seed={11}/>
  </> };
}

/* ---------- Scene 03: cities ---------- */
const SKY_TOWERS: Array<[number, number, number, string]> = [[-30, 70, 9, 'gl-bld-b'], [40, 60, 14, 'gl-bld-c'], [100, 80, 11, 'gl-bld-a'], [180, 64, 17, 'gl-bld-b'], [244, 76, 12, 'gl-bld-c'], [320, 60, 15, 'gl-bld-a'], [380, 84, 10, 'gl-bld-b'], [464, 66, 13, 'gl-bld-c'], [530, 80, 9, 'gl-bld-a']];
function coastCity(t: number, wl: number, drift = 0): ReactNode {
  const floatK = clamp((640 - wl) / 30);
  return <>
    {SKY_TOWERS.map(([x, w, f, c], i) => <Tower key={i} x={x} base={606} w={w} floors={f} fh={22} cls={c} seed={i} roof={i % 3 === 0 ? 2 : 0}/>)}
    <rect x="-300" y="600" width="1200" height="20" className="gl-walk"/>
    <rect x="-300" y="620" width="1200" height="34" className="gl-road"/>
    <path d="M-300 637H900" className="gl-road-line"/>
    {[-100, 30, 200, 380, 560].map((x, i) => <Car key={x} x={x + ((t * (i % 2 ? -40 : 50) - drift) % 900 + 900) % 900 - 300} y={wl < 640 ? Math.min(650, wl + 6) : 650} s={.55} cls={i % 2 ? 'gl-car-b' : 'gl-car-a'} rot={wl < 640 ? Math.sin(t * 2 + i) * 8 * floatK : 0}/>)}
    {[-40, 120, 290, 450].map((x, i) => <Palm key={x} x={x} y={604} s={.8} sway={Math.sin(t * 1.5 + i) * 4}/>)}
    <path d="M-300 654H900L900 1500L-300 1500Z" className="gl-sand"/>
    <path d="M-300 790H900V1500H-300Z" className="gl-sand-wet"/>
    {[[40, 'gl-umb-a'], [150, 'gl-umb-b'], [260, 'gl-umb-a'], [380, 'gl-umb-b'], [490, 'gl-umb-a']].map(([x, c], i) => <Umbrella key={i} x={Number(x)} y={wl < 700 ? wl + 4 : 712 + (i % 2) * 18} cls={String(c)} tilt={wl < 700 ? 30 + Math.sin(t * 2 + i) * 15 : 0}/>)}
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={20 + i * 52 + Math.sin(t + i) * 6} cy={wl > 720 ? 740 + (i % 3) * 10 : -50} r="4" className="gl-person-dot"/>)}
    <Water y={wl} t={t} amp={wl < 700 ? 6 : 4}/>
  </>;
}
function shot9(t: number): Shot {
  const p = lin(t, 34.75, 39.15);
  return { tint: ramp(t, 37.2, 39.1) * .35, cam: z(270 + p * 30, 560, 1 + p * .08), el: <>
    <Sky kind="day"/><Sun x={430} y={200} r={36}/>
    {[0, 1, 2].map(i => <Cloud key={i} x={(t * 12 + i * 220) % 760 - 100} y={150 + i * 70} s={.8 + i * .2}/>)}
    {coastCity(t, 790)}
  </> };
}
function shot10(t: number): Shot {
  const wl = t < T.avenues ? mix(790, 662, ease(lin(t, 39.2, 40.6))) : mix(662, 606, ease(lin(t, T.avenues, 41.8)));
  return { tint: .35, cam: z(250 + lin(t, 39.15, 42) * 40, 600, 1.3), el: <>
    <Sky kind="storm" op={.55}/><Sky kind="day" op={.45}/>
    {[0, 1].map(i => <Cloud key={i} x={(t * 14 + i * 300) % 760 - 100} y={300 + i * 60} s={1.2} cls="gl-cloud-grey"/>)}
    {coastCity(t, wl)}
  </> };
}
function street(t: number, wl: number, front: number, storm: number): ReactNode {
  const shops = [[-60, 'gl-bld-c', 6], [100, 'gl-bld-a', 8], [250, 'gl-bld-b', 7], [400, 'gl-bld-c', 9]] as const;
  const carRise = clamp((800 - wl) / 120), carX = 300 + (front > 640 ? (t - 43.0) * 26 : 0);
  return <>
    {shops.map(([x, c, f], i) => <g key={i}><Tower x={x} base={770} w={150} floors={f} fh={60} cls={c} cols={3} seed={i + 4} lit={storm * .3}/>
      <rect x={x + 18} y={700} width={58} height={70} className="gl-shop"/><rect x={x + 92} y={706} width={36} height={64} className="gl-door"/>
      <path d={`M${x + 10} 690H${x + 140}L${x + 130} 676H${x + 20}Z`} className={i % 2 ? 'gl-umb-a' : 'gl-umb-b'}/></g>)}
    <rect x="-300" y="770" width="1200" height="26" className="gl-walk"/>
    <rect x="-300" y="796" width="1200" height="200" className="gl-road"/>
    <path d="M-300 870H900" className="gl-road-dash"/>
    <path d="M120 790V560" className="gl-pole"/><path d="M120 560Q140 548 160 556" className="gl-pole"/><circle cx="162" cy="560" r="8" className={storm > 0 ? 'gl-win-lit' : 'gl-win'}/>
    <path d="M430 790V600" className="gl-pole"/><rect x="418" y="560" width="24" height="56" rx="5" className="gl-signal"/><circle cx="430" cy="574" r="6" className="gl-sig-red"/><circle cx="430" cy="600" r="6" className="gl-sig-off"/>
    <Palm x={-20} y={790} s={1.3} sway={storm * -30 + Math.sin(t * 3) * 4 * (1 + storm * 3)}/>
    <Car x={carX} y={mix(830, wl + 14, carRise)} s={1.1} cls="gl-car-a" rot={carRise * Math.sin(t * 2) * 10}/>
    <g transform={`translate(${-600 + front} 0)`}>
      <path d={wavePathLocal(wl, t, 7 + storm * 6)} className="gl-sea"/>
      <path d={`M599 ${wl}Q${610 + Math.sin(t * 8) * 3} ${wl - 18} 620 ${wl + 6}Q650 ${(wl + 830) / 2} 700 834L700 1300H599Z`} className="gl-sea"/>
      <path d={`M586 ${wl - 4}Q${610 + Math.sin(t * 8) * 3} ${wl - 20} 620 ${wl + 4}Q652 ${(wl + 830) / 2} 702 832`} className="gl-foam-edge"/>
      {Array.from({ length: 9 }, (_, i) => { const ph = (t * 1.6 + i / 9) % 1; return <circle key={i} cx={590 + i * 12 + ph * 30} cy={wl - 10 - Math.sin(Math.PI * ph) * 40 + i * 8} r={3 + (i % 3) * 2} className="gl-foam" opacity={1 - ph}/>; })}
    </g>
  </>;
}
const wavePathLocal = (y: number, t: number, amp: number) => `M-600 1300L` + waveLine(y, t, amp, .04, 2.2, -600, 600).slice(1) + `L600 1300Z`;
function shot11(t: number): Shot {
  const front = mix(0, 1200, ease(lin(t, 42.0, 43.3)));
  const wl = t < T.surround ? mix(860, 790, lin(t, 42.0, 43.6)) : mix(790, 690, ease(lin(t, T.surround, 44.9)));
  return { tint: .3, shake: t > 42.2 && t < 43.2 ? 1.5 : 0, cam: z(270, 640, 1.08), el: <>
    <Sky kind="storm"/>
    {street(t, wl, front, 0)}
  </> };
}
function shot12(t: number): Shot {
  const b1 = 1 - lin(t, 45.35, 45.6), b2 = 1 - lin(t, 46.6, 46.85);
  const flash = (t > 45.35 ? b1 : 0) * .7 + (t > 46.6 ? b2 : 0) * .7;
  return { night: .45, flash, shake: 1.2, cam: z(260, 620, 1.12 + lin(t, 45, 47.5) * .08), el: <>
    <Sky kind="storm"/>
    {[0, 1, 2].map(i => <Cloud key={i} x={(t * 40 + i * 240) % 800 - 140} y={170 + i * 60} s={1.6} cls="gl-cloud-dark"/>)}
    <Bolt x={350} y={120} h={420} seed={3} op={t > 45.35 ? b1 : 0}/><Bolt x={140} y={100} h={380} seed={8} op={t > 46.6 ? b2 : 0}/>
    {street(t, 690 + Math.sin(t * 2) * 6, 1200, 1)}
    {[0, 1, 2].map(i => <Splash key={i} x={60 + i * 180} y={690} p={((t - 45) * .9 + i * .33) % 1} s={.6} seed={i + 20}/>)}
    <Rain t={t} n={90} slant={14}/>
  </> };
}
function landmark(t: number, kind: 'rio' | 'ny' | 'sh', a: number): Shot {
  const p = lin(t, a, a + 1.05), wl = 640;
  const towers = kind === 'ny' ? [[260, 60, 22], [330, 50, 30], [390, 70, 18], [470, 54, 26], [20, 60, 16]] : kind === 'sh' ? [[20, 56, 20], [90, 50, 24], [380, 60, 30], [460, 60, 20]] : [[160, 40, 8], [210, 46, 10], [260, 40, 7]];
  return { night: .3, tint: .2, cam: z(270, 520, 1 + p * .1), el: <>
    <Sky kind="storm"/><Sky kind="sunset" op={.35}/>
    <Cloud x={120 + t * 8} y={170} s={1.6} cls="gl-cloud-dark"/><Cloud x={420 - t * 6} y={230} s={1.3} cls="gl-cloud-dark"/>
    {towers.map(([x, w, f], i) => <Tower key={i} x={x ?? 0} base={900} w={w ?? 50} floors={f ?? 10} fh={22} cls={i % 2 ? 'gl-bld-dusk' : 'gl-bld-dusk2'} seed={i} roof={i === 1 ? 1 : 0}/>)}
    {kind === 'rio' && <>
      <path d="M-120 700L-40 420Q30 300 110 410L200 700Z" className="gl-hill-dusk"/>
      <g transform="translate(36 336)"><rect x="-4" y="-50" width="8" height="54" className="gl-statue"/><rect x="-34" y="-42" width="68" height="8" rx="3" className="gl-statue"/><circle cy="-58" r="7" className="gl-statue"/><path d="M-10 4H10L14 16H-14Z" className="gl-statue"/></g>
      <path d="M320 700Q330 520 400 500Q450 520 450 700Z" className="gl-hill-dusk"/>
      <path d="M430 700Q440 420 500 400Q560 430 570 700Z" className="gl-hill-dusk"/>
      <path d="M400 500L500 402" className="gl-cable"/>
    </>}
    {kind === 'ny' && <g transform="translate(150 380)">
      <path d="M-50 400L-40 170H40L50 400Z" className="gl-pedestal"/>
      <path d="M-22 170L-16 40Q0 26 16 40L24 170Z" className="gl-liberty"/>
      <path d="M8 46L26 -42L36 -40L20 50Z" className="gl-liberty"/><path d="M24 -40L40 -38L36 -62Q30 -70 26 -60Z" className="gl-torch"/>
      <circle cx="0" cy="26" r="13" className="gl-liberty"/>
      {[-60, -30, 0, 30, 60].map(a => <path key={a} d="M0 20L0 2" transform={`rotate(${a} 0 26)`} className="gl-liberty-ray"/>)}
      <path d="M-18 70L-30 110L-14 112Z" className="gl-liberty"/>
    </g>}
    {kind === 'sh' && <g transform="translate(240 900)">
      <path d="M-30 0L-6 -300H6L30 0Z" className="gl-pearl-leg"/><path d="M-4 -300V-560" className="gl-pearl-shaft"/>
      <circle cy="-260" r="46" className="gl-pearl"/><circle cy="-470" r="28" className="gl-pearl"/><circle cy="-540" r="10" className="gl-pearl"/>
      <path d="M-2 -560V-640" className="gl-antenna"/>
    </g>}
    <Water y={wl} t={t} amp={8}/>
    <Rain t={t} n={50} amount={.7} slant={10}/>
  </> };
}
function shot16(t: number): Shot {
  const p = lin(t, 50.5, 53.05);
  const rows: Array<[number, number, number, number]> = [[520, .45, 9, 2], [640, .75, 7, 3], [800, 1.15, 5, 4]];
  return { night: .3, tint: .25, cam: z(240 + p * 70, 500, 1.04), el: <>
    <Sky kind="storm"/>
    {[0, 1, 2].map(i => <Cloud key={i} x={(t * 20 + i * 250) % 800 - 140} y={150 + i * 50} s={1.5} cls="gl-cloud-dark"/>)}
    <path d="M-200 430H900" className="gl-horizon"/>
    <Water y={430} t={t * .6} amp={3} foam={false}/>
    {rows.map(([y, k, n, seed]) => Array.from({ length: n }, (_, i) => {
      const w = (40 + rnd(seed, i) * 50) * k, h = (14 + rnd(seed + 1, i) * 50) * k, x = -160 + i * (760 / n) + rnd(seed + 2, i) * 30;
      const bob = Math.sin(t * 2 + i + seed);
      return <g key={`${y}-${i}`}>
        <rect x={x} y={y - h} width={w} height={h} className={i % 2 ? 'gl-bld-dusk' : 'gl-bld-dusk2'}/>
        {Array.from({ length: Math.max(1, Math.floor(w / (18 * k))) }, (_, c) => <rect key={c} x={x + 6 * k + c * 18 * k} y={y - h + 8 * k} width={8 * k} height={8 * k} className={rnd(seed + 5, i * 7 + c) > .8 ? 'gl-win-lit' : 'gl-win-dim'}/>)}
        {rnd(seed + 3, i) > .55 && <path d={`M${x + w / 2} ${y - h}V${y - h - 26 * k}`} className="gl-antenna"/>}
        <path d={`M${x - 14 * k} ${y + bob * 1.5}Q${x + w / 2} ${y + 9 * k} ${x + w + 14 * k} ${y - bob * 1.5}`} className="gl-ripple"/>
      </g>;
    }))}
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={(i * 97 + t * 12) % 640 - 50} y={560 + i * 46} width={(14 + i * 4)} height="6" className="gl-wood" transform={`rotate(${Math.sin(t + i) * 10} ${(i * 97) % 640} ${560 + i * 46})`}/>)}
    <Rain t={t} n={50} amount={.6}/>
  </> };
}
const SCOPES = ['gl-p1', 'gl-p2', 'gl-p3', 'gl-p4', 'gl-p5'];
function shot17(t: number): Shot {
  const p = lin(t, 53.05, 56.1);
  const slope = (x: number) => 900 - (x + 100) * .52;
  const people = [0, 1, 2, 3, 4].map(i => {
    const x = -40 + i * 95 + (t - 53.05) * 42;
    return <Person key={i} x={x} g={slope(x)} s={i === 2 ? .42 : .48} t={t * 1.1 + i * .7} scope={SCOPES[i] ?? 'gl-p1'} walking expression={i % 2 ? 'scared' : 'curious'} backpack={i !== 3}
      extra={i === 1 || i === 4 ? <rect x="150" y="196" width="46" height="36" rx="5" className="gl-suitcase"/> : null}/>;
  });
  return { night: .25, tint: .25, cam: z(mix(230, 330, p), 600, 1.05), el: <>
    <Sky kind="storm"/><Sky kind="sunset" op={.25}/>
    <path d="M-300 960L-300 980L-100 900L700 484L900 450L900 1200Z" className="gl-grass-dark"/>
    <path d="M-100 900L700 484" className="gl-path-line"/>
    {[160, 420, 600].map((x, i) => <Tree key={x} x={x} y={slope(x) - 14} s={1.2} sway={Math.sin(t * 2 + i) * 4}/>)}
    {people}
    <Water y={mix(930, 900, p)} t={t} amp={6}/>
    <Boat x={60 + (t - 53) * 14} y={mix(934, 904, p)} t={t} s={.9}>
      <Person x={-20} g={22} s={.32} t={t} scope="gl-p3" seated backpack={false} shadow={false} expression="scared"/>
      <Person x={22} g={18} s={.26} t={t + 1} scope="gl-p4" seated backpack={false} shadow={false} expression="curious"/>
    </Boat>
    <Rain t={t} n={40} amount={.5}/>
  </> };
}

/* ---------- Scene 04: Théo ---------- */
function goldenBack(t: number, seaY = 640): ReactNode {
  return <>
    <Sky kind="gold"/><Sun x={120} y={seaY - 70} r={46} cls="gl-sun-gold"/>
    {[0, 1].map(i => <Cloud key={i} x={(t * 6 + i * 300) % 760 - 80} y={200 + i * 80} s={1.2} cls="gl-cloud-gold"/>)}
    <rect x="-400" y={seaY} width="1400" height="900" className="gl-sea-gold"/>
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${100 + Math.sin(t * 2 + i) * 10 - i * 4} ${seaY + 10 + i * 14}h${40 + i * 12}`} className="gl-glitter" opacity={.5 + .5 * Math.sin(t * 4 + i)}/>)}
    <path d={`M330 ${seaY}Q380 ${seaY - 40} 440 ${seaY}Z`} className="gl-island"/><path d={`M-60 ${seaY}Q0 ${seaY - 30} 60 ${seaY}Z`} className="gl-island"/>
    <rect x="470" y={seaY - 34} width="14" height="34" className="gl-bld-dusk"/><rect x="490" y={seaY - 20} width="12" height="20" className="gl-bld-dusk2"/>
  </>;
}
function Grass({ x0, x1, y, t, n = 24 }: { x0: number; x1: number; y: (x: number) => number; t: number; n?: number }) {
  return <g>{Array.from({ length: n }, (_, i) => { const x = x0 + (x1 - x0) * i / n + rnd(3, i) * 10, yy = y(x), h = 10 + rnd(4, i) * 14, sw = Math.sin(t * 3 + i * .7) * 5;
    return <path key={i} d={`M${x} ${yy}Q${x + sw * .5} ${yy - h * .6} ${x + sw} ${yy - h}`} className="gl-blade"/>; })}</g>;
}
function shot18(t: number): Shot {
  const k = t - 56.1, close = ease(lin(t, 57.6, 59.4)), ox = -k * 50;
  const ground = (x: number) => 820 - Math.sin((x - ox) * .006) * 26;
  const [hx, hy] = headOf(250, ground(250), 1.0);
  return { cam: close > 0 ? z(mix(270, hx, close), mix(560, hy + 70, close), mix(1, 1.45, close)) : z(270, 560, 1), el: <>
    {goldenBack(t, 600)}
    <path d={`M-300 1200L-300 ${ground(-300)}` + Array.from({ length: 30 }, (_, i) => { const x = -300 + i * 40; return `L${x} ${ground(x).toFixed(1)}`; }).join('') + 'L900 1200Z'} className="gl-grass"/>
    <Grass x0={-100} x1={640} y={ground} t={t} n={40}/>
    {[60, 470, 760].map(x => <Tree key={x} x={x + ox} y={ground(x + ox) + 4} s={1.4} sway={Math.sin(t * 2 + x) * 5}/>)}
    <Person x={250} g={ground(250)} s={1.0} t={t} walking={t < 59.2} scarf expression="curious" shine={close > .5} gaze={[2, -1]}/>
  </> };
}
function shot19(t: number): Shot {
  const p = ease(lin(t, 59.7, 62.5));
  return { cam: z(270, mix(470, 540, p), mix(2.6, 1, p)), el: <>
    {goldenBack(t, 600)}
    {[[70, 640, 50], [470, 660, 60]].map(([x, y, w], i) => <path key={i} d={`M${(x ?? 0) - (w ?? 0)} ${y}Q${x} ${(y ?? 0) - 44} ${(x ?? 0) + (w ?? 0)} ${y}Z`} className="gl-island"/>)}
    <path d="M60 760Q170 620 270 610Q370 620 480 760Z" className="gl-grass"/>
    <Tree x={350} y={640} s={.6} sway={Math.sin(t * 2) * 3}/>
    <Person x={262} g={613} s={.2} t={t} scarf expression="curious" backpack/>
    <Water y={720} t={t} amp={4} foam/>
    {[120, 420].map((x, i) => <g key={x}><rect x={x} y={760 - 30 - i * 10} width="22" height={30 + i * 10} className="gl-bld-dusk"/><path d={`M${x - 8} 760Q${x + 11} 766 ${x + 30} 760`} className="gl-ripple"/></g>)}
  </> };
}
function shot20(t: number): Shot {
  const flood = ease(lin(t, 65.6, 66.9)), wl = mix(930, 692, flood), memory = 1 - flood;
  const houses = [[200, 760], [260, 790], [330, 770], [420, 800], [480, 760], [300, 840], [390, 860], [180, 850]];
  return { tint: memory * .2, cam: z(300 + lin(t, 62.75, 67.4) * 20, 600, 1.05), el: <>
    <Sky kind="memory" op={memory}/><Sky kind="gold" op={flood}/>
    <Sun x={470} y={300} r={36} cls="gl-sun-gold"/>
    <path d="M-100 640Q120 560 300 610Q460 560 700 640V960H-100Z" className="gl-hill-far"/>
    <path d="M-100 700H700V960H-100Z" className="gl-field"/>
    {[0, 1, 2, 3].map(i => <path key={i} d={`M${-100 + i * 200} 700L${-40 + i * 200} 960`} className="gl-field-line"/>)}
    <path d="M540 700Q420 760 340 800Q240 850 200 960" className="gl-road-wide"/><path d="M540 700Q420 760 340 800Q240 850 200 960" className="gl-road-dash"/>
    {houses.map(([x, y], i) => <House key={i} x={x ?? 0} y={y ?? 0} s={.9} cls={i % 2 ? 'gl-house-a' : 'gl-house-b'} roof={i % 2 ? 'gl-roof-a' : 'gl-roof-b'}/>)}
    <g transform="translate(400 700)"><rect x="-16" y="-60" width="32" height="60" className="gl-house-b"/><path d="M-20 -60L0 -96L20 -60Z" className="gl-roof-a"/><path d="M0 -96V-112M-6 -106H6" className="gl-antenna"/></g>
    {[120, 260, 520].map(x => <g key={x}><path d={`M${x} 860V650M${x - 14} 662H${x + 14}`} className="gl-pole"/></g>)}
    {[90, 150, 470, 520].map((x, i) => <Tree key={x} x={x} y={740 + (i % 2) * 30} s={.8}/>)}
    {flood > 0 && <Water y={wl} t={t} amp={4} op={.96}/>}
    <Person x={128} g={1040} s={1.25} t={t} scarf expression={t > T.sea ? 'surprised' : 'curious'} gaze={[4, 3]} shine reach={10} armL={8}/>
  </> };
}
function shot21(t: number): Shot {
  const mapUp = ease(lin(t, 68.4, 69.4));
  return { cam: z(270, 480, 1 + lin(t, 67.4, 70) * .06), el: <>
    {goldenBack(t, 700)}
    <rect x="-100" y="0" width="740" height="960" className="gl-soft" opacity=".25"/>
    <Person x={270} g={1000} s={2.5} t={t} scarf expression="surprised" shine gaze={t > T.map ? [0, 4] : [2, 0]} reach={20} armL={20} shadow={false}/>
    <g transform={`translate(270 ${mix(1150, 880, mapUp)}) scale(.9) rotate(-4)`}><MapSheet flood={0} t={t}/></g>
  </> };
}
function shot22(t: number): Shot {
  const flood = ease(lin(t, 70.0, 70.8)), fly = Math.max(0, t - 70.95);
  return { cam: z(270, 480, 1.04), el: <>
    {goldenBack(t, 560)}
    <rect x="-100" y="0" width="740" height="960" className="gl-soft" opacity=".35"/>
    <g transform={`translate(${270 + fly * 520} ${500 - fly * 420 + Math.sin(t * 9) * 3 * (fly > 0 ? 1 : 0)}) rotate(${-3 + fly * 140}) scale(${1.1 - fly * .3})`}><MapSheet flood={flood} t={t}/></g>
    <g className="theo-scope"><ellipse cx="62" cy="660" rx="30" ry="18" className="leo-skin gl-thumb"/><ellipse cx="478" cy="650" rx="30" ry="18" className="leo-skin gl-thumb"/></g>
  </> };
}

/* ---------- Scene 05: the new planet ---------- */
function shot23(t: number): Shot {
  const p = lin(t, 71.85, 76.95);
  return { cam: z(270, 500, 1.18 - p * .2), el: <>
    <Sky kind="space"/><Stars t={t} n={140} h={960} seed={9}/>
    <circle cx="520" cy="80" r="160" fill="url(#gl-sun-glow)"/><circle cx="520" cy="80" r="26" className="gl-sun"/>
    <Earth x={270} y={500} r={190} t={t} shrink={ramp(t, T.blue, 76.6)}/>
  </> };
}
function shot24(t: number): Shot {
  const p = lin(t, 76.95, 81.85), lights = lin(t, T.restart, 81.4);
  const tops: Array<[number, number, number]> = [[-40, 70, 90], [60, 60, 150], [150, 80, 60], [330, 70, 120], [430, 90, 70], [540, 60, 110]];
  return { cam: z(250 + p * 60, 540, 1.06), el: <>
    <Sky kind="sunset"/><Sun x={250} y={590} r={50} cls="gl-sun-gold"/>
    {[0, 1].map(i => <Cloud key={i} x={(t * 5 + i * 320) % 800 - 100} y={210 + i * 90} s={1.4} cls="gl-cloud-gold"/>)}
    {tops.map(([x, w, h], i) => <g key={i}>
      <Tower x={x} base={640} w={w} floors={Math.round(h / 22)} fh={22} cls={i % 2 ? 'gl-bld-dusk' : 'gl-bld-dusk2'} seed={i + 30} lit={lights * .6}/>
      {i % 2 === 0 ? <House x={x + w / 2} y={640 - h} s={.6} cls="gl-house-a" roof="gl-roof-a" lit={lights > .3}/> : <Tree x={x + w / 2} y={640 - h} s={.6}/>}
      {i % 3 === 1 && <rect x={x + 6} y={640 - h - 8} width={w - 12} height="8" className="gl-solar"/>}
    </g>)}
    <path d="M130 500Q190 520 240 520M400 560Q430 580 470 580" className="gl-rope"/>
    <Water y={640} t={t} amp={4}/>
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${230 + Math.sin(t * 3 + i) * 14 - i * 2} ${650 + i * 16}h${30 + i * 8}`} className="gl-glitter" opacity={.4 + .5 * Math.sin(t * 5 + i)}/>)}
    {[0, 1, 2].map(i => <path key={i} d="M0 0q8 -8 16 0q8 -8 16 0" transform={`translate(${(t * 40 + i * 50) % 700 - 100} ${300 + i * 22 + Math.sin(t * 2 + i) * 6})`} className="gl-bird"/>)}
    <Boat x={430 - (t - 76.95) * 45} y={800} t={t} s={1.3}>
      <Person x={0} g={30} s={.42} t={t} scarf seated backpack={false} shadow={false} expression="curious" reach={-60 + Math.sin(t * 3) * 25} armL={-40 + Math.sin(t * 3) * 25}/>
      <path d={`M${10 + Math.sin(t * 3) * 10} -60L${-60 + Math.sin(t * 3) * 30} 20`} className="gl-oar"/>
    </Boat>
  </> };
}
function shot25(t: number): Shot {
  const [hx, hy] = headOf(270, 1010, 2.4);
  return { vig: .5, cam: z(hx, hy + 40, 1 + lin(t, 81.85, 84.85) * .12), el: <>
    <Sky kind="sunset"/><Sun x={420} y={620} r={50} cls="gl-sun-gold"/>
    <rect x="-200" y="660" width="1000" height="600" className="gl-sea-gold"/>
    {[40, 110, 380, 460].map((x, i) => <rect key={x} x={x} y={660 - 40 - i * 12} width="30" height={40 + i * 12} className="gl-bld-dusk"/>)}
    <rect x="-200" y="0" width="1000" height="1200" className="gl-soft" opacity=".25"/>
    <Person x={270} g={1010} s={2.4} t={t} scarf expression="curious" shine gaze={[0, 0]} reach={18} armL={16} shadow={false}/>
  </> };
}
function shot26(t: number): Shot {
  const grow = lin(t, 84.85, 86.0), fall = lin(t, 86.0, T.hoje), rip = t - T.hoje, back = ease(lin(t, 86.9, 90.6));
  const dropY = 316 + fall * fall * 444;
  return { night: .15, shake: rip > 0 && rip < .5 ? 3 * (1 - rip * 2) : 0, cam: t < 86.0 ? z(270, 330, 2.4) : t < T.hoje ? z(270, mix(330, 700, fall * fall), 2.4 - fall * .5) : z(270, mix(700, 470, back), mix(1.9, .9, back)), el: <>
    <Sky kind="night"/><Stars t={t} n={80} op={.9}/><Aurora t={t} y={170} op={.4 + back * .6}/>
    <Mountains y={600} far/>
    <IceShelf x0={-200} x1={760} top={180} base={280} seed={14}/>
    {Array.from({ length: 14 }, (_, i) => { const x = -160 + i * 66, L = 20 + rnd(6, i) * 40; return <path key={i} d={`M${x - 10} 280L${x} ${280 + L}L${x + 10} 280Z`} className="gl-icicle"/>; })}
    <path d="M260 280L270 316L280 280Z" className="gl-icicle"/>
    {t < T.hoje && <ellipse cx="270" cy={t < 86 ? 316 + grow * 6 : dropY} rx={3 + grow * 3} ry={4 + grow * 4 + fall * 4} className="gl-drop"/>}
    <Water y={760} t={t * .4} amp={2} foam={false}/>
    {rip > 0 && [0, 1, 2, 3].map(i => { const r = (rip - i * .35) * 120; return r > 0 ? <ellipse key={i} cx="270" cy="762" rx={r} ry={r * .18} className="gl-ring" opacity={Math.max(0, 1 - r / 420)}/> : null; })}
    <Iceberg x={440} y={790} s={.7} t={t}/>
    {[80, 110].map((x, i) => <Penguin key={x} x={x} y={820} s={.7} t={t + i} look={-10}/>)}
    <Floe x={95} y={830} w={130}/>
  </> };
}

const SHOTS = [shot0, shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot9, shot10, shot11, shot12,
  (t: number) => landmark(t, 'rio', 47.5), (t: number) => landmark(t, 'ny', 48.35), (t: number) => landmark(t, 'sh', 49.4),
  shot16, shot17, shot18, shot19, shot20, shot21, shot22, shot23, shot24, shot25, shot26];

export function GeloScene({ time }: { time: number }) {
  const f = getGeloFrame(time), t = f.t;
  const s = (SHOTS[f.shot] ?? shot0)(t);
  const shake = s.shake ?? 0, sx = shake ? Math.sin(t * 90) * shake : 0, sy = shake ? Math.cos(t * 77) * shake : 0;
  const fade = ramp(t, T.fade, 92.1), open = 1 - ramp(t, 0, .5);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`E se todo o gelo derretesse, cena ${f.scene.id}`} className="animation-canvas gelo-film" data-shot={f.shot}>
    <defs>
      <clipPath id="gl-clip"><rect width="540" height="960"/></clipPath>
      {(['polar', 'day', 'night', 'storm', 'sunset', 'gold', 'space', 'memory'] as const).map(k => <linearGradient key={k} id={`gl-sky-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset=".3" className={`gl-${k}-top`}/><stop offset=".43" className={`gl-${k}-mid`}/><stop offset=".55" className={`gl-${k}-low`}/></linearGradient>)}
      <radialGradient id="gl-sun-glow"><stop offset="0" className="gl-glow-in"/><stop offset="1" className="gl-glow-out"/></radialGradient>
      <linearGradient id="gl-plain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="gl-plain-far"/><stop offset=".6" className="gl-plain-near"/></linearGradient>
      <linearGradient id="gl-ice-depth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="gl-depth-top"/><stop offset="1" className="gl-depth-bottom"/></linearGradient>
      <radialGradient id="gl-atmo"><stop offset=".8" className="gl-atmo-in"/><stop offset=".86" className="gl-atmo-mid"/><stop offset="1" className="gl-atmo-out"/></radialGradient>
      <radialGradient id="gl-earth-shade" cx=".35" cy=".35" r=".75"><stop offset=".45" className="gl-shade-in"/><stop offset="1" className="gl-shade-out"/></radialGradient>
      <radialGradient id="gl-vig" r=".75"><stop offset=".5" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient>
    </defs>
    <rect width="540" height="960" className="gl-base"/>
    <g clipPath="url(#gl-clip)"><g transform={`translate(${sx} ${sy})`}><g transform={s.cam ?? ''}>{s.el}</g></g>
      {(s.night ?? 0) > 0 && <rect width="540" height="960" className="gl-night" opacity={s.night}/>}
      {(s.tint ?? 0) > 0 && <rect width="540" height="960" className="gl-grey" opacity={s.tint}/>}
    </g>
    <rect width="540" height="960" fill="url(#gl-vig)" opacity={s.vig ?? .38}/>
    {(s.flash ?? 0) > 0 && <rect width="540" height="960" className="gl-flash" opacity={s.flash}/>}
    {open > 0 && <rect width="540" height="960" className="tp-black" opacity={open}/>}
    {fade > 0 && <rect width="540" height="960" className="tp-black" opacity={fade}/>}
  </svg>;
}
