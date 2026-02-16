"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EbookWorkspaceProps = {
  title: string;
  slug: string;
  modules: string[];
  userEmail: string;
};

export function EbookWorkspace({ title, slug, modules, userEmail }: EbookWorkspaceProps) {
  const storageKey = `ebook-progress:${slug}`;
  const pageStorageKey = `ebook-viewer-page:${slug}`;
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    let raw = "";
    try {
      raw = window.localStorage.getItem(storageKey) || "";
    } catch {
      raw = "";
    }
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((v): v is number => Number.isInteger(v) && v >= 0);
    } catch {
      return [];
    }
  });
  const [viewerPage, setViewerPage] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const raw = window.localStorage.getItem(pageStorageKey);
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.floor(value);
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfTotalPages = Math.max(Number(process.env.NEXT_PUBLIC_ANSIEDADE_PDF_TOTAL_PAGES || "30"), 1);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completedIndexes));
    } catch {
      // ignore storage errors
    }
  }, [completedIndexes, storageKey]);

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onDragStart = (event: DragEvent) => event.preventDefault();
    const onCopy = (event: ClipboardEvent) => event.preventDefault();
    const onCut = (event: ClipboardEvent) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;

      const blockedCombos =
        (ctrlOrMeta && (key === "s" || key === "p" || key === "u" || key === "c")) ||
        (ctrlOrMeta && event.shiftKey && (key === "i" || key === "j" || key === "c")) ||
        key === "f12" ||
        key === "printscreen";

      if (blockedCombos) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const progress = useMemo(() => {
    const total = modules.length;
    const done = completedIndexes.length;
    if (total === 0) return 0;
    const checklistProgress = Math.round((done / total) * 100);
    const readingProgress = Math.round((Math.min(viewerPage, pdfTotalPages) / pdfTotalPages) * 100);
    return Math.max(checklistProgress, readingProgress);
  }, [completedIndexes, modules.length, viewerPage, pdfTotalPages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(pageStorageKey, String(viewerPage));
    } catch {
      // ignore storage errors
    }
  }, [viewerPage, pageStorageKey]);

  function toggleModule(index: number) {
    setCompletedIndexes((prev) => {
      if (prev.includes(index)) return prev.filter((item) => item !== index);
      return [...prev, index].sort((a, b) => a - b);
    });
  }

  function goToPage(page: number) {
    const normalized = Math.min(Math.max(Math.floor(page), 1), pdfTotalPages);
    setViewerPage(normalized);
  }

  const pdfUrl = `/api/members/ebooks/${slug}`;
  const modulePages = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_ANSIEDADE_MODULE_PAGES;
    if (!raw) return modules.map((_, index) => index * 3 + 1);
    const parsed = raw
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parsed.length !== modules.length) return modules.map((_, index) => index * 3 + 1);
    return parsed;
  }, [modules]);
  const safeViewerUrl = pdfUrl
    ? `${pdfUrl}#page=${viewerPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`
    : "";

  async function openFullscreen() {
    try {
      if (!viewerRef.current) return;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await viewerRef.current.requestFullscreen();
    } catch {
      // ignore browser-specific fullscreen errors
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <section className="print:hidden" onContextMenu={(event) => event.preventDefault()}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--dourado)]/35">
        <div className="h-full bg-[var(--ink)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-[var(--carvao)]/75">Progresso: {progress}%</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
          <h2 className="text-xl font-bold">Leitor do ebook</h2>
          {safeViewerUrl ? (
            <div
              ref={viewerRef}
              className={`relative mt-3 ${isFullscreen ? "bg-black p-2" : ""}`}
            >
              <div className="pointer-events-none absolute inset-0 z-20 rounded-xl bg-[repeating-linear-gradient(45deg,rgba(59,57,60,0.09),rgba(59,57,60,0.09)_2px,transparent_2px,transparent_18px)]" />
              <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-xl">
                <p className="rotate-[-18deg] text-sm font-bold text-[var(--carvao)]/28 md:text-lg">
                  ACESSO PESSOAL • {userEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={openFullscreen}
                className="absolute top-2 right-2 z-40 rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white"
              >
                {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              </button>
              <iframe
                title={`Ebook ${slug}`}
                src={safeViewerUrl}
                className={`relative z-10 w-full rounded-xl border border-[var(--dourado)]/45 ${
                  isFullscreen ? "h-[96vh]" : "h-[65vh]"
                }`}
              />
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-[var(--dourado)]/45 bg-white/75 p-4 text-sm text-[var(--carvao)]/80">
              PDF indisponível no momento. Verifique o arquivo e a variável `ANSIEDADE_PDF_FILE_PATH`.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--carvao)]/80">
            <button type="button" onClick={() => goToPage(viewerPage - 1)} className="rounded-md border px-2 py-1">
              Pagina anterior
            </button>
            <button type="button" onClick={() => goToPage(viewerPage + 1)} className="rounded-md border px-2 py-1">
              Proxima pagina
            </button>
            <span className="rounded-md border border-[var(--dourado)]/45 px-2 py-1">
              Pagina {viewerPage} de {pdfTotalPages}
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--carvao)]/75">
            Dica: segure <strong>Ctrl</strong> e use o scroll do mouse para ajustar o zoom do PDF.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
            <h3 className="font-semibold">Acesso protegido</h3>
            <p className="mt-2 text-sm text-[var(--carvao)]/80">
              Material liberado para visualização na plataforma. Download, cópia e impressão estão bloqueados nesta área.
            </p>
            <p className="mt-2 text-xs text-[var(--carvao)]/70">Usuário identificado: {userEmail}</p>
            <p className="mt-2 text-xs text-[var(--carvao)]/70">
              Conclusao dos modulos: {completedIndexes.length}/{modules.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
            <h3 className="font-semibold">Módulos</h3>
            <div className="mt-3 space-y-2">
              {modules.map((item, index) => (
                <div key={item} className="rounded-lg border border-[var(--dourado)]/40 bg-white/70 p-2">
                  <button
                    type="button"
                    onClick={() => toggleModule(index)}
                    className="flex w-full items-start gap-2 text-left text-sm"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold ${
                        completedIndexes.includes(index)
                          ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                          : "border-[var(--ink)]/40 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      goToPage(modulePages[index] || 1);
                      setCompletedIndexes((prev) => {
                        if (prev.includes(index)) return prev;
                        return [...prev, index].sort((a, b) => a - b);
                      });
                    }}
                    className="mt-2 rounded-md border px-2 py-1 text-xs font-semibold"
                  >
                    Ir para página {modulePages[index] || 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
