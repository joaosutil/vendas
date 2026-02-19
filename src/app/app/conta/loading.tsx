export default function AccountLoading() {
  return (
    <section className="space-y-4">
      <div className="ds-card animate-pulse p-5">
        <div className="h-8 w-56 rounded bg-[var(--dourado)]/35" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-[var(--dourado)]/25" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ds-card h-72 animate-pulse bg-white/75" />
        <div className="ds-card h-72 animate-pulse bg-white/75" />
      </div>
      <div className="ds-card h-44 animate-pulse bg-white/75" />
    </section>
  );
}

