import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useUser } from '@/features/auth/queries';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useForkAsProject, useForkAsTemplate, useProject } from '@/features/projects/queries';

type ReadOnlyBannerProps = {
  designId: string;
};

const ReadOnlyBanner = ({ designId }: ReadOnlyBannerProps) => {
  const navigate = useNavigate();
  const readOnly = useReadOnlyStore();
  const { data: project } = useProject(designId);
  const { user } = useUser();
  const forkAsProject = useForkAsProject();
  const forkAsTemplate = useForkAsTemplate();
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  useEffect(() => {
    if (!recentlyAdded) return;
    const timer = setTimeout(() => setRecentlyAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [recentlyAdded]);

  if (!readOnly.isReadOnly || !project) return null;

  const isOwner = user?.id === project.userID;
  const source = readOnly.source;

  const onMakeCopy = async () => {
    const created = await forkAsProject.mutateAsync(designId);
    navigate(`/editor/${created.id}`);
  };

  const onUse = async () => {
    const created = await forkAsProject.mutateAsync(designId);
    navigate(`/editor/${created.id}`);
  };

  const onAdd = async () => {
    await forkAsTemplate.mutateAsync(designId);
    setRecentlyAdded(true);
  };

  const leftLabel = (() => {
    if (source === 'template' && isOwner) {
      return project.isPublic ? 'Template · Public' : 'Template · Draft';
    }
    return `by @${project.userName ?? 'unknown'}`;
  })();

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-hairline-strong bg-raised/80 px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
      <span className="truncate">{leftLabel}</span>
      <div className="flex items-center gap-2">
        {source === 'non-owner-project' && (
          <Button size="sm" onClick={onMakeCopy} disabled={forkAsProject.isPending}>
            {forkAsProject.isPending ? 'Creating…' : 'Make a copy'}
          </Button>
        )}
        {source === 'template' && isOwner && (
          <Button size="sm" onClick={onUse} disabled={forkAsProject.isPending}>
            {forkAsProject.isPending ? 'Creating…' : 'Use'}
          </Button>
        )}
        {source === 'template' && !isOwner && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onAdd}
              disabled={forkAsTemplate.isPending || recentlyAdded}
            >
              {recentlyAdded ? '✓ Added' : forkAsTemplate.isPending ? 'Adding…' : 'Add'}
            </Button>
            <Button size="sm" onClick={onUse} disabled={forkAsProject.isPending}>
              {forkAsProject.isPending ? 'Creating…' : 'Use'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export { ReadOnlyBanner };
