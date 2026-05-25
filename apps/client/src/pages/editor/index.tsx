import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';
import type { CanvasEngine } from '@/features/canvas/lib/CanvasEngine';
import { loadRailWidth, saveRailWidth } from './lib/preferences';
import { useTempMoveOverride } from './hooks/useTempMoveOverride';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { useUser } from '@/features/auth/queries';
import { performLogout } from '@/features/auth/session';
import { useProject } from '@/features/projects/queries';
import { useSaveStatusStore } from '@/features/projects/store/save-status.store';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useAutosave } from '@/features/projects/hooks/useAutosave';
import { useCanvasStore } from '@/features/canvas/store/canvas.store';
import { CanvasArea } from '@/features/canvas/components/CanvasArea';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { HttpError } from '@/shared/lib/api-client';
import { insertImageFromBlob, noticeForInsertImageReason } from '@/features/canvas/lib/insertImage';
import { useNoticeStore } from '@/features/notice/store/notice.store';
import { NoticeBanner } from '@/features/notice/ui/notice-banner';
import { Topbar } from './ui/topbar';
import { OptionsBar } from './ui/options-bar';
import { ToolRail } from './ui/tool-rail';
import { CanvasStage } from './ui/canvas-stage';
import { RightRail } from './ui/right-rail';
import { StatusBar } from './ui/status-bar';
import { RadialMenu } from './ui/radial-menu';
import { useToolShortcuts } from './hooks/useToolShortcuts';

const idSchema = z.string().uuid();

const EditorPage = () => {
  const params = useParams<{ id: string }>();
  const idCheck = idSchema.safeParse(params.id);

  if (!idCheck.success) {
    return <Navigate to="/" replace />;
  }

  return <EditorPageForProject key={idCheck.data} id={idCheck.data} />;
};

type EditorPageForProjectProps = { id: string };

const EditorPageForProject = ({ id }: EditorPageForProjectProps) => {
  const engineRef = useRef<CanvasEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useTempMoveOverride(engineRef);
  useEditorShortcuts(engineRef);
  useToolShortcuts();
  const { user } = useUser();
  const { data: project, isPending, isError, error, refetch } = useProject(id);
  const [hydrateError, setHydrateError] = useState(false);
  const onHydrateError = useCallback(() => setHydrateError(true), []);

  const bindProject = useSaveStatusStore((s) => s.bindProject);
  const unbindProject = useSaveStatusStore((s) => s.unbindProject);
  const setReadOnlyOnce = useReadOnlyStore((s) => s.setReadOnlyOnce);
  const resetReadOnly = useReadOnlyStore((s) => s.reset);
  const isReadOnly = useReadOnlyStore((s) => s.isReadOnly);

  useEffect(() => {
    bindProject(id);
    return () => unbindProject();
  }, [id, bindProject, unbindProject]);

  useEffect(() => {
    if (!project || !user) return;
    if (project.type === 'template') {
      setReadOnlyOnce({ isReadOnly: true, source: 'template' });
    } else if (project.userID !== user.id) {
      setReadOnlyOnce({ isReadOnly: true, source: 'non-owner-project' });
    } else {
      setReadOnlyOnce({ isReadOnly: false });
    }
    return () => resetReadOnly();
  }, [project, user, setReadOnlyOnce, resetReadOnly]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (useReadOnlyStore.getState().isReadOnly) return;
      const tag = useSaveStatusStore.getState().status.tag;
      if (tag === 'dirty' || tag === 'saving' || tag === 'error') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useAutosave(id, engineRef);

  const tool = useCanvasStore((s) => s.activeTool);
  const setTool = useCanvasStore((s) => s.setActiveTool);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const showNotice = useNoticeStore((s) => s.show);

  useEffect(() => {
    if (tool !== 'image') return;
    /* Defense-in-depth: useToolShortcuts and the rail's inert wrapper already gate read-only; this catches any future path that sets tool='image' directly. */
    if (useReadOnlyStore.getState().isReadOnly) {
      setTool('move');
      return;
    }
    const input = fileInputRef.current;
    if (!input) return;
    input.click();
    setTool('move');
  }, [tool, setTool]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const canvas = engineRef.current?.fabricCanvas;
    if (!canvas) return;
    const result = await insertImageFromBlob(canvas, file);
    if (!result.ok) showNotice(noticeForInsertImageReason(result.reason));
  };

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

  if (isError) {
    if (error instanceof HttpError && (error.status === 404 || error.status === 403)) {
      return <Navigate to="/" replace />;
    }
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
        <ScreenBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="font-sans text-2xl">Failed to load this project.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-mono text-[11px] uppercase tracking-[0.2em] underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hydrateError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
        <ScreenBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="font-sans text-2xl">This project failed to load.</p>
          <a href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] underline">
            Go home
          </a>
        </div>
      </div>
    );
  }

  if (isPending || !project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
        <ScreenBackground />
        <span
          aria-label="Loading project"
          className="relative z-10 size-2 animate-pulse rounded-full bg-foreground"
        />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground">
        <ScreenBackground />
        <NoticeBanner />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="h-9.5 shrink-0">
            <Topbar
              avatarInitial={avatarInitial}
              onLogout={performLogout}
              projectName={project.name}
              width={project.width}
              height={project.height}
              designId={id}
              isPublic={project.isPublic}
              isOwner={user?.id === project.userID}
              getCanvas={() => engineRef.current?.fabricCanvas ?? null}
              exportProjectName={project.name}
            />
          </div>
          <div
            className={isReadOnly ? 'pointer-events-none opacity-40' : ''}
            {...(isReadOnly ? { inert: true } : {})}
          >
            <OptionsBar tool={tool} />
          </div>
          <div className="flex min-h-0 flex-1">
            <div
              className={`w-14 shrink-0 ${isReadOnly ? 'pointer-events-none opacity-40' : ''}`}
              {...(isReadOnly ? { inert: true } : {})}
            >
              <ToolRail active={tool} setActive={setTool} />
            </div>
            <div className="min-w-0 flex-1">
              <CanvasStage onContextMenu={onCanvasContextMenu} onMouseMove={onCanvasMove}>
                <CanvasArea
                  engineRef={engineRef}
                  containerRef={containerRef}
                  initialProject={project}
                  onHydrateError={onHydrateError}
                />
              </CanvasStage>
            </div>
            <div
              className={isReadOnly ? 'pointer-events-none opacity-40' : ''}
              {...(isReadOnly ? { inert: true } : {})}
            >
              <RightRail width={railWidth} onResize={setRailWidth} />
            </div>
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
