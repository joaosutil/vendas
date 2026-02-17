import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function toCsvCell(value: string | number | null | undefined) {
  const raw = value === null || value === undefined ? "" : String(value);
  if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, "\"\"")}"`;
  }
  return raw;
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeMethod(method: string | null | undefined) {
  const raw = (method ?? "").trim().toUpperCase();
  if (!raw) return "DESCONHECIDO";
  if (raw.includes("PIX")) return "PIX";
  if (raw.includes("BOLETO")) return "BOLETO";
  if (raw.includes("CART")) return "CARTAO";
  return raw;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const url = new URL(request.url);
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(now.getDate() - 14);
  const from = parseDate(url.searchParams.get("from"), defaultFrom);
  const to = parseDate(url.searchParams.get("to"), now);
  to.setHours(23, 59, 59, 999);

  const rows = await prisma.purchase.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      product: { select: { title: true } },
      offer: { select: { caktoOfferId: true, checkoutUrl: true } },
    },
  });

  const unitPriceCents = parseNumber(process.env.ADMIN_UNIT_PRICE_CENTS, 1990);
  const fallbackNetByMethod: Record<string, number> = {
    PIX: parseNumber(process.env.ADMIN_NET_PIX_CENTS, 1741),
    BOLETO: parseNumber(process.env.ADMIN_NET_BOLETO_CENTS, 1642),
    CARTAO: parseNumber(process.env.ADMIN_NET_CARTAO_CENTS, 1664),
    DESCONHECIDO: parseNumber(process.env.ADMIN_NET_DEFAULT_CENTS, 1664),
  };

  const lines = [
    [
      "purchase_id",
      "created_at",
      "status",
      "customer_email",
      "product_title",
      "offer_cakto_id",
      "offer_checkout_url",
      "payment_method",
      "currency",
      "gross_cents",
      "fee_cents",
      "net_cents",
    ].join(","),
  ];

  for (const row of rows) {
    const method = normalizeMethod(row.paymentMethod);
    const gross = row.grossAmountCents ?? unitPriceCents;
    const netFallback = fallbackNetByMethod[method] ?? fallbackNetByMethod.DESCONHECIDO;
    const net = row.status === "ACTIVE" ? (row.netAmountCents ?? netFallback) : 0;
    const fee = row.feeAmountCents ?? Math.max(gross - net, 0);
    lines.push(
      [
        toCsvCell(row.id),
        toCsvCell(row.createdAt.toISOString()),
        toCsvCell(row.status),
        toCsvCell(row.user.email),
        toCsvCell(row.product.title),
        toCsvCell(row.offer?.caktoOfferId ?? ""),
        toCsvCell(row.offer?.checkoutUrl ?? ""),
        toCsvCell(method),
        toCsvCell(row.currency ?? "BRL"),
        toCsvCell(gross),
        toCsvCell(fee),
        toCsvCell(net),
      ].join(","),
    );
  }

  const filename = `financeiro_${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv`;
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
