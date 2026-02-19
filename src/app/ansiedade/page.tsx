"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const checkoutUrl = process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "https://pay.cakto.com.br/SEU_CODIGO";

const receivesSlides = [
  {
    title: "Guia principal em PDF",
    text: "Material objetivo, com leitura organizada para sair do caos mental sem enrolação.",
    icon: "📘",
  },
  {
    title: "Plano tático de 7 dias",
    text: "Sequência clara de ações para reduzir ansiedade e recuperar foco com constância.",
    icon: "🗓️",
  },
  {
    title: "Exercícios rápidos guiados",
    text: "Práticas curtas para usar em momentos de pico, inclusive no trabalho e no celular.",
    icon: "🎧",
  },
  {
    title: "Checklist e templates",
    text: "Ferramentas visuais para você executar sem depender de motivação.",
    icon: "✅",
  },
];

const testimonials = [
  {
    name: "Aline M.",
    text: "Eu estava sobrecarregada. O plano de 7 dias me devolveu organização mental.",
  },
  {
    name: "Rafael C.",
    text: "Direto ao ponto. Foi o primeiro material que eu realmente consegui aplicar.",
  },
  {
    name: "Bianca T.",
    text: "As técnicas curtas salvaram meus momentos de crise no dia a dia.",
  },
];

const modules = [
  "Módulo 1: Entendendo o ciclo da ansiedade",
  "Módulo 2: Técnicas rápidas para picos emocionais",
  "Módulo 3: Como reduzir ruminação e excesso de pensamento",
  "Módulo 4: Rotina de foco, sono e energia mental",
  "Módulo 5: Plano de 7 dias (aplicação guiada)",
  "Módulo 6: Manutenção para não voltar ao zero",
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
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white backdrop-blur">
      <p className="font-semibold text-white/85">Condição especial reservada por:</p>
      <p className="mt-1 text-3xl leading-none font-black tracking-[0.18em]">
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
      <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/65 p-2 backdrop-blur">
        <motion.div
          className="flex"
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          {receivesSlides.map((slide) => (
            <article key={slide.title} className="w-full shrink-0 p-2">
              <div className="rounded-2xl border border-white/65 bg-[var(--creme)]/90 p-6">
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
            className={`h-2.5 w-8 rounded-full transition ${dot === index ? "bg-[var(--ink)]" : "bg-[var(--dourado)]/60"}`}
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
      <h2 className="text-3xl font-bold md:text-4xl">Quem aplicou, sentiu diferença</h2>
      <div className="relative mt-6 h-44 overflow-hidden rounded-2xl border border-white/60 bg-white/70 md:h-36">
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
            className="absolute inset-0 p-6"
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
  const [variant, setVariant] = useState("a");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("v") ?? "a";
    const raf = window.requestAnimationFrame(() => {
      setVariant(value.toLowerCase());
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);
  const isVariantB = variant === "b";

  const heroTitle = isVariantB ? "Ansiedade no controle, sem viver no piloto automático" : "Como Derrotar a Ansiedade";
  const heroSubtitle = isVariantB
    ? "Estratégia prática para acalmar a mente e recuperar sua energia mental no dia a dia"
    : "sem depender de força de vontade o tempo inteiro";

  const menu = useMemo(
    () => [
      { label: "Você recebe", href: "#recebe" },
      { label: "Módulos", href: "#conteudo" },
      { label: "Bônus", href: "#bonus" },
      { label: "Oferta", href: "#oferta" },
      { label: "FAQ", href: "#faq" },
    ],
    [],
  );

  return (
    <main className="relative overflow-hidden pb-24 text-[var(--carvao)] md:pb-0">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_12%,rgba(235,209,164,0.46),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(125,106,90,0.2),transparent_31%),linear-gradient(140deg,#f7f4ef_0%,#efe7dc_46%,#f8f6f2_100%)]" />
      <div className="pointer-events-none absolute top-20 left-8 -z-10 h-40 w-40 rounded-full bg-[var(--dourado)]/35 blur-3xl" />
      <div className="pointer-events-none absolute top-52 right-10 -z-10 h-52 w-52 rounded-full bg-[var(--cobre)]/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/50 bg-[var(--creme)]/76 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold tracking-tight md:text-base">Marketing Digital Top</p>
          <nav className="hidden gap-5 text-sm md:flex">
            {menu.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[var(--ink)]">
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-[var(--ink)]/20 px-4 py-2 text-xs font-bold transition hover:bg-[var(--ink)] hover:text-white md:text-sm"
          >
            Acessar membros
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-14 pb-18 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex rounded-full border border-[var(--dourado)] bg-white/80 px-3 py-1 text-xs font-black tracking-[0.08em] text-[var(--ink)] uppercase">
            Oferta de lançamento · R$19,90
          </span>
          <h1 className="mt-5 text-4xl leading-[1.04] font-black md:text-6xl">
            {heroTitle}
            <span className="mt-3 block text-xl leading-snug font-semibold text-[var(--carvao)]/80 md:text-2xl">
              {heroSubtitle}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-[var(--carvao)]/86 md:text-lg">
            Um método direto para acalmar a mente, voltar a agir e construir uma rotina emocionalmente mais estável em poucos minutos por dia.
          </p>
          <ul className="mt-6 space-y-2 text-sm md:text-base">
            <li>✅ Técnicas rápidas para interrupção de picos</li>
            <li>✅ Plano guiado de 7 dias, sem complicação</li>
            <li>✅ Estrutura prática para foco, sono e consistência</li>
            <li>✅ Material de apoio para executar no celular</li>
          </ul>
          <a
            href="#oferta"
            className="mt-8 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-[var(--ink)] px-6 py-4 text-center text-lg font-black text-white transition hover:scale-[1.02]"
          >
            Quero liberar meu acesso agora
          </a>
          <p className="mt-2 text-sm text-[var(--carvao)]/75">Liberação imediata após pagamento.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-[linear-gradient(135deg,#101726_0%,#1e2d4a_52%,#0f1728_100%)] p-7 text-white shadow-2xl">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#f0b86d]/35 blur-2xl" />
            <div className="absolute top-6 right-6 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-black tracking-[0.08em]">
              GUIA PRÁTICO
            </div>
            <p className="text-xs tracking-[0.2em] text-white/75 uppercase">Método aplicado</p>
            <h2 className="mt-3 max-w-xs text-4xl leading-[1.03] font-black">Como Derrotar a Ansiedade</h2>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              Estratégias realistas para interromper ansiedade e retomar direção.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="rounded-xl border border-white/20 bg-white/8 p-3">
                <p className="font-semibold">Formato</p>
                <p className="text-white/80">PDF + bônus</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-3">
                <p className="font-semibold">Acesso</p>
                <p className="text-white/80">Imediato</p>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-white/20 bg-white/8 p-3 text-sm">
              ⚡ Aplicação rápida para rotina corrida.
            </div>
          </div>
        </motion.div>
      </section>

      <section id="recebe" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Tudo que você recebe no acesso</h2>
        <CarouselCards />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Pra quem esse guia foi feito</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {[
            "Você sente a mente acelerada com frequência",
            "Você trava até para tarefas simples",
            "Você pensa demais antes de dormir",
            "Você quer reduzir a sensação constante de alerta",
            "Você busca clareza prática, não teoria excessiva",
            "Você precisa de uma rotina simples para manter resultado",
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-white/65 bg-white/72 p-4"
            >
              ✅ {item}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Antes e depois da aplicação</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-red-200 bg-red-50/80 p-5"
          >
            <p className="text-xs font-black tracking-[0.08em] text-red-700 uppercase">Antes</p>
            <ul className="mt-3 space-y-2 text-sm text-red-900/90 md:text-base">
              <li>• Mente acelerada o dia inteiro</li>
              <li>• Dificuldade de iniciar tarefas simples</li>
              <li>• Ruminação e cansaço mental constante</li>
              <li>• Sensação de estar sempre atrasado</li>
            </ul>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5"
          >
            <p className="text-xs font-black tracking-[0.08em] text-emerald-700 uppercase">Depois</p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-900/90 md:text-base">
              <li>• Mais clareza para decidir e agir</li>
              <li>• Rotina simples para reduzir picos emocionais</li>
              <li>• Menos sobrecarga mental no fim do dia</li>
              <li>• Sensação real de progresso semanal</li>
            </ul>
          </motion.article>
        </div>
      </section>

      <section id="conteudo" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Módulos diretos ao ponto</h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {modules.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-xl border border-white/65 bg-white/72 p-4"
            >
              <p className="font-semibold">{item}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--carvao)]/75">Conteúdo educacional. Não substitui suporte clínico individual.</p>
      </section>

      <section id="bonus" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold md:text-4xl">Bônus que aceleram execução</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "🎁 Kit SOS para momentos de pico",
            "🎁 Checklist anti-mente-lotada",
            "🎁 Planner semanal simples",
          ].map((item) => (
            <motion.div key={item} whileHover={{ y: -6 }} className="rounded-2xl border border-white/60 bg-white/72 p-5">
              <p className="font-semibold">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Testimonials />

      <section id="oferta" className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-[#b68b4e]/65 bg-[linear-gradient(140deg,#080f1a_0%,#101c31_50%,#0a1221_100%)] p-7 text-white shadow-2xl md:p-10">
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#e0b273]/20 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2">
            <div>
              <p className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black tracking-[0.08em] uppercase">
                Oferta ativa
              </p>
              <h2 className="mt-4 text-3xl leading-tight font-black md:text-5xl">
                Libere acesso completo por R$19,90
              </h2>
              <p className="mt-3 text-white/80">
                Pagamento seguro e liberação automática para começar hoje.
              </p>
              <p className="mt-5 text-6xl leading-none font-black md:text-7xl">R$ 19,90</p>
              <p className="mt-2 text-sm text-white/85">PIX • Cartão • Boleto</p>

              <a
                href={checkoutUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 text-center text-lg font-black text-[var(--ink)] transition hover:scale-[1.02]"
              >
                QUERO MEU ACESSO AGORA
              </a>
              <p className="mt-2 text-sm text-white/80">Leva menos de 2 minutos.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold">Seu acesso inclui:</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/90 md:text-base">
                <li>✅ Guia principal em PDF</li>
                <li>✅ Plano prático de 7 dias</li>
                <li>✅ Exercícios rápidos guiados</li>
                <li>✅ Checklist e templates</li>
              </ul>
              <div className="mt-5 rounded-xl border border-white/20 bg-white/8 p-3 text-sm">
                🛡️ Garantia de 7 dias conforme a política da plataforma.
              </div>
              <div className="mt-4">
                <SessionTimer />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <ObjectionsSection />
        <h2 className="text-3xl font-bold md:text-4xl">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {[
            [
              "Como recebo meu acesso?",
              "Após confirmação do pagamento, você recebe e-mail com link para definir senha e entrar na área de membros.",
            ],
            ["Funciona no celular?", "Sim. A área de membros foi feita para desktop e mobile."],
            ["Quanto tempo para liberar?", "PIX e cartão geralmente liberam rápido; boleto depende da compensação."],
            ["Tem garantia?", "Sim, 7 dias conforme a política de reembolso da plataforma de pagamento."],
            ["Substitui terapia?", "Não. É conteúdo educacional de apoio prático para o dia a dia."],
          ].map(([question, answer]) => (
            <details key={question} className="rounded-xl border border-white/65 bg-white/72 p-4">
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-2 text-sm text-[var(--carvao)]/82">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/45 px-4 py-9 text-center text-sm text-[var(--carvao)]/75">
        Marketing Digital Top • Conteúdo educacional e aplicação prática.
      </footer>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/50 bg-[var(--creme)]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <a
            href={checkoutUrl}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--ink)] px-4 py-3 text-center text-sm font-black text-white"
          >
            Liberar acesso por R$19,90
          </a>
          <span className="rounded-lg border border-[var(--ink)]/20 bg-white px-2 py-1 text-[11px] font-semibold text-[var(--carvao)]/80">
            7 dias garantia
          </span>
        </div>
      </div>
    </main>
  );
}

function ObjectionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const objections = [
    {
      q: "E se eu não tiver tempo?",
      a: "O método foi desenhado para rotina corrida: sessões curtas e práticas de poucos minutos.",
    },
    {
      q: "Isso realmente funciona para quem pensa demais?",
      a: "Sim. O foco é justamente interromper ruminação e criar ação prática no dia a dia.",
    },
    {
      q: "Já tentei outras coisas e não consegui manter.",
      a: "Aqui você recebe estrutura simples + checklist + plano guiado, para facilitar consistência.",
    },
    {
      q: "E se eu não gostar do conteúdo?",
      a: "Você tem 7 dias de garantia para solicitar reembolso conforme política da plataforma.",
    },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold md:text-4xl">Quebrando objeções comuns</h2>
      <div className="mt-6 space-y-3">
        {objections.map((item, index) => {
          const opened = openIndex === index;
          return (
            <div key={item.q} className="overflow-hidden rounded-xl border border-white/65 bg-white/72">
              <button
                type="button"
                onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              >
                <span className="font-semibold">{item.q}</span>
                <span className={`text-lg transition ${opened ? "rotate-45" : ""}`}>+</span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: opened ? "auto" : 0, opacity: opened ? 1 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm text-[var(--carvao)]/80">{item.a}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
