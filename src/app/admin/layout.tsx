import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { MobileAdminNav } from "@/components/navigation/mobile-admin-nav";
import { RouteTransition } from "@/components/navigation/route-transition";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();
  const avatarSrc = admin.avatarUrl
    ? `${admin.avatarUrl}${admin.avatarUrl.includes("?") ? "&" : "?"}v=${admin.updatedAt.getTime()}`
    : "/brand-icon.png";

  return (
    <main className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Pular para conteúdo
      </a>
      <header className="border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-semibold tracking-tight">Painel Admin • Marketing Digital Top</p>
          <nav className="hidden gap-2 text-sm md:flex">
            <Link href="/admin" prefetch aria-label="Ir para Dashboard Admin" className="ds-nav-link">Dashboard</Link>
            <Link href="/app" prefetch aria-label="Ir para Área de membros" className="ds-nav-link">Area de membros</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeModeToggle />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Foto de perfil"
              className="h-8 w-8 rounded-full border border-[var(--surface-border)] object-cover"
            />
            <p className="text-sm text-[var(--carvao)]/80 max-sm:hidden">{admin.email}</p>
          </div>
        </div>
      </header>
      <div id="main-content" className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
        <RouteTransition prefetchRoutes={["/admin", "/app", "/app/conta", "/app/suporte"]}>
          {children}
        </RouteTransition>
      </div>
      <MobileAdminNav />
    </main>
  );
}
