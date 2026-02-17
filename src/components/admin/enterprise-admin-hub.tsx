"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const chartPalette = {
  gross: "#2563eb",
  net: "#059669",
  fees: "#f59e0b",
  refunds: "#ef4444",
  sales: "#7c3aed",
  line2: "#06b6d4",
  bgStroke: "#94a3b8",
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
  aiInsights,
  creativeIdeas,
  openTickets,
  users,
  products,
}: EnterpriseAdminHubProps) {
  const [tab, setTab] = useState<"finance" | "growth" | "operations">("finance");

  const dailySeries = useMemo(
    () =>
      dailyFinance.map((entry) => ({
        date: entry.date.slice(5),
        sales: entry.sales,
        gross: Number((entry.grossCents / 100).toFixed(2)),
        net: Number((entry.netCents / 100).toFixed(2)),
        refunds: entry.refunds,
      })),
    [dailyFinance],
  );

  const paymentPieData = useMemo(
    () =>
      paymentMethodRows.map((row) => ({
        name: row.method,
        value: row.total,
      })),
    [paymentMethodRows],
  );

  const statusPieData = useMemo(
    () => statusDistribution.map((entry) => ({ name: entry.status, value: entry.count })),
    [statusDistribution],
  );

  const funnelChartData = useMemo(
    () =>
      funnelRows.slice(0, 8).map((row) => ({
        name: `${row.productTitle.slice(0, 14)}-${row.offerCode.slice(0, 8)}`,
        aprovadas: row.total,
        ativas: row.active,
      })),
    [funnelRows],
  );

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
        <h1 className="text-3xl font-bold">Admin Enterprise Hub</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">Gestão financeira avançada, growth e operações.</p>
        <p className="mt-1 text-xs text-[var(--carvao)]/70">
          Insights de IA: engine analítica orientada por dados (heurística + regras), não modelo generativo LLM.
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Bruto" value={toCurrency(stats.grossCents)} />
            <MetricCard label="Líquido" value={toCurrency(stats.netCents)} />
            <MetricCard label="Lucro" value={toCurrency(stats.profitCents)} />
            <MetricCard label="Taxas" value={toCurrency(stats.feeCents)} />
            <MetricCard label="Estornos" value={toCurrency(stats.refundsCents)} />
            <MetricCard label="Margem" value={`${stats.marginRate}%`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 xl:col-span-2">
              <h2 className="font-semibold">Bruto x Líquido (linha temporal)</h2>
              <div className="mt-3 h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.25} />
                    <XAxis dataKey="date" stroke={chartPalette.bgStroke} />
                    <YAxis stroke={chartPalette.bgStroke} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gross" name="Bruto (R$)" stroke={chartPalette.gross} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="net" name="Líquido (R$)" stroke={chartPalette.net} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Mix de pagamento</h2>
              <div className="mt-3 h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentPieData} dataKey="value" nameKey="name" outerRadius={105} fill={chartPalette.line2} label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Volume diário</h2>
              <div className="mt-3 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.2} />
                    <XAxis dataKey="date" stroke={chartPalette.bgStroke} />
                    <YAxis stroke={chartPalette.bgStroke} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sales" name="Vendas" stroke={chartPalette.sales} fill={chartPalette.sales} fillOpacity={0.25} />
                    <Area type="monotone" dataKey="refunds" name="Estornos" stroke={chartPalette.refunds} fill={chartPalette.refunds} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Líquido médio por método</h2>
              <div className="mt-3 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodRows.map((row) => ({ method: row.method, avg: Number((row.avgNetCents / 100).toFixed(2)) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.2} />
                    <XAxis dataKey="method" stroke={chartPalette.bgStroke} />
                    <YAxis stroke={chartPalette.bgStroke} />
                    <Tooltip />
                    <Bar dataKey="avg" name="Líquido Médio (R$)" fill={chartPalette.net} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {tab === "growth" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Vendas / Ativas" value={`${stats.salesCount}/${stats.keptSalesCount}`} />
            <MetricCard label="Ticket Bruto" value={toCurrency(stats.avgGrossTicket)} />
            <MetricCard label="Ticket Líquido" value={toCurrency(stats.avgNetTicket)} />
            <MetricCard label="Refund rate" value={`${stats.refundRate}%`} />
            <MetricCard label="Tendência" value={`${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate}%`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Funil produto/oferta</h2>
              <div className="mt-3 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.2} />
                    <XAxis dataKey="name" stroke={chartPalette.bgStroke} />
                    <YAxis stroke={chartPalette.bgStroke} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aprovadas" fill={chartPalette.gross} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="ativas" fill={chartPalette.net} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Status das vendas</h2>
              <div className="mt-3 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" outerRadius={105} fill={chartPalette.sales} label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Análises automáticas orientadas por dados</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {aiInsights.map((item, idx) => (
                  <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">{item}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <h2 className="font-semibold">Sugestões de criativos e distribuição</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {creativeIdeas.map((item, idx) => (
                  <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">Top produtos por volume</h2>
            <div className="mt-3 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts.slice(0, 8).map((item) => ({ name: item.title.slice(0, 20), vendas: item.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.2} />
                  <XAxis dataKey="name" stroke={chartPalette.bgStroke} />
                  <YAxis stroke={chartPalette.bgStroke} />
                  <Tooltip />
                  <Bar dataKey="vendas" fill={chartPalette.line2} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "operations" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Usuários ativos / total" value={`${stats.activeUsersCount}/${stats.usersCount}`} />
            <MetricCard label="Produtos" value={`${stats.productsCount}`} />
            <MetricCard label="Compras ativas" value={`${stats.activePurchasesCount}`} />
            <MetricCard label="Refund/Chargeback" value={`${stats.refundedCount}`} />
          </div>
          <AdminConsole openTickets={openTickets} users={users} products={products} />
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--carvao)]/75">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
