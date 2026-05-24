import { ScreenBackground } from '@/shared/ui/screen-background';
import { TopBar } from '@/pages/dashboard/ui/top-bar';
import { Greeting } from '@/pages/dashboard/ui/greeting';
import { ActionRow } from '@/pages/dashboard/ui/action-row';
import { RecentSection } from '@/pages/dashboard/ui/recent-section';
import { TemplatesSection } from '@/pages/dashboard/ui/templates-section';
import { CommunitySection } from '@/pages/dashboard/ui/community-section';

const DashboardPage = () => {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <ScreenBackground />

      <TopBar />

      <main className="relative z-10 mx-auto max-w-[1200px] px-10 pt-14 pb-24">
        <Greeting />
        <ActionRow />
        <RecentSection />
        <TemplatesSection />
        <CommunitySection />
      </main>
    </div>
  );
};

export { DashboardPage };
