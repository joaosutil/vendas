import Link from "next/link";
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const unitPriceCents = parseNumber(process.env.ADMIN_UNIT_PRICE_CENTS, 1990);
  const feePercent = parseNumber(process.env.ADMIN_FEE_PERCENT, 12);
  const costPerSaleCents = parseNumber(process.env.ADMIN_COST_PER_SALE_CENTS, 0);
  const defaultLastDays = parseNumber(process.env.ADMIN_FINANCE_DAYS, 14);

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(now.getDate() - Math.max(1, Math.min(defaultLastDays, 90)));

  const from = parseDate(params.from, defaultFrom);
  const to = parseDate(params.to, now);
  to.setHours(23, 59, 59, 999);

  const [
    usersCount,
    activeUsersCount,
    productsCount,
    activePurchasesCount,
    refundedCount,
    openTickets,
    recentPurchases,
    periodPurchases,
    users,
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
  ]);

  const salesCount = periodPurchases.length;
  const refundedInPeriod = periodPurchases.filter((entry) => entry.status !== "ACTIVE").length;
  const keptSalesCount = Math.max(salesCount - refundedInPeriod, 0);
  const grossCents = salesCount * unitPriceCents;
  const feeCents = Math.round((grossCents * feePercent) / 100);
  const refundsCents = refundedInPeriod * unitPriceCents;
  const costCents = keptSalesCount * costPerSaleCents;
  const netCents = Math.max(grossCents - feeCents - refundsCents, 0);
  const profitCents = Math.max(netCents - costCents, 0);

  const dayMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const productMap = new Map<string, number>();
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
          Valores estimados por regra operacional: ticket medio {toCurrency(unitPriceCents)} e taxa {feePercent}%.
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
            <p className="text-xs text-[var(--carvao)]/70">Vendas / Reembolsos</p>
            <p className="mt-1 text-2xl font-black">
              {salesCount}/{refundedInPeriod}
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
        <h2 className="font-semibold">Compras recentes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--carvao)]/75">
                <th className="px-2 py-1">Data</th>
                <th className="px-2 py-1">Usuario</th>
                <th className="px-2 py-1">Produto</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Bruto estimado</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-[var(--dourado)]/25">
                  <td className="px-2 py-1">{new Date(purchase.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="px-2 py-1">{purchase.user.email}</td>
                  <td className="px-2 py-1">{purchase.product.title}</td>
                  <td className="px-2 py-1">{purchase.status}</td>
                  <td className="px-2 py-1">{toCurrency(unitPriceCents)}</td>
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
      />
    </section>
  );
}
