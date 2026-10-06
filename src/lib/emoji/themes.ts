/**
 * The single source of truth for emoji themes.
 *
 * Every theme declares its own emoji pool and the keywords that select it.
 * Adding a theme, an emoji, or a keyword is a one-place edit here — the goal
 * matcher, the landing-page pills, the loading screen and the `emojiTheme`
 * URL param all read from this registry.
 *
 * Per theme:
 *  - `core`     the tightest, most on-theme emojis. Used where only a few are
 *               shown at once (the landing-page trio).
 *  - `more`     wider variations, appended when a surface needs variety over
 *               time (the loading screen cycles through one every 1.2s).
 *  - `keywords` match a typed goal to this theme. A keyword containing a space
 *               is matched as a phrase and scores double, which is how you
 *               break a tie against a theme that owns the single word
 *               ("korean cooking" beats `lang`'s "korean").
 *  - `distinct` emojis that are mutually exclusive alternatives, e.g. one
 *               instrument per theme. When a distinct emoji leads a set, its
 *               siblings are held back, so "Learn the banjo" never renders a
 *               banjo next to a guitar.
 */

export type Theme = {
  /** Plain-English name for the theme. Nothing renders it; the short keys
   *  below (`advent`, `biz`, `zen`) are too terse to read on their own. */
  label: string;
  core: readonly string[];
  more: readonly string[];
  keywords: readonly string[];
  distinct?: readonly string[];
};

export const THEMES = {
  water: {
    label: "Water & boats",
    core: ["🎣", "🐟", "🐠", "🌊", "🏄", "🤿", "⛵", "🚣", "🚤"],
    more: ["🦈", "🐋", "🐬", "🐚", "🪸", "🦑", "🐡", "🦞"],
    keywords: ["water", "swim", "surf", "sail", "boat", "ocean", "lake", "river", "dive", "scuba", "paddle", "kayak", "snorkel", "windsurf", "fish"],
  },
  run: {
    label: "Running & fitness",
    core: ["🏃", "👟", "🏅", "🏁", "💨", "🎽", "⏱️", "💪"],
    more: ["🥇", "🏆", "🦵", "🥈"],
    keywords: ["run", "runner", "jog", "marathon", "race", "sprint", "workout", "gym", "fitness", "lift", "weight", "strength", "buff", "cardio", "triathlon", "ironman"],
  },
  music: {
    label: "Music",
    core: ["🎵", "🎶", "🎸", "🎹", "🎤", "🎧", "🎼", "🥁"],
    more: ["🎻", "🎷", "🎺", "🪕", "🪗", "🪈"],
    keywords: ["music", "guitar", "piano", "drum", "violin", "sing", "band", "song", "compose", "dj", "produce", "saxophone", "trumpet", "flute", "accordion", "banjo"],
    distinct: ["🎸", "🎹", "🎻", "🥁", "🎷", "🎺", "🪕", "🪗", "🪈"],
  },
  cook: {
    label: "Cooking",
    core: ["🍳", "👨‍🍳", "🔪", "🥘", "🍽️", "🍲", "🥢", "🧑‍🍳"],
    more: ["🥄", "🫕", "🍖", "🧈", "🥣", "♨️", "🫙"],
    keywords: ["korean cooking", "thai cooking", "indian cooking", "mexican cooking", "ethiopian cooking", "middle eastern", "cook", "chef", "recipe", "meal", "dinner", "kitchen", "pasta", "bbq", "grill", "sushi", "thai", "indian", "mexican", "korean", "ethiopian", "fondue", "dumpling", "ramen"],
  },
  bake: {
    label: "Baking",
    core: ["🍞", "🥐", "🧁", "🍰", "🥧", "🎂", "🍪", "🥖"],
    more: ["🧇", "🫓", "🧑‍🍳"],
    keywords: ["bake", "bread", "cake", "pastry", "sourdough", "cookie", "dessert", "pie"],
  },
  drink: {
    label: "Coffee, beer & cocktails",
    core: ["🍺", "🍷", "☕", "🥃", "🍸", "🧋", "🍹", "🍾"],
    more: ["🫖", "🍶", "🥂", "🫗", "🥤"],
    keywords: ["coffee", "espresso", "tea", "drink", "brew", "beer", "wine", "cocktail", "kombucha", "barista", "whiskey", "sommelier"],
  },
  tech: {
    label: "Code & electronics",
    core: ["💻", "🖥️", "📱", "⌨️", "🤖", "💾", "🔌", "💡"],
    more: ["📡", "🧬", "📊", "🔋", "🖱️"],
    keywords: ["3d print", "machine learning", "code", "program", "software", "app", "website", "web", "robot", "ai", "tech", "data", "cyber", "arduino"],
  },
  garden: {
    label: "Gardening",
    core: ["🌱", "🌿", "🌻", "🌸", "🪴", "🐝", "🦋", "🌼"],
    more: ["🍀", "🌳", "🐛", "🪻", "🌺", "☘️", "🌲"],
    keywords: ["garden", "plant", "grow", "herb", "compost", "greenhouse", "seed", "soil", "vegetable", "flower"],
  },
  art: {
    label: "Art & craft",
    core: ["🎨", "🖌️", "✏️", "🖍️", "🖼️", "🏺", "🧵", "🧶"],
    more: ["✂️", "🪡", "📐", "🪆", "💎", "🎭"],
    keywords: ["art", "paint", "draw", "craft", "sculpt", "pottery", "ceramic", "design", "photo", "photograph", "calligraphy", "ink", "tattoo", "origami"],
  },
  build: {
    label: "Building & making",
    core: ["🔨", "🔧", "🪚", "🏗️", "🧱", "🪵", "🛠️", "⚙️"],
    more: ["⚒️", "📐", "🪜", "🏠", "🔩", "🪛"],
    keywords: ["climbing wall", "pizza oven", "build", "woodwork", "carpentr", "weld", "forge", "blacksmith", "tool", "diy", "renovat", "furniture", "cabin", "skatepark", "smokehouse", "whittl"],
  },
  write: {
    label: "Writing & media",
    core: ["✍️", "📝", "📖", "📚", "🖊️", "🎙️", "🎬", "📻"],
    more: ["📰", "📺", "🖋️", "📜"],
    keywords: ["write", "book", "novel", "blog", "story", "screenplay", "script", "podcast", "journal", "poetry", "poem"],
  },
  advent: {
    label: "Outdoors & adventure",
    core: ["🏔️", "🏕️", "🧭", "🗺️", "🥾", "🎒", "⛺", "🧗"],
    more: ["⛰️", "🌄", "🗻", "🌅", "🏜️"],
    keywords: ["hike", "climb", "camp", "trail", "mountain", "adventure", "explore", "backpack", "trek", "outdoor", "pilot", "paraglid"],
  },
  biz: {
    label: "Business",
    core: ["💼", "📈", "💰", "🏪", "🛍️", "🤝", "🧾", "🛒"],
    more: ["📦", "💡", "📋", "🏷️"],
    keywords: ["side hustle", "hot sauce", "jewelry line", "food truck", "business", "startup", "company", "brand", "entrepreneur", "market", "sell", "sales", "shop", "nonprofit"],
  },
  animal: {
    label: "Animals & pets",
    core: ["🐶", "🐱", "🐴", "🐔", "🦜", "🐦", "🐰", "🐾"],
    more: ["🐕", "🐣", "🦮"],
    keywords: ["dog", "cat", "kitten", "horse", "bird", "chicken", "pet", "animal"],
  },
  farm: {
    label: "Farming & homesteading",
    core: ["🌾", "🚜", "🐓", "🐑", "🐐", "🥛", "🍯", "🐄"],
    more: ["🧈", "🐝", "🌽", "🥚"],
    keywords: ["farm", "chicken", "goat", "sheep", "cow", "dairy", "honey", "orchard", "homestead"],
  },
  combat: {
    label: "Martial arts & combat",
    core: ["🥊", "🤺", "🏹", "🥋", "⚔️", "🛡️", "👊", "🥷"],
    more: ["💪", "🎯", "🤼", "🦾"],
    keywords: ["jiu jitsu", "box", "fight", "martial", "karate", "kickbox", "wrestle", "fenc", "mma", "archery"],
    distinct: ["🥊", "🤺", "🏹", "🥋", "🤼"],
  },
  lang: {
    label: "Languages",
    core: ["🗣️", "💬", "🌍", "✈️", "🗺️", "📝", "🎓", "📚"],
    more: ["🌏", "🌐", "💭", "🗨️"],
    keywords: ["sign language", "language", "spanish", "french", "german", "japanese", "korean", "mandarin", "arabic", "portuguese", "translate", "lingo"],
  },
  game: {
    label: "Games & target sports",
    core: ["♟️", "🎲", "🎯", "🏆", "🧩", "🎮", "🎳", "🎾"],
    more: ["🃏", "🏓", "⛳", "🎱"],
    keywords: ["game", "gaming", "chess", "board", "darts", "tennis", "ping", "golf", "bowling", "poker"],
  },
  ride: {
    label: "Riding & wheels",
    core: ["🚗", "🏍️", "🛹", "🚲", "🏎️", "🛵", "🛞", "🏁"],
    more: ["⛽", "🔧", "🛻", "🚙", "🛼"],
    keywords: ["ride", "motorcycle", "bike", "biking", "cycling", "car", "skate", "skating", "scooter"],
    distinct: ["🚗", "🏍️", "🚲", "🏎️", "🛵", "🛹", "🛼", "🚙", "🛻"],
  },
  science: {
    label: "Science & space",
    core: ["🔬", "🔭", "🧪", "🧬", "💡", "🌌", "⭐", "📡"],
    more: ["⚗️", "🪐", "🧠", "🔮"],
    keywords: ["science", "chem", "physic", "biology", "telescope", "space", "astronomy", "lab", "experiment"],
  },
  perform: {
    label: "Performing",
    core: ["🎤", "🎭", "💃", "🕺", "🤹", "🎪", "🎶", "🎬"],
    more: ["👯", "📺", "🎙️", "🪄"],
    keywords: ["perform", "acting", "actor", "theater", "dance", "comedy", "improv", "standup", "juggle", "magic"],
  },
  zen: {
    label: "Yoga & mindfulness",
    core: ["🧘", "🙏", "🪷", "📿", "🍃", "🌸"],
    more: ["🕉️", "💆", "🫧", "☮️"],
    keywords: ["yoga", "meditat", "mindful", "retreat", "breath", "stretch"],
  },
  ice: {
    label: "Snow & ice",
    core: ["❄️", "🧊", "⛸️", "⛷️", "🏂", "🌨️", "🎿", "☃️"],
    more: ["🏔️", "🦌", "⛰️"],
    keywords: ["ice skating", "figure skating", "ice sculpt", "ice", "ski", "snow", "snowboard", "winter", "curling"],
    distinct: ["⛸️", "⛷️", "🏂", "🎿"],
  },
} as const satisfies Record<string, Theme>;

export type ThemeKey = keyof typeof THEMES;

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

/**
 * `THEMES` is `as const` so that `ThemeKey` is a real union rather than
 * `string`, which means each entry's type is its own literal shape and
 * optional fields like `distinct` only exist on the themes that set them.
 * Read a theme through here to get the uniform `Theme` view.
 */
export function themeOf(key: ThemeKey): Theme {
  return THEMES[key];
}

/**
 * Guards untrusted input — notably the `emojiTheme` URL param. Uses an own-
 * property check: `"__proto__" in THEMES` and `"constructor" in THEMES` are
 * both true, and reading those keys back yields something that is not a theme.
 */
export function isThemeKey(value: string | null | undefined): value is ThemeKey {
  return !!value && Object.prototype.hasOwnProperty.call(THEMES, value);
}

/**
 * Shown when nothing in the goal matches a theme. Deliberately broad and
 * upbeat: no somber emojis, which are reserved for the idle state below.
 */
export const FALLBACK_EMOJIS: readonly string[] = [
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

/** The "life is boring" resting state, before the visitor has typed anything. */
export const IDLE_EMOJIS: readonly string[] = ["🥱", "🛋️", "😴"];
