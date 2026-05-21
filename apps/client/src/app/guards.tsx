import { Navigate, Outlet } from 'react-router';
import { useUser } from '@/features/auth/queries';

const RequireAuth = () => {
  const { user, isPending } = useUser();
  if (isPending) return null;
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
};

const RequireAnon = () => {
  const { user, isPending } = useUser();
  if (isPending) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};

export { RequireAuth, RequireAnon };
