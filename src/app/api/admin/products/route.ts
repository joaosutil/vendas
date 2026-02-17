import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const createProductSchema = z.object({
  slug: z.string().trim().min(2).max(80),
  title: z.string().trim().min(3).max(180),
  caktoProductId: z.string().trim().max(120).optional().or(z.literal("")),
  offerCheckoutUrl: z.string().url().optional().or(z.literal("")),
  caktoOfferId: z.string().trim().max(120).optional().or(z.literal("")),
});

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

  return NextResponse.json({ ok: true, productId: product.id });
}
