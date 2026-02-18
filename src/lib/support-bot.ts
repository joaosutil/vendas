const BOT_NAME = "Assistente MDT";

type SupportAiContext = {
  products: string[];
  siteName?: string;
};

function fallbackReply() {
  return `${BOT_NAME}: recebi sua mensagem e já deixei seu chamado em acompanhamento. Se preferir atendimento humano, responda "falar com atendente".`;
}

function isScopeAllowed(message: string, products: string[]) {
  const normalized = message.toLowerCase();
  const siteTerms = [
    "site",
    "login",
    "acesso",
    "senha",
    "reembolso",
    "pagamento",
    "checkout",
    "compra",
    "pdf",
    "download",
    "curso",
    "produto",
    "area de membros",
    "área de membros",
  ];
  if (siteTerms.some((term) => normalized.includes(term))) return true;
  return products.some((product) => normalized.includes(product.toLowerCase()));
}

function fallbackScopedReply(products: string[]) {
  const productsLabel = products.length ? products.join(", ") : "nossos produtos";
  return `${BOT_NAME}: consigo ajudar apenas com dúvidas sobre ${productsLabel}, acesso, pagamentos e uso do site. Se quiser outro assunto, posso encaminhar para atendimento humano.`;
}

async function askOpenRouter(message: string, context: SupportAiContext) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto";
  const siteName = context.siteName ?? "Marketing Digital Top";
  const prompt = `
Você é suporte oficial de ${siteName}. Responda SOMENTE sobre produtos e funcionamento do site.
Produtos disponíveis: ${context.products.join(", ") || "Produto principal: Como Derrotar a Ansiedade"}.
Regras:
- Resposta curta (máx 4 linhas), clara e útil.
- Não invente política.
- Se a pergunta fugir do escopo produto/site, recuse de forma educada e ofereça atendimento humano.

Mensagem do usuário:
${message}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_BASE_URL ?? "https://marketingdigi.shop",
        "X-Title": "MarketingDigi SupportBot",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          { role: "system", content: `Você é suporte de ${siteName}, focado em produto e site.` },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateSupportAiReply(message: string, context: SupportAiContext) {
  const normalized = message.toLowerCase();

  if (!isScopeAllowed(message, context.products)) {
    return fallbackScopedReply(context.products);
  }

  if (normalized.includes("falar com atendente") || normalized.includes("humano") || normalized.includes("whatsapp")) {
    return `${BOT_NAME}: combinado. Encaminhei seu chamado para atendimento humano e seu ticket ficará na fila prioritária.`;
  }

  const llmReply = await askOpenRouter(message, context);
  if (llmReply) return `${BOT_NAME}: ${llmReply}`;

  if (normalized.includes("senha") || normalized.includes("login") || normalized.includes("acesso")) {
    return `${BOT_NAME}: para acesso, use o e-mail da compra em /login. Se esqueceu a senha, use "Esqueci minha senha".`;
  }
  if (normalized.includes("reembolso") || normalized.includes("refund")) {
    return `${BOT_NAME}: pedidos de reembolso seguem o prazo de 7 dias da plataforma. Posso encaminhar para atendimento humano agora.`;
  }
  if (normalized.includes("pdf") || normalized.includes("download")) {
    return `${BOT_NAME}: o download fica dentro da área do produto em "Baixar PDF identificado". Se houver erro no arquivo, me envie a mensagem de erro.`;
  }
  if (normalized.includes("pagamento") || normalized.includes("cakto") || normalized.includes("compra")) {
    return `${BOT_NAME}: pagamento aprovado gera acesso automaticamente. Se não recebeu e-mail, confira Spam/Promoções e informe o e-mail da compra.`;
  }

  return fallbackReply();
}

export function shouldEscalateToHuman(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("falar com atendente") ||
    normalized.includes("humano") ||
    normalized.includes("processo judicial") ||
    normalized.includes("procon") ||
    normalized.includes("reembolso")
  );
}
