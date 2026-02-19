"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
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
import { useMemo, useState } from "react";

const chartPalette = {
  gross: "#2563eb",
  net: "#059669",
  fees: "#f59e0b",
  refunds: "#ef4444",
  sales: "#7c3aed",
  bgStroke: "#94a3b8",
};

const piePalette = ["#2563eb", "#06b6d4", "#7c3aed", "#059669", "#f59e0b", "#ef4444", "#64748b"];

function toBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function tooltipCurrency(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return toBrl(Number.isFinite(numeric) ? numeric : 0);
}

type FinanceTabChartsProps = {
  dailyFinance: Array<{ date: string; sales: number; grossCents: number; netCents: number; refunds: number }>;
  paymentMethodRows: Array<{
    method: string;
    total: number;
    avgNetCents: number;
  }>;
  trendMode: "revenue" | "volume";
  showGross: boolean;
  showNet: boolean;
  showFees: boolean;
  setTrendMode: (mode: "revenue" | "volume") => void;
  setShowGross: (next: boolean | ((prev: boolean) => boolean)) => void;
  setShowNet: (next: boolean | ((prev: boolean) => boolean)) => void;
  setShowFees: (next: boolean | ((prev: boolean) => boolean)) => void;
};

export function FinanceTabCharts({
  dailyFinance,
  paymentMethodRows,
  trendMode,
  showGross,
  showNet,
  showFees,
  setTrendMode,
  setShowGross,
  setShowNet,
  setShowFees,
}: FinanceTabChartsProps) {
  const [activePaymentSlice, setActivePaymentSlice] = useState<number | null>(null);

  const dailySeries = useMemo(
    () =>
      dailyFinance.map((entry) => ({
        date: entry.date.slice(5),
        sales: entry.sales,
        gross: Number((entry.grossCents / 100).toFixed(2)),
        net: Number((entry.netCents / 100).toFixed(2)),
        fees: Number(((entry.grossCents - entry.netCents) / 100).toFixed(2)),
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

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Série temporal</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              <button type="button" onClick={() => setTrendMode("revenue")} className={`rounded-md px-2 py-1 font-semibold ${trendMode === "revenue" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Receita</button>
              <button type="button" onClick={() => setTrendMode("volume")} className={`rounded-md px-2 py-1 font-semibold ${trendMode === "volume" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Volume</button>
              <button type="button" onClick={() => setShowGross((v) => !v)} className={`rounded-md px-2 py-1 font-semibold ${showGross ? "bg-blue-600 text-white" : "border border-blue-300 bg-white text-blue-700"}`}>Bruto</button>
              <button type="button" onClick={() => setShowNet((v) => !v)} className={`rounded-md px-2 py-1 font-semibold ${showNet ? "bg-emerald-600 text-white" : "border border-emerald-300 bg-white text-emerald-700"}`}>Líquido</button>
              <button type="button" onClick={() => setShowFees((v) => !v)} className={`rounded-md px-2 py-1 font-semibold ${showFees ? "bg-amber-600 text-white" : "border border-amber-300 bg-white text-amber-700"}`}>Taxas</button>
            </div>
          </div>
          <div className="mt-3 h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.bgStroke} opacity={0.25} />
                <XAxis dataKey="date" stroke={chartPalette.bgStroke} />
                <YAxis stroke={chartPalette.bgStroke} />
                <Tooltip formatter={(value) => tooltipCurrency(value)} />
                <Legend />
                {trendMode === "revenue" && showGross ? <Line type="monotone" dataKey="gross" name="Bruto (R$)" stroke={chartPalette.gross} strokeWidth={2.5} dot={false} /> : null}
                {trendMode === "revenue" && showNet ? <Line type="monotone" dataKey="net" name="Líquido (R$)" stroke={chartPalette.net} strokeWidth={2.5} dot={false} /> : null}
                {trendMode === "revenue" && showFees ? <Line type="monotone" dataKey="fees" name="Taxas (R$)" stroke={chartPalette.fees} strokeWidth={2.5} dot={false} /> : null}
                {trendMode === "volume" ? <Line type="monotone" dataKey="sales" name="Vendas" stroke={chartPalette.sales} strokeWidth={2.8} dot={false} /> : null}
                {trendMode === "volume" ? <Line type="monotone" dataKey="refunds" name="Estornos" stroke={chartPalette.refunds} strokeWidth={2.4} dot={false} /> : null}
                <Brush dataKey="date" height={20} stroke={chartPalette.bgStroke} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
          <h2 className="font-semibold">Mix de pagamento</h2>
          <div className="mt-3 h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={105}
                  label
                  onMouseEnter={(_, index) => setActivePaymentSlice(index)}
                  onMouseLeave={() => setActivePaymentSlice(null)}
                >
                  {paymentPieData.map((_, index) => (
                    <Cell
                      key={`payment-cell-${index}`}
                      fill={piePalette[index % piePalette.length]}
                      fillOpacity={activePaymentSlice === null || activePaymentSlice === index ? 1 : 0.35}
                    />
                  ))}
                </Pie>
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
                <Brush dataKey="date" height={18} stroke={chartPalette.bgStroke} />
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
                <Tooltip formatter={(value) => tooltipCurrency(value)} />
                <Bar dataKey="avg" name="Líquido Médio (R$)" fill={chartPalette.net} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}

