import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      product: {
        select: {
          slug: true,
          title: true,
          type: true,
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
  const ebookStates = await prisma.ebookReaderState.findMany({
    where: {
      userId: user.id,
      productId: { in: uniquePurchases.map((purchase) => purchase.productId) },
    },
    select: {
      productId: true,
      scrollProgress: true,
      completedModules: true,
      readChapters: true,
    },
  });
  const ebookStateByProduct = new Map(ebookStates.map((state) => [state.productId, state]));

  const totalCompletedLessons = uniquePurchases.reduce((acc, purchase) => {
    const totalLessons = purchase.product.modules.reduce((sum, module) => sum + module._count.lessons, 0);
    if (purchase.product.type === "EBOOK") {
      const ebookState = ebookStateByProduct.get(purchase.productId);
      if (!ebookState) return acc;
      const moduleCount = Math.max(purchase.product.modules.length, 1);
      const moduleProgress = Math.round((ebookState.completedModules.length / moduleCount) * 100);
      const effective = Math.max(moduleProgress, ebookState.scrollProgress);
      return acc + Math.round((effective / 100) * 10);
    }
    return acc + Math.min(progressByProduct[purchase.productId] ?? 0, totalLessons);
  }, 0);

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
            <p className="text-3xl leading-none font-black">{totalCompletedLessons}</p>
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
            const ebookState = ebookStateByProduct.get(purchase.productId);
            const completedLessons =
              purchase.product.type === "EBOOK"
                ? (ebookState?.readChapters.length ?? 0)
                : (progressByProduct[purchase.productId] ?? 0);
            const progressPercent =
              purchase.product.type === "EBOOK"
                ? Math.max(
                    ebookState?.scrollProgress ?? 0,
                    purchase.product.modules.length
                      ? Math.round(((ebookState?.completedModules.length ?? 0) / purchase.product.modules.length) * 100)
                      : 0,
                  )
                : (totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0);
            return (
              <article key={purchase.id} className="group relative overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[var(--dourado)]/30 blur-2xl" />
                <h2 className="relative text-lg leading-tight font-bold">{purchase.product.title}</h2>
                <p className="relative mt-1 text-sm text-[var(--carvao)]/75">
                  {purchase.product.type === "EBOOK"
                    ? `Leitura concluída: ${progressPercent}%`
                    : totalLessons > 0
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
