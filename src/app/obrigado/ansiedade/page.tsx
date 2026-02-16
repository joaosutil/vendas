import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16 text-center">
      <div className="w-full rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl">
        <h1 className="text-4xl font-bold">Pagamento recebido ✅</h1>
        <p className="mt-3 text-[var(--carvao)]/85">
          Seu acesso está sendo liberado agora. Em poucos minutos, você vai receber um e-mail com o link para definir
          sua senha e entrar.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-xl bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
        >
          Ir para o login
        </Link>
        <p className="mt-3 text-xs text-[var(--carvao)]/75">Se não encontrar o e-mail, confira spam e promoções.</p>
      </div>
    </main>
  );
}
