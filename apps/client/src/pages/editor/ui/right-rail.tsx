import { LayersPanel } from './layers-panel';
import { PropertiesPanel } from './properties-panel';

type RightRailProps = {
  selected: string;
  setSelected: (id: string) => void;
};

export function RightRail({ selected, setSelected }: RightRailProps) {
  return (
    <div className="grid w-70 overflow-hidden border-l border-hairline bg-chrome grid-rows-[minmax(220px,1fr)_auto_minmax(220px,1fr)]">
      <LayersPanel selected={selected} setSelected={setSelected} />
      <div className="h-px bg-hairline" />
      <PropertiesPanel />
    </div>
  );
}
