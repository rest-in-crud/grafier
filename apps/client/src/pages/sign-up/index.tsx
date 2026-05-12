import { Link } from 'react-router';
import { TwoColumnCard, TwoColumnCardArt, TwoColumnCardForm } from '@/shared/ui/two-column-card';
import { SignUpForm } from '@/features/auth/ui/sign-up-form';

const SignUpPage = () => {
  return (
    <TwoColumnCard>
      <TwoColumnCardForm>
        <div className="mb-8 flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          <span className="h-px flex-1 bg-hairline" />
          <span>Register</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <h1 className="mb-3 text-display font-medium tracking-tight">Create account.</h1>
        <p className="mb-2 max-w-[36ch] text-body text-muted-foreground">
          Get started with Grafier in seconds.
        </p>
        <p className="mb-7 max-w-[36ch] text-body text-muted-foreground">
          Already here?{' '}
          <Link to="/signin" className="text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
          .
        </p>

        <SignUpForm />
      </TwoColumnCardForm>
      <TwoColumnCardArt>
        <div className="grid h-full place-items-center font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          [ art slot ]
        </div>
      </TwoColumnCardArt>
    </TwoColumnCard>
  );
};

export { SignUpPage };
