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
      primaryColor={asString(config.primaryColor, "#0d111c")}
      secondaryColor={asString(config.secondaryColor, "#f7f6f4")}
      accentColor={asString(config.accentColor, "#ebd1a4")}
      themeMode={asString(config.themeMode, "light") === "dark" ? "dark" : "light"}
      animationsEnabled={Boolean(config.animationsEnabled ?? true)}
    />
  );
}
