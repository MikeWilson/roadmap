import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { RoadmapData, RoadmapNode } from "@/app/api/generate-roadmap/schema";

const CURRENT_VERSION = 1;

// Minified payload types for URL encoding
interface EncodedRoadmap {
  v: number;
  t: string;
  d: string;
  n: EncodedNode[];
  c?: string[];
}

interface EncodedNode {
  i: string;
  l: string;
  d: string;
  a: string | null;
  y: "s" | "b" | "m";
  p: string | null;
  o: number;
  s: "l" | "r" | "c";
}

const TYPE_MAP: Record<RoadmapNode["type"], EncodedNode["y"]> = {
  spine: "s",
  branch: "b",
  milestone: "m",
};

const TYPE_REVERSE: Record<string, RoadmapNode["type"]> = {
  s: "spine",
  b: "branch",
  m: "milestone",
};

const SIDE_MAP: Record<RoadmapNode["side"], EncodedNode["s"]> = {
  left: "l",
  right: "r",
  center: "c",
};

const SIDE_REVERSE: Record<string, RoadmapNode["side"]> = {
  l: "left",
  r: "right",
  c: "center",
};

export function encodeRoadmap(
  data: RoadmapData,
  checkedSteps?: Set<string>,
): string {
  const encoded: EncodedRoadmap = {
    v: CURRENT_VERSION,
    t: data.title,
    d: data.description,
    n: data.nodes.map((node) => ({
      i: node.id,
      l: node.label,
      d: node.description,
      a: node.action,
      y: TYPE_MAP[node.type],
      p: node.parentId,
      o: node.order,
      s: SIDE_MAP[node.side],
    })),
  };

  if (checkedSteps && checkedSteps.size > 0) {
    encoded.c = Array.from(checkedSteps);
  }

  return compressToEncodedURIComponent(JSON.stringify(encoded));
}

export function decodeRoadmap(compressed: string): {
  data: RoadmapData;
  checkedSteps: Set<string>;
} | null {
  try {
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const encoded: EncodedRoadmap = JSON.parse(json);
    if (encoded.v !== CURRENT_VERSION) return null;

    const data: RoadmapData = {
      title: encoded.t,
      description: encoded.d,
      nodes: encoded.n.map((n) => ({
        id: n.i,
        label: n.l,
        description: n.d,
        action: n.a,
        type: TYPE_REVERSE[n.y] || "spine",
        parentId: n.p,
        order: n.o,
        side: SIDE_REVERSE[n.s] || "center",
      })),
    };

    return { data, checkedSteps: new Set<string>(encoded.c || []) };
  } catch {
    return null;
  }
}

export function updateUrlWithRoadmap(
  data: RoadmapData,
  checkedSteps?: Set<string>,
): void {
  const encoded = encodeRoadmap(data, checkedSteps);
  const url = new URL(window.location.href);
  // Clear old generation params
  url.searchParams.delete("goal");
  url.searchParams.delete("goalDescription");
  url.searchParams.delete("context");
  url.searchParams.delete("location");
  url.searchParams.delete("emojiTheme");
  // Set encoded data
  url.searchParams.set("d", encoded);
  window.history.replaceState(null, "", url.toString());
}
