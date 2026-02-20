import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductLandingPage } from "@/components/landing/product-landing-page";

type LandingRouteProps = {
  params: Promise<{ slug: string }>;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asPairArray(value: unknown, leftKey: string, rightKey: string) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const left = asString(record[leftKey]);
      const right = asString(record[rightKey]);
      if (!left || !right) return null;
      return leftKey === "name" ? { name: left, text: right } : { question: left, answer: right };
    })
    .filter(Boolean) as Array<{ name: string; text: string }> | Array<{ question: string; answer: string }>;
}

export default async function DynamicLandingPage({ params }: LandingRouteProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ landingSlug: slug }, { slug }],
      active: true,
      landingEnabled: true,
    },
    select: {
      slug: true,
      title: true,
      description: true,
      landingConfig: true,
    },
  });

  if (!product) notFound();
  const config = (product.landingConfig as Record<string, unknown> | null) ?? {};

  return (
    <ProductLandingPage
      title={product.title}
      badge={asString(config.badge, "Oferta especial")}
      headline={asString(config.headline, product.title)}
      subheadline={asString(config.subheadline, "Transforme sua rotina com uma metodologia prática.")}
      description={asString(config.description, product.description ?? "Conteúdo exclusivo com acesso imediato.")}
      priceLabel={asString(config.priceLabel, "Condição especial por tempo limitado")}
      ctaLabel={asString(config.ctaLabel, "Quero meu acesso agora")}
      ctaUrl={asString(config.ctaUrl, "/login")}
      heroVideoUrl={asString(config.heroVideoUrl)}
      heroImageUrl={asString(config.heroImageUrl, "/ebook-cover-art.png")}
      bullets={asStringArray(config.bullets, ["Benefício 1", "Benefício 2", "Benefício 3"])}
      carouselImages={asStringArray(config.carouselImages)}
      testimonials={asPairArray(config.testimonials, "name", "text") as Array<{ name: string; text: string }>}
      faq={asPairArray(config.faq, "question", "answer") as Array<{ question: string; answer: string }>}
      contentSections={
        Array.isArray(config.contentSections)
          ? (config.contentSections
              .map((item) => {
                if (!item || typeof item !== "object") return null;
                const record = item as Record<string, unknown>;
                const title = asString(record.title);
                const text = asString(record.text);
                if (!title || !text) return null;
                const rawType = asString(record.type);
                const type =
                  rawType === "benefit" || rawType === "faq" || rawType === "section"
                    ? (rawType as "section" | "benefit" | "faq")
                    : undefined;
                const imageUrl = asString(record.imageUrl) || null;
                return { title, text, type, imageUrl };
              })
              .filter(Boolean) as Array<{
                title: string;
                text: string;
                type?: "section" | "benefit" | "faq";
                imageUrl?: string | null;
              }>)
          : []
      }
      blocks={
        Array.isArray(config.blocks)
          ? (config.blocks
              .map((item, index) => {
                if (!item || typeof item !== "object") return null;
                const record = item as Record<string, unknown>;
                const typeRaw = asString(record.type);
                const validTypes = ["hero", "text", "image", "video", "button", "carousel", "benefits", "faq", "input"];
                if (!validTypes.includes(typeRaw)) return null;
                const items = Array.isArray(record.items)
                  ? (record.items as unknown[]).map((entry) => asString(entry)).filter(Boolean)
                  : [];
                return {
                  id: asString(record.id, `block-${index}`),
                  type: typeRaw as "hero" | "text" | "image" | "video" | "button" | "carousel" | "benefits" | "faq" | "input",
                  title: asString(record.title),
                  text: asString(record.text),
                  imageUrl: asString(record.imageUrl),
                  videoUrl: asString(record.videoUrl),
                  buttonLabel: asString(record.buttonLabel),
                  buttonUrl: asString(record.buttonUrl),
                  placeholder: asString(record.placeholder),
                  items,
                  backgroundColor: asString(record.backgroundColor),
                  textColor: asString(record.textColor),
                  animation: (
                    ["none", "fade", "slide-up", "slide-left", "slide-right", "zoom", "flip", "pop", "blur-in", "rotate-in", "float-in"].includes(
                      asString(record.animation),
                    )
                    ? asString(record.animation)
                    : "fade") as "none" | "fade" | "slide-up" | "slide-left" | "slide-right" | "zoom" | "flip" | "pop" | "blur-in" | "rotate-in" | "float-in",
                  animationDuration: asNumber(record.animationDuration, 0.45),
                  animationDelay: asNumber(record.animationDelay, 0),
                  texture: (["none", "grid", "dots", "diagonal", "noise"].includes(asString(record.texture)) ? asString(record.texture) : "none") as "none" | "grid" | "dots" | "diagonal" | "noise",
                  textureOpacity: asNumber(record.textureOpacity, 16),
                  widthMode: (["full", "wide", "normal", "narrow"].includes(asString(record.widthMode)) ? asString(record.widthMode) : "normal") as "full" | "wide" | "normal" | "narrow",
                  paddingX: asNumber(record.paddingX, 24),
                  paddingY: asNumber(record.paddingY, 24),
                  radius: asNumber(record.radius, 24),
                  shadow: (["none", "soft", "medium", "hard"].includes(asString(record.shadow)) ? asString(record.shadow) : "soft") as "none" | "soft" | "medium" | "hard",
                  textAlign: (["left", "center", "right"].includes(asString(record.textAlign)) ? asString(record.textAlign) : "left") as "left" | "center" | "right",
                  titleSize: asNumber(record.titleSize, 44),
                  textSize: asNumber(record.textSize, 16),
                  mediaFit: (["cover", "contain"].includes(asString(record.mediaFit)) ? asString(record.mediaFit) : "cover") as "cover" | "contain",
                  mediaHeightDesktop: asNumber(record.mediaHeightDesktop, 420),
                  mediaHeightMobile: asNumber(record.mediaHeightMobile, 240),
                  carouselAutoplay: Boolean(record.carouselAutoplay ?? true),
                  carouselIntervalMs: asNumber(record.carouselIntervalMs, 4200),
                };
              })
              .filter(Boolean) as Array<{
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
                animation: "none" | "fade" | "slide-up" | "slide-left" | "slide-right" | "zoom" | "flip" | "pop" | "blur-in" | "rotate-in" | "float-in";
                animationDuration: number;
                animationDelay: number;
                texture: "none" | "grid" | "dots" | "diagonal" | "noise";
                textureOpacity: number;
                widthMode: "full" | "wide" | "normal" | "narrow";
                paddingX: number;
                paddingY: number;
                radius: number;
                shadow: "none" | "soft" | "medium" | "hard";
                textAlign: "left" | "center" | "right";
                titleSize: number;
                textSize: number;
                mediaFit: "cover" | "contain";
                mediaHeightDesktop: number;
                mediaHeightMobile: number;
                carouselAutoplay: boolean;
                carouselIntervalMs: number;
              }>)
          : []
      }
      primaryColor={asString(config.primaryColor, "#0d111c")}
      secondaryColor={asString(config.secondaryColor, "#f7f6f4")}
      accentColor={asString(config.accentColor, "#ebd1a4")}
      themeMode={asString(config.themeMode, "light") === "dark" ? "dark" : "light"}
      animationsEnabled={Boolean(config.animationsEnabled ?? true)}
    />
  );
}
