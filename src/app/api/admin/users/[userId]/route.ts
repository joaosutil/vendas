import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const updateUserSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const actor = await getCurrentUser();
  if (!actor || !isAdminUser(actor)) return NextResponse.json({ ok: false }, { status: 403 });

  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  if (actor.id === userId && parsed.data.active === false) {
    return NextResponse.json({ ok: false, error: "Voce nao pode inativar a propria conta." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      active: parsed.data.active,
      role: parsed.data.role,
    },
    select: { id: true, email: true, role: true, active: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(_: Request, context: { params: Promise<{ userId: string }> }) {
  const actor = await getCurrentUser();
  if (!actor || !isAdminUser(actor)) return NextResponse.json({ ok: false }, { status: 403 });

  const { userId } = await context.params;
  if (actor.id === userId) {
    return NextResponse.json({ ok: false, error: "Voce nao pode excluir a propria conta." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
