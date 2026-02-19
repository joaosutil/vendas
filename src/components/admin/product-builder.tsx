"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LandingCanvasBlock = {
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
};

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
  const landingBadge = (product.landingConfig?.badge as string) ?? "Oferta especial";
  const landingHeadline = (product.landingConfig?.headline as string) ?? product.title;
  const landingSubheadline =
    (product.landingConfig?.subheadline as string) ?? "Transforme sua rotina com um método direto e aplicável.";
  const landingDescription =
    (product.landingConfig?.description as string) ??
    (product.description ?? "Conteúdo prático, direto e pensado para gerar resultado rápido.");
  const landingPriceLabel = (product.landingConfig?.priceLabel as string) ?? "Condição especial hoje";
  const landingCtaLabel = (product.landingConfig?.ctaLabel as string) ?? "Quero liberar meu acesso agora";
  const landingCtaUrl = (product.landingConfig?.ctaUrl as string) ?? "https://pay.cakto.com.br/";
  const landingHeroVideoUrl = (product.landingConfig?.heroVideoUrl as string) ?? "";
  const landingHeroImageUrl = (product.landingConfig?.heroImageUrl as string) ?? "/ebook-cover-art.png";
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
  const landingBullets = (
    Array.isArray(product.landingConfig?.bullets)
      ? (product.landingConfig?.bullets as string[]).join("\n")
      : "Benefício 1\nBenefício 2\nBenefício 3"
  );
  const [landingCarouselImages, setLandingCarouselImages] = useState(
    Array.isArray(product.landingConfig?.carouselImages)
      ? (product.landingConfig?.carouselImages as string[]).join("\n")
      : "",
  );
  const landingTestimonials = (
    Array.isArray(product.landingConfig?.testimonials)
      ? (product.landingConfig?.testimonials as Array<{ name?: string; text?: string }>)
          .map((item) => `${item.name ?? "Cliente"}|${item.text ?? ""}`)
          .join("\n")
      : "Cliente 1|Depoimento exemplo"
  );
  const landingFaq = (
    Array.isArray(product.landingConfig?.faq)
      ? (product.landingConfig?.faq as Array<{ question?: string; answer?: string }>)
          .map((item) => `${item.question ?? "Pergunta"}|${item.answer ?? ""}`)
          .join("\n")
      : "Funciona para mim?|Sim, conteúdo prático com aplicação no dia a dia."
  );
  const [landingSections, setLandingSections] = useState(
    Array.isArray(product.landingConfig?.contentSections)
      ? (product.landingConfig?.contentSections as Array<{ title?: string; text?: string }>)
          .map((item) => `${item.title ?? "Seção"}|${item.text ?? ""}`)
          .join("\n")
      : "O que você recebe|Detalhe o conteúdo principal aqui.",
  );
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);
  const [landingBlocks, setLandingBlocks] = useState<LandingCanvasBlock[]>(() => {
    const existingBlocks = Array.isArray((product.landingConfig as Record<string, unknown> | null)?.blocks)
      ? ((product.landingConfig as Record<string, unknown>).blocks as Array<Record<string, unknown>>)
      : [];

    const validTypes: LandingCanvasBlock["type"][] = [
      "hero",
      "text",
      "image",
      "video",
      "button",
      "carousel",
      "benefits",
      "faq",
      "input",
    ];

    const fromStored = existingBlocks
      .map((block, index) => {
        const maybeType = String(block.type ?? "");
        const type = validTypes.includes(maybeType as LandingCanvasBlock["type"])
          ? (maybeType as LandingCanvasBlock["type"])
          : "text";
        return {
          id: String(block.id ?? `canvas-${index}-${crypto.randomUUID()}`),
          type,
          title: String(block.title ?? ""),
          text: String(block.text ?? ""),
          imageUrl: String(block.imageUrl ?? ""),
          videoUrl: String(block.videoUrl ?? ""),
          buttonLabel: String(block.buttonLabel ?? ""),
          buttonUrl: String(block.buttonUrl ?? ""),
          placeholder: String(block.placeholder ?? ""),
          items: Array.isArray(block.items)
            ? (block.items as unknown[]).map((item) => String(item ?? "").trim()).filter(Boolean)
            : [],
          backgroundColor: String(block.backgroundColor ?? ""),
          textColor: String(block.textColor ?? ""),
          animation: (["none", "fade", "slide-up", "zoom"].includes(String(block.animation))
            ? String(block.animation)
            : "fade") as LandingCanvasBlock["animation"],
        } satisfies LandingCanvasBlock;
      })
      .filter((block) => block.title || block.text || block.imageUrl || block.videoUrl || block.buttonLabel || block.items.length > 0);

    if (fromStored.length > 0) return fromStored;

    return [
      {
        id: `hero-${crypto.randomUUID()}`,
        type: "hero",
        title: landingHeadline,
        text: landingSubheadline,
        imageUrl: landingHeroImageUrl,
        videoUrl: landingHeroVideoUrl,
        buttonLabel: "",
        buttonUrl: "",
        placeholder: "",
        items: [],
        backgroundColor: landingSecondaryColor,
        textColor: "",
        animation: "fade",
      },
      {
        id: `cta-${crypto.randomUUID()}`,
        type: "button",
        title: "",
        text: "",
        imageUrl: "",
        videoUrl: "",
        buttonLabel: landingCtaLabel,
        buttonUrl: landingCtaUrl,
        placeholder: "",
        items: [],
        backgroundColor: landingPrimaryColor,
        textColor: "#ffffff",
        animation: "zoom",
      },
      {
        id: `benefits-${crypto.randomUUID()}`,
        type: "benefits",
        title: "Benefícios",
        text: "",
        imageUrl: "",
        videoUrl: "",
        buttonLabel: "",
        buttonUrl: "",
        placeholder: "",
        items: splitLines(landingBullets),
        backgroundColor: "",
        textColor: "",
        animation: "fade",
      },
      {
        id: `carousel-${crypto.randomUUID()}`,
        type: "carousel",
        title: "Galeria",
        text: "",
        imageUrl: "",
        videoUrl: "",
        buttonLabel: "",
        buttonUrl: "",
        placeholder: "",
        items: splitLines(landingCarouselImages),
        backgroundColor: "",
        textColor: "",
        animation: "slide-up",
      },
    ];
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const landingTemplates = [
    {
      id: "vsl",
      label: "Template VSL",
      blocks: [
        { type: "hero", title: `${product.title}: método direto para resultado rápido`, text: "Página focada em conversão com vídeo de vendas + prova social + FAQ." },
        { type: "benefits", title: "O que você vai conquistar", items: ["Aplique ainda hoje", "Sem enrolação", "Passo a passo validado"] },
        { type: "text", title: "Como funciona", text: "Explique aqui a metodologia em 3 passos." },
        { type: "button", buttonLabel: "Quero liberar meu acesso agora", buttonUrl: "https://pay.cakto.com.br/" },
      ],
    },
    {
      id: "story",
      label: "Template Story",
      blocks: [
        { type: "hero", title: "A virada que desbloqueou resultados reais", text: "Landing no estilo narrativa: dor, descoberta, método e transformação." },
        { type: "text", title: "O antes", text: "Descreva o cenário de dor do público." },
        { type: "text", title: "A descoberta", text: "Apresente a mudança de chave." },
        { type: "text", title: "O depois", text: "Mostre os ganhos práticos com o produto." },
        { type: "button", buttonLabel: "Quero viver essa transformação", buttonUrl: "https://pay.cakto.com.br/" },
      ],
    },
    {
      id: "webinar",
      label: "Template Webinar",
      blocks: [
        { type: "hero", title: "Aula estratégica + oferta especial ao vivo", text: "Página para captura e venda pós-aula com posicionamento premium." },
        { type: "video", title: "Assista ao vídeo da aula", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { type: "benefits", title: "O que você recebe", items: ["Conteúdo aplicável", "Oferta com urgência", "Bônus exclusivos"] },
        { type: "button", buttonLabel: "Garantir condição da aula", buttonUrl: "https://pay.cakto.com.br/" },
      ],
    },
  ] as const;
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonDraft, setLessonDraft] = useState<Record<string, { title: string; videoUrl: string; description: string }>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedBlock = landingBlocks.find((block) => block.id === selectedBlockId) ?? landingBlocks[0] ?? null;

  useEffect(() => {
    if (!landingBlocks.length) {
      if (selectedBlockId !== null) setSelectedBlockId(null);
      return;
    }
    if (!selectedBlockId) {
      setSelectedBlockId(landingBlocks[0].id);
      return;
    }
    if (!landingBlocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(landingBlocks[0].id);
    }
  }, [landingBlocks, selectedBlockId]);

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

  function syncSectionsFromBlocks(blocks: LandingCanvasBlock[]) {
    const serialized = blocks
      .filter((block) => block.type === "text" || block.type === "benefits" || block.type === "faq")
      .map((block) => `${block.title}|${block.text}${block.imageUrl ? `|${block.imageUrl}` : ""}`)
      .join("\n");
    setLandingSections(serialized);
  }

  function updateBlock(
    blockId: string,
    key:
      | "title"
      | "text"
      | "type"
      | "videoUrl"
      | "buttonLabel"
      | "buttonUrl"
      | "placeholder"
      | "backgroundColor"
      | "textColor"
      | "animation",
    value: string,
  ) {
    setLandingBlocks((prev) => {
      const next = prev.map((block) => (block.id === blockId ? { ...block, [key]: value } : block));
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function updateBlockItems(blockId: string, value: string) {
    setLandingBlocks((prev) => {
      const next = prev.map((block) =>
        block.id === blockId ? { ...block, items: splitLines(value) } : block,
      );
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function updateBlockImage(blockId: string, imageUrl: string) {
    setLandingBlocks((prev) => {
      const next = prev.map((block) => (block.id === blockId ? { ...block, imageUrl } : block));
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function addBlock(type: LandingCanvasBlock["type"]) {
    setLandingBlocks((prev) => {
      const next: LandingCanvasBlock[] = [
        ...prev,
        {
          id: `block-${crypto.randomUUID()}`,
          type,
          title:
            type === "hero"
              ? "Novo Hero"
              : type === "benefits"
              ? "Lista de benefícios"
              : type === "faq"
              ? "Pergunta frequente"
              : type === "carousel"
              ? "Carrossel"
              : type === "button"
              ? "Botão CTA"
              : type === "input"
              ? "Formulário"
              : "Novo bloco",
          text: type === "button" ? "" : "Descreva aqui...",
          imageUrl: "",
          videoUrl: "",
          buttonLabel: type === "button" ? "Clique aqui" : "",
          buttonUrl: "",
          placeholder: type === "input" ? "Digite seu e-mail" : "",
          items: type === "benefits" ? ["Item 1", "Item 2"] : [],
          backgroundColor: "",
          textColor: "",
          animation: "fade",
        },
      ];
      setSelectedBlockId(next[next.length - 1]?.id ?? null);
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function removeBlock(blockId: string) {
    setLandingBlocks((prev) => {
      const next = prev.filter((block) => block.id !== blockId);
      if (selectedBlockId === blockId) {
        setSelectedBlockId(next[0]?.id ?? null);
      }
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function moveBlockUp(blockId: string) {
    setLandingBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === blockId);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function moveBlockDown(blockId: string) {
    setLandingBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === blockId);
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      syncSectionsFromBlocks(next);
      return next;
    });
  }

  function onDropBlock(targetId: string) {
    if (!draggingBlockId || draggingBlockId === targetId) return;
    setLandingBlocks((prev) => {
      const from = prev.findIndex((block) => block.id === draggingBlockId);
      const to = prev.findIndex((block) => block.id === targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      syncSectionsFromBlocks(next);
      return next;
    });
    setDraggingBlockId(null);
    setSelectedBlockId(targetId);
  }

  function applyTemplate(templateId: (typeof landingTemplates)[number]["id"]) {
    const template = landingTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const blocks: LandingCanvasBlock[] = template.blocks.map((block, index) => {
      const raw = block as Partial<LandingCanvasBlock> & { type: LandingCanvasBlock["type"] };
      return {
      id: `tpl-${template.id}-${index}`,
      type: raw.type,
      title: raw.title ?? "",
      text: raw.text ?? "",
      imageUrl: "",
      videoUrl: raw.videoUrl ?? "",
      buttonLabel: raw.buttonLabel ?? "",
      buttonUrl: raw.buttonUrl ?? "",
      placeholder: "",
      items: Array.from(raw.items ?? []),
      backgroundColor: "",
      textColor: "",
      animation: "fade",
    };
    });
    setLandingBlocks(blocks);
    setSelectedBlockId(blocks[0]?.id ?? null);
    setFeedback(`Template "${template.label}" aplicado.`);
  }

  async function uploadLandingAsset(blockId: string, file: File) {
    setUploadingBlockId(blockId);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch(`/api/admin/products/${product.id}/landing-assets`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (!response.ok || !data.ok || !data.url) {
        setFeedback(data.error ?? "Falha ao enviar imagem.");
        return;
      }
      updateBlockImage(blockId, data.url);
      setFeedback("Imagem enviada para a seção.");
    } catch {
      setFeedback("Falha ao enviar imagem.");
    } finally {
      setUploadingBlockId(null);
    }
  }

  async function uploadCarouselAsset(file: File) {
    setUploadingCarousel(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch(`/api/admin/products/${product.id}/landing-assets`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (!response.ok || !data.ok || !data.url) {
        setFeedback(data.error ?? "Falha ao enviar imagem para carrossel.");
        return;
      }
      const carouselTarget = selectedBlock?.type === "carousel" ? selectedBlock.id : null;
      if (carouselTarget) {
        setLandingBlocks((prev) =>
          prev.map((block) =>
            block.id === carouselTarget ? { ...block, items: [...block.items, data.url as string] } : block,
          ),
        );
      } else {
        setLandingCarouselImages((prev) => `${prev.trim() ? `${prev.trim()}\n` : ""}${data.url}`);
      }
      setFeedback("Imagem adicionada ao carrossel.");
    } catch {
      setFeedback("Falha ao enviar imagem para carrossel.");
    } finally {
      setUploadingCarousel(false);
    }
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
      const heroBlock = landingBlocks.find((block) => block.type === "hero");
      const buttonBlock = landingBlocks.find((block) => block.type === "button");
      const videoBlock = landingBlocks.find((block) => block.type === "video");
      const carouselBlock = landingBlocks.find((block) => block.type === "carousel");
      const benefitsBlock = landingBlocks.find((block) => block.type === "benefits");
      const faqBlocks = landingBlocks.filter((block) => block.type === "faq");
      const textBlocks = landingBlocks.filter((block) => block.type === "text" || block.type === "benefits");

      const testimonials = splitPairs(landingTestimonials).map((item) => ({
        name: item.left,
        text: item.right,
      }));
      const faq = faqBlocks.length
        ? faqBlocks
            .filter((block) => block.title.trim() && block.text.trim())
            .map((block) => ({
              question: block.title.trim(),
              answer: block.text.trim(),
            }))
        : splitPairs(landingFaq).map((item) => ({
            question: item.left,
            answer: item.right,
          }));
      const contentSections =
        landingBlocks.length > 0
          ? landingBlocks.map((block) => ({
              title: block.title.trim(),
              text: block.text.trim(),
              type:
                block.type === "benefits"
                  ? "benefit"
                  : block.type === "faq"
                  ? "faq"
                  : "section",
              imageUrl: block.imageUrl.trim() || null,
            }))
          : splitPairs(landingSections).map((item) => ({
              title: item.left,
              text: item.right,
              type: "section",
              imageUrl: null,
            }));

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingEnabled,
          landingSlug: landingSlug.trim(),
          landingConfig: {
            badge: landingBadge.trim() || "Oferta especial",
            headline: heroBlock?.title.trim() || landingHeadline.trim(),
            subheadline: heroBlock?.text.trim() || landingSubheadline.trim(),
            description:
              textBlocks[0]?.text.trim() ||
              landingDescription.trim(),
            priceLabel: landingPriceLabel.trim(),
            ctaLabel: buttonBlock?.buttonLabel.trim() || landingCtaLabel.trim(),
            ctaUrl: buttonBlock?.buttonUrl.trim() || landingCtaUrl.trim(),
            heroVideoUrl: heroBlock?.videoUrl.trim() || videoBlock?.videoUrl.trim() || landingHeroVideoUrl.trim(),
            heroImageUrl: heroBlock?.imageUrl.trim() || landingHeroImageUrl.trim(),
            primaryColor: landingPrimaryColor.trim(),
            secondaryColor: landingSecondaryColor.trim(),
            accentColor: landingAccentColor.trim(),
            themeMode: landingThemeMode,
            animationsEnabled: landingAnimationsEnabled,
            bullets: benefitsBlock?.items.length ? benefitsBlock.items : splitLines(landingBullets),
            carouselImages: carouselBlock?.items.length ? carouselBlock.items : splitLines(landingCarouselImages),
            testimonials,
            faq,
            contentSections,
            blocks: landingBlocks.map((block) => ({
              id: block.id,
              type: block.type,
              title: block.title.trim(),
              text: block.text.trim(),
              imageUrl: block.imageUrl.trim(),
              videoUrl: block.videoUrl.trim(),
              buttonLabel: block.buttonLabel.trim(),
              buttonUrl: block.buttonUrl.trim(),
              placeholder: block.placeholder.trim(),
              items: block.items,
              backgroundColor: block.backgroundColor.trim(),
              textColor: block.textColor.trim(),
              animation: block.animation,
            })),
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Landing Builder Canvas</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={landingEnabled} onChange={(event) => setLandingEnabled(event.target.checked)} />
              Landing ativa
            </label>
            <input value={landingSlug} onChange={(event) => setLandingSlug(event.target.value)} placeholder="slug-da-landing" className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
            <button type="button" disabled={loading} onClick={saveLanding} className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Salvar</button>
            <a href={`/lp/${landingSlug || product.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--ink)]/30 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">Preview</a>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {landingTemplates.map((template) => (
            <button key={template.id} type="button" onClick={() => applyTemplate(template.id)} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">{template.label}</button>
          ))}
          <button type="button" onClick={() => addBlock("hero")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Hero</button>
          <button type="button" onClick={() => addBlock("text")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Texto</button>
          <button type="button" onClick={() => addBlock("image")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Imagem</button>
          <button type="button" onClick={() => addBlock("video")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Vídeo</button>
          <button type="button" onClick={() => addBlock("button")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Botão</button>
          <button type="button" onClick={() => addBlock("carousel")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Carrossel</button>
          <button type="button" onClick={() => addBlock("benefits")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Benefícios</button>
          <button type="button" onClick={() => addBlock("faq")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ FAQ</button>
          <button type="button" onClick={() => addBlock("input")} className="rounded-md border border-[var(--ink)]/25 bg-white px-3 py-1 text-xs font-semibold">+ Input</button>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-[240px_1fr_340px]">
          <aside className="rounded-lg border border-[var(--dourado)]/35 bg-[var(--creme)]/55 p-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Camadas</p>
            <div className="mt-2 max-h-[40rem] space-y-2 overflow-y-auto pr-1">
              {landingBlocks.map((block, index) => (
                <button key={block.id} type="button" draggable onDragStart={() => setDraggingBlockId(block.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => onDropBlock(block.id)} onClick={() => setSelectedBlockId(block.id)} className={`w-full rounded-md border px-2 py-2 text-left text-xs ${selectedBlock?.id === block.id ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--dourado)]/40 bg-white text-[var(--carvao)]"}`}>
                  <p className="font-semibold">#{index + 1} {block.title || "Sem título"}</p>
                  <p className="opacity-80">{block.type}</p>
                </button>
              ))}
            </div>
          </aside>
          <div className="rounded-lg border border-[var(--dourado)]/35 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Palco (drag and drop)</p>
            <div className="mt-2 max-h-[40rem] space-y-3 overflow-y-auto rounded-md border border-[var(--dourado)]/30 bg-[var(--creme)]/45 p-3">
              {landingBlocks.map((block, index) => (
                <article key={`stage-${block.id}`} draggable onDragStart={() => setDraggingBlockId(block.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => onDropBlock(block.id)} onClick={() => setSelectedBlockId(block.id)} className={`cursor-pointer rounded-lg border p-3 transition ${selectedBlock?.id === block.id ? "border-[var(--ink)] bg-white shadow-sm" : "border-[var(--dourado)]/35 bg-white/95"}`} style={{ backgroundColor: block.backgroundColor || undefined, color: block.textColor || undefined }}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">{block.title || `Bloco ${index + 1}`}</p>
                    <span className="rounded-full border border-[var(--ink)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase">{block.type}</span>
                  </div>
                  {block.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.imageUrl} alt={block.title || "Imagem"} className="mb-2 h-28 w-full rounded object-cover" />
                  ) : null}
                  {block.videoUrl ? <p className="mb-1 text-[11px] opacity-80">Vídeo: {block.videoUrl}</p> : null}
                  {block.items.length ? (<ul className="mb-1 list-disc pl-4 text-xs">{block.items.slice(0, 3).map((item, idx) => <li key={`${block.id}-item-${idx}`}>{item}</li>)}</ul>) : null}
                  {block.text ? <p className="text-xs">{block.text}</p> : null}
                  {block.buttonLabel ? <p className="mt-1 text-xs font-semibold">Botão: {block.buttonLabel}</p> : null}
                </article>
              ))}
            </div>
          </div>
          <aside className="rounded-lg border border-[var(--dourado)]/35 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Inspector</p>
            {selectedBlock ? (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveBlockUp(selectedBlock.id)} className="rounded border border-[var(--ink)]/25 bg-white px-2 py-1 text-[11px] font-semibold">↑</button>
                  <button type="button" onClick={() => moveBlockDown(selectedBlock.id)} className="rounded border border-[var(--ink)]/25 bg-white px-2 py-1 text-[11px] font-semibold">↓</button>
                  <button type="button" onClick={() => removeBlock(selectedBlock.id)} className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">Excluir</button>
                </div>
                <select value={selectedBlock.type} onChange={(event) => updateBlock(selectedBlock.id, "type", event.target.value)} className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"><option value="hero">Hero</option><option value="text">Texto</option><option value="image">Imagem</option><option value="video">Vídeo</option><option value="button">Botão</option><option value="carousel">Carrossel</option><option value="benefits">Benefícios</option><option value="faq">FAQ</option><option value="input">Input</option></select>
                <input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, "title", event.target.value)} placeholder="Título" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <textarea value={selectedBlock.text} onChange={(event) => updateBlock(selectedBlock.id, "text", event.target.value)} placeholder="Texto" rows={3} className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <input value={selectedBlock.imageUrl} onChange={(event) => updateBlockImage(selectedBlock.id, event.target.value)} placeholder="URL da imagem" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-[var(--ink)]/25 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]">{uploadingBlockId === selectedBlock.id ? "Enviando imagem..." : "Upload imagem"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploadingBlockId === selectedBlock.id} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void uploadLandingAsset(selectedBlock.id, file); event.currentTarget.value = ""; }} /></label>
                <input value={selectedBlock.videoUrl} onChange={(event) => updateBlock(selectedBlock.id, "videoUrl", event.target.value)} placeholder="URL do vídeo (embed)" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <input value={selectedBlock.buttonLabel} onChange={(event) => updateBlock(selectedBlock.id, "buttonLabel", event.target.value)} placeholder="Texto do botão" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <input value={selectedBlock.buttonUrl} onChange={(event) => updateBlock(selectedBlock.id, "buttonUrl", event.target.value)} placeholder="URL do botão" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <input value={selectedBlock.placeholder} onChange={(event) => updateBlock(selectedBlock.id, "placeholder", event.target.value)} placeholder="Placeholder do input" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <textarea value={selectedBlock.items.join("\n")} onChange={(event) => updateBlockItems(selectedBlock.id, event.target.value)} rows={4} placeholder="Itens (1 por linha): benefícios, FAQs ou imagens do carrossel" className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-[var(--ink)]/25 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]">{uploadingCarousel ? "Enviando para itens..." : "Upload para itens/carrossel"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploadingCarousel} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void uploadCarouselAsset(file); event.currentTarget.value = ""; }} /></label>
                <div className="grid grid-cols-2 gap-2"><input value={selectedBlock.backgroundColor} onChange={(event) => updateBlock(selectedBlock.id, "backgroundColor", event.target.value)} placeholder="Cor de fundo" className="rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" /><input value={selectedBlock.textColor} onChange={(event) => updateBlock(selectedBlock.id, "textColor", event.target.value)} placeholder="Cor de texto" className="rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" /></div>
                <select value={selectedBlock.animation} onChange={(event) => updateBlock(selectedBlock.id, "animation", event.target.value)} className="w-full rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"><option value="none">Sem animação</option><option value="fade">Fade</option><option value="slide-up">Slide up</option><option value="zoom">Zoom</option></select>
              </div>
            ) : (<p className="mt-2 text-xs text-[var(--carvao)]/70">Selecione um bloco para editar.</p>)}
            <div className="mt-3 rounded-md border border-[var(--dourado)]/35 bg-[var(--creme)]/50 p-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Estilo global da página</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input value={landingPrimaryColor} onChange={(e) => setLandingPrimaryColor(e.target.value)} placeholder="Cor primária" className="rounded-md border border-[var(--dourado)]/45 bg-white px-2 py-1.5 text-xs" />
                <input value={landingSecondaryColor} onChange={(e) => setLandingSecondaryColor(e.target.value)} placeholder="Cor secundária" className="rounded-md border border-[var(--dourado)]/45 bg-white px-2 py-1.5 text-xs" />
                <input value={landingAccentColor} onChange={(e) => setLandingAccentColor(e.target.value)} placeholder="Cor destaque" className="rounded-md border border-[var(--dourado)]/45 bg-white px-2 py-1.5 text-xs" />
                <select value={landingThemeMode} onChange={(e) => setLandingThemeMode(e.target.value as "light" | "dark")} className="rounded-md border border-[var(--dourado)]/45 bg-white px-2 py-1.5 text-xs"><option value="light">Tema claro</option><option value="dark">Tema escuro</option></select>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={landingAnimationsEnabled} onChange={(e) => setLandingAnimationsEnabled(e.target.checked)} />Animações ativas</label>
            </div>
          </aside>
        </div>
      </section>      <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
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

