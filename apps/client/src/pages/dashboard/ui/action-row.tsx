import { useState } from 'react';
import { ComingSoonModal } from '@/pages/dashboard/ui/coming-soon-modal';

type ModalKind = 'import' | 'templates' | null;

const ActionRow = () => {
  const [openModal, setOpenModal] = useState<ModalKind>(null);

  return (
    <>
      <div className="mb-16 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpenModal('import')}
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px"
        >
          Import File
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('templates')}
          className="inline-flex items-center gap-3.5 border border-hairline-strong bg-transparent px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:bg-white/[0.03] active:translate-y-px"
        >
          Browse Templates
        </button>
      </div>

      <ComingSoonModal
        open={openModal === 'import'}
        onOpenChange={(o) => setOpenModal(o ? 'import' : null)}
        title="Import a file"
        description="File imports land in a later release. For now, start from a blank canvas via New Project."
      />
      <ComingSoonModal
        open={openModal === 'templates'}
        onOpenChange={(o) => setOpenModal(o ? 'templates' : null)}
        title="Templates"
        description="Templates land in v0.4. Start from a blank canvas via New Project for now."
      />
    </>
  );
};

export { ActionRow };
