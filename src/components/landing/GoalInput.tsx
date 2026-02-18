"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  "Hobbyist electrical engineer",
  "Run a marathon",
  "Learn to play guitar",
  "Start a small business",
  "Triathlon athlete",
  "Learn machine learning",
  "Become a home chef",
  "Learn woodworking",
];

export function GoalInput() {
  const [goal, setGoal] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    router.push(`/roadmap?goal=${encodeURIComponent(goal.trim())}`);
  };

  return (
    <div className="mt-12 w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Become a hobbyist electrical engineer"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!goal.trim()}
          className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Generate
        </button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setGoal(s)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
