"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const items = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/conta", label: "Conta" },
  { href: "/app/suporte", label: "Suporte" },
];

export function MobileMembersNav({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = useMemo(() => (showAdmin ? [...items, { href: "/admin", label: "Admin" }] : items), [showAdmin]);

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [navItems, router]);

  return (
    <nav
      aria-label="Navegação móvel da área de membros"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-[var(--surface-border)] bg-[var(--surface)]/95 px-2 py-2 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-4 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                onMouseEnter={() => router.prefetch(item.href)}
                onTouchStart={() => router.prefetch(item.href)}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-2 py-2 text-center text-xs font-semibold ${
                  active ? "bg-[var(--ink)] text-white" : "text-[var(--carvao)]/85"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
