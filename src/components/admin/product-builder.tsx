"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type LandingCanvasAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "flip"
  | "pop";

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
  animation: LandingCanvasAnimation;
};

const BLOCK_TYPE_LABEL: Record<LandingCanvasBlock["type"], string> = {
  hero: "Hero",
  text: "Texto",
  image: "Imagem",
  video: "Video",
  button: "Botao",
  carousel: "Carrossel",
  benefits: "Beneficios",
  faq: "FAQ",
  input: "Input",
};

const BLOCK_LIBRARY: Array<{ type: LandingCanvasBlock["type"]; label: string; helper: string }> = [
  { type: "hero", label: "Hero", helper: "Abertura forte com headline, midia e CTA." },
  { type: "text", label: "Texto", helper: "Sessao para explicacao, historia ou prova." },
  { type: "image", label: "Imagem", helper: "Imagem grande para destaque visual." },
  { type: "video", label: "Video", helper: "Embed de VSL, aula ou demonstracao." },
  { type: "button", label: "Botao", helper: "Bloco de CTA isolado para conversao." },
  { type: "carousel", label: "Carrossel", helper: "Galeria de capturas, provas e resultados." },
  { type: "benefits", label: "Beneficios", helper: "Lista objetiva do que o cliente recebe." },
  { type: "faq", label: "FAQ", helper: "Quebra de objecoes e perguntas frequentes." },
  { type: "input", label: "Input", helper: "Captura de lead para lista de espera." },
];

const ANIMATION_OPTIONS: Array<{ value: LandingCanvasAnimation; label: string; helper: string }> = [
  { value: "none", label: "Sem animacao", helper: "Render estatico e direto." },
  { value: "fade", label: "Fade", helper: "Entrada suave por opacidade." },
  { value: "slide-up", label: "Slide up", helper: "Sobe com leve deslocamento." },
  { value: "slide-left", label: "Slide left", helper: "Entra vindo da direita." },
  { value: "slide-right", label: "Slide right", helper: "Entra vindo da esquerda." },
  { value: "zoom", label: "Zoom", helper: "Aproxima com escala controlada." },
  { value: "flip", label: "Flip", helper: "Rotacao 3D para destaque premium." },
  { value: "pop", label: "Pop", helper: "Pequeno bounce no final da entrada." },
];

const LANDING_HISTORY_LIMIT = 80;

function cloneLandingBlocks(blocks: LandingCanvasBlock[]) {
  return blocks.map((block) => ({
    ...block,
    items: [...block.items],
  }));
}

function areLandingBlocksEqual(left: LandingCanvasBlock[] | undefined, right: LandingCanvasBlock[]) {
  if (!left) return false;
  return JSON.stringify(left) === JSON.stringify(right);
}

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
          animation: (
            ["none", "fade", "slide-up", "slide-left", "slide-right", "zoom", "flip", "pop"].includes(
              String(block.animation),
            )
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
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [layerSearch, setLayerSearch] = useState("");
  const [readerTheme, setReaderTheme] = useState<"light" | "dark" | "reading">("light");
  const [templateNicheFilter, setTemplateNicheFilter] = useState("all");
  const [stageGridEnabled, setStageGridEnabled] = useState(true);
  const [stageSnapEnabled, setStageSnapEnabled] = useState(true);
  const [stageGridSize, setStageGridSize] = useState(24);

  const historyRef = useRef<LandingCanvasBlock[][]>([]);
  const historyIndexRef = useRef(-1);
  const skipHistorySyncRef = useRef(false);
  const [historyCursor, setHistoryCursor] = useState({ index: 0, total: 1 });

  const landingTemplates = useMemo(
    () =>
      [
        {
          id: "vsl",
          label: "Template VSL",
          niche: "infoproduto",
          blocks: [
            { type: "hero", title: `${product.title}: metodo direto para resultado rapido`, text: "Pagina focada em conversao com video de vendas + prova social + FAQ." },
            { type: "benefits", title: "O que voce vai conquistar", items: ["Aplique ainda hoje", "Sem enrolacao", "Passo a passo validado"] },
            { type: "text", title: "Como funciona", text: "Explique aqui a metodologia em 3 passos." },
            { type: "button", buttonLabel: "Quero liberar meu acesso agora", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "story",
          label: "Template Story",
          niche: "infoproduto",
          blocks: [
            { type: "hero", title: "A virada que desbloqueou resultados reais", text: "Landing no estilo narrativa: dor, descoberta, metodo e transformacao." },
            { type: "text", title: "O antes", text: "Descreva o cenario de dor do publico." },
            { type: "text", title: "A descoberta", text: "Apresente a mudanca de chave." },
            { type: "text", title: "O depois", text: "Mostre os ganhos praticos com o produto." },
            { type: "button", buttonLabel: "Quero viver essa transformacao", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "webinar",
          label: "Template Webinar",
          niche: "evento",
          blocks: [
            { type: "hero", title: "Aula estrategica + oferta especial ao vivo", text: "Pagina para captura e venda pos-aula com posicionamento premium." },
            { type: "video", title: "Assista ao video da aula", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
            { type: "benefits", title: "O que voce recebe", items: ["Conteudo aplicavel", "Oferta com urgencia", "Bonus exclusivos"] },
            { type: "button", buttonLabel: "Garantir condicao da aula", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "consultoria",
          label: "Template Consultoria",
          niche: "servicos",
          blocks: [
            { type: "hero", title: "Consultoria premium para acelerar seu crescimento", text: "Posicionamento de autoridade, diagnostico e plano de acao em alta conversao." },
            { type: "text", title: "Para quem e", text: "Empresarios e lideres que precisam de estrategia com execucao." },
            { type: "benefits", title: "Entregaveis da consultoria", items: ["Diagnostico completo", "Plano de 90 dias", "Mentoria 1:1"] },
            { type: "faq", title: "Tem garantia?", text: "Sim. Garantia condicional com compromisso de execucao." },
            { type: "button", buttonLabel: "Quero aplicar para consultoria", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "saas",
          label: "Template SaaS",
          niche: "saas",
          blocks: [
            { type: "hero", title: "A plataforma que centraliza sua operacao", text: "Demonstre valor em minutos com onboarding rapido e provas de eficiencia." },
            { type: "carousel", title: "Telas do produto", items: ["/ebook-cover-art.png"] },
            { type: "benefits", title: "Por que equipes escolhem esta plataforma", items: ["Automacao de tarefas", "Dashboard em tempo real", "Integracoes prontas"] },
            { type: "button", buttonLabel: "Comecar teste gratis", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "ecommerce",
          label: "Template Ecommerce",
          niche: "ecommerce",
          blocks: [
            { type: "hero", title: "Oferta limitada com entrega rapida", text: "Landing para catalogo enxuto, prova visual e CTA direto para compra." },
            { type: "image", title: "Produto em destaque", text: "Mostre detalhes e acabamento do produto." },
            { type: "benefits", title: "Por que comprar hoje", items: ["Frete agilizado", "Estoque limitado", "Garantia estendida"] },
            { type: "button", buttonLabel: "Comprar agora", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
        {
          id: "captura",
          label: "Template Captura Lead",
          niche: "captacao",
          blocks: [
            { type: "hero", title: "Receba o material exclusivo agora", text: "Pagina objetiva para captura de lead e nutricao automatizada." },
            { type: "input", title: "Cadastre seu melhor e-mail", text: "Enviaremos o acesso imediatamente." },
            { type: "benefits", title: "Voce recebe", items: ["Checklist pratico", "Aula bonus", "Plano de implementacao"] },
          ],
        },
        {
          id: "local-business",
          label: "Template Negocio Local",
          niche: "negocio-local",
          blocks: [
            { type: "hero", title: "Atendimento premium na sua cidade", text: "Apresente autoridade local com prova social e agenda simplificada." },
            { type: "text", title: "Onde estamos", text: "Inclua bairro, horario e diferenciais de atendimento." },
            { type: "faq", title: "Como funciona o agendamento?", text: "Escolha o melhor horario e confirme em poucos cliques." },
            { type: "button", buttonLabel: "Agendar agora", buttonUrl: "https://pay.cakto.com.br/" },
          ],
        },
      ] as const,
    [product.title],
  );

  const availableTemplateNiches = useMemo(
    () => ["all", ...Array.from(new Set(landingTemplates.map((template) => template.niche)))],
    [landingTemplates],
  );
  const visibleTemplates = useMemo(
    () =>
      templateNicheFilter === "all"
        ? landingTemplates
        : landingTemplates.filter((template) => template.niche === templateNicheFilter),
    [landingTemplates, templateNicheFilter],
  );
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonDraft, setLessonDraft] = useState<Record<string, { title: string; videoUrl: string; description: string }>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedBlock = landingBlocks.find((block) => block.id === selectedBlockId) ?? landingBlocks[0] ?? null;

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = () => {
      const current = root.getAttribute("data-reader-theme");
      if (current === "dark" || current === "reading" || current === "light") {
        setReaderTheme(current);
      } else {
        setReaderTheme("light");
      }
    };
    readTheme();

    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-reader-theme"] });

    return () => observer.disconnect();
  }, []);

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

  const builderIsDark = landingThemeMode === "dark" || readerTheme === "dark";

  const filteredBlocks = useMemo(() => {
    const query = layerSearch.trim().toLowerCase();
    if (!query) return landingBlocks;
    return landingBlocks.filter((block) => {
      const haystack = `${block.title} ${block.text} ${block.type} ${block.buttonLabel}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [landingBlocks, layerSearch]);

  const canUndo = historyCursor.index > 0;
  const canRedo = historyCursor.index < historyCursor.total - 1;

  const stageGridStyle = useMemo(() => {
    if (!stageGridEnabled) return undefined;
    const lineColor = builderIsDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.08)";
    return {
      backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
      backgroundSize: `${stageGridSize}px ${stageGridSize}px`,
    };
  }, [builderIsDark, stageGridEnabled, stageGridSize]);

  useEffect(() => {
    const snapshot = cloneLandingBlocks(landingBlocks);
    if (historyIndexRef.current === -1) {
      historyRef.current = [snapshot];
      historyIndexRef.current = 0;
      setHistoryCursor({ index: 0, total: 1 });
      return;
    }
    if (skipHistorySyncRef.current) {
      skipHistorySyncRef.current = false;
      setHistoryCursor({ index: historyIndexRef.current, total: historyRef.current.length });
      return;
    }
    const current = historyRef.current[historyIndexRef.current];
    if (areLandingBlocksEqual(current, snapshot)) return;

    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(snapshot);
    if (nextHistory.length > LANDING_HISTORY_LIMIT) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistoryCursor({ index: historyIndexRef.current, total: historyRef.current.length });
  }, [landingBlocks]);

  useEffect(() => {
    function applyHistoryAt(index: number) {
      const snapshot = cloneLandingBlocks(historyRef.current[index] ?? []);
      skipHistorySyncRef.current = true;
      setLandingBlocks(snapshot);
      const serialized = snapshot
        .filter((block) => block.type === "text" || block.type === "benefits" || block.type === "faq")
        .map((block) => `${block.title}|${block.text}${block.imageUrl ? `|${block.imageUrl}` : ""}`)
        .join("\n");
      setLandingSections(serialized);
      setSelectedBlockId((prev) => (snapshot.some((block) => block.id === prev) ? prev : (snapshot[0]?.id ?? null)));
      setHistoryCursor({ index: historyIndexRef.current, total: historyRef.current.length });
    }

    function onKeyDown(event: KeyboardEvent) {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (!isModifierPressed) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || Boolean(target?.isContentEditable);
      if (isTypingTarget) return;

      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          if (historyIndexRef.current >= historyRef.current.length - 1) return;
          historyIndexRef.current += 1;
          applyHistoryAt(historyIndexRef.current);
        } else {
          if (historyIndexRef.current <= 0) return;
          historyIndexRef.current -= 1;
          applyHistoryAt(historyIndexRef.current);
        }
        return;
      }
      if (key === "y") {
        event.preventDefault();
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        applyHistoryAt(historyIndexRef.current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  function undoLandingBlocks() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = cloneLandingBlocks(historyRef.current[historyIndexRef.current] ?? []);
    skipHistorySyncRef.current = true;
    setLandingBlocks(snapshot);
    syncSectionsFromBlocks(snapshot);
    setSelectedBlockId((prev) => (snapshot.some((block) => block.id === prev) ? prev : (snapshot[0]?.id ?? null)));
    setHistoryCursor({ index: historyIndexRef.current, total: historyRef.current.length });
  }

  function redoLandingBlocks() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = cloneLandingBlocks(historyRef.current[historyIndexRef.current] ?? []);
    skipHistorySyncRef.current = true;
    setLandingBlocks(snapshot);
    syncSectionsFromBlocks(snapshot);
    setSelectedBlockId((prev) => (snapshot.some((block) => block.id === prev) ? prev : (snapshot[0]?.id ?? null)));
    setHistoryCursor({ index: historyIndexRef.current, total: historyRef.current.length });
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

  function duplicateBlock(blockId: string) {
    setLandingBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === blockId);
      if (index < 0) return prev;
      const source = prev[index];
      const clone: LandingCanvasBlock = {
        ...source,
        id: `block-${crypto.randomUUID()}`,
        title: source.title ? `${source.title} (copia)` : source.title,
        items: [...source.items],
      };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      setSelectedBlockId(clone.id);
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
    if (!draggingBlockId || draggingBlockId === targetId) {
      setDragOverBlockId(null);
      return;
    }
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
    setDragOverBlockId(null);
    setSelectedBlockId(targetId);
  }

  function applyTemplate(templateId: (typeof landingTemplates)[number]["id"]) {
    const template = landingTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const blocks: LandingCanvasBlock[] = template.blocks.map((block, index) => {
      const raw = block as Partial<LandingCanvasBlock> & { type: LandingCanvasBlock["type"] };
      return {
        id: `tpl-${template.id}-${index}-${crypto.randomUUID().slice(0, 6)}`,
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

      <section
        className={`overflow-hidden rounded-3xl border shadow-[0_20px_70px_rgba(10,20,45,0.16)] backdrop-blur ${
          builderIsDark ? "border-slate-600/65 bg-slate-950/85" : "border-white/70 bg-white/80"
        }`}
      >
        <div
          className={`p-4 md:p-5 ${
            builderIsDark
              ? "bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.22),transparent_40%),linear-gradient(130deg,#0b1220,#0f172a,#111827)] text-slate-100"
              : "bg-[radial-gradient(circle_at_10%_15%,rgba(255,203,115,0.28),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(243,246,255,0.94),rgba(255,255,255,0.98))] text-[var(--carvao)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Landing Builder Canvas</h2>
              <p className={`text-xs md:text-sm ${builderIsDark ? "text-slate-300/85" : "text-[var(--carvao)]/75"}`}>
                Fluxo tipo Canva com camadas arrastaveis, palco interativo e inspector dinamico.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span
                className={`rounded-full border px-3 py-1 font-semibold ${
                  builderIsDark ? "border-slate-500/60 bg-slate-900/40 text-slate-100" : "border-[var(--ink)]/20 bg-white/70"
                }`}
              >
                {landingBlocks.length} blocos
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-semibold ${
                  builderIsDark ? "border-slate-500/60 bg-slate-900/40 text-slate-100" : "border-[var(--ink)]/20 bg-white/70"
                }`}
              >
                {landingAnimationsEnabled ? "Animacoes ON" : "Animacoes OFF"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                builderIsDark ? "border-slate-500/60 bg-slate-900/40 text-slate-100" : "border-[var(--dourado)]/45 bg-white/90"
              }`}
            >
              <input type="checkbox" checked={landingEnabled} onChange={(event) => setLandingEnabled(event.target.checked)} />
              Landing ativa
            </label>
            <input
              value={landingSlug}
              onChange={(event) => setLandingSlug(event.target.value)}
              placeholder="slug-da-landing"
              className={`min-w-[220px] flex-1 rounded-xl border px-3 py-2 text-sm ${
                builderIsDark ? "border-slate-500/60 bg-slate-950/60 text-slate-100" : "border-[var(--dourado)]/45 bg-white"
              }`}
            />
            <button
              type="button"
              disabled={loading}
              onClick={saveLanding}
              className="rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              Salvar
            </button>
            <a
              href={`/lp/${landingSlug || product.slug}`}
              target="_blank"
              rel="noreferrer"
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                builderIsDark ? "border-slate-500/70 bg-slate-900/55 text-slate-100" : "border-[var(--ink)]/30 bg-white text-[var(--ink)]"
              }`}
            >
              Preview
            </a>
            <button
              type="button"
              onClick={undoLandingBlocks}
              disabled={!canUndo}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                builderIsDark ? "border-slate-500/70 bg-slate-900/55 text-slate-100" : "border-[var(--ink)]/30 bg-white text-[var(--ink)]"
              }`}
            >
              Desfazer
            </button>
            <button
              type="button"
              onClick={redoLandingBlocks}
              disabled={!canRedo}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                builderIsDark ? "border-slate-500/70 bg-slate-900/55 text-slate-100" : "border-[var(--ink)]/30 bg-white text-[var(--ink)]"
              }`}
            >
              Refazer
            </button>
          </div>
          <p className={`mt-2 text-[11px] ${builderIsDark ? "text-slate-300/80" : "text-[var(--carvao)]/65"}`}>
            Atalhos: `Ctrl/Cmd + Z` desfaz, `Ctrl/Cmd + Shift + Z` ou `Ctrl/Cmd + Y` refaz.
          </p>
        </div>

        <div className={`border-t px-4 py-4 md:px-5 ${builderIsDark ? "border-slate-600/45 bg-slate-950/60 text-slate-100" : "border-white/60 bg-white/75"}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/80" : "text-[var(--carvao)]/65"}`}>Templates rapidos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableTemplateNiches.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setTemplateNicheFilter(niche)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${
                  templateNicheFilter === niche
                    ? "border-sky-400/80 bg-sky-500/20 text-sky-100"
                    : builderIsDark
                    ? "border-slate-500/65 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70"
                    : "border-[var(--ink)]/25 bg-white text-[var(--carvao)] hover:bg-[var(--creme)]/75"
                }`}
              >
                {niche === "all" ? "Todos" : niche}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  builderIsDark ? "border-slate-500/65 bg-slate-900/60 hover:bg-slate-800/70" : "border-[var(--ink)]/25 bg-white hover:bg-[var(--creme)]/70"
                }`}
              >
                {template.label} <span className="opacity-70">({template.niche})</span>
              </button>
            ))}
          </div>

          <p className={`mt-4 text-[11px] font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/80" : "text-[var(--carvao)]/65"}`}>Biblioteca de blocos</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {BLOCK_LIBRARY.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => addBlock(item.type)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  builderIsDark ? "border-slate-600/65 bg-slate-900/60 hover:bg-slate-800/70" : "border-[var(--ink)]/18 bg-white hover:bg-[var(--creme)]/65"
                }`}
              >
                <p className="text-sm font-bold">+ {item.label}</p>
                <p className={`mt-1 text-[11px] ${builderIsDark ? "text-slate-300/85" : "text-[var(--carvao)]/75"}`}>{item.helper}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 border-t border-white/60 p-4 md:p-5 xl:grid-cols-[280px_1fr_380px]">
          <aside
            className={`rounded-2xl border p-3 ${
              builderIsDark ? "border-slate-600/60 bg-slate-950/70 text-slate-100" : "border-[var(--dourado)]/35 bg-[var(--creme)]/55"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/85" : "text-[var(--carvao)]/70"}`}>Camadas</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${builderIsDark ? "bg-slate-800/70 text-slate-200" : "bg-white text-[var(--carvao)]/75"}`}>
                Drag and drop
              </span>
            </div>
            <input
              value={layerSearch}
              onChange={(event) => setLayerSearch(event.target.value)}
              placeholder="Buscar bloco..."
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-xs ${
                builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"
              }`}
            />
            <div className="mt-2 max-h-[42rem] space-y-2 overflow-y-auto pr-1">
              {filteredBlocks.length === 0 ? (
                <p className={`rounded-lg border border-dashed px-3 py-4 text-center text-xs ${builderIsDark ? "border-slate-600/70 text-slate-300/75" : "border-[var(--dourado)]/35 text-[var(--carvao)]/70"}`}>
                  Nenhuma camada encontrada.
                </p>
              ) : (
                filteredBlocks.map((block, index) => {
                  const realIndex = landingBlocks.findIndex((item) => item.id === block.id);
                  return (
                    <button
                      key={block.id}
                      type="button"
                      draggable
                      onDragStart={() => {
                        setDraggingBlockId(block.id);
                        setDragOverBlockId(null);
                      }}
                      onDragEnter={() => setDragOverBlockId(block.id)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingBlockId(null);
                        setDragOverBlockId(null);
                      }}
                      onDrop={() => onDropBlock(block.id)}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`w-full rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                        selectedBlock?.id === block.id
                          ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow"
                          : builderIsDark
                          ? "border-slate-600/65 bg-slate-900/70 text-slate-100 hover:bg-slate-800/75"
                          : "border-[var(--dourado)]/40 bg-white text-[var(--carvao)] hover:bg-[var(--creme)]/65"
                      } ${dragOverBlockId === block.id && draggingBlockId !== block.id ? "ring-2 ring-sky-400/75" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">#{realIndex + 1 || index + 1}</p>
                        <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] uppercase">{BLOCK_TYPE_LABEL[block.type]}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] opacity-90">{block.title || "Sem titulo"}</p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
          <div
            className={`rounded-2xl border p-3 ${
              builderIsDark ? "border-slate-600/60 bg-[linear-gradient(140deg,#0b1220,#111827,#0f172a)] text-slate-100" : "border-[var(--dourado)]/35 bg-white"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/80" : "text-[var(--carvao)]/70"}`}>Palco visual</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStageGridEnabled((prev) => !prev)}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    stageGridEnabled
                      ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                      : builderIsDark
                      ? "border-slate-500/70 bg-slate-900/70 text-slate-300"
                      : "border-[var(--ink)]/25 bg-white text-[var(--carvao)]"
                  }`}
                >
                  Grid {stageGridEnabled ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  onClick={() => setStageSnapEnabled((prev) => !prev)}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    stageSnapEnabled
                      ? "border-sky-400/70 bg-sky-500/20 text-sky-100"
                      : builderIsDark
                      ? "border-slate-500/70 bg-slate-900/70 text-slate-300"
                      : "border-[var(--ink)]/25 bg-white text-[var(--carvao)]"
                  }`}
                >
                  Snap {stageSnapEnabled ? "ON" : "OFF"}
                </button>
                <label className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${builderIsDark ? "border-slate-500/70 bg-slate-900/70 text-slate-200" : "border-[var(--ink)]/25 bg-white text-[var(--carvao)]"}`}>
                  Grid
                  <input
                    type="range"
                    min={12}
                    max={48}
                    step={4}
                    value={stageGridSize}
                    onChange={(event) => setStageGridSize(Number(event.target.value))}
                    className="h-3 w-14 accent-sky-500"
                  />
                </label>
              </div>
            </div>
            <div
              className={`max-h-[42rem] space-y-3 overflow-y-auto rounded-xl border p-3 ${
                builderIsDark ? "border-slate-600/65 bg-slate-950/45" : "border-[var(--dourado)]/30 bg-[var(--creme)]/45"
              } ${stageSnapEnabled ? "snap-y snap-proximity" : ""}`}
              style={stageGridStyle}
            >
              {landingBlocks.map((block, index) => (
                <article
                  key={`stage-${block.id}`}
                  draggable
                  onDragStart={() => {
                    setDraggingBlockId(block.id);
                    setDragOverBlockId(null);
                  }}
                  onDragEnter={() => setDragOverBlockId(block.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDragEnd={() => {
                    setDraggingBlockId(null);
                    setDragOverBlockId(null);
                  }}
                  onDrop={() => onDropBlock(block.id)}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${stageSnapEnabled ? "snap-start" : ""} ${
                    selectedBlock?.id === block.id
                      ? "border-sky-400/85 shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_12px_30px_rgba(2,6,23,0.24)]"
                      : builderIsDark
                      ? "border-slate-600/65 hover:border-slate-400/70 hover:bg-slate-900/55"
                      : "border-[var(--dourado)]/35 hover:border-[var(--ink)]/35 hover:bg-white"
                  } ${dragOverBlockId === block.id && draggingBlockId !== block.id ? "ring-2 ring-sky-400/70" : ""}`}
                  style={{
                    backgroundColor: builderIsDark ? "rgba(15,23,42,0.78)" : block.backgroundColor || "rgba(255,255,255,0.95)",
                    color: builderIsDark ? block.textColor || "#e2e8f0" : block.textColor || undefined,
                    boxShadow: builderIsDark && block.backgroundColor ? `inset 4px 0 0 ${block.backgroundColor}` : undefined,
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold">{block.title || `Bloco ${index + 1}`}</p>
                      <p className="text-[11px] opacity-80">{ANIMATION_OPTIONS.find((item) => item.value === block.animation)?.label ?? "Fade"}</p>
                    </div>
                    <span className="rounded-full border border-current/30 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {BLOCK_TYPE_LABEL[block.type]}
                    </span>
                  </div>
                  {block.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.imageUrl} alt={block.title || "Imagem"} className="mb-2 h-32 w-full rounded-xl border border-white/20 object-cover" />
                  ) : null}
                  {block.videoUrl ? <p className="mb-1 line-clamp-1 text-[11px] opacity-80">Video: {block.videoUrl}</p> : null}
                  {block.items.length ? (
                    <ul className="mb-1 list-disc space-y-1 pl-4 text-xs">
                      {block.items.slice(0, 3).map((item, idx) => (
                        <li key={`${block.id}-item-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {block.text ? <p className="line-clamp-3 text-xs opacity-90">{block.text}</p> : null}
                  {block.buttonLabel ? <p className="mt-2 text-xs font-semibold">CTA: {block.buttonLabel}</p> : null}
                </article>
              ))}
            </div>
          </div>
          <aside
            className={`rounded-2xl border p-3 ${
              builderIsDark ? "border-slate-600/60 bg-slate-950/70 text-slate-100" : "border-[var(--dourado)]/35 bg-white"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/85" : "text-[var(--carvao)]/70"}`}>Inspector</p>
            {selectedBlock ? (
              <div className="mt-2 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => moveBlockUp(selectedBlock.id)} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${builderIsDark ? "border-slate-500/70 bg-slate-900/65" : "border-[var(--ink)]/25 bg-white"}`}>Subir</button>
                  <button type="button" onClick={() => moveBlockDown(selectedBlock.id)} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${builderIsDark ? "border-slate-500/70 bg-slate-900/65" : "border-[var(--ink)]/25 bg-white"}`}>Descer</button>
                  <button type="button" onClick={() => duplicateBlock(selectedBlock.id)} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${builderIsDark ? "border-slate-500/70 bg-slate-900/65" : "border-[var(--ink)]/25 bg-white"}`}>Duplicar</button>
                  <button type="button" onClick={() => removeBlock(selectedBlock.id)} className="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">Excluir</button>
                </div>

                <select
                  value={selectedBlock.type}
                  onChange={(event) => updateBlock(selectedBlock.id, "type", event.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`}
                >
                  {BLOCK_LIBRARY.map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, "title", event.target.value)} placeholder="Titulo" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <textarea value={selectedBlock.text} onChange={(event) => updateBlock(selectedBlock.id, "text", event.target.value)} placeholder="Texto" rows={3} className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={selectedBlock.imageUrl} onChange={(event) => updateBlockImage(selectedBlock.id, event.target.value)} placeholder="URL da imagem" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />

                <label className={`inline-flex w-full cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold ${builderIsDark ? "border-slate-500/65 bg-slate-900/70 text-slate-100" : "border-[var(--ink)]/25 bg-white text-[var(--ink)]"}`}>
                  {uploadingBlockId === selectedBlock.id ? "Enviando imagem..." : "Upload imagem"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={uploadingBlockId === selectedBlock.id}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void uploadLandingAsset(selectedBlock.id, file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>

                <input value={selectedBlock.videoUrl} onChange={(event) => updateBlock(selectedBlock.id, "videoUrl", event.target.value)} placeholder="URL do video (embed)" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={selectedBlock.buttonLabel} onChange={(event) => updateBlock(selectedBlock.id, "buttonLabel", event.target.value)} placeholder="Texto do botao" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={selectedBlock.buttonUrl} onChange={(event) => updateBlock(selectedBlock.id, "buttonUrl", event.target.value)} placeholder="URL do botao" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={selectedBlock.placeholder} onChange={(event) => updateBlock(selectedBlock.id, "placeholder", event.target.value)} placeholder="Placeholder do input" className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />

                <textarea
                  value={selectedBlock.items.join("\n")}
                  onChange={(event) => updateBlockItems(selectedBlock.id, event.target.value)}
                  rows={4}
                  placeholder="Itens (1 por linha): beneficios, FAQ ou imagens"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`}
                />

                <label className={`inline-flex w-full cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold ${builderIsDark ? "border-slate-500/65 bg-slate-900/70 text-slate-100" : "border-[var(--ink)]/25 bg-white text-[var(--ink)]"}`}>
                  {uploadingCarousel ? "Enviando para itens..." : "Upload para itens/carrossel"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={uploadingCarousel}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void uploadCarouselAsset(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input value={selectedBlock.backgroundColor} onChange={(event) => updateBlock(selectedBlock.id, "backgroundColor", event.target.value)} placeholder="Cor de fundo" className={`rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                  <input value={selectedBlock.textColor} onChange={(event) => updateBlock(selectedBlock.id, "textColor", event.target.value)} placeholder="Cor de texto" className={`rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                </div>

                <select
                  value={selectedBlock.animation}
                  onChange={(event) => updateBlock(selectedBlock.id, "animation", event.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`}
                >
                  {ANIMATION_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className={`text-[11px] ${builderIsDark ? "text-slate-300/75" : "text-[var(--carvao)]/65"}`}>
                  {ANIMATION_OPTIONS.find((item) => item.value === selectedBlock.animation)?.helper}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-[var(--carvao)]/70">Selecione um bloco para editar.</p>
            )}

            <div className={`mt-3 rounded-xl border p-2.5 ${builderIsDark ? "border-slate-600/65 bg-slate-900/60" : "border-[var(--dourado)]/35 bg-[var(--creme)]/50"}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${builderIsDark ? "text-slate-300/85" : "text-[var(--carvao)]/70"}`}>Estilo global da pagina</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input value={landingPrimaryColor} onChange={(e) => setLandingPrimaryColor(e.target.value)} placeholder="Cor primaria" className={`rounded-lg border px-2.5 py-1.5 text-xs ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={landingSecondaryColor} onChange={(e) => setLandingSecondaryColor(e.target.value)} placeholder="Cor secundaria" className={`rounded-lg border px-2.5 py-1.5 text-xs ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <input value={landingAccentColor} onChange={(e) => setLandingAccentColor(e.target.value)} placeholder="Cor destaque" className={`rounded-lg border px-2.5 py-1.5 text-xs ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`} />
                <select value={landingThemeMode} onChange={(e) => setLandingThemeMode(e.target.value as "light" | "dark")} className={`rounded-lg border px-2.5 py-1.5 text-xs ${builderIsDark ? "border-slate-500/60 bg-slate-900/70 text-slate-100" : "border-[var(--dourado)]/45 bg-white"}`}>
                  <option value="light">Tema claro</option>
                  <option value="dark">Tema escuro</option>
                </select>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs">
                <input type="checkbox" checked={landingAnimationsEnabled} onChange={(e) => setLandingAnimationsEnabled(e.target.checked)} />
                Animacoes ativas
              </label>
            </div>
          </aside>
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

