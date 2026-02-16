type SetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold">Definir senha</h1>
        <p className="mt-2 text-sm text-[var(--carvao)]/80">Esse link vale por 30 minutos.</p>
        <form action="/api/auth/set-password" method="post" className="mt-5 space-y-3">
          <input type="hidden" name="token" value={token} />
          <input
            required
            minLength={8}
            name="password"
            type="password"
            placeholder="Nova senha (mín. 8 caracteres)"
            className="w-full rounded-xl border border-[var(--dourado)]/60 bg-white px-3 py-2 outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Salvar e entrar
          </button>
        </form>
      </div>
    </main>
  );
}
