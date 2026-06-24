import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const maxDuration = 15;

const MAX_LABELS = 40;

const schema = z.object({
  suggestion: z
    .string()
    .describe(
      "A short follow-up request the user might type to extend their roadmap, phrased as an imperative they would write (max 8 words). No quotes, no 'e.g.' prefix.",
    ),
});

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(ip, "/api/suggest-more");
  if (!rl.ok) {
    return new Response("Too many requests. Try again later.", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSeconds) },
    });
  }

  let body: { title?: string; description?: string; labels?: string[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
  const { title, description, labels } = body;

  if (!title || typeof title !== "string") {
    return new Response("A roadmap is required", { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("OpenAI API key not configured.", { status: 500 });
  }

  const labelList = Array.isArray(labels)
    ? labels.filter((l): l is string => typeof l === "string").slice(0, MAX_LABELS)
    : [];

  const openai = createOpenAI({ apiKey: key });

  const { object } = await generateObject({
    model: openai("gpt-5.4-mini"),
    schema,
    system: `The user has a learning roadmap and wants to extend it. Given the roadmap and the topics it already covers, suggest ONE natural follow-up the user might type to add more.

Rules:
- Phrase it as an imperative the user would write, e.g. "Add a section on performing live", "Go deeper on music theory", "Cover recording at home".
- Max 8 words. Sentence case. No quotes, no trailing period, no "e.g." prefix.
- Suggest something genuinely NOT already covered — a natural next area, more depth on an advanced topic, or what comes after the roadmap ends.`,
    prompt: `Roadmap: "${title}"${description ? `\n${description}` : ""}${
      labelList.length ? `\n\nTopics already covered:\n${labelList.map((l) => `- ${l}`).join("\n")}` : ""
    }`,
    maxOutputTokens: 1000,
    providerOptions: { openai: { reasoningEffort: "none" } },
  });

  return Response.json(object);
}
