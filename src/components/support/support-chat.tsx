"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TicketSummary = {
  id: string;
  subject: string;
  status: "OPEN" | "HUMAN_QUEUE" | "WAITING_CUSTOMER" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messagesCount: number;
};

type Message = {
  id: string;
  authorType: "USER" | "AI" | "ADMIN" | "SYSTEM";
  content: string;
  createdAt: string;
  sender?: { id: string; name: string | null; email: string } | null;
};

type SupportChatProps = {
  userEmail: string;
};

const STATUS_LABEL: Record<TicketSummary["status"], string> = {
  OPEN: "Aberto (IA)",
  HUMAN_QUEUE: "Na fila humana",
  WAITING_CUSTOMER: "Aguardando cliente",
  RESOLVED: "Resolvido",
};

export function SupportChat({ userEmail }: SupportChatProps) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );

  const loadTickets = useCallback(async () => {
    const response = await fetch("/api/support/tickets", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { tickets: TicketSummary[] };
    setTickets(data.tickets ?? []);
    if (!selectedTicketId && data.tickets?.[0]) setSelectedTicketId(data.tickets[0].id);
  }, [selectedTicketId]);

  const loadMessages = useCallback(async (ticketId: string) => {
    const response = await fetch(`/api/support/tickets/${ticketId}/messages`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { messages: Message[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedTicketId);
  }, [loadMessages, selectedTicketId]);

  async function handleCreateTicket() {
    if (!subject.trim() || !openingMessage.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: openingMessage.trim(),
        }),
      });
      if (!response.ok) {
        setFeedback("Nao foi possivel abrir o ticket agora.");
        return;
      }
      const data = (await response.json()) as { ticket?: { id: string } };
      setSubject("");
      setOpeningMessage("");
      await loadTickets();
      if (data.ticket?.id) setSelectedTicketId(data.ticket.id);
      setFeedback("Ticket aberto com sucesso.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReply() {
    if (!selectedTicketId || !replyMessage.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/support/tickets/${selectedTicketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyMessage.trim() }),
      });
      if (!response.ok) {
        setFeedback("Nao foi possivel enviar a mensagem.");
        return;
      }
      setReplyMessage("");
      await Promise.all([loadTickets(), loadMessages(selectedTicketId)]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="interactive-lift rounded-2xl border border-white/60 bg-white/75 p-5">
        <h1 className="text-3xl font-bold">Suporte</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Chat IA + atendimento humano. Conta atual: <strong>{userEmail}</strong>
        </p>
        <div className="mt-3 rounded-lg border border-[var(--dourado)]/40 bg-[var(--creme)]/70 p-3 text-xs text-[var(--carvao)]/80">
          A IA responde somente sobre produtos e funcionamento do site (acesso, compra, pagamento, download e área de membros).
          Para outros temas, escreva <strong>&quot;falar com atendente&quot;</strong>.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        <aside className="space-y-4">
          <div className="interactive-lift rounded-2xl border border-white/60 bg-white/75 p-4">
            <h2 className="font-semibold">Abrir novo ticket</h2>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Assunto (ex: Nao recebi o link)"
              className="mt-3 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
            />
            <textarea
              value={openingMessage}
              onChange={(event) => setOpeningMessage(event.target.value)}
              rows={4}
              placeholder="Descreva sua duvida"
              className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Abrir ticket
            </button>
            {feedback ? <p className="mt-2 text-xs text-[var(--carvao)]/80">{feedback}</p> : null}
          </div>

          <div className="interactive-lift rounded-2xl border border-white/60 bg-white/75 p-4">
            <h2 className="font-semibold">Tickets</h2>
            <div className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {tickets.length === 0 ? (
                <p className="text-sm text-[var(--carvao)]/70">Nenhum ticket aberto ainda.</p>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`interactive-lift w-full rounded-lg border p-3 text-left text-sm ${
                      ticket.id === selectedTicketId
                        ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                        : "border-[var(--dourado)]/45 bg-white"
                    }`}
                  >
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="mt-1 text-xs opacity-85">{STATUS_LABEL[ticket.status]}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="interactive-lift rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="font-semibold">Conversa</h2>
          {selectedTicket ? (
            <p className="mt-1 text-xs text-[var(--carvao)]/75">
              Ticket: <strong>{selectedTicket.subject}</strong> • {STATUS_LABEL[selectedTicket.status]}
            </p>
          ) : null}
          <div className="mt-3 h-[26rem] space-y-2 overflow-y-auto rounded-lg border border-[var(--dourado)]/35 bg-white p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--carvao)]/70">Selecione um ticket para visualizar as mensagens.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    message.authorType === "USER"
                      ? "ml-auto bg-[var(--ink)] text-white"
                      : message.authorType === "ADMIN"
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border border-[var(--dourado)]/45 bg-[#fff8ea]"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80">
                    {message.authorType === "USER"
                      ? "Voce"
                      : message.authorType === "ADMIN"
                        ? "Atendimento humano"
                        : "Assistente IA"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <textarea
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              rows={2}
              placeholder={selectedTicket ? "Digite sua mensagem..." : "Abra ou selecione um ticket"}
              disabled={!selectedTicket || loading}
              className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSendReply}
              disabled={!selectedTicket || loading}
              className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
