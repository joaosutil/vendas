"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminConsole } from "@/components/admin/admin-console";

function toCurrency(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueCents / 100);
}

type EnterpriseAdminHubProps = {
  fromValue: string;
  toValue: string;
  csvUrl: string;
  stats: {
    usersCount: number;
    activeUsersCount: number;
    productsCount: number;
    activePurchasesCount: number;
    refundedCount: number;
    salesCount: number;
    keptSalesCount: number;
    grossCents: number;
    netCents: number;
    feeCents: number;
    refundsCents: number;
    profitCents: number;
    avgGrossTicket: number;
    avgNetTicket: number;
    refundRate: number;
    retentionRate: number;
    marginRate: number;
    growthRate: number;
  };
  dailyFinance: Array<{ date: string; sales: number; grossCents: number; netCents: number; refunds: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  topProducts: Array<{ title: string; count: number }>;
  paymentMethodRows: Array<{
    method: string;
    total: number;
    active: number;
    grossCents: number;
    feeCents: number;
    netCents: number;
    avgNetCents: number;
    share: number;
  }>;
  funnelRows: Array<{
    key: string;
    productTitle: string;
    offerCode: string;
    total: number;
    active: number;
    refunded: number;
    chargeback: number;
  }>;
  recentPurchases: Array<{
    id: string;
    createdAt: string;
    email: string;
    productTitle: string;
    status: string;
    paymentMethod: string;
    grossAmountCents: number;
    feeAmountCents: number;
    netAmountCents: number;
  }>;
  aiInsights: string[];
  creativeIdeas: string[];
  openTickets: Array<{
    id: string;
    subject: string;
    status: string;
    userEmail: string;
    lastMessageAt: string;
  }>;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
    active: boolean;
    purchasesCount: number;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    slug: string;
    title: string;
    type: "EBOOK" | "VIDEO_COURSE" | "OTHER";
    active: boolean;
    modulesCount: number;
    lessonsCount: number;
    hasEbookFile: boolean;
  }>;
};

export function EnterpriseAdminHub({
  fromValue,
  toValue,
  csvUrl,
  stats,
  dailyFinance,
  statusDistribution,
  topProducts,
  paymentMethodRows,
  funnelRows,
  recentPurchases,
  aiInsights,
  creativeIdeas,
  openTickets,
  users,
  products,
}: EnterpriseAdminHubProps) {
  const [tab, setTab] = useState<"finance" | "growth" | "operations">("finance");
  const [dailyMode, setDailyMode] = useState<"sales" | "gross" | "net">("sales");

  const maxDailyValue = useMemo(() => {
    if (!dailyFinance.length) return 1;
    return Math.max(
      ...dailyFinance.map((entry) => {
        if (dailyMode === "sales") return entry.sales;
        if (dailyMode === "gross") return entry.grossCents;
        return entry.netCents;
      }),
      1,
    );
  }, [dailyFinance, dailyMode]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
        <h1 className="text-3xl font-bold">Admin Enterprise Hub</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Gestão financeira, growth analytics e operações em um único painel.
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

      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("finance")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "finance" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Financeiro</button>
          <button type="button" onClick={() => setTab("growth")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "growth" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Growth IA</button>
          <button type="button" onClick={() => setTab("operations")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "operations" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Operações</button>
        </div>
      </div>

      {tab === "finance" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Bruto</p><p className="mt-1 text-2xl font-black">{toCurrency(stats.grossCents)}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Líquido</p><p className="mt-1 text-2xl font-black">{toCurrency(stats.netCents)}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Lucro</p><p className="mt-1 text-2xl font-black">{toCurrency(stats.profitCents)}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Taxas / Estornos</p><p className="mt-1 text-2xl font-black">{toCurrency(stats.feeCents)} / {toCurrency(stats.refundsCents)}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Margem / Retenção</p><p className="mt-1 text-2xl font-black">{stats.marginRate}% / {stats.retentionRate}%</p></div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 xl:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Série temporal</h2>
                <div className="flex gap-1 text-xs">
                  <button type="button" onClick={() => setDailyMode("sales")} className={`rounded px-2 py-1 ${dailyMode === "sales" ? "bg-[var(--ink)] text-white" : "border bg-white"}`}>Vendas</button>
                  <button type="button" onClick={() => setDailyMode("gross")} className={`rounded px-2 py-1 ${dailyMode === "gross" ? "bg-[var(--ink)] text-white" : "border bg-white"}`}>Bruto</button>
                  <button type="button" onClick={() => setDailyMode("net")} className={`rounded px-2 py-1 ${dailyMode === "net" ? "bg-[var(--ink)] text-white" : "border bg-white"}`}>Líquido</button>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {dailyFinance.length === 0 ? (
                  <p className="text-sm text-[var(--carvao)]/70">Sem dados no período.</p>
                ) : (
                  dailyFinance.map((entry) => {
                    const rawValue = dailyMode === "sales" ? entry.sales : dailyMode === "gross" ? entry.grossCents : entry.netCents;
                    const width = Math.max((rawValue / maxDailyValue) * 100, 3);
                    const label = dailyMode === "sales" ? `${entry.sales}` : toCurrency(rawValue);
                    return (
                      <div key={entry.date} className="grid grid-cols-[7rem_1fr_7rem] items-center gap-2 text-xs">
                        <span className="text-[var(--carvao)]/75">{entry.date}</span>
                        <div className="h-3 rounded-full bg-[var(--dourado)]/30">
                          <div className="h-3 rounded-full bg-[var(--ink)]" style={{ width: `${width}%` }} />
                        </div>
                        <span className="text-right font-semibold">{label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Mix de pagamentos</h2>
              <div className="mt-3 space-y-2 text-sm">
                {paymentMethodRows.map((row) => (
                  <div key={row.method} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                    <div className="flex items-center justify-between"><span>{row.method}</span><strong>{row.share}%</strong></div>
                    <p className="mt-1 text-xs text-[var(--carvao)]/75">Líquido médio: {toCurrency(row.avgNetCents)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">Compras recentes</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--carvao)]/75">
                    <th className="px-2 py-1">Data</th><th className="px-2 py-1">Email</th><th className="px-2 py-1">Produto</th><th className="px-2 py-1">Método</th><th className="px-2 py-1">Bruto</th><th className="px-2 py-1">Taxa</th><th className="px-2 py-1">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-t border-[var(--dourado)]/25">
                      <td className="px-2 py-1">{new Date(purchase.createdAt).toLocaleString("pt-BR")}</td>
                      <td className="px-2 py-1">{purchase.email}</td>
                      <td className="px-2 py-1">{purchase.productTitle}</td>
                      <td className="px-2 py-1">{purchase.paymentMethod}</td>
                      <td className="px-2 py-1">{toCurrency(purchase.grossAmountCents)}</td>
                      <td className="px-2 py-1">{toCurrency(purchase.feeAmountCents)}</td>
                      <td className="px-2 py-1">{toCurrency(purchase.netAmountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "growth" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Vendas / Ativas</p><p className="mt-1 text-2xl font-black">{stats.salesCount}/{stats.keptSalesCount}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Ticket bruto / líquido</p><p className="mt-1 text-2xl font-black">{toCurrency(stats.avgGrossTicket)} / {toCurrency(stats.avgNetTicket)}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Refund rate</p><p className="mt-1 text-2xl font-black">{stats.refundRate}%</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Tendência</p><p className="mt-1 text-2xl font-black">{stats.growthRate >= 0 ? "+" : ""}{stats.growthRate}%</p></div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Funil por produto/oferta</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--carvao)]/75">
                      <th className="px-2 py-1">Produto</th><th className="px-2 py-1">Oferta</th><th className="px-2 py-1">Aprovadas</th><th className="px-2 py-1">Ativas</th><th className="px-2 py-1">Retenção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funnelRows.map((row) => {
                      const retention = row.total ? Math.round((row.active / row.total) * 100) : 0;
                      return (
                        <tr key={row.key} className="border-t border-[var(--dourado)]/25">
                          <td className="px-2 py-1">{row.productTitle}</td>
                          <td className="px-2 py-1">{row.offerCode}</td>
                          <td className="px-2 py-1">{row.total}</td>
                          <td className="px-2 py-1">{row.active}</td>
                          <td className="px-2 py-1">{retention}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Top produtos e status</h2>
              <div className="mt-2 space-y-2">
                {topProducts.map((entry) => (
                  <div key={entry.title} className="flex items-center justify-between rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2 text-sm">
                    <span className="line-clamp-1">{entry.title}</span>
                    <strong>{entry.count}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {statusDistribution.map((entry) => (
                  <div key={entry.status} className="flex items-center justify-between rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2 text-sm">
                    <span>{entry.status}</span>
                    <strong>{entry.count}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Insights automáticos (IA heurística)</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {aiInsights.map((item, idx) => (
                  <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Sugestões de criativos e divulgação</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {creativeIdeas.map((item, idx) => (
                  <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}

      {tab === "operations" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Usuários ativos / total</p><p className="mt-1 text-2xl font-black">{stats.activeUsersCount}/{stats.usersCount}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Produtos</p><p className="mt-1 text-2xl font-black">{stats.productsCount}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Compras ativas</p><p className="mt-1 text-2xl font-black">{stats.activePurchasesCount}</p></div>
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4"><p className="text-xs text-[var(--carvao)]/75">Refund/Chargeback</p><p className="mt-1 text-2xl font-black">{stats.refundedCount}</p></div>
          </div>
          <AdminConsole openTickets={openTickets} users={users} products={products} />
        </div>
      ) : null}
    </section>
  );
}
