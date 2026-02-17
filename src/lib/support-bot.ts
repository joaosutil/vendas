const BOT_NAME = "Assistente MDT";

function fallbackReply() {
  return `${BOT_NAME}: recebi sua mensagem e já deixei seu chamado em acompanhamento. Se preferir atendimento humano, responda "falar com atendente".`;
}

export function generateSupportAiReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("senha") || normalized.includes("login") || normalized.includes("acesso")) {
    return `${BOT_NAME}: para acesso, use o e-mail da compra em /login. Se esqueceu a senha, solicite novo link de definição de senha no suporte humano.`;
  }

  if (normalized.includes("reembolso") || normalized.includes("refund")) {
    return `${BOT_NAME}: pedidos de reembolso seguem o prazo de 7 dias da plataforma. Se quiser, já posso encaminhar seu ticket para atendimento humano.`;
  }

  if (normalized.includes("pdf") || normalized.includes("download")) {
    return `${BOT_NAME}: o download fica dentro da área do produto em "Baixar PDF identificado". Se houver erro no arquivo, informe o texto do erro aqui.`;
  }

  if (normalized.includes("falar com atendente") || normalized.includes("humano") || normalized.includes("whatsapp")) {
    return `${BOT_NAME}: combinado. Encaminhei seu chamado para atendimento humano e seu ticket ficará na fila prioritária.`;
  }

  if (normalized.includes("pagamento") || normalized.includes("cakto") || normalized.includes("compra")) {
    return `${BOT_NAME}: pagamentos aprovados geram acesso automaticamente. Se não recebeu e-mail, confira Spam/Promoções e me informe o e-mail usado na compra.`;
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
