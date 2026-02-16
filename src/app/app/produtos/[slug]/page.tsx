import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { EbookPdfWorkspace } from "@/components/ebook-pdf-workspace";

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

  return <EbookPdfWorkspace title={purchase.product.title} slug={slug} userEmail={user.email} />;
}
