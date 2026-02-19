import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { isAdminUser } from "@/lib/is-admin-user";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { MobileMembersNav } from "@/components/navigation/mobile-members-nav";
import { RouteTransition } from "@/components/navigation/route-transition";

export default async function MembersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const canAccessAdmin = isAdminUser(user);
  const avatarSrc = user.avatarUrl
    ? `${user.avatarUrl}${user.avatarUrl.includes("?") ? "&" : "?"}v=${user.updatedAt.getTime()}`
    : "/brand-icon.png";

  return (
    <main className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Pular para conteúdo
      </a>
      <header className="border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-semibold tracking-tight">Marketing Digital Top</p>
          <nav className="hidden gap-2 text-sm md:flex">
            <Link href="/app" prefetch aria-label="Ir para Dashboard" className="ds-nav-link">Dashboard</Link>
            <Link href="/app/conta" prefetch aria-label="Ir para Conta" className="ds-nav-link">Conta</Link>
            <Link href="/app/suporte" prefetch aria-label="Ir para Suporte" className="ds-nav-link">Suporte</Link>
            {canAccessAdmin ? <Link href="/admin" prefetch aria-label="Ir para Admin" className="ds-nav-link">Admin</Link> : null}
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeModeToggle />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Foto de perfil"
              className="h-8 w-8 rounded-full border border-[var(--surface-border)] object-cover"
            />
            <p className="text-sm text-[var(--carvao)]/80 max-sm:hidden">{user.email}</p>
          </div>
        </div>
      </header>
      <div id="main-content" className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
        <RouteTransition
          prefetchRoutes={[
            "/app",
            "/app/conta",
            "/app/suporte",
            "/admin",
          ]}
        >
          {children}
        </RouteTransition>
      </div>
      <MobileMembersNav showAdmin={canAccessAdmin} />
    </main>
  );
}
