"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/lib/hooks/useApiKey";

const SUGGESTIONS = [
  "Hobbyist electrical engineer",
  "Run a marathon",
  "Learn to play guitar",
  "Start a small business",
  "Triathlon athlete",
  "Learn machine learning",
  "Become a home chef",
  "Learn woodworking",
] as const;

export function GoalInput({ onStepChange }: { onStepChange?: (step: 1 | 2) => void }) {
  const [goal, setGoal] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [contextPlaceholder, setContextPlaceholder] = useState(
    "e.g., I took a physics class in college and can solder basic circuits, but I've never designed my own PCB...",
  );
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentState, setCurrentState] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const expandedGoalRef = useRef<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const { apiKey } = useApiKey();

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  const descriptionCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      descriptionRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  // Auto-resize when goalDescription changes
  useEffect(() => {
    autoResize(descriptionRef.current);
  }, [goalDescription, autoResize]);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setStep(2);
    onStepChange?.(2);
  };

  // Expand the goal into a richer description when entering step 2
  useEffect(() => {
    if (step !== 2 || expandedGoalRef.current === goal) return;
    expandedGoalRef.current = goal;
    setIsExpanding(true);
    setIsRevealed(false);
    setGoalDescription("");

    fetch("/api/expand-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, apiKey }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.description) setGoalDescription(data.description);
        if (data?.currentStatePlaceholder)
          setContextPlaceholder(data.currentStatePlaceholder);
      })
      .finally(() => {
        setIsExpanding(false);
        // Small delay so the DOM renders before triggering the transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsRevealed(true));
        });
      });
  }, [step, goal, apiKey]);

  const handleGenerate = () => {
    const params = new URLSearchParams({ goal: goal.trim() });
    if (goalDescription.trim()) {
      params.set("goalDescription", goalDescription.trim());
    }
    if (currentState.trim()) {
      params.set("context", currentState.trim());
    }
    router.push(`/roadmap?${params.toString()}`);
  };

  if (step === 2) {
    return (
      <div className="mt-4 w-full max-w-xl sm:mt-10">
        <button
          onClick={() => {
            setStep(1);
            onStepChange?.(1);
            expandedGoalRef.current = null;
          }}
          className="mb-8 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="relative pl-10">
          {/* Vertical dashed line connecting the three points, fading out at bottom */}
          <div
            className="absolute left-[15px] top-8 bottom-0 w-px border-l-2 border-dashed border-zinc-300 dark:border-zinc-600"
            style={{
              maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
            }}
          />

          {/* Starting point — today */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </div>
              <label
                htmlFor="current-state"
                className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400"
              >
                Today
              </label>
            </div>
            <textarea
              id="current-state"
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              placeholder={contextPlaceholder}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Destination — someday */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" x2="4" y1="22" y2="15" />
                </svg>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Someday
              </p>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {goal}
            </p>
            <div className="relative mt-2 min-h-[4.5rem]">
              <div
                className={`absolute inset-0 flex items-center rounded-xl border border-zinc-300 bg-white px-4 transition-opacity duration-300 dark:border-zinc-700 dark:bg-zinc-900 ${
                  isExpanding ? "animate-pulse opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="w-full space-y-2.5">
                  <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
              <textarea
                ref={descriptionCallbackRef}
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={2}
                className={`w-full resize-none overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-all duration-500 ease-out placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
                  isRevealed && !isExpanding ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                }`}
              />
            </div>
          </div>

          {/* The end */}
          <div className="-ml-10 flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
              <span className="text-base">🪦</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Some other day
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={() => {
              setCurrentState("");
              handleGenerate();
            }}
            disabled={isExpanding}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Skip
          </button>
          <button
            onClick={handleGenerate}
            disabled={!goal.trim() || isExpanding}
            className="flex-1 rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Generate Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-xl sm:mt-12">
      <form onSubmit={handleGoalSubmit} className="flex flex-col gap-3 sm:flex-row">
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
          Next
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
