import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { roadmapSchema } from "./schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import { runResearch } from "@/lib/ai/research";
import { checkGoalSafety } from "@/lib/ai/safety";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";


export const maxDuration = 60;

const MAX_GOAL_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 500;
const MAX_LOCATION_LENGTH = 100;

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip, "/api/generate-roadmap");
  if (!rl.ok) {
    return new Response("Too many requests. Try again later.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: {
    goal?: string;
    goalDescription?: string;
    context?: string;
    location?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
  const { goal, goalDescription, context, location } = body;

  if (!goal || typeof goal !== "string") {
    return new Response("Goal is required", { status: 400 });
  }

  if (goal.length > MAX_GOAL_LENGTH) {
    return new Response(`Goal must be under ${MAX_GOAL_LENGTH} characters`, { status: 400 });
  }

  if (goalDescription && (typeof goalDescription !== "string" || goalDescription.length > MAX_DESCRIPTION_LENGTH)) {
    return new Response(`Description must be under ${MAX_DESCRIPTION_LENGTH} characters`, { status: 400 });
  }

  if (context && (typeof context !== "string" || context.length > MAX_CONTEXT_LENGTH)) {
    return new Response(`Context must be under ${MAX_CONTEXT_LENGTH} characters`, { status: 400 });
  }

  if (location && (typeof location !== "string" || location.length > MAX_LOCATION_LENGTH)) {
    return new Response(`Location must be under ${MAX_LOCATION_LENGTH} characters`, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("OpenAI API key not configured.", { status: 500 });
  }

  // Safety check: reject inappropriate goals before spending tokens on research/generation.
  const safetyInput = [goal, goalDescription, context].filter(Boolean).join(" — ");
  const safety = await checkGoalSafety(safetyInput, key);
  if (!safety.safe) {
    return new Response(safety.reason, { status: 400 });
  }

  const openai = createOpenAI({ apiKey: key });
  const research = await runResearch({
    goal,
    location: typeof location === "string" ? location : undefined,
    apiKey: key,
  });

  const userPrompt = buildUserPrompt(
    goal,
    goalDescription,
    context,
    location,
    research?.summary,
    research?.sources,
  );

  const result = streamObject({
    model: openai("gpt-5.4"),
    schema: roadmapSchema,
    system: buildSystemPrompt(),
    prompt: userPrompt,
    maxOutputTokens: 16000,
    providerOptions: { openai: { reasoningEffort: "low" } },
  });

  return result.toTextStreamResponse();
}
