/**
 * Turning a theme (or a raw goal) into the emojis a surface should show.
 */

import { matchGoalTheme, type ThemeMatch } from "./match";
import { FALLBACK_EMOJIS, isThemeKey, themeOf, type ThemeKey } from "./themes";

export type PoolOptions = {
  /**
   * Include each theme's `more` emojis. Use this where emojis are shown one
   * after another over time; leave it off where only two or three are shown
   * at once and every one of them should read as obviously on-theme.
   */
  wide?: boolean;
  /**
   * The emoji that will lead the set. If it is one of the theme's `distinct`
   * alternatives, its siblings are removed so they cannot appear alongside it.
   */
  lead?: string;
};

/** The emojis for a theme: core-first ordered, deduplicated. */
export function poolFor(theme: ThemeKey, options: PoolOptions = {}): string[] {
  const { core, more, distinct } = themeOf(theme);
  // Deduplicated here rather than policed by a test, so that an emoji listed
  // twice in the registry is harmless instead of letting one emoji turn up
  // twice in a set that is supposed to show three different things.
  const pool = [...new Set(options.wide ? [...core, ...more] : core)];

  if (!options.lead || !distinct?.includes(options.lead)) return pool;

  const siblings = distinct.filter((emoji) => emoji !== options.lead);
  const filtered = pool.filter((emoji) => !siblings.includes(emoji));
  // A theme made almost entirely of alternatives (ride, say) can be filtered
  // down to nothing useful; fall back rather than render a lonely single emoji.
  return filtered.length >= 2 ? filtered : pool;
}

/**
 * The emojis for a free-text goal, falling back to the generic set when
 * nothing matches. `theme` short-circuits the matcher — pass the theme the
 * landing page already resolved instead of re-deriving it from the text.
 */
export function poolForGoal(
  goal: string,
  theme?: string | null,
  options: PoolOptions = {},
): string[] {
  if (isThemeKey(theme)) return poolFor(theme, options);
  const match = matchGoalTheme(goal);
  return match ? poolFor(match.theme, { ...options, lead: match.leadEmoji }) : [...FALLBACK_EMOJIS];
}

/** One emoji from `pool`, avoiding `exclude` unless that leaves nothing. */
export function pickOne(pool: readonly string[], exclude: readonly string[] = []): string {
  const available = pool.filter((e) => !exclude.includes(e));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * `count` distinct emojis from `pool`, avoiding `exclude`. Clamped to what is
 * actually available — overdrawing would splice past the end of the array and
 * render blank tiles.
 */
export function pickMany(
  pool: readonly string[],
  count: number,
  exclude: readonly string[] = [],
): string[] {
  const available = pool.filter((e) => !exclude.includes(e));
  const result: string[] = [];
  const n = Math.min(count, available.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available.splice(idx, 1)[0]);
  }
  return result;
}

/**
 * A `size`-emoji set led by `lead`, the rest drawn from `theme`. This is the
 * landing page's row: the leading emoji is the one the visitor just pointed
 * at, so it is always present and always first.
 */
export function setLedBy(
  lead: string,
  theme: ThemeKey,
  size: number,
  exclude: readonly string[] = [],
): string[] {
  const pool = poolFor(theme, { lead });
  const rest = pickMany(
    pool.filter((emoji) => emoji !== lead),
    size - 1,
    exclude,
  );
  return [lead, ...rest];
}

/**
 * The set for a matched goal: led by the match's specific emoji when it has
 * one, otherwise drawn from the theme at large.
 */
export function setForMatch(
  match: ThemeMatch,
  size: number,
  exclude: readonly string[] = [],
): string[] {
  return match.leadEmoji
    ? setLedBy(match.leadEmoji, match.theme, size, exclude)
    : pickMany(poolFor(match.theme), size, exclude);
}
