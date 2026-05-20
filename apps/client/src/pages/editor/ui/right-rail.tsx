import { LayersPanel } from '@/features/layers/components/LayersPanel';
import { PropertiesPanel } from './properties-panel';
import { Separator } from './primitives';

export function RightRail() {
  return (
    <div className="flex flex-col w-70 overflow-hidden border-l border-hairline bg-chrome">
      <div className="flex-1 min-h-[220px]">
        <LayersPanel />
      </div>
      <Separator orientation="horizontal" />
      <PropertiesPanel className="flex-1 min-h-[220px]" />
    </div>
  );
}
