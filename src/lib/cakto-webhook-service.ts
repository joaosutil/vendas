import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeId, type CaktoWebhookPayload } from "@/lib/cakto";
import { createPasswordSetupToken } from "@/lib/password-setup";
import { sendSetupPasswordEmail } from "@/lib/email";

function getBaseUrl() {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

function isAnsiedadeProductId(productId: string | null) {
  if (!productId) return true;
  const configured = process.env.CAKTO_ANSIEDADE_PRODUCT_ID?.trim();
  if (configured) return configured === productId;
  return productId.toLowerCase().includes("ansiedade");
}

async function ensureProduct(productId: string | null, offerId: string | null) {
  if (isAnsiedadeProductId(productId)) {
    return prisma.product.upsert({
      where: { slug: "ansiedade" },
      create: {
        slug: "ansiedade",
        title: "Como Derrotar a Ansiedade",
        caktoProductId: productId ?? undefined,
      },
      update: {
        title: "Como Derrotar a Ansiedade",
        caktoProductId: productId ?? undefined,
      },
    });
  }
  if (!productId) {
    throw new Error("Missing productId for non-ansiedade product.");
  }

  const existing = await prisma.product.findUnique({
    where: { caktoProductId: productId },
  });
  if (existing) return existing;

  const created = await prisma.product.create({
    data: {
      slug: `produto-${productId}`,
      title: `Produto ${productId}`,
      caktoProductId: productId,
    },
  });

  if (offerId) {
    await prisma.offer.upsert({
      where: { caktoOfferId: offerId },
      create: {
        caktoOfferId: offerId,
        productId: created.id,
        checkoutUrl: process.env.NEXT_PUBLIC_CAKTO_CHECKOUT_URL ?? "https://pay.cakto.com.br/SEU_CODIGO",
      },
      update: {
        productId: created.id,
      },
    });
  }

  return created;
}

export async function processCaktoWebhook(payload: CaktoWebhookPayload) {
  const eventType = payload.event;
  const orderId = normalizeId(payload.data.id);
  const eventId = normalizeId(payload.id) ?? `${eventType}:${orderId ?? payload.data.customer.email}`;
  const productId = normalizeId(payload.data.product?.id);
  const offerId = normalizeId(payload.data.offer?.id);

  try {
    await prisma.webhookEvent.create({
      data: {
        caktoEventId: eventId,
        caktoOrderId: orderId,
        eventType,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: true, duplicate: true as const };
    }
    throw error;
  }

  if (eventType === "purchase_approved") {
    const email = payload.data.customer.email.toLowerCase().trim();
    const name = payload.data.customer.name?.trim();
    const product = await ensureProduct(productId, offerId);

    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name: name || undefined },
      update: { name: name || undefined },
    });

    if (orderId) {
      await prisma.purchase.upsert({
        where: { caktoOrderId: orderId },
        create: {
          caktoOrderId: orderId,
          userId: user.id,
          productId: product.id,
          status: "ACTIVE",
          paidAt: new Date(),
        },
        update: {
          status: "ACTIVE",
          paidAt: new Date(),
          userId: user.id,
          productId: product.id,
        },
      });
    }

    const rawToken = await createPasswordSetupToken(user.id);
    const setupUrl = `${getBaseUrl()}/definir-senha?token=${rawToken}`;
    try {
      await sendSetupPasswordEmail({
        email: user.email,
        name: user.name,
        setupUrl,
      });
    } catch (error) {
      console.error("[WEBHOOK:EMAIL_SEND_FAILED]", {
        userId: user.id,
        email: user.email,
        orderId,
        eventId,
        error,
      });
    }

    return { ok: true, duplicate: false as const, setupUrl };
  }

  if (eventType === "refund" || eventType === "chargeback") {
    if (orderId) {
      await prisma.purchase.updateMany({
        where: { caktoOrderId: orderId },
        data: { status: eventType === "refund" ? "REFUNDED" : "CHARGEBACK" },
      });
    }
  }

  return { ok: true, duplicate: false as const };
}
