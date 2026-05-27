import { useMemo, useState } from 'react';
import { ScreenBackground } from '@/shared/ui/screen-background';
import { useMyProjects } from '@/features/projects/queries';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { ProjectCard } from '@/pages/dashboard/ui/project-card';
import { ProjectsToolbar } from './ui/projects-toolbar';
import type { SortOrder } from './ui/projects-toolbar';

const ProjectsListPage = () => {
  const { data: projects, isPending } = useMyProjects();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('recent');

  const visible = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = trimmed
      ? (projects ?? []).filter((p) => p.name.toLowerCase().includes(trimmed))
      : (projects ?? []);
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === 'alpha') return a.name.localeCompare(b.name);
      const cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sort === 'recent' ? -cmp : cmp;
    });
    return sorted;
  }, [projects, query, sort]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ScreenBackground />
      <TopBar />
      <main className="relative z-10 mx-auto max-w-[1200px] px-10 pt-14 pb-24">
        <h1 className="m-0 mb-10 font-sans text-3xl font-medium tracking-[-0.02em]">My Projects</h1>
        {(projects?.length ?? 0) > 0 ? (
          <ProjectsToolbar
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
          />
        ) : null}
        {isPending ? null : (projects?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center border border-hairline bg-black/10 py-16 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
            No projects yet
          </div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center border border-hairline bg-black/10 py-16 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
            No projects match your search
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export { ProjectsListPage };
