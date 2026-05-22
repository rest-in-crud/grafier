import { LayersPanel } from '@/features/layers/components/LayersPanel';
import { PropertiesPanel } from './properties-panel';
import { RailResizeHandle, Separator } from './primitives';

type Props = {
  width: number;
  onResize: (next: number) => void;
};

export function RightRail({ width, onResize }: Props) {
  return (
    <div
      className="relative flex flex-col overflow-hidden border-l border-hairline bg-chrome"
      style={{ width }}
    >
      <RailResizeHandle currentWidth={width} onResize={onResize} />
      <div className="flex-1 min-h-[220px]">
        <LayersPanel />
      </div>
      <Separator orientation="horizontal" />
      <PropertiesPanel className="flex-1 min-h-[220px]" />
    </div>
  );
}
