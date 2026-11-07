import { getFrame, IMPACT_CENTER } from '@/lib/leo-timeline';
import { Leo } from './leo';
import { Street, BusInterior, Bedroom, Classroom, Desk, Clock, AirDiagram } from './environments';

export function AnimationScene({time,model=false}:{time:number;model?:boolean}) {
 const f=getFrame(time), n=f.n;
 const bus=n===8||n===9||(n===7&&time>=32.58);
 const room=n>=15&&n<=17;
 const exam=n>=18;
 const science=n>=10&&n<=14;
 const sleeping=room&&(n!==15||time>=65.86);
 const expression=n===5?'surprised':n>=19||n===10||n===14||n===17?'worried':sleeping&&n!==17?'sleeping':n===2||n===7||n===15?'happy':'curious';
 let camera='';
 if(n===4&&time>=17.74) camera='translate(-72 -190) scale(1.3)';
 if(n===6) camera=time<24.82?'translate(10 -200) scale(1.35)':time<26.66?'translate(-120 -140) scale(1.3)':'translate(-230 -415) scale(1.6)';
 if(n===12) camera='translate(-100 -245) scale(1.45)';
 if(n>=19) {const z=1.4+f.progress*(n===20?.28:.1);camera=`translate(${270-z*270} ${435-z*520}) scale(${z})`;}
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 960" role="img" aria-label={model?'Modelo vetorial definitivo de Léo':`Animação da cena ${f.scene.id}`} data-scene={f.scene.id} className={`animation-canvas ${f.frozen?'world-frozen':''} ${n>=19?'suspense-scene':''}`}>
 <defs><pattern id="street-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" className="grid-line"/></pattern><clipPath id="frame-clip"><rect width="540" height="960"/></clipPath></defs>
 <rect width="540" height="960" className="scene-sky"/>
 {model?<><rect width="540" height="960" fill="url(#street-grid)"/><circle cx="270" cy="430" r="190" className="model-circle"/><text x="270" y="130" textAnchor="middle" className="model-title">LÉO</text><ellipse cx="270" cy="805" rx="104" ry="14" className="ground-shadow"/><g transform="translate(94 264) scale(1.95)"><Leo time={time} expression="happy"/></g></>:<>
 <g clipPath="url(#frame-clip)"><g transform={camera}>
 {bus?<BusInterior time={f.worldTime} driver={n===9&&time>=42.30}/>:room?<Bedroom time={f.worldTime}/>:exam?<Classroom time={f.worldTime}/>:science?<><rect width="540" height="960" fill="url(#street-grid)"/>{n>=11&&<AirDiagram time={f.localTime} frozen={f.frozen} light={n===13||(n===14&&time>=59.78)}/>}</>:<Street time={f.worldTime}/>}
 {sleeping?<g data-testid="leo-pose" transform="translate(40 681) rotate(-90) scale(.95)"><Leo time={time} expression={expression} backpack={false}/></g>:<>
 <ellipse cx={bus?150:f.leoX+100} cy={bus||exam?823:847} rx="70" ry="12" className="ground-shadow"/>
 <g data-testid="leo-pose" transform={`translate(${bus?45:exam?164:f.leoX} ${bus?450:exam?433:445}) scale(1.15 ${n===12?1.15+Math.sin(f.localTime*3)*.015:1.15})`}><Leo time={time} walking={f.walk&&!bus} running={n===3||n===4} seated={bus||exam} expression={expression} backpack={!room&&!exam&&!science}/></g>
 </>}
 {exam&&<Desk/>}
 {n>=19&&<rect x="40" y="180" width="460" height="160" className="board"/>}
 {n===6&&time>=26.66&&<path d="M370 482Q355 503 370 514Q391 504 370 482Z" className="suspended-drop"/>}
 {n===4&&time>=17.74&&<g transform="translate(395 380)"><circle r="31" className="scene-sun"/><path d="M-9 25H9M-7 32H7M0-50V-40M-45-20L-33-14M45-20L33-14" className="clock-tick"/></g>}
 </g></g>
 {(n===1||n===2||n===3||n===5||n===8)&&<Clock time={f.worldTime} countdown={n===1||n===5?10:n===8?Math.max(0,10-Math.floor(f.progress*11)):undefined}/>}
 <text x="270" y="105" textAnchor="middle" className={n>=19?"scene-heading board-text":"scene-heading"}>{n===1?'E SE…':n===2?'O MUNDO PAROU.':n===3?'ATRASADO!':n===4?'UMA IDEIA…':n===5?'10 SEGUNDOS.':n===8?'SÓ 10 SEGUNDOS.':n===10?'MAS CALMA…':n===11?'E O AR?':n===12?'RESPIRAR?':n===13?'E A LUZ?':n===14?'E SE…?':n===15?'MAIS SONO?':n===16?'SÓ QUE…':n===17?'O TEMPO VOLTA.':n===18?'A PROVA.':n===19?'UM PROBLEMA…':n===20?'E AGORA?':''}</text>
 {n===2&&<text x="270" y="141" textAnchor="middle" className="scene-subheading">MAS O LÉO NÃO.</text>}
 {f.frozen&&n<=8&&<g><rect x="192" y="319" width="156" height="32" rx="4" className="freeze-label-bg"/><text x="270" y="341" textAnchor="middle" className="freeze-label">TEMPO CONGELADO</text></g>}
 {f.impact>0&&<g data-testid="impact" opacity={f.impact} transform={`translate(${IMPACT_CENTER.x} ${IMPACT_CENTER.y}) scale(.43)`}><path className="impact-burst" d="M0-150L25-65L105-117L69-33L157 0L68 28L112 113L25 64L0 151L-27 65L-112 117L-69 25L-153 0L-65-29L-108-114L-26-64Z"/><text textAnchor="middle" y="22" className="impact-text">PÁ!</text></g>}
 </>}
 </svg>;
}
