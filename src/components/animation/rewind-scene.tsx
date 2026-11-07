import type { ReactNode } from 'react';
import { getRewindFrame, ramp, lin, ease, clamp, T, REWIND_DURATION, rewindAmount, SHOT_STARTS } from '@/lib/rewind-timeline';
import { z, mix } from './gelo-world';
import { blob } from './ice';
import {
  Person, handAt, YellowMan, Bystander, Mug, Shards, Phone, Ball, Dial, Kitchen, Living, Stairs, Park, Skyline,
  CarFront, Street, RainR, Lamp, BusStop, StormStreet, Sparks, Dust, RewindFx, SnapRing,
} from './rewind-world';

type Shot = { el: ReactNode; cam?: string; shake?: number; flash?: number; vig?: number; night?: number; red?: number; gray?: number; mem?: number; fx?: [number, number] | undefined };

/* ---------- Scene 01: discovery ---------- */
function shot0(t: number): Shot {
  const p = lin(t, 0, 3.4);
  return { cam: z(270, 520, 1 + p * .12), vig: .45, el: <>
    <Skyline t={t} kind="gold" lit={.1}/>
    <Dial x={270} y={330} r={170} hour={.3 - t * .05} minute={.5 - t * .4} second={.9 - t * .9} glow={.6} cls="rw-dial-sky"/>
    <Person who="gabriel" x={60 + t * 40} g={850} s={.62} t={t} walking gaze={[2, -2]}/>
    {[0, 1].map(i => <Bystander key={i} x={460 - t * 30 + i * 60} y={840} s={1.3} t={t} seed={i + 1} walk={1} flip/>)}
  </> };
}
function shot1(t: number): Shot {
  const l = t - 3.4, back = l < .1 ? 0 : Math.min(5, Math.floor((l - .1) / .2) + 1), sec = (35 - back) / 60;
  return { cam: z(270, 480, 1.04 + l * .03), vig: .55, fx: l > .1 && l < 1.2 ? [.55, 0] : undefined, el: <>
    <rect x="-300" y="-300" width="1200" height="1600" className="rw-deep"/>
    <Dial x={270} y={480} r={225} hour={.33} minute={.58} second={sec} glow={.8} wedge={back / 60}/>
  </> };
}
/** Mug in the kitchen: held until it slips, falls and shatters. */
function mugFall(t: number, hand: readonly [number, number]) {
  if (t < T.slip) return <Mug x={hand[0]} y={hand[1] - 6} s={1.3}/>;
  const k = clamp((t - T.slip) / (T.crash - T.slip));
  if (k < 1) return <Mug x={mix(hand[0], hand[0] + 30, k)} y={mix(hand[1] - 6, 852, k * k)} rot={k * 220} s={1.3}/>;
  return <Shards x={hand[0] + 30} y={856} p={ease(lin(t, T.crash, T.crash + .6))} s={1.3}/>;
}
function shot2(t: number): Shot {
  const reach = t < T.slip ? -48 + Math.sin(t * 1.6) * 6 : -20, hand = handAt(220, 860, 1.25, reach);
  const surprised = t > T.slip + .1;
  return { cam: z(260 + (t - 5.6) * 4, 560, 1.12), shake: t > T.crash && t < T.crash + .25 ? 4 : 0, el: <>
    <Kitchen t={t}/>
    <Person who="gabriel" x={220} g={860} s={1.25} t={t} reach={reach} expression={surprised ? 'scared' : 'happy'} gaze={surprised ? [4, 5] : [2, 0]} shine/>
    {mugFall(t, hand)}
  </> };
}
function shot3(t: number): Shot {
  const ang = t > T.angry, clench = ramp(t, 11.5, 11.9);
  return { cam: z(270, 380, 1 + (t - 9.5) * .05), vig: .55, red: ang ? .12 : 0, el: <>
    <Kitchen t={t}/>
    <Person who="gabriel" x={270} g={1180} s={2.4} t={t} expression={ang ? 'angry' : 'sleeping'} shine hideArms/>
    <g opacity={clench}><circle cx={430} cy={880} r={44} className="gb-fist"/><path d="M398 868H462M400 888H460" className="rw-line"/></g>
  </> };
}
function shot4(t: number): Shot {
  // Rewind: shards gather (12.6–13.0) then the mug flies back up into his hand (13.0–13.6).
  const reach = t < 15.7 ? -46 : mix(-46, -78, ramp(t, 15.7, 16.3)), hand = handAt(220, 860, 1.25, reach);
  let mug: ReactNode;
  if (t < 13.0) mug = <Shards x={hand[0] + 30} y={856} p={1 - ease(lin(t, 12.6, 13.0))} s={1.3}/>;
  else if (t < 13.6) { const k = 1 - lin(t, 13.0, 13.6); mug = <Mug x={mix(hand[0], hand[0] + 30, k)} y={mix(hand[1] - 6, 852, k * k)} rot={k * 220} s={1.3}/>; }
  else mug = <Mug x={hand[0]} y={hand[1] - 6} s={1.3}/>;
  const after = t > 13.6;
  return { cam: z(250, 560 - ramp(t, 15.5, 17.5) * 60, 1.12 + ramp(t, 14, 18) * .25), el: <>
    <Kitchen t={t} man/>
    <Person who="gabriel" x={220} g={860} s={1.25} t={t} reach={reach} expression={after ? 'surprised' : 'angry'} gaze={after ? (t > T.whole ? [5, -1] : [4, 4]) : [0, 0]} shine/>
    {mug}
    <SnapRing cx={hand[0]} cy={hand[1]} p={lin(t, 13.6, 14.4)}/>
  </> };
}

/* ---------- Scene 02: first tests ---------- */
function phonePos(t: number, hand: readonly [number, number]): [number, number, number] {
  const edge: [number, number] = [505, 630];
  if (t < 19.5) return [mix(410, edge[0], lin(t, 18.1, 19.5)), 630, 0];
  if (t < 20.4) { const k = lin(t, 19.5, 20.4); return [edge[0] + k * 30, mix(630, 850, k * k), k * 260]; }
  if (t < 20.6) return [edge[0] + 30, 850, 260];
  if (t < 21.2) { const k = 1 - lin(t, 20.6, 21.2); return [edge[0] + k * 30, mix(630, 850, k * k), k * 260]; }
  if (t < 21.45) return [edge[0], 630 + lin(t, 21.2, 21.45) * 30, 0];
  return [hand[0], hand[1] - 4, 10];
}
function shot5(t: number): Shot {
  const gx = mix(250, 400, ramp(t, 20.9, 21.4)), reach = t > 20.9 ? mix(-10, -40, ramp(t, 20.9, 21.4)) : -20;
  const hand = handAt(gx, 860, 1.1, reach), [px, py, pr] = phonePos(t, hand);
  return { cam: z(330, 600, 1.05), el: <>
    <Living t={t}/>
    <Person who="gabriel" x={gx} g={860} s={1.1} t={t} reach={reach} walking={t > 20.9 && t < 21.4} expression={t > 21.5 ? 'happy' : t > 19.9 ? 'surprised' : 'curious'} gaze={[4, 3]} shine/>
    <Phone x={px} y={py} rot={pr} s={1.4}/>
    <SnapRing cx={px} cy={py} p={lin(t, 21.2, 21.9)}/>
  </> };
}
function shot6(t: number): Shot {
  const l = t - 22.0, x = 120 + l * 120, g = 300 + (x + 40) % 70 + Math.floor((x + 40) / 70) * 70 - 70;
  const trip = t < 22.45 ? ease(lin(t, 22.2, 22.45)) * 32 : t < 22.85 ? (1 - lin(t, 22.45, 22.85)) * 32 : 0;
  return { cam: z(x + 40, g - 160, 1.25), el: <>
    <Stairs/>
    <Person who="gabriel" x={x} g={g} s={.9} t={t} walking lean={trip} expression={trip > 10 ? 'scared' : 'curious'} gaze={[3, 4]}/>
  </> };
}
function shot7(t: number): Shot {
  const face: [number, number] = [262, 500];
  let bx: number, by: number;
  if (t < 24.0) { const k = lin(t, 23.0, 24.0); bx = mix(640, face[0] + 20, k); by = mix(380, face[1], k) - Math.sin(k * Math.PI) * 60; }
  else if (t < 24.55) { const k = 1 - lin(t, 24.0, 24.55); bx = mix(640, face[0] + 20, k); by = mix(380, face[1], k) - Math.sin(k * Math.PI) * 60; }
  else { const k = lin(t, 24.55, 25.7); bx = mix(640, -120, k); by = mix(380, 470, k) - Math.sin(k * Math.PI) * 60; }
  const duck = t > 24.6 ? ease(lin(t, 24.6, 24.9)) * (1 - ramp(t, 25.6, 26.2)) : 0;
  return { cam: z(300, 560, 1.15), el: <>
    <Park t={t} man/>
    <path d={`M640 380Q${(640 + face[0]) / 2} ${(380 + face[1]) / 2 - 90} ${face[0] + 20} ${face[1]}`} className="rw-ghost-path" opacity={t > 24.55 && t < 25.6 ? .6 : 0}/>
    <Person who="gabriel" x={190} g={860} s={1.15} t={t} lean={-duck * 26} expression={t < 24.55 ? 'scared' : t > 25.2 ? 'happy' : 'surprised'} gaze={[6, -2]} shine/>
    <Ball x={bx} y={by} r={20} rot={t * 500}/>
  </> };
}
function shot8(t: number): Shot {
  const c = ease(lin(t, 26.7, 27.3)), spin = t > 27.6 ? -(t - 27.6) * 3 : 0;
  return { cam: z(270, 480, 1 + (t - 26.6) * .03), vig: .6, fx: t > 27.6 && t < 29.6 ? [.8, 0] : undefined, el: <>
    <rect x="-300" y="-300" width="1200" height="1600" className="rw-deep"/>
    <Dial x={270} y={300} r={150} hour={.2 + spin * .02} minute={.4 + spin * .2} second={.7 + spin} glow={.5} cls="rw-dial-sky"/>
    <g className="gb-scope">
      <path d="M120 1000L180 640Q200 600 250 610L330 640L300 1000Z" className="gb-sleeve"/>
      <rect x="168" y="600" width="160" height="56" rx="16" className="rw-watch-band" transform="rotate(10 248 628)"/>
      <circle cx={250} cy={628} r={38} className="rw-watch-case"/>
      <Dial x={250} y={628} r={30} hour={.2 + spin * .02} minute={.4 + spin * .2} second={.7 + spin} cls="rw-watch-face"/>
      <g transform={`translate(260 520) scale(${1 - c * .15})`}><path d={c > .5 ? 'M-70 40Q-80 -40 -20 -60Q60 -70 80 -10Q86 40 40 60Q-40 76 -70 40Z' : 'M-70 40Q-100 -60 -60 -120L-30 -150Q-10 -130 -24 -80L0 -150Q20 -130 10 -70L36 -140Q56 -120 40 -60L70 -110Q86 -90 70 -20Q86 40 40 60Q-40 76 -70 40Z'} className="gb-fist"/>
        {c > .5 && <path d="M-40 -40Q-30 -10 -40 20M0 -50Q10 -20 0 20M36 -40Q46 -10 36 20" className="rw-line"/>}</g>
    </g>
  </> };
}
function shot9(t: number): Shot {
  const toss = Math.abs(Math.sin((t - 30.2) * 3.2)), reach = -40, hand = handAt(150 + (t - 30.2) * 60, 860, 1.1, reach);
  return { cam: z(240 + (t - 30.2) * 40, 580, 1.08), el: <>
    <Park t={t}/>
    <Person who="gabriel" x={150 + (t - 30.2) * 60} g={860} s={1.1} t={t} walking reach={reach} expression="happy" gaze={[3, -4]} shine/>
    <circle cx={hand[0] + 6} cy={hand[1] - 12 - toss * 120} r="13" className="rw-apple"/>
    <path d={`M${hand[0] + 6} ${hand[1] - 25 - toss * 120}q3 -8 9 -9`} className="rw-apple-stem"/>
  </> };
}

/* ---------- Scene 03: the street ---------- */
type StreetState = { girl: number; car: number; gx: number; run: boolean; gab?: 'curious' | 'scared' | 'surprised' | 'happy' | 'angry'; lean?: number; talk?: number; gReach?: number | undefined; girlBack?: number; light?: 'red' | 'green' | 'yellow' };
function streetEl(t: number, s: StreetState) {
  return <>
    <Street t={t} man light={s.light ?? 'green'}/>
    {s.car <= 1 && <CarFront d={Math.max(0, s.car)} t={t}/>}
    <Person who="girl" x={s.girl} g={805} s={.72} t={t} walking={!s.girlBack} reach={-55} gaze={[3, 5]} expression={s.girlBack ? 'surprised' : 'curious'}
      extra={<g transform="translate(160 150) rotate(-20)"><rect x="-6" y="-10" width="12" height="20" rx="2" className="rw-phone"/><rect x="-4" y="-8" width="8" height="15" className="rw-phone-screen"/></g>}/>
    <Person who="gabriel" x={s.gx} g={880} s={.8} t={t} running={s.run} walking={s.run} flip lean={s.lean ?? 0} expression={s.gab ?? 'curious'} gaze={[5, -1]} talk={s.talk ?? 0} reach={s.gReach}/>
    {s.car > 1 && <CarFront d={Math.min(1.9, s.car)} t={t}/>}
  </>;
}
/** Attempt state by phase τ (0 = car appears far away, L = car reaches the crosswalk). Gabriel waits on the right kerb. */
function attempt(k: 1 | 2 | 3, tau: number): StreetState {
  const L = k === 1 ? 3.5 : k === 2 ? 2.1 : 2.2, q = tau / L;
  const girl = 150 + clamp(q) * 120;
  if (k === 1) return { girl, car: q, gx: tau > 2.27 ? 480 - (tau - 2.27) * 110 : 480, run: tau > 2.27, gab: tau > 2.0 ? 'scared' : 'curious' };
  if (k === 2) { const fallen = tau > 1.4; return { girl, car: q, gx: Math.max(370, 480 - tau * 110), run: !fallen, gab: 'scared', talk: tau > 1.0 && tau < 1.4 ? Math.abs(Math.sin(tau * 16)) : 0, lean: fallen ? ease((tau - 1.4) / .3) * 70 : 0 }; }
  const pull = ease(clamp((tau - 1.1) / .6));
  return { girl: girl + pull * (330 - girl), car: q + Math.max(0, tau - L) * 1.6, gx: mix(400, 330, clamp(tau / 1.0)) + pull * 80, run: tau > .2 && tau < 1.0, gab: 'scared', gReach: tau > .9 ? -70 : undefined, girlBack: pull > .1 ? 1 : 0 };
}
function shot10(t: number): Shot {
  const st: StreetState = { girl: mix(20, 150, lin(t, 32.5, 36.2)), car: -1, gx: 480, run: false };
  return { cam: z(270, 560 + (t - 32.5) * -6, 1.05 + (t - 32.5) * .02), el: streetEl(t, st) };
}
function shot11(t: number): Shot {
  const q = lin(t, 36.2, 38.4);
  return { cam: z(270, 480 + q * 40, 1.6 - q * .2), shake: q * 2, el: <>
    {streetEl(t, { ...attempt(1, (t - 36.2)), gx: -200 })}
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${270 + (i - 4.5) * 40} ${470 + q * 100}l${(i - 4.5) * 30} 60`} className="rw-speed" opacity={q}/>)}
  </> };
}
function shot12(t: number): Shot {
  const tau = t - 36.2, st = attempt(1, tau);
  return { cam: z(240, 640, 1.05), shake: t > 39.2 ? 3 : 0, flash: ramp(t, 39.55, 39.75) * (1 - ramp(t, 39.9, 40.2)), el: streetEl(t, st) };
}
function shot13(t: number): Shot {
  const tau = 3.5 * (1 - lin(t, 40.2, 41.5)); // world runs backwards
  return { cam: z(250, 620, 1.05), el: streetEl(t, { ...attempt(1, tau), light: 'green' }) };
}
function shot14(t: number): Shot {
  const tau = t - 41.5, st = attempt(2, tau);
  return { cam: z(240, 640, 1.08), shake: tau > 1.4 && tau < 1.6 ? 4 : 0, flash: ramp(t, 43.45, 43.65) * (1 - ramp(t, 43.7, 43.85)), el: streetEl(t, st) };
}
function shot15(t: number): Shot {
  const tau = 2.1 * (1 - lin(t, 43.8, 45.2));
  return { cam: z(250, 620, 1.05), el: streetEl(t, attempt(2, tau)) };
}
function shot16(t: number): Shot {
  // Slow observation: light, car, her step — camera visits each.
  const a = ramp(t, 46.6, 47.2), b = ramp(t, 47.4, 47.9), c = ramp(t, 48.05, 48.45);
  const cx = mix(mix(mix(260, 90, a), 270, b), 210, c), cy = mix(mix(mix(620, 520, a), 470, b), 790, c), s = mix(mix(mix(1.05, 2.2, a), 2.6, b), 2.2, c);
  const st: StreetState = { girl: 150 + (t - 45.2) * 4, car: .02 + (t - 45.2) * .004, gx: 480 - (t - 45.2) * 25, run: false, gab: 'curious', light: t > 46.9 ? 'yellow' : 'green' };
  return { cam: z(cx, cy, s), gray: .35, vig: .55, el: <>
    {streetEl(t * .25, st)}
    {[[70, 506, a * (1 - b)], [270, 470, b * (1 - c)], [190, 800, c]].map(([x, y, o], i) => <circle key={i} cx={x} cy={y} r={30 + Math.sin(t * 6) * 3} className="rw-focus" opacity={o}/>)}
  </> };
}
function shot17(t: number): Shot {
  const tau = t - 48.5, st = attempt(3, tau);
  const lines = lin(t, 50.8, 51.3);
  return { cam: z(240, 640, 1.08), shake: tau > 2.4 && tau < 2.9 ? 3 : 0, el: <>
    {streetEl(t, { ...st, light: 'yellow' })}
    {lines > 0 && lines < 1 && Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-20 ${700 + i * 22}H560`} className="rw-speed" opacity={1 - lines}/>)}
  </> };
}
function shot18(t: number): Shot {
  const l = t - 51.3;
  return { cam: z(270, 560, 1.4 + l * .05), el: <>
    <Street t={t} man light="red"/>
    <Person who="girl" x={190} g={900} s={1.05} t={t} reach={-20} expression="surprised" gaze={[3, 0]} shine/>
    <Person who="gabriel" x={360} g={910} s={1.08} t={t} flip reach={-30} expression={l > .7 ? 'happy' : 'surprised'} gaze={[4, 0]} shine/>
  </> };
}

/* ---------- Scene 04: the storm ---------- */
function shot19(t: number): Shot {
  const l = t - 52.9;
  return { cam: z(250 + l * 20, 560, 1.1), el: <>
    <Skyline t={t} kind="sunset" lit={.35}/>
    {[120, 190].map((r, i) => <circle key={r} cx={150 + l * 60} cy={620} r={r} className="rw-ring" opacity={.25} strokeDasharray={`${r * .8} ${r * .4}`} transform={`rotate(${t * (40 + i * 30)} ${150 + l * 60} 620)`}/>)}
    <Person who="gabriel" x={150 + l * 60} g={850} s={1.05} t={t} walking expression="happy" gaze={[3, -2]} shine/>
  </> };
}
function shot20(t: number): Shot {
  const fl = ramp(t, 55.75, 55.85) * (1 - ramp(t, 55.9, 56.4));
  return { cam: z(270, 560 - (t - 55.7) * 20, 1 + (t - 55.7) * .05), night: .15, el: <>
    <StormStreet t={t} flash={fl}/>
    {fl > .2 && <path d="M380 -40L350 120L390 130L330 330" className="rw-bolt"/>}
    <Lamp x={260} g={840} t={t}/><BusStop x={320} g={840} s={.8}/>
    <RainR t={t} n={110}/>
  </> };
}
function crowd(t: number, back = 0) {
  return [0, 1, 2, 3, 4].map(i => <Bystander key={i} x={350 + i * 32 + back * (40 + i * 10)} y={840} s={1.4} t={t} seed={i + 2} flip={i % 2 === 0} umbrella={i === 1 || i === 3} walk={back > 0 && back < 1 ? 1 : 0}/>);
}
function poleAngle1(t: number) { return t < 57.8 ? Math.sin(t * 9) * .6 : 2 + ease(lin(t, 57.8, 60.4)) * 22 + Math.sin(t * 13) * 1.2; }
function shot21(t: number): Shot {
  return { cam: z(300, 560, 1.12 + (t - 57.3) * .03), night: .15, el: <>
    <StormStreet t={t}/>
    <BusStop x={330} g={840} s={1}/>{crowd(t)}
    <Lamp x={230} g={845} angle={poleAngle1(t)} t={t}/>
    <Person who="gabriel" x={90} g={900} s={.95} t={t} expression="scared" gaze={[5, -5]}/>
    <RainR t={t} n={110}/>
  </> };
}
function shot22(t: number): Shot {
  let ang: number;
  if (t < 61.2) ang = mix(24, 0, lin(t, 60.4, 61.2));
  else ang = -Math.min(84, Math.pow(Math.max(0, t - 61.4) * 2.2, 2) * 20);
  const hit = ang <= -83.9, dust = lin(t, 62.3, 63.6);
  const leftCrowd = [0, 1, 2].map(i => <Bystander key={i} x={20 + i * 34} y={850} s={1.35} t={t} seed={i + 5} umbrella={i === 1}/>);
  return { cam: z(260, 580, 1.08), night: .15, shake: hit && t < 62.8 ? 5 : 0, flash: ramp(t, 62.2, 62.3) * (1 - ramp(t, 62.35, 62.7)), el: <>
    <StormStreet t={t}/>
    <BusStop x={330} g={840} s={1}/>{crowd(t)}{leftCrowd}
    <Lamp x={230} g={845} angle={ang} t={t} lit={hit ? .3 : 1}/>
    <Sparks x={-120} y={800} p={lin(t, 62.3, 63.2)} n={18}/><Dust x={20} y={840} p={dust} w={220}/>
    <Person who="gabriel" x={230 + 160} g={930} s={.95} t={t} flip expression="scared" gaze={[5, -3]}/>
    <RainR t={t < 61.2 ? 120 - t : t} n={110}/>
  </> };
}
function shot23(t: number): Shot {
  const jit = Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0 ? 1 : .2);
  return { cam: z(270, 400, 1 + (t - 63.8) * .04), night: .2, vig: .6, el: <>
    <StormStreet t={t}/>
    {[160, 240].map((r, i) => <circle key={r} cx={270} cy={420} r={r + jit} className="rw-ring" opacity={.35 + .25 * Math.sin(t * 17 + i)} strokeDasharray={`${r * .5} ${r * .2}`} transform={`rotate(${-t * 90 + jit * 5} 270 420)`}/>)}
    <Person who="gabriel" x={270} g={1150} s={2.3} t={t} expression="scared" gaze={[jit * .3, -2]} shine hideArms/>
    <RainR t={t} n={120}/>
  </> };
}
function shot24(t: number): Shot {
  const l = t - 66.3, beat = Math.max(0, Math.sin((t - 66.3) * Math.PI * 2 * 1.4)) ** 6;
  return { cam: z(270, 330, 1.25 + l * .35 + beat * .03), night: .2, red: .1 + beat * .15, vig: .7, flash: ramp(t, 67.6, 67.7) * (1 - ramp(t, 67.75, 68.2)), el: <>
    <StormStreet t={t}/>
    <Person who="gabriel" x={270} g={1150} s={2.3} t={t} expression={t > 67.55 ? 'angry' : 'scared'} shine hideArms/>
    <RainR t={t} n={120}/>
  </> };
}

/* ---------- Scene 05: the final turn ---------- */
function shot25(t: number): Shot {
  // Rewind first, then he sprints and pushes the crowd back before the lamp falls onto the empty kerb.
  const rew = t < 69.6, ang = rew ? mix(-84, 0, lin(t, 68.4, 69.6)) : 2 + Math.min(80, Math.pow(Math.max(0, t - 70.6) * 1.15, 2) * 70);
  const gx = rew ? 390 : mix(90, 320, ease(lin(t, 69.6, 70.6))), push = ease(lin(t, 70.5, 71.1));
  const hit = ang >= 81;
  return { cam: z(280, 580, 1.1), night: .15, shake: hit && t < 72.4 ? 5 : 0, el: <>
    <StormStreet t={t}/>
    <BusStop x={330 + push * 70} g={840} s={1}/>{crowd(t, push)}
    <Lamp x={230} g={845} angle={ang} t={t} lit={hit ? .4 : 1}/>
    <Sparks x={605} y={820} p={lin(t, 71.9, 72.9)}/><Dust x={560} y={840} p={lin(t, 71.9, 73.3)} w={200}/>
    {!rew && <Person who="gabriel" x={gx} g={900} s={.95} t={t} running={t < 70.6} walking={t < 70.6} reach={t > 70.4 ? -80 : undefined} armL={t > 70.4 ? -70 : undefined} expression="scared" gaze={[5, 0]}/>}
    <RainR t={rew ? 140 - t : t} n={110}/>
  </> };
}
function shot26(t: number): Shot {
  const lift = ease(lin(t, 73.9, 74.8)), reach = mix(-10, -95, lift);
  return { cam: z(260, 520, 1.45 + (t - 73.3) * .05), night: .12, el: <>
    <StormStreet t={t}/>
    <Person who="gabriel" x={230} g={900} s={1.25} t={t} reach={reach} expression={lift > .5 ? 'surprised' : 'happy'} gaze={lift > .4 ? [5, 5] : [2, -3]} shine/>
    {[0, 1, 2].map(i => { const p = ((t - 73.4) * .8 + i * .33) % 1; return <path key={i} d={blob(340 + p * 40, 520 - p * 50, 8 + p * 16, i + 40, 10, .4)} className="rw-breath" opacity={(1 - p) * .5 * (1 - lift)}/>; })}
    <RainR t={t} n={70} amount={.7}/>
  </> };
}
function shot27(t: number): Shot {
  const twitch = Math.sin(t * 25) > .3 ? .5 / 60 : 0, l = t - 75.7;
  const ghosts: Array<[number, ReactNode]> = [
    [76.4, <Mug x={0} y={0} s={2}/>], [77.2, <g transform="scale(.5)"><CarFront d={.6} t={t}/></g>], [78.0, <path d="M0 40V-60L30 -70" className="rw-lamp-pole"/>],
  ];
  return { cam: z(270, 480, 1.05 + l * .04), vig: .6, el: <>
    <StormStreet t={t}/><rect x="-300" y="-300" width="1200" height="1600" className="rw-deep" opacity=".75"/>
    <g className="gb-scope"><path d="M-60 760L540 600V1100H-60Z" className="gb-sleeve"/></g>
    <rect x="70" y="390" width="400" height="190" rx="40" className="rw-watch-band"/>
    <circle cx={270} cy={480} r={180} className="rw-watch-case"/>
    <Dial x={270} y={480} r={158} hour={11.9 / 12} minute={55 / 60} second={34 / 60 + twitch} cls="rw-watch-face" glow={.3 + .2 * Math.sin(t * 5)}/>
    {ghosts.map(([at, g], i) => { const o = ramp(t, at, at + .25) * (1 - ramp(t, at + .55, at + .8)); return o > 0 ? <g key={i} transform={`translate(${200 + i * 70} ${430 + i * 30})`} opacity={o * .45} className="rw-ghost">{g}</g> : null; })}
    <rect x="90" y="300" width="360" height="360" rx="180" className="rw-glass-shine" transform="rotate(-25 270 480)"/>
  </> };
}
/** Memory inserts: earlier shots where the yellow man was already watching. */
const MEMORIES: Array<[number, number, (t: number) => Shot, number]> = [[81.0, 81.75, shot4, 14.5], [81.9, 82.65, shot7, 25.4], [82.8, 83.6, shot10, 34.6]];
function shot28(t: number): Shot {
  const mem = MEMORIES.find(([a, b]) => t >= a && t < b);
  if (mem) { const s = mem[2](mem[3] + (t - mem[0]) * .3); return { ...s, mem: 1, flash: lin(t, mem[0], mem[0] + .12) < 1 ? .5 * (1 - lin(t, mem[0], mem[0] + .12)) : 0 }; }
  const l = t - 79.3, eyes = ramp(t, T.stare, T.stare + .5);
  return { cam: z(mix(270, 400, ramp(t, 79.3, 85.5)), mix(560, 620, ramp(t, 79.3, 85.5)), 1 + ramp(t, 83.6, 85.6) * 1.1 + l * .02), night: .2, vig: .6, flash: ramp(t, 79.35, 79.45) * (1 - ramp(t, 79.5, 79.9)) * .7, el: <>
    <StormStreet t={t}/>
    <Lamp x={460} g={830} t={t} h={300}/>
    <YellowMan x={410} g={830} s={.85} t={t} eyes={eyes}/>
    <Bystander x={120} y={860} s={1.5} t={t} seed={3} umbrella walk={1}/>
    <RainR t={t} n={120}/>
  </> };
}
function shot29(t: number): Shot {
  const raise = ease(lin(t, 86.3, 87.2)), rev = t > 87.7;
  return { cam: z(300, 560, 1.15), night: .2, vig: .6, el: <>
    <StormStreet t={t}/>
    <Lamp x={470} g={780} t={t} h={260}/>
    <YellowMan x={420} g={780} s={.75} t={t} eyes={1} raise={raise}/>
    <Person who="gabriel" x={120} g={1180} s={2.1} t={t} expression="scared" gaze={[7, -1]} shine hideArms/>
    <RainR t={rev ? 175 - t : t} n={120}/>
  </> };
}
function shot30(t: number): Shot {
  const l = t - 89.4, back = Math.max(0, 89.4 - t) || -(l);
  return { cam: z(270, mix(560, 420, ease(lin(t, 89.4, 93))), mix(1.4, .95, ease(lin(t, 89.4, 93)))), night: .25, vig: .6, el: <>
    <StormStreet t={t}/>
    <Dial x={270} y={260} r={190} hour={.99 + back * .02} minute={.92 + back * .3} second={.57 + back * 1.6} glow={.7} cls="rw-dial-sky"/>
    <Lamp x={300} g={830} t={t} h={300}/>
    <YellowMan x={260} g={830} s={.55} t={t} eyes={1} raise={1}/>
    <RainR t={-t} n={120}/>
  </> };
}
const SHOTS = [shot0, shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot9, shot10, shot11, shot12, shot13, shot14, shot15, shot16, shot17, shot18,
  shot19, shot20, shot21, shot22, shot23, shot24, shot25, shot26, shot27, shot28, shot29, shot30];
export const REWIND_SHOT_COUNT = SHOTS.length;

const SKIES = ['day', 'night', 'storm', 'sunset', 'gold', 'memory'] as const;
export function RewindScene({ time }: { time: number }) {
  const f = getRewindFrame(time), t = f.t;
  const s = (SHOTS[f.shot] ?? shot0)(t);
  const shake = s.shake ?? 0, sx = shake ? Math.sin(t * 90) * shake : 0, sy = shake ? Math.cos(t * 77) * shake : 0;
  const rw = Math.max(rewindAmount(t), s.fx?.[0] ?? 0);
  const fade = ramp(t, T.fade, REWIND_DURATION - .2), open = 1 - ramp(t, 0, .5);
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={`E se você pudesse voltar 5 segundos no tempo, cena ${f.scene.id}`} className="animation-canvas gelo-film exodo-film rewind-film" data-shot={f.shot} data-shot-start={SHOT_STARTS[f.shot]}>
    <defs>
      <clipPath id="rw-clip"><rect width="540" height="960"/></clipPath>
      {SKIES.map(k => <linearGradient key={k} id={`gl-sky-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset=".3" className={`gl-${k}-top`}/><stop offset=".43" className={`gl-${k}-mid`}/><stop offset=".55" className={`gl-${k}-low`}/></linearGradient>)}
      <radialGradient id="gl-vig" r=".75"><stop offset=".5" className="l2-vig-in"/><stop offset="1" className="l2-vig-out"/></radialGradient>
      <radialGradient id="ex-lamp-glow"><stop offset="0" className="ex-lampglow-in"/><stop offset="1" className="ex-lampglow-out"/></radialGradient>
      <radialGradient id="ex-fire-glow"><stop offset="0" className="ex-fireglow-in"/><stop offset="1" className="ex-fireglow-out"/></radialGradient>
      <radialGradient id="rw-blue-glow"><stop offset="0" className="rw-bglow-in"/><stop offset="1" className="rw-bglow-out"/></radialGradient>
      <radialGradient id="rw-head-glow"><stop offset="0" className="rw-hglow-in"/><stop offset="1" className="rw-hglow-out"/></radialGradient>
      <radialGradient id="rw-sun-beam" cx=".8" cy=".3" r=".9"><stop offset="0" className="rw-beam-in"/><stop offset="1" className="rw-beam-out"/></radialGradient>
    </defs>
    <rect width="540" height="960" className="gl-base"/>
    <g clipPath="url(#rw-clip)"><g transform={`translate(${sx} ${sy})`}><g transform={s.cam ?? ''}>{s.el}</g></g>
      {rw > 0 && <g transform={`translate(${8 * rw} 0)`} opacity={.22 * rw} className="rw-ghost-layer"><g transform={s.cam ?? ''}>{s.el}</g></g>}
      {(s.night ?? 0) > 0 && <rect width="540" height="960" className="gl-night" opacity={s.night}/>}
      {(s.red ?? 0) > 0 && <rect width="540" height="960" className="ex-red-wash" opacity={s.red}/>}
      {(s.gray ?? 0) > 0 && <rect width="540" height="960" className="rw-gray" opacity={s.gray}/>}
      {(s.mem ?? 0) > 0 && <rect width="540" height="960" className="rw-memory" opacity={.45}/>}
      <RewindFx t={t} p={rw}/>
    </g>
    <rect width="540" height="960" fill="url(#gl-vig)" opacity={s.vig ?? .38}/>
    {(s.flash ?? 0) > 0 && <rect width="540" height="960" className="gl-flash" opacity={Math.min(1, s.flash ?? 0)}/>}
    {open > 0 && <rect width="540" height="960" className="tp-black" opacity={open}/>}
    {fade > 0 && <rect width="540" height="960" className="tp-black" opacity={fade}/>}
  </svg>;
}
