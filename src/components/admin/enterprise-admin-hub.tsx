"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AdminConsole } from "@/components/admin/admin-console";

function toCurrency(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueCents / 100);
}

function normalizeInsightLine(item: unknown): string {
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const knownCreative = ("gancho3s" in record || "roteiro" in record || "gatilho" in record || "canal" in record);
    if (knownCreative) {
      const parts = [
        typeof record.gancho3s === "string" ? `Gancho: ${record.gancho3s}` : "",
        typeof record.roteiro === "string" ? `Roteiro: ${record.roteiro}` : "",
        typeof record.gatilho === "string" ? `Gatilho: ${record.gatilho}` : "",
        typeof record.canal === "string" ? `Canal: ${record.canal}` : "",
      ].filter(Boolean);
      if (parts.length) return parts.join(" | ");
    }
    return Object.entries(record)
      .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
      .join(" | ");
  }
  return "";
}

function normalizeInsightList(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeInsightLine).map((entry) => entry.trim()).filter(Boolean).slice(0, 20);
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
  analyticsTruncated: boolean;
  openTickets: Array<{
    id: string;
    subject: string;
    status: string;
    userEmail: string;
    hasUnread: boolean;
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

type SavedSnapshot = {
  id: string;
  name: string;
  fromDate?: string | null;
  toDate?: string | null;
  insights: string[];
  creativeIdeas: string[];
  createdAt: string;
  createdBy?: { email?: string | null; name?: string | null } | null;
};

const FinanceTabCharts = dynamic(
  () => import("@/components/admin/finance-tab-charts").then((module) => module.FinanceTabCharts),
  {
    ssr: false,
    loading: () => <div className="h-[660px] rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)]/70 animate-pulse" />,
  },
);

const GrowthTabCharts = dynamic(
  () => import("@/components/admin/growth-tab-charts").then((module) => module.GrowthTabCharts),
  {
    ssr: false,
    loading: () => <div className="h-[660px] rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)]/70 animate-pulse" />,
  },
);

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  analyticsTruncated,
  openTickets,
  users,
  products,
}: EnterpriseAdminHubProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"finance" | "growth" | "operations">("finance");
  const [liveRefresh, setLiveRefresh] = useState(true);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(new Date());
  const [aiInsightsState, setAiInsightsState] = useState(aiInsights);
  const [creativeIdeasState, setCreativeIdeasState] = useState(creativeIdeas);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [growthTab, setGrowthTab] = useState<"generated" | "saved">("generated");
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [trendMode, setTrendMode] = useState<"revenue" | "volume">("revenue");
  const [showGross, setShowGross] = useState(true);
  const [showNet, setShowNet] = useState(true);
  const [showFees, setShowFees] = useState(false);
  const quickRanges = useMemo(() => {
    const end = new Date();
    const buildRange = (days: number) => {
      const start = new Date(end);
      start.setDate(start.getDate() - (days - 1));
      const startIso = formatLocalDate(start);
      const endIso = formatLocalDate(end);
      return `/admin?from=${encodeURIComponent(startIso)}&to=${encodeURIComponent(endIso)}`;
    };
    return {
      d7: buildRange(7),
      d14: buildRange(14),
      d30: buildRange(30),
    };
  }, []);

  useEffect(() => {
    if (!liveRefresh) return;
    const timer = window.setInterval(() => {
      router.refresh();
      setLastRefreshAt(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, [liveRefresh, router]);

  async function generateWithOpenRouter() {
    setAiLoading(true);
    setAiError(null);
    setAiNotice(null);
    try {
      const response = await fetch("/api/admin/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromValue,
          to: toValue,
          stats: {
            grossCents: stats.grossCents,
            netCents: stats.netCents,
            profitCents: stats.profitCents,
            refundRate: stats.refundRate,
            retentionRate: stats.retentionRate,
            marginRate: stats.marginRate,
            growthRate: stats.growthRate,
            avgGrossTicket: stats.avgGrossTicket,
            avgNetTicket: stats.avgNetTicket,
            salesCount: stats.salesCount,
            keptSalesCount: stats.keptSalesCount,
          },
          paymentMethodRows: paymentMethodRows.map((row) => ({
            method: row.method,
            share: row.share,
            avgNetCents: row.avgNetCents,
          })),
          topProducts,
          statusDistribution,
        }),
      });

      const rawText = await response.text();
      let data:
        | {
            ok: boolean;
            error?: string;
            insights?: string[];
            creativeIdeas?: string[];
            warning?: string;
          }
        | null = null;
      try {
        data = JSON.parse(rawText) as {
          ok: boolean;
          error?: string;
          insights?: string[];
          creativeIdeas?: string[];
          warning?: string;
        };
      } catch {
        data = null;
      }

      if (!response.ok || !data?.ok) {
        setAiError(data?.error ?? `Falha OpenRouter (${response.status}). Resposta: ${rawText.slice(0, 180)}`);
        return;
      }

      const normalizedInsights = normalizeInsightList(data.insights);
      const normalizedCreatives = normalizeInsightList(data.creativeIdeas);
      setAiInsightsState(normalizedInsights.length ? normalizedInsights : aiInsights);
      setCreativeIdeasState(normalizedCreatives.length ? normalizedCreatives : creativeIdeas);
      if (data.warning) setAiNotice(data.warning);
    } catch {
      setAiError("Erro de comunicação com o endpoint de IA.");
    } finally {
      setAiLoading(false);
    }
  }

  async function loadSavedSnapshots() {
    setLoadingSnapshots(true);
    setAiError(null);
    try {
      const response = await fetch("/api/admin/ai-insights/snapshots", { cache: "no-store" });
      const data = (await response.json()) as {
        ok: boolean;
        snapshots?: Array<{
          id: string;
          name: string;
          fromDate?: string | null;
          toDate?: string | null;
          insights: unknown;
          creativeIdeas: unknown;
          createdAt: string;
          createdBy?: { email?: string | null; name?: string | null } | null;
        }>;
      };
      if (!response.ok || !data.ok) {
        setAiError("Falha ao carregar históricos salvos.");
        return;
      }
      const parsed: SavedSnapshot[] = (data.snapshots ?? []).map((entry) => ({
        id: entry.id,
        name: entry.name,
        fromDate: entry.fromDate,
        toDate: entry.toDate,
        insights: normalizeInsightList(entry.insights),
        creativeIdeas: normalizeInsightList(entry.creativeIdeas),
        createdAt: entry.createdAt,
        createdBy: entry.createdBy ?? null,
      }));
      setSavedSnapshots(parsed);
      if (!selectedSnapshotId && parsed[0]) setSelectedSnapshotId(parsed[0].id);
    } catch {
      setAiError("Erro ao carregar históricos salvos.");
    } finally {
      setLoadingSnapshots(false);
    }
  }

  async function saveCurrentInsights() {
    const trimmedName = snapshotName.trim();
    if (!trimmedName) {
      setAiError("Informe um nome para salvar o histórico.");
      return;
    }
    setSavingSnapshot(true);
    setAiError(null);
    try {
      const response = await fetch("/api/admin/ai-insights/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          fromDate: fromValue,
          toDate: toValue,
          insights: aiInsightsState,
          creativeIdeas: creativeIdeasState,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setAiError(data.error ?? "Falha ao salvar histórico.");
        return;
      }
      setSaveModalOpen(false);
      setSnapshotName("");
      setGrowthTab("saved");
      await loadSavedSnapshots();
      setAiNotice("Histórico salvo com sucesso.");
    } catch {
      setAiError("Erro ao salvar histórico.");
    } finally {
      setSavingSnapshot(false);
    }
  }

  function applySnapshot(snapshotId: string) {
    const snapshot = savedSnapshots.find((entry) => entry.id === snapshotId);
    if (!snapshot) return;
    setSelectedSnapshotId(snapshotId);
    setAiInsightsState(snapshot.insights);
    setCreativeIdeasState(snapshot.creativeIdeas);
    setAiNotice(`Aplicado histórico: ${snapshot.name}`);
  }

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-[#7aa5ff55] bg-[linear-gradient(130deg,#0f1b3d_0%,#172955_45%,#0f1b3d_100%)] p-5 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-[#67c7ff33] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#ffcb7330] blur-3xl" />
        <h1 className="text-3xl font-bold">Admin Enterprise Hub</h1>
        <p className="mt-1 text-sm text-white/85">Gestão financeira avançada, growth e operações.</p>
        <p className="mt-1 text-xs text-white/75">
          Insights de IA: OpenRouter quando disponível, com fallback analítico local para nunca parar sua operação.
        </p>
        {analyticsTruncated ? (
          <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
            Período com alto volume: o painel está mostrando a janela mais recente para manter performance estável.
          </p>
        ) : null}
        <form method="get" className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
            <input type="date" name="from" defaultValue={fromValue} className="rounded-lg border border-white/35 bg-white/95 px-3 py-2 text-sm text-[var(--ink)]" />
            <input type="date" name="to" defaultValue={toValue} className="rounded-lg border border-white/35 bg-white/95 px-3 py-2 text-sm text-[var(--ink)]" />
            <button type="submit" className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white">
              Aplicar filtro
            </button>
          <Link href={csvUrl} className="rounded-lg border border-[var(--ink)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
            Exportar CSV
          </Link>
        </form>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link prefetch href={quickRanges.d7} className="rounded-md border border-white/30 bg-white/10 px-2 py-1 font-semibold text-white">Últimos 7d</Link>
          <Link prefetch href={quickRanges.d14} className="rounded-md border border-white/30 bg-white/10 px-2 py-1 font-semibold text-white">Últimos 14d</Link>
          <Link prefetch href={quickRanges.d30} className="rounded-md border border-white/30 bg-white/10 px-2 py-1 font-semibold text-white">Últimos 30d</Link>
          <button
            type="button"
            onClick={() => setLiveRefresh((v) => !v)}
            className={`rounded-md border px-2 py-1 font-semibold ${liveRefresh ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-white/30 bg-white/10 text-white"}`}
          >
            Live {liveRefresh ? "ON" : "OFF"}
          </button>
          <span className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-[11px] text-white">
            Atualizado: {lastRefreshAt.toLocaleTimeString("pt-BR")}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("finance")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "finance" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Financeiro</button>
          <button type="button" onClick={() => setTab("growth")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "growth" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Growth IA</button>
          <button type="button" onClick={() => setTab("operations")} className={`rounded-md px-3 py-2 text-sm font-semibold ${tab === "operations" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}>Operações</button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
      {tab === "finance" ? (
        <motion.div
          key="tab-finance"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Bruto" value={toCurrency(stats.grossCents)} />
            <MetricCard label="Líquido" value={toCurrency(stats.netCents)} />
            <MetricCard label="Lucro" value={toCurrency(stats.profitCents)} />
            <MetricCard label="Taxas" value={toCurrency(stats.feeCents)} />
            <MetricCard label="Estornos" value={toCurrency(stats.refundsCents)} />
            <MetricCard label="Margem" value={`${stats.marginRate}%`} />
          </div>

          <FinanceTabCharts
            dailyFinance={dailyFinance}
            paymentMethodRows={paymentMethodRows}
            trendMode={trendMode}
            showGross={showGross}
            showNet={showNet}
            showFees={showFees}
            setTrendMode={setTrendMode}
            setShowGross={setShowGross}
            setShowNet={setShowNet}
            setShowFees={setShowFees}
          />
        </motion.div>
      ) : null}

      {tab === "growth" ? (
        <motion.div
          key="tab-growth"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Vendas / Ativas" value={`${stats.salesCount}/${stats.keptSalesCount}`} />
            <MetricCard label="Ticket Bruto" value={toCurrency(stats.avgGrossTicket)} />
            <MetricCard label="Ticket Líquido" value={toCurrency(stats.avgNetTicket)} />
            <MetricCard label="Refund rate" value={`${stats.refundRate}%`} />
            <MetricCard label="Tendência" value={`${stats.growthRate >= 0 ? "+" : ""}${stats.growthRate}%`} />
          </div>

          <GrowthTabCharts
            funnelRows={funnelRows}
            statusDistribution={statusDistribution}
            topProducts={topProducts}
          />

          <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Inteligência e biblioteca de históricos</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGrowthTab("generated")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    growthTab === "generated" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"
                  }`}
                >
                  Geradas agora
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGrowthTab("saved");
                    void loadSavedSnapshots();
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    growthTab === "saved" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"
                  }`}
                >
                  Salvas
                </button>
              </div>
            </div>

            {growthTab === "generated" ? (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={generateWithOpenRouter}
                    disabled={aiLoading}
                    className="rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {aiLoading ? "Gerando..." : "Gerar com OpenRouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(true)}
                    className="rounded-md border border-[var(--ink)]/30 bg-white px-3 py-1 text-xs font-semibold"
                  >
                    Salvar geração em aba
                  </button>
                </div>
                {aiError ? (
                  <p className="mt-2 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700">{aiError}</p>
                ) : null}
                {aiNotice ? (
                  <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">{aiNotice}</p>
                ) : null}
                <div className="mt-3 grid gap-4 xl:grid-cols-2">
                  <section>
                    <h3 className="text-sm font-semibold">Análises</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {aiInsightsState.map((item, idx) => (
                        <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold">Criativos</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {creativeIdeasState.map((item, idx) => (
                        <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            ) : (
              <div className="mt-3 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <aside className="rounded-xl border border-[var(--surface-border)] bg-white/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">Históricos salvos</p>
                    <button
                      type="button"
                      onClick={() => void loadSavedSnapshots()}
                      className="rounded-md border border-[var(--ink)]/25 bg-white px-2 py-1 text-[11px] font-semibold"
                    >
                      Atualizar
                    </button>
                  </div>
                  {loadingSnapshots ? <p className="text-xs text-[var(--carvao)]/70">Carregando...</p> : null}
                  <div className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
                    {savedSnapshots.map((snapshot) => (
                      <button
                        key={snapshot.id}
                        type="button"
                        onClick={() => applySnapshot(snapshot.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                          selectedSnapshotId === snapshot.id
                            ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                            : "border-[var(--dourado)]/35 bg-white"
                        }`}
                      >
                        <p className="font-semibold">{snapshot.name}</p>
                        <p className="mt-1 opacity-80">
                          {snapshot.fromDate ?? "-"} até {snapshot.toDate ?? "-"}
                        </p>
                        <p className="opacity-80">{new Date(snapshot.createdAt).toLocaleString("pt-BR")}</p>
                      </button>
                    ))}
                    {!loadingSnapshots && savedSnapshots.length === 0 ? (
                      <p className="text-xs text-[var(--carvao)]/70">Nenhum histórico salvo ainda.</p>
                    ) : null}
                  </div>
                </aside>
                <div className="grid gap-4 xl:grid-cols-2">
                  <section>
                    <h3 className="text-sm font-semibold">Análises da aba selecionada</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {aiInsightsState.map((item, idx) => (
                        <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold">Criativos da aba selecionada</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {creativeIdeasState.map((item, idx) => (
                        <li key={idx} className="rounded-md border border-[var(--dourado)]/35 bg-white px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            )}
          </section>

        </motion.div>
      ) : null}

      {tab === "operations" ? (
        <motion.div
          key="tab-operations"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Usuários ativos / total" value={`${stats.activeUsersCount}/${stats.usersCount}`} />
            <MetricCard label="Produtos" value={`${stats.productsCount}`} />
            <MetricCard label="Compras ativas" value={`${stats.activePurchasesCount}`} />
            <MetricCard label="Refund/Chargeback" value={`${stats.refundedCount}`} />
          </div>
          <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <h2 className="font-semibold">Ferramentas rápidas</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link prefetch href={quickRanges.d30} className="rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm font-semibold">
            Análise 30 dias
          </Link>
          <Link prefetch href={csvUrl} className="rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-sm font-semibold">
            Exportar planilha
          </Link>
              <button type="button" onClick={() => setTab("growth")} className="rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-left text-sm font-semibold">
                Gerar insights IA
              </button>
              <button type="button" onClick={() => setTab("operations")} className="rounded-lg border border-[var(--ink)]/20 bg-white px-3 py-2 text-left text-sm font-semibold">
                Atualizar painel
              </button>
            </div>
          </section>
          <AdminConsole openTickets={openTickets} users={users} products={products} />
        </motion.div>
      ) : null}
      </AnimatePresence>

      {saveModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 shadow-2xl">
            <h3 className="text-lg font-semibold">Salvar geração</h3>
            <p className="mt-1 text-xs text-[var(--carvao)]/75">
              Dê um nome para esta análise e criativos para aparecer na aba de históricos.
            </p>
            <input
              value={snapshotName}
              onChange={(event) => setSnapshotName(event.target.value)}
              className="mt-3 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
              placeholder="Ex: Campanha Fevereiro - Semana 3"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaveModalOpen(false);
                  setSnapshotName("");
                }}
                className="rounded-md border border-[var(--ink)]/30 bg-white px-3 py-1 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveCurrentInsights}
                disabled={savingSnapshot}
                className="rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                {savingSnapshot ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="interactive-lift rounded-xl border border-[#7aa5ff55] bg-[linear-gradient(140deg,#ffffffd9_0%,#f6fbffde_100%)] p-4 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-[var(--carvao)]/75 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-black text-[var(--ink)]">{value}</p>
    </div>
  );
}
