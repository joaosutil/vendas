"use client";

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

type RouteTransitionProps = {
  children: ReactNode;
  prefetchRoutes?: string[];
};

export function RouteTransition({ children, prefetchRoutes = [] }: RouteTransitionProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    prefetchRoutes.forEach((route) => router.prefetch(route));
  }, [prefetchRoutes, router]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

