import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  const uniquePurchases = Array.from(
    new Map(purchases.map((purchase) => [purchase.productId, purchase])).values(),
  );

  return (
    <section>
      <h1 className="text-3xl font-bold">Bem-vindo(a)!</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {uniquePurchases.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 md:col-span-3">
            Nenhum produto ativo encontrado para sua conta.
          </div>
        ) : (
          uniquePurchases.map((purchase) => (
            <article key={purchase.id} className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm">
              <h2 className="font-semibold">{purchase.product.title}</h2>
              <p className="mt-1 text-sm text-[var(--carvao)]/75">Progresso inicial: 0%</p>
              <Link
                href={`/app/produtos/${purchase.product.slug}`}
                className="mt-4 inline-block rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white"
              >
                Continuar de onde parei
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
