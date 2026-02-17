"use client";

import { useState } from "react";

type AdminConsoleProps = {
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
};

export function AdminConsole({ openTickets, users }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<"users" | "products" | "support">("users");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<"USER" | "ADMIN">("USER");
  const [productSlug, setProductSlug] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [caktoProductId, setCaktoProductId] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [offerId, setOfferId] = useState("");
  const [adminReply, setAdminReply] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createUser() {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword,
          role: userRole,
        }),
      });
      if (!response.ok) {
        setFeedback("Falha ao criar usuario.");
        return;
      }
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("USER");
      setFeedback("Usuario criado com sucesso.");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productSlug.trim(),
          title: productTitle.trim(),
          caktoProductId: caktoProductId.trim(),
          offerCheckoutUrl: checkoutUrl.trim(),
          caktoOfferId: offerId.trim(),
        }),
      });
      if (!response.ok) {
        setFeedback("Falha ao criar produto.");
        return;
      }
      setProductSlug("");
      setProductTitle("");
      setCaktoProductId("");
      setCheckoutUrl("");
      setOfferId("");
      setFeedback("Produto criado com sucesso.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(ticketId: string) {
    const content = adminReply[ticketId]?.trim();
    if (!content) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        setFeedback("Falha ao responder ticket.");
        return;
      }
      setAdminReply((prev) => ({ ...prev, [ticketId]: "" }));
      setFeedback("Resposta enviada.");
    } finally {
      setLoading(false);
    }
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        setFeedback("Falha ao atualizar status.");
        return;
      }
      setFeedback("Status atualizado.");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId: string, payload: { active?: boolean; role?: "USER" | "ADMIN" }) {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setFeedback("Falha ao atualizar usuario.");
        return;
      }
      setFeedback("Usuario atualizado. Recarregue a pagina para refletir.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Excluir este usuario? Esta acao e permanente.")) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setFeedback("Falha ao excluir usuario.");
        return;
      }
      setFeedback("Usuario excluido. Recarregue a pagina para refletir.");
    } finally {
      setLoading(false);
    }
  }

  async function sendResetPassword(userId: string) {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      if (!response.ok) {
        setFeedback("Falha ao enviar e-mail de redefinicao.");
        return;
      }
      setFeedback("E-mail de redefinicao enviado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-sm">{feedback}</div> : null}

      <div className="rounded-2xl border border-white/60 bg-white/75 p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === "users" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}
          >
            Usuarios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === "products" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}
          >
            Produtos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === "support" ? "bg-[var(--ink)] text-white" : "border border-[var(--ink)]/25 bg-white"}`}
          >
            Suporte
          </button>
        </div>
      </div>

      {activeTab === "products" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <h2 className="font-semibold">Criar usuario</h2>
            <div className="mt-3 space-y-2">
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nome" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="E-mail" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Senha inicial" type="password" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <select value={userRole} onChange={(e) => setUserRole(e.target.value as "USER" | "ADMIN")} className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button type="button" disabled={loading} onClick={createUser} className="w-full rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                Criar usuario
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <h2 className="font-semibold">Criar produto</h2>
            <div className="mt-3 space-y-2">
              <input value={productSlug} onChange={(e) => setProductSlug(e.target.value)} placeholder="Slug (ex: foco)" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Titulo" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={caktoProductId} onChange={(e) => setCaktoProductId(e.target.value)} placeholder="Cakto product id (opcional)" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="Cakto offer id (opcional)" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <input value={checkoutUrl} onChange={(e) => setCheckoutUrl(e.target.value)} placeholder="Checkout URL (opcional)" className="w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm" />
              <button type="button" disabled={loading} onClick={createProduct} className="w-full rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                Criar produto
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "users" ? (
        <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="font-semibold">Controle de usuarios</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--carvao)]/75">
                  <th className="px-2 py-1">Usuario</th>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Compras</th>
                  <th className="px-2 py-1">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-t border-[var(--dourado)]/25">
                    <td className="px-2 py-2">
                      <p className="font-medium">{entry.name ?? "Sem nome"}</p>
                      <p className="text-xs text-[var(--carvao)]/75">{entry.email}</p>
                    </td>
                    <td className="px-2 py-2">{entry.role}</td>
                    <td className="px-2 py-2">{entry.active ? "ATIVO" : "INATIVO"}</td>
                    <td className="px-2 py-2">{entry.purchasesCount}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateUser(entry.id, { active: !entry.active })}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {entry.active ? "Inativar" : "Reativar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateUser(entry.id, { role: entry.role === "ADMIN" ? "USER" : "ADMIN" })}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          {entry.role === "ADMIN" ? "Remover admin" : "Tornar admin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => sendResetPassword(entry.id)}
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          Enviar redefinicao
                        </button>
                        <button type="button" onClick={() => deleteUser(entry.id)} className="rounded-md border px-2 py-1 text-xs text-red-700">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab === "support" ? (
        <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="font-semibold">Tickets de suporte</h2>
          <div className="mt-3 space-y-3">
            {openTickets.length === 0 ? (
              <p className="text-sm text-[var(--carvao)]/70">Nenhum ticket aberto no momento.</p>
            ) : (
              openTickets.map((ticket) => (
                <article key={ticket.id} className="rounded-xl border border-[var(--dourado)]/45 bg-white p-3">
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-[var(--carvao)]/80">
                    {ticket.userEmail} • {ticket.status}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateTicketStatus(ticket.id, "HUMAN_QUEUE")} className="rounded-md border px-2 py-1 text-xs">
                      Marcar fila humana
                    </button>
                    <button type="button" onClick={() => updateTicketStatus(ticket.id, "RESOLVED")} className="rounded-md border px-2 py-1 text-xs">
                      Resolver
                    </button>
                  </div>
                  <textarea
                    value={adminReply[ticket.id] ?? ""}
                    onChange={(event) => setAdminReply((prev) => ({ ...prev, [ticket.id]: event.target.value }))}
                    rows={2}
                    placeholder="Resposta humana"
                    className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => sendReply(ticket.id)}
                    className="mt-2 rounded-md bg-[var(--ink)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Enviar resposta
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
