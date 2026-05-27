import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useDeleteProject } from '@/features/projects/queries';

type DeleteProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
};

const DeleteProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  projectName,
}: DeleteProjectDialogProps) => {
  const remove = useDeleteProject();

  const onConfirm = async () => {
    try {
      await remove.mutateAsync(projectId);
      onOpenChange(false);
    } catch {
      // mutation .error state drives the inline error message
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            <span className="truncate font-medium text-foreground">{projectName}</span> will be
            permanently deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {remove.error ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
            Could not delete; check your connection and try again
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={remove.isPending}>
            {remove.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteProjectDialog };
