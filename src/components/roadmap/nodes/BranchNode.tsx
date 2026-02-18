import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { BranchFlowNode } from "@/lib/roadmap/types";

function BranchNodeComponent({ data }: NodeProps<BranchFlowNode>) {
  const targetPosition =
    data.side === "left" ? Position.Right : Position.Left;

  return (
    <div className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-800">
      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {data.label}
      </div>
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-zinc-400"
      />
    </div>
  );
}

export const BranchNode = memo(BranchNodeComponent);
