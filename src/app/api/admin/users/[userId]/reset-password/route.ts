import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";
import { createPasswordSetupToken } from "@/lib/password-setup";
import { sendPasswordRecoveryEmail } from "@/lib/email";

export async function POST(_: Request, context: { params: Promise<{ userId: string }> }) {
  const actor = await getCurrentUser();
  if (!actor || !isAdminUser(actor)) return NextResponse.json({ ok: false }, { status: 403 });

  const { userId } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, active: true },
  });

  if (!user) return NextResponse.json({ ok: false, error: "Usuario nao encontrado." }, { status: 404 });
  if (!user.active) return NextResponse.json({ ok: false, error: "Usuario inativo." }, { status: 400 });

  const rawToken = await createPasswordSetupToken(user.id);
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const setupUrl = `${appBaseUrl}/definir-senha?token=${rawToken}`;

  await sendPasswordRecoveryEmail({
    email: user.email,
    name: user.name,
    setupUrl,
  });

  return NextResponse.json({ ok: true });
}
