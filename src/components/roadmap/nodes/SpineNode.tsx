import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SpineFlowNode } from "@/lib/roadmap/types";

function SpineNodeComponent({ data }: NodeProps<SpineFlowNode>) {
  return (
    <div className="rounded-lg border-2 border-zinc-700 bg-zinc-900 px-5 py-3 shadow-md dark:border-zinc-300 dark:bg-zinc-100">
      <div className="text-sm font-semibold text-white dark:text-zinc-900">
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} className="!bg-zinc-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-500"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-zinc-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-zinc-500"
      />
    </div>
  );
}

export const SpineNode = memo(SpineNodeComponent);
