"use client";

import { useCallback, useMemo } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { roadmapExtensionSchema } from "@/app/api/extend-roadmap/schema";
import type { RoadmapData, RoadmapNode } from "@/app/api/generate-roadmap/schema";
import { groupIntoSpineEntries, type SpineEntry } from "@/lib/roadmap/transform";

/**
 * Drives the "ask for more" flow: submits the current roadmap plus a follow-up
 * request to /api/extend-roadmap and streams back the new nodes to append.
 *
 * @param onComplete  Called once with the finished batch of new nodes when a
 *                    request finishes streaming.
 */
export function useRoadmapExtension(
  onComplete: (nodes: RoadmapNode[]) => void,
) {
  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/extend-roadmap",
    schema: roadmapExtensionSchema,
    onFinish: ({ object: finished }) => {
      const nodes = finished?.nodes?.filter(
        (n): n is RoadmapNode =>
          n != null && n.id != null && n.label != null && n.type != null && n.order != null,
      );
      if (nodes && nodes.length > 0) onComplete(nodes);
    },
  });

  const submitRequest = useCallback(
    (roadmap: RoadmapData, request: string) => {
      submit({
        title: roadmap.title,
        description: roadmap.description,
        nodes: roadmap.nodes,
        prompt: request,
      });
    },
    [submit],
  );

  // Live preview of nodes as they stream in for the in-flight request.
  const streamingEntries = useMemo<SpineEntry[]>(() => {
    if (!isLoading || !object?.nodes) return [];
    const complete = object.nodes.filter(
      (n): n is RoadmapNode =>
        n != null && n.id != null && n.label != null && n.type != null && n.order != null,
    );
    return groupIntoSpineEntries(complete);
  }, [isLoading, object]);

  return {
    submitRequest,
    streamingEntries,
    isExtending: isLoading,
    error: error?.message || null,
    stop,
  };
}
