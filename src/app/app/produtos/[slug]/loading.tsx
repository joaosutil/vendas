export default function ProductLoading() {
  return (
    <section className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="grid gap-4 xl:grid-cols-[1.8fr_0.9fr]">
        <div className="h-[72vh] animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="space-y-4">
          <div className="h-44 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
          <div className="h-56 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
          <div className="h-56 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        </div>
      </div>
    </section>
  );
}
