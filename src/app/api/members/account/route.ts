import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const updateAccountSchema = z.object({
  name: z.string().trim().max(120).optional(),
  avatarUrl: z.string().trim().max(700).optional().or(z.literal("")),
  alertsEnabled: z.boolean().optional(),
});

function isValidAvatarUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/uploads/avatars/")) return true;
  if (value.startsWith("/api/members/account/avatar/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      alertsEnabled: true,
    },
  });

  return NextResponse.json({ ok: true, account });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
  }

  const avatarUrl = (parsed.data.avatarUrl ?? "").trim();
  if (!isValidAvatarUrl(avatarUrl)) {
    return NextResponse.json({ ok: false, error: "URL de avatar inválida" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      alertsEnabled: parsed.data.alertsEnabled,
      avatarUrl: avatarUrl || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      alertsEnabled: true,
    },
  });

  return NextResponse.json({ ok: true, account: updated });
}
