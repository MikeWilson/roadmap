"use client";

import { useState } from "react";
import { GoalInput } from "@/components/landing/GoalInput";
import { Header } from "@/components/shared/Header";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div
      className={`flex flex-col bg-zinc-50 dark:bg-zinc-950 ${
        step === 2 ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
      style={step === 2 ? { height: "100dvh" } : undefined}
    >
      <Header />
      <main
        className={`flex flex-1 flex-col items-center px-4 ${
          step === 2
            ? "min-h-0 justify-start pt-[72px] sm:pt-20"
            : "justify-center pb-16 pt-20 sm:pt-[18vh]"
        }`}
      >
        <GoalInput onStepChange={setStep} />
      </main>
    </div>
  );
}
