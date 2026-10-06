/**
 * Matches a free-text goal to a theme.
 *
 * This used to exist twice — once for the landing page, once for the loading
 * screen — with keyword lists that had drifted 49 ways apart, so the two
 * screens could disagree about the same goal. There is now one matcher.
 */

import { THEMES, THEME_KEYS, type ThemeKey } from "./themes";

export type ThemeMatch = {
  theme: ThemeKey;
  /** A more specific emoji than the theme pool offers, led in the set. */
  leadEmoji?: string;
};

/**
 * Checked in order, before keyword scoring. A lead wins outright, because it
 * names the activity more precisely than its theme can ("gym" is `run`, but
 * deserves 🏋️ rather than a random sneaker).
 */
const LEADS: ReadonlyArray<{
  keywords: readonly string[];
  theme: ThemeKey;
  emoji: string;
}> = [
  { keywords: ["weight lift", "weights", "weight", "lift", "gym", "workout", "strength", "muscle", "buff"], theme: "run", emoji: "🏋️" },
  { keywords: ["run", "runner", "jog", "marathon", "race", "sprint", "trail run"], theme: "run", emoji: "🏃" },
  { keywords: ["yoga", "meditat", "mindful", "breathwork"], theme: "zen", emoji: "🧘" },
  { keywords: ["swim", "scuba", "dive", "freedive"], theme: "water", emoji: "🏊" },
  { keywords: ["surf", "kitesurf", "paddleboard", "kayak", "sail", "boat", "ocean"], theme: "water", emoji: "🏄" },
  { keywords: ["guitar", "piano", "drum", "violin", "sing", "band", "songwrit"], theme: "music", emoji: "🎸" },
  { keywords: ["cook", "chef", "recipe", "meal prep"], theme: "cook", emoji: "🍳" },
  { keywords: ["bake", "bread", "cake", "pastry", "sourdough"], theme: "bake", emoji: "🍞" },
  { keywords: ["coffee", "espresso", "barista", "cocktail", "brew", "kombucha"], theme: "drink", emoji: "☕" },
  { keywords: ["code", "program", "app", "software", "ai", "robot", "3d print", "arduino"], theme: "tech", emoji: "💻" },
  { keywords: ["garden", "plant", "grow", "herb", "compost", "greenhouse"], theme: "garden", emoji: "🌱" },
  { keywords: ["woodwork", "carpentr", "weld", "blacksmith", "forge", "build"], theme: "build", emoji: "🔨" },
  { keywords: ["photograph", "photo", "camera", "film"], theme: "art", emoji: "📷" },
  { keywords: ["knit", "crochet", "sew", "embroid", "stitch"], theme: "art", emoji: "🧶" },
  { keywords: ["write", "book", "novel", "blog", "script", "screenplay", "podcast"], theme: "write", emoji: "✍️" },
  { keywords: ["language", "spanish", "french", "japanese", "korean", "mandarin", "arabic", "portuguese"], theme: "lang", emoji: "🗣️" },
  { keywords: ["chess", "board game", "video game", "gaming"], theme: "game", emoji: "♟️" },
  { keywords: ["climb", "boulder", "hike", "backpack", "camp"], theme: "advent", emoji: "🧗" },
];

function stemToken(token: string): string {
  let t = token.toLowerCase();
  if (t.endsWith("'s")) t = t.slice(0, -2);
  if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("ers") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("er") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("es") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("s") && t.length > 3) return t.slice(0, -1);
  return t;
}

type Normalized = {
  spaced: string;
  tokens: string[];
  tokenSet: Set<string>;
};

function normalize(text: string): Normalized {
  const spaced = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const tokens = spaced.split(" ").filter(Boolean).map(stemToken);
  return { spaced, tokens, tokenSet: new Set(tokens) };
}

/**
 * Score of one keyword against a goal. Phrases are worth 2 so that a theme
 * can out-bid another theme that merely owns one of the words. Single words
 * must match a whole token, or prefix a token when they are long enough to be
 * unambiguous — a short prefix match would let "a" in "Build a go-kart" hit
 * keywords like "art".
 */
function keywordScore(
  { spaced, tokens, tokenSet }: Normalized,
  keyword: string,
): number {
  if (!keyword) return 0;
  if (keyword.includes(" ")) return spaced.includes(keyword) ? 2 : 0;
  const stemmed = stemToken(keyword);
  if (tokenSet.has(stemmed)) return 1;
  if (stemmed.length >= 5 && tokens.some((t) => t.startsWith(stemmed))) return 1;
  return 0;
}

export function matchGoalTheme(goalText: string): ThemeMatch | null {
  const normalized = normalize(goalText);
  if (!normalized.spaced) return null;

  for (const lead of LEADS) {
    if (lead.keywords.some((kw) => keywordScore(normalized, kw) > 0)) {
      return { theme: lead.theme, leadEmoji: lead.emoji };
    }
  }

  let bestTheme: ThemeKey | null = null;
  let bestScore = 0;
  for (const key of THEME_KEYS) {
    let score = 0;
    for (const keyword of THEMES[key].keywords) {
      score += keywordScore(normalized, keyword);
    }
    // Strictly greater, so an earlier theme in the registry wins a tie.
    if (score > bestScore) {
      bestScore = score;
      bestTheme = key;
    }
  }

  return bestTheme ? { theme: bestTheme } : null;
}
