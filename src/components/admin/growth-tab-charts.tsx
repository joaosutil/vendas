"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  line2: "#06b6d4",
  bgStroke: "#94a3b8",
};

const piePalette = ["#2563eb", "#06b6d4", "#7c3aed", "#059669", "#f59e0b", "#ef4444", "#64748b"];

type GrowthTabChartsProps = {
  funnelRows: Array<{
    key: string;
    productTitle: string;
    offerCode: string;
    total: number;
    active: number;
  }>;
  statusDistribution: Array<{ status: string; count: number }>;
  topProducts: Array<{ title: string; count: number }>;
};

export function GrowthTabCharts({ funnelRows, statusDistribution, topProducts }: GrowthTabChartsProps) {
  const [activeStatusSlice, setActiveStatusSlice] = useState<number | null>(null);

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
    <>
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
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={105}
                  label
                  onMouseEnter={(_, index) => setActiveStatusSlice(index)}
                  onMouseLeave={() => setActiveStatusSlice(null)}
                >
                  {statusPieData.map((_, index) => (
                    <Cell
                      key={`status-cell-${index}`}
                      fill={piePalette[index % piePalette.length]}
                      fillOpacity={activeStatusSlice === null || activeStatusSlice === index ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
    </>
  );
}

