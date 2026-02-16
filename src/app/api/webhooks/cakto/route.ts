import { NextResponse } from "next/server";
import { parseCaktoPayload } from "@/lib/cakto";
import { processCaktoWebhook } from "@/lib/cakto-webhook-service";

export async function POST(request: Request) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret not configured." }, { status: 500 });
  }

  const payload = parseCaktoPayload(await request.json());
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

  const result = await processCaktoWebhook(payload);
  return NextResponse.json(result);
}
