import { useState } from 'react';
import { Link } from 'react-router';
import { ComingSoonModal } from '@/pages/dashboard/ui/coming-soon-modal';
import { NewProjectModal } from '@/pages/dashboard/ui/new-project-modal';

type ModalKind = 'new' | 'import' | null;

const ActionRow = () => {
  const [openModal, setOpenModal] = useState<ModalKind>(null);

  return (
    <>
      <div className="mb-16 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpenModal('new')}
          className="inline-flex items-center gap-3.5 border border-foreground bg-foreground px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-white active:translate-y-px"
        >
          New Project
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('import')}
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px"
        >
          Import File
        </button>
        <Link
          to="/templates"
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px"
        >
          Browse Templates
        </Link>
      </div>

      <NewProjectModal
        open={openModal === 'new'}
        onOpenChange={(o) => setOpenModal(o ? 'new' : null)}
      />
      <ComingSoonModal
        open={openModal === 'import'}
        onOpenChange={(o) => setOpenModal(o ? 'import' : null)}
        title="Import a file"
        description="File imports land in a later release. For now, start from a blank canvas via New Project."
      />
    </>
  );
};

export { ActionRow };
