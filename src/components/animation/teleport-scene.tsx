import { getTpFrame } from '@/lib/teleport-timeline';
import { Leo } from './leo';

function Park({ t }: { t: number }) {
  return <g className="environment">
    <circle cx="440" cy="190" r="48" className="scene-sun"/>
    <path className="scene-cloud" d="M38 225Q24 203 43 191Q54 167 76 183Q101 168 113 197Q137 195 132 217Z" transform={`translate(${(t * 4) % 600 - 60} 0)`}/>
    <path className="scene-cloud" d="M38 225Q24 203 43 191Q54 167 76 183Q101 168 113 197Q137 195 132 217Z" transform={`translate(${(t * 2.5 + 300) % 640 - 100} -70) scale(.8)`}/>
    <path className="building-back" d="M0 430H70V380H130V440H200V395H260V450H330V370H380V300H400V370H430V420H540V660H0Z"/>
    <path className="park-hill" d="M0 560Q140 500 270 545Q400 590 540 530V660H0Z"/>
    {[70, 300, 470].map((x, i) => <g key={x} transform={`translate(${x} 0) rotate(${Math.sin(t * 1.3 + i) * 1.2} 0 650)`}><path className="tree-trunk" d="M0 650V500"/><path className="tree-leaves" d="M-40 515Q-62 485 -40 460Q-50 420 -15 410Q25 395 45 432Q72 460 42 486Q48 520 8 528Z"/></g>)}
    <rect y="645" width="540" height="315" className="park-grass"/>
    <path className="park-path" d="M0 760Q270 720 540 760V860Q270 820 0 860Z"/>
    <g transform="translate(330 620)"><rect width="150" height="16" rx="4" className="desk"/><rect y="-38" width="150" height="12" rx="4" className="desk"/><path d="M12 16V48M138 16V48" className="diagram-line"/></g>
    <g transform="translate(250 0)"><path d="M0 760V560" className="diagram-line"/><circle cy="550" r="16" className="lamp"/></g>
  </g>;
}

function Strange({ t, dark }: { t: number; dark: boolean }) {
  return <g className={`environment ${dark ? 'strange-dark' : ''}`}>
    <rect width="540" height="960" className="strange-sky"/>
    {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 97) % 540} cy={(i * 53) % 420 + 120} r={1.5 + (i % 3)} className="strange-star" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i))}/>)}
    <circle cx="410" cy="230" r="70" className="strange-moon"/><circle cx="120" cy="300" r="28" className="strange-moon2"/>
    <path className="strange-far" d="M0 560L60 470L120 540L190 430L260 530L330 450L400 540L470 460L540 520V700H0Z"/>
    <g transform={`translate(${Math.sin(t * 0.3) * 6} 0)`}><path className="strange-rock" d="M30 700Q40 520 120 520Q200 520 200 640L170 640Q170 560 120 560Q72 560 70 700Z"/><path className="strange-rock" d="M400 700L430 560L470 580L500 700Z"/></g>
    <rect y="700" width="540" height="260" className="strange-ground"/>
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={(i * 71 + t * 12) % 560 - 10} cy={720 - ((t * 20 + i * 90) % 520)} r="3" className="strange-spore"/>)}
  </g>;
}

export function TeleportScene({ time }: { time: number }) {
  const f = getTpFrame(time);
  const strange = f.n >= 5;
  const ground = strange ? 820 : 845;
  let cam = '';
  if (f.n === 4) { const z = 1 + Math.min(1, f.local / 6) * 0.25; cam = `translate(${270 - z * 270} ${480 - z * 520}) scale(${z})`; }
  if (f.n === 7) { const z = 1 + Math.min(1, f.local / 13.5) * 0.9; cam = `translate(${270 - z * 270} ${560 - z * 620}) scale(${z})`; }
  if (f.n === 1 && f.local > 5 && f.local < 9) { const z = 1.15; cam = `translate(${270 - z * 270} ${700 - z * 700}) scale(${z})`; }
  const breathe = f.n >= 6 ? 1 + Math.sin(f.t * 2.4) * 0.012 : 1;
  const stretch = 1 + (1 - f.vis) * 0.6;
  const heroX = f.x + 87;
  const shake = f.n === 6 && f.ring.length ? Math.sin(f.t * 80) * 4 : 0;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`Teletransporte, cena ${f.scene.id}`} className="animation-canvas">
    <defs><clipPath id="tp-clip"><rect width="540" height="960"/></clipPath><radialGradient id="tp-glow"><stop offset="0" className="tp-glow-in"/><stop offset="1" className="tp-glow-out"/></radialGradient></defs>
    <rect width="540" height="960" className="scene-sky"/>
    <g clipPath="url(#tp-clip)"><g transform={`${cam} translate(${shake} 0)`}>
      {strange ? <Strange t={f.t} dark={f.n >= 6}/> : <Park t={f.t}/>}
      {f.n === 4 && <g opacity={Math.min(1, f.local / 2)}><path d="M455 420L470 330L485 420Z" className="far-tower"/><circle cx="470" cy="325" r={6 + Math.sin(f.t * 5) * 2} className="tp-target"/></g>}
      {f.aura > 0 && f.vis > 0 && <circle cx={heroX} cy={ground - 190 + f.y} r={150 + f.aura * 60 + Math.sin(f.t * 9) * 6} fill="url(#tp-glow)" opacity={Math.min(1, f.aura)}/>}
      <ellipse cx={heroX} cy={ground + f.y} rx={70 * f.vis} ry="12" className="ground-shadow"/>
      {f.vis > 0 && <g opacity={f.vis} transform={`translate(${heroX} ${ground + f.y}) scale(${f.dir * 1.15 * f.vis} ${1.15 * stretch * breathe}) translate(-87 -348)`}>
        <g className="hero-tele"><Leo time={f.t} walking={f.walking} expression={f.expression} backpack={false}/></g>
      </g>}
      {f.ring.map((r, i) => <g key={i} transform={`translate(${r.x + 87} ${ground - 180 + r.y})`} opacity={1 - r.p}>
        <ellipse rx={40 + r.p * 110} ry={150 + r.p * 60} className={r.fail ? 'tp-ring tp-fail' : 'tp-ring'}/>
        {Array.from({ length: 8 }, (_, k) => { const a = k / 8 * Math.PI * 2; const d = 30 + r.p * 140; return <circle key={k} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 1.4} r={5 * (1 - r.p) + 1} className={r.fail ? 'tp-spark tp-fail' : 'tp-spark'}/>; })}
      </g>)}
    </g></g>
    {(f.flash > 0 || (f.n === 4 && f.local > 9.3)) && <rect width="540" height="960" className="tp-flash" opacity={f.n === 4 ? Math.min(1, (f.local - 9.3) / 0.6) : f.flash}/>}
    {f.n === 7 && <rect width="540" height="960" className="tp-vignette" opacity={Math.min(0.7, f.local / 14)}/>}
    {f.black && <rect width="540" height="960" className="tp-black"/>}
  </svg>;
}
