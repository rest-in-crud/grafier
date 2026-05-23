import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { loadRailWidth, saveRailWidth } from './lib/preferences';
import { useTempMoveOverride } from './hooks/useTempMoveOverride';
import { useViewport } from './hooks/useViewport';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { useUser } from '@/features/auth/queries';
import { performLogout } from '@/features/auth/session';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { CanvasArea } from '@/features/canvas/components/CanvasArea';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { Topbar } from './ui/topbar';
import { OptionsBar } from './ui/options-bar';
import { ToolRail } from './ui/tool-rail';
import { CanvasStage } from './ui/canvas-stage';
import { RightRail } from './ui/right-rail';
import { StatusBar } from './ui/status-bar';
import { RadialMenu } from './ui/radial-menu';
import { useToolShortcuts } from './hooks/useToolShortcuts';

const EditorPage = () => {
  const engineRef = useRef<CanvasEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useTempMoveOverride(engineRef);
  useViewport(containerRef, engineRef);
  useEditorShortcuts(engineRef);
  useToolShortcuts();
  const { user } = useUser();

  const tool = useCanvasStore((s) => s.activeTool);
  const setTool = useCanvasStore((s) => s.setActiveTool);
  const [radial, setRadial] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 412, y: 268 });
  const [railWidth, setRailWidth] = useState<number>(() => loadRailWidth());

  useEffect(() => {
    saveRailWidth(railWidth);
  }, [railWidth]);

  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  function onCanvasContextMenu(e: MouseEvent) {
    e.preventDefault();
    setRadial({ x: e.clientX, y: e.clientY });
  }

  function onCanvasMove(e: MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    setCursor({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
  }

  return (
    <>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground">
        <ScreenBackground />
        <div className="relative z-10 flex h-full flex-col">
          <div className="h-9.5 shrink-0">
            <Topbar avatarInitial={avatarInitial} onLogout={performLogout} />
          </div>
          <OptionsBar tool={tool} />
          <div className="flex min-h-0 flex-1">
            <div className="w-14 shrink-0">
              <ToolRail active={tool} setActive={setTool} />
            </div>
            <div className="min-w-0 flex-1">
              <CanvasStage onContextMenu={onCanvasContextMenu} onMouseMove={onCanvasMove}>
                <CanvasArea engineRef={engineRef} containerRef={containerRef} />
              </CanvasStage>
            </div>
            <RightRail width={railWidth} onResize={setRailWidth} />
          </div>
          <div className="h-6.5 shrink-0">
            <StatusBar cursor={cursor} />
          </div>
        </div>
      </div>
      {radial && <RadialMenu x={radial.x} y={radial.y} onClose={() => setRadial(null)} />}
    </>
  );
};

export { EditorPage };
