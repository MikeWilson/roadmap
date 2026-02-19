"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  getHistory,
  removeFromHistory,
  clearHistory,
  type HistoryEntry,
} from "@/lib/roadmap/history";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="9" r="7" />
      <path d="M9 5.5V9l2.5 1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4v7.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4" />
    </svg>
  );
}

export function HistoryMenu() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [hasEntries, setHasEntries] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const items = getHistory();
    setEntries(items);
    setHasEntries(items.length > 0);
  }, []);

  // Check on mount and listen for saves from the same window
  useEffect(() => {
    setHasEntries(getHistory().length > 0);
    const onHistoryChange = () => setHasEntries(getHistory().length > 0);
    window.addEventListener("roadmap-history-change", onHistoryChange);
    return () =>
      window.removeEventListener("roadmap-history-change", onHistoryChange);
  }, []);

  // Load full history when menu opens
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!hasEntries && !open) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Roadmap history"
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <HistoryIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              History
            </span>
            {entries.length > 0 && (
              <button
                onClick={() => {
                  clearHistory();
                  refresh();
                  setOpen(false);
                }}
                className="text-xs text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Entries */}
          <div className="max-h-80 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                No roadmaps yet
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-start gap-2 border-b border-zinc-50 px-3 py-2.5 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50"
                >
                  <Link
                    href={`/roadmap?d=${entry.encodedData}`}
                    onClick={() => setOpen(false)}
                    className="min-w-0 flex-1"
                  >
                    <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {entry.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                      {entry.description}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-300 dark:text-zinc-600">
                      {timeAgo(entry.createdAt)}
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(entry.id);
                      refresh();
                    }}
                    aria-label={`Remove ${entry.title} from history`}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-300 transition-all hover:bg-zinc-200 hover:text-zinc-500 sm:opacity-0 sm:group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-400"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
