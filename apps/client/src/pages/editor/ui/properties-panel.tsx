import { Slider, Swatch, Panel, PanelHeader, PanelBody } from './primitives';

export function PropertiesPanel({ className }: { className?: string } = {}) {
  return (
    <Panel className={className}>
      <PanelHeader title="PROPERTIES" right={<span>RECT · L1</span>} />
      <PanelBody>
        <div className="grid gap-3.5 p-3">
          <div className="grid gap-2">
            <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">
              TRANSFORM
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  X
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="120"
                />
              </div>
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  Y
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="84"
                />
              </div>
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  W
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="560"
                />
              </div>
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  H
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="320"
                />
              </div>
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  ∠
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="0°"
                />
              </div>
              <div className="relative">
                <span className="font-mono absolute top-1/2 left-2 -translate-y-1/2 text-[9px] text-fg-dim">
                  ⟲
                </span>
                <input
                  className="w-full border border-hairline bg-field py-1.25 pr-2 pl-5.5 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                  defaultValue="100%"
                />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">FILL</div>
            <div className="flex items-center gap-2">
              <Swatch interactive={false} color="#f2f2f2" />
              <input
                className="border border-hairline bg-field py-1.25 px-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                defaultValue="#F2F2F2"
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">
              STROKE
            </div>
            <div className="flex items-center gap-2">
              <Swatch
                interactive={false}
                style={{ background: 'transparent', borderStyle: 'dashed' }}
              />
              <input
                className="border border-hairline bg-field py-1.25 px-2 text-[11px] text-foreground focus:border-foreground focus:outline-none"
                defaultValue="NONE"
                style={{ flex: 1 }}
              />
            </div>
            <Slider value={1} onChange={() => {}} min={0} max={20} suffix=" PX" />
          </div>
          <div className="grid gap-2">
            <div className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase">
              APPEARANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase"
                style={{ width: 60 }}
              >
                OPACITY
              </span>
              <Slider value={100} onChange={() => {}} suffix="%" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span
                className="font-mono text-[9px] tracking-[0.2em] text-fg-dim uppercase"
                style={{ width: 60 }}
              >
                BLUR
              </span>
              <Slider value={0} onChange={() => {}} min={0} max={50} suffix=" PX" />
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
