import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMemberProductAccess } from "@/lib/member-access";

const highlightSchema = z.object({
  id: z.string().min(1),
  chapterIndex: z.number().int().min(0),
  paragraphIndex: z.number().int().min(0),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  color: z.string().min(1).max(32),
  selectedText: z.string().min(1).max(500),
});

const statePayloadSchema = z.object({
  activeChapter: z.number().int().min(0),
  scrollProgress: z.number().int().min(0).max(100),
  fontScale: z.number().min(0.85).max(1.6),
  readChapters: z.array(z.number().int().min(0)).max(500),
  completedModules: z.array(z.number().int().min(0)).max(500),
  highlights: z.array(highlightSchema).max(2000),
});

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await requireMemberProductAccess(slug);
  if (!access) return NextResponse.json({ ok: false }, { status: 403 });

  const [state, highlights] = await Promise.all([
    prisma.ebookReaderState.findUnique({
      where: {
        userId_productId: {
          userId: access.userId,
          productId: access.productId,
        },
      },
    }),
    prisma.ebookHighlight.findMany({
      where: {
        userId: access.userId,
        productId: access.productId,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    state: {
      activeChapter: state?.activeChapter ?? 0,
      scrollProgress: state?.scrollProgress ?? 0,
      fontScale: state?.fontScale ?? 1,
      readChapters: state?.readChapters ?? [],
      completedModules: state?.completedModules ?? [],
      highlights: highlights.map((h) => ({
        id: h.id,
        chapterIndex: h.chapterIndex,
        paragraphIndex: h.paragraphIndex,
        startOffset: h.startOffset,
        endOffset: h.endOffset,
        color: h.color,
        selectedText: h.selectedText,
      })),
    },
  });
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const access = await requireMemberProductAccess(slug);
  if (!access) return NextResponse.json({ ok: false }, { status: 403 });

  const parsed = statePayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const payload = parsed.data;
  const highlights = payload.highlights
    .filter((h) => h.endOffset > h.startOffset)
    .map((h) => ({
      id: h.id,
      userId: access.userId,
      productId: access.productId,
      chapterIndex: h.chapterIndex,
      paragraphIndex: h.paragraphIndex,
      startOffset: h.startOffset,
      endOffset: h.endOffset,
      color: h.color,
      selectedText: h.selectedText,
    }));

  await prisma.$transaction([
    prisma.ebookReaderState.upsert({
      where: {
        userId_productId: {
          userId: access.userId,
          productId: access.productId,
        },
      },
      create: {
        userId: access.userId,
        productId: access.productId,
        activeChapter: payload.activeChapter,
        scrollProgress: payload.scrollProgress,
        fontScale: payload.fontScale,
        readChapters: payload.readChapters,
        completedModules: payload.completedModules,
      },
      update: {
        activeChapter: payload.activeChapter,
        scrollProgress: payload.scrollProgress,
        fontScale: payload.fontScale,
        readChapters: payload.readChapters,
        completedModules: payload.completedModules,
      },
    }),
    prisma.ebookHighlight.deleteMany({
      where: { userId: access.userId, productId: access.productId },
    }),
    ...(highlights.length
      ? [
          prisma.ebookHighlight.createMany({
            data: highlights,
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
