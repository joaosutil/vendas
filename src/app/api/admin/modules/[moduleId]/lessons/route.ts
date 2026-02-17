import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const createLessonSchema = z.object({
  title: z.string().trim().min(3).max(180),
  videoUrl: z.string().url().max(500),
});

export async function POST(request: Request, context: { params: Promise<{ moduleId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { moduleId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      contentUrl: parsed.data.videoUrl,
      orderIndex: (lastLesson?.orderIndex ?? -1) + 1,
    },
    select: { id: true, title: true, contentUrl: true, orderIndex: true },
  });

  return NextResponse.json({ ok: true, lesson });
}
