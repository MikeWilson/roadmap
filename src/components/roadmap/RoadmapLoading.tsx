"use client";

import { useState, useEffect, useRef } from "react";
import { getEmojisForGoal } from "@/lib/emojiThemes";

function pickRandom(pool: string[], exclude: string[]): string {
  const available = pool.filter((e) => !exclude.includes(e));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function RoadmapLoading({ goal }: { goal: string }) {
  const poolRef = useRef(getEmojisForGoal(goal));
  const pool = poolRef.current;

  const [current, setCurrent] = useState(() => ({
    emoji: pickRandom(pool, []),
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
          emoji: pickRandom(pool, [prev.emoji]),
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
