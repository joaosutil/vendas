import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const createProductSchema = z.object({
  slug: z.string().trim().min(2).max(80),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  type: z.enum(["EBOOK", "VIDEO_COURSE", "OTHER"]).optional(),
  caktoProductId: z.string().trim().max(120).optional().or(z.literal("")),
  offerCheckoutUrl: z.string().url().optional().or(z.literal("")),
  caktoOfferId: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ebookAsset: { select: { id: true, fileName: true, filePath: true } },
      modules: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          lessons: { select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      type: product.type,
      active: product.active,
      createdAt: product.createdAt,
      ebookAsset: product.ebookAsset,
      modulesCount: product.modules.length,
      lessonsCount: product.modules.reduce((acc, module) => acc + module.lessons.length, 0),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const payload = parsed.data;
  const product = await prisma.product.create({
    data: {
      slug: payload.slug,
      title: payload.title,
      description: payload.description || null,
      type: payload.type ?? "EBOOK",
      caktoProductId: payload.caktoProductId || null,
    },
  });

  if (payload.offerCheckoutUrl && payload.caktoOfferId) {
    await prisma.offer.create({
      data: {
        productId: product.id,
        checkoutUrl: payload.offerCheckoutUrl,
        caktoOfferId: payload.caktoOfferId,
      },
    });
  }

  return NextResponse.json({ ok: true, productId: product.id, productSlug: product.slug });
}
