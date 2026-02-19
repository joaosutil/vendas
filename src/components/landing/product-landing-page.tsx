"use client";

import { motion } from "framer-motion";

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
  contentSections: Array<{ title: string; text: string }>;
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
  const surfaceText = props.themeMode === "dark" ? "#e5e7eb" : "#1f2937";
  const rootBackground = props.themeMode === "dark" ? "#0b1220" : props.secondaryColor;
  const sectionTitleClass = "text-3xl font-black md:text-4xl";

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

      {props.carouselImages.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className={sectionTitleClass}>Galeria</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.carouselImages.map((src, idx) => (
              <Card key={`${src}-${idx}`} animationsEnabled={props.animationsEnabled} delay={idx * 0.03}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Slide ${idx + 1}`} className="h-52 w-full rounded-lg object-cover" />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {props.contentSections.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className={sectionTitleClass}>Conteúdo</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {props.contentSections.map((section, idx) => (
              <Card key={`${section.title}-${idx}`} animationsEnabled={props.animationsEnabled} delay={idx * 0.04}>
                <h3 className="text-lg font-bold">{section.title}</h3>
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
    </main>
  );
}
