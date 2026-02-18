import { GoalInput } from "@/components/landing/GoalInput";
import { Header } from "@/components/shared/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 pb-16 pt-32">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          AI Roadmap Generator
        </h1>
        <p className="mt-4 max-w-xl text-center text-lg text-zinc-600 dark:text-zinc-400">
          Describe any goal and get a visual learning roadmap powered by AI.
          From hobbies to careers, zero to expert.
        </p>
        <GoalInput />
      </main>
    </div>
  );
}
