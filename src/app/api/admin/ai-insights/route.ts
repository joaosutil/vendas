import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const payloadSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  stats: z.object({
    grossCents: z.number(),
    netCents: z.number(),
    profitCents: z.number(),
    refundRate: z.number(),
    retentionRate: z.number(),
    marginRate: z.number(),
    growthRate: z.number(),
    avgGrossTicket: z.number(),
    avgNetTicket: z.number(),
    salesCount: z.number(),
    keptSalesCount: z.number(),
  }),
  paymentMethodRows: z
    .array(
      z.object({
        method: z.string(),
        share: z.number(),
        avgNetCents: z.number(),
      }),
    )
    .max(8),
  topProducts: z
    .array(
      z.object({
        title: z.string(),
        count: z.number(),
      }),
    )
    .max(8),
  statusDistribution: z
    .array(
      z.object({
        status: z.string(),
        count: z.number(),
      }),
    )
    .max(8),
});

function parseJsonBlock(input: string) {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const candidate = input.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as { insights?: string[]; creativeIdeas?: string[] };
  } catch {
    return null;
  }
}

function toReadableAiItem(item: unknown): string {
  if (typeof item === "string") return item.trim();
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    const knownCreative =
      ("gancho3s" in record || "roteiro" in record || "gatilho" in record || "canal" in record);
    if (knownCreative) {
      const gancho = typeof record.gancho3s === "string" ? record.gancho3s : "";
      const roteiro = typeof record.roteiro === "string" ? record.roteiro : "";
      const gatilho = typeof record.gatilho === "string" ? record.gatilho : "";
      const canal = typeof record.canal === "string" ? record.canal : "";
      const parts = [
        gancho ? `Gancho: ${gancho}` : "",
        roteiro ? `Roteiro: ${roteiro}` : "",
        gatilho ? `Gatilho: ${gatilho}` : "",
        canal ? `Canal: ${canal}` : "",
      ].filter(Boolean);
      if (parts.length) return parts.join(" | ");
    }

    const compact = Object.entries(record)
      .slice(0, 8)
      .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
      .join(" | ");
    return compact;
  }
  return "";
}

function normalizeAiList(items: unknown, max = 8): string[] {
  if (!Array.isArray(items)) return [];
  return items.map(toReadableAiItem).map((entry) => entry.trim()).filter(Boolean).slice(0, max);
}

function currency(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueCents / 100);
}

function buildHeuristicInsights(data: z.infer<typeof payloadSchema>) {
  const gross = data.stats.grossCents;
  const net = data.stats.netCents;
  const topMethod = data.paymentMethodRows[0];
  const topProduct = data.topProducts[0];

  const insights = [
    `Período ${data.from ?? "N/A"} até ${data.to ?? "N/A"}: bruto ${currency(gross)} e líquido ${currency(net)} (margem ${data.stats.marginRate}%).`,
    `Retenção ${data.stats.retentionRate}% e refund ${data.stats.refundRate}%. ${data.stats.refundRate > 12 ? "Priorize onboarding e alinhamento de promessa na oferta." : "Indicador saudável para escalar aquisição."}`,
    topMethod
      ? `Método líder: ${topMethod.method} com ${topMethod.share}% de participação e líquido médio ${currency(topMethod.avgNetCents)}.`
      : "Sem método dominante no período.",
    topProduct
      ? `Produto com maior tração: ${topProduct.title} (${topProduct.count} vendas). Teste criativos derivados desse campeão.`
      : "Sem produto com volume relevante no período.",
  ];

  const creativeIdeas = [
    "Criativo 1: gancho de 3 segundos com dor específica + prova curta + CTA direto para checkout.",
    "Criativo 2: roteiro UGC (problema > tentativa frustrada > método > resultado > CTA) com depoimento real.",
    "Criativo 3: carrossel de objeções (tempo, preço, confiança) com quebra por prova social.",
    "Criativo 4: anúncio comparativo antes/depois com urgência de sessão e bônus de ação imediata.",
  ];

  return { insights, creativeIdeas };
}

function toBrlNumber(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const raw = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    const fallback = buildHeuristicInsights(parsed.data);
    return NextResponse.json({
      ok: true,
      insights: fallback.insights,
      creativeIdeas: fallback.creativeIdeas,
      provider: "local-fallback",
      warning: "OPENROUTER_API_KEY não configurada",
    });
  }

  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto";
  const data = parsed.data;
  const statsForAi = {
    grossBRL: toBrlNumber(data.stats.grossCents),
    netBRL: toBrlNumber(data.stats.netCents),
    profitBRL: toBrlNumber(data.stats.profitCents),
    refundRate: data.stats.refundRate,
    retentionRate: data.stats.retentionRate,
    marginRate: data.stats.marginRate,
    growthRate: data.stats.growthRate,
    avgGrossTicketBRL: toBrlNumber(data.stats.avgGrossTicket),
    avgNetTicketBRL: toBrlNumber(data.stats.avgNetTicket),
    salesCount: data.stats.salesCount,
    keptSalesCount: data.stats.keptSalesCount,
  };
  const paymentForAi = data.paymentMethodRows.map((row) => ({
    method: row.method,
    share: row.share,
    avgNetBRL: toBrlNumber(row.avgNetCents),
  }));

  const prompt = `
Você é um diretor de growth e financeiro para infoprodutos.
Responda APENAS JSON válido no formato:
{
  "insights": ["...","...","...","..."],
  "creativeIdeas": ["...","...","...","..."]
}
Regras:
- Em português-BR.
- Nada genérico, usar os dados recebidos.
- Frases curtas, acionáveis e com prioridade.
- 4 insights e 4 ideias criativas.
- Todos os valores já estão em REAIS (não em centavos).
- Sempre escreva valores monetários com "R$" e vírgula decimal (ex: R$ 19,90), nunca "R$1990".

Período: ${data.from ?? "N/A"} até ${data.to ?? "N/A"}
Stats (em reais): ${JSON.stringify(statsForAi)}
Métodos (em reais): ${JSON.stringify(paymentForAi)}
Top Produtos: ${JSON.stringify(data.topProducts)}
Status: ${JSON.stringify(data.statusDistribution)}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_BASE_URL ?? "https://marketingdigi.shop",
        "X-Title": "MarketingDigi Admin",
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content:
              "Você é especialista em growth, copywriting e mídia paga para infoprodutos no Brasil. Foque em execução e resultado.",
          },
          {
            role: "user",
            content: `${prompt}

Também inclua, nas ideias criativas:
- Gancho de 3s
- Estrutura de roteiro (hook > problema > solução > prova > CTA)
- Gatilho psicológico principal (escassez, prova social, autoridade, especificidade, urgência de sessão)
- Canal recomendado (Reels/TikTok/Shorts/Meta Ads)`,
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (error) {
    const fallback = buildHeuristicInsights(data);
    const message = error instanceof Error ? error.message : "Falha de rede";
    return NextResponse.json({
      ok: true,
      insights: fallback.insights,
      creativeIdeas: fallback.creativeIdeas,
      provider: "local-fallback",
      warning: `Falha ao conectar OpenRouter: ${message}`,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const fallback = buildHeuristicInsights(data);
    return NextResponse.json({
      ok: true,
      insights: fallback.insights,
      creativeIdeas: fallback.creativeIdeas,
      provider: "local-fallback",
      warning: `OpenRouter error (${response.status})`,
    });
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content ?? "";
  const parsedJson = parseJsonBlock(content);

  if (!parsedJson) {
    const fallback = buildHeuristicInsights(data);
    return NextResponse.json({
      ok: true,
      insights: fallback.insights,
      creativeIdeas: fallback.creativeIdeas,
      provider: "local-fallback",
      warning: "OpenRouter respondeu fora do padrão e aplicamos fallback analítico local.",
    });
  }

  const insights = normalizeAiList(parsedJson.insights, 8);
  const creativeIdeas = normalizeAiList(parsedJson.creativeIdeas, 8);

  return NextResponse.json({ ok: true, insights, creativeIdeas, model });
}
