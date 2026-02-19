"use client";

import { useEffect, useMemo, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  roadmapSchema,
  type RoadmapData,
  type RoadmapNode,
} from "@/app/api/generate-roadmap/schema";
import { groupIntoSpineEntries } from "@/lib/roadmap/transform";

export type { SpineEntry } from "@/lib/roadmap/transform";

export function useRoadmapGeneration(
  goal: string,
  goalDescription?: string,
  context?: string,
  location?: string,
) {
  const hasSubmitted = useRef(false);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/generate-roadmap",
    schema: roadmapSchema,
  });

  useEffect(() => {
    if (goal && !hasSubmitted.current) {
      hasSubmitted.current = true;
      submit({
        goal,
        goalDescription: goalDescription || undefined,
        context: context || undefined,
        location: location || undefined,
      });
    }
  }, [goal, goalDescription, context, location, submit]);

  const entries = useMemo(() => {
    if (!object?.nodes || object.nodes.length === 0) return [];

    const completeNodes = object.nodes.filter(
      (n): n is RoadmapNode =>
        n != null &&
        n.id != null &&
        n.label != null &&
        n.type != null &&
        n.order != null,
    );

    return groupIntoSpineEntries(completeNodes);
  }, [object]);

  // Roadmap data for URL encoding — updates progressively as nodes stream in
  const roadmapData = useMemo((): RoadmapData | null => {
    if (!object?.title || !object?.description || !object?.nodes) {
      return null;
    }

    const completeNodes = object.nodes.filter(
      (n): n is RoadmapNode =>
        n != null &&
        n.id != null &&
        n.label != null &&
        n.type != null &&
        n.order != null,
    );

    if (completeNodes.length === 0) return null;

    return {
      title: object.title,
      description: object.description,
      nodes: completeNodes,
    };
  }, [object]);

  return {
    entries,
    isLoading,
    error: error?.message || null,
    title: object?.title || "",
    description: object?.description || "",
    roadmapData,
  };
}
