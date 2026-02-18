import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MilestoneFlowNode } from "@/lib/roadmap/types";

function MilestoneNodeComponent({ data }: NodeProps<MilestoneFlowNode>) {
  return (
    <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-3 shadow-md dark:border-emerald-600 dark:bg-emerald-900/30">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600 dark:text-emerald-400">&#9733;</span>
        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          {data.label}
        </span>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-500"
      />
    </div>
  );
}

export const MilestoneNode = memo(MilestoneNodeComponent);
