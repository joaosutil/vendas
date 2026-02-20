import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  getLandingAssetLegacyPublicPath,
  getLandingAssetStoragePath,
  isSafeLandingAssetFileName,
} from "@/lib/landing-asset-storage";

function getMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(_: Request, context: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await context.params;
  if (!isSafeLandingAssetFileName(fileName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const candidates = [getLandingAssetStoragePath(fileName), getLandingAssetLegacyPublicPath(fileName)];
  for (const candidate of candidates) {
    try {
      const bytes = await readFile(candidate);
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": getMimeType(fileName),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Try next location.
    }
  }

  return NextResponse.json({ ok: false }, { status: 404 });
}

