import { NextResponse } from "next/server";
import { processCaktoWebhook } from "@/lib/cakto-webhook-service";
import type { CaktoWebhookPayload } from "@/lib/cakto";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    orderId?: string;
    productId?: string;
    offerId?: string;
    event?: "purchase_approved" | "refund" | "chargeback";
  };

  const email = body.email?.trim().toLowerCase() || "teste+cakto@exemplo.com";
  const name = body.name?.trim() || "Cliente Teste";
  const orderId = body.orderId?.trim() || `ORDER-${Date.now()}`;
  const event = body.event || "purchase_approved";

  const payload: CaktoWebhookPayload = {
    id: `evt-dev-${Date.now()}`,
    event,
    secret: process.env.CAKTO_WEBHOOK_SECRET || "dev-secret",
    data: {
      id: orderId,
      status: event === "purchase_approved" ? "paid" : event,
      customer: { email, name },
      product: { id: body.productId ?? "ansiedade-prod-1" },
      offer: { id: body.offerId ?? "ansiedade-offer-1" },
    },
  };

  const result = await processCaktoWebhook(payload);
  return NextResponse.json(result);
}
