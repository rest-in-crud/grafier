import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { NewProjectModal } from '@/pages/dashboard/ui/new-project-modal';
import { api } from '@/features/projects/api';
import { designsKeys } from '@/features/projects/query-keys';
import { projectFileSchema } from '@/features/projects/schema';

const MAX_IMPORT_BYTES = 9.5 * 1024 * 1024;
const ERROR_CLEAR_MS = 4000;

const ActionRow = () => {
  const [newOpen, setNewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!importError) return;
    const timer = setTimeout(() => setImportError(null), ERROR_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [importError]);

  const onImportClick = () => {
    if (importing) return;
    fileInputRef.current?.click();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setImportError('File is too large to import');
      return;
    }
    setImporting(true);
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = projectFileSchema.parse(JSON.parse(text));
      const created = await api.create({
        name: parsed.name,
        width: parsed.width,
        height: parsed.height,
        type: 'project',
      });
      await api.saveCanvas(created.id, {
        canvasJSON: parsed.canvasJSON,
        layersJSON: parsed.layersJSON,
      });
      queryClient.setQueryData(designsKeys.detail(created.id), created);
      void queryClient.invalidateQueries({ queryKey: designsKeys.myProjects() });
      navigate(`/editor/${created.id}`);
    } catch {
      setImportError('Could not import file');
      setImporting(false);
    }
  };

  return (
    <>
      <div className="mb-16 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-3.5 border border-foreground bg-foreground px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-white active:translate-y-px"
        >
          New Project
        </button>
        <button
          type="button"
          onClick={onImportClick}
          disabled={importing}
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          {importing ? 'Importing…' : 'Import File'}
        </button>
        <Link
          to="/templates"
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px"
        >
          Browse Templates
        </Link>
        {importError ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-danger">
            ✕ {importError}
          </span>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".grafier,application/json"
        className="hidden"
        onChange={onFileChange}
      />

      <NewProjectModal open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
};

export { ActionRow };
