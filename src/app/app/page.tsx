import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      product: {
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const uniquePurchases = Array.from(
    new Map(purchases.map((purchase) => [purchase.productId, purchase])).values(),
  );
  const progressRows = await prisma.progress.findMany({
    where: {
      userId: user.id,
      lesson: {
        module: {
          product: {
            id: { in: uniquePurchases.map((purchase) => purchase.productId) },
          },
        },
      },
    },
    select: {
      lesson: {
        select: {
          module: {
            select: { productId: true },
          },
        },
      },
    },
  });

  const progressByProduct = progressRows.reduce<Record<string, number>>((acc, entry) => {
    const productId = entry.lesson.module.productId;
    acc[productId] = (acc[productId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/60 bg-white/75 p-5">
        <h1 className="text-3xl font-bold">Bem-vindo(a)!</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Aqui você acompanha seu progresso, retoma aulas e acessa seus produtos em um clique.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Produtos ativos</p>
            <p className="text-2xl font-black">{uniquePurchases.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Aulas concluídas</p>
            <p className="text-2xl font-black">{progressRows.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white p-3">
            <p className="text-xs text-[var(--carvao)]/70">Suporte</p>
            <Link href="/app/suporte" className="mt-1 inline-block text-sm font-semibold text-[var(--ink)] underline underline-offset-2">
              Abrir atendimento
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {uniquePurchases.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 md:col-span-3">
            Nenhum produto ativo encontrado para sua conta.
          </div>
        ) : (
          uniquePurchases.map((purchase) => {
            const totalLessons = purchase.product.modules.reduce((acc, module) => acc + module.lessons.length, 0);
            const completedLessons = progressByProduct[purchase.productId] ?? 0;
            const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
            return (
            <article key={purchase.id} className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm">
              <h2 className="font-semibold">{purchase.product.title}</h2>
              <p className="mt-1 text-sm text-[var(--carvao)]/75">
                {totalLessons > 0
                  ? `${completedLessons}/${totalLessons} aulas concluídas (${progressPercent}%)`
                  : "Produto sem aulas cadastradas ainda"}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--dourado)]/30">
                <div className="h-2 rounded-full bg-[var(--ink)]" style={{ width: `${progressPercent}%` }} />
              </div>
              <Link
                href={`/app/produtos/${purchase.product.slug}`}
                prefetch
                className="mt-4 inline-block rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white"
              >
                Continuar de onde parei
              </Link>
            </article>
            );
          })
        )}
      </div>
    </section>
  );
}
