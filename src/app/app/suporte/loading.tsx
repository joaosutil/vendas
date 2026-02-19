export default function SupportLoading() {
  return (
    <section className="space-y-4">
      <div className="ds-card animate-pulse p-5">
        <div className="h-8 w-48 rounded bg-[var(--dourado)]/35" />
        <div className="mt-2 h-4 w-[32rem] max-w-full rounded bg-[var(--dourado)]/25" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <div className="space-y-4">
          <div className="ds-card h-56 animate-pulse bg-white/75" />
          <div className="ds-card h-80 animate-pulse bg-white/75" />
        </div>
        <div className="ds-card h-[32rem] animate-pulse bg-white/75" />
      </div>
    </section>
  );
}

