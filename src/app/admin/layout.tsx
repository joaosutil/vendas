import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/50 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <p className="font-semibold">Painel Admin • Marketing Digital Top</p>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin">Dashboard</Link>
            <Link href="/app">Area de membros</Link>
          </nav>
          <p className="text-sm text-[var(--carvao)]/80">{admin.email}</p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </main>
  );
}
