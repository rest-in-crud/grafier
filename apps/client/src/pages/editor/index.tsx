import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/features/auth/store';
import { performLogout } from '@/features/auth/session';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { CanvasArea } from '@/features/canvas/components/CanvasArea';
import { Topbar } from './ui/topbar';
import { OptionsBar } from './ui/options-bar';
import { ToolRail } from './ui/tool-rail';
import { CanvasStage } from './ui/canvas-stage';
import { RightRail } from './ui/right-rail';
import { StatusBar } from './ui/status-bar';
import { RadialMenu } from './ui/radial-menu';
import type { EditorOpts } from './types';

const EditorPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const tool = useCanvasStore((s) => s.activeTool);
  const setTool = useCanvasStore((s) => s.setActiveTool);
  const [selected, setSelected] = useState<string>('l1');
  const [zoom, setZoom] = useState<number>(75);
  const [opts, setOpts] = useState<EditorOpts>({
    size: 32,
    opacity: 100,
    hardness: 80,
    blend: 'NORMAL',
    stroke: 1,
  });
  const [radial, setRadial] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 412, y: 268 });

  const onLogout = () => {
    performLogout();
    navigate('/signin');
  };

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
        <div className="h-9.5 shrink-0">
          <Topbar avatarInitial={avatarInitial} onLogout={onLogout} />
        </div>
        <OptionsBar tool={tool} opts={opts} setOpts={setOpts} />
        <div className="flex min-h-0 flex-1">
          <div className="w-14 shrink-0">
            <ToolRail active={tool} setActive={setTool} />
          </div>
          <div className="min-w-0 flex-1">
            <CanvasStage onContextMenu={onCanvasContextMenu} onMouseMove={onCanvasMove}>
              <CanvasArea />
            </CanvasStage>
          </div>
          <RightRail selected={selected} setSelected={setSelected} />
        </div>
        <div className="h-6.5 shrink-0">
          <StatusBar cursor={cursor} zoom={zoom} setZoom={setZoom} />
        </div>
      </div>
      {radial && <RadialMenu x={radial.x} y={radial.y} onClose={() => setRadial(null)} />}
    </>
  );
};

export { EditorPage };
