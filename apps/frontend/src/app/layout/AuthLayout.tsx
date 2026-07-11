import { Outlet } from 'react-router-dom';

/** Centered card chrome for unauthenticated pages (login, future reset); nests under RootLayout so the site header stays visible. */
export function AuthLayout() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10">
      <main className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50">
        <Outlet />
      </main>
    </div>
  );
}
