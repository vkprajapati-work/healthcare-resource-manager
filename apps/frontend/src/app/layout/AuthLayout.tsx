import { Link, Outlet } from 'react-router-dom';

import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';

/** Minimal centered chrome for unauthenticated pages (login, future reset). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link to={ROUTES.home} className="mb-8 text-xl font-semibold tracking-tight">
        {env.VITE_APP_NAME}
      </Link>
      <main className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Outlet />
      </main>
    </div>
  );
}
