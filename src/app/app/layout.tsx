import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { isAdminUser } from "@/lib/is-admin-user";

export default async function MembersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const canAccessAdmin = isAdminUser(user);

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/50 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="font-semibold">Marketing Digital Top</p>
          <nav className="flex gap-4 text-sm">
            <Link href="/app">Dashboard</Link>
            <Link href="/app/conta">Conta</Link>
            <Link href="/app/suporte">Suporte</Link>
            {canAccessAdmin ? <Link href="/admin">Admin</Link> : null}
          </nav>
          <p className="text-sm text-[var(--carvao)]/80">{user.email}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
  );
}
