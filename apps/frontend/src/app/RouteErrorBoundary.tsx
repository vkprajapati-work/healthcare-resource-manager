import { Link, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">An unexpected error occurred while rendering this page.</p>
      <Link to="/" className="text-sm font-medium underline underline-offset-4">
        Back to resources
      </Link>
    </section>
  );
}
