"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiKey } from "@/lib/hooks/useApiKey";

const SUGGESTIONS = [
  // --- initial 8 ---
  ["🎣", "Learn to fly fish"],
  ["🏃", "Run a marathon"],
  ["🎸", "Learn to play guitar"],
  ["💼", "Start a small business"],
  ["🏊", "Become a triathlon athlete"],
  ["🤖", "Learn machine learning"],
  ["👨‍🍳", "Become a home chef"],
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
  "💀", "☠️", "⚰️", "👻", "🦴", "🕯️", "⚱️", "🥀",
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
  "🎯", "🪁", "🛶", "⛺", "🎠", "🎡", "🌈", "⭐", "🔥", "🛋️",
];

const SOMBER_EMOJIS = [
  "😴",
  "🥱",
  "🛋️",
  "💀",
  "☠️",
  "⚰️",
  "👻",
  "🦴",
  "🕯️",
  "⚱️",
  "🥀",
];
const FUN_EMOJIS = EMOJIS.filter((emoji) => !SOMBER_EMOJIS.includes(emoji));
const DEFAULT_EMOJIS = ["🥱", "🛋️", "😴"];

function pickRandom(pool: string[], count: number, exclude: string[]): string[] {
  const available = pool.filter((e) => !exclude.includes(e));
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available.splice(idx, 1)[0]);
  }
  return result;
}

// Themed emoji pools for pill hover — emojis adapt to match the hovered suggestion
const THEME_POOLS: Record<string, string[]> = {
  water: ["🐟", "🐠", "🦈", "🐋", "🐬", "🌊", "⛵", "🚣", "🐚", "🪸", "🦑", "🐡", "🦞", "🏄", "🤿", "🎣", "🚤"],
  run: ["🏃", "👟", "🏅", "🥇", "💨", "🏁", "🎽", "⏱️", "🏆", "💪", "🦵", "🥈"],
  music: ["🎵", "🎶", "🎸", "🎹", "🎻", "🥁", "🎷", "🎺", "🎤", "🎧", "🎼", "🪕", "🪗", "🪈"],
  cook: ["🍳", "👨‍🍳", "🔪", "🥘", "🍽️", "🥄", "🍲", "🥢", "🧑‍🍳", "🫕", "🍖", "🧈", "🥣", "♨️", "🫙"],
  bake: ["🍞", "🥐", "🧁", "🍰", "🥧", "🎂", "🍪", "🥖", "🧇", "🫓", "🧑‍🍳"],
  drink: ["🍺", "🍷", "☕", "🥃", "🫖", "🍶", "🥂", "🍸", "🧋", "🍹", "🫗", "🍾", "🥤"],
  tech: ["💻", "🖥️", "📱", "⌨️", "🤖", "💾", "📡", "🔌", "🧬", "📊", "💡", "🔋", "🖱️"],
  garden: ["🌱", "🌿", "🍀", "🌳", "🌻", "🌸", "🪴", "🐝", "🦋", "🐛", "🌼", "🪻", "🌺", "☘️", "🌲"],
  art: ["🎨", "🖌️", "✏️", "🖍️", "🖼️", "🏺", "✂️", "🪡", "🧵", "📐", "🪆", "🧶", "💎", "🎭"],
  build: ["🔨", "🔧", "🪚", "⚒️", "🏗️", "🪵", "🧱", "📐", "🪜", "🏠", "🛠️", "⚙️", "🔩", "🪛"],
  write: ["✍️", "📝", "📖", "📚", "🖊️", "📰", "🎬", "📺", "🎙️", "📻", "🖋️", "📜"],
  advent: ["🏔️", "⛰️", "🏕️", "🌄", "🗻", "🧭", "🗺️", "🥾", "🎒", "⛺", "🌅", "🧗", "🏜️"],
  biz: ["💼", "📈", "💰", "🏪", "🛍️", "📦", "🤝", "💡", "📋", "🏷️", "🧾", "🛒"],
  animal: ["🐶", "🐱", "🐴", "🐔", "🦜", "🐦", "🐕", "🐾", "🐣", "🐰", "🦮", "🐾"],
  farm: ["🌾", "🚜", "🐓", "🐑", "🐐", "🥛", "🧈", "🍯", "🐝", "🌽", "🥚", "🐄"],
  combat: ["🥊", "🤺", "🏹", "🥋", "⚔️", "🛡️", "💪", "🎯", "🤼", "🦾", "👊", "🥷"],
  lang: ["🗣️", "💬", "🌍", "🌏", "✈️", "🗺️", "📝", "🎓", "🌐", "📚", "💭", "🗨️"],
  game: ["♟️", "🎲", "🎯", "🏆", "🧩", "🎮", "🃏", "🎳", "🏓", "⛳", "🎾", "🎱"],
  ride: ["🚗", "🏍️", "🛹", "🚲", "🏎️", "🛞", "⛽", "🔧", "🏁", "🛻", "🛵", "🚙"],
  science: ["🔬", "🔭", "🧪", "🧬", "⚗️", "🌌", "⭐", "🪐", "🧠", "💡", "🔮", "📡"],
  perform: ["🎤", "🎭", "💃", "🕺", "🤹", "🎪", "🎶", "👯", "🎬", "📺", "🎙️", "🪄"],
  zen: ["🧘", "🕉️", "🙏", "🪷", "📿", "💆", "🌸", "🫧", "☮️", "🍃"],
  ice: ["❄️", "🧊", "⛸️", "⛷️", "🏂", "🌨️", "☃️", "🎿", "🏔️", "🦌", "⛰️"],
};

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

const PILL_SPECIFIC_POOLS: Record<string, string[]> = {
  "🎸": ["🎸", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🎹": ["🎹", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🥁": ["🥁", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🎻": ["🎻", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🎺": ["🎺", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🎷": ["🎷", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🪕": ["🪕", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🪈": ["🪈", "🎵", "🎶", "🎤", "🎧", "🎼"],
  "🪗": ["🪗", "🎵", "🎶", "🎤", "🎧", "🎼"],
};

type ThemeKey = keyof typeof CORE_THEME_POOLS;

const KEYWORD_LEADS: Array<{ keywords: string[]; theme: ThemeKey; emoji: string }> = [
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

const THEME_KEYWORDS: Record<ThemeKey, string[]> = {
  water: ["water", "swim", "surf", "sail", "boat", "ocean", "lake", "river", "dive", "scuba", "paddle", "kayak", "snorkel", "windsurf"],
  run: ["run", "runner", "jog", "marathon", "race", "sprint", "workout", "gym", "fitness", "lift", "weight", "strength", "buff", "cardio"],
  music: ["music", "guitar", "piano", "drum", "violin", "sing", "band", "song", "compose", "dj", "produce"],
  cook: ["cook", "chef", "recipe", "meal", "dinner", "kitchen", "pasta", "bbq", "grill"],
  bake: ["bake", "bread", "cake", "pastry", "sourdough", "cookie", "dessert", "pie"],
  drink: ["coffee", "espresso", "tea", "drink", "brew", "beer", "wine", "cocktail", "kombucha", "barista"],
  tech: ["code", "program", "software", "app", "website", "web", "robot", "ai", "tech", "data", "cyber", "arduino", "3d print"],
  garden: ["garden", "plant", "grow", "herb", "compost", "farm", "greenhouse", "seed", "soil"],
  art: ["art", "paint", "draw", "craft", "sculpt", "pottery", "ceramic", "design", "photo", "photograph", "calligraphy", "ink", "tattoo"],
  build: ["build", "woodwork", "carpentr", "weld", "forge", "blacksmith", "tool", "diy", "renovat", "furniture"],
  write: ["write", "book", "novel", "blog", "story", "screenplay", "script", "podcast", "journal"],
  advent: ["hike", "climb", "camp", "trail", "mountain", "adventure", "explore", "backpack", "trek", "outdoor"],
  biz: ["business", "startup", "company", "brand", "entrepreneur", "market", "sell", "sales", "shop", "side hustle"],
  animal: ["dog", "cat", "horse", "bird", "chicken", "pet", "animal", "train", "trainer"],
  farm: ["farm", "chicken", "goat", "sheep", "cow", "dairy", "honey", "orchard"],
  combat: ["box", "fight", "martial", "karate", "kickbox", "wrestle", "fenc", "jiu jitsu", "mma"],
  lang: ["language", "spanish", "french", "german", "japanese", "korean", "mandarin", "arabic", "portuguese", "translate", "lingo"],
  game: ["game", "gaming", "chess", "board", "darts", "tennis", "ping", "golf", "bowling", "poker"],
  ride: ["ride", "motorcycle", "bike", "biking", "cycling", "car", "truck", "skate", "skating", "scooter"],
  science: ["science", "chem", "physic", "biology", "telescope", "space", "astronomy", "lab", "experiment"],
  perform: ["perform", "acting", "actor", "theater", "dance", "comedy", "improv", "standup", "sing"],
  zen: ["yoga", "meditat", "mindful", "retreat", "breath", "stretch"],
  ice: ["ice", "ski", "snow", "snowboard", "skate", "winter"],
};

// Map each suggestion emoji → theme key
const PILL_THEME: Record<string, string> = {
  // water
  "🎣": "water", "🤿": "water", "🏄": "water", "⛵": "water", "🏊": "water",
  "🐠": "water", "🌊": "water", "🛶": "water", "🪁": "water", "🚤": "water",
  "🦈": "water", "🐋": "water", "🐟": "water",
  // fitness
  "🏃": "run", "🏅": "run", "🏋️": "run", "🤸": "run", "💪": "run",
  "🏁": "run", "🏞️": "run",
  // music
  "🎸": "music", "🎹": "music", "🎻": "music", "🪕": "music", "🥁": "music",
  "🎷": "music", "🎺": "music", "🪈": "music", "🪗": "music", "🎧": "music",
  // cooking
  "👨‍🍳": "cook", "🍣": "cook", "🍜": "cook", "🍕": "cook", "🥟": "cook",
  "🍖": "cook", "🍝": "cook", "🍫": "cook", "🥩": "cook", "🧆": "cook",
  "🌮": "cook", "🥘": "cook", "🍲": "cook", "🫕": "cook", "🐙": "cook",
  "🍛": "cook", "🧀": "cook", "🫙": "cook", "🔪": "cook",
  // baking
  "🍞": "bake", "🥖": "bake", "🧁": "bake", "🍰": "bake", "🥧": "bake", "🥐": "bake",
  // drinks
  "🍺": "drink", "🍷": "drink", "☕": "drink", "🥃": "drink", "🫖": "drink", "🍇": "drink",
  // tech
  "🤖": "tech", "📱": "tech", "🖥️": "tech", "🔐": "tech", "📊": "tech",
  "🧬": "tech", "🖨️": "tech", "🎛️": "tech", "🎮": "tech", "🛸": "tech",
  // garden & nature
  "🥬": "garden", "🌻": "garden", "🦋": "garden", "🌳": "garden", "🌿": "garden",
  "🪴": "garden", "🌶️": "garden", "🐝": "garden", "🌱": "garden", "🐛": "garden",
  "🫚": "garden", "🍎": "garden", "🥕": "garden", "💐": "garden", "🍄": "garden",
  // art & craft
  "🎨": "art", "✒️": "art", "🏺": "art", "🖼️": "art", "📐": "art",
  "🧶": "art", "🧵": "art", "🪢": "art", "🖋️": "art", "🖌️": "art",
  "🗿": "art", "🪆": "art", "🪟": "art", "💎": "art", "🫧": "art",
  "🧳": "art", "💍": "art", "🦷": "art", "✏️": "art",
  // building
  "🏠": "build", "🏡": "build", "⚒️": "build", "🪵": "build", "🔥": "build",
  "⚙️": "build", "🧱": "build", "🪑": "build", "🔩": "build", "🏚️": "build",
  "🛋️": "build", "🔦": "build", "⚡": "build", "🏰": "build", "🪨": "build",
  "🧖": "build",
  // writing & media
  "📖": "write", "🎬": "write", "🎥": "write", "✍️": "write", "📚": "write",
  "📝": "write", "🎞️": "write", "📺": "write", "🎙️": "write", "📕": "write",
  "📻": "write",
  // adventure & outdoors
  "🧗": "advent", "🏔️": "advent", "🏜️": "advent", "🌋": "advent", "🛤️": "advent",
  "🏕️": "advent", "🪂": "advent", "✈️": "advent", "📸": "advent", "🦇": "advent",
  // business
  "💼": "biz", "🚚": "biz", "❤️": "biz", "🛍️": "biz", "👕": "biz",
  "🧼": "biz", "🕯️": "biz", "🧺": "biz", "📷": "biz",
  // animals
  "🐴": "animal", "🐕": "animal", "🐦": "animal", "🦜": "animal", "🐎": "animal",
  // farming
  "🐑": "farm", "🐐": "farm", "🧈": "farm", "🍯": "farm", "🌾": "farm",
  // combat
  "🥊": "combat", "🤺": "combat", "🏹": "combat", "🥋": "combat", "🤼": "combat",
  // languages
  "🌐": "lang", "🇯🇵": "lang", "🇫🇷": "lang", "🇰🇷": "lang", "🇧🇷": "lang",
  "🇸🇦": "lang", "🇨🇳": "lang", "🤟": "lang",
  // games & racket sports
  "♟️": "game", "🎲": "game", "🧮": "game", "🎯": "game", "🎳": "game",
  "⛳": "game", "🏓": "game", "🎾": "game", "🏌️": "game",
  // vehicles
  "🚗": "ride", "🏍️": "ride", "🛹": "ride", "🛼": "ride", "🚵": "ride", "🏎️": "ride",
  // science
  "🔭": "science", "🌌": "science", "🧪": "science", "🧲": "science", "🧠": "science", "📜": "science",
  // performance
  "🎤": "perform", "🤹": "perform", "💃": "perform", "🎭": "perform", "🎪": "perform", "🪄": "perform",
  // wellness
  "🧘": "zen", "📿": "zen",
  // ice & winter
  "⛸️": "ice", "🧊": "ice", "⛷️": "ice", "🏂": "ice",
};

function getThemedPool(pillEmoji: string): string[] {
  const theme = PILL_THEME[pillEmoji];
  return theme
    ? CORE_THEME_POOLS[theme] ?? THEME_POOLS[theme]
    : FUN_EMOJIS;
}

function getLinkedPool(pillEmoji: string): string[] {
  return PILL_SPECIFIC_POOLS[pillEmoji] ?? getThemedPool(pillEmoji);
}

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

function normalizeText(
  text: string,
): { normalized: string; spaced: string; tokens: string[]; tokenSet: Set<string> } {
  const normalized = text.toLowerCase();
  const cleaned = normalized.replace(/[^a-z0-9]+/g, " ").trim();
  const tokens = cleaned
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .map(stemToken);
  return { normalized, spaced: cleaned, tokens, tokenSet: new Set(tokens) };
}

function keywordHit(
  spaced: string,
  tokens: string[],
  tokenSet: Set<string>,
  keyword: string,
): number {
  if (!keyword) return 0;
  if (keyword.includes(" ")) {
    return spaced.includes(keyword) ? 2 : 0;
  }
  const stemmed = stemToken(keyword);
  if (tokenSet.has(stemmed)) return 1;
  if (stemmed.length >= 5 && tokens.some((token) => token.startsWith(stemmed))) {
    return 1;
  }
  return 0;
}

function getTextMatch(goalText: string): { theme: ThemeKey; leadEmoji?: string } | null {
  const { normalized, spaced, tokens, tokenSet } = normalizeText(goalText);
  if (!normalized.trim()) return null;

  for (const lead of KEYWORD_LEADS) {
    if (lead.keywords.some((keyword) => keywordHit(spaced, tokens, tokenSet, keyword) > 0)) {
      return { theme: lead.theme, leadEmoji: lead.emoji };
    }
  }

  let bestTheme: ThemeKey | null = null;
  let bestScore = 0;
  (Object.entries(THEME_KEYWORDS) as [ThemeKey, string[]][]).forEach(
    ([theme, keywords]) => {
      let score = 0;
      for (const keyword of keywords) {
        score += keywordHit(spaced, tokens, tokenSet, keyword);
      }
      if (score > bestScore) {
        bestScore = score;
        bestTheme = theme;
      }
    },
  );

  return bestTheme ? { theme: bestTheme } : null;
}

function pickTextMatchedEmojis(
  match: { theme: ThemeKey; leadEmoji?: string },
  exclude: string[],
): string[] {
  const pool = CORE_THEME_POOLS[match.theme] ?? THEME_POOLS[match.theme];
  if (!pool) return pickRandom(FUN_EMOJIS, 3, exclude);

  if (match.leadEmoji) {
    const filteredPool = pool.filter((emoji) => emoji !== match.leadEmoji);
    return [match.leadEmoji, ...pickRandom(filteredPool, 2, exclude)];
  }

  return pickRandom(pool, 3, exclude);
}

export function GoalInput({ onStepChange }: { onStepChange?: (step: 1 | 2) => void }) {
  const [emojis, setEmojis] = useState(DEFAULT_EMOJIS);
  const [emojiKey, setEmojiKey] = useState(0);
  const hasMounted = useRef(false);
  const lastTextMatchRef = useRef<{ theme: ThemeKey; leadEmoji?: string } | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [goal, setGoal] = useState("");
  const [goalEmoji, setGoalEmoji] = useState("🎯");
  const [hasEngaged, setHasEngaged] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [goalDescription, setGoalDescription] = useState("");
  const [contextPlaceholder, setContextPlaceholder] = useState(
    "What you already know, what you've tried, where you're starting from...",
  );
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentState, setCurrentState] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [location, setLocation] = useState("");
  const [locationMode, setLocationMode] = useState<
    "idle" | "requesting" | "zip-input" | "resolved"
  >("idle");
  const [zipInput, setZipInput] = useState("");
  const expandedGoalRef = useRef<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const currentStateRef = useRef<HTMLTextAreaElement | null>(null);
  const goalInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { apiKey } = useApiKey();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMode("zip-input");
      return;
    }
    setLocationMode("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&zoom=10`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          const state = data.address?.state || "";
          const parts = [city, state].filter(Boolean);
          if (parts.length > 0) {
            setLocation(parts.join(", "));
            setLocationMode("resolved");
          } else {
            setLocationMode("zip-input");
          }
        } catch {
          setLocationMode("zip-input");
        }
      },
      () => {
        setLocationMode("zip-input");
      },
    );
  }, []);

  const handleZipSubmit = useCallback(() => {
    const trimmed = zipInput.trim();
    if (trimmed) {
      setLocation(trimmed);
      setLocationMode("resolved");
    }
  }, [zipInput]);

  const clearLocation = useCallback(() => {
    setLocation("");
    setLocationMode("idle");
    setZipInput("");
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setSuggestionIndex(Math.floor(Math.random() * SUGGESTIONS.length));
    }
  }, []);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "0";
    el.style.height = el.scrollHeight + "px";
  }, []);

  const descriptionCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      descriptionRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  const pickThemedEmojisForSuggestion = useCallback(
    (index: number, exclude: string[]) => {
      const [pillEmoji] = SUGGESTIONS[index];
      const pool = getLinkedPool(pillEmoji);
      const uniquePool = pool.includes(pillEmoji) ? pool : [pillEmoji, ...pool];
      const rest = pickRandom(
        uniquePool.filter((emoji) => emoji !== pillEmoji),
        2,
        exclude,
      );
      return [pillEmoji, ...rest];
    },
    [],
  );

  const currentStateCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      currentStateRef.current = el;
      autoResize(el);
    },
    [autoResize],
  );

  // Auto-resize when goalDescription changes
  useEffect(() => {
    autoResize(descriptionRef.current);
  }, [goalDescription, autoResize]);

  // Auto-resize when currentState changes
  useEffect(() => {
    autoResize(currentStateRef.current);
  }, [currentState, autoResize]);

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
    setHasEngaged(true);
    lastTextMatchRef.current = null;
    setSuggestionIndex((i) => {
      const nextIndex = (i + 1) % SUGGESTIONS.length;
      setGoal(SUGGESTIONS[nextIndex][1]);
      setGoalEmoji(SUGGESTIONS[nextIndex][0]);
      setEmojis((prev) => pickThemedEmojisForSuggestion(nextIndex, prev));
      setEmojiKey((k) => k + 1);
      return nextIndex;
    });
    requestAnimationFrame(() => {
      goalInputRef.current?.focus();
      goalInputRef.current?.setSelectionRange(
        goalInputRef.current.value.length,
        goalInputRef.current.value.length,
      );
    });
  };

  const handleGenerate = () => {
    const params = new URLSearchParams({ goal: goal.trim() });
    if (goalDescription.trim()) {
      params.set("goalDescription", goalDescription.trim());
    }
    if (currentState.trim()) {
      params.set("context", currentState.trim());
    }
    if (location.trim()) {
      params.set("location", location.trim());
    }
    router.push(`/roadmap?${params.toString()}`);
  };

  if (step === 2) {
    return (
      <div className="flex w-full max-w-xl flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-4">
        <button
          onClick={() => {
            setStep(1);
            onStepChange?.(1);
            expandedGoalRef.current = null;
          }}
          className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200 sm:mb-6"
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
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="text-base">📅</span>
              </div>
              <label
                htmlFor="current-state"
                className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
              >
                Today
              </label>

              {locationMode === "resolved" ? (
                <button
                  onClick={clearLocation}
                  className="ml-auto flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {location}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 opacity-60">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : locationMode === "requesting" ? (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Locating...
                </span>
              ) : locationMode === "idle" ? (
                <button
                  onClick={requestLocation}
                  className="ml-auto flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Add location
                </button>
              ) : null}
            </div>
            {locationMode === "zip-input" && !location && (
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
                  placeholder="Enter zip code or city"
                  autoFocus
                  className="w-48 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-blue-900/40"
                />
                <button
                  onClick={handleZipSubmit}
                  disabled={!zipInput.trim()}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Set
                </button>
                <button
                  onClick={() => setLocationMode("idle")}
                  className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              ref={currentStateCallbackRef}
              id="current-state"
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              placeholder={contextPlaceholder}
              rows={1}
              className="mt-1.5 w-full resize-none overflow-hidden rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-200 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Destination — someday */}
          <div className="relative pb-8">
            <div className="-ml-10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <span className="text-base">{goalEmoji}</span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-white">
                Soon
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

        </div>

        <div className="shrink-0 pb-5 pt-4 sm:pb-0 sm:pt-6">
          <button
            onClick={handleGenerate}
            disabled={!goal.trim() || isExpanding}
            className="w-full rounded-xl bg-zinc-900 px-6 py-3.5 text-lg font-semibold transition-colors hover:bg-zinc-700 disabled:opacity-40 sm:py-3 sm:text-base sm:font-medium sm:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            <span className="animate-gradient-text">Generate Roadmap</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <button
        onClick={shuffleEmojis}
        className="mb-10 flex w-full cursor-pointer items-center justify-center gap-2 px-3 sm:gap-3 sm:px-0"
        aria-label="Shuffle emojis"
        type="button"
      >
        <span className="select-none text-[clamp(1.75rem,7vw,2.25rem)] opacity-60">🌱</span>
        <span className="mx-0.5 text-zinc-300 dark:text-zinc-600 sm:mx-1">···</span>
        {emojis.map((emoji, i) => (
          <span
            key={`${emojiKey}-${i}`}
            className="animate-emoji-bounce select-none text-[clamp(2.25rem,10vw,3.75rem)]"
            style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
          >
            {emoji}
          </span>
        ))}
        <span className="mx-0.5 text-zinc-300 dark:text-zinc-600 sm:mx-1">···</span>
        <span className="select-none text-[clamp(1.75rem,7vw,2.25rem)] opacity-60">🪦</span>
      </button>
      <form onSubmit={handleGoalSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={goal}
            ref={goalInputRef}
            onChange={(e) => {
              const nextGoal = e.target.value;
              setGoal(nextGoal);
              const trimmed = nextGoal.trim();
              if (!trimmed) {
                lastTextMatchRef.current = null;
                setEmojis(DEFAULT_EMOJIS);
                setEmojiKey((k) => k + 1);
                return;
              }

              const suggestionMatch = SUGGESTIONS.find(([, t]) => t.toLowerCase() === trimmed.toLowerCase());
              if (suggestionMatch) setGoalEmoji(suggestionMatch[0]);

              const match = getTextMatch(trimmed);
              if (match) {
                setHasEngaged(true);
                if (!suggestionMatch && match.leadEmoji) setGoalEmoji(match.leadEmoji);
                const prevMatch = lastTextMatchRef.current;
                const isSameMatch =
                  prevMatch?.theme === match.theme &&
                  prevMatch?.leadEmoji === match.leadEmoji;
                if (!isSameMatch) {
                  lastTextMatchRef.current = match;
                  setEmojis((prev) => pickTextMatchedEmojis(match, prev));
                  setEmojiKey((k) => k + 1);
                }
                return;
              }

              if (!hasEngaged) {
                setHasEngaged(true);
                lastTextMatchRef.current = null;
                setEmojis(pickRandom(FUN_EMOJIS, 3, emojis));
                setEmojiKey((k) => k + 1);
              }
            }}
            placeholder={SUGGESTIONS[suggestionIndex][1]}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:pr-4"
          />
          <button
            type="submit"
            disabled={!goal.trim()}
            aria-label="Next"
            className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          type="submit"
          disabled={!goal.trim()}
          className="hidden rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:inline-flex"
        >
          Next
        </button>
      </form>
      <div className="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {SUGGESTIONS.slice(0, visibleCount).map(([emoji, text], index) => (
          <button
            key={text}
            onClick={() => {
              setHasEngaged(true);
              lastTextMatchRef.current = null;
              setGoal(text);
              setGoalEmoji(emoji);
              setEmojis((prev) => pickThemedEmojisForSuggestion(index, prev));
              setEmojiKey((k) => k + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={() => {
              setHasEngaged(true);
              lastTextMatchRef.current = null;
              setEmojis((prev) => pickThemedEmojisForSuggestion(index, prev));
              setEmojiKey((k) => k + 1);
            }}
            className="group inline-flex animate-pill-fade-in whitespace-nowrap rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[13px] text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            <span className="mr-1 grayscale transition-[filter] duration-200 group-hover:grayscale-0 sm:mr-1.5">
              {emoji}
            </span>
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
