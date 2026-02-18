"use client";

import { useState } from "react";
import { GoalInput } from "@/components/landing/GoalInput";
import { Header } from "@/components/shared/Header";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main
        className={`flex flex-1 flex-col items-center px-4 pb-16 ${
          step === 2
            ? "justify-start pt-20"
            : "justify-center pt-20 sm:pt-[18vh]"
        }`}
      >
        <GoalInput onStepChange={setStep} />
      </main>
    </div>
  );
}
