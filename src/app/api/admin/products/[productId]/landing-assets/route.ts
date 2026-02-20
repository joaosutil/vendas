import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";
import { getLandingAssetApiUrl, LANDING_ASSET_STORAGE_DIR } from "@/lib/landing-asset-storage";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024;

function sanitize(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.-]/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  try {
    const formData = await request.formData();

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ ok: false, error: "Arquivo não enviado." }, { status: 400 });
    }
    if (!ALLOWED.has(fileEntry.type)) {
      return NextResponse.json({ ok: false, error: "Tipo inválido. Use PNG/JPG/WEBP/GIF." }, { status: 400 });
    }
    if (fileEntry.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "Arquivo maior que 8MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await fileEntry.arrayBuffer());
    const extension = path.extname(fileEntry.name) || ".png";
    const fileName = `${Date.now()}-${randomUUID()}-${sanitize(path.basename(fileEntry.name, extension))}${extension}`;
    const targetDir = LANDING_ASSET_STORAGE_DIR;
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, fileName), bytes);

    return NextResponse.json({ ok: true, url: getLandingAssetApiUrl(fileName) });
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao salvar asset da landing." }, { status: 500 });
  }
}
