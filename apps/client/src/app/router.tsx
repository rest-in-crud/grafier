import { createBrowserRouter } from 'react-router';
import { AuthShell } from '@/widgets/auth-shell';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import { ForgotPage } from '@/pages/forgot';
import { NotFoundPage } from '@/pages/not-found';
import { CallbackPage } from '@/pages/callback';
import { performRestoreSession } from '@/features/auth/session';

const router = createBrowserRouter([
  {
    loader: performRestoreSession,
    children: [
      {
        Component: AuthShell,
        children: [
          { path: '/', Component: SignInPage },
          { path: '/signin', Component: SignInPage },
          { path: '/signup', Component: SignUpPage },
          { path: '/forgot', Component: ForgotPage },
          { path: '/callback', Component: CallbackPage },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

export { router };
