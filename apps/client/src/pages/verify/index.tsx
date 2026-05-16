import { Link } from 'react-router';
import { TwoColumnCard, TwoColumnCardArt, TwoColumnCardForm } from '@/shared/ui/two-column-card';
import { VerifyForm } from '@/features/auth/ui/verify-form';

const VerifyPage = () => {
  return (
    <TwoColumnCard>
      <TwoColumnCardForm>
        <div className="mb-8 flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          <span className="h-px flex-1 bg-hairline" />
          <span>Verify</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <h1 className="mb-7 text-display font-medium tracking-tight">Confirm your email.</h1>

        <VerifyForm />

        <p className="mt-7 max-w-[36ch] text-body text-muted-foreground">
          <Link to="/signin" className="text-foreground underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </TwoColumnCardForm>
      <TwoColumnCardArt>
        <div className="grid h-full place-items-center font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          [ art slot ]
        </div>
      </TwoColumnCardArt>
    </TwoColumnCard>
  );
};

export { VerifyPage };
