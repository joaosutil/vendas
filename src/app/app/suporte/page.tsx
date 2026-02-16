export default function SupportPage() {
  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-bold">Suporte</h1>
      <p className="mt-2 text-sm text-[var(--carvao)]/80">Se precisar de ajuda, fale com nosso time:</p>
      <div className="mt-5 rounded-2xl border border-white/60 bg-white/70 p-5 text-sm">
        <p>
          WhatsApp: <a href="https://wa.me/5500000000000" className="underline">+55 00 00000-0000</a>
        </p>
        <p className="mt-2">
          E-mail: <a href="mailto:suporte@seudominio.com" className="underline">suporte@seudominio.com</a>
        </p>
      </div>
    </section>
  );
}
