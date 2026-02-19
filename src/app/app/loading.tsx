export default function MembersLoading() {
  return (
    <section className="space-y-4">
      <div className="ds-card animate-pulse p-5 md:p-7">
        <div className="h-4 w-32 rounded bg-[var(--dourado)]/40" />
        <div className="mt-3 h-8 w-64 rounded bg-[var(--dourado)]/35" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-[var(--dourado)]/25" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="ds-card h-40 animate-pulse bg-white/70" />
        <div className="ds-card h-40 animate-pulse bg-white/70" />
        <div className="ds-card h-40 animate-pulse bg-white/70" />
      </div>
    </section>
  );
}
