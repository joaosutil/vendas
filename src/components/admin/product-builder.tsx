"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductBuilderProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    type: "EBOOK" | "VIDEO_COURSE" | "OTHER";
    active: boolean;
    ebookAsset: { fileName: string; filePath: string } | null;
    modules: Array<{
      id: string;
      title: string;
      orderIndex: number;
      lessons: Array<{
        id: string;
        title: string;
        videoUrl: string;
        description: string;
        orderIndex: number;
      }>;
    }>;
  };
};

export function ProductBuilder({ product }: ProductBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description ?? "");
  const [type, setType] = useState<"EBOOK" | "VIDEO_COURSE" | "OTHER">(product.type);
  const [active, setActive] = useState(product.active);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonDraft, setLessonDraft] = useState<Record<string, { title: string; videoUrl: string; description: string }>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const typeLabel = useMemo(() => {
    if (type === "EBOOK") return "E-book";
    if (type === "VIDEO_COURSE") return "Videoaulas";
    return "Outro";
  }, [type]);

  async function saveProduct() {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, type, active }),
      });
      if (!response.ok) {
        setFeedback("Falha ao salvar produto.");
        return;
      }
      setFeedback("Produto atualizado.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function uploadPdf() {
    if (!pdfFile) return;
    setLoading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.set("file", pdfFile);
      const response = await fetch(`/api/admin/products/${product.id}/ebook`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setFeedback("Falha ao enviar PDF.");
        return;
      }
      setFeedback("PDF salvo com sucesso.");
      setPdfFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function createModule() {
    const trimmed = moduleTitle.trim();
    if (!trimmed) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!response.ok) {
        setFeedback("Falha ao criar módulo.");
        return;
      }
      setModuleTitle("");
      setFeedback("Módulo criado.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function createLesson(moduleId: string) {
    const draft = lessonDraft[moduleId];
    if (!draft?.title?.trim() || !draft?.videoUrl?.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          videoUrl: draft.videoUrl.trim(),
          description: draft.description.trim(),
        }),
      });
      if (!response.ok) {
        setFeedback("Falha ao criar aula.");
        return;
      }
      setLessonDraft((prev) => ({ ...prev, [moduleId]: { title: "", videoUrl: "", description: "" } }));
      setFeedback("Aula criada.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-sm">{feedback}</div> : null}

      <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="text-lg font-bold">Configuração do produto</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" placeholder="Título" />
          <input value={slug} onChange={(event) => setSlug(event.target.value)} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" placeholder="Slug" />
          <select value={type} onChange={(event) => setType(event.target.value as "EBOOK" | "VIDEO_COURSE" | "OTHER")} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
            <option value="EBOOK">E-book</option>
            <option value="VIDEO_COURSE">Videoaulas</option>
            <option value="OTHER">Outro formato</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            Produto ativo
          </label>
        </div>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" placeholder="Descrição para dashboard e área de membros" />
        <button type="button" disabled={loading} onClick={saveProduct} className="mt-3 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          Salvar produto
        </button>
      </section>

      <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="text-lg font-bold">Construtor de conteúdo ({typeLabel})</h2>

        {type === "EBOOK" ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-[var(--dourado)]/40 bg-white p-3">
              <p className="text-sm font-semibold">Upload do PDF</p>
              <p className="mt-1 text-xs text-[var(--carvao)]/75">Envie o arquivo no painel e ele fica disponível na área de membros.</p>
              <input type="file" accept="application/pdf" onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />
              <button type="button" disabled={loading || !pdfFile} onClick={uploadPdf} className="mt-2 rounded-md bg-[var(--ink)] px-3 py-1 text-sm font-semibold text-white disabled:opacity-60">
                Enviar PDF
              </button>
              <p className="mt-2 text-xs text-[var(--carvao)]/70">
                Atual: {product.ebookAsset ? `${product.ebookAsset.fileName} (${product.ebookAsset.filePath})` : "Nenhum arquivo enviado"}
              </p>
            </div>
          </div>
        ) : null}

        {type === "VIDEO_COURSE" ? (
          <div className="mt-3 space-y-4">
            <div className="rounded-xl border border-[var(--dourado)]/40 bg-white p-3">
              <p className="text-sm font-semibold">Criar módulo</p>
              <div className="mt-2 flex flex-col gap-2 md:flex-row">
                <input value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" placeholder="Ex: Módulo 1 - Fundamentos" />
                <button type="button" disabled={loading} onClick={createModule} className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  Criar módulo
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {product.modules.length === 0 ? (
                <p className="text-sm text-[var(--carvao)]/70">Sem módulos ainda.</p>
              ) : (
                product.modules.map((module) => (
                  <article key={module.id} className="rounded-xl border border-[var(--dourado)]/40 bg-white p-3">
                    <p className="font-semibold">{module.title}</p>
                    <div className="mt-2 space-y-2">
                      {module.lessons.length === 0 ? <p className="text-xs text-[var(--carvao)]/70">Nenhuma aula.</p> : null}
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="rounded-md border border-[var(--dourado)]/30 bg-[var(--creme)]/70 px-3 py-2">
                          <p className="text-sm font-medium">{lesson.title}</p>
                          {lesson.description ? <p className="mt-1 text-xs text-[var(--carvao)]/80">{lesson.description}</p> : null}
                          <p className="text-xs text-[var(--carvao)]/70">{lesson.videoUrl}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <input
                        value={lessonDraft[module.id]?.title ?? ""}
                        onChange={(event) =>
                          setLessonDraft((prev) => ({
                            ...prev,
                            [module.id]: {
                              title: event.target.value,
                              videoUrl: prev[module.id]?.videoUrl ?? "",
                              description: prev[module.id]?.description ?? "",
                            },
                          }))
                        }
                        className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
                        placeholder="Título da aula"
                      />
                      <input
                        value={lessonDraft[module.id]?.videoUrl ?? ""}
                        onChange={(event) =>
                          setLessonDraft((prev) => ({ ...prev, [module.id]: { title: prev[module.id]?.title ?? "", videoUrl: event.target.value, description: prev[module.id]?.description ?? "" } }))
                        }
                        className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
                        placeholder="URL do vídeo (YouTube/Vimeo)"
                      />
                    </div>
                    <textarea
                      value={lessonDraft[module.id]?.description ?? ""}
                      onChange={(event) =>
                        setLessonDraft((prev) => ({
                          ...prev,
                          [module.id]: {
                            title: prev[module.id]?.title ?? "",
                            videoUrl: prev[module.id]?.videoUrl ?? "",
                            description: event.target.value,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Descrição da aula (aparece abaixo do vídeo)"
                    />
                    <button type="button" disabled={loading} onClick={() => createLesson(module.id)} className="mt-2 rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">
                      Adicionar aula
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        ) : null}

        {type === "OTHER" ? (
          <div className="mt-3 rounded-xl border border-[var(--dourado)]/40 bg-white p-3 text-sm text-[var(--carvao)]/80">
            Você pode usar esse tipo para mentorias, templates, aulas ao vivo e conteúdos híbridos. No próximo passo posso adicionar blocos customizáveis por tipo.
          </div>
        ) : null}
      </section>
    </div>
  );
}
