import { z } from "zod";

export const roadmapNodeSchema = z.object({
  id: z.string().describe('Unique identifier, e.g. "node-1"'),
  label: z.string().describe("Short display label, max 40 chars, sentence case (capitalize only the first word and proper nouns)"),
  description: z
    .string()
    .describe("One-sentence explanation of this topic/skill"),
  action: z
    .string()
    .nullable()
    .describe(
      'A specific, concrete resource label, search-query phrase, or direct URL. If a research source URL is directly relevant to this node, use the full URL (e.g. "https://en.wikipedia.org/wiki/Music_theory"). Otherwise use a short search-query phrase like \'YouTube: beginner soldering\', \'MDN HTML basics\', \'guitar tuning by ear guide\'. Avoid full sentences or vague filler. For milestone nodes, set to null unless there is a genuinely useful resource to link to.'
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
