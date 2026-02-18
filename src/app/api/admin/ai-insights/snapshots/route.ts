import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const createSnapshotSchema = z.object({
  name: z.string().trim().min(3).max(120),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  insights: z.array(z.string()).min(1).max(30),
  creativeIdeas: z.array(z.string()).min(1).max(30),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const snapshots = await prisma.adminInsightSnapshot.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      createdBy: {
        select: { email: true, name: true },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    snapshots: snapshots.map((entry) => ({
      id: entry.id,
      name: entry.name,
      fromDate: entry.fromDate,
      toDate: entry.toDate,
      insights: entry.insights,
      creativeIdeas: entry.creativeIdeas,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createSnapshotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });

  const created = await prisma.adminInsightSnapshot.create({
    data: {
      name: parsed.data.name,
      fromDate: parsed.data.fromDate,
      toDate: parsed.data.toDate,
      insights: parsed.data.insights,
      creativeIdeas: parsed.data.creativeIdeas,
      createdById: user.id,
    },
  });

  return NextResponse.json({ ok: true, snapshotId: created.id });
}
