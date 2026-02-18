"use client";

import { useState } from "react";
import { GoalInput } from "@/components/landing/GoalInput";
import { Header } from "@/components/shared/Header";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 pb-16 pt-32">
        <div
          className={`transition-all duration-400 ease-out ${
            step === 2
              ? "max-h-0 overflow-hidden opacity-0"
              : "max-h-40 opacity-100"
          }`}
        >
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl text-center">
            AI Roadmap Generator
          </h1>
          <p className="mt-4 max-w-xl text-center text-lg text-zinc-600 dark:text-zinc-400">
            Describe any goal and get a visual learning roadmap powered by AI.
            From hobbies to careers, zero to expert.
          </p>
        </div>
        <GoalInput onStepChange={setStep} />
      </main>
    </div>
  );
}
