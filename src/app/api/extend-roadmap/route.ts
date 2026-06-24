import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { roadmapExtensionSchema } from "./schema";
import type { RoadmapNode } from "../generate-roadmap/schema";
import { buildExtendSystemPrompt, buildExtendUserPrompt } from "@/lib/ai/prompt";
import { checkGoalSafety } from "@/lib/ai/safety";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const maxDuration = 60;

const MAX_PROMPT_LENGTH = 200;
const MAX_NODES = 200;

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip, "/api/extend-roadmap");
  if (!rl.ok) {
    return new Response("Too many requests. Try again later.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: {
    title?: string;
    description?: string;
    nodes?: RoadmapNode[];
    prompt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
  const { title, description, nodes, prompt } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return new Response("A request is required", { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return new Response(`Request must be under ${MAX_PROMPT_LENGTH} characters`, { status: 400 });
  }
  if (!Array.isArray(nodes) || nodes.length === 0 || nodes.length > MAX_NODES) {
    return new Response("A valid existing roadmap is required", { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("OpenAI API key not configured.", { status: 500 });
  }

  // Safety check on the follow-up request before spending tokens.
  const safety = await checkGoalSafety(prompt, key);
  if (!safety.safe) {
    return new Response(safety.reason, { status: 400 });
  }

  const existingLabels = nodes
    .map((n) => n?.label)
    .filter((l): l is string => typeof l === "string");
  const maxOrder = nodes.reduce(
    (max, n) => (typeof n?.order === "number" && n.order > max ? n.order : max),
    0,
  );

  const userPrompt = buildExtendUserPrompt(
    typeof title === "string" ? title : "",
    typeof description === "string" ? description : "",
    existingLabels,
    maxOrder,
    prompt,
  );

  const openai = createOpenAI({ apiKey: key });

  const result = streamObject({
    model: openai("gpt-5.4"),
    schema: roadmapExtensionSchema,
    system: buildExtendSystemPrompt(),
    prompt: userPrompt,
    maxOutputTokens: 8000,
    providerOptions: { openai: { reasoningEffort: "low" } },
  });

  return result.toTextStreamResponse();
}
