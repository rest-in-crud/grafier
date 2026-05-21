import type { RouteObject } from 'react-router';
import { AuthShell } from '@/widgets/auth-shell';
import { EditorPage } from '@/pages/editor';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import { ForgotPage } from '@/pages/forgot';
import { ResetPage } from '@/pages/reset';
import { VerifyPage } from '@/pages/verify';
import { NotFoundPage } from '@/pages/not-found';
import { CallbackPage } from '@/pages/callback';
import { completeOAuth } from '@/features/auth/session';
import { RequireAuth, RequireAnon } from '@/app/guards';

const routes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [{ path: '/', Component: EditorPage }],
  },
  {
    Component: AuthShell,
    children: [
      {
        element: <RequireAnon />,
        children: [
          { path: '/signin', Component: SignInPage },
          { path: '/signup', Component: SignUpPage },
          { path: '/forgot', Component: ForgotPage },
          { path: '/reset', Component: ResetPage },
          { path: '/verify', Component: VerifyPage },
        ],
      },
      { path: '/callback', loader: completeOAuth, Component: CallbackPage },
    ],
  },
  { path: '*', Component: NotFoundPage },
];

export { routes };
