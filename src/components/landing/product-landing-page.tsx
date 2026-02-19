"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type ProductLandingPageProps = {
  title: string;
  badge: string;
  headline: string;
  subheadline: string;
  description: string;
  priceLabel: string;
  ctaLabel: string;
  ctaUrl: string;
  heroImageUrl: string;
  heroVideoUrl?: string;
  bullets: string[];
  carouselImages: string[];
  testimonials: Array<{ name: string; text: string }>;
  faq: Array<{ question: string; answer: string }>;
  contentSections: Array<{ title: string; text: string; type?: "section" | "benefit" | "faq"; imageUrl?: string | null }>;
  blocks?: Array<{
    id: string;
    type: "hero" | "text" | "image" | "video" | "button" | "carousel" | "benefits" | "faq" | "input";
    title: string;
    text: string;
    imageUrl: string;
    videoUrl: string;
    buttonLabel: string;
    buttonUrl: string;
    placeholder: string;
    items: string[];
    backgroundColor: string;
    textColor: string;
    animation: "none" | "fade" | "slide-up" | "zoom";
  }>;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeMode: "light" | "dark";
  animationsEnabled: boolean;
};

function Card({
  children,
  animationsEnabled,
  delay = 0,
}: {
  children: React.ReactNode;
  animationsEnabled: boolean;
  delay?: number;
}) {
  if (!animationsEnabled) {
    return <div className="rounded-2xl border border-white/45 bg-white/75 p-4 shadow-sm">{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl border border-white/45 bg-white/75 p-4 shadow-sm"
    >
      {children}
    </motion.div>
  );
}

export function ProductLandingPage(props: ProductLandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const surfaceText = props.themeMode === "dark" ? "#e5e7eb" : "#1f2937";
  const rootBackground = props.themeMode === "dark" ? "#0b1220" : props.secondaryColor;
  const sectionTitleClass = "text-3xl font-black md:text-4xl";
  const carouselImages = useMemo(
    () => props.carouselImages.filter((image) => image.trim().length > 0),
    [props.carouselImages],
  );

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [carouselImages.length]);

  const canvasBlocks = useMemo(
    () => (props.blocks ?? []).filter((block) => block && block.type),
    [props.blocks],
  );

  const hasCanvasBlocks = canvasBlocks.length > 0;

  function animationFor(blockAnimation: "none" | "fade" | "slide-up" | "zoom", index: number) {
    if (!props.animationsEnabled || blockAnimation === "none") return {};
    if (blockAnimation === "zoom") {
      return {
        initial: { opacity: 0, scale: 0.96 },
        whileInView: { opacity: 1, scale: 1 },
        transition: { duration: 0.35, delay: index * 0.04 },
      };
    }
    if (blockAnimation === "slide-up") {
      return {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.35, delay: index * 0.04 },
      };
    }
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      transition: { duration: 0.35, delay: index * 0.04 },
    };
  }

  return (
    <main
      style={
        {
          "--lp-primary": props.primaryColor,
          "--lp-secondary": props.secondaryColor,
          "--lp-accent": props.accentColor,
          background:
            props.themeMode === "dark"
              ? `radial-gradient(circle at 20% 20%, #1f2a44 0%, transparent 28%), radial-gradient(circle at 80% 10%, #1c2740 0%, transparent 24%), linear-gradient(130deg, #0b1220, #0f172a, #0b1220)`
              : `radial-gradient(circle at 15% 15%, color-mix(in oklab, ${props.accentColor} 40%, transparent), transparent 35%), linear-gradient(130deg, ${props.secondaryColor}, #fff, ${props.secondaryColor})`,
          color: surfaceText,
          minHeight: "100vh",
        } as React.CSSProperties
      }
    >
      {hasCanvasBlocks ? (
        <section className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:py-14">
          {canvasBlocks.map((block, index) => (
            <motion.article
              key={block.id}
              viewport={{ once: true, amount: 0.2 }}
              {...animationFor(block.animation, index)}
              className="rounded-2xl border border-white/30 p-4 shadow-xl md:p-6"
              style={{
                background: block.backgroundColor || "rgba(255,255,255,0.78)",
                color: block.textColor || surfaceText,
              }}
            >
              {block.type === "hero" ? (
                <div className="grid gap-6 md:grid-cols-2 md:items-center">
                  <div>
                    <h1 className="text-3xl leading-tight font-black md:text-5xl">{block.title || props.title}</h1>
                    {block.text ? <p className="mt-3 text-sm md:text-base">{block.text}</p> : null}
                    {block.buttonLabel && block.buttonUrl ? (
                      <a
                        href={block.buttonUrl}
                        className="mt-4 inline-flex rounded-xl px-5 py-3 text-sm font-black text-white"
                        style={{ backgroundColor: props.primaryColor }}
                      >
                        {block.buttonLabel}
                      </a>
                    ) : null}
                  </div>
                  <div>
                    {block.videoUrl ? (
                      <iframe src={block.videoUrl} className="h-64 w-full rounded-xl border border-white/25 md:h-80" title={block.title || props.title} allowFullScreen />
                    ) : block.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={block.imageUrl} alt={block.title || props.title} className="h-auto w-full rounded-xl object-cover" />
                    ) : null}
                  </div>
                </div>
              ) : null}

              {block.type === "text" ? (
                <>
                  {block.title ? <h2 className="text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.text ? <p className="mt-2 text-sm md:text-base">{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "image" ? (
                <>
                  {block.title ? <h2 className="mb-3 text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.imageUrl} alt={block.title || props.title} className="h-auto w-full rounded-xl object-cover" />
                  ) : null}
                  {block.text ? <p className="mt-2 text-sm md:text-base">{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "video" ? (
                <>
                  {block.title ? <h2 className="mb-3 text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.videoUrl ? (
                    <iframe src={block.videoUrl} className="h-64 w-full rounded-xl border border-white/25 md:h-80" title={block.title || props.title} allowFullScreen />
                  ) : null}
                  {block.text ? <p className="mt-2 text-sm md:text-base">{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "button" ? (
                <div className="text-center">
                  {block.title ? <h2 className="text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.text ? <p className="mt-2 text-sm md:text-base">{block.text}</p> : null}
                  <a
                    href={block.buttonUrl || props.ctaUrl}
                    className="mt-4 inline-flex rounded-xl px-6 py-3 text-sm font-black text-white"
                    style={{ backgroundColor: props.primaryColor }}
                  >
                    {block.buttonLabel || props.ctaLabel}
                  </a>
                </div>
              ) : null}

              {block.type === "benefits" ? (
                <>
                  {block.title ? <h2 className="text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  <ul className="mt-3 space-y-2">
                    {block.items.map((item, idx) => (
                      <li key={`${block.id}-${idx}`}>✅ {item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {block.type === "faq" ? (
                <>
                  <h2 className="text-2xl font-black md:text-3xl">{block.title || "Pergunta frequente"}</h2>
                  <p className="mt-2 text-sm md:text-base">{block.text}</p>
                </>
              ) : null}

              {block.type === "input" ? (
                <div className="space-y-3">
                  {block.title ? <h2 className="text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.text ? <p className="text-sm md:text-base">{block.text}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder={block.placeholder || "Digite aqui"}
                      className="min-w-[240px] flex-1 rounded-xl border border-white/35 bg-white/90 px-4 py-3 text-sm text-[#0f172a]"
                      readOnly
                    />
                    <button type="button" className="rounded-xl bg-[var(--lp-primary)] px-4 py-3 text-sm font-bold text-white">
                      Enviar
                    </button>
                  </div>
                </div>
              ) : null}

              {block.type === "carousel" ? (
                <div>
                  {block.title ? <h2 className="mb-3 text-2xl font-black md:text-3xl">{block.title}</h2> : null}
                  {block.items.length > 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-black/20 p-2">
                      <motion.div
                        animate={{ x: `-${activeSlide * 100}%` }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="flex"
                      >
                        {block.items.map((src, idx) => (
                          <div key={`${block.id}-item-${idx}`} className="w-full shrink-0 px-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`Slide ${idx + 1}`} className="h-[250px] w-full rounded-xl object-cover md:h-[420px]" />
                          </div>
                        ))}
                      </motion.div>
                      {block.items.length > 1 ? (
                        <div className="mt-3 flex justify-center gap-2">
                          {block.items.map((_, idx) => (
                            <button
                              key={`${block.id}-dot-${idx}`}
                              type="button"
                              onClick={() => setActiveSlide(idx)}
                              aria-label={`Ir para slide ${idx + 1}`}
                              className={`h-2.5 w-2.5 rounded-full ${idx === activeSlide ? "bg-white" : "bg-white/45"}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm opacity-80">Adicione imagens para o carrossel.</p>
                  )}
                </div>
              ) : null}
            </motion.article>
          ))}
        </section>
      ) : (
      <>
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-18">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <span
              className="inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide"
              style={{ borderColor: props.accentColor, backgroundColor: `${props.accentColor}33` }}
            >
              {props.badge}
            </span>
            <h1 className="mt-4 text-4xl leading-[1.04] font-black md:text-6xl">{props.headline || props.title}</h1>
            <p className="mt-4 text-xl font-semibold opacity-90">{props.subheadline}</p>
            <p className="mt-4 text-sm opacity-90 md:text-base">{props.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={props.ctaUrl}
                className="rounded-xl px-6 py-3 text-sm font-black text-white transition hover:scale-[1.02] md:text-base shadow-lg"
                style={{ backgroundColor: props.primaryColor }}
              >
                {props.ctaLabel}
              </a>
              <span
                className="inline-flex items-center rounded-xl border px-4 py-3 text-sm font-bold"
                style={{ borderColor: props.accentColor, backgroundColor: `${props.accentColor}20` }}
              >
                {props.priceLabel}
              </span>
            </div>
            <ul className="mt-6 space-y-2 text-sm md:text-base">
              {props.bullets.map((item) => (
                <li key={item}>✅ {item}</li>
              ))}
            </ul>
          </div>

          <Card animationsEnabled={props.animationsEnabled}>
            {props.heroVideoUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-white/25 shadow-lg">
                <iframe
                  src={props.heroVideoUrl}
                  className="h-64 w-full md:h-80"
                  title={`${props.title} video`}
                  allowFullScreen
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={props.heroImageUrl} alt={props.title} className="h-auto w-full rounded-xl border border-white/25 object-cover shadow-lg" />
            )}
          </Card>
        </div>
      </section>

      {carouselImages.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className={sectionTitleClass}>Carrossel visual</h2>
            {carouselImages.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                  className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % carouselImages.length)}
                  className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"
                >
                  Próximo
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/30 bg-black/25 p-2 shadow-2xl">
            <motion.div
              animate={{ x: `-${activeSlide * 100}%` }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="flex"
            >
              {carouselImages.map((src, idx) => (
                <div key={`${src}-${idx}`} className="w-full shrink-0 px-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Slide ${idx + 1}`} className="h-[300px] w-full rounded-xl object-cover md:h-[420px]" />
                </div>
              ))}
            </motion.div>
            {carouselImages.length > 1 ? (
              <div className="mt-3 flex justify-center gap-2">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Ir para slide ${idx + 1}`}
                    className={`h-2.5 w-2.5 rounded-full ${idx === activeSlide ? "bg-white" : "bg-white/45"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {props.contentSections.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className={sectionTitleClass}>Conteúdo</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {props.contentSections.map((section, idx) => (
              <Card key={`${section.title}-${idx}`} animationsEnabled={props.animationsEnabled} delay={idx * 0.04}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  {section.type ? (
                    <span className="rounded-full border border-white/35 bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {section.type}
                    </span>
                  ) : null}
                </div>
                {section.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={section.imageUrl} alt={section.title} className="mb-3 h-44 w-full rounded-lg object-cover" />
                ) : null}
                <p className="mt-2 text-sm opacity-90">{section.text}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {props.testimonials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className={sectionTitleClass}>Depoimentos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {props.testimonials.map((item, idx) => (
              <Card key={`${item.name}-${idx}`} animationsEnabled={props.animationsEnabled} delay={idx * 0.05}>
                <p className="text-sm">“{item.text}”</p>
                <p className="mt-2 text-xs font-bold opacity-80">{item.name}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {props.faq.length > 0 ? (
        <section className="mx-auto max-w-4xl px-4 py-10">
          <h2 className={sectionTitleClass}>Perguntas frequentes</h2>
          <div className="mt-4 space-y-3">
            {props.faq.map((entry, idx) => (
              <Card key={`${entry.question}-${idx}`} animationsEnabled={props.animationsEnabled} delay={idx * 0.03}>
                <p className="font-bold">{entry.question}</p>
                <p className="mt-1 text-sm opacity-90">{entry.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div
          className="rounded-2xl p-6 text-center shadow-lg"
          style={{ backgroundColor: `${props.accentColor}25`, border: `1px solid ${props.accentColor}` }}
        >
          <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{props.priceLabel}</p>
          <h3 className="mt-2 text-2xl font-black">{props.title}</h3>
          <a
            href={props.ctaUrl}
            className="mt-4 inline-flex rounded-xl px-6 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
            style={{ backgroundColor: props.primaryColor }}
          >
            {props.ctaLabel}
          </a>
        </div>
      </section>
      <div style={{ backgroundColor: rootBackground }} />
      </>
      )}
    </main>
  );
}
