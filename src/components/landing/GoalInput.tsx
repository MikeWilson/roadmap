"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/lib/hooks/useApiKey";

const SUGGESTIONS = [
  // --- initial 8 ---
  ["🔌", "Hobbyist electrical engineer"],
  ["🏃", "Run a marathon"],
  ["🎸", "Learn to play guitar"],
  ["💼", "Start a small business"],
  ["🏊", "Triathlon athlete"],
  ["🤖", "Learn machine learning"],
  ["👨‍🍳", "Become a home chef"],
  ["🎣", "Learn to fly fish"],
  // --- batch 2 (8 more → 16) ---
  ["📖", "Write a novel"],
  ["🤿", "Get scuba certified"],
  ["🍺", "Brew my own beer"],
  ["🏄", "Learn to surf"],
  ["📱", "Build a mobile app"],
  ["🥬", "Grow a vegetable garden"],
  ["🧘", "Become a yoga instructor"],
  ["✒️", "Learn calligraphy"],
  // --- batch 3 (16 more → 32) ---
  ["🚗", "Restore a vintage car"],
  ["⛵", "Learn to sail"],
  ["🎙️", "Start a podcast"],
  ["🐝", "Become a beekeeper"],
  ["♟️", "Master chess"],
  ["🏺", "Learn pottery"],
  ["🏅", "Train for an Ironman"],
  ["🏠", "Build a cabin"],
  ["🤟", "Learn sign language"],
  ["🍷", "Become a sommelier"],
  ["🎥", "Start a YouTube channel"],
  ["⚒️", "Learn blacksmithing"],
  ["✈️", "Get a pilot's license"],
  ["🎨", "Master watercolor painting"],
  ["🛸", "Build a drone"],
  ["🧗", "Learn to rock climb"],
  // --- the full glorious list ---
  ["📸", "Become a wildlife photographer"],
  ["🔥", "Learn to weld"],
  ["🚚", "Start a food truck"],
  ["🎬", "Write a screenplay"],
  ["🥊", "Learn kickboxing"],
  ["🌳", "Build a treehouse"],
  ["🍞", "Master sourdough baking"],
  ["🎧", "Learn to DJ"],
  ["❤️", "Start a nonprofit"],
  ["🤺", "Learn fencing"],
  ["🔭", "Build a telescope"],
  ["🛹", "Learn to skateboard"],
  ["🦋", "Start a butterfly garden"],
  ["📐", "Master origami"],
  ["🌌", "Learn astrophotography"],
  ["🤖", "Build an Arduino robot"],
  ["⛷️", "Learn to ski"],
  ["📚", "Start a book club"],
  ["☕", "Master espresso making"],
  ["🏹", "Learn archery"],
  ["🏎️", "Build a go-kart"],
  ["🥃", "Become a whiskey connoisseur"],
  ["🪵", "Learn woodworking"],
  ["✍️", "Start a blog"],
  ["🫧", "Learn glassblowing"],
  ["🖨️", "Build a 3D printer"],
  ["🥖", "Master bread baking"],
  ["🤸", "Learn parkour"],
  ["🌻", "Start a community garden"],
  ["🐠", "Become a certified diver"],
  ["💎", "Learn lapidary"],
  ["⚙️", "Build a CNC machine"],
  ["🍄", "Learn to forage"],
  ["🧺", "Start a farmers market stand"],
  ["🪢", "Master macramé"],
  ["🏍️", "Learn to ride a motorcycle"],
  ["🎹", "Build a synthesizer"],
  ["🏔️", "Become a mountain guide"],
  ["🧳", "Learn leatherworking"],
  ["👕", "Start a clothing brand"],
  ["🍣", "Master sushi making"],
  ["🪂", "Learn to paraglide"],
  ["🏡", "Build a tiny house"],
  ["🍄", "Become a mushroom forager"],
  ["🖼️", "Learn screen printing"],
  ["🕯️", "Start a candle business"],
  ["🍜", "Master Thai cooking"],
  ["🏂", "Learn to snowboard"],
  ["🛶", "Build a kayak"],
  ["🏞️", "Become a trail runner"],
  ["📕", "Learn bookbinding"],
  ["🧀", "Start a cheese-making hobby"],
  ["☕", "Master latte art"],
  ["🛼", "Learn to inline skate"],
  ["📻", "Become a ham radio operator"],
  ["💃", "Learn to tap dance"],
  ["🪴", "Start a terrarium business"],
  ["🍛", "Master Indian cooking"],
  ["🌊", "Learn to windsurf"],
  ["🍕", "Build a pizza oven"],
  ["🏋️", "Become a CrossFit athlete"],
  ["🧺", "Learn basket weaving"],
  ["🫖", "Start a kombucha brewery"],
  ["🥐", "Master French pastry"],
  ["🐴", "Learn horseback riding"],
  ["🔥", "Build a fire pit"],
  ["🐦", "Become a bird watcher"],
  ["🤹", "Learn to juggle"],
  ["🌶️", "Start a hot sauce brand"],
  ["🥟", "Master dumpling making"],
  ["⛸️", "Learn ice skating"],
  ["🥩", "Build a smokehouse"],
  ["🎤", "Become a standup comedian"],
  ["🧶", "Learn to knit"],
  ["🧼", "Start a soap business"],
  ["🍜", "Master ramen from scratch"],
  ["🛶", "Learn to paddleboard"],
  ["🚤", "Build a boat"],
  ["🏊", "Become a marathon swimmer"],
  ["🧵", "Learn embroidery"],
  ["💍", "Start a jewelry line"],
  ["🍖", "Master BBQ smoking"],
  ["🏄", "Learn to wakeboard"],
  ["🌿", "Build a greenhouse"],
  ["🎙️", "Become a voice actor"],
  ["🧶", "Learn to crochet"],
  ["🪴", "Start a plant nursery"],
  ["🫙", "Master fermentation"],
  ["🪁", "Learn to kitesurf"],
  ["🧖", "Build a sauna"],
  ["🧠", "Become a trivia host"],
  ["🔪", "Learn whittling"],
  ["🛍️", "Start a vintage shop"],
  ["🍫", "Master chocolate making"],
  ["🦇", "Learn to spelunk"],
  ["🧗", "Build a climbing wall"],
  ["🐕", "Become a dog trainer"],
  ["🏺", "Learn to throw pottery on a wheel"],
  ["💐", "Start a flower farm"],
  ["🍝", "Master pasta from scratch"],
  ["🚵", "Learn to mountain bike"],
  ["🎛️", "Build a recording studio"],
  ["📜", "Become a local historian"],
  ["🧵", "Learn to spin yarn"],
  ["📷", "Start a photography business"],
  ["🥟", "Master dim sum"],
  ["⛸️", "Learn figure skating"],
  ["🛹", "Build a skatepark"],
  ["🏕️", "Become a scoutmaster"],
  ["🪟", "Learn to make stained glass"],
  ["🧁", "Start a bakery"],
  ["🎭", "Learn improv comedy"],
  ["🦜", "Raise backyard chickens"],
  ["🧊", "Learn ice sculpting"],
  ["🎪", "Learn aerial silks"],
  ["🌾", "Start a homestead"],
  ["🧬", "Learn bioinformatics"],
  ["🏰", "Build a medieval forge"],
  ["🎯", "Master darts"],
  ["🧲", "Build an electromagnet"],
  ["🦷", "Learn dental carving"],
  ["🪨", "Build a rock garden"],
  ["🌶️", "Grow the hottest pepper"],
  ["🎲", "Design a board game"],
  ["🧪", "Learn home chemistry"],
  ["🏺", "Make my own ceramics"],
  ["🧊", "Learn to make cocktails"],
  ["🎻", "Learn the violin"],
  ["🪕", "Learn the banjo"],
  ["🥁", "Learn the drums"],
  ["🎷", "Learn the saxophone"],
  ["🎺", "Learn the trumpet"],
  ["🪈", "Learn the flute"],
  ["🪗", "Learn the accordion"],
  ["📝", "Write poetry"],
  ["🎮", "Make an indie video game"],
  ["🖥️", "Build a PC from scratch"],
  ["🔐", "Learn cybersecurity"],
  ["📊", "Master data visualization"],
  ["🌐", "Learn a new language"],
  ["🇯🇵", "Learn Japanese"],
  ["🇫🇷", "Learn French"],
  ["🇰🇷", "Learn Korean"],
  ["🇧🇷", "Learn Portuguese"],
  ["🇸🇦", "Learn Arabic"],
  ["🇨🇳", "Learn Mandarin"],
  ["🧮", "Learn to speed-solve Rubik's cubes"],
  ["🪄", "Learn magic tricks"],
  ["🎭", "Join a theater troupe"],
  ["💪", "Get a pull-up to handstand"],
  ["🧗", "Climb a 14er"],
  ["🏜️", "Hike the Appalachian Trail"],
  ["🏔️", "Summit Mount Rainier"],
  ["🌋", "Visit every national park"],
  ["🛤️", "Bike across the country"],
  ["🏁", "Race in a triathlon"],
  ["🦈", "Swim with sharks"],
  ["🐋", "Go whale watching"],
  ["🐎", "Learn polo"],
  ["🎳", "Join a bowling league"],
  ["⛳", "Break 80 in golf"],
  ["🏓", "Get competitive at ping pong"],
  ["🥋", "Earn a black belt"],
  ["🤼", "Learn wrestling"],
  ["🏌️", "Master disc golf"],
  ["🎾", "Win a tennis tournament"],
  ["🧘", "Complete a silent retreat"],
  ["📿", "Start a meditation practice"],
  ["🖋️", "Learn hand lettering"],
  ["🎞️", "Make a short film"],
  ["🎙️", "Produce a documentary"],
  ["📺", "Start a Twitch stream"],
  ["🖌️", "Learn oil painting"],
  ["✏️", "Learn to draw portraits"],
  ["🗿", "Learn stone carving"],
  ["🪆", "Learn wood turning"],
  ["🧱", "Build a brick oven"],
  ["🔩", "Restore vintage tools"],
  ["🏚️", "Flip a house"],
  ["🪑", "Build custom furniture"],
  ["🛋️", "Learn upholstery"],
  ["🔦", "Build a van conversion"],
  ["⚡", "Install solar panels at home"],
  ["🌱", "Start composting"],
  ["🐛", "Start a worm farm"],
  ["🐟", "Build an aquaponics system"],
  ["🫚", "Grow medicinal herbs"],
  ["🍇", "Make my own wine"],
  ["🍎", "Start an orchard"],
  ["🥕", "Run a CSA farm share"],
  ["🐑", "Raise sheep"],
  ["🐐", "Start a goat dairy"],
  ["🧈", "Learn to make butter"],
  ["🍯", "Harvest my own honey"],
  ["🥧", "Win a pie baking contest"],
  ["🍰", "Master cake decorating"],
  ["🧆", "Master Middle Eastern cooking"],
  ["🌮", "Master Mexican cooking"],
  ["🥘", "Master Ethiopian cooking"],
  ["🍲", "Master Korean cooking"],
  ["🫕", "Master fondue"],
  ["🥩", "Dry-age my own steaks"],
  ["🐙", "Cook every Julia Child recipe"],
] as const;

const EMOJIS = [
  // death & rip
  "🪦", "💀", "☠️", "⚰️", "👻", "🦴", "🕯️", "⚱️", "🥀",
  // flowers & nature
  "🌸", "🌺", "🌻", "🌹", "🌷", "💐", "🌼", "🪻", "🌵",
  // animals
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
  "🐧", "🦉", "🦋", "🐌", "🐞", "🐙", "🐬", "🐳", "🦈",
  "🐘", "🦒", "🦦", "🦥", "🦔", "🦩", "🦚", "🕊️", "🐢",
  // sports & hobbies
  "⚽", "🏀", "🎾", "🏈", "⚾", "🎳", "🏓", "🛹", "🎿",
  "🏄", "🚴", "🏋️", "🧗", "🎣", "🏕️",
  // music & arts
  "🎸", "🎹", "🥁", "🎺", "🎻", "🎨", "🖌️", "📷", "🎬",
  // food & cooking
  "🍕", "🍣", "🌮", "🍰", "🧁", "🍩", "🥐", "🍜", "🥑",
  // travel & adventure
  "🏔️", "🌋", "🏝️", "🗺️", "🧭", "⛵", "🚀", "✈️", "🎪",
  // tools & making
  "🔧", "🔨", "🪚", "🧲", "💡", "🔬", "🔭", "🧪", "🪴",
  // books & learning
  "📚", "🎓", "✏️", "🧩", "♟️", "🎲",
  // misc fun
  "🎯", "🪁", "🛶", "⛺", "🎠", "🎡", "🌈", "⭐", "🔥",
];

function pickRandom(pool: string[], count: number, exclude: string[]): string[] {
  const available = pool.filter((e) => !exclude.includes(e));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available.splice(idx, 1)[0]);
  }
  return result;
}

const DEFAULT_EMOJIS = EMOJIS.slice(0, 3);

export function GoalInput({ onStepChange }: { onStepChange?: (step: 1 | 2) => void }) {
  const [emojis, setEmojis] = useState(DEFAULT_EMOJIS);
  const [emojiKey, setEmojiKey] = useState(0);
  const hasMounted = useRef(false);
  const [goal, setGoal] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [goalDescription, setGoalDescription] = useState("");
  const [contextPlaceholder, setContextPlaceholder] = useState(
    "e.g., I took a physics class in college and can solder basic circuits, but I've never designed my own PCB...",
  );
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentState, setCurrentState] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const expandedGoalRef = useRef<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const { apiKey } = useApiKey();

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setEmojis(pickRandom(EMOJIS, 3, []));
      setEmojiKey((k) => k + 1);
    }
  }, []);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  const descriptionCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      descriptionRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  // Auto-resize when goalDescription changes
  useEffect(() => {
    autoResize(descriptionRef.current);
  }, [goalDescription, autoResize]);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setStep(2);
    onStepChange?.(2);
  };

  // Expand the goal into a richer description when entering step 2
  useEffect(() => {
    if (step !== 2 || expandedGoalRef.current === goal) return;
    expandedGoalRef.current = goal;
    setIsExpanding(true);
    setIsRevealed(false);
    setGoalDescription("");

    fetch("/api/expand-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, apiKey }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.description) setGoalDescription(data.description);
        if (data?.currentStatePlaceholder)
          setContextPlaceholder(data.currentStatePlaceholder);
      })
      .finally(() => {
        setIsExpanding(false);
        // Small delay so the DOM renders before triggering the transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsRevealed(true));
        });
      });
  }, [step, goal, apiKey]);

  const shuffleEmojis = () => {
    setEmojis(pickRandom(EMOJIS, 3, emojis));
    setEmojiKey((k) => k + 1);
  };

  const handleGenerate = () => {
    const params = new URLSearchParams({ goal: goal.trim() });
    if (goalDescription.trim()) {
      params.set("goalDescription", goalDescription.trim());
    }
    if (currentState.trim()) {
      params.set("context", currentState.trim());
    }
    router.push(`/roadmap?${params.toString()}`);
  };

  if (step === 2) {
    return (
      <div className="mt-4 w-full max-w-xl sm:mt-10">
        <button
          onClick={() => {
            setStep(1);
            onStepChange?.(1);
            expandedGoalRef.current = null;
          }}
          className="mb-8 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="relative pl-10">
          {/* Vertical dashed line connecting the three points, fading out at bottom */}
          <div
            className="absolute left-[15px] top-8 bottom-0 w-px border-l-2 border-dashed border-zinc-300 dark:border-zinc-600"
            style={{
              maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
            }}
          />

          {/* Starting point — today */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              </div>
              <label
                htmlFor="current-state"
                className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400"
              >
                Today
              </label>
            </div>
            <textarea
              id="current-state"
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              placeholder={contextPlaceholder}
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Destination — someday */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" x2="4" y1="22" y2="15" />
                </svg>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Someday
              </p>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {goal}
            </p>
            <div className="relative mt-2 min-h-[4.5rem]">
              <div
                className={`absolute inset-0 flex items-center rounded-xl border border-zinc-300 bg-white px-4 transition-opacity duration-300 dark:border-zinc-700 dark:bg-zinc-900 ${
                  isExpanding ? "animate-pulse opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="w-full space-y-2.5">
                  <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
              <textarea
                ref={descriptionCallbackRef}
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={2}
                className={`w-full resize-none overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-all duration-500 ease-out placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
                  isRevealed && !isExpanding ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                }`}
              />
            </div>
          </div>

          {/* The end */}
          <div className="-ml-10 flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
              <span className="text-base">🪦</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Some other day
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={!goal.trim() || isExpanding}
            className="w-full rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Generate Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <button
        onClick={shuffleEmojis}
        className="mb-10 flex w-full cursor-pointer items-center justify-center gap-3"
        aria-label="Shuffle emojis"
        type="button"
      >
        <span className="select-none text-4xl opacity-60">🌱</span>
        <span className="mx-1 text-zinc-300 dark:text-zinc-600">···</span>
        {emojis.map((emoji, i) => (
          <span
            key={`${emojiKey}-${i}`}
            className="animate-emoji-bounce select-none text-6xl"
            style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
          >
            {emoji}
          </span>
        ))}
        <span className="mx-1 text-zinc-300 dark:text-zinc-600">···</span>
        <span className="select-none text-4xl opacity-60">🪦</span>
      </button>
      <form onSubmit={handleGoalSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Become a hobbyist electrical engineer"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={!goal.trim()}
          className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Next
        </button>
      </form>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.slice(0, visibleCount).map(([emoji, text]) => (
          <button
            key={text}
            onClick={() => {
              setGoal(text);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group animate-pill-fade-in rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <span className="mr-1.5 grayscale transition-[filter] duration-200 group-hover:grayscale-0">{emoji}</span>
            {text}
          </button>
        ))}
      </div>
      {visibleCount < SUGGESTIONS.length && (
        <button
          onClick={() => {
            setVisibleCount((prev) =>
              prev >= 32 ? SUGGESTIONS.length : prev * 2,
            );
          }}
          className="mx-auto mt-3 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <span>
            {visibleCount >= 32
              ? "I'm picky, give me all the ideas"
              : visibleCount >= 16
                ? "Even more ideas"
                : "More ideas"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
