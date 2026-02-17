import { prisma } from "@/lib/prisma";

export async function getEbookFilePathBySlug(slug: string) {
  if (slug === "ansiedade" || slug.includes("ansiedade")) {
    return process.env.ANSIEDADE_PDF_FILE_PATH || "assets/ansiedade.pdf";
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { ebookAsset: { select: { filePath: true } } },
  });

  return product?.ebookAsset?.filePath ?? null;
}
