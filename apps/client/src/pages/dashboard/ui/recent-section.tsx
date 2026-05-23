import { Link } from 'react-router';
import { useProjectsList } from '@/features/projects/queries';
import { ProjectCard } from '@/pages/dashboard/ui/project-card';

const RecentSection = () => {
  const { data: projects, isPending } = useProjectsList();

  if (isPending) return null;

  const total = projects?.length ?? 0;
  const recent = (projects ?? []).slice(0, 4);

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="m-0 font-sans text-lg font-medium tracking-[-0.005em] text-foreground">
          Recent
          {total > 0 ? (
            <span className="ml-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-fg-dim">
              {`· ${recent.length} of ${total}`}
            </span>
          ) : null}
        </h2>
        {total > 4 ? (
          <Link
            to="/projects"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim transition-colors hover:text-foreground"
          >
            See all →
          </Link>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center border border-hairline bg-black/10 py-12 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
          No projects yet · click New Project above to start
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {recent.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
};

export { RecentSection };
