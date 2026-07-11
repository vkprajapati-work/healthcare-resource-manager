import { useCurrentUser } from '@/features/auth';

/**
 * Protected example page (boilerplate) — reachable only through
 * ProtectedRoute with the ADMIN role. Real admin tooling lands here later.
 */
export function AdminDashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold">Admin dashboard</h1>
      <p className="text-slate-600">
        Signed in as{' '}
        <span className="font-medium text-slate-900">
          {user ? `${user.firstName} ${user.lastName}` : ''}
        </span>{' '}
        ({user?.email}, role {user?.role}).
      </p>
      <p className="mt-4 text-sm text-slate-500">
        This is a protected placeholder page — resource management tooling will live here.
      </p>
    </section>
  );
}
