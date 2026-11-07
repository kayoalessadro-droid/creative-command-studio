import type { ReactNode } from 'react';
import { getEnzoFrame, ramp, lin, clamp, handPos, T } from '@/lib/enzo-timeline';
import { Leo, type LeoExpression } from './leo';
import { Freezable, FrostBurst, ColdMist, IceSheet, Sparkles, EdgeFrost, BigHands } from './ice';

type PersonProps = { tx: number; ty: number; s: number; flip?: boolean; scope: string; t: number; walking?: boolean; seated?: boolean; expression?: LeoExpression; reach?: number | undefined; armL?: number | undefined; gaze?: readonly [number, number] | undefined; shine?: boolean; hideArms?: boolean };
function Person({ tx, ty, s, flip = false, scope, t, walking = false, seated = false, expression = 'curious', reach, armL, gaze, shine = false, hideArms = false }: PersonProps) {
  return <g transform={flip ? `translate(${tx + s * 180} ${ty}) scale(${-s} ${s})` : `translate(${tx} ${ty}) scale(${s})`}>
    <g className={scope}>
      <Leo time={t} walking={walking} seated={seated} expression={expression} backpack={false} reach={reach} armL={armL} gaze={gaze} shine={shine} hideArms={hideArms}/>
      {scope === 'enzo-scope' && <path d="M89 131L88 226" className="jacket-zip"/>}
      {scope === 'enzo-scope' && <path d="M66 128Q88 146 112 130" className="jacket-collar"/>}
    </g>
  </g>;
}
const shadow = (x: number, y: number, w = 66) => <ellipse cx={x} cy={y} rx={w} ry={w * .17} className="ground-shadow"/>;
const z = (cx: number, cy: number, s: number) => `translate(${270 - cx * s} ${480 - cy * s}) scale(${s})`;

/* ---------- environments ---------- */
function CityBack({ t, night = false }: { t: number; night?: boolean }) {
  return <g>
    <rect width="540" height="960" className={night ? 'enz-sky-dusk' : 'enz-sky'}/>
    <circle cx="440" cy="190" r="44" className="scene-sun"/>
    <path className="scene-cloud" d="M38 195Q24 173 43 161Q54 137 76 153Q101 138 113 167Q137 165 132 187Z" transform={`translate(${(t * 4) % 600 - 40} 0)`}/>
    <path className="scene-cloud" d="M38 195Q24 173 43 161Q54 137 76 153Q101 138 113 167Q137 165 132 187Z" transform={`translate(${(t * 3 + 300) % 600 - 60} 70) scale(.8)`}/>
    <path className="building-back" d="M-40 360H70V300H160V390H230V320H320V392H400V300H470V350H600V640H-40Z"/>
    {[0, 1, 2, 3].map(i => <rect key={i} x={90 + i * 80} y={400} width="18" height="22" className="building-window"/>)}
  </g>;
}
function Railing() {
  const posts = Array.from({ length: 18 }, (_, i) => -60 + i * 40);
  return <g className="enz-rail">
    <path d="M-80 604H640M-80 662H640M-80 716H640" className="rail-bar"/>
    {posts.map(x => <path key={x} d={`M${x} 596V722`} className="rail-post"/>)}
    {posts.map(x => <circle key={x} cx={x} cy="596" r="5" className="rail-knob"/>)}
  </g>;
}
function StreetScene({ t, railP, railC }: { t: number; railP: number; railC: { x: number; y: number } }) {
  return <g>
    <CityBack t={t}/>
    <path className="building-main" d="M-40 450H120V660H-40ZM410 430H600V660H410Z"/>
    {[0, 1, 2].map(i => <g key={i}><rect x="0" y={470 + i * 55} width="28" height="30" className="building-window"/><rect x="60" y={470 + i * 55} width="28" height="30" className="building-window"/><rect x="440" y={455 + i * 60} width="34" height="34" className="building-window"/><rect x="495" y={455 + i * 60} width="34" height="34" className="building-window"/></g>)}
    <path className="tree-trunk" d="M340 640V470"/><path className="tree-leaves" d="M303 488Q280 457 303 433Q292 394 324 382Q366 367 384 404Q413 433 383 458Q388 492 350 503Z"/>
    <rect y="640" width="540" height="320" className="sidewalk"/>
    <path d="M-40 760H600M-40 880H600" className="pave-line"/>
    <Freezable id="rail" cx={railC.x} cy={railC.y} p={railP} R={560}><Railing/></Freezable>
    <FrostBurst x={railC.x} y={railC.y} p={railP * 2} size={70} seed={2} t={t}/>
    <FrostBurst x={railC.x + railP * 280} y={railC.y - 2} p={railP > 0 && railP < 1 ? .6 : 0} size={40} seed={8} n={5} t={t}/>
    <FrostBurst x={railC.x - railP * 280} y={railC.y + 2} p={railP > 0 && railP < 1 ? .6 : 0} size={40} seed={9} n={5} t={t}/>
    <ColdMist x={railC.x} y={railC.y - 20} t={t} amount={railP * 1.4} w={railP * 400}/>
    <Sparkles x={railC.x - railP * 300} y={590} w={railP * 600} h={130} t={t} n={16} amount={railP}/>
  </g>;
}
function Kitchen({ t, glassP, spoonP, appleP }: { t: number; glassP: number; spoonP: number; appleP: number }) {
  return <g>
    <rect width="540" height="960" className="enz-kitchen-wall"/>
    <rect x="300" y="190" width="190" height="200" rx="8" className="bus-window"/><path d="M395 190V390M300 290H490" className="bus-divider"/>
    <path className="scene-cloud" d="M38 195Q24 173 43 161Q54 137 76 153Q101 138 113 167Q137 165 132 187Z" transform={`translate(${300 + (t * 5) % 140} 90) scale(.6)`}/>
    <rect x="-10" y="120" width="250" height="150" rx="6" className="enz-cabinet"/><path d="M115 120V270M95 190V205M135 190V205" className="enz-cabinet-line"/>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={(i % 6) * 92 - 10} y={420 + Math.floor(i / 6) * 90} width="88" height="86" className="enz-tile"/>)}
    <path d="M440 470V420M425 420H470" className="rail-post"/>
  </g>;
}
function Counter({ t, glassP, spoonP, appleP }: { t: number; glassP: number; spoonP: number; appleP: number }) {
  return <g>
    <rect x="-20" y="600" width="580" height="22" className="enz-counter-top"/>
    <rect x="-20" y="622" width="580" height="340" className="enz-counter"/>
    {[0, 1, 2].map(i => <g key={i}><rect x={10 + i * 180} y="650" width="160" height="290" rx="6" className="enz-cabinet"/><path d={`M${145 + i * 180} 700V760`} className="enz-cabinet-line"/></g>)}
    {/* glass of water */}
    <Freezable id="water" cx={316} cy={590} p={glassP} R={110}><rect x="312" y="548" width="42" height="50" rx="3" className="enz-water"/></Freezable>
    {glassP > .7 && <path d="M318 560L333 575L348 557M322 588L340 572" className="ice-crack" opacity={(glassP - .7) * 3}/>}
    <path d="M308 520L312 600H354L358 520Z" className="enz-glass"/>
    <Freezable id="glass-frost" cx={316} cy={590} p={glassP * .9} R={110}><path d="M308 520L312 600H354L358 520Z" className="enz-glass-frost"/></Freezable>
    <ColdMist x={333} y={530} t={t} amount={glassP * 1.5} w={30} rise={70} size={.6}/>
    <Sparkles x={300} y={510} w={70} h={95} t={t} n={7} amount={glassP}/>
    {/* spoon */}
    <Freezable id="spoon" cx={392} cy={596} p={spoonP} R={70}><g><ellipse cx="392" cy="594" rx="12" ry="6" className="enz-metal"/><path d="M402 595L440 592" className="enz-spoon-handle"/></g></Freezable>
    <ColdMist x={410} y={585} t={t + 1} amount={spoonP} w={30} rise={50} size={.45} n={4}/>
    {/* apple */}
    <Freezable id="apple" cx={447} cy={584} p={appleP} R={70}><g><path d="M462 566Q488 562 487 586Q485 602 470 602Q465 598 460 602Q445 602 443 586Q442 562 462 566Z" className="enz-apple"/><path d="M465 566Q466 556 470 551" className="tree-trunk-thin"/><path d="M468 556Q478 548 486 553Q478 561 468 556Z" className="tree-leaves"/></g></Freezable>
    <ColdMist x={465} y={570} t={t + 2} amount={appleP} w={30} rise={50} size={.45} n={4}/>
    <FrostBurst x={316} y={600} p={glassP * 1.4} size={60} seed={12} dir={0} spread={160} t={t}/>
  </g>;
}
function Hallway({ t, plantP, knobP }: { t: number; plantP: number; knobP: number }) {
  return <g>
    <rect width="540" height="960" className="enz-hall-wall"/>
    <rect y="640" width="540" height="160" className="enz-wainscot"/><path d="M0 640H540" className="enz-cabinet-line"/>
    <rect x="40" y="250" width="120" height="150" rx="4" className="enz-frame"/><path d="M60 370L90 320L110 345L125 330L145 370Z" className="tree-leaves"/><circle cx="125" cy="295" r="12" className="scene-sun"/>
    <Freezable id="door" cx={350} cy={600} p={knobP} R={330}><g>
      <rect x="330" y="360" width="150" height="440" rx="4" className="enz-door"/>
      <rect x="352" y="390" width="106" height="160" rx="3" className="enz-door-panel"/><rect x="352" y="580" width="106" height="190" rx="3" className="enz-door-panel"/>
      <circle cx="350" cy="600" r="10" className="enz-metal"/><path d="M350 600H372" className="enz-spoon-handle"/>
    </g></Freezable>
    <FrostBurst x={350} y={600} p={knobP * 1.5} size={110} seed={21} t={t}/>
    <Sparkles x={330} y={380} w={150} h={400} t={t} n={14} amount={knobP}/>
    <ColdMist x={360} y={590} t={t} amount={knobP * 1.3} w={80}/>
    <Freezable id="plant" cx={232} cy={620} p={plantP} R={120}><g>
      <path d="M232 690Q200 600 170 590M232 690Q228 590 240 560M232 690Q262 610 290 600M232 690Q215 630 196 632M232 690Q255 640 278 646" className="enz-stem"/>
      {[[170, 590], [240, 560], [290, 600], [196, 632], [278, 646], [210, 600], [262, 585]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="20" ry="9" transform={`rotate(${i * 37 - 40} ${x} ${y})`} className="enz-leaf"/>)}
    </g></Freezable>
    <path d="M200 690H264L256 790H208Z" className="enz-pot"/>
    <ColdMist x={232} y={600} t={t} amount={plantP} w={60} n={5} size={.6}/>
    <rect y="800" width="540" height="160" className="enz-floor"/>
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${i * 130 - 20} 800L${i * 160 - 120} 960`} className="enz-plank"/>)}
    <path d="M0 860H540M0 920H540" className="enz-plank"/>
  </g>;
}
function Plaza({ t, benchP, benchC, ice, iceC, treeP, dusk = false }: { t: number; benchP: number; benchC: { x: number; y: number }; ice: number; iceC: { x: number; y: number }; treeP: number; dusk?: boolean }) {
  return <g>
    <CityBack t={t} night={dusk}/>
    <rect y="620" width="540" height="340" className="enz-grass"/>
    <path d="M-40 980Q200 760 300 640L360 640Q330 760 600 980Z" className="enz-path"/>
    {([[70, 600, 1], [470, 590, .9]] as Array<[number, number, number]>).map(([x, y, s], i) => <Freezable key={i} id={`tree${i}`} cx={x} cy={y + 40} p={treeP} R={230}><g transform={`translate(${x} ${y}) scale(${s})`}><path className="tree-trunk" d="M0 50V-110"/><path className="tree-leaves" d="M-40 -90Q-65 -125 -40 -150Q-52 -192 -18 -205Q27 -220 46 -180Q78 -150 46 -122Q52 -86 10 -74Z"/></g></Freezable>)}
    <Freezable id="lamp" cx={500} cy={720} p={treeP} R={220}><g><path d="M500 760V450" className="enz-lamp"/><path d="M478 450H522L512 425H488Z" className="enz-lamp-head"/></g></Freezable>
    <IceSheet cx={iceC.x} cy={iceC.y} r={ice} t={t} cracks={ice > 80 ? 1 : 0} seed={14}/>
    <Freezable id="bench" cx={benchC.x} cy={benchC.y} p={benchP} R={300}><g>
      <path d="M300 740V800M480 740V800M310 700V740M470 700V740" className="rail-post"/>
      <rect x="290" y="650" width="200" height="16" rx="4" className="enz-wood"/><rect x="290" y="674" width="200" height="16" rx="4" className="enz-wood"/>
      <rect x="282" y="728" width="216" height="18" rx="4" className="enz-wood"/>
    </g></Freezable>
    <FrostBurst x={benchC.x} y={benchC.y} p={benchP * 1.6} size={120} seed={33} t={t}/>
    <ColdMist x={390} y={700} t={t} amount={benchP * 1.3} w={200} n={9}/>
    <Sparkles x={280} y={640} w={220} h={160} t={t} n={14} amount={benchP}/>
  </g>;
}
function NightRoom({ t, mugP, frost }: { t: number; mugP: number; frost: number }) {
  return <g>
    <rect width="540" height="960" className="enz-night-wall"/>
    <rect x="60" y="180" width="170" height="230" rx="6" className="enz-night-window"/>
    <circle cx="170" cy="240" r="26" className="enz-moon"/>
    <path d="M60 295H230M145 180V410" className="enz-night-frame"/>
    <path d="M60 410L230 410L420 960L-60 960Z" className="enz-moonbeam"/>
    <Freezable id="window" cx={60} cy={180} p={frost} R={260}><rect x="60" y="180" width="170" height="230" rx="6" className="enz-night-window-glass"/></Freezable>
    <rect y="800" width="540" height="160" className="enz-night-floor"/>
    <rect x="360" y="690" width="200" height="120" rx="8" className="enz-night-bed"/><rect x="360" y="660" width="200" height="40" rx="12" className="enz-night-blanket"/><rect x="460" y="630" width="70" height="40" rx="14" className="enz-night-pillow"/>
    <path d="M230 622V800M420 622V800" className="enz-night-leg"/>
    <rect x="215" y="600" width="220" height="22" rx="4" className="enz-night-desk"/>
    <path d="M400 600V560M388 560H412L405 530H395Z" className="enz-night-leg"/>
  </g>;
}
function Mug({ t, p }: { t: number; p: number }) {
  return <g>
    <Freezable id="mug" cx={300} cy={585} p={p} R={90}><g><path d="M300 556H336V594Q336 600 330 600H306Q300 600 300 594Z" className="enz-mug"/><path d="M336 566Q350 566 350 578Q350 590 336 590" className="enz-mug-handle"/><ellipse cx="318" cy="558" rx="16" ry="3" className="enz-coffee"/></g></Freezable>
    <FrostBurst x={300} y={598} p={p * 1.4} size={90} seed={44} dir={0} spread={120} t={t}/>
    <ColdMist x={318} y={550} t={t} amount={p * 1.6} w={30} rise={80} size={.6}/>
    <Sparkles x={292} y={540} w={64} h={64} t={t} n={7} amount={p}/>
  </g>;
}

export function EnzoScene({ time }: { time: number }) {
  const f = getEnzoFrame(time), t = f.t, n = f.n;
  const S = 1.15;
  let cam = '', bg: ReactNode = null, fg: ReactNode = null, overlay: ReactNode = null, shake = 0, edge = 0, fade = 0, vig = .3;

  if (n === 1) {
    const tx = -170 + ramp(t, 0, 7.1) * 290, walking = t < 7.0;
    const railC = { x: 304, y: 664 }, railP = lin(t, 7.6, 11.6);
    const hand = handPos(0, tx, 445, S);
    const expr: LeoExpression = t < T.railTouch + .3 ? 'curious' : 'surprised';
    bg = <StreetScene t={t} railP={railP} railC={railC}/>;
    fg = <>{shadow(tx + 103, 847)}<Person tx={tx} ty={445} s={S} scope="enzo-scope" t={t} walking={walking} expression={expr} reach={t >= 6.9 ? 4 - ramp(t, 8.6, 9.6) * 70 : undefined} gaze={t > 8.6 ? [2, 3] : undefined} shine={t > 8.6}/>
      {t >= 8.6 && <ColdMist x={hand.x + 10} y={560} t={t} amount={.8} w={30} rise={60} size={.5} n={4}/>}</>;
    cam = t < 2.6 ? z(hand.x + 30, 640, 2.2) : t < 6.9 ? z(tx + 140, 600, 1.15) : t < 8.6 ? z(304, 650, 2.5 + lin(t, 6.9, 8.6) * .3) : t < 10.4 ? z(tx + 110, 530, 1.9) : z(280, 620, 1.05 - lin(t, 10.4, 12.4) * .05);
    if (t > 7.1 && t < 7.5) shake = 2;
  }
  if (n === 2 && t < 17.3) {
    // looking at his hand, mist curling from the fingers
    const tx = 120, ty = 445, hp = handPos(-78, tx, ty, S);
    bg = <><StreetScene t={t} railP={1} railC={{ x: 304, y: 664 }}/><rect width="540" height="960" className="enz-dim" opacity={.35}/></>;
    fg = <><Person tx={tx} ty={ty} s={S} scope="enzo-scope" t={t} expression={t < 14.6 ? 'surprised' : 'curious'} reach={-78 + Math.sin(t * 2) * 3} gaze={[2, -2]} shine/>
      <ColdMist x={hp.x} y={hp.y} t={t} amount={1} w={30} rise={80} size={.55}/><Sparkles x={hp.x - 30} y={hp.y - 40} w={60} h={60} t={t} n={8}/></>;
    cam = t < 15 ? z(tx + 120, 520, 2.1 + lin(t, 12.4, 15) * .25) : z(hp.x, hp.y - 10, 3 - lin(t, 15, 17.3) * .3);
  } else if (n === 2) {
    const glassP = lin(t, 19.4, 21.5), spoonP = lin(t, 23.5, 24.1), appleP = lin(t, 24.4, 25.0);
    const tx = 137 + ramp(t, 22.6, 23.3) * 70 + ramp(t, 23.75, 24.25) * 50;
    const touch = Math.max(ramp(t, 17.9, 18.45) * (1 - ramp(t, 20.6, 21.3)), ramp(t, 23.0, 23.45) * (1 - ramp(t, 23.6, 23.9)), ramp(t, 24.0, 24.35) * (1 - ramp(t, 25.0, 25.5)));
    const expr: LeoExpression = t < 19.6 ? 'curious' : t < 22.3 ? 'surprised' : t < 25.2 ? 'curious' : 'happy';
    bg = <Kitchen t={t} glassP={glassP} spoonP={spoonP} appleP={appleP}/>;
    fg = <><Person tx={tx} ty={386} s={S} scope="enzo-scope" t={t} walking={t > 22.6 && t < 24.25 && (t < 23.3 || t > 23.75)} expression={expr} reach={14 - touch * 44} shine/>
      <Counter t={t} glassP={glassP} spoonP={spoonP} appleP={appleP}/></>;
    cam = t < 18.9 ? z(240, 520, 1.3) : t < 22.3 ? z(333, 565, 2.6 + lin(t, 18.9, 22.3) * .5) : t < 25.1 ? z(330 + lin(t, 22.3, 25.1) * 90, 560, 1.7) : z(300, 520, 1.25);
  }
  if (n === 3) {
    const plantP = lin(t, 29.95, 30.7), knobP = lin(t, 33.3, 35.6);
    if (t < 35.8) {
      const tx = 40 + ramp(t, 31.0, 32.9) * 117;
      const touch = t < 31 ? ramp(t, 29.4, 29.9) * (1 - ramp(t, 30.5, 30.9)) : ramp(t, 32.7, 33.15);
      const raise = t < 29.2 ? -62 + Math.sin(t * 2.4) * 6 : 14 - touch * 24;
      const hp = handPos(raise, tx, 386, S);
      bg = <Hallway t={t} plantP={plantP} knobP={knobP}/>;
      fg = <>{shadow(tx + 103, 788)}<Person tx={tx} ty={386} s={S} scope="enzo-scope" t={t} walking={t > 31 && t < 32.9} expression={t < 33.4 ? 'happy' : 'surprised'} reach={raise} shine/>
        {t < 29.2 && <><Sparkles x={hp.x - 35} y={hp.y - 40} w={70} h={70} t={t} n={9}/><ColdMist x={hp.x} y={hp.y} t={t} amount={.8} w={20} rise={60} size={.45} n={4}/></>}</>;
      cam = t < 29.2 ? z(170, 470, 1.8) : t < 31 ? z(220, 560, 1.7) : t < 32.9 ? z(250, 540, 1.25) : z(352, 598, 2.3 + lin(t, 32.9, 35.8) * .5);
    } else {
      const ice = ramp(t, 36.15, 38.6) * 720, cracks = lin(t, 38.0, 38.6);
      const hp = handPos(40, 60, 555, S);
      bg = <><Hallway t={t} plantP={1} knobP={1}/><IceSheet cx={hp.x} cy={805} r={ice} flat={.26} cracks={cracks} t={t}/></>;
      fg = <><Person tx={60} ty={555} s={S} scope="enzo-scope" t={t} seated expression={t < 37 ? 'curious' : 'happy'} reach={40} gaze={[3, 3]} shine/>
        <FrostBurst x={hp.x} y={hp.y + 6} p={lin(t, 36.1, 37.6)} size={140} seed={27} dir={0} spread={200} t={t}/><ColdMist x={hp.x + 60} y={800} t={t} amount={ramp(t, 36.3, 37)} w={300} n={9}/></>;
      cam = z(240, 690, 1.35 + lin(t, 35.8, 40.55) * .15);
      if (t > 38 && t < 38.35) shake = 4;
    }
  }
  if (n === 4) {
    const benchC = { x: 305, y: 690 }, benchP = lin(t, 46.0, 49.0);
    const tx = -140 + ramp(t, 40.55, 45.1) * 252;
    const touch = ramp(t, 45.2, 45.75);
    const stop = t >= T.stop, flee = ramp(t, T.flee, 52.6);
    const onlookExpr: LeoExpression = t < 47 ? 'curious' : t < T.stop ? 'surprised' : 'scared';
    bg = <Plaza t={t} benchP={benchP} benchC={benchC} ice={0} iceC={{ x: 0, y: 0 }} treeP={0}/>;
    const people = <>
      <Person tx={360 + (stop ? 0 : (t - 50.5) * 6) + flee * 50} ty={445} s={.56} flip scope="onlooker-a" t={t + .4} walking={!stop || (flee > 0 && flee < 1)} expression={onlookExpr} reach={t > T.flee ? -70 : undefined}/>
      <Person tx={445 + (stop ? 0 : (t - 50.5) * 4) + flee * 60} ty={430} s={.52} flip scope="onlooker-b" t={t + 1.1} walking={!stop || (flee > 0 && flee < 1)} expression={onlookExpr} armL={t > T.flee ? -60 : undefined}/>
    </>;
    fg = <>{shadow(tx + 103, 878)}<Person tx={tx} ty={476} s={S} scope="enzo-scope" t={t} walking={t < 45.1} expression={t < 46.4 ? 'happy' : t < 49.8 ? 'surprised' : 'scared'} reach={t > 45 ? 14 - touch * 24 * (1 - ramp(t, 47.2, 47.8)) : undefined} shine/></>;
    bg = <>{bg}{people}</>;
    cam = t < 44.8 ? z(tx + 160, 600, 1.15) : t < 46.0 ? z(290, 650, 1.9) : t < 49.6 ? z(390, 700, 1.5 - lin(t, 46, 49.6) * .2) : t < 51.4 ? z(420, 560, 1.9) : z(330, 600, 1.05);
    if (t > 47.2 && t < 47.5) shake = 3;
  }
  if (n === 5 || n === 6) {
    // second angle on the plaza: Enzo faces left, his friend arrives from the left
    let etx = 194, eWalk = false, eExpr: LeoExpression = 'scared', eReach: number | undefined = undefined;
    let ftx = 40, fWalk = false, fExpr: LeoExpression = 'happy', fReach: number | undefined = undefined;
    const grab = { x: 240, y: 640 };
    const sleeve = lin(t, 61.4, 62.9), floor = ramp(t, 63.2, 64.6) * 430;
    if (t < 56.5) { ftx = -200; eReach = -50 + Math.sin(t * 2) * 4; }
    else if (t < 58.9) { ftx = -200 + ramp(t, 56.5, 58.9) * 240; fWalk = true; }
    if (t >= 59.0) fReach = -40 * ramp(t, 59.0, 59.45) + (t > 62.9 ? 12 * ramp(t, 63, 65) : 0);
    if (t >= 59.6) eExpr = 'surprised';
    if (t >= 61.4) { fExpr = 'scared'; eExpr = 'scared'; }
    if (t >= T.backAway && n === 5) { etx = 194 + ramp(t, T.backAway, 66.3) * 136; eWalk = t < 66.3; eReach = -30; }
    let ice = floor, iceC = { x: 240, y: 860 }, treeP = 0, fFrost = sleeve;
    if (n === 6) {
      fFrost = 1;
      etx = 330 - ramp(t, 66.7, 68.0) * 60; eWalk = t > 66.7 && t < 68.0; eReach = -55 * (1 - ramp(t, 69.6, 70.4)) + 6; eExpr = 'scared';
      ftx = 40 - ramp(t, 66.9, 68.3) * 80; fWalk = t > 66.9 && t < 68.3; fReach = -28; fExpr = 'scared';
      ice = 430 + ramp(t, 68.6, 70.4) * 140 + ramp(t, 70.6, 73.5) * 520; iceC = { x: 300, y: 860 }; treeP = lin(t, 71, 73.8);
    }
    const friend = <Person tx={ftx} ty={470} s={1.1} scope="friend-scope" t={t + .6} walking={fWalk} expression={fExpr} reach={fReach} shine/>;
    bg = <Plaza t={t} benchP={1} benchC={{ x: 470, y: 700 }} ice={ice} iceC={iceC} treeP={treeP}/>;
    fg = <>
      {shadow(ftx + 103, 853)}{shadow(etx + 80, 840)}
      <Freezable id="friend" cx={grab.x} cy={grab.y} p={fFrost} R={95}>{friend}</Freezable>
      <Person tx={etx} ty={439} s={S} flip scope="enzo-scope" t={t} walking={eWalk} expression={eExpr} reach={eReach} gaze={n === 5 && t < 56.5 ? [-2, -1] : undefined} shine/>
      {t > 59.4 && <FrostBurst x={grab.x} y={grab.y} p={lin(t, 59.5, 61) * .6 + sleeve * .6} size={70} seed={51} t={t}/>}
      <ColdMist x={grab.x - 20} y={grab.y} t={t} amount={sleeve * 1.2} w={60} n={5} size={.6}/>
      {n === 6 && [68.7, 69.3].map((s, i) => <FrostBurst key={i} x={etx + 70 + i * 50} y={850} p={lin(t, s, s + .7)} size={90} seed={60 + i} t={t}/>)}
      {n === 6 && <ColdMist x={270} y={840} t={t} amount={ramp(t, 70.6, 72)} w={500} n={10} rise={140} size={1.3}/>}
    </>;
    if (n === 5) cam = t < 57.5 ? z(290, 560, 1.55) : t < 59.3 ? z(200, 600, 1.05) : t < 61.2 ? z(240, 640, 2.3) : t < 63.1 ? z(190, 620, 1.8) : t < 64.8 ? z(230, 700, 1.05) : z(280, 600, 1.2);
    else cam = t < 68.0 ? z(240, 600, 1.2) : t < 70.6 ? z(300, 720, 1.4) : z(270, 600, .92 + lin(t, 70.6, 74.4) * .08);
    if ((t > 63.9 && t < 64.2) || (t > 71.4 && t < 71.7)) shake = 3;
    if (n === 6 && t >= T.hands) {
      const c = lin(t, T.crystals, 79.2);
      bg = <><rect width="540" height="960" className="enz-cold-bg"/><ColdMist x={270} y={900} t={t} amount={1} w={540} n={10} rise={500} size={1.6}/></>;
      fg = <><BigHands t={t} crystals={c} frost={lin(t, 77, 79.4) * .45} glow={.4 + c * .6} y={720} id="hands6"/><Sparkles x={60} y={300} w={420} h={420} t={t} n={14} amount={c}/></>;
      cam = `translate(${-270 * lin(t, 74.4, 79.6) * .08} ${-480 * lin(t, 74.4, 79.6) * .08}) scale(${1 + lin(t, 74.4, 79.6) * .08})`;
      vig = .55;
    }
  }
  if (n === 7) {
    const mugP = lin(t, T.mugFreeze, 91.5);
    edge = ramp(t, 79.6, 82) * .18 + ramp(t, 93.8, 96.5) * .6;
    vig = .6;
    if (t < T.finalShot) {
      const tx = 40 + ramp(t, 83.2, 86.8) * 37;
      const reach = t < 83.2 ? 10 : t < 92.4 ? 10 - ramp(t, 83.3, 86.9) * 22 : -12 + ramp(t, 92.4, 93.6) * 22;
      const look = t > 92.4;
      bg = <NightRoom t={t} mugP={mugP} frost={ramp(t, 93.8, 96)}/>;
      fg = <>{shadow(tx + 103, 790, 60)}<Person tx={tx} ty={386} s={S} scope="enzo-scope" t={t} walking={t > 83.2 && t < 86.8} expression={t < 90 ? 'scared' : 'scared'} reach={look ? reach - 40 * ramp(t, 93.6, 94.4) : reach} gaze={look ? [2, -1] : [2, 1]} shine/>
        <Mug t={t} p={mugP}/>
        <ColdMist x={tx + 100 * S + 25} y={386 + 108 * S} t={t} amount={.55} w={10} rise={50} size={.4} n={3}/>
        <rect x="-200" y="-200" width="940" height="1360" className="enz-night-tint"/></>;
      cam = t < 83.2 ? z(230, 560, 1.1 + lin(t, 79.6, 83.2) * .15) : t < 87.2 ? z(250, 560, 1.6) : t < 91.6 ? z(292, 582, 2.6 + lin(t, 87.2, 91.6) * .4) : z(230, 520, 1.6 - lin(t, 91.6, 95.6) * .3);
    } else {
      const pulse = .7 + .3 * Math.sin(t * 3);
      bg = <rect width="540" height="960" className="enz-final-bg"/>;
      fg = <><Person tx={-12} ty={70 + Math.sin(t * 1.2) * 2} s={3.2} scope="enzo-scope" t={t} expression="scared" gaze={[0, 3.2]} shine hideArms/>
        <ColdMist x={300} y={400} t={t} amount={.6} w={30} rise={90} size={.9} n={4}/>
        <BigHands t={t} crystals={1} frost={.22 + lin(t, 95.6, 98) * .18} glow={pulse} y={820} id="hands7"/>
        <Sparkles x={40} y={520} w={460} h={420} t={t} n={16}/></>;
      cam = `translate(${-270 * lin(t, 95.6, 100.5) * .06} ${-480 * lin(t, 95.6, 100.5) * .06}) scale(${1 + lin(t, 95.6, 100.5) * .06})`;
    }
    if (t > 95.6 && t < 95.9) shake = 3;
    fade = ramp(t, T.fade, 99.3);
  }
  const sx = shake ? Math.sin(t * 90) * shake : 0, sy = shake ? Math.cos(t * 77) * shake : 0;
  const sig = ramp(t, 98.5, 99.3);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`Enzo, cena ${f.scene.id}`} className="animation-canvas">
    <defs>
      <clipPath id="enzo-clip"><rect width="540" height="960"/></clipPath>
      <radialGradient id="enzo-mist"><stop offset="0" className="mist-in"/><stop offset="1" className="mist-out"/></radialGradient>
      <radialGradient id="enzo-glow"><stop offset="0" className="glow-in"/><stop offset="1" className="glow-out"/></radialGradient>
      <radialGradient id="enzo-edge" r=".75"><stop offset=".55" className="edge-in"/><stop offset="1" className="edge-out"/></radialGradient>
      <radialGradient id="enzo-vig" r=".75"><stop offset=".5" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient>
      <pattern id="ice-tex" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" className="ice-tex-bg"/><path d="M0 36L36 0M-9 9L9 -9M27 45L45 27M8 30L14 22M22 14L30 8" className="ice-tex-line"/></pattern>
    </defs>
    <rect width="540" height="960" className="scene-sky"/>
    <g clipPath="url(#enzo-clip)"><g transform={`translate(${sx} ${sy})`}><g transform={cam}>{bg}{fg}</g></g></g>
    {overlay}
    <EdgeFrost p={edge} t={t}/>
    <rect width="540" height="960" fill="url(#enzo-vig)" opacity={vig}/>
    {fade > 0 && <rect width="540" height="960" className="tp-black" opacity={fade}/>}
    {sig > 0 && <text x="270" y="905" textAnchor="middle" className="enz-signature" opacity={sig}>AURAX OCULTO</text>}
  </svg>;
}
