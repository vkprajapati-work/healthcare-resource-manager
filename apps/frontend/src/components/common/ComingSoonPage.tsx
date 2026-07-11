interface ComingSoonPageProps {
  title: string;
}

/** Route placeholder for features that are planned but not yet built. */
export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      <p className="text-slate-600">
        This module is not built yet — the route, layout, and access control are already in place
        for it.
      </p>
    </section>
  );
}
