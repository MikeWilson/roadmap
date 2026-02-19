import type { RoadmapData, RoadmapNode } from "@/app/api/generate-roadmap/schema";
import type { RoadmapFlowNode, RoadmapFlowEdge } from "./types";

export type SpineEntry = {
  node: RoadmapNode;
  branches: RoadmapNode[];
};

export function groupIntoSpineEntries(nodes: RoadmapNode[]): SpineEntry[] {
  const completeNodes = nodes.filter(
    (n): n is RoadmapNode =>
      n != null &&
      n.id != null &&
      n.label != null &&
      n.type != null &&
      n.order != null,
  );

  const spineNodes = completeNodes
    .filter((n) => n.type === "spine" || n.type === "milestone")
    .sort((a, b) => a.order - b.order);

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
}

export function transformToFlowElements(data: RoadmapData): {
  nodes: RoadmapFlowNode[];
  edges: RoadmapFlowEdge[];
} {
  const nodes: RoadmapFlowNode[] = data.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: 0, y: 0 },
    data: {
      label: node.label,
      description: node.description,
      ...(node.type === "spine" ? { order: node.order } : {}),
      ...(node.type === "branch" ? { side: node.side } : {}),
    },
  })) as RoadmapFlowNode[];

  // Derive edges from parentId relationships (branch -> spine)
  const edges: RoadmapFlowEdge[] = data.nodes
    .filter((node) => node.parentId !== null)
    .map((node) => ({
      id: `edge-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: "roadmapEdge",
    }));

  // Add spine-to-spine sequential edges (spine + milestone nodes form the main path)
  const spineNodes = data.nodes
    .filter((n) => n.type === "spine" || n.type === "milestone")
    .sort((a, b) => a.order - b.order);

  for (let i = 0; i < spineNodes.length - 1; i++) {
    edges.push({
      id: `spine-edge-${spineNodes[i].id}-${spineNodes[i + 1].id}`,
      source: spineNodes[i].id,
      target: spineNodes[i + 1].id,
      type: "roadmapEdge",
    });
  }

  return { nodes, edges };
}
