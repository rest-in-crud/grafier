import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { formatVersionTimestamp } from '@/features/versions/lib/version-labels';
import type { Version } from '@/features/versions/schema';

type VersionRowProps = {
  version: Version;
  canEdit: boolean;
  disabled: boolean;
  isRestoring: boolean;
  onRestore: () => void;
  onRename: (label: string | null) => void;
  onDelete: () => void;
};

const VersionRow = ({
  version,
  canEdit,
  disabled,
  isRestoring,
  onRestore,
  onRename,
  onDelete,
}: VersionRowProps) => {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(version.label ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renaming) return;
    const timer = setTimeout(() => {
      setRenameValue(version.label ?? '');
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [renaming, version.label]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    onRename(trimmed.length > 0 ? trimmed : null);
    setRenaming(false);
  };

  const cancelRename = () => {
    setRenaming(false);
    setRenameValue(version.label ?? '');
  };

  const titleLine = version.label ?? formatVersionTimestamp(version.createdAt);
  const timestampLine = formatVersionTimestamp(version.createdAt);

  return (
    <div className="flex items-start justify-between gap-3 border border-hairline bg-black/20 px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitRename();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
              }
            }}
            onBlur={commitRename}
            className="w-full border border-hairline-strong bg-background px-1.5 py-0.5 font-sans text-[13px] text-foreground outline-none focus:border-foreground"
          />
        ) : (
          <div className="truncate font-sans text-[13px] font-medium text-foreground">
            {titleLine}
          </div>
        )}
        <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
          {timestampLine}
        </div>
      </div>
      {canEdit ? (
        confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
              Delete?
            </span>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmingDelete(false);
                onDelete();
              }}
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onRestore} disabled={disabled}>
              {isRestoring ? 'Restoring…' : 'Restore'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="cursor-pointer focus:bg-white/10"
                  aria-label="More"
                >
                  ⋯
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 min-w-0">
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/10"
                  onSelect={(e) => {
                    e.preventDefault();
                    setRenaming(true);
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/10"
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmingDelete(true);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      ) : null}
    </div>
  );
};

export { VersionRow };
