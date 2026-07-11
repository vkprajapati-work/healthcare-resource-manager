import { Link, NavLink, Outlet } from 'react-router-dom';

import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useCurrentUser, useLogout } from '@/features/auth';
import { cn } from '@/lib/utils';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200',
  );
}

export function RootLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
            {env.VITE_APP_NAME}
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavLink to={ROUTES.home} end className={navLinkClass}>
              Resources
            </NavLink>
            {user?.role === 'ADMIN' ? (
              <NavLink to={ROUTES.admin.root} className={navLinkClass}>
                Admin
              </NavLink>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
              >
                Sign out
              </button>
            ) : (
              <NavLink to={ROUTES.login} className={navLinkClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
