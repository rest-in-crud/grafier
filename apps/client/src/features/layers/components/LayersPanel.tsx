import { useRef, useState } from 'react';
import { useLayersStore } from '@/features/layers/store/layers.store.ts';

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

  // Display layers reversed: highest z-order (last in array) at the top of the panel
  const displayLayers = [...layers].reverse();

  const toStoreIndex = (displayIndex: number) => layers.length - 1 - displayIndex;

  const commitRename = (layerId: string) => {
    if (editingName.trim()) renameLayer(layerId, editingName.trim());
    setEditingId(null);
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <aside
      style={{
        width: 220,
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span>Layers</span>
        <button
          onClick={() => addLayer()}
          title="Add layer"
          style={{ border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
        >
          +
        </button>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayLayers.map((layer, displayIndex) => {
          const storeIndex = toStoreIndex(displayIndex);
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              draggable
              onDragStart={() => { dragFromIndex.current = storeIndex; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFromIndex.current !== null && dragFromIndex.current !== storeIndex) {
                  reorderLayers(dragFromIndex.current, storeIndex);
                }
                dragFromIndex.current = null;
              }}
              onClick={() => setActiveLayer(layer.id)}
              style={{
                padding: '4px 6px',
                background: isActive ? '#e0e7ff' : 'transparent',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
              }}
            >
              {/* Visibility */}
              <button
                onClick={(e) => { e.stopPropagation(); setVisibility(layer.id, !layer.visible); }}
                title={layer.visible ? 'Hide' : 'Show'}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, width: 16, color: layer.visible ? '#334155' : '#94a3b8' }}
              >
                {layer.visible ? 'V' : '-'}
              </button>

              {/* Lock */}
              <button
                onClick={(e) => { e.stopPropagation(); setLocked(layer.id, !layer.locked); }}
                title={layer.locked ? 'Unlock' : 'Lock'}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, width: 16, color: layer.locked ? '#f59e0b' : '#94a3b8' }}
              >
                {layer.locked ? 'L' : 'U'}
              </button>

              {/* Name (double-click to rename) */}
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
                  style={{ flex: 1, fontSize: 12, padding: '1px 3px', border: '1px solid #6366f1', borderRadius: 3, outline: 'none' }}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(layer.id);
                    setEditingName(layer.name);
                  }}
                  style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'none' }}
                  title={layer.name}
                >
                  {layer.name}
                </span>
              )}

              {/* Object count */}
              <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>{layer.objectsIds.length}</span>

              {/* Up / Down */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); reorderLayers(storeIndex, storeIndex + 1); }}
                  disabled={storeIndex === layers.length - 1}
                  title="Move up in z-order"
                  style={{ border: 'none', background: 'none', cursor: storeIndex === layers.length - 1 ? 'default' : 'pointer', padding: 0, fontSize: 9, lineHeight: 1, color: storeIndex === layers.length - 1 ? '#cbd5e1' : '#475569' }}
                >
                  ^
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); reorderLayers(storeIndex, storeIndex - 1); }}
                  disabled={storeIndex === 0}
                  title="Move down in z-order"
                  style={{ border: 'none', background: 'none', cursor: storeIndex === 0 ? 'default' : 'pointer', padding: 0, fontSize: 9, lineHeight: 1, color: storeIndex === 0 ? '#cbd5e1' : '#475569' }}
                >
                  v
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); if (layers.length > 1) removeLayer(layer.id); }}
                disabled={layers.length === 1}
                title="Delete layer"
                style={{ border: 'none', background: 'none', cursor: layers.length === 1 ? 'default' : 'pointer', padding: 0, fontSize: 14, color: layers.length === 1 ? '#cbd5e1' : '#ef4444', lineHeight: 1 }}
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      {/* Opacity for active layer */}
      {activeLayer && (
        <div
          style={{
            padding: '6px 8px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
          }}
        >
          <span style={{ color: '#64748b', flexShrink: 0 }}>Opacity</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={activeLayer.opacity}
            style={{ flex: 1 }}
            onChange={(e) => setOpacity(activeLayer.id, Number(e.target.value))}
          />
          <span style={{ minWidth: 30, color: '#64748b', textAlign: 'right' }}>
            {Math.round(activeLayer.opacity * 100)}%
          </span>
        </div>
      )}
    </aside>
  );
};