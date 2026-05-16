import type { RouteObject } from 'react-router';
import { AuthShell } from '@/widgets/auth-shell';
import { EditorPage } from '@/pages/editor';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import { ForgotPage } from '@/pages/forgot';
import { ResetPage } from '@/pages/reset';
import { NotFoundPage } from '@/pages/not-found';
import { CallbackPage } from '@/pages/callback';
import { requireAuth, requireAnon, completeOAuth } from '@/features/auth/session';

const routes: RouteObject[] = [
  { path: '/', loader: requireAuth, Component: EditorPage },
  {
    Component: AuthShell,
    children: [
      { path: '/signin', loader: requireAnon, Component: SignInPage },
      { path: '/signup', loader: requireAnon, Component: SignUpPage },
      { path: '/forgot', loader: requireAnon, Component: ForgotPage },
      { path: '/reset', loader: requireAnon, Component: ResetPage },
      { path: '/callback', loader: completeOAuth, Component: CallbackPage },
    ],
  },
  { path: '*', Component: NotFoundPage },
];

export { routes };
