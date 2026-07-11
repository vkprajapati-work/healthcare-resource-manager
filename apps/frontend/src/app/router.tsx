import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/app/layout/AuthLayout';
import { DashboardLayout } from '@/app/layout/DashboardLayout';
import { RootLayout } from '@/app/layout/RootLayout';
import { NotFoundPage } from '@/app/NotFoundPage';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';
import { Spinner } from '@/components/common/Spinner';
import { ROUTES } from '@/config/routes';
import { ProtectedRoute } from '@/features/auth';

import type { ReactNode } from 'react';

const ResourcesPage = lazy(() =>
  import('@/features/resources').then((m) => ({ default: m.ResourcesPage })),
);
const LoginPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.LoginPage })));
const AdminDashboardPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminDashboardPage })),
);

function withSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<Spinner label="Loading page" />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public area — reads are public per the API contract.
      {
        element: <RootLayout />,
        children: [
          { path: ROUTES.home, element: withSuspense(<ResourcesPage />) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [{ path: ROUTES.login, element: withSuspense(<LoginPage />) }],
      },
      // Admin area — mutations require an ADMIN session.
      {
        element: <ProtectedRoute requiredRole="ADMIN" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: ROUTES.admin.root, element: withSuspense(<AdminDashboardPage />) },
              { path: ROUTES.admin.doctors, element: <ComingSoonPage title="Doctors" /> },
              { path: ROUTES.admin.drivers, element: <ComingSoonPage title="Drivers" /> },
              { path: ROUTES.admin.vehicles, element: <ComingSoonPage title="Vehicles" /> },
            ],
          },
        ],
      },
    ],
  },
]);
