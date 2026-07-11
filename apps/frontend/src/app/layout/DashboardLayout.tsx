import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

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
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200',
  );
}

/**
 * Admin area chrome: sidebar, header with breadcrumb placeholder, content,
 * footer. Placeholder-grade on purpose — final UI comes with the features.
 */
export function DashboardLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { pathname } = useLocation();

  const section = NAV_ITEMS.find(
    (item) => pathname === item.to || (!item.end && pathname.startsWith(item.to)),
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col gap-6 border-r border-slate-200 bg-white p-4 md:flex">
        <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
          {env.VITE_APP_NAME}
        </Link>
        <nav aria-label="Admin" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sideLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <ol className="flex items-center gap-2">
              <li>
                <Link to={ROUTES.admin.root} className="hover:underline">
                  Admin
                </Link>
              </li>
              {section && section.to !== ROUTES.admin.root ? (
                <li aria-current="page" className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  {section.label}
                </li>
              ) : null}
            </ol>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user?.email}</span>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="rounded-md px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
          {env.VITE_APP_NAME} — admin area
        </footer>
      </div>
    </div>
  );
}
