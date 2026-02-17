import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashSetupToken } from "@/lib/password-setup";
import { setSessionCookie } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-base-url";

export async function POST(request: Request) {
  const appBaseUrl = getAppBaseUrl(request);
  const formData = await request.formData();
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");

  if (!token || password.length < 8) {
    return NextResponse.redirect(new URL("/definir-senha?error=invalid", appBaseUrl));
  }

  const tokenHash = hashSetupToken(token);
  const setup = await prisma.passwordSetupToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!setup || setup.usedAt || setup.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/definir-senha?error=expired", appBaseUrl));
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: setup.userId },
      data: { passwordHash },
    }),
    prisma.passwordSetupToken.update({
      where: { id: setup.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await setSessionCookie({ userId: setup.user.id, email: setup.user.email });
  return NextResponse.redirect(new URL("/app", appBaseUrl));
}
