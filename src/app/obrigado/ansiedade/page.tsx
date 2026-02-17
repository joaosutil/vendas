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
        <div className="mt-5 rounded-2xl border border-[var(--dourado)]/50 bg-[var(--creme)]/75 px-4 py-3 text-left text-sm text-[var(--carvao)]/85">
          <p className="font-semibold">Importante</p>
          <p className="mt-1">
            Se o e-mail não chegar na caixa de entrada em alguns minutos, verifique as pastas <strong>Spam</strong> e{" "}
            <strong>Promoções</strong>.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-7 inline-block rounded-xl bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
        >
          Ir para o login
        </Link>
        <p className="mt-3 text-xs text-[var(--carvao)]/75">Dúvidas? Nosso suporte responde rápido.</p>
      </div>
    </main>
  );
}
