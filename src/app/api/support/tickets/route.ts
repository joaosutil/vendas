import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateSupportAiReply, shouldEscalateToHuman } from "@/lib/support-bot";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(3).max(4000),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lastMessageAt: ticket.lastMessageAt,
      messagesCount: ticket._count.messages,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { subject, message } = parsed.data;
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { title: true },
    take: 20,
  });
  const aiReply = await generateSupportAiReply(message, {
    products: products.map((product) => product.title),
    siteName: "Marketing Digital Top",
  });
  const escalate = shouldEscalateToHuman(message);

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject,
      status: escalate ? "HUMAN_QUEUE" : "OPEN",
      messages: {
        create: [
          {
            authorType: "USER",
            senderUserId: user.id,
            content: message,
          },
          {
            authorType: "AI",
            content: aiReply,
          },
        ],
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({
    ok: true,
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      messages: ticket.messages,
    },
  });
}
