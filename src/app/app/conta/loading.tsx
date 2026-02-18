export default function AccountLoading() {
  return (
    <section className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-80 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
    </section>
  );
}
