import type { ReactNode } from 'react';

export type LeoExpression = 'curious' | 'happy' | 'surprised' | 'worried' | 'sleeping' | 'scared' | 'angry' | 'cold' | 'sad';
type LeoProps = {
  time?: number; walking?: boolean; running?: boolean; seated?: boolean; expression?: LeoExpression; backpack?: boolean;
  /** Overrides the front (right) arm angle in degrees; negative raises it forward. */
  reach?: number | undefined;
  /** Overrides the back (left) arm angle in degrees. */
  armL?: number | undefined;
  /** Eye offset in rig units, e.g. [0, 3] looks down. */
  gaze?: readonly [number, number] | undefined;
  /** Adds eye highlights for close-ups. */
  shine?: boolean;
  /** Hides both arms (close-ups where separate hands are drawn). */
  hideArms?: boolean;
  /** 0..1 open mouth while speaking; overrides the expression mouth. */
  talk?: number;
  /** Extra shapes drawn inside the head group (hairstyles), in rig units. */
  headExtra?: ReactNode;
};

// All poses use this one rig; rotations pivot at the actual shoulder/hip joints.
export function Leo({ time = 0, walking = false, running = false, seated = false, expression = 'curious', backpack = true, reach, armL, gaze, shine = false, hideArms = false, talk = 0, headExtra }: LeoProps) {
  const stride = walking ? Math.sin(time * (running ? 13 : 7)) * (running ? 35 : 20) : 0;
  const bob = walking ? Math.abs(Math.sin(time * (running ? 13 : 7))) * (running ? 5 : 2) : Math.sin(time * 2) * 1.4;
  const blink = expression === 'sleeping' || (expression !== 'cold' && time % 3.7 > 3.52);
  const wave = reach ?? (!walking ? -22 + Math.sin(time * 3) * 9 : -stride);
  const back = armL ?? stride;
  const [gx, gy] = gaze ?? [0, 0];
  const wide = expression === 'surprised' || expression === 'scared';
  const brows = expression === 'sad' ? 'M60 71Q68 68 76 63M101 63Q109 68 117 71'
    : expression === 'worried' ? 'M59 65L76 71M101 71L117 65'
    : expression === 'angry' ? 'M58 61L77 71M100 71L119 61'
    : expression === 'cold' ? 'M60 69L77 68M100 68L117 69'
    : expression === 'scared' ? 'M59 69Q66 62 76 59M101 59Q110 62 117 69'
    : expression === 'surprised' ? 'M59 65L76 60M101 60L117 65' : 'M59 67Q67 61 77 65M100 65Q108 61 117 68';
  const mouth = talk > .05 ? <ellipse className="leo-mouth" cx="91" cy="109" rx={5 + talk * 1.5} ry={1.5 + talk * 6}/>
    : expression === 'surprised' ? <ellipse className="leo-mouth" cx="90" cy="108" rx="6" ry="8"/>
    : expression === 'scared' ? <path className="leo-mouth" d="M80 112Q85 103 91 108Q97 103 102 112Q91 117 80 112Z"/>
    : <path className="face-line" d={expression === 'sad' ? 'M82 111Q91 106 100 111' : expression === 'worried' ? 'M79 112Q91 101 103 112' : expression === 'angry' ? 'M80 113Q91 104 102 113' : expression === 'cold' ? 'M82 109L100 108' : expression === 'happy' ? 'M76 105Q91 121 106 103' : 'M81 107Q91 112 101 105'}/>;
  return <g className="leo-rig" data-character="leo-v1" data-expression={expression} transform={`translate(0 ${-bob})`}>
    {backpack && <g className="leo-bag"><path d="M58 129 Q34 122 31 146 L28 205 Q29 216 44 218 L64 218Z"/><path d="M35 154L51 154L51 200L33 200" className="bag-detail"/></g>}
    <g transform={`rotate(${seated ? -65 : -stride} 77 222)`}><path className="leo-pants" d="M60 216L89 216L86 282L80 330L60 330L61 273Z"/><path className="leo-shoe" d="M60 322L81 322L83 334L94 340Q97 348 87 348L54 348L54 336Z"/></g>
    <g transform={`rotate(${seated ? -65 : stride} 104 222)`}><path className="leo-pants" d="M90 216L119 216L122 278L128 330L107 333L95 275Z"/><path className="leo-shoe" d="M106 324L128 324L130 335L144 340Q147 348 137 348L105 348L101 337Z"/></g>
    {!hideArms && <g transform={`rotate(${back} 59 148)`}><path className="leo-shirt" d="M62 132Q45 130 39 147L34 170L55 178L69 155Z"/><path className="leo-skin" d="M36 169L52 174L46 216Q45 226 34 224Q25 222 28 211Z"/></g>}
    <path className="leo-shirt" d="M64 128Q89 118 113 131L126 175L122 225Q86 237 54 223L58 162Z"/>
    {backpack && <path className="bag-strap" d="M66 132Q55 168 63 208"/>}
    <path className="leo-skin" d="M76 107L77 133Q88 144 101 130L99 104Z"/>
    {!hideArms && <g transform={`rotate(${wave} 115 145)`}><path className="leo-shirt" d="M109 130Q126 126 135 143L141 166L119 176L107 150Z"/><path className="leo-skin" d="M122 170L139 163L149 190L163 170Q169 161 176 167Q184 175 176 184L156 209Q149 217 141 209Z"/><path className="skin-detail" d="M166 177L174 170"/></g>}
    <g transform={`rotate(${walking ? -3 : Math.sin(time * 1.4) * 3} 88 91)`}>
      <ellipse className="leo-skin" cx="47" cy="84" rx="10" ry="15"/><ellipse className="leo-skin" cx="126" cy="84" rx="10" ry="15"/>
      <path className="leo-skin" d="M48 56Q50 26 89 28Q130 32 126 72L121 100Q112 126 88 127Q60 125 50 99Z"/>
      <path className="leo-hair" d="M46 76Q30 48 47 29Q53 17 72 18Q93 3 112 21Q136 24 134 52L127 78L117 52Q95 61 77 42Q65 61 50 55L51 79Z"/>
      <path className="leo-hair" d="M71 29Q85 16 100 25Q109 43 94 58Q88 44 75 40Z"/>
      {headExtra}
      <path className="face-line" d={brows}/>
      {blink ? <path className="face-line" d="M63 80L74 80M103 80L114 80"/> : <g className="leo-eye">
        {shine && <><ellipse className="eye-white" cx="69" cy="80" rx="7" ry={wide ? 9 : 7}/><ellipse className="eye-white" cx="108" cy="80" rx="7" ry={wide ? 9 : 7}/></>}
        <ellipse cx={69 + gx} cy={80 + gy} rx={expression === 'scared' && shine ? 3 : 4} ry={wide ? 7 : expression === 'cold' ? 4 : 5}/><ellipse cx={108 + gx} cy={80 + gy} rx={expression === 'scared' && shine ? 3 : 4} ry={wide ? 7 : expression === 'cold' ? 4 : 5}/>
        {shine && <><circle className="eye-shine" cx={70.5 + gx} cy={77.5 + gy} r="1.6"/><circle className="eye-shine" cx={109.5 + gx} cy={77.5 + gy} r="1.6"/></>}
        {expression === 'cold' && <path className="face-line" d="M61 75Q69 73 77 75M100 75Q108 73 116 75"/>}
      </g>}
      <path className="skin-detail" d="M88 81L84 94L92 95"/>
      {mouth}
    </g>
  </g>;
}
