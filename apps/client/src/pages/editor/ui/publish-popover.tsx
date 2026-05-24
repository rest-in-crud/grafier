import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { useProject, useSetVisibility, useForkAsTemplate } from '@/features/projects/queries';
import { useFlushAutosave } from '@/features/projects/hooks/useFlushAutosave';

type PublishPopoverProps = {
  designId: string;
};

const PublishPopover = ({ designId }: PublishPopoverProps) => {
  const { data: design } = useProject(designId);
  const setVisibility = useSetVisibility(designId);
  const forkAsTemplate = useForkAsTemplate();
  const flushAutosave = useFlushAutosave();
  const [open, setOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [hasConfirmedOnce, setHasConfirmedOnce] = useState(false);
  const [recentlySaved, setRecentlySaved] = useState(false);

  useEffect(() => {
    if (!recentlySaved) return;
    const timer = setTimeout(() => setRecentlySaved(false), 2000);
    return () => clearTimeout(timer);
  }, [recentlySaved]);

  if (!design) return null;

  const onSwitchChange = (next: boolean) => {
    if (next && !hasConfirmedOnce) {
      setConfirmPending(true);
      return;
    }
    setVisibility.mutate(next);
  };

  const onConfirm = () => {
    setHasConfirmedOnce(true);
    setConfirmPending(false);
    setVisibility.mutate(true);
  };

  const onSaveAsTemplate = async () => {
    await flushAutosave();
    await forkAsTemplate.mutateAsync(designId);
    setRecentlySaved(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Publish
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        {confirmPending ? (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm text-foreground">Anyone can view and fork. Continue?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmPending(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={onConfirm}>
                Publish
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between">
              <span className="font-sans text-sm text-foreground">Public</span>
              <Switch
                checked={design.isPublic}
                onCheckedChange={onSwitchChange}
                disabled={setVisibility.isPending}
              />
            </label>
            {design.type === 'project' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveAsTemplate}
                disabled={forkAsTemplate.isPending || recentlySaved}
              >
                {recentlySaved
                  ? '✓ Saved as template'
                  : forkAsTemplate.isPending
                    ? 'Saving…'
                    : 'Save as template'}
              </Button>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export { PublishPopover };
