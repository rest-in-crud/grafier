import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useUser } from '@/features/auth/queries';
import { useReadOnlyStore } from '@/features/projects/store/read-only.store';
import { useForkAsProject, useForkAsTemplate, useProject } from '@/features/projects/queries';

type Props = {
  designId: string;
};

const ReadOnlyAuthorLabel = ({ designId }: Props) => {
  const readOnly = useReadOnlyStore();
  const { data: project } = useProject(designId);
  const { user } = useUser();

  if (!readOnly.isReadOnly || !project) return null;
  if (user?.id === project.userID) return null;

  return <span className="text-fg-dimmer">{`by @${project.userName ?? 'unknown'}`}</span>;
};

const ReadOnlyActions = ({ designId }: Props) => {
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
    const created = await forkAsProject.mutateAsync({ id: designId });
    navigate(`/editor/${created.id}`);
  };

  const onUse = async () => {
    const created = await forkAsProject.mutateAsync({ id: designId });
    navigate(`/editor/${created.id}`);
  };

  const onAdd = async () => {
    await forkAsTemplate.mutateAsync(designId);
    setRecentlyAdded(true);
  };

  return (
    <>
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
    </>
  );
};

export { ReadOnlyAuthorLabel, ReadOnlyActions };
