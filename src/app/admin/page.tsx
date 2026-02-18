import type { ProductType, PurchaseStatus, SupportTicketStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EnterpriseAdminHub } from "@/components/admin/enterprise-admin-hub";

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function normalizeMethod(method: string | null | undefined) {
  const raw = (method ?? "").trim().toUpperCase();
  if (!raw) return "DESCONHECIDO";
  if (raw.includes("PIX")) return "PIX";
  if (raw.includes("BOLETO")) return "BOLETO";
  if (raw.includes("CART")) return "CARTAO";
  return raw;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type AdminPageProps = {
  searchParams?: Promise<{ from?: string; to?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const unitPriceCents = parseNumber(process.env.ADMIN_UNIT_PRICE_CENTS, 1990);
  const costPerSaleCents = parseNumber(process.env.ADMIN_COST_PER_SALE_CENTS, 0);
  const fallbackNetByMethod: Record<string, number> = {
    PIX: parseNumber(process.env.ADMIN_NET_PIX_CENTS, 1741),
    BOLETO: parseNumber(process.env.ADMIN_NET_BOLETO_CENTS, 1642),
    CARTAO: parseNumber(process.env.ADMIN_NET_CARTAO_CENTS, 1664),
    DESCONHECIDO: parseNumber(process.env.ADMIN_NET_DEFAULT_CENTS, 1664),
  };
  const defaultLastDays = parseNumber(process.env.ADMIN_FINANCE_DAYS, 14);

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(now.getDate() - Math.max(1, Math.min(defaultLastDays, 90)));

  const from = parseDate(params.from, defaultFrom);
  const to = parseDate(params.to, now);
  to.setHours(23, 59, 59, 999);

  let usersCount = 0;
  let activeUsersCount = 0;
  let productsCount = 0;
  let activePurchasesCount = 0;
  let refundedCount = 0;
  let openTickets: Array<{
    id: string;
    subject: string;
    status: SupportTicketStatus;
    lastMessageAt: Date;
    user: { email: string };
  }> = [];
  let periodPurchases: Array<{
    id: string;
    createdAt: Date;
    status: PurchaseStatus;
    paymentMethod: string | null;
    grossAmountCents: number | null;
    feeAmountCents: number | null;
    netAmountCents: number | null;
    product: { title: string };
    offer: { caktoOfferId: string; checkoutUrl: string } | null;
  }> = [];
  let users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    active: boolean;
    createdAt: Date;
    _count: { purchases: number };
  }> = [];
  let products: Array<{
    id: string;
    slug: string;
    title: string;
    type: ProductType;
    active: boolean;
    ebookAsset: { id: string } | null;
    modules: Array<{ id: string; lessons: Array<{ id: string }> }>;
  }> = [];

  try {
    [
      usersCount,
      activeUsersCount,
      productsCount,
      activePurchasesCount,
      refundedCount,
      openTickets,
      periodPurchases,
      users,
      products,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.product.count(),
      prisma.purchase.count({ where: { status: "ACTIVE" } }),
      prisma.purchase.count({ where: { status: { in: ["REFUNDED", "CHARGEBACK"] } } }),
      prisma.supportTicket.findMany({
        where: { status: { in: ["OPEN", "HUMAN_QUEUE", "WAITING_CUSTOMER"] } },
        orderBy: { lastMessageAt: "desc" },
        take: 20,
        include: { user: { select: { email: true } } },
      }),
      prisma.purchase.findMany({
        where: { createdAt: { gte: from, lte: to } },
        include: {
          product: { select: { title: true } },
          offer: { select: { caktoOfferId: true, checkoutUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          _count: { select: { purchases: true } },
        },
        take: 200,
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          active: true,
          ebookAsset: { select: { id: true } },
          modules: { select: { id: true, lessons: { select: { id: true } } } },
        },
        take: 200,
      }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return (
      <section className="rounded-2xl border border-red-300/60 bg-red-50/80 p-5 text-red-900">
        <h1 className="text-2xl font-bold">Falha ao carregar o Admin</h1>
        <p className="mt-2 text-sm">
          O banco parece desatualizado para a versão atual do painel. Aplique as migrations pendentes e reinicie a aplicação.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-red-100 p-3 text-xs">{message}</pre>
      </section>
    );
  }

  const salesCount = periodPurchases.length;
  const refundedInPeriod = periodPurchases.filter((entry) => entry.status !== "ACTIVE").length;
  const keptSalesCount = Math.max(salesCount - refundedInPeriod, 0);
  const grossCents = periodPurchases.reduce((acc, purchase) => acc + (purchase.grossAmountCents ?? unitPriceCents), 0);
  const feeCents = periodPurchases.reduce((acc, purchase) => {
    if (typeof purchase.feeAmountCents === "number") return acc + purchase.feeAmountCents;
    const gross = purchase.grossAmountCents ?? unitPriceCents;
    const method = normalizeMethod(purchase.paymentMethod);
    const fallbackNet = fallbackNetByMethod[method] ?? fallbackNetByMethod.DESCONHECIDO;
    return acc + Math.max(gross - fallbackNet, 0);
  }, 0);
  const refundsCents = periodPurchases.reduce((acc, purchase) => {
    if (purchase.status === "ACTIVE") return acc;
    return acc + (purchase.grossAmountCents ?? unitPriceCents);
  }, 0);
  const netCents = periodPurchases.reduce((acc, purchase) => {
    if (purchase.status !== "ACTIVE") return acc;
    if (typeof purchase.netAmountCents === "number") return acc + purchase.netAmountCents;
    const method = normalizeMethod(purchase.paymentMethod);
    return acc + (fallbackNetByMethod[method] ?? fallbackNetByMethod.DESCONHECIDO);
  }, 0);
  const costCents = keptSalesCount * costPerSaleCents;
  const profitCents = Math.max(netCents - costCents, 0);

  const dayMap = new Map<string, { sales: number; grossCents: number; netCents: number; refunds: number }>();
  const statusMap = new Map<string, number>();
  const productMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, { total: number; active: number; grossCents: number; feeCents: number; netCents: number }>();
  const funnelMap = new Map<
    string,
    { key: string; productTitle: string; offerCode: string; total: number; active: number; refunded: number; chargeback: number }
  >();

  for (const purchase of periodPurchases) {
    const day = purchase.createdAt.toISOString().slice(0, 10);
    const gross = purchase.grossAmountCents ?? unitPriceCents;
    const method = normalizeMethod(purchase.paymentMethod);
    const net =
      purchase.status === "ACTIVE"
        ? (purchase.netAmountCents ?? (fallbackNetByMethod[method] ?? fallbackNetByMethod.DESCONHECIDO))
        : 0;
    const fee = purchase.feeAmountCents ?? Math.max(gross - net, 0);

    const dayCurrent = dayMap.get(day) ?? { sales: 0, grossCents: 0, netCents: 0, refunds: 0 };
    dayCurrent.sales += 1;
    dayCurrent.grossCents += gross;
    dayCurrent.netCents += net;
    if (purchase.status !== "ACTIVE") dayCurrent.refunds += 1;
    dayMap.set(day, dayCurrent);

    statusMap.set(purchase.status, (statusMap.get(purchase.status) ?? 0) + 1);
    productMap.set(purchase.product.title, (productMap.get(purchase.product.title) ?? 0) + 1);

    const offerCode = purchase.offer?.caktoOfferId ?? "sem_offer_id";
    const key = `${purchase.product.title}::${offerCode}`;
    const base =
      funnelMap.get(key) ??
      ({
        key,
        productTitle: purchase.product.title,
        offerCode,
        total: 0,
        active: 0,
        refunded: 0,
        chargeback: 0,
      } as const);

    const mutable = { ...base };
    mutable.total += 1;
    if (purchase.status === "ACTIVE") mutable.active += 1;
    if (purchase.status === "REFUNDED") mutable.refunded += 1;
    if (purchase.status === "CHARGEBACK") mutable.chargeback += 1;
    funnelMap.set(key, mutable);

    const methodBase =
      paymentMethodMap.get(method) ?? { total: 0, active: 0, grossCents: 0, feeCents: 0, netCents: 0 };
    methodBase.total += 1;
    if (purchase.status === "ACTIVE") methodBase.active += 1;
    methodBase.grossCents += gross;
    methodBase.feeCents += fee;
    methodBase.netCents += net;
    paymentMethodMap.set(method, methodBase);
  }

  const dailyFinance = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  const statusDistribution = ["ACTIVE", "REFUNDED", "CHARGEBACK"].map((status) => ({
    status,
    count: statusMap.get(status) ?? 0,
  }));

  const topProducts = Array.from(productMap.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const funnelRows = Array.from(funnelMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 30);

  const paymentMethodRows = Array.from(paymentMethodMap.entries())
    .map(([method, data]) => ({
      method,
      ...data,
      avgNetCents: data.active > 0 ? Math.round(data.netCents / data.active) : 0,
      share: salesCount ? Math.round((data.total / salesCount) * 100) : 0,
    }))
    .sort((a, b) => b.netCents - a.netCents);

  const topPayment = paymentMethodRows[0];
  const topProduct = topProducts[0];

  const avgGrossTicket = salesCount ? Math.round(grossCents / salesCount) : 0;
  const avgNetTicket = keptSalesCount ? Math.round(netCents / keptSalesCount) : 0;
  const refundRate = salesCount ? Math.round((refundedInPeriod / salesCount) * 100) : 0;
  const retentionRate = salesCount ? Math.round((keptSalesCount / salesCount) * 100) : 0;
  const marginRate = grossCents ? Math.round((netCents / grossCents) * 100) : 0;

  const half = Math.max(1, Math.floor(dailyFinance.length / 2));
  const firstHalfSales = dailyFinance.slice(0, half).reduce((acc, item) => acc + item.sales, 0);
  const secondHalfSales = dailyFinance.slice(half).reduce((acc, item) => acc + item.sales, 0);
  const hasReliableTrendBase = salesCount >= 6 && dailyFinance.length >= 4;
  let growthRate = 0;
  if (hasReliableTrendBase) {
    if (firstHalfSales === 0 && secondHalfSales > 0) {
      growthRate = 100;
    } else if (firstHalfSales > 0) {
      growthRate = Math.round(((secondHalfSales - firstHalfSales) / firstHalfSales) * 100);
    }
    growthRate = clamp(growthRate, -90, 300);
  }

  const aiInsights: string[] = [
    `Margem líquida: ${marginRate}%. ${marginRate < 70 ? "Alerta de eficiência: reduzir CAC e taxa média deve ser prioridade." : "Eficiência saudável para escalar tráfego com segurança."}`,
    `Retenção pós-venda: ${retentionRate}% (refund+chargeback: ${refundRate}%). ${refundRate > 12 ? "Risco de churn alto: ajuste promessa da oferta e onboarding das primeiras 24h." : "Risco de churn controlado no período."}`,
    `Ticket médio bruto ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(avgGrossTicket / 100)} e líquido ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(avgNetTicket / 100)}.`,
    hasReliableTrendBase
      ? `Tendência de vendas no período: ${growthRate >= 0 ? "+" : ""}${growthRate}% entre primeira e segunda metade.`
      : "Tendência: base de dados ainda pequena para inferência confiável.",
    topPayment
      ? `Método dominante: ${topPayment.method} (${topPayment.share}% das vendas), com líquido médio de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(topPayment.avgNetCents / 100)}.`
      : "Sem volume suficiente para determinar método dominante.",
    topProduct
      ? `Produto líder por volume: ${topProduct.title} (${topProduct.count} vendas no período).`
      : "Sem produto líder no período.",
  ];

  const creativeIdeas = [
    `Criativo 1 (TOF): vídeo de 20-30s com gancho de dor + prova concreta + CTA para ${topProduct?.title ?? "produto principal"}.`,
    `Criativo 2 (MOF): carrossel de objeções (preço, tempo, eficácia) com foco no método ${topPayment?.method ?? "de maior conversão"}.`,
    "Criativo 3 (BOF): UGC com demonstração de uso real + call direto para checkout com urgência de sessão.",
    `Distribuição recomendada: ${growthRate < 0 ? "40% aquisição / 40% remarketing / 20% creators" : "60% aquisição / 25% remarketing / 15% creators"} com revisão semanal de ROI.`,
  ];

  const fromValue = from.toISOString().slice(0, 10);
  const toValue = to.toISOString().slice(0, 10);
  const csvUrl = `/api/admin/finance/csv?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}`;

  return (
    <EnterpriseAdminHub
      fromValue={fromValue}
      toValue={toValue}
      csvUrl={csvUrl}
      stats={{
        usersCount,
        activeUsersCount,
        productsCount,
        activePurchasesCount,
        refundedCount,
        salesCount,
        keptSalesCount,
        grossCents,
        netCents,
        feeCents,
        refundsCents,
        profitCents,
        avgGrossTicket,
        avgNetTicket,
        refundRate,
        retentionRate,
        marginRate,
        growthRate,
      }}
      dailyFinance={dailyFinance}
      statusDistribution={statusDistribution}
      topProducts={topProducts}
      paymentMethodRows={paymentMethodRows}
      funnelRows={funnelRows}
      aiInsights={aiInsights}
      creativeIdeas={creativeIdeas}
      openTickets={openTickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        userEmail: ticket.user.email,
        lastMessageAt: ticket.lastMessageAt.toISOString(),
      }))}
      users={users.map((entry) => ({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        role: entry.role,
        active: entry.active,
        purchasesCount: entry._count.purchases,
        createdAt: entry.createdAt.toISOString(),
      }))}
      products={products.map((product) => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        type: product.type,
        active: product.active,
        modulesCount: product.modules.length,
        lessonsCount: product.modules.reduce((acc, module) => acc + module.lessons.length, 0),
        hasEbookFile: Boolean(product.ebookAsset),
      }))}
    />
  );
}
