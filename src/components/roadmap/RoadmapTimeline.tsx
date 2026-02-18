"use client";

import type { SpineEntry } from "@/lib/hooks/useRoadmapGeneration";

function searchUrl(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("youtube")) {
    // Strip YouTube references and verb prefixes to get the raw search query
    const query = action
      .replace(/\bon\s+youtube\b/gi, "")
      .replace(/\byoutube\b/gi, "")
      .replace(/\b(search|watch|find|look up|browse)\b\s*(for)?\s*/gi, "")
      .replace(/^["'\s\-–—]+|["'\s\-–—]+$/g, "")
      .trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(action)}`;
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
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:px-6">
      {/* Header */}
      <div
        className="mb-14"
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
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
              )}

              {isMilestone ? (
                <MilestoneRow
                  label={entry.node.label}
                  description={entry.node.description}
                  action={entry.node.action}
                />
              ) : (
                <StepRow
                  label={entry.node.label}
                  description={entry.node.description}
                  action={entry.node.action}
                  step={currentStep}
                  branches={entry.branches}
                />
              )}
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
      <div className="group/step flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
          {step}
        </div>
        <div className="min-w-0 pt-1.5">
          <div className="flex items-baseline gap-2">
            <h3 className="shrink truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {label}
            </h3>
            {action && (
              <a
                href={searchUrl(action)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden w-0 shrink-0 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-indigo-600 opacity-0 transition-opacity duration-200 group-hover/step:w-auto group-hover/step:opacity-100 hover:underline sm:inline dark:text-indigo-400"
              >
                → {action}
              </a>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
          {action && (
            <a
              href={searchUrl(action)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-sm text-indigo-600 hover:underline sm:hidden dark:text-indigo-400"
            >
              → {action}
            </a>
          )}
        </div>
      </div>

      {/* Sub-steps (branches) */}
      {branches.length > 0 && (
        <div className="ml-[19px] border-l border-zinc-200 pl-6 pt-3 pb-4 sm:pl-8 dark:border-zinc-700">
          <div className="flex flex-col gap-2.5">
            {branches.map((branch, j) => (
              <div
                key={branch.id}
                className="group/branch flex items-start gap-3"
                style={{ animation: `step-fade-in 0.5s ease-out ${(j + 1) * 0.06}s both` }}
              >
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {step}
                  {SUBSTEP_LETTERS[j]}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {branch.label}
                    </span>
                    {branch.action && (
                      <a
                        href={searchUrl(branch.action)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden w-0 shrink-0 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-indigo-600 opacity-0 transition-opacity duration-200 group-hover/branch:w-auto group-hover/branch:opacity-100 hover:underline sm:inline dark:text-indigo-400"
                      >
                        → {branch.action}
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {branch.description}
                  </span>
                  {branch.action && (
                    <a
                      href={searchUrl(branch.action)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-indigo-600 hover:underline sm:hidden dark:text-indigo-400"
                    >
                      → {branch.action}
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
    <div className="group/milestone flex flex-col sm:flex-row sm:items-start sm:gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
          &#9733;
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 sm:hidden dark:text-emerald-500">
          Milestone
        </span>
      </div>
      <div className="ml-14 mt-2 min-w-0 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 sm:ml-0 sm:mt-0 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="hidden text-[10px] font-semibold uppercase tracking-widest text-emerald-500 sm:block dark:text-emerald-500">
          Milestone
        </div>
        <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          {label}
        </div>
        {action && (
          <a
            href={searchUrl(action)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm text-emerald-600 hover:underline sm:hidden dark:text-emerald-400"
          >
            → {action}
          </a>
        )}
        <p className="mt-0.5 text-xs text-emerald-700/60 dark:text-emerald-400/60">
          {description}
        </p>
        {action && (
          <a
            href={searchUrl(action)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden w-0 shrink-0 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-emerald-600 opacity-0 transition-opacity duration-200 group-hover/milestone:w-auto group-hover/milestone:opacity-100 hover:underline sm:inline dark:text-emerald-400"
          >
            → {action}
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
