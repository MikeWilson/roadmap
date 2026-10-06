"use client";

import { useState, useEffect } from "react";
import { pickOne, poolForGoal } from "@/lib/emoji";

export function RoadmapLoading({ goal, emojiTheme }: { goal: string; emojiTheme?: string }) {
  // Resolved once and held for the life of the screen, so the pool cannot
  // change mid-animation. `wide: true` — this cycles one emoji every 1.2s for
  // as long as generation takes, so it wants every variation a theme has, not
  // just the core few.
  const [pool] = useState(() => poolForGoal(goal, emojiTheme, { wide: true }));

  const [current, setCurrent] = useState(() => ({
    emoji: pickOne(pool),
    key: 0,
    isFirst: true,
  }));
  const [exiting, setExiting] = useState<{
    emoji: string;
    key: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        setExiting({ emoji: prev.emoji, key: prev.key });
        return {
          emoji: pickOne(pool, [prev.emoji]),
          key: prev.key + 1,
          isFirst: false,
        };
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [pool]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => setExiting(null), 250);
    return () => clearTimeout(timer);
  }, [exiting]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div
        className="relative h-24 w-24 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        {exiting && (
          <div
            key={`exit-${exiting.key}`}
            className="animate-emoji-exit absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="select-none text-7xl">{exiting.emoji}</span>
          </div>
        )}
        <div
          key={`enter-${current.key}`}
          className={`absolute inset-0 flex items-center justify-center ${
            current.isFirst ? "" : "animate-emoji-enter"
          }`}
        >
          <span className="select-none text-7xl">{current.emoji}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Creating your roadmap...
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          &ldquo;{goal}&rdquo;
        </p>
      </div>
    </div>
  );
}
