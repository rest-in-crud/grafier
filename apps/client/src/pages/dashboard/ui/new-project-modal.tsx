import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useCreateProject } from '@/features/projects/queries';
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

const todayPlaceholder = (): string => {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  return `Untitled · ${day} ${month} ${year}`;
};

type NewProjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewProjectModal = ({ open, onOpenChange }: NewProjectModalProps) => {
  const navigate = useNavigate();
  const create = useCreateProject();
  const [name, setName] = useState('');
  const placeholder = todayPlaceholder();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || placeholder;
    const project = await create.mutateAsync(finalName);
    onOpenChange(false);
    navigate(`/editor/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Name your canvas.</DialogTitle>
          <DialogDescription>You can rename it any time from the editor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            disabled={create.isPending}
          />
          {create.error ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
              Could not create project; check your connection and try again
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { NewProjectModal };
