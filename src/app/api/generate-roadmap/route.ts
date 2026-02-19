import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { roadmapSchema } from "./schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import { runResearch } from "@/lib/ai/research";
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

  const { goal, apiKey, goalDescription, context, location } = await req.json();

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

  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("No API key provided. Set one via the header button.", {
      status: 401,
    });
  }

  const openai = createOpenAI({ apiKey: key });
  const research = await runResearch({
    goal,
    location: typeof location === "string" ? location : undefined,
    apiKey: key,
  });

  const result = streamObject({
    model: openai("gpt-4o"),
    schema: roadmapSchema,
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(
      goal,
      goalDescription,
      context,
      location,
      research?.summary,
      research?.sources,
    ),
    temperature: 0.7,
    maxOutputTokens: 8192,
  });

  return result.toTextStreamResponse();
}
