export function RoadmapLoading({ goal }: { goal: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Generating your roadmap...
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          &ldquo;{goal}&rdquo;
        </p>
      </div>
    </div>
  );
}
