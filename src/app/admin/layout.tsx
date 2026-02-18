import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

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
      <header className="border-b border-white/50 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-semibold">Painel Admin • Marketing Digital Top</p>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" prefetch aria-label="Ir para Dashboard Admin">Dashboard</Link>
            <Link href="/app" prefetch aria-label="Ir para Área de membros">Area de membros</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeModeToggle />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Foto de perfil"
              className="h-8 w-8 rounded-full border border-[var(--surface-border)] object-cover"
            />
            <p className="text-sm text-[var(--carvao)]/80">{admin.email}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </main>
  );
}
