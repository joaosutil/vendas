import Link from "next/link";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const sent = params.status === "sent";

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-[var(--carvao)]/80">
          Informe o e-mail da compra e enviaremos um link para redefinir sua senha.
        </p>
        {sent ? (
          <p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Se o e-mail existir na base, enviamos o link de recuperação. Verifique Inbox, Spam e Promoções.
          </p>
        ) : null}
        <form action="/api/auth/forgot-password" method="post" className="mt-5 space-y-3">
          <input
            required
            type="email"
            name="email"
            placeholder="Seu e-mail de compra"
            className="w-full rounded-xl border border-[var(--dourado)]/60 bg-white px-3 py-2 outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Enviar link de recuperação
          </button>
        </form>
        <Link href="/login" className="mt-4 inline-block text-sm underline">
          Voltar para login
        </Link>
      </div>
    </main>
  );
}
