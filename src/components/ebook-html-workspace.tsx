"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ansiedadeContent from "@/content/ansiedade-content.json";

type EbookHtmlWorkspaceProps = {
  title: string;
  slug: string;
  modules: string[];
  userEmail: string;
};

type Chapter = {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  paragraphs: string[];
  displayTitle?: string;
  moduleIndex?: number;
};

type Highlight = {
  id: string;
  chapterIndex: number;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  color: string;
  selectedText: string;
};

const chapters = ansiedadeContent.chapters as Chapter[];

const MARK_COLORS = [
  { key: "yellow", className: "bg-yellow-200/70", dotClass: "bg-yellow-400" },
  { key: "green", className: "bg-emerald-200/70", dotClass: "bg-emerald-500" },
  { key: "pink", className: "bg-pink-200/70", dotClass: "bg-pink-500" },
];

function uniqueSorted(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function clampIndexes(values: number[], maxExclusive: number) {
  return uniqueSorted(values.filter((value) => Number.isInteger(value) && value >= 0 && value < maxExclusive));
}

function resolveModuleIndexByPage(
  chapterStartPage: number,
  modulesCount: number,
  fallbackIndex: number,
) {
  const raw = process.env.NEXT_PUBLIC_ANSIEDADE_MODULE_PAGES;
  if (!raw) return fallbackIndex;
  const starts = raw
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (starts.length !== modulesCount) return fallbackIndex;

  let moduleIndex = 0;
  for (let i = 0; i < starts.length; i += 1) {
    if (chapterStartPage >= starts[i]) moduleIndex = i;
  }
  return Math.max(0, Math.min(moduleIndex, modulesCount - 1));
}

function splitReadableParagraphs(text: string) {
  const normalized = text.replace(/\r/g, " ").replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return [normalized];

  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > 430) {
      if (current) chunks.push(current);
      current = sentence;
      continue;
    }
    current = next;
  }
  if (current) chunks.push(current);
  return chunks;
}

function mergeTitle(left: Chapter, right?: Chapter) {
  if (!right) return left.title;
  const clean = (value: string) => value.replace(/^Seção\s+\d+[:\-]?\s*/i, "").trim();
  return `${clean(left.title)} + ${clean(right.title)}`;
}

function generateSupportParagraphs(title: string, amount: number) {
  const base = [
    `Aplicação prática: nesta seção (${title}), o foco é transformar entendimento em rotina observável.`,
    "Exercício rápido: ao terminar a leitura, anote uma ação simples que pode ser aplicada hoje em menos de 10 minutos.",
    "Pergunta de revisão: qual parte deste conteúdo reduz mais sua ansiedade no curto prazo e qual constrói consistência no longo prazo?",
    "Nota importante: constância vence intensidade. Pequenos ajustes diários costumam gerar os melhores resultados emocionais.",
    "Integração: combine esta etapa com respiração, organização da agenda e pausas curtas para reforçar o aprendizado.",
    "Próximo passo: releia os pontos principais e destaque o que você realmente pretende executar nesta semana.",
  ];
  return base.slice(0, amount);
}

export function EbookHtmlWorkspace({ title, slug, modules, userEmail }: EbookHtmlWorkspaceProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [readChapters, setReadChapters] = useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightMode, setHighlightMode] = useState(false);
  const [markColor, setMarkColor] = useState("yellow");
  const [fontScale, setFontScale] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const restoredScrollRef = useRef(false);

  const chaptersView = useMemo(() => {
    const merged: Chapter[] = [];
    for (let i = 0; i < chapters.length; i += 2) {
      const left = chapters[i];
      const right = chapters[i + 1];
      const rawParagraphs = [
        ...left.paragraphs.flatMap((paragraph) => splitReadableParagraphs(paragraph)),
        ...(right ? right.paragraphs.flatMap((paragraph) => splitReadableParagraphs(paragraph)) : []),
      ].filter(Boolean);

      const targetParagraphs = 8;
      const missing = Math.max(targetParagraphs - rawParagraphs.length, 0);
      const expandedParagraphs = [...rawParagraphs, ...generateSupportParagraphs(mergeTitle(left, right), missing)];

      merged.push({
        id: `secao-${Math.floor(i / 2) + 1}`,
        title: mergeTitle(left, right),
        startPage: left.startPage,
        endPage: right ? right.endPage : left.endPage,
        paragraphs: expandedParagraphs,
      });
    }

    return merged.map((chapter, index) => {
      const linearModuleIndex = modules.length
        ? Math.min(Math.floor((index / Math.max(merged.length - 1, 1)) * modules.length), modules.length - 1)
        : index;
      const moduleIndex = modules.length
        ? resolveModuleIndexByPage(chapter.startPage, modules.length, linearModuleIndex)
        : index;
      const displayTitle = modules[moduleIndex] || chapter.title || `Seção ${index + 1}`;
      return { ...chapter, displayTitle, moduleIndex };
    });
  }, [modules]);

  const completedModules = useMemo(() => {
    if (!modules.length || !chaptersView.length) return [];

    const moduleIndexes = new Set<number>();
    for (const chapterIndex of readChapters) {
      const chapter = chaptersView[chapterIndex];
      if (!chapter) continue;
      const moduleIndex = chapter.moduleIndex ?? 0;
      moduleIndexes.add(Math.max(0, Math.min(moduleIndex, modules.length - 1)));
    }

    const active = chaptersView[activeChapter];
    if (active?.moduleIndex !== undefined) {
      moduleIndexes.add(Math.max(0, Math.min(active.moduleIndex, modules.length - 1)));
    }

    if (moduleIndexes.size === 0 && scrollProgress > 0) {
      const byScroll = Math.min(
        modules.length - 1,
        Math.floor((scrollProgress / 100) * Math.max(modules.length, 1)),
      );
      moduleIndexes.add(Math.max(0, byScroll));
    }

    if (moduleIndexes.size === 0) return [];
    const maxReached = Math.max(...Array.from(moduleIndexes));
    return Array.from({ length: maxReached + 1 }, (_, idx) => idx);
  }, [activeChapter, chaptersView, modules.length, readChapters, scrollProgress]);

  const overallProgress = useMemo(() => {
    const chapterProgress = chaptersView.length ? Math.round((readChapters.length / chaptersView.length) * 100) : 0;
    const moduleProgress = modules.length ? Math.round((completedModules.length / modules.length) * 100) : 0;
    return Math.max(chapterProgress, moduleProgress, scrollProgress);
  }, [chaptersView.length, completedModules.length, modules.length, readChapters.length, scrollProgress]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const response = await fetch(`/api/members/ebooks/${slug}/state`, { cache: "no-store" });
      if (!response.ok) {
        setLoaded(true);
        return;
      }
      const data = (await response.json()) as {
        state: {
          activeChapter: number;
          scrollProgress: number;
          readChapters: number[];
          completedModules: number[];
          fontScale: number;
          highlights: Highlight[];
        };
      };
      if (ignore) return;
      const maxChapterIndex = Math.max(chaptersView.length - 1, 0);
      const nextActive = Math.min(Math.max(data.state.activeChapter ?? 0, 0), maxChapterIndex);
      setActiveChapter(nextActive);
      setScrollProgress(Math.min(Math.max(data.state.scrollProgress ?? 0, 0), 100));
      setFontScale(Math.min(Math.max(data.state.fontScale ?? 1, 0.85), 1.6));
      setReadChapters(clampIndexes(data.state.readChapters ?? [], chaptersView.length));
      setHighlights(data.state.highlights ?? []);
      setLoaded(true);
    })();

    return () => {
      ignore = true;
    };
  }, [chaptersView.length, slug]);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(async () => {
      await fetch(`/api/members/ebooks/${slug}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeChapter,
          scrollProgress,
          fontScale,
          readChapters,
          completedModules,
          highlights,
        }),
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeChapter, completedModules, fontScale, highlights, loaded, readChapters, scrollProgress, slug]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMeta && (key === "p" || key === "s" || key === "u")) {
        event.preventDefault();
      }

      if (event.key === "PrintScreen") {
        event.preventDefault();
      }
    };

    const onDragStart = (event: DragEvent) => event.preventDefault();

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  useEffect(() => {
    const el = readerScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScrollable = el.scrollHeight - el.clientHeight;
      if (maxScrollable <= 0) {
        setScrollProgress(100);
        return;
      }
      const value = Math.round((el.scrollTop / maxScrollable) * 100);
      setScrollProgress(Math.min(Math.max(value, 0), 100));

      // Track current chapter by reading anchor and auto-complete modules by scroll depth.
      const anchor = el.scrollTop + el.clientHeight * 0.3;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      chapterRefs.current.forEach((node, idx) => {
        if (!node) return;
        const distance = Math.abs(node.offsetTop - anchor);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = idx;
        }
      });
      setActiveChapter(nearest);

      const visibleIndexes: number[] = [];
      chapterRefs.current.forEach((node, idx) => {
        if (!node) return;
        if (node.offsetTop <= el.scrollTop + el.clientHeight * 0.55) visibleIndexes.push(idx);
      });
      if (!visibleIndexes.includes(nearest)) visibleIndexes.push(nearest);

      setReadChapters((prev) => uniqueSorted([...prev, ...visibleIndexes]));
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [chaptersView.length]);

  useEffect(() => {
    if (!loaded || restoredScrollRef.current) return;
    const el = readerScrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      const targetByChapter = chapterRefs.current[activeChapter];
      if (targetByChapter) {
        const desiredTop = Math.max(targetByChapter.offsetTop - 18, 0);
        el.scrollTo({ top: desiredTop, behavior: "auto" });
      } else {
        const maxScrollable = Math.max(el.scrollHeight - el.clientHeight, 0);
        const desiredTop = Math.round((scrollProgress / 100) * maxScrollable);
        el.scrollTo({ top: desiredTop, behavior: "auto" });
      }
      restoredScrollRef.current = true;
    });
  }, [activeChapter, loaded, scrollProgress]);

  function goToChapter(index: number) {
    const target = chapterRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveChapter(index);
    setReadChapters((prev) => (prev.includes(index) ? prev : uniqueSorted([...prev, index])));
  }

  async function toggleFullscreen() {
    if (!viewerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await viewerRef.current.requestFullscreen();
  }

  function addHighlightFromSelection() {
    if (!highlightMode) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const paragraphEl = (range.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement
    )?.closest("[data-paragraph-index]") as HTMLElement | null;

    if (!paragraphEl) return;

    const chapterIndex = Number(paragraphEl.dataset.chapterIndex);
    const paragraphIndex = Number(paragraphEl.dataset.paragraphIndex);
    if (!Number.isInteger(chapterIndex) || !Number.isInteger(paragraphIndex)) return;

    const preStart = document.createRange();
    preStart.selectNodeContents(paragraphEl);
    preStart.setEnd(range.startContainer, range.startOffset);
    const startOffset = preStart.toString().length;

    const preEnd = document.createRange();
    preEnd.selectNodeContents(paragraphEl);
    preEnd.setEnd(range.endContainer, range.endOffset);
    const endOffset = preEnd.toString().length;

    const selectedText = selection.toString().trim();
    if (!selectedText || endOffset <= startOffset) return;

    setHighlights((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        chapterIndex,
        paragraphIndex,
        startOffset,
        endOffset,
        color: markColor,
        selectedText: selectedText.slice(0, 500),
      },
    ]);
    selection.removeAllRanges();
  }

  function removeHighlight(id: string) {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }

  function renderParagraph(chapterIndex: number, paragraphIndex: number, text: string): ReactNode {
    const ranges = highlights
      .filter((h) => h.chapterIndex === chapterIndex && h.paragraphIndex === paragraphIndex)
      .sort((a, b) => a.startOffset - b.startOffset);

    if (!ranges.length) return text;

    const result: ReactNode[] = [];
    let cursor = 0;
    ranges.forEach((range) => {
      const safeStart = Math.max(range.startOffset, cursor);
      const safeEnd = Math.min(range.endOffset, text.length);
      if (safeStart > cursor) result.push(text.slice(cursor, safeStart));
      if (safeEnd > safeStart) {
        const colorClass = MARK_COLORS.find((c) => c.key === range.color)?.className ?? "bg-yellow-200/70";
        result.push(
          <mark key={range.id} className={`${colorClass} rounded px-0.5`}>
            {text.slice(safeStart, safeEnd)}
          </mark>,
        );
      }
      cursor = Math.max(cursor, safeEnd);
    });
    if (cursor < text.length) result.push(text.slice(cursor));
    return result;
  }

  return (
    <section className="ebook-html-root space-y-4 select-none" onContextMenu={(event) => event.preventDefault()}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="ebook-hero-card relative overflow-hidden rounded-2xl border border-[var(--dourado)]/45 bg-gradient-to-br from-[#fff5df] via-[#fffdf8] to-[#f4e6d1] p-5"
      >
        <div className="pointer-events-none absolute -top-8 -right-10 h-28 w-28 rounded-full bg-[var(--dourado)]/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-12 h-32 w-32 rounded-full bg-[var(--areia)]/45 blur-2xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--carvao)]/70 uppercase">Modo Leitura</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-[var(--carvao)]/75">Leitura organizada, sumário rápido e progresso automático por seção.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-2xl">
            <span className="rounded-lg bg-white/80 px-3 py-1">📘</span>
            <span className="rounded-lg bg-white/80 px-3 py-1">🧠</span>
            <span className="rounded-lg bg-white/80 px-3 py-1">✅</span>
          </div>
        </div>
      </motion.div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--dourado)]/35">
        <div className="h-full bg-[var(--ink)] transition-all" style={{ width: `${overallProgress}%` }} />
      </div>
      <p className="text-sm text-[var(--carvao)]/75">
        Progresso {overallProgress}% • Scroll {scrollProgress}% • Seções {readChapters.length}/{chaptersView.length} • Módulos {completedModules.length}/{modules.length}
      </p>

      <div className="ebook-info-card rounded-xl border border-[var(--dourado)]/40 bg-white/75 p-3 text-sm">
        <p className="font-semibold">Leitura assistida</p>
        <p className="mt-1 text-[var(--carvao)]/80">Com o marca-texto ligado, selecione apenas as palavras/linhas desejadas para marcar.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(360px,1fr)]">
        <div
          ref={viewerRef}
          className={`ebook-reader-shell rounded-2xl border border-white/60 bg-[#fffdf8] p-3 shadow-sm md:p-5 ${
            isFullscreen ? "h-screen overflow-hidden bg-[#fffdf8]" : ""
          }`}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--dourado)]/35 pb-3">
            <p className="text-xs font-semibold tracking-wide text-[var(--carvao)]/75 md:text-sm">Leitura HTML • {userEmail}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHighlightMode((prev) => !prev)}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  highlightMode ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"
                }`}
              >
                {highlightMode ? "Marca-texto ON" : "Marca-texto OFF"}
              </button>
              {MARK_COLORS.map((color) => (
                <button
                  key={color.key}
                  type="button"
                  onClick={() => setMarkColor(color.key)}
                  className={`h-6 w-6 rounded-full border ${color.dotClass} ${markColor === color.key ? "ring-2 ring-[var(--ink)]" : ""}`}
                  aria-label={`Cor ${color.key}`}
                />
              ))}
              <div className="ebook-control-card flex items-center rounded-md border border-[var(--ink)]/25 bg-white">
                <button
                  type="button"
                  onClick={() => setFontScale((prev) => Math.max(0.85, Number((prev - 0.1).toFixed(2))))}
                  className="px-2 py-1 text-xs font-semibold"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale(1)}
                  className="border-x border-[var(--ink)]/20 px-2 py-1 text-xs font-semibold"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale((prev) => Math.min(1.6, Number((prev + 0.1).toFixed(2))))}
                  className="px-2 py-1 text-xs font-semibold"
                >
                  A+
                </button>
              </div>
              <a
                href={`/api/members/ebooks/${slug}/download`}
                className="ebook-control-card rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]"
              >
                Baixar PDF identificado
              </a>
              <button type="button" onClick={toggleFullscreen} className="rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white">
                {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              </button>
            </div>
          </div>

          <div
            ref={readerScrollRef}
            onMouseUp={addHighlightFromSelection}
            className={`${isFullscreen ? "h-[92vh]" : "h-[74vh] md:h-[78vh]"} overflow-y-auto pr-1 md:pr-4 ${highlightMode ? "select-text" : "select-none"}`}
          >
            <div className="mx-auto max-w-4xl space-y-7 pb-16">
              <article className="ebook-cover-card relative overflow-hidden rounded-xl border border-[var(--dourado)]/50 bg-white px-4 py-5 md:px-8 md:py-7 shadow-sm">
                <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--dourado)]/30 blur-2xl" />
                <Image
                  src="/ebook-cover-art.png"
                  alt="Capa estilizada do ebook"
                  width={800}
                  height={520}
                  className="h-auto w-full rounded-lg border border-[var(--dourado)]/35"
                />
                <div className="mt-5 text-center">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[var(--carvao)]/70 uppercase">Marketing Digital Top</p>
                  <h2 className="mt-2 text-3xl font-black leading-tight text-[var(--ink)] md:text-4xl">Como Derrotar a Ansiedade</h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--carvao)]/80 md:text-base">
                    Guia prático para reduzir picos de ansiedade, recuperar foco e construir uma rotina mental mais leve.
                  </p>
                </div>
              </article>

              {chaptersView.map((chapter, chapterIndex) => (
                <article
                  key={chapter.id}
                  ref={(el) => {
                    chapterRefs.current[chapterIndex] = el;
                  }}
                  data-chapter-index={chapterIndex}
                  className={`ebook-chapter-card reader-chapter-virtualized rounded-xl border px-4 py-5 md:px-7 md:py-7 transition min-h-[65vh] ${
                    activeChapter === chapterIndex
                      ? "border-[var(--ink)]/45 bg-gradient-to-br from-[var(--dourado)]/20 to-white shadow-sm"
                      : "border-[var(--dourado)]/35 bg-white/90"
                  }`}
                >
                  <h2 className="text-2xl leading-tight font-bold md:text-3xl">{chapter.displayTitle}</h2>
                  <p className="mt-1 text-xs tracking-wide text-[var(--carvao)]/70 uppercase">
                    Páginas {chapter.startPage} a {chapter.endPage}
                  </p>
                  <div className="mt-5 space-y-5 text-[17px] leading-8 text-[var(--ink)]/92 md:text-[19px] md:leading-10">
                    {chapter.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${chapter.id}-${paragraphIndex}`}
                        data-chapter-index={chapterIndex}
                        data-paragraph-index={paragraphIndex}
                        className="text-balance antialiased"
                        style={{ fontSize: `${Math.max(16, Math.round(19 * fontScale))}px`, lineHeight: `${Math.max(1.8, 2.1 * fontScale)}` }}
                      >
                        {renderParagraph(chapterIndex, paragraphIndex, paragraph)}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="ebook-sidebar-card rounded-2xl border border-white/60 bg-white/75 p-4">
            <h3 className="font-semibold">Sumário</h3>
            <div className="mt-3 max-h-[46vh] space-y-2 overflow-y-auto pr-1">
              {chaptersView.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => goToChapter(index)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm leading-snug ${
                    activeChapter === index ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--dourado)]/40 bg-white"
                  }`}
                >
                  {chapter.displayTitle}
                </button>
              ))}
            </div>
          </div>

          <div className="ebook-sidebar-card rounded-2xl border border-white/60 bg-white/75 p-4">
            <h3 className="font-semibold">Módulos (automático por leitura)</h3>
            <div className="mt-3 max-h-[36vh] space-y-2 overflow-y-auto pr-1">
              {modules.map((moduleTitle, idx) => (
                <div key={moduleTitle} className="flex items-start gap-2 rounded-md border border-[var(--dourado)]/40 bg-white px-3 py-2 text-sm leading-snug">
                  <span
                    className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                      completedModules.includes(idx) ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--ink)]/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span>{moduleTitle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ebook-sidebar-card rounded-2xl border border-white/60 bg-white/75 p-4">
            <h3 className="font-semibold">Destaques</h3>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {highlights.length === 0 ? (
                <p className="text-sm text-[var(--carvao)]/70">Nenhum destaque salvo.</p>
              ) : (
                highlights.map((highlight) => (
                  <div key={highlight.id} className="rounded-md border border-[var(--dourado)]/40 bg-white p-2 text-xs">
                    <p className="text-[var(--carvao)]/85">Seção {highlight.chapterIndex + 1}: {highlight.selectedText}</p>
                    <button type="button" onClick={() => removeHighlight(highlight.id)} className="mt-1 rounded border px-2 py-0.5 text-[10px]">
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
