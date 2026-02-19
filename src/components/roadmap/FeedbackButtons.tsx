"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

type Sentiment = "positive" | "negative";

interface FeedbackButtonsProps {
  prompt: string;
  response: string;
}

export function FeedbackButtons({ prompt, response }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState<Sentiment | null>(null);

  function handleFeedback(sentiment: Sentiment) {
    if (submitted) return;
    setSubmitted(sentiment);
    track("roadmap_feedback", {
      sentiment,
      prompt,
      // Vercel Analytics custom event properties are capped at 500 chars
      response: response.slice(0, 500),
    });
  }

  return (
    <div
      className="mt-10 flex flex-col items-center gap-2"
      style={{ animation: "step-fade-in 0.5s ease-out both" }}
    >
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        Was this roadmap helpful?
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleFeedback("positive")}
          disabled={submitted !== null}
          className={`rounded-full px-4 py-2 text-lg transition-all ${
            submitted === "positive"
              ? "scale-110 bg-emerald-100 dark:bg-emerald-900/40"
              : submitted === "negative"
                ? "opacity-30 cursor-default"
                : "hover:bg-zinc-100 hover:scale-110 active:scale-95 dark:hover:bg-zinc-800"
          }`}
          aria-label="Thumbs up"
        >
          <span className="inline-flex [filter:saturate(0)]">👍</span>
        </button>
        <button
          onClick={() => handleFeedback("negative")}
          disabled={submitted !== null}
          className={`rounded-full px-4 py-2 text-lg transition-all ${
            submitted === "negative"
              ? "scale-110 bg-red-100 dark:bg-red-900/40"
              : submitted === "positive"
                ? "opacity-30 cursor-default"
                : "hover:bg-zinc-100 hover:scale-110 active:scale-95 dark:hover:bg-zinc-800"
          }`}
          aria-label="Thumbs down"
        >
          <span className="inline-flex [filter:saturate(0)]">👎</span>
        </button>
      </div>
      {submitted && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 animate-in fade-in">
          Thanks for your feedback!
        </p>
      )}
    </div>
  );
}
