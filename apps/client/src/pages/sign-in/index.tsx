import { TwoColumnCard, TwoColumnCardArt, TwoColumnCardForm } from '@/shared/ui/two-column-card';
import { SignInForm } from '@/features/auth/ui/sign-in-form';

const SignInPage = () => {
  return (
    <TwoColumnCard>
      <TwoColumnCardForm>
        <div className="mb-8 flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          <span className="h-px flex-1 bg-hairline" />
          <span>Authenticate</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <h1 className="mb-3 text-display font-medium tracking-tight">Welcome back.</h1>
        <p className="mb-7 max-w-[36ch] text-body text-muted-foreground">
          Sign in to pick up where you left off.
        </p>

        <SignInForm />
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
