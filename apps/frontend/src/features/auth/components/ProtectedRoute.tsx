import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '@/components/common/Spinner';
import { ROUTES } from '@/config/routes';

import { useCurrentUser } from '../hooks/use-auth';

import type { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

/**
 * Route guard for authenticated areas. Waits for the session check, then
 * redirects to the login page (preserving the intended destination) when
 * signed out, or home when signed in without the required role.
 */
export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { data: user, isPending } = useCurrentUser();
  const location = useLocation();

  if (isPending) {
    return <Spinner label="Checking your session" />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
