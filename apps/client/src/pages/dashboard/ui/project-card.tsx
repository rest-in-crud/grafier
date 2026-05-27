import { useState } from 'react';
import { useNavigate } from 'react-router';
import { placeholderThumb } from '@/pages/dashboard/lib/thumb-generators';
import type { ProjectSummary } from '@/features/projects/schema';
import { useUser } from '@/features/auth/queries';
import { PublicIcon, PrivateIcon } from '@/shared/ui/visibility-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { RenameProjectDialog } from './rename-project-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';

type ProjectCardProps = {
  project: ProjectSummary;
};

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return 'Edited just now';
  if (minutes < 60) return `Edited ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Edited ${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Edited yesterday';
  return `Edited ${days} d ago`;
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const thumb = placeholderThumb(project.id);
  const showAuthor = project.userID !== user?.id && Boolean(project.userName);
  const isOwner = project.userID === user?.id;
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const onOpen = () => navigate(`/editor/${project.id}`);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={onKey}
        className="relative flex cursor-pointer flex-col border border-hairline bg-black/30 text-left transition-colors hover:border-hairline-strong hover:bg-black/40 focus:outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/40"
      >
        <div className="relative flex h-[130px] items-center justify-center overflow-hidden border-b border-hairline">
          <pre className="m-0 font-mono text-[6.5px] leading-[1.05] whitespace-pre text-foreground/90">
            {thumb}
          </pre>
          {project.type === 'template' ? (
            <span className="absolute top-2 left-2 border border-hairline-strong bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground">
              Template
            </span>
          ) : null}
          <span className="absolute top-2 right-2 flex size-5 items-center justify-center border border-hairline-strong bg-black/60 text-fg-dim">
            {project.isPublic ? (
              <PublicIcon className="size-3" />
            ) : (
              <PrivateIcon className="size-3" />
            )}
          </span>
          {isOwner ? (
            <div className="absolute top-2 right-9">
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="flex size-5 items-center justify-center border border-hairline-strong bg-black/60 font-mono text-[12px] leading-none text-fg-dim hover:text-foreground"
                  aria-label="Project actions"
                >
                  …
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="min-w-[140px] border border-hairline-strong bg-raised p-0 shadow-none ring-0"
                >
                  <DropdownMenuItem
                    className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground focus:bg-white/[0.06] focus:text-foreground"
                    onSelect={() => setRenameOpen(true)}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground focus:bg-white/[0.06] focus:text-destructive"
                    onSelect={() => setDeleteOpen(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
        <div className="px-3.5 py-3">
          <div className="mb-1 truncate font-sans text-[13px] font-medium tracking-[-0.005em] text-foreground">
            {project.name}
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
            {relativeTime(project.updatedAt)}
          </div>
          {showAuthor ? (
            <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dimmer">
              @{project.userName}
            </div>
          ) : null}
        </div>
      </div>
      {isOwner ? (
        <>
          <RenameProjectDialog
            open={renameOpen}
            onOpenChange={setRenameOpen}
            projectId={project.id}
            initialName={project.name}
          />
          <DeleteProjectDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            projectId={project.id}
            projectName={project.name}
          />
        </>
      ) : null}
    </>
  );
};

export { ProjectCard };
