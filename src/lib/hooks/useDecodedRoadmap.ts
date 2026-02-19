"use client";

import { useMemo } from "react";
import { decodeRoadmap } from "@/lib/roadmap/url-codec";
import { groupIntoSpineEntries } from "@/lib/roadmap/transform";
import type { SpineEntry } from "@/lib/roadmap/transform";
import type { RoadmapData } from "@/app/api/generate-roadmap/schema";

export function useDecodedRoadmap(encodedData: string) {
  return useMemo(() => {
    const decoded = decodeRoadmap(encodedData);

    if (!decoded) {
      return {
        entries: [] as SpineEntry[],
        title: "",
        description: "",
        roadmapData: null as RoadmapData | null,
        checkedSteps: new Set<string>(),
        error: "This roadmap link appears to be invalid or corrupted.",
      };
    }

    const { data, checkedSteps } = decoded;

    return {
      entries: groupIntoSpineEntries(data.nodes),
      title: data.title,
      description: data.description,
      roadmapData: data,
      checkedSteps,
      error: null,
    };
  }, [encodedData]);
}
