export default function AdminLoading() {
  return (
    <section className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="h-14 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-36 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      </div>
    </section>
  );
}
