"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type LandingCanvasAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "flip"
  | "pop"
  | "blur-in"
  | "rotate-in"
  | "float-in";

type LandingCanvasTexture = "none" | "grid" | "dots" | "diagonal" | "noise";
type LandingCanvasWidth = "full" | "wide" | "normal" | "narrow";
type LandingCanvasShadow = "none" | "soft" | "medium" | "hard";
type LandingCanvasAlign = "left" | "center" | "right";
type LandingCanvasMediaFit = "cover" | "contain";

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
    animation: LandingCanvasAnimation;
    animationDuration: number;
    animationDelay: number;
    texture: LandingCanvasTexture;
    textureOpacity: number;
    widthMode: LandingCanvasWidth;
    paddingX: number;
    paddingY: number;
    radius: number;
    shadow: LandingCanvasShadow;
    textAlign: LandingCanvasAlign;
    titleSize: number;
    textSize: number;
    mediaFit: LandingCanvasMediaFit;
    mediaHeightDesktop: number;
    mediaHeightMobile: number;
    carouselAutoplay: boolean;
    carouselIntervalMs: number;
  }>;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeMode: "light" | "dark";
  animationsEnabled: boolean;
  editorMode?: boolean;
  selectedEditorBlockId?: string | null;
  onEditorBlockSelect?: (blockId: string) => void;
};

function Card({
  children,
  animationsEnabled,
  themeMode,
  delay = 0,
}: {
  children: React.ReactNode;
  animationsEnabled: boolean;
  themeMode: "light" | "dark";
  delay?: number;
}) {
  const cardClass =
    themeMode === "dark"
      ? "rounded-2xl border border-slate-500/45 bg-[linear-gradient(150deg,rgba(15,23,42,0.88),rgba(17,24,39,0.82),rgba(15,23,42,0.9))] p-4 shadow-[0_15px_35px_rgba(2,6,23,0.35)]"
      : "rounded-2xl border border-white/45 bg-white/75 p-4 shadow-sm";

  if (!animationsEnabled) {
    return <div className={cardClass}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay }}
      className={cardClass}
    >
      {children}
    </motion.div>
  );
}

function shadowForLevel(level: LandingCanvasShadow) {
  if (level === "none") return "none";
  if (level === "hard") return "0 24px 60px rgba(2, 6, 23, 0.35)";
  if (level === "medium") return "0 18px 40px rgba(2, 6, 23, 0.28)";
  return "0 12px 30px rgba(2, 6, 23, 0.2)";
}

function maxWidthForMode(mode: LandingCanvasWidth) {
  if (mode === "full") return "100%";
  if (mode === "wide") return "min(1240px, 100%)";
  if (mode === "narrow") return "min(760px, 100%)";
  return "min(980px, 100%)";
}

function textureLayer(texture: LandingCanvasTexture, opacity: number, themeMode: "light" | "dark") {
  const alpha = Math.max(0, Math.min(opacity, 100)) / 100;
  const color = themeMode === "dark" ? `rgba(226,232,240,${alpha * 0.5})` : `rgba(15,23,42,${alpha * 0.35})`;

  if (texture === "grid") {
    return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
  }
  if (texture === "dots") {
    return `radial-gradient(${color} 1px, transparent 1px)`;
  }
  if (texture === "diagonal") {
    return `repeating-linear-gradient(135deg, ${color}, ${color} 2px, transparent 2px, transparent 12px)`;
  }
  if (texture === "noise") {
    return `repeating-radial-gradient(circle at 0 0, ${color}, transparent 2px)`;
  }
  return "";
}

function textureSize(texture: LandingCanvasTexture) {
  if (texture === "grid") return "22px 22px";
  if (texture === "dots") return "16px 16px";
  if (texture === "diagonal") return "18px 18px";
  if (texture === "noise") return "180px 180px";
  return "auto";
}

function hasGradientBackground(value: string) {
  return /gradient\(/i.test(value);
}

export function ProductLandingPage(props: ProductLandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [canvasSlides, setCanvasSlides] = useState<Record<string, number>>({});
  const surfaceText = props.themeMode === "dark" ? "#e5e7eb" : "#1f2937";
  const rootBackground = props.themeMode === "dark" ? "#0b1220" : props.secondaryColor;
  const defaultCanvasBackground =
    props.themeMode === "dark"
      ? "linear-gradient(145deg, rgba(15, 23, 42, 0.86), rgba(17, 24, 39, 0.84), rgba(15, 23, 42, 0.9))"
      : "rgba(255,255,255,0.82)";
  const sectionTitleClass = "text-3xl font-black md:text-4xl";
  const carouselImages = useMemo(
    () => props.carouselImages.filter((image) => image.trim().length > 0),
    [props.carouselImages],
  );

  const defaultBlockVisual = useMemo(
    () => ({
      animationDuration: 0.45,
      animationDelay: 0,
      texture: "none" as LandingCanvasTexture,
      textureOpacity: 16,
      widthMode: "normal" as LandingCanvasWidth,
      paddingX: 24,
      paddingY: 24,
      radius: 24,
      shadow: "soft" as LandingCanvasShadow,
      textAlign: "left" as LandingCanvasAlign,
      titleSize: 44,
      textSize: 16,
      mediaFit: "cover" as LandingCanvasMediaFit,
      mediaHeightDesktop: 420,
      mediaHeightMobile: 240,
      carouselAutoplay: true,
      carouselIntervalMs: 4200,
    }),
    [],
  );

  useEffect(() => {
    if (props.editorMode) return;
    if (carouselImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [carouselImages.length, props.editorMode]);

  const canvasBlocks = useMemo(
    () =>
      (props.blocks ?? [])
        .filter((block) => block && block.type)
        .map((block) => ({
          ...defaultBlockVisual,
          ...block,
        })),
    [defaultBlockVisual, props.blocks],
  );

  useEffect(() => {
    if (props.editorMode) return;
    const carouselBlocks = canvasBlocks.filter(
      (block) => block.type === "carousel" && block.items.length > 1 && block.carouselAutoplay,
    );
    if (carouselBlocks.length === 0) return;

    const timers = carouselBlocks.map((block) =>
      window.setInterval(() => {
        setCanvasSlides((prev) => ({
          ...prev,
          [block.id]: ((prev[block.id] ?? 0) + 1) % block.items.length,
        }));
      }, Math.max(1500, block.carouselIntervalMs || 4200)),
    );

    return () => {
      timers.forEach((timer) => window.clearInterval(timer));
    };
  }, [canvasBlocks, props.editorMode]);

  const hasCanvasBlocks = canvasBlocks.length > 0;
  const normalizedActiveSlide = carouselImages.length > 0 ? activeSlide % carouselImages.length : 0;

  function stopNavigationInEditor(event: React.MouseEvent<HTMLElement>) {
    if (!props.editorMode) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function animationFor(
    blockAnimation: LandingCanvasAnimation,
    duration: number,
    delay: number,
    index: number,
  ) {
    if (props.editorMode || !props.animationsEnabled || blockAnimation === "none") return {};
    const transition = { duration: Math.max(0.2, duration || 0.45), delay: Math.max(0, delay || index * 0.05) };
    if (blockAnimation === "zoom") {
      return {
        initial: { opacity: 0, scale: 0.96 },
        whileInView: { opacity: 1, scale: 1 },
        transition,
      };
    }
    if (blockAnimation === "slide-up") {
      return {
        initial: { opacity: 0, y: 26 },
        whileInView: { opacity: 1, y: 0 },
        transition,
      };
    }
    if (blockAnimation === "slide-left") {
      return {
        initial: { opacity: 0, x: 34 },
        whileInView: { opacity: 1, x: 0 },
        transition,
      };
    }
    if (blockAnimation === "slide-right") {
      return {
        initial: { opacity: 0, x: -34 },
        whileInView: { opacity: 1, x: 0 },
        transition,
      };
    }
    if (blockAnimation === "flip") {
      return {
        initial: { opacity: 0, rotateX: -22, y: 18 },
        whileInView: { opacity: 1, rotateX: 0, y: 0 },
        transition,
      };
    }
    if (blockAnimation === "pop") {
      return {
        initial: { opacity: 0, scale: 0.88 },
        whileInView: { opacity: 1, scale: [1.02, 1] },
        transition: { duration: Math.max(0.2, duration || 0.55), delay: Math.max(0, delay || index * 0.05) },
      };
    }
    if (blockAnimation === "blur-in") {
      return {
        initial: { opacity: 0, filter: "blur(10px)" },
        whileInView: { opacity: 1, filter: "blur(0px)" },
        transition,
      };
    }
    if (blockAnimation === "rotate-in") {
      return {
        initial: { opacity: 0, rotate: -3, y: 18 },
        whileInView: { opacity: 1, rotate: 0, y: 0 },
        transition,
      };
    }
    if (blockAnimation === "float-in") {
      return {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: [0, -4, 0] },
        transition: { duration: Math.max(0.2, duration || 0.75), delay: Math.max(0, delay || index * 0.05) },
      };
    }
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      transition,
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
        <section className="mx-auto w-full max-w-[1400px] space-y-4 px-4 py-10 md:space-y-5 md:py-14">
          {canvasBlocks.map((block, index) => {
            const resolvedBackground = block.backgroundColor.trim() ? block.backgroundColor.trim() : defaultCanvasBackground;
            const backgroundHasGradient = hasGradientBackground(resolvedBackground);
            const textureImage =
              block.texture !== "none" ? textureLayer(block.texture, block.textureOpacity, props.themeMode) : "";
            const backgroundImage = textureImage
              ? backgroundHasGradient
                ? `${textureImage}, ${resolvedBackground}`
                : textureImage
              : backgroundHasGradient
              ? resolvedBackground
              : undefined;
            const backgroundSize = textureImage
              ? backgroundHasGradient
                ? `${textureSize(block.texture)}, 100% 100%`
                : textureSize(block.texture)
              : backgroundHasGradient
              ? "100% 100%"
              : undefined;
            const backgroundRepeat = textureImage ? (backgroundHasGradient ? "repeat, no-repeat" : "repeat") : undefined;
            const backgroundPosition = textureImage
              ? backgroundHasGradient
                ? "0 0, center center"
                : "0 0"
              : backgroundHasGradient
              ? "center center"
              : undefined;

            return (
            <motion.article
              key={block.id}
              viewport={props.editorMode ? undefined : { once: true, amount: 0.2 }}
              {...animationFor(block.animation, block.animationDuration, block.animationDelay, index)}
              className={`group rounded-3xl border p-4 shadow-xl backdrop-blur transition md:p-6 ${
                props.editorMode ? "" : "hover:translate-y-[-1px]"
              } ${
                props.editorMode ? "cursor-pointer" : ""
              } ${
                props.editorMode && props.selectedEditorBlockId === block.id
                  ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-transparent"
                  : ""
              }`}
              onClick={() => props.onEditorBlockSelect?.(block.id)}
              role={props.editorMode ? "button" : undefined}
              tabIndex={props.editorMode ? 0 : undefined}
              style={{
                borderColor: props.themeMode === "dark" ? "rgba(148, 163, 184, 0.32)" : "rgba(255,255,255,0.3)",
                backgroundColor: backgroundHasGradient ? undefined : resolvedBackground,
                backgroundImage,
                backgroundRepeat,
                backgroundPosition,
                backgroundSize,
                color: block.textColor || surfaceText,
                maxWidth: maxWidthForMode(block.widthMode),
                marginInline: "auto",
                padding: `${block.paddingY}px ${block.paddingX}px`,
                borderRadius: `${block.radius}px`,
                textAlign: block.textAlign,
                boxShadow: shadowForLevel(block.shadow),
              }}
            >
              {block.type === "hero" ? (
                <div className="grid gap-6 md:grid-cols-2 md:items-center">
                  <div>
                    <h1
                      className="leading-tight font-black"
                      style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.62)}px, 4vw, ${block.titleSize}px)` }}
                    >
                      {block.title || props.title}
                    </h1>
                    {block.text ? <p className="mt-3 opacity-95" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.7vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                    {block.buttonLabel && block.buttonUrl ? (
                      <a
                        href={block.buttonUrl}
                        onClick={stopNavigationInEditor}
                        className="mt-4 inline-flex rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01]"
                        style={{ backgroundColor: props.primaryColor }}
                      >
                        {block.buttonLabel}
                      </a>
                    ) : null}
                  </div>
                  <div>
                    {block.videoUrl ? (
                      <iframe
                        src={block.videoUrl}
                        className={`w-full rounded-xl border border-white/25 ${props.editorMode ? "pointer-events-none" : ""}`}
                        style={{ height: `clamp(${block.mediaHeightMobile}px, 42vw, ${block.mediaHeightDesktop}px)` }}
                        title={block.title || props.title}
                        allowFullScreen
                      />
                    ) : block.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={block.imageUrl}
                        alt={block.title || props.title}
                        className="w-full rounded-xl border border-white/20"
                        style={{ height: `clamp(${block.mediaHeightMobile}px, 42vw, ${block.mediaHeightDesktop}px)`, objectFit: block.mediaFit }}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              {block.type === "text" ? (
                <>
                  {block.title ? <h2 className="font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.text ? <p className="mt-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "image" ? (
                <>
                  {block.title ? <h2 className="mb-3 font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={block.imageUrl}
                      alt={block.title || props.title}
                      className="w-full rounded-xl"
                      style={{ height: `clamp(${block.mediaHeightMobile}px, 42vw, ${block.mediaHeightDesktop}px)`, objectFit: block.mediaFit }}
                    />
                  ) : null}
                  {block.text ? <p className="mt-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "video" ? (
                <>
                  {block.title ? <h2 className="mb-3 font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.videoUrl ? (
                    <iframe
                      src={block.videoUrl}
                      className={`w-full rounded-xl border border-white/25 ${props.editorMode ? "pointer-events-none" : ""}`}
                      style={{ height: `clamp(${block.mediaHeightMobile}px, 42vw, ${block.mediaHeightDesktop}px)` }}
                      title={block.title || props.title}
                      allowFullScreen
                    />
                  ) : null}
                  {block.text ? <p className="mt-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                </>
              ) : null}

              {block.type === "button" ? (
                <div className="text-center">
                  {block.title ? <h2 className="font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.text ? <p className="mt-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                  <a
                    href={block.buttonUrl || props.ctaUrl}
                    onClick={stopNavigationInEditor}
                    className="mt-4 inline-flex rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.02]"
                    style={{ backgroundColor: props.primaryColor }}
                  >
                    {block.buttonLabel || props.ctaLabel}
                  </a>
                </div>
              ) : null}

              {block.type === "benefits" ? (
                <>
                  {block.title ? <h2 className="font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  <ul className="mt-3 space-y-2">
                    {block.items.map((item, idx) => (
                      <li key={`${block.id}-${idx}`} className="rounded-lg border border-white/20 bg-white/8 px-3 py-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.5vw, ${block.textSize}px)` }}>✅ {item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {block.type === "faq" ? (
                <details className="rounded-xl border border-white/25 bg-white/8 p-3 open:bg-white/12">
                  <summary className="cursor-pointer list-none font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>
                    {block.title || "Pergunta frequente"}
                  </summary>
                  <p className="mt-2" style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p>
                </details>
              ) : null}

              {block.type === "input" ? (
                <div className="space-y-3">
                  {block.title ? <h2 className="font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.text ? <p style={{ fontSize: `clamp(${Math.round(block.textSize * 0.9)}px, 1.6vw, ${block.textSize}px)` }}>{block.text}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder={block.placeholder || "Digite aqui"}
                      className={`min-w-[240px] flex-1 rounded-xl border px-4 py-3 text-sm ${
                        props.themeMode === "dark"
                          ? "border-slate-500/60 bg-slate-900/80 text-slate-100 placeholder:text-slate-400"
                          : "border-white/35 bg-white/90 text-[#0f172a]"
                      }`}
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
                  {block.title ? <h2 className="mb-3 font-black" style={{ fontSize: `clamp(${Math.round(block.titleSize * 0.54)}px, 3vw, ${Math.round(block.titleSize * 0.76)}px)` }}>{block.title}</h2> : null}
                  {block.items.length > 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-black/20 p-2">
                      <motion.div
                        animate={{ x: `-${(canvasSlides[block.id] ?? 0) * 100}%` }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="flex"
                      >
                        {block.items.map((src, idx) => (
                          <div key={`${block.id}-item-${idx}`} className="w-full shrink-0 px-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Slide ${idx + 1}`}
                              className="w-full rounded-xl"
                              style={{ height: `clamp(${block.mediaHeightMobile}px, 42vw, ${block.mediaHeightDesktop}px)`, objectFit: block.mediaFit }}
                            />
                          </div>
                        ))}
                      </motion.div>
                      {block.items.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setCanvasSlides((prev) => ({
                                ...prev,
                                [block.id]: ((prev[block.id] ?? 0) - 1 + block.items.length) % block.items.length,
                              }))
                            }
                            aria-label="Slide anterior"
                            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 px-2.5 py-1.5 text-sm font-black text-white backdrop-blur transition hover:bg-black/55"
                          >
                            {"<"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCanvasSlides((prev) => ({
                                ...prev,
                                [block.id]: ((prev[block.id] ?? 0) + 1) % block.items.length,
                              }))
                            }
                            aria-label="Próximo slide"
                            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 px-2.5 py-1.5 text-sm font-black text-white backdrop-blur transition hover:bg-black/55"
                          >
                            {">"}
                          </button>
                          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full border border-white/20 bg-black/35 px-2.5 py-1.5 backdrop-blur">
                          {block.items.map((_, idx) => (
                            <button
                              key={`${block.id}-dot-${idx}`}
                              type="button"
                              onClick={() => setCanvasSlides((prev) => ({ ...prev, [block.id]: idx }))}
                              aria-label={`Ir para slide ${idx + 1}`}
                              className={`h-2.5 w-2.5 rounded-full transition ${(canvasSlides[block.id] ?? 0) === idx ? "scale-110 bg-white" : "bg-white/45 hover:bg-white/70"}`}
                            />
                          ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm opacity-80">Adicione imagens para o carrossel.</p>
                  )}
                </div>
              ) : null}
            </motion.article>
            );
          })}
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
                onClick={stopNavigationInEditor}
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

          <Card animationsEnabled={props.animationsEnabled} themeMode={props.themeMode}>
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
          <h2 className={sectionTitleClass}>Carrossel visual</h2>
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/30 bg-black/25 p-2 shadow-2xl">
            <motion.div
              animate={{ x: `-${normalizedActiveSlide * 100}%` }}
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
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                  aria-label="Slide anterior"
                  className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 px-2.5 py-1.5 text-sm font-black text-white backdrop-blur transition hover:bg-black/55"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % carouselImages.length)}
                  aria-label="Próximo slide"
                  className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-black/35 px-2.5 py-1.5 text-sm font-black text-white backdrop-blur transition hover:bg-black/55"
                >
                  {">"}
                </button>
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full border border-white/20 bg-black/35 px-2.5 py-1.5 backdrop-blur">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Ir para slide ${idx + 1}`}
                      className={`h-2.5 w-2.5 rounded-full transition ${idx === normalizedActiveSlide ? "scale-110 bg-white" : "bg-white/45 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      {props.contentSections.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className={sectionTitleClass}>Conteúdo</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {props.contentSections.map((section, idx) => (
              <Card key={`${section.title}-${idx}`} animationsEnabled={props.animationsEnabled} themeMode={props.themeMode} delay={idx * 0.04}>
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
              <Card key={`${item.name}-${idx}`} animationsEnabled={props.animationsEnabled} themeMode={props.themeMode} delay={idx * 0.05}>
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
              <Card key={`${entry.question}-${idx}`} animationsEnabled={props.animationsEnabled} themeMode={props.themeMode} delay={idx * 0.03}>
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
            onClick={stopNavigationInEditor}
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
