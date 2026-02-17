import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { EbookHtmlWorkspace } from "@/components/ebook-html-workspace";
import { EbookPdfWorkspace } from "@/components/ebook-pdf-workspace";
import { VideoCourseWorkspace } from "@/components/video-course-workspace";

const FALLBACK_MODULES = [
  "Módulo 1: Entendendo o ciclo da ansiedade (sem enrolação)",
  "Módulo 2: Técnicas rápidas para momentos de pico",
  "Módulo 3: Como quebrar o excesso de pensamento (ruminação)",
  "Módulo 4: Rotina mental: foco, sono e organização",
  "Módulo 5: Plano de 7 dias (aplicação guiada)",
  "Módulo 6: Manutenção: como não voltar pro zero",
];

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const user = await requireUser();

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      product: { slug },
    },
    include: { product: { include: { ebookAsset: true } } },
  });

  if (!purchase) notFound();

  const productModules = await prisma.module.findMany({
    where: { productId: purchase.productId },
    orderBy: { orderIndex: "asc" },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true, contentUrl: true },
      },
    },
  });

  if (purchase.product.type === "VIDEO_COURSE") {
    return (
      <VideoCourseWorkspace
        title={purchase.product.title}
        description={purchase.product.description}
        modules={productModules.map((module) => ({
          id: module.id,
          title: module.title,
          lessons: module.lessons
            .filter((lesson) => lesson.contentUrl)
            .map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              videoUrl: lesson.contentUrl as string,
            })),
        }))}
      />
    );
  }

  if (purchase.product.type === "EBOOK") {
    if (slug === "ansiedade") {
      const modules = productModules.length ? productModules.map((module) => module.title) : FALLBACK_MODULES;
      return <EbookHtmlWorkspace title={purchase.product.title} slug={slug} userEmail={user.email} modules={modules} />;
    }
    return <EbookPdfWorkspace title={purchase.product.title} slug={slug} userEmail={user.email} />;
  }

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-5">
      <h1 className="text-3xl font-black">{purchase.product.title}</h1>
      <p className="mt-2 text-sm text-[var(--carvao)]/80">
        {purchase.product.description || "Conteúdo disponível em breve neste formato."}
      </p>
      <p className="mt-3 text-xs text-[var(--carvao)]/70">
        Tipo: {purchase.product.type}. Este formato terá uma experiência dedicada na próxima iteração.
      </p>
    </section>
  );
}
