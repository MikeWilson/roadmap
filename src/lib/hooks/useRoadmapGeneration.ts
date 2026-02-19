"use client";

import { useEffect, useMemo, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  roadmapSchema,
  type RoadmapData,
  type RoadmapNode,
} from "@/app/api/generate-roadmap/schema";

export type SpineEntry = {
  node: RoadmapNode;
  branches: RoadmapNode[];
};

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

  // Group nodes into spine entries with their branches
  const entries = useMemo((): SpineEntry[] => {
    if (!object?.nodes || object.nodes.length === 0) return [];

    const completeNodes = object.nodes.filter(
      (n): n is RoadmapNode =>
        n != null &&
        n.id != null &&
        n.label != null &&
        n.type != null &&
        n.order != null
    );

    // Spine + milestone nodes form the main path
    const spineNodes = completeNodes
      .filter((n) => n.type === "spine" || n.type === "milestone")
      .sort((a, b) => a.order - b.order);

    // Group branches by parentId
    const branchesByParent = new Map<string, RoadmapNode[]>();
    for (const node of completeNodes) {
      if (node.type === "branch" && node.parentId) {
        const existing = branchesByParent.get(node.parentId) || [];
        existing.push(node);
        branchesByParent.set(node.parentId, existing);
      }
    }

    return spineNodes.map((node) => ({
      node,
      branches: branchesByParent.get(node.id) || [],
    }));
  }, [object]);

  return {
    entries,
    isLoading,
    error: error?.message || null,
    title: object?.title || "",
    description: object?.description || "",
  };
}
