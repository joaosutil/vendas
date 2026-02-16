import { requireUser } from "@/lib/require-user";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-bold">Conta</h1>
      <p className="mt-2 text-sm text-[var(--carvao)]/80">Gerencie seus dados e sessão.</p>
      <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 p-5">
        <p className="text-sm">
          <strong>E-mail:</strong> {user.email}
        </p>
      </div>
      <form action="/api/auth/logout" method="post" className="mt-4">
        <button type="submit" className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white">
          Sair
        </button>
      </form>
    </section>
  );
}
