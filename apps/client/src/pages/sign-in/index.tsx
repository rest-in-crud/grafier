import { TwoColumnCard, TwoColumnCardArt, TwoColumnCardForm } from '@/shared/ui/two-column-card';

const SignInPage = () => {
  return (
    <TwoColumnCard>
      <TwoColumnCardForm>
        <h1 className="text-3xl font-medium tracking-tight">Welcome back.</h1>
      </TwoColumnCardForm>
      <TwoColumnCardArt>
        <div className="grid h-full place-items-center font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          [ art slot ]
        </div>
      </TwoColumnCardArt>
    </TwoColumnCard>
  );
};

export { SignInPage };
