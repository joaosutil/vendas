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

  const unitPriceCents = Number(process.env.ADMIN_UNIT_PRICE_CENTS ?? 1990);
  const feePercent = Number(process.env.ADMIN_FEE_PERCENT ?? 12);
  const feeCents = Math.round((unitPriceCents * feePercent) / 100);
  const netCentsBase = Math.max(unitPriceCents - feeCents, 0);

  const lines = [
    [
      "purchase_id",
      "created_at",
      "status",
      "customer_email",
      "product_title",
      "offer_cakto_id",
      "offer_checkout_url",
      "gross_cents",
      "fee_cents",
      "net_cents",
    ].join(","),
  ];

  for (const row of rows) {
    const gross = unitPriceCents;
    const fee = feeCents;
    const net = row.status === "ACTIVE" ? netCentsBase : 0;
    lines.push(
      [
        toCsvCell(row.id),
        toCsvCell(row.createdAt.toISOString()),
        toCsvCell(row.status),
        toCsvCell(row.user.email),
        toCsvCell(row.product.title),
        toCsvCell(row.offer?.caktoOfferId ?? ""),
        toCsvCell(row.offer?.checkoutUrl ?? ""),
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
