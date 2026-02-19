import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductBuilder } from "@/components/admin/product-builder";

type ProductAdminPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductAdminPage({ params }: ProductAdminPageProps) {
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      ebookAsset: true,
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!product) notFound();

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <Link href="/admin" className="text-sm font-semibold text-[var(--ink)] underline underline-offset-2">
          Voltar ao admin
        </Link>
        <h1 className="mt-2 text-3xl font-black">{product.title}</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Configure o formato do produto e monte a área de membros direto pelo painel.
        </p>
      </div>

      <ProductBuilder
        product={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description,
          type: product.type,
          active: product.active,
          landingSlug: product.landingSlug ?? product.slug,
          landingEnabled: product.landingEnabled,
          landingConfig: (product.landingConfig as Record<string, unknown> | null) ?? null,
          ebookAsset: product.ebookAsset
            ? {
                fileName: product.ebookAsset.fileName,
                filePath: product.ebookAsset.filePath,
              }
            : null,
          modules: product.modules.map((module) => ({
            id: module.id,
            title: module.title,
            orderIndex: module.orderIndex,
            lessons: module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              videoUrl: lesson.contentUrl ?? "",
              description: lesson.description ?? "",
              orderIndex: lesson.orderIndex,
            })),
          })),
        }}
      />
    </section>
  );
}
