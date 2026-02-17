import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getAppBaseUrl } from "@/lib/app-base-url";

export async function POST(request: Request) {
  const appBaseUrl = getAppBaseUrl(request);
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.redirect(new URL("/login?error=credenciais", appBaseUrl));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=credenciais", appBaseUrl));
  }

  await setSessionCookie({ userId: user.id, email: user.email });
  return NextResponse.redirect(new URL("/app", appBaseUrl));
}
