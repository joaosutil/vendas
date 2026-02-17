import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { productId } = await context.params;
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Arquivo obrigatório" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ ok: false, error: "Somente PDF é aceito" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength < 100) {
    return NextResponse.json({ ok: false, error: "Arquivo inválido" }, { status: 400 });
  }
  if (bytes.byteLength > 30 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Arquivo acima de 30MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageDir = path.resolve(process.cwd(), "public", "uploads", "ebooks");
  await mkdir(storageDir, { recursive: true });
  const filename = `${productId}-${Date.now()}-${safeName}`;
  const target = path.join(storageDir, filename);
  await writeFile(target, Buffer.from(bytes));

  const relativePath = path.posix.join("public", "uploads", "ebooks", filename);
  await prisma.productEbookAsset.upsert({
    where: { productId },
    create: {
      productId,
      filePath: relativePath,
      fileName: file.name,
    },
    update: {
      filePath: relativePath,
      fileName: file.name,
    },
  });

  return NextResponse.json({
    ok: true,
    filePath: relativePath,
    publicUrl: `/uploads/ebooks/${filename}`,
  });
}
