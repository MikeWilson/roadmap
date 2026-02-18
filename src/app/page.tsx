"use client";

import { useState } from "react";
import { GoalInput } from "@/components/landing/GoalInput";
import { Header } from "@/components/shared/Header";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex min-h-screen flex-col items-center px-4 pb-16 sm:justify-center">
        <GoalInput onStepChange={setStep} />
      </main>
    </div>
  );
}
