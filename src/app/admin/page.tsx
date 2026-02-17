import Link from "next/link";
import type { ProductType, PurchaseStatus, SupportTicketStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminConsole } from "@/components/admin/admin-console";

function toCurrency(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueCents / 100);
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

type AdminPageProps = {
  searchParams?: Promise<{ from?: string; to?: string }>;
};

function normalizeMethod(method: string | null | undefined) {
  const raw = (method ?? "").trim().toUpperCase();
  if (!raw) return "DESCONHECIDO";
  if (raw.includes("PIX")) return "PIX";
  if (raw.includes("BOLETO")) return "BOLETO";
  if (raw.includes("CART")) return "CARTAO";
  return raw;
}

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
  let recentPurchases: Array<{
    id: string;
    createdAt: Date;
    status: PurchaseStatus;
    paymentMethod: string | null;
    grossAmountCents: number | null;
    feeAmountCents: number | null;
    netAmountCents: number | null;
    user: { email: string };
    product: { title: string };
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
      recentPurchases,
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
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true } },
          product: { select: { title: true } },
        },
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

  const dayMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const productMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, { total: number; active: number; grossCents: number; feeCents: number; netCents: number }>();
  const funnelMap = new Map<
    string,
    { key: string; productTitle: string; offerCode: string; total: number; active: number; refunded: number; chargeback: number }
  >();

  for (const purchase of periodPurchases) {
    const day = purchase.createdAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
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

    const method = normalizeMethod(purchase.paymentMethod);
    const methodBase =
      paymentMethodMap.get(method) ?? { total: 0, active: 0, grossCents: 0, feeCents: 0, netCents: 0 };
    methodBase.total += 1;
    if (purchase.status === "ACTIVE") methodBase.active += 1;
    const gross = purchase.grossAmountCents ?? unitPriceCents;
    const net =
      purchase.status === "ACTIVE"
        ? (purchase.netAmountCents ?? (fallbackNetByMethod[method] ?? fallbackNetByMethod.DESCONHECIDO))
        : 0;
    const fee = purchase.feeAmountCents ?? Math.max(gross - net, 0);
    methodBase.grossCents += gross;
    methodBase.feeCents += fee;
    methodBase.netCents += net;
    paymentMethodMap.set(method, methodBase);
  }

  const dailySales = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
  const maxDaily = Math.max(...dailySales.map((entry) => entry.count), 1);

  const statusDistribution = ["ACTIVE", "REFUNDED", "CHARGEBACK"].map((status) => ({
    status,
    count: statusMap.get(status) ?? 0,
  }));

  const topProducts = Array.from(productMap.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const funnelRows = Array.from(funnelMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  const paymentMethodRows = Array.from(paymentMethodMap.entries())
    .map(([method, data]) => ({
      method,
      ...data,
      avgNetCents: data.active > 0 ? Math.round(data.netCents / data.active) : 0,
    }))
    .sort((a, b) => b.netCents - a.netCents);

  const fromValue = from.toISOString().slice(0, 10);
  const toValue = to.toISOString().slice(0, 10);
  const csvUrl = `/api/admin/finance/csv?from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}`;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/75 p-5">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Financeiro, vendas, controle de acessos, suporte e cadastro operacional.
        </p>
        <form method="get" className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
          <input type="date" name="from" defaultValue={fromValue} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <input type="date" name="to" defaultValue={toValue} className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white">
            Aplicar filtro
          </button>
          <Link href={csvUrl} className="rounded-lg border border-[var(--ink)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
            Exportar CSV
          </Link>
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Usuarios ativos / total</p>
          <p className="mt-1 text-3xl font-black">
            {activeUsersCount}/{usersCount}
          </p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Produtos</p>
          <p className="mt-1 text-3xl font-black">{productsCount}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Compras ativas</p>
          <p className="mt-1 text-3xl font-black">{activePurchasesCount}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Refund/chargeback</p>
          <p className="mt-1 text-3xl font-black">{refundedCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="font-semibold">Financeiro ({fromValue} até {toValue})</h2>
        <p className="mt-1 text-xs text-[var(--carvao)]/75">
          Valores reais quando vierem da Cakto; quando nao vier, usa fallback por metodo de pagamento.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[var(--dourado)]/40 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Bruto</p>
            <p className="mt-1 text-2xl font-black">{toCurrency(grossCents)}</p>
          </div>
          <div className="rounded-lg border border-[var(--dourado)]/40 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Liquido estimado</p>
            <p className="mt-1 text-2xl font-black">{toCurrency(netCents)}</p>
          </div>
          <div className="rounded-lg border border-[var(--dourado)]/40 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Lucro estimado</p>
            <p className="mt-1 text-2xl font-black">{toCurrency(profitCents)}</p>
          </div>
          <div className="rounded-lg border border-[var(--dourado)]/40 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Taxas / Estornos</p>
            <p className="mt-1 text-2xl font-black">
              {toCurrency(feeCents)} / {toCurrency(refundsCents)}
            </p>
            <p className="mt-1 text-xs text-[var(--carvao)]/70">
              {salesCount} vendas no periodo, {refundedInPeriod} com estorno.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-white/60 bg-white/75 p-4 xl:col-span-2">
          <h2 className="font-semibold">Grafico de vendas por dia</h2>
          <div className="mt-4 grid gap-2">
            {dailySales.length === 0 ? (
              <p className="text-sm text-[var(--carvao)]/70">Sem vendas no periodo.</p>
            ) : (
              dailySales.map((entry) => (
                <div key={entry.date} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-xs">
                  <span className="text-[var(--carvao)]/75">{entry.date}</span>
                  <div className="h-3 rounded-full bg-[var(--dourado)]/30">
                    <div className="h-3 rounded-full bg-[var(--ink)]" style={{ width: `${Math.max((entry.count / maxDaily) * 100, 4)}%` }} />
                  </div>
                  <span className="text-right font-semibold">{entry.count}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="font-semibold">Status das vendas</h2>
          <div className="mt-3 space-y-2 text-sm">
            {statusDistribution.map((entry) => (
              <div key={entry.status} className="flex items-center justify-between rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                <span>{entry.status}</span>
                <strong>{entry.count}</strong>
              </div>
            ))}
          </div>

          <h3 className="mt-4 font-semibold">Top produtos</h3>
          <div className="mt-2 space-y-2 text-sm">
            {topProducts.length === 0 ? (
              <p className="text-[var(--carvao)]/70">Sem dados no periodo.</p>
            ) : (
              topProducts.map((entry) => (
                <div key={entry.title} className="flex items-center justify-between rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                  <span className="line-clamp-1">{entry.title}</span>
                  <strong>{entry.count}</strong>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="font-semibold">Funil por produto/oferta</h2>
        <p className="mt-1 text-xs text-[var(--carvao)]/75">Baseado nas compras no período filtrado (aprovadas, ativas e devoluções).</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--carvao)]/75">
                <th className="px-2 py-1">Produto</th>
                <th className="px-2 py-1">Oferta</th>
                <th className="px-2 py-1">Aprovadas</th>
                <th className="px-2 py-1">Ativas</th>
                <th className="px-2 py-1">Refund</th>
                <th className="px-2 py-1">Chargeback</th>
                <th className="px-2 py-1">Retenção</th>
              </tr>
            </thead>
            <tbody>
              {funnelRows.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-[var(--carvao)]/70" colSpan={7}>
                    Sem dados no período.
                  </td>
                </tr>
              ) : (
                funnelRows.map((row) => {
                  const retention = row.total ? Math.round((row.active / row.total) * 100) : 0;
                  return (
                    <tr key={row.key} className="border-t border-[var(--dourado)]/25">
                      <td className="px-2 py-2">{row.productTitle}</td>
                      <td className="px-2 py-2">{row.offerCode}</td>
                      <td className="px-2 py-2">{row.total}</td>
                      <td className="px-2 py-2">{row.active}</td>
                      <td className="px-2 py-2">{row.refunded}</td>
                      <td className="px-2 py-2">{row.chargeback}</td>
                      <td className="px-2 py-2">{retention}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="font-semibold">Liquido por metodo de pagamento</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--carvao)]/75">
                <th className="px-2 py-1">Metodo</th>
                <th className="px-2 py-1">Compras</th>
                <th className="px-2 py-1">Ativas</th>
                <th className="px-2 py-1">Bruto</th>
                <th className="px-2 py-1">Taxas</th>
                <th className="px-2 py-1">Liquido</th>
                <th className="px-2 py-1">Liquido medio</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethodRows.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-[var(--carvao)]/70" colSpan={7}>
                    Sem dados no período.
                  </td>
                </tr>
              ) : (
                paymentMethodRows.map((row) => (
                  <tr key={row.method} className="border-t border-[var(--dourado)]/25">
                    <td className="px-2 py-2">{row.method}</td>
                    <td className="px-2 py-2">{row.total}</td>
                    <td className="px-2 py-2">{row.active}</td>
                    <td className="px-2 py-2">{toCurrency(row.grossCents)}</td>
                    <td className="px-2 py-2">{toCurrency(row.feeCents)}</td>
                    <td className="px-2 py-2">{toCurrency(row.netCents)}</td>
                    <td className="px-2 py-2">{toCurrency(row.avgNetCents)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="font-semibold">Compras recentes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--carvao)]/75">
                <th className="px-2 py-1">Data</th>
                <th className="px-2 py-1">Usuario</th>
                <th className="px-2 py-1">Produto</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Pagamento</th>
                <th className="px-2 py-1">Bruto</th>
                <th className="px-2 py-1">Taxa</th>
                <th className="px-2 py-1">Liquido</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-[var(--dourado)]/25">
                  <td className="px-2 py-1">{new Date(purchase.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="px-2 py-1">{purchase.user.email}</td>
                  <td className="px-2 py-1">{purchase.product.title}</td>
                  <td className="px-2 py-1">{purchase.status}</td>
                  <td className="px-2 py-1">{normalizeMethod(purchase.paymentMethod)}</td>
                  <td className="px-2 py-1">{toCurrency(purchase.grossAmountCents ?? unitPriceCents)}</td>
                  <td className="px-2 py-1">
                    {toCurrency(
                      purchase.feeAmountCents ??
                        Math.max(
                          (purchase.grossAmountCents ?? unitPriceCents) -
                            (purchase.netAmountCents ??
                              fallbackNetByMethod[normalizeMethod(purchase.paymentMethod)] ??
                              fallbackNetByMethod.DESCONHECIDO),
                          0,
                        ),
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {toCurrency(
                      purchase.status === "ACTIVE"
                        ? (purchase.netAmountCents ??
                            fallbackNetByMethod[normalizeMethod(purchase.paymentMethod)] ??
                            fallbackNetByMethod.DESCONHECIDO)
                        : 0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConsole
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
    </section>
  );
}
