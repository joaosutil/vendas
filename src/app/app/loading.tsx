export default function MembersLoading() {
  return (
    <section className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-40 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-40 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
        <div className="h-40 animate-pulse rounded-2xl border border-white/60 bg-white/70" />
      </div>
    </section>
  );
}
