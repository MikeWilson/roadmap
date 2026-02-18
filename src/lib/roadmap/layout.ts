import dagre from "@dagrejs/dagre";
import type { RoadmapFlowNode, RoadmapFlowEdge } from "./types";
import { NODE_DIMENSIONS } from "@/lib/constants";

export function layoutRoadmap(
  nodes: RoadmapFlowNode[],
  edges: RoadmapFlowEdge[]
): { nodes: RoadmapFlowNode[]; edges: RoadmapFlowEdge[] } {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: "TB",
    nodesep: 80,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    const dims =
      NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] ||
      NODE_DIMENSIONS.spine;
    g.setNode(node.id, { width: dims.width, height: dims.height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    const dims =
      NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] ||
      NODE_DIMENSIONS.spine;
    return {
      ...node,
      position: {
        x: pos.x - dims.width / 2,
        y: pos.y - dims.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
