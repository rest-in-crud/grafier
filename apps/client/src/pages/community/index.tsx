import { ScreenBackground } from '@/shared/ui/screen-background';
import { TopBar } from '@/pages/dashboard/ui/top-bar';

const CommunityPage = () => {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ScreenBackground />
      <TopBar />
      <main className="relative z-10 mx-auto max-w-[1200px] px-10 pt-14 pb-24">
        <h1 className="m-0 mb-10 font-sans text-3xl font-medium tracking-[-0.02em]">Community</h1>
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-fg-dim">
          Community list lands in the next release
        </p>
      </main>
    </div>
  );
};

export { CommunityPage };
