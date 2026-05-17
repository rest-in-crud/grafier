import type { BlendMode, EditorOpts, ToolId } from '../types';
import { HSlider } from './h-slider';

type Props = {
  tool: ToolId;
  opts: EditorOpts;
  setOpts: (o: EditorOpts) => void;
};

const optionsBar =
  'flex items-center h-[40px] overflow-hidden border-b border-hairline bg-chrome px-3.5 gap-[18px] text-xs';

const optLabel = 'font-mono text-[10px] tracking-[0.18em] text-fg-dim uppercase';

const optSep = 'w-px h-5 bg-hairline shrink-0';

const optGroup = 'flex items-center gap-2.5';

const optSelect = [
  'bg-transparent border border-hairline-strong text-foreground',
  'font-mono text-[10px] tracking-[0.1em] uppercase',
  'py-1 pl-2 pr-[22px] cursor-pointer appearance-none',
  'focus:outline-none focus:border-foreground',
  '[background-image:linear-gradient(45deg,transparent_50%,var(--fg-dim)_50%),linear-gradient(135deg,var(--fg-dim)_50%,transparent_50%)]',
  '[background-position:calc(100%-12px)_50%,calc(100%-8px)_50%]',
  '[background-size:4px_4px,4px_4px]',
  '[background-repeat:no-repeat]',
].join(' ');

const togglePill = 'inline-flex border border-hairline-strong';

const pillBtn = [
  'bg-transparent border-0 text-fg-dim',
  'font-mono text-[10px] tracking-[0.1em]',
  'py-1 px-2.5 cursor-pointer',
  'border-r border-hairline last:border-r-0',
].join(' ');

const pillBtnOn = pillBtn + ' !bg-foreground !text-background';

const colorSwatch = 'w-[22px] h-[22px] border border-hairline-strong shrink-0 cursor-pointer';

const OptionsBar = ({ tool, opts, setOpts }: Props) => {
  const update = <K extends keyof EditorOpts>(k: K, v: EditorOpts[K]) =>
    setOpts({ ...opts, [k]: v });

  if (['brush', 'pencil', 'eraser'].includes(tool)) {
    return (
      <div className={optionsBar}>
        <span className={optLabel}>
          {tool === 'brush' ? 'Brush' : tool === 'pencil' ? 'Pencil' : 'Eraser'}
        </span>
        <div className={optSep} />
        <div className={optGroup}>
          <span className={optLabel}>Size</span>
          <HSlider
            value={opts.size}
            onChange={(v) => update('size', v)}
            min={1}
            max={200}
            suffix=" PX"
          />
        </div>
        <div className={optSep} />
        <div className={optGroup}>
          <span className={optLabel}>Opacity</span>
          <HSlider value={opts.opacity} onChange={(v) => update('opacity', v)} suffix="%" />
        </div>
        <div className={optSep} />
        <div className={optGroup}>
          <span className={optLabel}>Hardness</span>
          <HSlider
            value={opts.hardness}
            onChange={(v) => update('hardness', v)}
            suffix="%"
            compact
          />
        </div>
        <div className={optSep} />
        <div className={optGroup}>
          <span className={optLabel}>Blend</span>
          <select
            className={optSelect}
            value={opts.blend}
            onChange={(e) => update('blend', e.target.value as BlendMode)}
          >
            <option>NORMAL</option>
            <option>MULTIPLY</option>
            <option>SCREEN</option>
            <option>OVERLAY</option>
          </select>
        </div>
      </div>
    );
  }

  if (tool === 'shape') {
    return (
      <div className={optionsBar}>
        <span className={optLabel}>Shape</span>
        <div className={optSep} />
        <div className={togglePill}>
          <button className={pillBtnOn}>RECT</button>
          <button className={pillBtn}>ELLIPSE</button>
          <button className={pillBtn}>POLY</button>
          <button className={pillBtn}>LINE</button>
        </div>
        <div className={optSep} />
        <div className={optGroup}>
          <span className={optLabel}>Fill</span>
          <div className={colorSwatch} style={{ background: '#e8e8e8' }} />
        </div>
        <div className={optGroup}>
          <span className={optLabel}>Stroke</span>
          <div className={colorSwatch} style={{ background: '#000', borderColor: 'var(--fg)' }} />
          <HSlider
            value={opts.stroke}
            onChange={(v) => update('stroke', v)}
            min={0}
            max={20}
            suffix=" PX"
            compact
          />
        </div>
      </div>
    );
  }

  if (tool === 'text') {
    return (
      <div className={optionsBar}>
        <span className={optLabel}>Type</span>
        <div className={optSep} />
        <select className={optSelect} defaultValue="INTER">
          <option>INTER</option>
          <option>JETBRAINS MONO</option>
          <option>SERIF</option>
        </select>
        <div className={optGroup}>
          <span className={optLabel}>Size</span>
          <HSlider value={48} onChange={() => {}} min={6} max={400} suffix=" PT" compact />
        </div>
        <div className={togglePill}>
          <button className={pillBtnOn} style={{ fontWeight: 700 }}>
            B
          </button>
          <button className={pillBtn} style={{ fontStyle: 'italic' }}>
            I
          </button>
          <button className={pillBtn} style={{ textDecoration: 'underline' }}>
            U
          </button>
        </div>
        <div className={togglePill}>
          <button className={pillBtnOn}>L</button>
          <button className={pillBtn}>C</button>
          <button className={pillBtn}>R</button>
          <button className={pillBtn}>J</button>
        </div>
      </div>
    );
  }

  return (
    <div className={optionsBar}>
      <span className={optLabel}>Selection</span>
      <div className={optSep} />
      <div className={optGroup}>
        <span className={optLabel}>Auto-Select</span>
        <div className={togglePill}>
          <button className={pillBtnOn}>LAYER</button>
          <button className={pillBtn}>GROUP</button>
        </div>
      </div>
      <div className={optSep} />
      <div className={optGroup}>
        <span className={optLabel}>Show Bounds</span>
        <div className={togglePill}>
          <button className={pillBtnOn}>ON</button>
          <button className={pillBtn}>OFF</button>
        </div>
      </div>
      <div className={optSep} />
      <div className={optGroup}>
        <span className={optLabel}>Align</span>
        <div className={togglePill}>
          <button className={pillBtn}>L</button>
          <button className={pillBtn}>C</button>
          <button className={pillBtn}>R</button>
          <button className={pillBtn}>T</button>
          <button className={pillBtn}>M</button>
          <button className={pillBtn}>B</button>
        </div>
      </div>
    </div>
  );
};

export { OptionsBar };
