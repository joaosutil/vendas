import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const MAX_SIZE = 3 * 1024 * 1024;
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function resolveExtension(fileType: string, fileName: string) {
  const normalizedType = fileType.toLowerCase();
  if (normalizedType.includes("image/png")) return ".png";
  if (normalizedType.includes("image/jpeg") || normalizedType.includes("image/jpg")) return ".jpg";
  if (normalizedType.includes("image/webp")) return ".webp";

  const byName = path.extname(fileName || "").toLowerCase();
  if (allowedExtensions.has(byName)) return byName === ".jpeg" ? ".jpg" : byName;
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return NextResponse.json({ ok: false, error: "Arquivo não encontrado" }, { status: 400 });
  }
  const typedFile = file as File;
  if (typedFile.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "Imagem maior que 3MB" }, { status: 400 });
  }
  const ext = resolveExtension(typedFile.type, typedFile.name);
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: `Formato inválido (${typedFile.type || "desconhecido"}). Use JPG, PNG ou WEBP.` },
      { status: 400 },
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const oldUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });

  const fileName = `${user.id}-${randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  const bytes = Buffer.from(await typedFile.arrayBuffer());
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
