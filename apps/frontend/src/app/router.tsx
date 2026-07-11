import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/app/layout/AuthLayout';
import { DashboardLayout } from '@/app/layout/DashboardLayout';
import { RootLayout } from '@/app/layout/RootLayout';
import { NotFoundPage } from '@/app/NotFoundPage';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
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
const DoctorsPage = lazy(() =>
  import('@/features/doctors').then((m) => ({ default: m.DoctorsPage })),
);
const DriversPage = lazy(() =>
  import('@/features/drivers').then((m) => ({ default: m.DriversPage })),
);
const VehiclesPage = lazy(() =>
  import('@/features/vehicles').then((m) => ({ default: m.VehiclesPage })),
);

function withSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<Spinner label="Loading page" />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public area — reads are public per the API contract. Login nests under
      // the same header/nav chrome so the site frame stays consistent.
      {
        element: <RootLayout />,
        children: [
          { path: ROUTES.home, element: withSuspense(<ResourcesPage />) },
          {
            element: <AuthLayout />,
            children: [{ path: ROUTES.login, element: withSuspense(<LoginPage />) }],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      // Admin area — mutations require an ADMIN session.
      {
        element: <ProtectedRoute requiredRole="ADMIN" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: ROUTES.admin.root, element: withSuspense(<AdminDashboardPage />) },
              { path: ROUTES.admin.doctors, element: withSuspense(<DoctorsPage />) },
              { path: ROUTES.admin.drivers, element: withSuspense(<DriversPage />) },
              { path: ROUTES.admin.vehicles, element: withSuspense(<VehiclesPage />) },
            ],
          },
        ],
      },
    ],
  },
]);
