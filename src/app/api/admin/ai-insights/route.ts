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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "OPENROUTER_API_KEY não configurada" }, { status: 400 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });

  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto";
  const data = parsed.data;

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

Período: ${data.from ?? "N/A"} até ${data.to ?? "N/A"}
Stats: ${JSON.stringify(data.stats)}
Métodos: ${JSON.stringify(data.paymentMethodRows)}
Top Produtos: ${JSON.stringify(data.topProducts)}
Status: ${JSON.stringify(data.statusDistribution)}
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      max_tokens: 650,
      messages: [
        {
          role: "system",
          content: "Você é especialista em growth e analytics para infoprodutos.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ ok: false, error: `OpenRouter error: ${errorText}` }, { status: 502 });
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content ?? "";
  const parsedJson = parseJsonBlock(content);

  if (!parsedJson) {
    return NextResponse.json({ ok: false, error: "Resposta da IA em formato inválido" }, { status: 502 });
  }

  const insights = (parsedJson.insights ?? []).filter(Boolean).slice(0, 8);
  const creativeIdeas = (parsedJson.creativeIdeas ?? []).filter(Boolean).slice(0, 8);

  return NextResponse.json({ ok: true, insights, creativeIdeas, model });
}
