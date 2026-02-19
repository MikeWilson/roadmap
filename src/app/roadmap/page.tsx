"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { RoadmapLoading } from "@/components/roadmap/RoadmapLoading";
import { Header } from "@/components/shared/Header";
import { useRoadmapGeneration } from "@/lib/hooks/useRoadmapGeneration";
import { useDecodedRoadmap } from "@/lib/hooks/useDecodedRoadmap";
import { updateUrlWithRoadmap } from "@/lib/roadmap/url-codec";

function DecodedRoadmapContent({ encodedData }: { encodedData: string }) {
  const { entries, title, description, roadmapData, checkedSteps, error } =
    useDecodedRoadmap(encodedData);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Something went wrong
        </p>
        <p className="max-w-md text-center text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  return (
    <RoadmapTimeline
      entries={entries}
      title={title}
      description={description}
      isLoading={false}
      prompt=""
      initialCheckedSteps={checkedSteps}
      roadmapData={roadmapData}
    />
  );
}

function GeneratedRoadmapContent({
  goal,
  goalDescription,
  context,
  location,
  emojiTheme,
}: {
  goal: string;
  goalDescription?: string;
  context?: string;
  location?: string;
  emojiTheme?: string;
}) {
  const { entries, isLoading, error, title, description, roadmapData } =
    useRoadmapGeneration(goal, goalDescription, context, location);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (roadmapData) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateUrlWithRoadmap(roadmapData);
      }, isLoading ? 500 : 0);
    }
  }, [isLoading, roadmapData]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Something went wrong
        </p>
        <p className="max-w-md text-center text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <RoadmapLoading goal={goal} emojiTheme={emojiTheme} />
      </div>
    );
  }

  return (
    <RoadmapTimeline
      entries={entries}
      title={title}
      description={description}
      isLoading={isLoading}
      prompt={goal}
      roadmapData={roadmapData}
    />
  );
}

function RoadmapContent() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("d");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="flex min-w-0 flex-1 flex-col pt-14">
        {encodedData ? (
          <DecodedRoadmapContent encodedData={encodedData} />
        ) : (
          <GeneratedRoadmapContent
            goal={searchParams.get("goal") || ""}
            goalDescription={searchParams.get("goalDescription") || undefined}
            context={searchParams.get("context") || undefined}
            location={searchParams.get("location") || undefined}
            emojiTheme={searchParams.get("emojiTheme") || undefined}
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
