import { stripTrackingParams } from "@/lib/roadmap/actions";

type ResearchResult = {
  summary: string;
  sources: string[];
};

// The web-search model usually needs 8-15s to find YouTube/Wikipedia pages;
// 9s dropped most results. Generation starts streaming once this resolves.
const DEFAULT_TIMEOUT_MS = 15000;
const OUTPUT_CHAR_LIMIT = 1200;

function extractOutputText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const maybeText = (data as { output_text?: unknown }).output_text;
  if (typeof maybeText === "string") return maybeText.trim();

  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const type = (item as { type?: unknown }).type;
    if (type !== "message") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        parts.push(text.trim());
      }
    }
  }

  return parts.join("\n").trim();
}

function extractSources(text: string): string[] {
  const urls = text.match(/https?:\/\/[^\s)\]]+/g) || [];
  const cleaned = urls
    .map((url) => stripTrackingParams(url.replace(/[.,;]+$/, "")))
    .filter((url) => url.length > 0);
  return Array.from(new Set(cleaned)).slice(0, 8);
}

export async function runResearch({
  goal,
  location,
  apiKey,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  goal: string;
  location?: string;
  apiKey: string;
  timeoutMs?: number;
}): Promise<ResearchResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const inputLines = [
    "Quick web check for someone starting a new hobby or skill.",
    `Goal: ${goal}`,
    ...(location ? [`Location: ${location}`] : []),
    "",
    "Return:",
    "- 3-4 short bullets: what beginners are told to actually do first, and",
    "  the YouTube channels and Wikipedia pages forum threads most recommend.",
    "- A line starting with 'Sources:' followed by 3-5 URLs. Prefer",
    "  youtube.com and wikipedia.org; avoid retailer and course pages.",
    "One or two searches is enough. Keep the response under 100 words.",
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        tools: [{ type: "web_search" }],
        tool_choice: "auto",
        // Reasoning model: temperature is not configurable, and reasoning
        // tokens share the output budget — raise the cap so reasoning + the
        // web-search summary both fit.
        reasoning: { effort: "low" },
        max_output_tokens: 2000,
        input: inputLines.join("\n"),
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = (await response.json()) as unknown;
    const text = extractOutputText(data);
    if (!text) return null;

    const summary = text.slice(0, OUTPUT_CHAR_LIMIT).trim();
    const sources = extractSources(text);
    return { summary, sources };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
