"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiKeyModal } from "./ApiKeyModal";
import { useApiKey } from "@/lib/hooks/useApiKey";

export function Header() {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const { apiKey } = useApiKey();

  return (
    <>
      <header className="fixed top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
          >
            Roadmap AI
          </Link>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
          >
            <span
              className={`h-2 w-2 rounded-full ${apiKey ? "bg-emerald-500" : "bg-zinc-300"}`}
            />
            {apiKey ? "API Key Set" : "Set API Key"}
          </button>
        </div>
      </header>
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </>
  );
}
