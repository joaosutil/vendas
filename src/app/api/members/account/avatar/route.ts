import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const MAX_SIZE = 3 * 1024 * 1024;
const allowedMime = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Arquivo não encontrado" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "Imagem maior que 3MB" }, { status: 400 });
  }
  const ext = allowedMime.get(file.type);
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Formato inválido (use jpg, png ou webp)" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const oldUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });

  const fileName = `${user.id}-${randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  const avatarUrl = `/uploads/avatars/${fileName}`;
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  });

  if (oldUser?.avatarUrl?.startsWith("/uploads/avatars/")) {
    const oldAbsolute = path.join(process.cwd(), "public", oldUser.avatarUrl);
    unlink(oldAbsolute).catch(() => null);
  }

  return NextResponse.json({ ok: true, avatarUrl });
}
