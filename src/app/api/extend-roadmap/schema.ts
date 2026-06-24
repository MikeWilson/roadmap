import { z } from "zod";
import { roadmapNodeSchema } from "../generate-roadmap/schema";

export const roadmapExtensionSchema = z.object({
  nodes: z
    .array(roadmapNodeSchema)
    .describe(
      "Only the NEW nodes to append to the existing roadmap — do not repeat nodes that already exist.",
    ),
});

export type RoadmapExtension = z.infer<typeof roadmapExtensionSchema>;
