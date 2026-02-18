"use client";

import type { SpineEntry } from "@/lib/hooks/useRoadmapGeneration";

interface RoadmapTimelineProps {
  entries: SpineEntry[];
  title: string;
  description: string;
}

export function RoadmapTimeline({
  entries,
  title,
  description,
}: RoadmapTimelineProps) {
  let stepNumber = 0;

  return (
    <div className="mx-auto max-w-2xl px-6 pb-32 pt-8">
      {/* Header */}
      <div className="mb-14">
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
          const isLast = i === entries.length - 1;
          const currentStep = stepNumber;

          return (
            <div key={entry.node.id} className="relative pb-2">
              {/* Vertical line - runs behind everything */}
              {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
              )}

              {isMilestone ? (
                <MilestoneRow
                  label={entry.node.label}
                  description={entry.node.description}
                />
              ) : (
                <StepRow
                  label={entry.node.label}
                  description={entry.node.description}
                  step={currentStep}
                  branches={entry.branches}
                />
              )}
            </div>
          );
        })}

        {/* Finish marker */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Goal reached
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main numbered step ── */

const SUBSTEP_LETTERS = "abcdefghijklmnopqrstuvwxyz";

function StepRow({
  label,
  description,
  step,
  branches,
}: {
  label: string;
  description: string;
  step: number;
  branches: { id: string; label: string; description: string }[];
}) {
  return (
    <div>
      {/* Step header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
          {step}
        </div>
        <div className="pt-1.5">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {label}
          </h3>
          <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {/* Sub-steps (branches) */}
      {branches.length > 0 && (
        <div className="ml-[19px] border-l border-zinc-200 pl-8 pt-3 pb-4 dark:border-zinc-700">
          <div className="flex flex-col gap-2.5">
            {branches.map((branch, j) => (
              <div key={branch.id} className="flex items-start gap-3">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {step}
                  {SUBSTEP_LETTERS[j]}
                </span>
                <div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {branch.label}
                  </span>
                  <span className="ml-1.5 text-sm text-zinc-400 dark:text-zinc-500">
                    &mdash; {branch.description}
                  </span>
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
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
        &#9733;
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-500">
          Milestone
        </div>
        <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          {label}
        </div>
        <p className="mt-0.5 text-xs text-emerald-700/60 dark:text-emerald-400/60">
          {description}
        </p>
      </div>
    </div>
  );
}
