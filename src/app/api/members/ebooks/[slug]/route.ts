import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { requireMemberProductAccess } from "@/lib/member-access";
import { getEbookFilePathBySlug } from "@/lib/ebook-file";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const access = await requireMemberProductAccess(slug);
  if (!access) return new NextResponse("Forbidden", { status: 403 });

  const relativeFilePath = await getEbookFilePathBySlug(slug);
  if (!relativeFilePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const absolutePath = path.resolve(process.cwd(), relativeFilePath);
    const file = await readFile(absolutePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}.pdf"`,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
