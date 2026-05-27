import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { placeholderThumb } from '@/pages/dashboard/lib/thumb-generators';
import type { ProjectSummary } from '@/features/projects/schema';
import { useUser } from '@/features/auth/queries';
import { PublicIcon, PrivateIcon } from '@/shared/ui/visibility-icons';
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
          <span className="absolute top-2 left-2 flex size-5 items-center justify-center border border-hairline-strong bg-black/60 text-fg-dim">
            {project.isPublic ? (
              <PublicIcon className="size-3" />
            ) : (
              <PrivateIcon className="size-3" />
            )}
          </span>
          {project.type === 'template' ? (
            <span className="absolute bottom-2 left-2 border border-hairline-strong bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground">
              Template
            </span>
          ) : null}
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setRenameOpen(true);
                }}
                aria-label="Rename project"
                className="absolute top-2 right-9 flex size-5 items-center justify-center border border-hairline-strong bg-black/60 text-fg-dim hover:text-foreground"
              >
                <PencilSimpleIcon className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                aria-label="Delete project"
                className="absolute top-2 right-2 flex size-5 items-center justify-center border border-hairline-strong bg-black/60 text-fg-dim hover:text-destructive"
              >
                <TrashIcon className="size-3" />
              </button>
            </>
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
