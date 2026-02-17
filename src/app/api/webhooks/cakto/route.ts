import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { parseCaktoPayload } from "@/lib/cakto";
import { processCaktoWebhook } from "@/lib/cakto-webhook-service";

export async function POST(request: Request) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret not configured." }, { status: 500 });
  }

  let payload;
  try {
    payload = parseCaktoPayload(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const expected = secret.trim();
  const received = payload.secret.trim();

  if (received !== expected) {
    if (process.env.NODE_ENV !== "production") {
      const mask = (value: string) => {
        if (value.length <= 8) return "***";
        return `${value.slice(0, 4)}...${value.slice(-4)}`;
      };

      return NextResponse.json(
        {
          ok: false,
          error: "Webhook secret mismatch",
          expected: mask(expected),
          received: mask(received),
        },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await processCaktoWebhook(payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[WEBHOOK:UNHANDLED_ERROR]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
