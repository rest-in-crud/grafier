import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import type { ProjectDetail } from '@/features/projects/schema';
import { useCanvas } from '@/features/canvas/hooks/useCanvas';
import { loadCanvasTextFonts } from '@/features/canvas/lib/tools/TextTool/fontLoader';
import { useLayerSync } from '@/features/layers/hooks/useLayerSync';
import { useHistory } from '@/features/canvas/hooks/useHistory';
import { useHistoryStore } from '@/features/canvas/store/history.store';
import { useLayersStore } from '@/features/layers/store/layers.store';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';

const readSavedBgColor = (canvasJSON: Record<string, unknown>): string | null => {
  const bg = canvasJSON.background;
  if (typeof bg === 'string' && bg.length > 0) return bg;
  const bgColor = canvasJSON.backgroundColor;
  if (typeof bgColor === 'string' && bgColor.length > 0) return bgColor;
  return null;
};

const computeInitialZoom = (
  workspaceW: number,
  workspaceH: number,
  artW: number,
  artH: number,
): number => {
  if (workspaceW <= 0 || workspaceH <= 0 || artW <= 0 || artH <= 0) return 1;
  const fit = Math.min(workspaceW / artW, workspaceH / artH);
  return Math.min(0.9, fit * 0.85);
};

type Props = {
  engineRef: RefObject<CanvasEngine | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  initialProject: ProjectDetail;
  onHydrateError?: () => void;
};

export const CanvasArea = ({ engineRef, containerRef, initialProject, onHydrateError }: Props) => {
  const { canvasRef } = useCanvas(engineRef, initialProject.width, initialProject.height);
  const [baselineKey, setBaselineKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isReadOnly = useReadOnlyStore((s) => s.isReadOnly);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useLayerSync(engineRef);
  useHistory(engineRef, baselineKey);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setReadOnly(isReadOnly);
  }, [engineRef, isReadOnly]);

  useLayoutEffect(() => {
    const workspace = containerRef.current;
    if (!workspace) return;
    const rect = workspace.getBoundingClientRect();
    setZoom(
      computeInitialZoom(rect.width, rect.height, initialProject.width, initialProject.height),
    );
  }, [containerRef, initialProject.width, initialProject.height]);

  useEffect(() => {
    const workspace = containerRef.current;
    if (!workspace) return;

    let dragStart: { x: number; y: number; panAtStart: { x: number; y: number } } | null = null;

    const isWorkspaceTarget = (target: EventTarget | null): boolean => target === workspace;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const next = Math.min(4, Math.max(0.1, zoomRef.current * factor));
        setZoom(next);
      } else {
        setPan({ x: panRef.current.x - e.deltaX, y: panRef.current.y - e.deltaY });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!isWorkspaceTarget(e.target)) return;
      if (e.button !== 0) return;
      dragStart = { x: e.clientX, y: e.clientY, panAtStart: panRef.current };
      workspace.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart) return;
      setPan({
        x: dragStart.panAtStart.x + (e.clientX - dragStart.x),
        y: dragStart.panAtStart.y + (e.clientY - dragStart.y),
      });
    };

    const handleMouseUp = () => {
      if (!dragStart) return;
      dragStart = null;
      workspace.style.cursor = '';
    };

    workspace.addEventListener('wheel', handleWheel, { passive: false });
    workspace.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      workspace.removeEventListener('wheel', handleWheel);
      workspace.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.fabricCanvas.getObjects().length > 0) return;

    let cancelled = false;

    const hydrate = async () => {
      engine.isRestoring = true;
      try {
        if (initialProject.canvasJSON) {
          await engine.fabricCanvas.loadFromJSON(initialProject.canvasJSON);
          await loadCanvasTextFonts(engine.fabricCanvas);
        }
        if (cancelled) return;
        if (initialProject.canvasJSON) {
          const savedBg = readSavedBgColor(initialProject.canvasJSON);
          if (savedBg !== null) {
            engine.fabricCanvas.backgroundColor = savedBg;
            useCanvasStore.setState({ canvasBgColor: savedBg });
          }
        }
        if (initialProject.layersJSON && initialProject.layersJSON.length > 0) {
          const flatLayerObjects = initialProject.layersJSON.flatMap((l) => l.objects);
          const canvasObjects = engine.fabricCanvas.getObjects();
          canvasObjects.forEach((obj, i) => {
            if (obj.data?.id) return;
            const layerObj = flatLayerObjects[i];
            if (!layerObj) return;
            obj.data = { ...obj.data, id: layerObj.id };
          });
          useLayersStore.setState({
            layers: structuredClone(initialProject.layersJSON),
            activeLayerId: initialProject.layersJSON[0].id,
          });
          engine.seedObjectCounterFromLayers(initialProject.layersJSON);
        } else {
          const defaultLayer = {
            id: crypto.randomUUID(),
            name: 'Layer 1',
            visible: true,
            locked: false,
            opacity: 1,
            objects: [],
            collapsed: false,
          };
          useLayersStore.setState({
            layers: [defaultLayer],
            activeLayerId: defaultLayer.id,
          });
          engine.resetObjectCounter();
        }
        engine.fabricCanvas.requestRenderAll();
        useHistoryStore.setState({ past: [], future: [] });
        if (!cancelled) setBaselineKey((k) => k + 1);
      } catch (err) {
        console.error('canvas hydrate failed', err);
        if (!cancelled) onHydrateError?.();
      } finally {
        engine.isRestoring = false;
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [engineRef, initialProject, onHydrateError]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: '#070707' }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
