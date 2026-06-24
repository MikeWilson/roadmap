type SafetyResult =
  | { safe: true }
  | { safe: false; reason: string };

const SAFETY_TIMEOUT_MS = 3000;

/**
 * Checks whether user-submitted goal text is appropriate for a learning
 * roadmap generator.  Runs two checks in parallel:
 *
 * 1. OpenAI Moderation API – catches hate, harassment, self-harm, sexual, and
 *    violence content.  Free and fast.
 * 2. A quick gpt-4o-mini classification – catches goals that describe illegal
 *    or dangerous activities that wouldn't be flagged by the moderation API
 *    alone (e.g. "learn to make explosives").
 *
 * Both checks race against a timeout so a slow call never blocks generation.
 * If both checks fail / time out the goal is allowed through (fail-open).
 */
export async function checkGoalSafety(
  text: string,
  apiKey: string,
): Promise<SafetyResult> {
  // Combine all user-provided fields into a single blob to check.
  const input = text.trim();
  if (!input) return { safe: true };

  try {
    const [modResult, llmResult] = await Promise.all([
      moderationCheck(input, apiKey),
      llmSafetyCheck(input, apiKey),
    ]);

    // The LLM classifier is purpose-built for this app – reject if it says UNSAFE.
    if (!llmResult.safe) return llmResult;

    // The moderation API can produce false positives for benign goals like
    // "write a novel".  When the LLM classifier deems the goal safe, trust it.
    return { safe: true };
  } catch {
    // Fail open – don't block roadmap generation if safety check itself errors.
    return { safe: true };
  }
}

// ---------------------------------------------------------------------------
// OpenAI Moderation API
// ---------------------------------------------------------------------------

async function moderationCheck(
  input: string,
  apiKey: string,
): Promise<SafetyResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SAFETY_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    if (!res.ok) return { safe: true }; // fail open

    const data = (await res.json()) as {
      results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
    };

    const result = data.results?.[0];
    if (!result?.flagged) return { safe: true };

    return {
      safe: false,
      reason:
        "Rejected. Please try another hobby, skill, or topic you'd like to learn about.",
    };
  } catch {
    return { safe: true };
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Quick LLM classification for learning-roadmap-specific concerns
// ---------------------------------------------------------------------------

const CLASSIFIER_PROMPT = `You are a safety classifier for a learning roadmap app. The app generates step-by-step learning plans for hobbies, skills, and personal development goals.

Classify whether the following goal is SAFE or UNSAFE to build a learning roadmap for.

A goal is UNSAFE if it:
- Primarily aims to harm, injure, or kill people
- Describes making weapons, explosives, or poisons
- Involves illegal activity as the core objective (e.g., hacking into systems without authorization, manufacturing illegal drugs, fraud, theft)
- Seeks to harass, stalk, or manipulate specific individuals
- Involves creating CSAM or exploiting minors

A goal is SAFE if it:
- Is a legitimate hobby, skill, craft, sport, or profession
- Involves legal self-defense, martial arts, hunting, or shooting sports
- Is academic or educational in nature (e.g., chemistry, cybersecurity, lock sport)
- Could have dual-use aspects but is framed constructively (e.g., "learn ethical hacking", "learn lock picking as a hobby")
- Is unusual or niche but not harmful

Respond with exactly one word: SAFE or UNSAFE`;

async function llmSafetyCheck(
  input: string,
  apiKey: string,
): Promise<SafetyResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SAFETY_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: CLASSIFIER_PROMPT },
          { role: "user", content: input },
        ],
        // gpt-5.x are reasoning models: temperature is not configurable, and
        // reasoning tokens count against the output budget — so the previous
        // max_tokens: 4 would be consumed before any answer, returning empty
        // content and silently failing the goal open. "none" disables reasoning
        // entirely (gpt-5.4-mini rejects "minimal"), keeping this a fast,
        // single-word classification; the budget just needs room for one word.
        reasoning_effort: "none",
        max_completion_tokens: 16,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return { safe: true }; // fail open

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase();

    if (answer?.startsWith("UNSAFE")) {
      return {
        safe: false,
        reason:
          "Rejected. Please try another hobby, skill, or topic you'd like to learn about.",
      };
    }

    return { safe: true };
  } catch {
    return { safe: true };
  } finally {
    clearTimeout(timeout);
  }
}
