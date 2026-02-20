"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HistoryMenu } from "./HistoryMenu";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-40 w-full border-b border-zinc-200 bg-background/50 backdrop-blur-md dark:border-zinc-800">
      <div className="relative z-10 flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.location.href = "/";
            }
          }}
          className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
        >
          roadmap.rip
        </Link>
        <HistoryMenu />
      </div>
    </header>
  );
}
