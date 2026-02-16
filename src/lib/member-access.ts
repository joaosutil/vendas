import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireMemberProductAccess(slug: string) {
  const session = await getSession();
  if (!session) return null;

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: session.userId,
      status: "ACTIVE",
      product: { slug },
    },
    include: { product: true },
  });

  if (!purchase) return null;

  return {
    userId: session.userId,
    userEmail: session.email,
    productId: purchase.productId,
    productSlug: purchase.product.slug,
  };
}
