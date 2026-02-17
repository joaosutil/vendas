import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const statusSchema = z.object({
  status: z.enum(["OPEN", "HUMAN_QUEUE", "WAITING_CUSTOMER", "RESOLVED"]),
});

export async function PATCH(request: Request, context: { params: Promise<{ ticketId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { ticketId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
