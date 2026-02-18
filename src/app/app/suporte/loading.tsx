export default function SupportLoading() {
  return (
    <section className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
        <div className="h-96 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-96 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      </div>
    </section>
  );
}
