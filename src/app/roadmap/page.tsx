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
  const { entries, isLoading, error, title, description } =
    useRoadmapGeneration(goal, goalDescription, context);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="pt-14">
        {error ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
            <p className="text-lg font-medium text-red-600 dark:text-red-400">
              Something went wrong
            </p>
            <p className="max-w-md text-center text-sm text-zinc-500">
              {error}
            </p>
          </div>
        ) : isLoading && entries.length === 0 ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <RoadmapLoading goal={goal} />
          </div>
        ) : (
          <RoadmapTimeline
            entries={entries}
            title={title}
            description={description}
            isLoading={isLoading}
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
