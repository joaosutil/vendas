import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const createModuleSchema = z.object({
  title: z.string().trim().min(3).max(180),
});

export async function POST(request: Request, context: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { productId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createModuleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const lastModule = await prisma.module.findFirst({
    where: { productId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const createdModule = await prisma.module.create({
    data: {
      productId,
      title: parsed.data.title,
      orderIndex: (lastModule?.orderIndex ?? -1) + 1,
    },
    select: { id: true, title: true, orderIndex: true },
  });

  return NextResponse.json({ ok: true, module: createdModule });
}
