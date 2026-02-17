import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordSetupToken } from "@/lib/password-setup";
import { sendPasswordRecoveryEmail } from "@/lib/email";
import { getAppBaseUrl } from "@/lib/app-base-url";

export async function POST(request: Request) {
  const appBaseUrl = getAppBaseUrl(request);
  const formData = await request.formData();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL("/esqueci-senha?status=sent", appBaseUrl), 303);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, active: true },
  });

  if (user && user.active) {
    const rawToken = await createPasswordSetupToken(user.id);
    const setupUrl = `${appBaseUrl}/definir-senha?token=${rawToken}`;
    await sendPasswordRecoveryEmail({
      email: user.email,
      name: user.name,
      setupUrl,
    });
  }

  return NextResponse.redirect(new URL("/esqueci-senha?status=sent", appBaseUrl), 303);
}
