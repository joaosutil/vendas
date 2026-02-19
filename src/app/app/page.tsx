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
            select: {
              id: true,
              _count: { select: { lessons: true } },
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
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] md:p-7">
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--dourado)]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-[var(--areia)]/30 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--carvao)]/70 uppercase">Area de membros</p>
          <h1 className="mt-1 text-3xl font-black md:text-4xl">Bem-vindo(a), {user.name ?? "membro"}.</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--carvao)]/80 md:text-base">
            Continue do ponto onde parou, acompanhe sua evolução e acesse os produtos com a nova navegação rápida.
          </p>
        </div>
        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white/85 p-3 shadow-sm">
            <p className="text-xs text-[var(--carvao)]/70">Produtos ativos</p>
            <p className="text-3xl leading-none font-black">{uniquePurchases.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white/85 p-3 shadow-sm">
            <p className="text-xs text-[var(--carvao)]/70">Aulas concluídas</p>
            <p className="text-3xl leading-none font-black">{progressRows.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--dourado)]/35 bg-white/85 p-3 shadow-sm">
            <p className="text-xs text-[var(--carvao)]/70">Atalhos rápidos</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link href="/app/suporte" className="rounded-lg bg-[var(--ink)] px-2.5 py-1.5 text-xs font-semibold text-white">
                Suporte
              </Link>
              <Link href="/app/conta" className="rounded-lg border border-[var(--ink)]/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)]">
                Configuracoes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {uniquePurchases.length === 0 ? (
          <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 sm:col-span-2 xl:col-span-3">
            Nenhum produto ativo encontrado para sua conta.
          </div>
        ) : (
          uniquePurchases.map((purchase) => {
            const totalLessons = purchase.product.modules.reduce((acc, module) => acc + module._count.lessons, 0);
            const completedLessons = progressByProduct[purchase.productId] ?? 0;
            const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
            return (
              <article key={purchase.id} className="group relative overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--dourado)]/30 blur-2xl" />
                <h2 className="relative text-lg leading-tight font-bold">{purchase.product.title}</h2>
                <p className="relative mt-1 text-sm text-[var(--carvao)]/75">
                  {totalLessons > 0
                    ? `${completedLessons}/${totalLessons} aulas concluídas (${progressPercent}%)`
                    : "Produto sem aulas cadastradas ainda"}
                </p>
                <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--dourado)]/30">
                  <div className="h-2.5 rounded-full bg-[var(--ink)] transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="relative mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--carvao)]/70">Progresso: {progressPercent}%</span>
                  <Link
                    href={`/app/produtos/${purchase.product.slug}`}
                    prefetch
                    className="rounded-lg bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white transition group-hover:brightness-110"
                  >
                    Continuar
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
