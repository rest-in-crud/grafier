import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { PublicIcon, PrivateIcon } from '@/shared/ui/visibility-icons';
import { useProject, useSetVisibility, useForkAsTemplate } from '@/features/projects/queries';
import { useFlushAutosave } from '@/features/projects/hooks/useFlushAutosave';

type Props = {
  designId: string;
};

const PublishToggleButton = ({ designId }: Props) => {
  const { data: design } = useProject(designId);
  const setVisibility = useSetVisibility(designId);
  const [open, setOpen] = useState(false);
  const [hasConfirmedOnce, setHasConfirmedOnce] = useState(false);

  if (!design) return null;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOpen(false);
      return;
    }
    if (design.isPublic) {
      setVisibility.mutate(false);
      return;
    }
    if (!hasConfirmedOnce) {
      setOpen(true);
      return;
    }
    setVisibility.mutate(true);
  };

  const onConfirm = () => {
    setHasConfirmedOnce(true);
    setOpen(false);
    setVisibility.mutate(true);
  };

  const Icon = design.isPublic ? PublicIcon : PrivateIcon;
  const label = design.isPublic ? 'Make private' : 'Make public';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          disabled={setVisibility.isPending}
          className="flex cursor-pointer items-center text-fg-dim transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72">
        <div className="flex flex-col gap-3">
          <p className="font-sans text-sm text-foreground">Anyone can view and fork. Continue?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={onConfirm}>
              Publish
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const SaveAsTemplateButton = ({ designId }: Props) => {
  const { data: design } = useProject(designId);
  const forkAsTemplate = useForkAsTemplate();
  const flushAutosave = useFlushAutosave();
  const [recentlySaved, setRecentlySaved] = useState(false);

  useEffect(() => {
    if (!recentlySaved) return;
    const timer = setTimeout(() => setRecentlySaved(false), 2000);
    return () => clearTimeout(timer);
  }, [recentlySaved]);

  if (!design || design.type !== 'project') return null;

  const onClick = async () => {
    await flushAutosave();
    await forkAsTemplate.mutateAsync(designId);
    setRecentlySaved(true);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={forkAsTemplate.isPending || recentlySaved}
    >
      {recentlySaved
        ? '✓ Saved as template'
        : forkAsTemplate.isPending
          ? 'Saving…'
          : 'Save as template'}
    </Button>
  );
};

export { PublishToggleButton, SaveAsTemplateButton };
