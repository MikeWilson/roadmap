"use client";

import { useState, useCallback } from "react";
import type { SpineEntry } from "@/lib/hooks/useRoadmapGeneration";

function searchUrl(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("youtube")) {
    // Strip YouTube references and verb prefixes to get the raw search query
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

function ActionBadge({ action }: { action: string }) {
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
}

export function RoadmapTimeline({
  entries,
  title,
  description,
  isLoading = false,
}: RoadmapTimelineProps) {
  let stepNumber = 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-14 sm:px-6">
      {/* Header */}
      <div
        className="mb-10"
        style={{ animation: "step-fade-in 0.5s ease-out both" }}
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
        {entries.map((entry, i) => {
          const isMilestone = entry.node.type === "milestone";
          if (!isMilestone) stepNumber++;
          const isLast = i === entries.length - 1 && !isLoading;
          const currentStep = stepNumber;

          return (
            <div
              key={entry.node.id}
              className="relative pb-2"
              style={{ animation: "step-fade-in 0.5s ease-out both" }}
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
                />
              )}
              </div>
            </div>
          );
        })}

        {/* Skeleton loading rows */}
        {isLoading && <SkeletonRows />}
      </div>
    </div>
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
}: {
  label: string;
  description: string;
  action?: string;
  step: number;
  branches: { id: string; label: string; description: string; action?: string }[];
}) {
  return (
    <div>
      {/* Step header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-md dark:bg-zinc-800 dark:text-zinc-100">
          {step}
        </div>
        <div className="min-w-0 flex-1 pt-1.5">
          <>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {label}
            </h3>
            <p className="mt-0.5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
            {action && (
              <a
                href={searchUrl(action)}
                target="_blank"
                rel="noopener noreferrer"
                className="group/card mt-1.5 inline-flex min-w-0 max-w-full w-fit items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
              >
                <ActionBadge action={action} />
                <span className="min-w-0 truncate">{action}</span>
                <ExternalIcon className="inline-flex" />
              </a>
            )}
          </>
        </div>
      </div>

      {/* Sub-steps (branches) */}
      {branches.length > 0 && (
        <div className="ml-[19px] border-l border-zinc-200 pl-6 pt-3 pb-4 sm:pl-8 dark:border-zinc-700">
          <div className="flex flex-col gap-2.5">
            {branches.map((branch, j) => (
              <div
                key={branch.id}
                className="flex items-start gap-3"
                style={{ animation: `step-fade-in 0.5s ease-out ${(j + 1) * 0.06}s both` }}
              >
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {step}
                  {SUBSTEP_LETTERS[j]}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                    {branch.label}
                  </span>
                  <span className="ml-1.5 text-base text-zinc-500 dark:text-zinc-400">
                    {branch.description}
                  </span>
                  {branch.action && (
                    <a
                      href={searchUrl(branch.action)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/card mt-1 flex min-w-0 max-w-full w-fit items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
                    >
                      <ActionBadge action={branch.action} />
                      <span className="min-w-0 truncate">
                        {branch.action}
                      </span>
                      <ExternalIcon className="inline-flex" />
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
            href={searchUrl(action)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card mt-1.5 inline-flex min-w-0 max-w-full w-fit items-center gap-1.5 rounded-lg px-2 py-0.5 -mx-2 text-sm text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300"
          >
            <ActionBadge action={action} />
            <span className="min-w-0 truncate">{action}</span>
            <ExternalIcon className="inline-flex" />
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
