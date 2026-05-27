import { ScreenBackground } from '@/shared/ui/screen-background';
import { useCommunityProjects } from '@/features/projects/queries';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { ProjectCard } from '@/pages/dashboard/ui/project-card';

const CommunityPage = () => {
  const { data: projects, isPending } = useCommunityProjects();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ScreenBackground />
      <TopBar />
      <main className="relative z-10 mx-auto max-w-[1200px] px-10 pt-14 pb-24">
        <h1 className="m-0 mb-10 font-sans text-3xl font-medium tracking-[-0.02em]">Explore</h1>
        {isPending ? null : (projects?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center border border-hairline bg-black/10 py-16 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
            No community projects yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {(projects ?? []).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export { CommunityPage };
