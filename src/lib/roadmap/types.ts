import type { Node, Edge } from "@xyflow/react";

export type SpineNodeData = {
  label: string;
  description: string;
  order: number;
};

export type BranchNodeData = {
  label: string;
  description: string;
  side: "left" | "right";
};

export type MilestoneNodeData = {
  label: string;
  description: string;
};

export type SpineFlowNode = Node<SpineNodeData, "spine">;
export type BranchFlowNode = Node<BranchNodeData, "branch">;
export type MilestoneFlowNode = Node<MilestoneNodeData, "milestone">;

export type RoadmapFlowNode =
  | SpineFlowNode
  | BranchFlowNode
  | MilestoneFlowNode;
export type RoadmapFlowEdge = Edge;
