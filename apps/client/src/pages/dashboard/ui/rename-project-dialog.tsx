import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useRenameProject } from '@/features/projects/queries';

type RenameProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  initialName: string;
};

const RenameProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  initialName,
}: RenameProjectDialogProps) => {
  const rename = useRenameProject();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setTimeout(() => setName(initialName), 0);
  }, [open, initialName]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) {
      onOpenChange(false);
      return;
    }
    try {
      await rename.mutateAsync({ id: projectId, name: trimmed });
      onOpenChange(false);
    } catch {
      // mutation .error state drives the inline error message
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Update the project's display name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={rename.isPending}
          />
          {rename.error ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
              Could not rename; check your connection and try again
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={rename.isPending || !name.trim()}>
              {rename.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { RenameProjectDialog };
