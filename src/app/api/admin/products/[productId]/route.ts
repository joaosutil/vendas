import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const updateProductSchema = z.object({
  slug: z.string().trim().min(2).max(80).optional(),
  title: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().max(600).optional().nullable(),
  type: z.enum(["EBOOK", "VIDEO_COURSE", "OTHER"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { productId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const payload = parsed.data;
  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? undefined,
      type: payload.type,
      active: payload.active,
    },
    select: { id: true, slug: true, title: true, type: true, active: true, description: true },
  });

  return NextResponse.json({ ok: true, product: updated });
}
