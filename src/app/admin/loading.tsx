export default function AdminLoading() {
  return (
    <section className="space-y-4">
      <div className="ds-card animate-pulse p-5 md:p-7">
        <div className="h-4 w-28 rounded bg-[var(--dourado)]/45" />
        <div className="mt-3 h-9 w-72 max-w-full rounded bg-[var(--dourado)]/35" />
        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
          <div className="h-20 rounded-xl bg-white/65" />
        </div>
      </div>
      <div className="ds-card h-80 animate-pulse bg-white/70" />
    </section>
  );
}
