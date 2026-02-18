import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { roadmapSchema } from "./schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { goal, apiKey } = await req.json();

  if (!goal || typeof goal !== "string") {
    return new Response("Goal is required", { status: 400 });
  }

  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("No API key provided. Set one via the header button.", {
      status: 401,
    });
  }

  const openai = createOpenAI({ apiKey: key });

  const result = streamObject({
    model: openai("gpt-4o"),
    schema: roadmapSchema,
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(goal),
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
