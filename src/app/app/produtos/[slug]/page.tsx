import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { EbookHtmlWorkspace } from "@/components/ebook-html-workspace";

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
    include: { product: true },
  });

  if (!purchase) notFound();

  const productModules = await prisma.module.findMany({
    where: { productId: purchase.productId },
    orderBy: { orderIndex: "asc" },
    select: { title: true },
  });

  const modules = productModules.length ? productModules.map((module) => module.title) : FALLBACK_MODULES;

  return <EbookHtmlWorkspace title={purchase.product.title} slug={slug} userEmail={user.email} modules={modules} />;
}
