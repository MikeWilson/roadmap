import { z } from "zod";

export const roadmapNodeSchema = z.object({
  id: z.string().describe('Unique identifier, e.g. "node-1"'),
  label: z.string().describe("Short display label, max 40 chars"),
  description: z
    .string()
    .describe("One-sentence explanation of this topic/skill"),
  action: z
    .string()
    .describe(
      'A specific, concrete next action the learner should take right now. Must start with a verb and reference a real, freely available resource or searchable query. Examples: \'Search YouTube for "beginner soldering tutorial"\', \'Read the MDN guide on HTML basics\', \'Google "how to tune a guitar by ear"\', \'Complete the free Codecademy intro to Python course\''
    ),
  type: z.enum(["spine", "branch", "milestone"]).describe(
    "spine = main vertical path item, branch = sub-topic off the spine, milestone = checkpoint/goal"
  ),
  parentId: z
    .string()
    .nullable()
    .describe(
      "ID of the parent spine node this branches from. Null for root/spine nodes."
    ),
  order: z.number().describe("Sort order within the same level/parent"),
  side: z
    .enum(["left", "right", "center"])
    .describe(
      "Which side of the spine this node appears on. Spine and milestone nodes are center. Branch nodes alternate left and right."
    ),
});

export const roadmapSchema = z.object({
  title: z.string().describe("Title of the roadmap"),
  description: z.string().describe("Brief description of the roadmap goal"),
  nodes: z
    .array(roadmapNodeSchema)
    .describe(
      "All nodes in the roadmap. Start with foundational topics and progress to advanced."
    ),
});

export type RoadmapData = z.infer<typeof roadmapSchema>;
export type RoadmapNode = z.infer<typeof roadmapNodeSchema>;
