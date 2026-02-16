"use client";

import { useRef, useState } from "react";

type EbookPdfWorkspaceProps = {
  title: string;
  slug: string;
  userEmail: string;
};

export function EbookPdfWorkspace({ title, slug, userEmail }: EbookPdfWorkspaceProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfUrl = `/api/members/ebooks/${slug}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  async function toggleFullscreen() {
    if (!viewerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }
    await viewerRef.current.requestFullscreen();
    setIsFullscreen(true);
  }

  return (
    <section className="space-y-4" onContextMenu={(event) => event.preventDefault()}>
      <div className="rounded-2xl border border-[var(--dourado)]/40 bg-white/80 p-4">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--carvao)]/80">
          Modo fiel ao original: conteúdo exibido diretamente do PDF, preservando layout, fonte, negritos e imagens.
        </p>
      </div>

      <div
        ref={viewerRef}
        className={`rounded-2xl border border-white/60 bg-[#fffdf8] p-3 shadow-sm md:p-4 ${
          isFullscreen ? "h-screen overflow-hidden" : ""
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--dourado)]/35 pb-3">
          <p className="text-xs font-semibold tracking-wide text-[var(--carvao)]/75 md:text-sm">Leitura original • {userEmail}</p>
          <div className="flex items-center gap-2">
            <a
              href={`/api/members/ebooks/${slug}/download`}
              className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]"
            >
              Baixar PDF identificado
            </a>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white"
            >
              {isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            </button>
          </div>
        </div>

        <div className={`${isFullscreen ? "h-[92vh]" : "h-[80vh]"} overflow-hidden rounded-lg border border-[var(--dourado)]/35`}>
          <iframe
            title={`PDF original ${slug}`}
            src={pdfUrl}
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
