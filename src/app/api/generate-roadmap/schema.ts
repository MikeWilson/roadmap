import { z } from "zod";

export const roadmapNodeSchema = z.object({
  id: z.string().describe('Unique identifier, e.g. "node-1"'),
  label: z.string().describe("Short display label, max 40 chars, sentence case (capitalize only the first word and proper nouns)"),
  description: z
    .string()
    .describe(
      "One plain sentence, 12 words or fewer, saying what to do. No justification clauses (no 'so that', 'because', 'which helps')."
    ),
  action: z
    .string()
    .nullable()
    .describe(
      'Exactly one resource: a YouTube search phrase (\'YouTube: beginner soldering\'), a Wikipedia page, a short search phrase (\'MDN HTML basics\'), or a direct URL when it is the canonical page for this exact node (e.g. "https://en.wikipedia.org/wiki/Music_theory"). Never combine multiple resources in one string. For milestone nodes, null unless there is a genuinely useful link.'
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
  title: z.string().describe("Title of the roadmap, in sentence case"),
  description: z.string().describe("Brief description of the roadmap goal"),
  nodes: z
    .array(roadmapNodeSchema)
    .describe(
      "All nodes in the roadmap. Start with foundational topics and progress to advanced."
    ),
});

export type RoadmapData = z.infer<typeof roadmapSchema>;
export type RoadmapNode = z.infer<typeof roadmapNodeSchema>;
