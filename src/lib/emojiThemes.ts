/**
 * Theme-based emoji pools and goal-to-emoji matching.
 * Used by the loading screen to show relevant emojis while generating a roadmap.
 */

const CORE_THEME_POOLS: Record<string, string[]> = {
  water: ["🎣", "🐟", "🐠", "🌊", "🏄", "🤿", "⛵", "🚣", "🚤"],
  run: ["🏃", "👟", "🏅", "🏁", "💨", "🎽", "⏱️", "💪"],
  music: ["🎵", "🎶", "🎸", "🎹", "🎤", "🎧", "🎼", "🥁"],
  cook: ["🍳", "👨‍🍳", "🔪", "🥘", "🍽️", "🍲", "🥢", "🧑‍🍳"],
  bake: ["🍞", "🥐", "🧁", "🍰", "🥧", "🎂", "🍪", "🥖"],
  drink: ["🍺", "🍷", "☕", "🥃", "🍸", "🧋", "🍹", "🍾"],
  tech: ["💻", "🖥️", "📱", "⌨️", "🤖", "💾", "🔌", "💡"],
  garden: ["🌱", "🌿", "🌻", "🌸", "🪴", "🐝", "🦋", "🌼"],
  art: ["🎨", "🖌️", "✏️", "🖍️", "🖼️", "🏺", "🧵", "🧶"],
  build: ["🔨", "🔧", "🪚", "🏗️", "🧱", "🪵", "🛠️", "⚙️"],
  write: ["✍️", "📝", "📖", "📚", "🖊️", "🎙️", "🎬", "📻"],
  advent: ["🏔️", "🏕️", "🧭", "🗺️", "🥾", "🎒", "⛺", "🧗"],
  biz: ["💼", "📈", "💰", "🏪", "🛍️", "🤝", "🧾", "🛒"],
  animal: ["🐶", "🐱", "🐴", "🐔", "🦜", "🐦", "🐰", "🐾"],
  farm: ["🌾", "🚜", "🐓", "🐑", "🐐", "🥛", "🍯", "🐄"],
  combat: ["🥊", "🤺", "🏹", "🥋", "⚔️", "🛡️", "👊", "🥷"],
  lang: ["🗣️", "💬", "🌍", "✈️", "🗺️", "📝", "🎓", "📚"],
  game: ["♟️", "🎲", "🎯", "🏆", "🧩", "🎮", "🎳", "🎾"],
  ride: ["🚗", "🏍️", "🛹", "🚲", "🏎️", "🛵", "🛞", "🏁"],
  science: ["🔬", "🔭", "🧪", "🧬", "💡", "🌌", "⭐", "📡"],
  perform: ["🎤", "🎭", "💃", "🕺", "🤹", "🎪", "🎶", "🎬"],
  zen: ["🧘", "🙏", "🪷", "📿", "🍃", "🌸"],
  ice: ["❄️", "🧊", "⛸️", "⛷️", "🏂", "🌨️", "🎿", "☃️"],
};

const THEME_KEYWORDS: Record<string, string[]> = {
  water: ["water", "swim", "surf", "sail", "boat", "ocean", "lake", "river", "dive", "scuba", "paddle", "kayak", "snorkel", "windsurf", "fish"],
  run: ["run", "runner", "jog", "marathon", "race", "sprint", "workout", "gym", "fitness", "lift", "weight", "strength", "cardio", "triathlon", "ironman"],
  music: ["music", "guitar", "piano", "drum", "violin", "sing", "band", "song", "compose", "dj", "produce", "saxophone", "trumpet", "flute", "accordion", "banjo"],
  cook: ["cook", "chef", "recipe", "meal", "dinner", "kitchen", "pasta", "bbq", "grill", "sushi", "thai", "indian", "mexican", "korean", "ethiopian", "fondue", "dumpling", "ramen"],
  bake: ["bake", "bread", "cake", "pastry", "sourdough", "cookie", "dessert", "pie"],
  drink: ["coffee", "espresso", "tea", "drink", "brew", "beer", "wine", "cocktail", "kombucha", "barista", "whiskey", "sommelier"],
  tech: ["code", "program", "software", "app", "website", "web", "robot", "ai", "tech", "data", "cyber", "arduino", "3d print", "machine learning"],
  garden: ["garden", "plant", "grow", "herb", "compost", "greenhouse", "seed", "soil", "vegetable", "flower"],
  art: ["art", "paint", "draw", "craft", "sculpt", "pottery", "ceramic", "design", "photo", "photograph", "calligraphy", "origami"],
  build: ["build", "woodwork", "carpentr", "weld", "forge", "blacksmith", "tool", "diy", "renovat", "furniture", "cabin"],
  write: ["write", "book", "novel", "blog", "story", "screenplay", "script", "podcast", "journal", "poetry", "poem"],
  advent: ["hike", "climb", "camp", "trail", "mountain", "adventure", "explore", "backpack", "trek", "outdoor", "pilot", "paraglid"],
  biz: ["business", "startup", "company", "brand", "entrepreneur", "market", "sell", "shop", "nonprofit"],
  animal: ["dog", "cat", "horse", "bird", "chicken", "pet", "animal", "trainer"],
  farm: ["farm", "goat", "sheep", "cow", "dairy", "honey", "orchard", "homestead"],
  combat: ["box", "fight", "martial", "karate", "kickbox", "wrestle", "fenc", "jiu jitsu", "mma", "archery"],
  lang: ["language", "spanish", "french", "german", "japanese", "korean", "mandarin", "arabic", "portuguese", "sign language"],
  game: ["game", "gaming", "chess", "board", "darts", "tennis", "golf", "bowling", "poker"],
  ride: ["ride", "motorcycle", "bike", "biking", "cycling", "car", "skate", "skating", "scooter"],
  science: ["science", "chem", "physic", "biology", "telescope", "space", "astronomy", "lab", "experiment"],
  perform: ["perform", "acting", "actor", "theater", "dance", "comedy", "improv", "standup", "juggle", "magic"],
  zen: ["yoga", "meditat", "mindful", "retreat", "breath", "stretch"],
  ice: ["ice", "ski", "snow", "snowboard", "winter"],
};

const FUN_EMOJIS = [
  "🌸", "🌺", "🌻", "🌹", "🌷", "💐", "🌼", "🪻", "🌵",
  "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",
  "🐧", "🦉", "🦋", "🐌", "🐞", "🐙", "🐬", "🐳", "🦈",
  "🐘", "🦒", "🦦", "🦥", "🦔", "🦩", "🦚", "🕊️", "🐢",
  "⚽", "🏀", "🎾", "🏈", "⚾", "🎳", "🏓", "🛹", "🎿",
  "🏄", "🚴", "🏋️", "🧗", "🎣", "🏕️",
  "🎸", "🎹", "🥁", "🎺", "🎻", "🎨", "🖌️", "📷", "🎬",
  "🍕", "🍣", "🌮", "🍰", "🧁", "🍩", "🥐", "🍜", "🥑",
  "🏔️", "🌋", "🏝️", "🗺️", "🧭", "⛵", "🚀", "✈️", "🎪",
  "🔧", "🔨", "🪚", "🧲", "💡", "🔬", "🔭", "🧪", "🪴",
  "📚", "🎓", "✏️", "🧩", "♟️", "🎲",
  "🎯", "🪁", "🛶", "⛺", "🎠", "🎡", "🌈", "⭐", "🔥",
];

export function getEmojisForTheme(theme: string): string[] | null {
  return CORE_THEME_POOLS[theme] ?? null;
}

export function getEmojisForGoal(goal: string): string[] {
  const lower = goal.toLowerCase();
  const words = lower
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  let bestTheme: string | null = null;
  let bestScore = 0;

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (kw.includes(" ")) {
        if (lower.includes(kw)) score += 2;
      } else if (
        words.some((w) => w === kw || w.startsWith(kw) || kw.startsWith(w))
      ) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  if (bestTheme && CORE_THEME_POOLS[bestTheme]) {
    return CORE_THEME_POOLS[bestTheme];
  }
  return FUN_EMOJIS;
}
