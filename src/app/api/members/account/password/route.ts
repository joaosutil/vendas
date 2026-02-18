import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { hashPassword, verifyPassword } from "@/lib/password";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8).max(120),
    confirmPassword: z.string().min(8).max(120),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirmação diferente da nova senha",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, passwordHash: true },
  });

  if (!dbUser?.passwordHash) {
    return NextResponse.json({ ok: false, error: "Usuário sem senha definida" }, { status: 400 });
  }

  const validCurrent = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!validCurrent) {
    return NextResponse.json({ ok: false, error: "Senha atual inválida" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
