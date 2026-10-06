"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FALLBACK_EMOJIS,
  IDLE_EMOJIS,
  SUGGESTIONS,
  matchGoalTheme,
  pickMany,
  setForMatch,
  setLedBy,
  type ThemeKey,
  type ThemeMatch,
} from "@/lib/emoji";

/** How many emojis the row between 🌱 and 🪦 shows. */
const EMOJI_SET_SIZE = 3;

export function GoalInput({ onStepChange }: { onStepChange?: (step: 1 | 2) => void }) {
  const [emojis, setEmojis] = useState<string[]>([...IDLE_EMOJIS]);
  const [emojiKey, setEmojiKey] = useState(0);
  const hasMounted = useRef(false);
  const lastTextMatchRef = useRef<ThemeMatch | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [goal, setGoal] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("🎯");
  // The theme handed to the roadmap page, so its loading screen shows the
  // same family of emojis the visitor was just looking at.
  const [goalTheme, setGoalTheme] = useState<ThemeKey | null>(null);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [goalDescription, setGoalDescription] = useState("");
  const [contextPlaceholder, setContextPlaceholder] = useState(
    "What you already know, what you've tried, where you're starting from...",
  );
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [location, setLocation] = useState("");
  const [locationMode, setLocationMode] = useState<
    "idle" | "requesting" | "zip-input" | "resolved"
  >("idle");
  const [zipInput, setZipInput] = useState("");
  const expandedGoalRef = useRef<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const currentStateRef = useRef<HTMLTextAreaElement | null>(null);
  const goalInputRef = useRef<HTMLInputElement | null>(null);
  const hoveredSuggestionRef = useRef<number | null>(null);
  const router = useRouter();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMode("zip-input");
      return;
    }
    setLocationMode("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&zoom=10`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          const state = data.address?.state || "";
          const parts = [city, state].filter(Boolean);
          if (parts.length > 0) {
            setLocation(parts.join(", "));
            setLocationMode("resolved");
          } else {
            setLocationMode("zip-input");
          }
        } catch {
          setLocationMode("zip-input");
        }
      },
      () => {
        setLocationMode("zip-input");
      },
    );
  }, []);

  const handleZipSubmit = useCallback(() => {
    const trimmed = zipInput.trim();
    if (trimmed) {
      setLocation(trimmed);
      setLocationMode("resolved");
    }
  }, [zipInput]);

  const clearLocation = useCallback(() => {
    setLocation("");
    setLocationMode("idle");
    setZipInput("");
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setSuggestionIndex(Math.floor(Math.random() * SUGGESTIONS.length));
    }
  }, []);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0";
    let height = el.scrollHeight;
    // When empty, measure placeholder height so the textarea fits it
    if (!el.value && el.placeholder) {
      el.value = el.placeholder;
      height = Math.max(height, el.scrollHeight);
      el.value = "";
    }
    el.style.height = height + "px";
  }, []);

  const descriptionCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      descriptionRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  const emojisForSuggestion = useCallback(
    (index: number, exclude: string[]) => {
      const { emoji, theme } = SUGGESTIONS[index];
      return setLedBy(emoji, theme, EMOJI_SET_SIZE, exclude);
    },
    [],
  );

  const currentStateCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      currentStateRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  // Auto-resize when goalDescription changes
  useEffect(() => {
    autoResize(descriptionRef.current);
  }, [goalDescription, autoResize]);

  // Auto-resize when currentState or its placeholder changes
  useEffect(() => {
    autoResize(currentStateRef.current);
  }, [currentState, contextPlaceholder, autoResize]);

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

    setSafetyError(null);

    fetch("/api/expand-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal }),
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        if (res.status === 400) {
          const msg = await res.text();
          setSafetyError(msg);
          setStep(1);
          onStepChange?.(1);
          expandedGoalRef.current = null;
          return null;
        }
        throw new Error(`expand-goal failed: ${res.status}`);
      })
      .then((data) => {
        if (data?.description) setGoalDescription(data.description);
        if (data?.currentStatePlaceholder)
          setContextPlaceholder(
            data.currentStatePlaceholder.replace(/^e\.?\s*g\.?,?\s*/i, ""),
          );
      })
      .catch(() => {
        // Network failure or a non-400 server error — surface it and return
        // to step 1 instead of leaving the user stuck on a blank step 2.
        setSafetyError("Something went wrong. Please try again.");
        setStep(1);
        onStepChange?.(1);
        expandedGoalRef.current = null;
      })
      .finally(() => {
        setIsExpanding(false);
        // Small delay so the DOM renders before triggering the transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsRevealed(true));
        });
      });
  }, [step, goal]);

  const shuffleEmojis = () => {
    setHasEngaged(true);
    lastTextMatchRef.current = null;
    setSuggestionIndex((i) => {
      const nextIndex = (i + 1) % SUGGESTIONS.length;
      const next = SUGGESTIONS[nextIndex];
      setGoal(next.text);
      setGoalEmoji(next.emoji);
      setGoalTheme(next.theme);
      setEmojis((prev) => emojisForSuggestion(nextIndex, prev));
      setEmojiKey((k) => k + 1);
      return nextIndex;
    });
    requestAnimationFrame(() => {
      goalInputRef.current?.focus();
      goalInputRef.current?.setSelectionRange(
        goalInputRef.current.value.length,
        goalInputRef.current.value.length,
      );
    });
  };

  const handleGenerate = () => {
    const params = new URLSearchParams({ goal: goal.trim() });
    if (goalDescription.trim()) {
      params.set("goalDescription", goalDescription.trim());
    }
    if (currentState.trim()) {
      params.set("context", currentState.trim());
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }
    const theme = goalTheme ?? lastTextMatchRef.current?.theme;
    if (theme) {
      params.set("emojiTheme", theme);
    }
    router.push(`/roadmap?${params.toString()}`);
  };

  if (step === 2) {
    return (
      <div className="flex w-full max-w-xl flex-1 min-h-0 flex-col sm:flex-initial">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-4 sm:flex-initial sm:overflow-visible">
        <button
          onClick={() => {
            setStep(1);
            onStepChange?.(1);
            expandedGoalRef.current = null;
            setSafetyError(null);
          }}
          className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="text-base">📅</span>
              </div>
              <label
                htmlFor="current-state"
                className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-white"
              >
                Today
              </label>

              {locationMode === "resolved" ? (
                <button
                  onClick={clearLocation}
                  className="ml-auto flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-60">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : locationMode === "requesting" ? (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Locating...
                </span>
              ) : locationMode === "idle" ? (
                <button
                  onClick={requestLocation}
                  className="ml-auto flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Add location
                </button>
              ) : null}
            </div>
            {locationMode === "zip-input" && !location && (
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
                  placeholder="Enter zip code or city"
                  autoFocus
                  className="w-48 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-blue-900/40"
                />
                <button
                  onClick={handleZipSubmit}
                  disabled={!zipInput.trim()}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Set
                </button>
                <button
                  onClick={() => setLocationMode("idle")}
                  className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="group/keep relative mt-1.5">
              <textarea
                ref={currentStateCallbackRef}
                id="current-state"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder={contextPlaceholder}
                rows={1}
                className="w-full resize-none overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-300 placeholder:transition-colors [div:has(button:hover)>&]:placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              {!currentState && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCurrentState(contextPlaceholder);
                  }}
                  className="absolute bottom-3 right-2 cursor-default rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400 opacity-0 transition-opacity group-hover/keep:opacity-100 group-focus-within/keep:opacity-0 hover:!opacity-100 hover:cursor-pointer hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                >
                  That&apos;s me
                </button>
              )}
            </div>
          </div>

          {/* Destination — someday */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="text-base">{goalEmoji}</span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-white">
                Soon
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

        </div>

        <div className="shrink-0 pb-5 pt-4 sm:pb-0 sm:pt-6">
          <button
            onClick={handleGenerate}
            disabled={!goal.trim() || isExpanding}
            className="w-full cursor-pointer rounded-xl bg-zinc-900 px-6 py-3.5 text-lg font-semibold transition-colors hover:bg-zinc-700 disabled:opacity-40 sm:py-3 sm:text-base sm:font-medium sm:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            <span className="animate-gradient-text">Generate roadmap</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="relative mb-6 sm:mb-10">
        <p className="pointer-events-none absolute inset-x-0 left-1/2 w-[120%] sm:w-[150%] max-w-[90vw] -translate-x-1/2 bottom-[95%] sm:bottom-[85%] text-center text-[clamp(1.5rem,8.5vw,5.5rem)] font-extrabold leading-[1.1] tracking-tight text-zinc-900/[0.2] sm:text-zinc-900/[0.1] dark:text-white/[0.2] dark:sm:text-white/[0.1]">
          <span className="block whitespace-nowrap">Life is boring,</span>
          <span className="block whitespace-nowrap">you don&apos;t have to be</span>
        </p>
        <button
          onClick={shuffleEmojis}
          className="mt-18 sm:mt-20 flex w-full cursor-pointer items-center justify-center gap-2 px-3 sm:gap-3 sm:px-0"
          aria-label="Shuffle emojis"
          type="button"
        >
          <span className="select-none text-[clamp(2.25rem,7vw,2.25rem)] opacity-60">🌱</span>
          <span className="mx-0.5 text-zinc-400 dark:text-zinc-600 sm:mx-1">···</span>
          {emojis.map((emoji, i) => (
            <span
              key={`${emojiKey}-${i}`}
              className="animate-emoji-bounce select-none text-[clamp(3rem,10vw,3.75rem)]"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
            >
              {emoji}
            </span>
          ))}
          <span className="mx-0.5 text-zinc-400 dark:text-zinc-600 sm:mx-1">···</span>
          <span className="select-none text-[clamp(2.25rem,7vw,2.25rem)] opacity-60">🪦</span>
        </button>
      </div>
      {safetyError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <p className="flex-1">{safetyError}</p>
          <button
            onClick={() => setSafetyError(null)}
            className="shrink-0 p-0.5 text-red-400 transition-colors hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <form onSubmit={handleGoalSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={goal}
            ref={goalInputRef}
            onChange={(e) => {
              const nextGoal = e.target.value;
              setGoal(nextGoal);
              if (safetyError) setSafetyError(null);
              const trimmed = nextGoal.trim();
              if (!trimmed) {
                lastTextMatchRef.current = null;
                setGoalTheme(null);
                setEmojis([...IDLE_EMOJIS]);
                setEmojiKey((k) => k + 1);
                return;
              }

              const lowered = trimmed.toLowerCase();
              const suggestionMatch = SUGGESTIONS.find(
                (s) => s.text.toLowerCase() === lowered,
              );
              if (suggestionMatch) {
                setGoalEmoji(suggestionMatch.emoji);
                setGoalTheme(suggestionMatch.theme);
              }

              const match = matchGoalTheme(trimmed);
              if (match) {
                setHasEngaged(true);
                if (!suggestionMatch) {
                  if (match.leadEmoji) setGoalEmoji(match.leadEmoji);
                  setGoalTheme(match.theme);
                }
                const prevMatch = lastTextMatchRef.current;
                const isSameMatch =
                  prevMatch?.theme === match.theme &&
                  prevMatch?.leadEmoji === match.leadEmoji;
                if (!isSameMatch) {
                  lastTextMatchRef.current = match;
                  setEmojis((prev) => setForMatch(match, EMOJI_SET_SIZE, prev));
                  setEmojiKey((k) => k + 1);
                }
                return;
              }

              if (!hasEngaged) {
                setHasEngaged(true);
                lastTextMatchRef.current = null;
                setEmojis(pickMany(FALLBACK_EMOJIS, EMOJI_SET_SIZE, emojis));
                setEmojiKey((k) => k + 1);
              }
            }}
            placeholder={SUGGESTIONS[suggestionIndex].text}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:pr-4"
          />
          <button
            type="submit"
            disabled={!goal.trim()}
            aria-label="Next"
            className="absolute right-[5px] top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          disabled={!goal.trim()}
          className="hidden rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:inline-flex"
        >
          Next
        </button>
      </form>
      <div className="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {SUGGESTIONS.slice(0, visibleCount).map(({ emoji, text, theme }, index) => (
          <button
            key={text}
            onClick={() => {
              setHasEngaged(true);
              lastTextMatchRef.current = null;
              setGoal(text);
              setGoalEmoji(emoji);
              setGoalTheme(theme);
              if (hoveredSuggestionRef.current !== index) {
                setEmojis((prev) => emojisForSuggestion(index, prev));
                setEmojiKey((k) => k + 1);
              }
              hoveredSuggestionRef.current = null;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={() => {
              if (goal.trim()) return;
              hoveredSuggestionRef.current = index;
              setHasEngaged(true);
              lastTextMatchRef.current = null;
              setEmojis((prev) => emojisForSuggestion(index, prev));
              setEmojiKey((k) => k + 1);
            }}
            className="group inline-flex animate-pill-fade-in whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[13px] text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            <span className="mr-1 grayscale transition-[filter] duration-200 group-hover:grayscale-0 sm:mr-1.5">
              {emoji}
            </span>
            {text}
          </button>
        ))}
      </div>
      {visibleCount < SUGGESTIONS.length && (
        <button
          onClick={() => {
            setVisibleCount((prev) =>
              prev >= 32 ? SUGGESTIONS.length : prev * 2,
            );
          }}
          className="mx-auto mt-3 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <span>
            {visibleCount >= 32
              ? "I'm picky, give me all the ideas"
              : visibleCount >= 16
                ? "Even more ideas"
                : "More ideas"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
