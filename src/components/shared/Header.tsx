import Link from "next/link";
import { GraveyardIdle } from "./GraveyardIdle";

export function Header() {
  return (
    <header className="fixed top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <GraveyardIdle />
      <div className="relative z-10 flex h-14 items-center px-4">
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
        >
          roadmap.rip
        </Link>
      </div>
    </header>
  );
}
