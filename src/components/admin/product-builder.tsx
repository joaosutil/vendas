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
    landingSlug: string;
    landingEnabled: boolean;
    landingConfig: Record<string, unknown> | null;
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
  const [landingEnabled, setLandingEnabled] = useState(product.landingEnabled);
  const [landingSlug, setLandingSlug] = useState(product.landingSlug || product.slug);
  const [landingBadge, setLandingBadge] = useState((product.landingConfig?.badge as string) ?? "Oferta especial");
  const [landingHeadline, setLandingHeadline] = useState(
    (product.landingConfig?.headline as string) ?? product.title,
  );
  const [landingSubheadline, setLandingSubheadline] = useState(
    (product.landingConfig?.subheadline as string) ?? "Transforme sua rotina com um método direto e aplicável.",
  );
  const [landingDescription, setLandingDescription] = useState(
    (product.landingConfig?.description as string) ??
      (product.description ?? "Conteúdo prático, direto e pensado para gerar resultado rápido."),
  );
  const [landingPriceLabel, setLandingPriceLabel] = useState(
    (product.landingConfig?.priceLabel as string) ?? "Condição especial hoje",
  );
  const [landingCtaLabel, setLandingCtaLabel] = useState(
    (product.landingConfig?.ctaLabel as string) ?? "Quero liberar meu acesso agora",
  );
  const [landingCtaUrl, setLandingCtaUrl] = useState(
    (product.landingConfig?.ctaUrl as string) ?? "https://pay.cakto.com.br/",
  );
  const [landingHeroVideoUrl, setLandingHeroVideoUrl] = useState(
    (product.landingConfig?.heroVideoUrl as string) ?? "",
  );
  const [landingHeroImageUrl, setLandingHeroImageUrl] = useState(
    (product.landingConfig?.heroImageUrl as string) ?? "/ebook-cover-art.png",
  );
  const [landingPrimaryColor, setLandingPrimaryColor] = useState(
    (product.landingConfig?.primaryColor as string) ?? "#0d111c",
  );
  const [landingSecondaryColor, setLandingSecondaryColor] = useState(
    (product.landingConfig?.secondaryColor as string) ?? "#f7f6f4",
  );
  const [landingAccentColor, setLandingAccentColor] = useState(
    (product.landingConfig?.accentColor as string) ?? "#ebd1a4",
  );
  const [landingThemeMode, setLandingThemeMode] = useState<"light" | "dark">(
    ((product.landingConfig?.themeMode as "light" | "dark") ?? "light"),
  );
  const [landingAnimationsEnabled, setLandingAnimationsEnabled] = useState(
    ((product.landingConfig?.animationsEnabled as boolean | undefined) ?? true),
  );
  const [landingBullets, setLandingBullets] = useState(
    Array.isArray(product.landingConfig?.bullets)
      ? (product.landingConfig?.bullets as string[]).join("\n")
      : "Benefício 1\nBenefício 2\nBenefício 3",
  );
  const [landingCarouselImages, setLandingCarouselImages] = useState(
    Array.isArray(product.landingConfig?.carouselImages)
      ? (product.landingConfig?.carouselImages as string[]).join("\n")
      : "",
  );
  const [landingTestimonials, setLandingTestimonials] = useState(
    Array.isArray(product.landingConfig?.testimonials)
      ? (product.landingConfig?.testimonials as Array<{ name?: string; text?: string }>)
          .map((item) => `${item.name ?? "Cliente"}|${item.text ?? ""}`)
          .join("\n")
      : "Cliente 1|Depoimento exemplo",
  );
  const [landingFaq, setLandingFaq] = useState(
    Array.isArray(product.landingConfig?.faq)
      ? (product.landingConfig?.faq as Array<{ question?: string; answer?: string }>)
          .map((item) => `${item.question ?? "Pergunta"}|${item.answer ?? ""}`)
          .join("\n")
      : "Funciona para mim?|Sim, conteúdo prático com aplicação no dia a dia.",
  );
  const [landingSections, setLandingSections] = useState(
    Array.isArray(product.landingConfig?.contentSections)
      ? (product.landingConfig?.contentSections as Array<{ title?: string; text?: string }>)
          .map((item) => `${item.title ?? "Seção"}|${item.text ?? ""}`)
          .join("\n")
      : "O que você recebe|Detalhe o conteúdo principal aqui.",
  );
  const landingTemplates = [
    {
      id: "vsl",
      label: "Template VSL",
      headline: `${product.title}: método direto para resultado rápido`,
      subheadline: "Página focada em conversão com vídeo de vendas + prova social + FAQ.",
      bullets: "Aplique ainda hoje\nSem enrolação\nPasso a passo validado",
      sections:
        "Como funciona|Explique aqui a metodologia em 3 passos.\nO que você recebe|Liste o conteúdo entregue no acesso.\nPara quem é|Defina o perfil ideal do cliente.",
    },
    {
      id: "story",
      label: "Template Story",
      headline: "A virada que desbloqueou resultados reais",
      subheadline: "Landing no estilo narrativa: dor, descoberta, método e transformação.",
      bullets: "Identificação imediata\nProva de transformação\nConvite claro para ação",
      sections:
        "O antes|Descreva o cenário de dor do público.\nA descoberta|Apresente a mudança de chave.\nO depois|Mostre os ganhos práticos com o produto.",
    },
    {
      id: "webinar",
      label: "Template Webinar",
      headline: "Aula estratégica + oferta especial ao vivo",
      subheadline: "Página para captura e venda pós-aula com posicionamento premium.",
      bullets: "Conteúdo aplicável\nOferta com urgência\nBônus exclusivos",
      sections:
        "Agenda da aula|Mostre tópicos e promessa de entrega.\nBônus e oferta|Detalhe oferta e gatilhos.\nGarantia|Explique segurança da decisão.",
    },
  ] as const;
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

  function splitLines(value: string) {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function splitPairs(value: string) {
    return splitLines(value)
      .map((line) => {
        const [left, ...rest] = line.split("|");
        const right = rest.join("|");
        return { left: left?.trim() ?? "", right: right?.trim() ?? "" };
      })
      .filter((item) => item.left && item.right);
  }

  function applyTemplate(templateId: (typeof landingTemplates)[number]["id"]) {
    const template = landingTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setLandingHeadline(template.headline);
    setLandingSubheadline(template.subheadline);
    setLandingBullets(template.bullets);
    setLandingSections(template.sections);
    setFeedback(`Template "${template.label}" aplicado.`);
  }

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

  async function saveLanding() {
    setLoading(true);
    setFeedback(null);
    try {
      const testimonials = splitPairs(landingTestimonials).map((item) => ({
        name: item.left,
        text: item.right,
      }));
      const faq = splitPairs(landingFaq).map((item) => ({
        question: item.left,
        answer: item.right,
      }));
      const contentSections = splitPairs(landingSections).map((item) => ({
        title: item.left,
        text: item.right,
      }));

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingEnabled,
          landingSlug: landingSlug.trim(),
          landingConfig: {
            badge: landingBadge.trim(),
            headline: landingHeadline.trim(),
            subheadline: landingSubheadline.trim(),
            description: landingDescription.trim(),
            priceLabel: landingPriceLabel.trim(),
            ctaLabel: landingCtaLabel.trim(),
            ctaUrl: landingCtaUrl.trim(),
            heroVideoUrl: landingHeroVideoUrl.trim(),
            heroImageUrl: landingHeroImageUrl.trim(),
            primaryColor: landingPrimaryColor.trim(),
            secondaryColor: landingSecondaryColor.trim(),
            accentColor: landingAccentColor.trim(),
            themeMode: landingThemeMode,
            animationsEnabled: landingAnimationsEnabled,
            bullets: splitLines(landingBullets),
            carouselImages: splitLines(landingCarouselImages),
            testimonials,
            faq,
            contentSections,
          },
        }),
      });
      if (!response.ok) {
        setFeedback("Falha ao salvar landing page.");
        return;
      }
      setFeedback("Landing page atualizada com sucesso.");
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
        <h2 className="text-lg font-bold">Landing page do produto</h2>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Monte uma página pública dinâmica para esse produto em <code>/lp/{landingSlug || product.slug}</code>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {landingTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold"
            >
              {template.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={landingEnabled} onChange={(event) => setLandingEnabled(event.target.checked)} />
            Landing ativa
          </label>
          <input value={landingSlug} onChange={(e) => setLandingSlug(e.target.value)} placeholder="Slug público da landing" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingBadge} onChange={(e) => setLandingBadge(e.target.value)} placeholder="Badge (ex: Oferta especial)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingPriceLabel} onChange={(e) => setLandingPriceLabel(e.target.value)} placeholder="Texto de preço/oferta" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingHeadline} onChange={(e) => setLandingHeadline(e.target.value)} placeholder="Headline principal" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm md:col-span-2" />
          <input value={landingSubheadline} onChange={(e) => setLandingSubheadline(e.target.value)} placeholder="Subheadline" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm md:col-span-2" />
          <textarea value={landingDescription} onChange={(e) => setLandingDescription(e.target.value)} rows={3} placeholder="Descrição principal" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm md:col-span-2" />
          <input value={landingCtaLabel} onChange={(e) => setLandingCtaLabel(e.target.value)} placeholder="Texto do botão CTA" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingCtaUrl} onChange={(e) => setLandingCtaUrl(e.target.value)} placeholder="URL do checkout/CTA" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingHeroImageUrl} onChange={(e) => setLandingHeroImageUrl(e.target.value)} placeholder="Imagem principal (URL)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingHeroVideoUrl} onChange={(e) => setLandingHeroVideoUrl(e.target.value)} placeholder="Vídeo principal (URL embed)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingPrimaryColor} onChange={(e) => setLandingPrimaryColor(e.target.value)} placeholder="Cor primária (#0d111c)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingSecondaryColor} onChange={(e) => setLandingSecondaryColor(e.target.value)} placeholder="Cor secundária (#f7f6f4)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input value={landingAccentColor} onChange={(e) => setLandingAccentColor(e.target.value)} placeholder="Cor destaque (#ebd1a4)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <select value={landingThemeMode} onChange={(e) => setLandingThemeMode(e.target.value as "light" | "dark")} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
            <option value="light">Tema claro</option>
            <option value="dark">Tema escuro</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={landingAnimationsEnabled} onChange={(e) => setLandingAnimationsEnabled(e.target.checked)} />
            Animações habilitadas
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <textarea value={landingBullets} onChange={(e) => setLandingBullets(e.target.value)} rows={5} placeholder="Bullets (1 por linha)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <textarea value={landingCarouselImages} onChange={(e) => setLandingCarouselImages(e.target.value)} rows={5} placeholder="Carrossel de imagens (1 URL por linha)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <textarea value={landingTestimonials} onChange={(e) => setLandingTestimonials(e.target.value)} rows={5} placeholder="Depoimentos: Nome|Texto (1 por linha)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <textarea value={landingFaq} onChange={(e) => setLandingFaq(e.target.value)} rows={5} placeholder="FAQ: Pergunta|Resposta (1 por linha)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <textarea value={landingSections} onChange={(e) => setLandingSections(e.target.value)} rows={5} placeholder="Seções: Título|Texto (1 por linha)" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm md:col-span-2" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={loading} onClick={saveLanding} className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            Salvar landing
          </button>
          <a
            href={`/lp/${landingSlug || product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--ink)]/30 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Abrir preview público
          </a>
        </div>
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
