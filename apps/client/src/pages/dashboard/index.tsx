import { ScreenBackground } from '@/shared/ui/screen-background';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { Greeting } from '@/pages/dashboard/ui/greeting';
import { ActionRow } from '@/pages/dashboard/ui/action-row';
import { RecentSection } from '@/pages/dashboard/ui/recent-section';
import { ComingSoonSection } from '@/pages/dashboard/ui/coming-soon-section';

const DashboardPage = () => {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ScreenBackground />

      <TopBar />

      <main className="relative z-10 mx-auto max-w-[1200px] px-10 pt-14 pb-24">
        <Greeting />
        <ActionRow />
        <RecentSection />
        <ComingSoonSection title="Templates" body="Templates coming soon" />
        <ComingSoonSection title="Community" subTitle="· REMIXABLE" body="Community coming soon" />
      </main>
    </div>
  );
};

export { DashboardPage };
