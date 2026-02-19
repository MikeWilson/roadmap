"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { RoadmapLoading } from "@/components/roadmap/RoadmapLoading";
import { Header } from "@/components/shared/Header";
import { useRoadmapGeneration } from "@/lib/hooks/useRoadmapGeneration";

function RoadmapContent() {
  const searchParams = useSearchParams();
  const goal = searchParams.get("goal") || "";
  const goalDescription = searchParams.get("goalDescription") || undefined;
  const context = searchParams.get("context") || undefined;
  const location = searchParams.get("location") || undefined;
  const emojiTheme = searchParams.get("emojiTheme") || undefined;
  const { entries, isLoading, error, title, description } =
    useRoadmapGeneration(goal, goalDescription, context, location);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="flex min-w-0 flex-1 flex-col pt-14">
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <p className="text-lg font-medium text-red-600 dark:text-red-400">
              Something went wrong
            </p>
            <p className="max-w-md text-center text-sm text-zinc-500">
              {error}
            </p>
          </div>
        ) : isLoading && entries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <RoadmapLoading goal={goal} emojiTheme={emojiTheme} />
          </div>
        ) : (
          <RoadmapTimeline
            entries={entries}
            title={title}
            description={description}
            isLoading={isLoading}
            prompt={goal}
          />
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense>
      <RoadmapContent />
    </Suspense>
  );
}
