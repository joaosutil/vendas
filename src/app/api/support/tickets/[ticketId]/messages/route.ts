import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateSupportAiReply, shouldEscalateToHuman } from "@/lib/support-bot";
import { isAdminUser } from "@/lib/is-admin-user";

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

async function getAllowedTicket(ticketId: string, userId: string, isAdmin: boolean) {
  return prisma.supportTicket.findFirst({
    where: isAdmin ? { id: ticketId } : { id: ticketId, userId },
  });
}

export async function GET(_: Request, context: { params: Promise<{ ticketId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { ticketId } = await context.params;
  const admin = isAdminUser(user);
  const ticket = await getAllowedTicket(ticketId, user.id, admin);
  if (!ticket) return NextResponse.json({ ok: false }, { status: 404 });

  const messages = await prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: {
      senderUser: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
    },
    messages: messages.map((message) => ({
      id: message.id,
      authorType: message.authorType,
      content: message.content,
      createdAt: message.createdAt,
      sender: message.senderUser,
    })),
  });
}

export async function POST(request: Request, context: { params: Promise<{ ticketId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { ticketId } = await context.params;
  const admin = isAdminUser(user);
  const ticket = await getAllowedTicket(ticketId, user.id, admin);
  if (!ticket) return NextResponse.json({ ok: false }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const content = parsed.data.content;
  const isHumanEscalation = shouldEscalateToHuman(content);

  if (admin) {
    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          authorType: "ADMIN",
          senderUserId: user.id,
          content,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "WAITING_CUSTOMER",
          lastMessageAt: new Date(),
        },
      }),
    ]);
  } else {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { title: true },
      take: 20,
    });
    const aiReply = await generateSupportAiReply(content, {
      products: products.map((product) => product.title),
      siteName: "Marketing Digital Top",
    });
    await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId,
          authorType: "USER",
          senderUserId: user.id,
          content,
        },
      }),
      prisma.supportMessage.create({
        data: {
          ticketId,
          authorType: "AI",
          content: aiReply,
        },
      }),
      prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: isHumanEscalation ? "HUMAN_QUEUE" : "OPEN",
          lastMessageAt: new Date(),
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
