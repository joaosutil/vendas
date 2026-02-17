import path from "node:path";
import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { PDFDocument, PDFPage, rgb, StandardFonts, degrees } from "pdf-lib";
import { requireMemberProductAccess } from "@/lib/member-access";
import { getEbookFilePathBySlug } from "@/lib/ebook-file";

export const runtime = "nodejs";

function drawCrossWatermark(page: PDFPage) {
  const { width, height } = page.getSize();
  const spacing = 72;

  for (let x = -height; x < width + height; x += spacing) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x: x + height, y: height },
      thickness: 0.7,
      color: rgb(0.48, 0.42, 0.35),
      opacity: 0.12,
    });
  }

  for (let x = -height; x < width + height; x += spacing) {
    page.drawLine({
      start: { x, y: height },
      end: { x: x + height, y: 0 },
      thickness: 0.7,
      color: rgb(0.48, 0.42, 0.35),
      opacity: 0.08,
    });
  }
}

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const access = await requireMemberProductAccess(slug);
  if (!access) return new NextResponse("Forbidden", { status: 403 });

  const relativeFilePath = await getEbookFilePathBySlug(slug);
  if (!relativeFilePath) return new NextResponse("Not found", { status: 404 });

  try {
    const absolutePath = path.resolve(process.cwd(), relativeFilePath);
    const sourceBytes = await readFile(absolutePath);
    const pdfDoc = await PDFDocument.load(sourceBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const generatedAt = new Date();
    const generatedAtIso = generatedAt.toISOString();
    const generatedAtPt = generatedAt.toLocaleString("pt-BR", { hour12: false });
    const sessionHash = crypto
      .createHash("sha256")
      .update(`${access.userId}|${access.userEmail}|${slug}|${generatedAtIso}`)
      .digest("hex")
      .slice(0, 10)
      .toUpperCase();

    for (const page of pages) {
      drawCrossWatermark(page);
      const { width, height } = page.getSize();
      const topLine = `${access.userEmail}  |  ID: ${access.userId}  |  Gerado: ${generatedAtPt}`;
      const topSize = 9;
      const topWidth = fontRegular.widthOfTextAtSize(topLine, topSize);
      const footerText = `Sessao: ${sessionHash}`;
      const footerSize = 8;
      const footerWidth = font.widthOfTextAtSize(footerText, footerSize);
      const diagonalText = `${access.userEmail} • ${access.userId} • ${sessionHash}`;
      const diagonalSize = 20;
      const diagonalWidth = font.widthOfTextAtSize(diagonalText, diagonalSize);

      page.drawText(diagonalText, {
        x: (width - diagonalWidth) / 2,
        y: height / 2,
        size: diagonalSize,
        font,
        rotate: degrees(28),
        color: rgb(0.18, 0.16, 0.14),
        opacity: 0.08,
      });

      page.drawText(topLine, {
        x: Math.max((width - topWidth) / 2, 20),
        y: height - 18,
        size: topSize,
        font: fontRegular,
        color: rgb(0.13, 0.13, 0.16),
        opacity: 0.6,
      });

      page.drawText(footerText, {
        x: Math.max((width - footerWidth) / 2, 20),
        y: 12,
        size: footerSize,
        font,
        color: rgb(0.13, 0.13, 0.16),
        opacity: 0.75,
      });
    }

    const outBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-identificado.pdf"`,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
