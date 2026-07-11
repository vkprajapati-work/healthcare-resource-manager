import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { BrandMark } from '@/components/common/BrandMark';
import { env } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useCurrentUser, useLogout } from '@/features/auth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: ROUTES.admin.root, label: 'Dashboard', end: true },
  { to: ROUTES.admin.doctors, label: 'Doctors', end: false },
  { to: ROUTES.admin.drivers, label: 'Drivers', end: false },
  { to: ROUTES.admin.vehicles, label: 'Vehicles', end: false },
] as const;

function sideLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
    isActive
      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
      : 'text-slate-500 hover:bg-primary-50 hover:text-primary-600',
  );
}

/** Admin area chrome: light sidebar, header with breadcrumb, content, footer. */
export function DashboardLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { pathname } = useLocation();

  const section = NAV_ITEMS.find(
    (item) => pathname === item.to || (!item.end && pathname.startsWith(item.to)),
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col gap-8 border-r border-slate-100 bg-white/90 p-4 backdrop-blur md:flex">
        <Link to={ROUTES.home} className="flex items-center gap-2.5 px-1 pt-1">
          <BrandMark />
          <span className="text-sm font-semibold leading-tight text-slate-900">
            {env.VITE_APP_NAME}
          </span>
        </Link>
        <nav aria-label="Admin" className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sideLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-1 text-xs text-slate-400">Admin console</p>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/70 px-6 py-3 backdrop-blur">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <ol className="flex items-center gap-2">
              <li>
                <Link to={ROUTES.admin.root} className="hover:underline">
                  Admin
                </Link>
              </li>
              {section && section.to !== ROUTES.admin.root ? (
                <li aria-current="page" className="flex items-center gap-2 font-medium">
                  <span aria-hidden="true" className="text-slate-300">
                    /
                  </span>
                  {section.label}
                </li>
              ) : null}
            </ol>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          {env.VITE_APP_NAME} — admin area
        </footer>
      </div>
    </div>
  );
}
