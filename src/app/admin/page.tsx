import { prisma } from "@/lib/prisma";
import { AdminConsole } from "@/components/admin/admin-console";

export default async function AdminPage() {
  const [usersCount, productsCount, activePurchasesCount, refundedCount, openTickets, recentPurchases] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.purchase.count({ where: { status: "ACTIVE" } }),
    prisma.purchase.count({ where: { status: { in: ["REFUNDED", "CHARGEBACK"] } } }),
    prisma.supportTicket.findMany({
      where: { status: { in: ["OPEN", "HUMAN_QUEUE", "WAITING_CUSTOMER"] } },
      orderBy: { lastMessageAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true } },
        product: { select: { title: true } },
      },
    }),
  ]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/75 p-5">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Controle financeiro, acessos, suporte e cadastro de novos produtos/usuarios.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Usuarios</p>
          <p className="mt-1 text-3xl font-black">{usersCount}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Produtos</p>
          <p className="mt-1 text-3xl font-black">{productsCount}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Compras ativas</p>
          <p className="mt-1 text-3xl font-black">{activePurchasesCount}</p>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/75 p-4">
          <p className="text-xs text-[var(--carvao)]/75">Refund/chargeback</p>
          <p className="mt-1 text-3xl font-black">{refundedCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="font-semibold">Compras recentes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--carvao)]/75">
                <th className="px-2 py-1">Data</th>
                <th className="px-2 py-1">Usuario</th>
                <th className="px-2 py-1">Produto</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-t border-[var(--dourado)]/25">
                  <td className="px-2 py-1">{new Date(purchase.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="px-2 py-1">{purchase.user.email}</td>
                  <td className="px-2 py-1">{purchase.product.title}</td>
                  <td className="px-2 py-1">{purchase.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminConsole
        openTickets={openTickets.map((ticket) => ({
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status,
          userEmail: ticket.user.email,
          lastMessageAt: ticket.lastMessageAt.toISOString(),
        }))}
      />
    </section>
  );
}
