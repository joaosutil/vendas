export default function ProductLoading() {
  return (
    <section className="space-y-4">
      <div className="ds-card animate-pulse p-5 md:p-6">
        <div className="h-3 w-28 rounded bg-[var(--dourado)]/40" />
        <div className="mt-3 h-9 w-80 max-w-full rounded bg-[var(--dourado)]/35" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-[var(--dourado)]/25" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="ds-card h-[70vh] animate-pulse bg-white/75" />
        <div className="space-y-4">
          <div className="ds-card h-56 animate-pulse bg-white/75" />
          <div className="ds-card h-48 animate-pulse bg-white/75" />
        </div>
      </div>
    </section>
  );
}
