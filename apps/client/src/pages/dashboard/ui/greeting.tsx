import { useUser } from '@/features/auth/queries';
import { useMyProjects } from '@/features/projects/queries';

const greetingFor = (hour: number): 'morning' | 'afternoon' | 'evening' => {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const Greeting = () => {
  const { user } = useUser();
  const { data: projects } = useMyProjects();

  const firstName = (user?.name ?? user?.email ?? '').split(/[ @]/)[0] || 'there';
  const timeOfDay = greetingFor(new Date().getHours());
  const projectCount = projects?.length ?? 0;

  return (
    <section className="mb-10">
      <h1 className="m-0 mb-3 font-sans text-[44px] font-medium leading-none tracking-[-0.025em]">
        {`Good ${timeOfDay}, ${firstName}.`}
      </h1>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim">
        {projectCount === 1 ? '1 project' : `${projectCount} projects`}
      </div>
    </section>
  );
};

export { Greeting };
