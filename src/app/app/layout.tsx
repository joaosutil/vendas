import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { isAdminUser } from "@/lib/is-admin-user";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

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
      <header className="border-b border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-semibold">Marketing Digital Top</p>
          <nav className="flex gap-4 text-sm">
            <Link href="/app" prefetch>Dashboard</Link>
            <Link href="/app/conta" prefetch>Conta</Link>
            <Link href="/app/suporte" prefetch>Suporte</Link>
            {canAccessAdmin ? <Link href="/admin" prefetch>Admin</Link> : null}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeModeToggle />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Foto de perfil"
              className="h-8 w-8 rounded-full border border-[var(--surface-border)] object-cover"
            />
            <p className="text-sm text-[var(--carvao)]/80">{user.email}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
  );
}
