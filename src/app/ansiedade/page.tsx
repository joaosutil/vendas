"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const checkoutUrl = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "https://pay.cakto.com.br/SEU_CODIGO";

const receivesSlides = [
  {
    title: "Guia principal (PDF)",
    text: "Leitura rápida e prática, com exemplos e rotina simples de aplicação.",
    icon: "📘",
  },
  {
    title: "Plano de 7 dias",
    text: "Passo a passo para sair da paralisia e entrar em execução com clareza.",
    icon: "🗓️",
  },
  {
    title: "Exercícios guiados",
    text: "Sessões curtas, replicáveis e pensadas para o mundo real.",
    icon: "🎧",
  },
  {
    title: "Checklists e templates",
    text: "Material pronto para salvar no celular e usar no dia a dia.",
    icon: "✅",
  },
];

const testimonials = [
  {
    name: "Aline M.",
    text: "Eu vivia no modo alerta. O plano de 7 dias me deu uma direção concreta.",
  },
  {
    name: "Rafael C.",
    text: "Consegui organizar minha cabeça sem linguagem complicada. Material muito direto.",
  },
  {
    name: "Bianca T.",
    text: "As técnicas rápidas me ajudaram nos momentos de pico. Uso quase todo dia.",
  },
];

const modules = [
  "Módulo 1: Entendendo o ciclo da ansiedade (sem enrolação)",
  "Módulo 2: Técnicas rápidas para momentos de pico",
  "Módulo 3: Como quebrar o excesso de pensamento (ruminação)",
  "Módulo 4: Rotina mental: foco, sono e organização",
  "Módulo 5: Plano de 7 dias (aplicação guiada)",
  "Módulo 6: Manutenção: como não voltar pro zero",
];

function SessionTimer() {
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    const key = "launch_timer_started_at";
    const now = Date.now();
    const saved = window.sessionStorage.getItem(key);
    const startedAt = saved ? Number(saved) : now;
    if (!saved) window.sessionStorage.setItem(key, String(now));

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 600 - (elapsed % 600));
      setSecondsLeft(remaining);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="glass-card rounded-xl p-3 text-sm text-[var(--ink)]">
      <p className="font-semibold">Sua condição de lançamento está reservada por:</p>
      <p className="mt-1 text-2xl font-black tracking-wider">
        {minutes}:{seconds}
      </p>
    </div>
  );
}

function CarouselCards() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % receivesSlides.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-8">
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          {receivesSlides.map((slide) => (
            <article key={slide.title} className="w-full shrink-0 px-1">
              <div className="glass-card shine-overlay rounded-2xl p-6">
                <p className="text-2xl">{slide.icon}</p>
                <h3 className="mt-3 text-xl font-bold">{slide.title}</h3>
                <p className="mt-2 text-sm text-[var(--carvao)]/85">{slide.text}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {receivesSlides.map((_, dot) => (
          <button
            key={dot}
            type="button"
            onClick={() => setIndex(dot)}
            className={`h-2.5 w-2.5 rounded-full transition ${dot === index ? "bg-[var(--ink)]" : "bg-[var(--dourado)]/60"}`}
            aria-label={`slide-${dot + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-18">
      <h2 className="text-3xl font-bold md:text-4xl">Depoimentos</h2>
      <div className="relative mt-6 h-44 overflow-hidden rounded-2xl md:h-36">
        {testimonials.map((item, i) => (
          <motion.article
            key={item.name}
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              y: i === index ? 0 : 8,
              scale: i === index ? 1 : 0.99,
            }}
            transition={{ duration: 0.4 }}
            className="glass-card absolute inset-0 rounded-2xl p-6"
          >
            <p className="text-base md:text-lg">“{item.text}”</p>
            <p className="mt-3 text-sm font-semibold text-[var(--carvao)]/80">{item.name}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function AnsiedadeLandingPage() {
  const menu = useMemo(
    () => [
      { label: "O que você recebe", href: "#recebe" },
      { label: "Conteúdo", href: "#conteudo" },
      { label: "Bônus", href: "#bonus" },
      { label: "Oferta", href: "#oferta" },
      { label: "FAQ", href: "#faq" },
    ],
    [],
  );

  return (
    <main className="relative overflow-hidden text-[var(--carvao)]">
      <div className="pointer-events-none absolute inset-0 -z-10 animated-mesh" />
      <div className="pointer-events-none absolute top-24 left-8 -z-10 h-28 w-28 rounded-full bg-[var(--dourado)]/35 blur-2xl soft-float" />
      <div className="pointer-events-none absolute top-60 right-10 -z-10 h-36 w-36 rounded-full bg-[var(--cobre)]/20 blur-3xl soft-float-delayed" />

      <header className="sticky top-0 z-30 border-b border-white/40 bg-[var(--creme)]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold md:text-base">Marketing Digital Top</p>
          <nav className="hidden gap-5 text-sm md:flex">
            {menu.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[var(--ink)]">
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-xs font-bold hover:bg-[var(--ink)] hover:text-white md:text-sm"
          >
            Acessar membros
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-12 pb-18 md:grid-cols-2 md:pt-18">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex rounded-full border border-[var(--dourado)] bg-white/70 px-3 py-1 text-xs font-bold tracking-wide">
            ⭐ Preço especial de lançamento: R$19,90
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-black md:text-6xl">
            Como Derrotar a Ansiedade
            <span className="mt-2 block text-xl font-semibold text-[var(--carvao)]/80 md:text-2xl">
              na prática, no dia a dia
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-[var(--carvao)]/85 md:text-lg">
            Estratégias simples para reduzir a sensação de ansiedade, recuperar foco e construir uma rotina mental mais
            leve, sem papo complicado.
          </p>
          <ul className="mt-5 space-y-2 text-sm md:text-base">
            <li>✅ Técnicas rápidas para momentos de pico</li>
            <li>✅ Plano prático de 7 dias (passo a passo)</li>
            <li>✅ Exercícios guiados (curtos)</li>
            <li>✅ Checklists e materiais pra imprimir/salvar</li>
          </ul>
          <a
            href="#oferta"
            className="mt-7 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-[var(--ink)] px-6 py-4 text-center text-lg font-black text-white spot-glow transition hover:scale-[1.02]"
          >
            Quero ver a oferta de R$19,90
          </a>
          <p className="mt-2 text-sm text-[var(--carvao)]/75">Veja tudo que entra hoje e libere em menos de 2 minutos.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative"
        >
          <div className="glass-card relative rounded-3xl p-7 shadow-2xl">
            <div className="absolute top-6 right-6 rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white">
              LANÇAMENTO
            </div>
            <motion.div
              whileHover={{ rotateY: -8, rotateX: 6, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className="mx-auto max-w-xs rounded-2xl border border-[var(--dourado)] bg-gradient-to-b from-[#f6deba] to-[#d6b07f] p-6 shadow-2xl"
            >
              <p className="text-xs font-bold tracking-[0.2em] text-[var(--ink)]/70">GUIA PRATICO</p>
              <h2 className="mt-3 text-3xl leading-tight font-black text-[var(--ink)]">Como Derrotar a Ansiedade</h2>
              <p className="mt-3 text-sm text-[var(--ink)]/85">Aplicação real para mente acelerada.</p>
            </motion.div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="rounded-xl border border-[var(--dourado)]/40 bg-white/60 p-3">
                <p className="font-semibold">Formato</p>
                <p>PDF + bônus práticos</p>
              </div>
              <div className="rounded-xl border border-[var(--dourado)]/40 bg-white/60 p-3">
                <p className="font-semibold">Liberação</p>
                <p>Imediata</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="recebe" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">O pacote completo pra você aplicar hoje</h2>
        <CarouselCards />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Pra quem é esse guia</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "Você sente a mente acelerada mesmo quando tá tudo bem",
            "Você trava pra começar coisas simples",
            "Você pensa demais antes de dormir",
            "Você vive no modo alerta",
            "Você quer algo que funcione no mundo real, sem teoria demais",
            "Você precisa de um plano simples e repetível",
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-4"
            >
              ✅ {item}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="conteudo" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Conteúdo por módulos (rápido de consumir)</h2>
        <div className="mt-8 border-l-2 border-[var(--dourado)] pl-4 md:pl-6">
          {modules.map((item, index) => (
            <motion.p
              key={item}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.07 }}
              className="mb-4 rounded-xl border border-white/60 bg-white/65 p-3"
            >
              {item}
            </motion.p>
          ))}
        </div>
        <p className="text-sm text-[var(--carvao)]/75">Conteúdo educacional. Não substitui acompanhamento profissional.</p>
      </section>

      <section id="bonus" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Bônus pra acelerar seus resultados (incluídos hoje)</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "🎁 Kit SOS (1 página) pra momentos de pico",
            "🎁 Checklist de hábitos que diminuem a carga mental",
            "🎁 Planner semanal simples (imprimível)",
          ].map((item) => (
            <motion.div key={item} whileHover={{ y: -6 }} className="glass-card shine-overlay rounded-2xl p-5">
              <p className="font-semibold">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Testimonials />

      <section id="oferta" className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--dourado)]/70 bg-[var(--ink)] p-6 text-white shadow-2xl md:p-10">
          <div className="shine-overlay absolute inset-0 opacity-25" />
          <p className="relative -mx-2 mb-7 rotate-[-1deg] rounded-md bg-[var(--dourado)] px-4 py-2 text-center text-xs font-black tracking-[0.08em] text-[var(--ink)] md:text-sm">
            OFERTA DE LANÇAMENTO ATIVA HOJE
          </p>

          <div className="relative grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl leading-tight font-black md:text-5xl">Liberar acesso agora por um preço simbólico</h2>
              <p className="mt-3 text-white/80">
                Tudo para você aplicar no dia a dia e construir uma rotina mental mais leve.
              </p>
              <p className="mt-4 inline-block rounded-lg bg-[#ad7f3f] px-3 py-2 text-xs font-bold text-white md:text-sm">
                🔥 LANÇAMENTO: R$19,90 por tempo limitado
              </p>
              <p className="mt-4 text-6xl font-black md:text-7xl">R$ 19,90</p>
              <p className="mt-2 text-sm text-white/85">Pagamento seguro via Cakto (PIX / Cartão / Boleto)</p>
              <span className="mt-3 inline-block rounded-full border border-[var(--dourado)] px-3 py-1 text-xs font-bold">
                ✅ Menos que um lanche
              </span>

              <a
                href={checkoutUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 text-center text-lg font-black text-[var(--ink)] transition hover:scale-[1.02]"
              >
                QUERO MEU ACESSO POR R$19,90
              </a>
              <p className="mt-2 text-sm text-white/80">Leva menos de 2 minutos ✅</p>
            </div>

            <div>
              <h3 className="text-xl font-bold">O que entra no seu acesso:</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/90 md:text-base">
                <li>✅ Guia completo (PDF)</li>
                <li>✅ Plano prático de 7 dias</li>
                <li>✅ Exercícios guiados (curtos e repetíveis)</li>
                <li>✅ Checklists + templates</li>
              </ul>
              <p className="mt-5 text-sm font-bold text-[var(--dourado)]">Bônus inclusos hoje sem custo:</p>
              <ul className="mt-2 space-y-1 text-sm text-white/85">
                <li>🎁 Kit SOS para momentos de pico</li>
                <li>🎁 Checklist anti-mente-lotada</li>
                <li>🎁 Planner semanal simples</li>
              </ul>
              <div className="mt-5 rounded-xl border border-white/25 bg-white/8 p-3 text-sm">
                🛡️ Garantia de 7 dias. Se não for pra você, solicite reembolso dentro do prazo da plataforma.
              </div>
              <div className="mt-4">
                <SessionTimer />
              </div>
            </div>
          </div>

          <div className="relative mt-7 grid gap-2 text-xs text-white/85 md:grid-cols-4">
            <p>🔒 Checkout seguro</p>
            <p>⚡ Liberação automática</p>
            <p>📱 Acesso no celular</p>
            <p>✅ Garantia 7 dias</p>
          </div>

          <p className="relative mt-6 text-sm text-white/90 md:text-base">
            Você não precisa vencer a mente no grito. Precisa de um plano simples e repetível.
          </p>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {[
            [
              "Como vou receber o acesso?",
              "Assim que o pagamento for confirmado, você recebe um e-mail com o link e acesso à área de membros.",
            ],
            ["Dá pra acessar no celular?", "Sim. A área de membros é 100% responsiva."],
            ["Em quanto tempo libera?", "PIX e cartão geralmente liberam rápido; boleto depende da compensação."],
            ["E se eu não gostar?", "Você tem 7 dias para solicitar reembolso conforme a política da plataforma."],
            ["Isso substitui terapia/psicólogo?", "Não. É material educacional e prático para estratégias do dia a dia."],
          ].map(([question, answer]) => (
            <details key={question} className="glass-card rounded-xl p-4">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-2 text-sm text-[var(--carvao)]/82">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/45 px-4 py-9 text-center text-sm text-[var(--carvao)]/75">
        Marketing Digital Top. Conteúdo educacional e de apoio prático.
      </footer>
    </main>
  );
}
