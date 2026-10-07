import type { RoadmapNode } from "@/app/api/generate-roadmap/schema";

/** Drop utm_* query params the web-search tool appends (e.g. ?utm_source=openai). */
export function stripTrackingParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const k of Array.from(parsed.searchParams.keys())) {
      if (k.toLowerCase().startsWith("utm_")) parsed.searchParams.delete(k);
    }
    return parsed.toString().replace(/\?$/, "");
  } catch {
    return url;
  }
}

function isDirectUrl(action: string) {
  return /^https?:\/\//i.test(action);
}

/**
 * Normalize model-generated action links before rendering:
 * - keep only the first resource if several were jammed into one string
 *   ("Wikipedia fly fishing; YouTube: casting basics")
 * - strip tracking params from direct URLs
 * - a direct URL may appear on one node only; later repeats become null so
 *   a single research source doesn't get pasted across half the roadmap
 */
export function cleanNodeActions(nodes: RoadmapNode[]): RoadmapNode[] {
  const seenUrls = new Set<string>();
  return [...nodes]
    .sort((a, b) => a.order - b.order)
    .map((node) => {
      if (!node.action) return node;
      let action = node.action.split(";")[0].trim();
      if (!action) return { ...node, action: null };
      if (isDirectUrl(action)) {
        action = stripTrackingParams(action);
        const key = action.replace(/\/$/, "").toLowerCase();
        if (seenUrls.has(key)) return { ...node, action: null };
        seenUrls.add(key);
      }
      return action === node.action ? node : { ...node, action };
    });
}
