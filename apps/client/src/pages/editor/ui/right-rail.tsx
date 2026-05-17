import { LayersPanel } from './layers-panel';
import { PropertiesPanel } from './properties-panel';

type RightRailProps = {
  selected: string;
  setSelected: (id: string) => void;
};

export function RightRail({ selected, setSelected }: RightRailProps) {
  return (
    <div className="flex flex-col w-70 overflow-hidden border-l border-hairline bg-chrome">
      <LayersPanel className="flex-1 min-h-[220px]" selected={selected} setSelected={setSelected} />
      <div className="h-px bg-hairline shrink-0" />
      <PropertiesPanel className="flex-1 min-h-[220px]" />
    </div>
  );
}
