"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type { SpineEntry } from "@/lib/hooks/useRoadmapGeneration";
import type { RoadmapData, RoadmapNode } from "@/app/api/generate-roadmap/schema";
import { groupIntoSpineEntries } from "@/lib/roadmap/transform";
import { useRoadmapExtension } from "@/lib/hooks/useRoadmapExtension";
import { updateUrlWithRoadmap } from "@/lib/roadmap/url-codec";


function isDirectUrl(action: string) {
  return /^https?:\/\//i.test(action);
}

function friendlyActionLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = decodeURIComponent(parsed.pathname).replace(/\/$/, "");

    if (host.includes("wikipedia.org")) {
      const slug = path.split("/").pop() ?? "";
      return `Wikipedia: ${slug.replace(/_/g, " ")}`;
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "YouTube";
    }
    if (host.includes("reddit.com")) {
      const match = path.match(/\/r\/([^/]+)/);
      return match ? `Reddit: r/${match[1]}` : "Reddit";
    }
    if (host.includes("github.com")) {
      const parts = path.split("/").filter(Boolean);
      return parts.length >= 2 ? `GitHub: ${parts.slice(0, 2).join("/")}` : "GitHub";
    }

    // Fallback: show domain + first meaningful path segment
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      const label = segments[0].replace(/[-_]/g, " ");
      return `${host} — ${label}`;
    }
    return host;
  } catch {
    return url;
  }
}

function actionUrl(action: string) {
  if (isDirectUrl(action)) return action;

  const lower = action.toLowerCase();
  if (lower.includes("youtube")) {
    const query = action
      .replace(/\bon\s+youtube\b/gi, "")
      .replace(/\byoutube\b/gi, "")
      .replace(/\b(search|watch|find|look up|browse)\b\s*(for)?\s*/gi, "")
      .replace(/\byour\b/gi, "my")
      .replace(/\byou\b/gi, "me")
      .replace(/^["':\s\-–—]+|["':\s\-–—]+$/g, "")
      .trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }
  const cleaned = action
    .replace(
      /^(attend|join|take|enroll|sign up|register|book|buy|shop|visit|learn|start|try|get|find|search|look up|browse)\b\s*/i,
      "",
    )
    .replace(/\byour\b/gi, "my")
    .replace(/\byou\b/gi, "me")
    .replace(/^["':\s\-–—]+|["':\s\-–—]+$/g, "")
    .trim();
  return `https://www.google.com/search?q=${encodeURIComponent(cleaned || action)}`;
}

function actionLabel(action: string): string {
  return isDirectUrl(action) ? friendlyActionLabel(action) : action;
}

/* ── Destination icons ── */

function YouTubeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 14 14"
      className="shrink-0 text-current"
      fill="none"
    >
      <rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 5v4l3.5-2z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="shrink-0 text-current"
    >
      <circle cx="5.5" cy="5.5" r="3.5" />
      <path d="M8.5 8.5l3 3" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className ?? ""}`}
    >
      <path d="M3.5 1h5.5v5.5M8.5 1.5 3 7" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className="shrink-0 text-current"
    >
      <path d="M6 7.5a3 3 0 0 0 4.2.3l1.5-1.5a3 3 0 0 0-4.2-4.3L6.3 3.2" />
      <path d="M8 6.5a3 3 0 0 0-4.2-.3L2.3 7.7a3 3 0 0 0 4.2 4.3l1.2-1.2" />
    </svg>
  );
}

function ActionBadge({ action }: { action: string }) {
  if (isDirectUrl(action)) {
    const lower = action.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return <span className="flex shrink-0 items-center gap-1"><YouTubeIcon /></span>;
    return <span className="flex shrink-0 items-center gap-1"><LinkIcon /></span>;
  }
  const isYouTube = action.toLowerCase().includes("youtube");
  return (
    <span className="flex shrink-0 items-center gap-1">
      {isYouTube ? <YouTubeIcon /> : <SearchIcon />}
    </span>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" />
      <path d="M10 2h4v4" />
      <path d="M14 2 7.5 8.5" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8.5 6.5 12 13 4" />
    </svg>
  );
}

function UncheckedBoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
      <rect x="3" y="3" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckedBoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
      <rect x="3" y="3" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M6 9.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  }, []);

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">Copied link</span>
        </>
      ) : (
        <>
          <ShareIcon className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

interface RoadmapTimelineProps {
  entries: SpineEntry[];
  title: string;
  description: string;
  isLoading?: boolean;
  prompt?: string;
  initialCheckedSteps?: Set<string>;
  roadmapData?: RoadmapData | null;
}

export function RoadmapTimeline({
  entries,
  title,
  description,
  isLoading = false,
  prompt = "",
  initialCheckedSteps,
  roadmapData,
}: RoadmapTimelineProps) {
  let stepNumber = 0;
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(
    () => initialCheckedSteps ?? new Set(),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Nodes added through the "ask for more" CTA, appended to the base roadmap.
  const [appendedNodes, setAppendedNodes] = useState<RoadmapNode[]>([]);
  const extensionCountRef = useRef(0);

  // The base roadmap plus everything the user has appended — used for URL
  // persistence and as the context sent to the extend endpoint.
  const mergedRoadmapData = useMemo<RoadmapData | null>(() => {
    if (!roadmapData) return null;
    if (appendedNodes.length === 0) return roadmapData;
    // Persisting appended nodes to the URL can fold them back into the base
    // roadmap on a decoded view, so dedupe by id to keep nodes unique.
    const seen = new Set<string>();
    const nodes = [...roadmapData.nodes, ...appendedNodes].filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    return { ...roadmapData, nodes };
  }, [roadmapData, appendedNodes]);

  const handleNodesAdded = useCallback((newNodes: RoadmapNode[]) => {
    // Namespace incoming ids so repeat extensions can't collide, and rewrite
    // any in-batch parent references to match.
    const gen = ++extensionCountRef.current;
    const remap = new Map<string, string>();
    for (const n of newNodes) remap.set(n.id, `x${gen}-${n.id}`);
    const namespaced = newNodes.map((n) => ({
      ...n,
      id: remap.get(n.id) ?? n.id,
      parentId: n.parentId && remap.has(n.parentId) ? remap.get(n.parentId)! : n.parentId,
    }));
    setAppendedNodes((prev) => [...prev, ...namespaced]);
  }, []);

  const { submitRequest, streamingEntries, isExtending } =
    useRoadmapExtension(handleNodesAdded);

  // Only animate entries when the component mounted during streaming.
  // When mounting with all data ready (e.g. decoded URL or component swap
  // after generation), skip animations to prevent a visual flash.
  const shouldAnimate = useRef(isLoading);
  const toggleStep = useCallback((id: string) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      if (mergedRoadmapData) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          updateUrlWithRoadmap(mergedRoadmapData, next);
        }, 300);
      }

      return next;
    });
  }, [mergedRoadmapData]);

  // Persist appended nodes to the URL once each extension finishes.
  const persistedCountRef = useRef(0);
  useEffect(() => {
    if (!mergedRoadmapData) return;
    if (appendedNodes.length === persistedCountRef.current) return;
    persistedCountRef.current = appendedNodes.length;
    updateUrlWithRoadmap(mergedRoadmapData, checkedSteps);
  }, [appendedNodes, mergedRoadmapData, checkedSteps]);

  const handleAskForMore = useCallback((request: string) => {
    if (!mergedRoadmapData) return;
    submitRequest(mergedRoadmapData, request);
  }, [mergedRoadmapData, submitRequest]);

  const appendedEntries = useMemo(
    () => groupIntoSpineEntries(appendedNodes),
    [appendedNodes],
  );

  // Existing entries, then user-appended sections, then the live stream of the
  // in-flight request. Rendered as one continuous timeline. Dedupe by node id —
  // persisting appended nodes to the URL can fold them back into `entries` on a
  // decoded roadmap, so the same node may arrive from two sources.
  const allEntries = useMemo(() => {
    const combined = isExtending
      ? [...entries, ...appendedEntries, ...streamingEntries]
      : [...entries, ...appendedEntries];
    const seen = new Set<string>();
    return combined.filter((entry) => {
      if (seen.has(entry.node.id)) return false;
      seen.add(entry.node.id);
      return true;
    });
  }, [entries, appendedEntries, streamingEntries, isExtending]);

  // The CTA caps the timeline once the base roadmap has finished generating.
  const ctaVisible = !isLoading && mergedRoadmapData != null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 pb-32 pt-8 sm:pt-14 sm:px-6">
      {/* Header */}
      <div
        className="mb-6 sm:mb-10"
        style={shouldAnimate.current ? { animation: "step-fade-in 0.5s ease-out both" } : undefined}
      >
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
        <div className="mt-3">
          <ShareButton />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {allEntries.map((entry, i) => {
          const isMilestone = entry.node.type === "milestone";
          if (!isMilestone) stepNumber++;
          const hasTrailing = isLoading || ctaVisible || isExtending;
          const isLast = i === allEntries.length - 1 && !hasTrailing;
          const currentStep = stepNumber;
          // Appended / streaming entries always fade in; base entries only
          // animate when the component mounted mid-stream.
          const animate = shouldAnimate.current || i >= entries.length;

          return (
            <div
              key={entry.node.id}
              className="relative pb-2"
              style={animate ? { animation: "step-fade-in 0.5s ease-out both" } : undefined}
            >
              {/* Vertical line - runs behind everything */}
              {!isLast && (
                <div className={`absolute left-[19px] bottom-0 z-0 w-px bg-zinc-200 dark:bg-zinc-700 ${i === 0 ? "top-10" : "top-0"}`} />
              )}

              <div className="relative z-10">
              {isMilestone ? (
                <MilestoneRow
                  label={entry.node.label}
                  description={entry.node.description}
                  action={entry.node.action ?? undefined}
                />
              ) : (
                <StepRow
                  label={entry.node.label}
                  description={entry.node.description}
                  action={entry.node.action ?? undefined}
                  step={currentStep}
                  branches={entry.branches.map(b => ({ ...b, action: b.action ?? undefined }))}
                  checked={checkedSteps.has(entry.node.id)}
                  onToggle={() => toggleStep(entry.node.id)}
                  animate={animate}
                />
              )}
              </div>
            </div>
          );
        })}

        {/* Skeleton loading rows */}
        {isLoading && <SkeletonRows />}

        {/* Ask-for-more CTA — caps the timeline once generation is done */}
        {ctaVisible && (
          <AskForMore
            onSubmit={handleAskForMore}
            isExtending={isExtending}
            roadmap={mergedRoadmapData}
          />
        )}
      </div>

    </div>
  );
}

/* ── Ask-for-more CTA ── */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
    >
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
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
  );
}

const DEFAULT_ASK_PLACEHOLDER = "e.g. go deeper on advanced techniques";

function AskForMore({
  onSubmit,
  isExtending,
  roadmap,
}: {
  onSubmit: (request: string) => void;
  isExtending: boolean;
  roadmap: RoadmapData | null;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Suggest a next step as the placeholder when the input opens — refreshed
  // whenever the roadmap has grown since the last suggestion.
  const fetchedCountRef = useRef(-1);
  useEffect(() => {
    if (!open || !roadmap) return;
    const count = roadmap.nodes.length;
    if (fetchedCountRef.current === count) return;
    fetchedCountRef.current = count;

    let cancelled = false;
    setLoadingSuggestion(true);
    setRevealed(false);
    fetch("/api/suggest-more", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: roadmap.title,
        description: roadmap.description,
        labels: roadmap.nodes.map((n) => n.label),
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.suggestion === "string" && data.suggestion.trim()) {
          setSuggestion(data.suggestion.trim());
        }
      })
      .catch(() => {
        // Suggestion is a nicety — silently fall back to the default placeholder.
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingSuggestion(false);
        // Let the DOM paint the hidden state before fading the suggestion in.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setRevealed(true);
          });
        });
      });
    return () => {
      cancelled = true;
    };
  }, [open, roadmap]);

  // The suggestion is adoptable: submitting an empty field uses it, the way the
  // interstitial step lets you keep its placeholder.
  const effectiveRequest = value.trim() || suggestion || "";
  const showSkeleton = open && !value && loadingSuggestion;
  const showSuggestion = open && !value && !loadingSuggestion && suggestion != null;
  // Hide the caret until the suggestion has landed, so it doesn't blink over
  // the empty field while the placeholder is still loading/animating in.
  const hideCaret = !value && (loadingSuggestion || (suggestion != null && !revealed));
  // Native placeholder only handles the plain fallback; the suggestion and its
  // loading state are rendered as animated overlays instead.
  const placeholder =
    value || loadingSuggestion || suggestion != null ? "" : DEFAULT_ASK_PLACEHOLDER;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!effectiveRequest || isExtending) return;
      onSubmit(effectiveRequest);
      setValue("");
      setOpen(false);
    },
    [effectiveRequest, isExtending, onSubmit],
  );

  if (isExtending) {
    return (
      <div className="relative flex items-center gap-4 pt-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </div>
        <span className="text-sm text-zinc-400 dark:text-zinc-500">
          Adding to your roadmap…
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="relative pt-2">
        <button
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 transition-colors group-hover:border-zinc-400 group-hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-600 dark:group-hover:border-zinc-500 dark:group-hover:text-zinc-300">
            <PlusIcon />
          </span>
          <span className="text-sm text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
            Want to go further? Ask for more
          </span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-4 pt-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
        <PlusIcon />
      </span>
      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          maxLength={200}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
            hideCaret ? "caret-transparent" : ""
          }`}
        />

        {/* Loading skeleton for the suggestion */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-4 right-12 flex items-center transition-opacity duration-300 ${
            showSkeleton ? "animate-pulse opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-3.5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Suggested next step — fades and de-blurs in like the interstitial.
            Reads as a placeholder; the arrow button adopts it when empty. */}
        {showSuggestion && (
          <div
            className={`pointer-events-none absolute inset-y-0 left-4 right-12 flex items-center text-zinc-400 transition-all duration-500 ease-out dark:text-zinc-500 ${
              revealed ? "opacity-100 blur-0" : "opacity-0 blur-sm"
            }`}
          >
            <span className="truncate">{suggestion}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!effectiveRequest}
          aria-label="Add to roadmap"
          className="absolute right-[7px] top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </form>
  );
}

/* ── Main numbered step ── */

const SUBSTEP_LETTERS = "abcdefghijklmnopqrstuvwxyz";

function StepRow({
  label,
  description,
  action,
  step,
  branches,
  checked,
  onToggle,
  animate,
}: {
  label: string;
  description: string;
  action?: string;
  step: number;
  branches: { id: string; label: string; description: string; action?: string }[];
  checked: boolean;
  onToggle: () => void;
  animate: boolean;
}) {
  return (
    <div>
      {/* Step header */}
      <div className="flex items-start gap-4">
        <button
          role="checkbox"
          aria-checked={checked}
          aria-label={`Mark step ${step} as complete`}
          onClick={onToggle}
          className="group/num relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-md transition-colors hover:bg-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          <span className={`transition-opacity duration-150 ${checked ? "opacity-0" : "group-hover/num:opacity-0"}`}>
            {step}
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0 group-hover/num:opacity-100"}`}>
            {checked ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
          </span>
        </button>
        <div className={`min-w-0 flex-1 pt-1.5 transition-opacity duration-300 ${checked ? "opacity-50" : ""}`}>
          <>
            <h3 className={`text-lg font-semibold text-zinc-900 dark:text-zinc-100 ${checked ? "line-through decoration-zinc-400 dark:decoration-zinc-600" : ""}`}>
              {label}
            </h3>
            <p className={`mt-0.5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400 ${checked ? "line-through decoration-zinc-300 dark:decoration-zinc-600" : ""}`}>
              {description}
            </p>
            {action && (
              <a
                href={actionUrl(action)}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card mt-1.5 inline-flex w-full min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300 sm:w-fit"
              >
                <ActionBadge action={action} />
                <span className="min-w-0 truncate">{actionLabel(action)}</span>
                <ExternalIcon className="inline-flex transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100" />
              </a>
            )}
          </>
        </div>
      </div>

      {/* Sub-steps (branches) */}
      {branches.length > 0 && (
        <div className={`ml-[19px] border-l border-zinc-200 pl-8 pt-3 pb-4 sm:pl-8 dark:border-zinc-700 transition-opacity duration-300 ${checked ? "opacity-50" : ""}`}>
          <div className="flex flex-col gap-2.5">
            {branches.map((branch, j) => (
              <div
                key={branch.id}
                className="flex items-start gap-3"
                style={animate ? { animation: `step-fade-in 0.5s ease-out ${(j + 1) * 0.06}s both` } : undefined}
              >
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {step}
                  {SUBSTEP_LETTERS[j]}
                </span>
                <div className="min-w-0 flex-1">
                  <span className={`text-base font-medium text-zinc-700 dark:text-zinc-300 ${checked ? "line-through decoration-zinc-400 dark:decoration-zinc-600" : ""}`}>
                    {branch.label}
                  </span>
                  <span className={`ml-1.5 text-base text-zinc-500 dark:text-zinc-400 ${checked ? "line-through decoration-zinc-300 dark:decoration-zinc-600" : ""}`}>
                    {branch.description}
                  </span>
                  {branch.action && (
                    <a
                      href={actionUrl(branch.action)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/card mt-1 flex w-full min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300 sm:w-fit"
                    >
                      <ActionBadge action={branch.action} />
                      <span className="min-w-0 truncate">
                        {actionLabel(branch.action)}
                      </span>
                      <ExternalIcon className="inline-flex transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Milestone ── */

function MilestoneRow({
  label,
  description,
  action,
}: {
  label: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
          &#9733;
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 sm:hidden dark:text-emerald-500">
          Milestone
        </span>
      </div>
      <div className="ml-14 mt-2 min-w-0 flex-1 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:ml-0 sm:mt-0 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="hidden text-[10px] font-semibold uppercase tracking-widest text-emerald-500 sm:block dark:text-emerald-500">
          Milestone
        </div>
        <div className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
          {label}
        </div>
        <p className="mt-0.5 text-sm text-emerald-700/60 dark:text-emerald-400/60">
          {description}
        </p>
        {action && (
          <a
            href={actionUrl(action)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card mt-1.5 inline-flex w-full min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 sm:w-fit"
          >
            <ActionBadge action={action} />
            <span className="min-w-0 truncate">{actionLabel(action)}</span>
            <ExternalIcon className="inline-flex transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton loading rows ── */

const SKELETON_WIDTHS = [
  { title: "w-3/5", desc: "w-4/5" },
  { title: "w-2/5", desc: "w-3/5" },
  { title: "w-1/2", desc: "w-2/3" },
];

function SkeletonRows() {
  return (
    <>
      {SKELETON_WIDTHS.map((widths, i) => (
        <div
          key={`skeleton-${i}`}
          className="relative pb-2"
          style={{ opacity: 1 - i * 0.3 }}
        >
          {i < SKELETON_WIDTHS.length - 1 && (
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-zinc-200/50 dark:bg-zinc-700/50" />
          )}
          <div className="flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2.5 pt-2">
              <div
                className={`h-4 ${widths.title} rounded bg-zinc-200 dark:bg-zinc-800`}
              />
              <div
                className={`h-3 ${widths.desc} rounded bg-zinc-100 dark:bg-zinc-800/60`}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
