import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const maxDuration = 15;

const MAX_GOAL_LENGTH = 200;

const schema = z.object({
  description: z
    .string()
    .describe("A concise, matter-of-fact description of the concrete skills involved in achieving this goal."),
  currentStatePlaceholder: z
    .string()
    .describe("An example 'where I am now' statement someone might write for this goal, written in first person."),
});

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip, "/api/expand-goal");
  if (!rl.ok) {
    return new Response("Too many requests. Try again later.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  const { goal, apiKey } = await req.json();

  if (!goal || typeof goal !== "string") {
    return new Response("Goal is required", { status: 400 });
  }

  if (goal.length > MAX_GOAL_LENGTH) {
    return new Response(`Goal must be under ${MAX_GOAL_LENGTH} characters`, { status: 400 });
  }

  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("No API key provided.", { status: 401 });
  }

  const openai = createOpenAI({ apiKey: key });

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema,
    system: `Given a goal, return two things:

1. "description": A short, plain description of the concrete skills involved. No fluff, no metaphors, no motivational language. Max 25 words. Start with a verb. Use sentence case.
Examples:
- "a piano player" → "Read sheet music, play chords and scales fluently, learn and perform full songs from memory."
- "Run a marathon" → "Run 26.2 miles continuously. Follow a structured training plan, manage pacing, and fuel properly on race day."

2. "currentStatePlaceholder": A realistic example of what someone might say about where they are today for this goal. First person, casual, 1-2 sentences. Start with "e.g., "
Examples:
- "a piano player" → "e.g., I played a bit of keyboard as a kid and can read treble clef slowly, but I never learned proper technique..."
- "Run a marathon" → "e.g., I jog a couple miles a few times a week but I've never run more than a 5K..."`,
    prompt: goal,
    temperature: 0.3,
    maxOutputTokens: 512,
  });

  return Response.json(object);
}
