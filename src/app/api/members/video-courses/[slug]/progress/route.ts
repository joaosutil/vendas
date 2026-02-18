import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { requireMemberProductAccess } from "@/lib/member-access";

const updateSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await context.params;
  const access = await requireMemberProductAccess(slug);
  if (!access || access.userId !== user.id) return NextResponse.json({ ok: false }, { status: 403 });

  const progress = await prisma.progress.findMany({
    where: {
      userId: user.id,
      lesson: {
        module: {
          product: { slug },
        },
      },
    },
    select: { lessonId: true },
  });

  return NextResponse.json({ ok: true, completedLessonIds: progress.map((entry) => entry.lessonId) });
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await context.params;
  const access = await requireMemberProductAccess(slug);
  if (!access || access.userId !== user.id) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  const { lessonId, completed } = parsed.data;

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { product: { slug } } },
    select: { id: true },
  });
  if (!lesson) return NextResponse.json({ ok: false, error: "Lesson not found" }, { status: 404 });

  if (completed) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: { completedAt: new Date() },
      create: { userId: user.id, lessonId, completedAt: new Date() },
    });
  } else {
    await prisma.progress.deleteMany({
      where: { userId: user.id, lessonId },
    });
  }

  return NextResponse.json({ ok: true });
}
