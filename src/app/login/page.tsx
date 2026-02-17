import Link from "next/link";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const hasCredentialError = params.error === "credenciais";
  const hasServerError = params.error === "servidor";

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-white/60 bg-white/75 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold">Entrar na área de membros</h1>
        <p className="mt-2 text-sm text-[var(--carvao)]/80">Use o e-mail da compra para acessar seu conteúdo.</p>
        {hasCredentialError ? (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            E-mail ou senha inválidos.
          </p>
        ) : null}
        {hasServerError ? (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            Erro interno ao processar login. Tente novamente em instantes.
          </p>
        ) : null}
        <form action="/api/auth/login" method="post" className="mt-5 space-y-3">
          <input
            required
            type="email"
            name="email"
            placeholder="Seu e-mail"
            className="w-full rounded-xl border border-[var(--dourado)]/60 bg-white px-3 py-2 outline-none"
          />
          <input
            required
            type="password"
            name="password"
            placeholder="Sua senha"
            className="w-full rounded-xl border border-[var(--dourado)]/60 bg-white px-3 py-2 outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Entrar
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--carvao)]/70">
          Primeira vez? Você recebe um link para definir senha após confirmação do pagamento.
        </p>
        <Link href="/ansiedade" className="mt-5 inline-block text-sm underline">
          Voltar para a oferta
        </Link>
      </div>
    </main>
  );
}
