import { useRef, useState } from 'react';
import {
  CaretDown,
  CaretUp,
  Eye,
  EyeSlash,
  Lock,
  LockOpen,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { cn } from '@/shared/lib/utils';

export const LayersPanel = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayer,
    addLayer,
    removeLayer,
    reorderLayers,
    setVisibility,
    setLocked,
    setOpacity,
    renameLayer,
  } = useLayersStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const dragFromIndex = useRef<number | null>(null);

  // Top of panel mirrors top of z-order (last item in the store array).
  const displayLayers = [...layers].reverse();
  const toStoreIndex = (displayIndex: number) => layers.length - 1 - displayIndex;

  const commitRename = (layerId: string) => {
    if (editingName.trim()) renameLayer(layerId, editingName.trim());
    setEditingId(null);
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-hairline bg-background px-3 py-2 font-mono text-[10px] tracking-panel text-muted-foreground uppercase">
        <span className="text-foreground">Layers</span>
        <button
          type="button"
          onClick={() => addLayer()}
          title="Add layer"
          className="flex h-5.5 w-5.5 items-center justify-center text-fg-dim hover:text-foreground"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {displayLayers.map((layer, displayIndex) => {
          const storeIndex = toStoreIndex(displayIndex);
          const isActive = layer.id === activeLayerId;
          const isTop = storeIndex === layers.length - 1;
          const isBottom = storeIndex === 0;
          const onlyLayer = layers.length === 1;

          return (
            <div
              key={layer.id}
              draggable
              onDragStart={() => {
                dragFromIndex.current = storeIndex;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFromIndex.current !== null && dragFromIndex.current !== storeIndex) {
                  reorderLayers(dragFromIndex.current, storeIndex);
                }
                dragFromIndex.current = null;
              }}
              onClick={() => setActiveLayer(layer.id)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 px-2 py-1 text-xs',
                isActive
                  ? 'bg-white/8 text-foreground'
                  : 'text-muted-foreground hover:bg-field-hover',
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibility(layer.id, !layer.visible);
                }}
                title={layer.visible ? 'Hide' : 'Show'}
                className={cn(
                  'flex h-4.5 w-4.5 shrink-0 items-center justify-center',
                  layer.visible ? 'text-fg-dim hover:text-foreground' : 'text-fg-dimmer',
                )}
              >
                {layer.visible ? <Eye size={12} /> : <EyeSlash size={12} />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocked(layer.id, !layer.locked);
                }}
                title={layer.locked ? 'Unlock' : 'Lock'}
                className={cn(
                  'flex h-4.5 w-4.5 shrink-0 items-center justify-center',
                  layer.locked ? 'text-foreground' : 'text-fg-dim hover:text-foreground',
                )}
              >
                {layer.locked ? <Lock size={12} /> : <LockOpen size={12} />}
              </button>

              {editingId === layer.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => commitRename(layer.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(layer.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="min-w-0 flex-1 border border-foreground bg-transparent px-1 text-xs text-foreground outline-none"
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(layer.id);
                    setEditingName(layer.name);
                  }}
                  className="min-w-0 flex-1 truncate select-none"
                  title={layer.name}
                >
                  {layer.name}
                </span>
              )}

              <span className="shrink-0 text-fg-dimmer text-2xs">{layer.objectsIds.length}</span>

              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayers(storeIndex, storeIndex + 1);
                  }}
                  disabled={isTop}
                  title="Move up"
                  className="flex h-2 w-3.5 items-center justify-center text-fg-dim hover:text-foreground disabled:text-fg-dimmer disabled:hover:text-fg-dimmer"
                >
                  <CaretUp size={9} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayers(storeIndex, storeIndex - 1);
                  }}
                  disabled={isBottom}
                  title="Move down"
                  className="flex h-2 w-3.5 items-center justify-center text-fg-dim hover:text-foreground disabled:text-fg-dimmer disabled:hover:text-fg-dimmer"
                >
                  <CaretDown size={9} weight="bold" />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onlyLayer) removeLayer(layer.id);
                }}
                disabled={onlyLayer}
                title="Delete layer"
                className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-fg-dim hover:text-destructive disabled:text-fg-dimmer disabled:hover:text-fg-dimmer"
              >
                <Trash size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {activeLayer && (
        <div className="flex items-center gap-2 border-t border-hairline px-3 py-2 font-mono text-2xs tracking-mono text-fg-dim uppercase">
          <span className="shrink-0">Opacity</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={activeLayer.opacity}
            onChange={(e) => setOpacity(activeLayer.id, Number(e.target.value))}
            className="min-w-0 flex-1"
          />
          <span className="min-w-10 text-right text-foreground">
            {Math.round(activeLayer.opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
