import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getAvatarFilePath } from "@/lib/avatar-storage";

function getMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function isSafeFileName(fileName: string) {
  return /^[a-zA-Z0-9._-]+$/.test(fileName) && !fileName.includes("..");
}

export async function GET(_: Request, context: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await context.params;
  if (!isSafeFileName(fileName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const bytes = await readFile(getAvatarFilePath(fileName));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": getMimeType(fileName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
