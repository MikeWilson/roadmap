"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { SpineNode } from "./nodes/SpineNode";
import { BranchNode } from "./nodes/BranchNode";
import { MilestoneNode } from "./nodes/MilestoneNode";
import { RoadmapEdge } from "./edges/RoadmapEdge";
import type { RoadmapFlowNode, RoadmapFlowEdge } from "@/lib/roadmap/types";

const nodeTypes: NodeTypes = {
  spine: SpineNode,
  branch: BranchNode,
  milestone: MilestoneNode,
};

const edgeTypes: EdgeTypes = {
  roadmapEdge: RoadmapEdge,
};

interface RoadmapFlowProps {
  nodes: RoadmapFlowNode[];
  edges: RoadmapFlowEdge[];
  title: string;
}

export function RoadmapFlow({ nodes, edges, title }: RoadmapFlowProps) {
  return (
    <div className="h-full w-full">
      {title && (
        <div className="absolute left-4 top-20 z-10 rounded-lg bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:bg-zinc-900/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={2}
        className="bg-zinc-50 dark:bg-zinc-950"
      >
        <Background color="#e4e4e7" gap={20} />
        <Controls className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "spine") return "#18181b";
            if (node.type === "milestone") return "#34d399";
            return "#d4d4d8";
          }}
          className="rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700"
        />
      </ReactFlow>
    </div>
  );
}
