import { Link } from 'react-router';
import { TwoColumnCard, TwoColumnCardArt, TwoColumnCardForm } from '@/shared/ui/two-column-card';
import { AsciiArt } from '@/shared/ui/ascii-art';
import { ForgotForm } from '@/features/auth/ui/forgot-form';

const ForgotPage = () => {
  return (
    <TwoColumnCard>
      <TwoColumnCardForm>
        <div className="mb-8 flex items-center gap-3 font-mono text-2xs uppercase tracking-mono text-muted-foreground">
          <span className="h-px flex-1 bg-hairline" />
          <span>Recover</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <h1 className="mb-3 text-display font-medium tracking-tight">Forgot your password?</h1>
        <p className="mb-2 max-w-[36ch] text-body text-muted-foreground">
          Enter your email and we'll send a reset link.
        </p>
        <p className="mb-7 max-w-[36ch] text-body text-muted-foreground">
          Remembered it?{' '}
          <Link to="/signin" className="text-foreground underline-offset-2 hover:underline">
            Back to sign in
          </Link>
          .
        </p>

        <ForgotForm />
      </TwoColumnCardForm>
      <TwoColumnCardArt>
        <AsciiArt piece="path" />
      </TwoColumnCardArt>
    </TwoColumnCard>
  );
};

export { ForgotPage };
