import { Link, NavLink, Outlet } from 'react-router-dom';

import { BrandMark } from '@/components/common/BrandMark';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useCurrentUser, useLogout } from '@/features/auth';
import { cn } from '@/lib/utils';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
      : 'text-slate-600 hover:bg-slate-100',
  );
}

export function RootLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to={ROUTES.home} className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {env.VITE_APP_NAME}
            </span>
          </Link>
          <nav
            aria-label="Main"
            className="flex items-center gap-1 rounded-full bg-slate-50 p-1 ring-1 ring-slate-100"
          >
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
                className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-red-600 hover:shadow-sm disabled:opacity-50"
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
