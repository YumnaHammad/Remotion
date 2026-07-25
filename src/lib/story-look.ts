/**
 * Turn plain-English look prompts (+ story text) into procedural
 * character colors and 3D world themes. Not full AI mesh generation —
 * keyword-driven look that matches the user's story.
 */

export type WorldTheme =
  | "city"
  | "night"
  | "neon"
  | "desert"
  | "forest"
  | "ocean"
  | "snow"
  | "space";

export interface CharacterLook {
  skin: string;
  shirt: string;
  accent: string;
  hair: string;
  scale: number;
  /** Short label shown in UI */
  label: string;
}

export interface MapLook {
  theme: WorldTheme;
  seed: number;
  sky: string;
  fog: string;
  ground: string;
  road: string;
  palette: string[];
  buildingHeight: number;
  density: number;
  label: string;
}

export interface StoryLook {
  character: CharacterLook;
  map: MapLook;
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 100000) + 1;
}

function includesAny(hay: string, needles: string[]) {
  return needles.some((n) => hay.includes(n));
}

export function resolveCharacterLook(
  prompt: string,
  fallbacks?: { accent?: string; brandColor?: string }
): CharacterLook {
  const p = prompt.toLowerCase();
  const accent = fallbacks?.accent ?? "#0b84f3";
  const brand = fallbacks?.brandColor ?? "#1e3a5f";

  let skin = "#f5d0b0";
  let shirt = brand;
  let hair = "#1a1a2e";
  let scale = 1;
  let label = "Cartoon guide";

  if (includesAny(p, ["robot", "android", "cyborg", "mech"])) {
    skin = "#c5d0dc";
    shirt = "#4b5563";
    hair = "#64748b";
    label = "Robot guide";
  } else if (includesAny(p, ["alien", "green skin", "martian"])) {
    skin = "#86efac";
    shirt = "#166534";
    hair = "#14532d";
    label = "Alien guide";
  } else if (includesAny(p, ["wizard", "mage", "magic"])) {
    skin = "#f5d0b0";
    shirt = "#6d28d9";
    hair = "#fbbf24";
    label = "Wizard guide";
  } else if (includesAny(p, ["superhero", "hero", "cape"])) {
    skin = "#f5d0b0";
    shirt = "#dc2626";
    hair = "#111827";
    label = "Hero guide";
  } else if (includesAny(p, ["girl", "woman", "lady", "she "])) {
    skin = "#f5d0b0";
    shirt = "#ec4899";
    hair = "#4a2c2a";
    label = "Guide";
  } else if (includesAny(p, ["boy", "man", "guy", "he "])) {
    skin = "#e8b98a";
    shirt = accent;
    hair = "#1a1a2e";
    label = "Guide";
  }

  if (includesAny(p, ["blue"])) shirt = "#2563eb";
  if (includesAny(p, ["red"])) shirt = "#dc2626";
  if (includesAny(p, ["green"])) shirt = "#16a34a";
  if (includesAny(p, ["purple", "violet"])) shirt = "#7c3aed";
  if (includesAny(p, ["yellow", "gold"])) shirt = "#ca8a04";
  if (includesAny(p, ["black"])) shirt = "#1f2937";
  if (includesAny(p, ["white"])) shirt = "#e5e7eb";
  if (includesAny(p, ["orange"])) shirt = "#ea580c";
  if (includesAny(p, ["pink"])) shirt = "#db2777";

  if (includesAny(p, ["dark skin", "brown skin", "deep skin"])) skin = "#8d5524";
  if (includesAny(p, ["pale", "fair"])) skin = "#ffe4c9";
  if (includesAny(p, ["blonde", "blond"])) hair = "#d4a017";
  if (includesAny(p, ["redhead", "ginger", "red hair"])) hair = "#b45309";
  if (includesAny(p, ["white hair", "silver hair", "grey hair", "gray hair"]))
    hair = "#d1d5db";
  if (includesAny(p, ["bald"])) hair = skin;

  if (includesAny(p, ["tall", "giant", "big"])) scale = 1.15;
  if (includesAny(p, ["small", "tiny", "kid", "child"])) scale = 0.82;

  if (prompt.trim() && label === "Cartoon guide") {
    const first = prompt.trim().split(/[,.]/)[0]?.trim();
    if (first && first.length < 40) label = first;
  }

  return { skin, shirt, accent, hair, scale, label };
}

export function resolveMapLook(
  prompt: string,
  script = ""
): MapLook {
  const combined = `${prompt} ${script}`.toLowerCase();
  const seed = hashSeed(prompt.trim() || script.trim() || "city");

  let theme: WorldTheme = "city";
  let label = "City";
  let sky = "#87b5d9";
  let fog = "#b8d4e8";
  let ground = "#4a5560";
  let road = "#2d3340";
  let palette = ["#3d5a80", "#98c1d9", "#e0fbfc", "#293241", "#ee6c4d", "#5c677d"];
  let buildingHeight = 1;
  let density = 1;

  if (includesAny(combined, ["night", "evening", "midnight", "dark city"])) {
    theme = "night";
    label = "Night city";
    sky = "#0b1020";
    fog = "#1a2238";
    ground = "#1c1f2a";
    road = "#0f1118";
    palette = ["#1e293b", "#334155", "#475569", "#0ea5e9", "#6366f1", "#f59e0b"];
  } else if (includesAny(combined, ["neon", "cyber", "tokyo", "futur"])) {
    theme = "neon";
    label = "Neon city";
    sky = "#12081f";
    fog = "#2a1450";
    ground = "#1a1028";
    road = "#0d0818";
    palette = ["#22d3ee", "#a855f7", "#f472b6", "#1e1b4b", "#312e81", "#06b6d4"];
    buildingHeight = 1.35;
  } else if (includesAny(combined, ["desert", "sand", "canyon", "dune"])) {
    theme = "desert";
    label = "Desert";
    sky = "#f0c27a";
    fog = "#e8d5a3";
    ground = "#c2a15a";
    road = "#a8874a";
    palette = ["#d4a373", "#e9c46a", "#bc6c25", "#8b5e34", "#f4a261", "#6c584c"];
    buildingHeight = 0.55;
    density = 0.55;
  } else if (includesAny(combined, ["forest", "jungle", "woods", "trees"])) {
    theme = "forest";
    label = "Forest";
    sky = "#8fbc8f";
    fog = "#c5e1c5";
    ground = "#3d5c3a";
    road = "#2f452c";
    palette = ["#2d6a4f", "#40916c", "#52b788", "#1b4332", "#95d5b2", "#081c15"];
    buildingHeight = 0.7;
    density = 0.7;
  } else if (includesAny(combined, ["ocean", "beach", "sea", "harbor", "coast"])) {
    theme = "ocean";
    label = "Coastal town";
    sky = "#7ec8e3";
    fog = "#cce7f0";
    ground = "#d2b48c";
    road = "#b8956a";
    palette = ["#48cae4", "#023e8a", "#0077b6", "#90e0ef", "#caf0f8", "#03045e"];
    buildingHeight = 0.65;
  } else if (includesAny(combined, ["snow", "winter", "ice", "arctic"])) {
    theme = "snow";
    label = "Snow city";
    sky = "#d6e4f0";
    fog = "#eef3f8";
    ground = "#e8eef5";
    road = "#c5d0dc";
    palette = ["#94a3b8", "#e2e8f0", "#64748b", "#cbd5e1", "#38bdf8", "#1e293b"];
  } else if (includesAny(combined, ["space", "planet", "mars", "galaxy", "moon"])) {
    theme = "space";
    label = "Space colony";
    sky = "#050510";
    fog = "#120820";
    ground = "#2a2a35";
    road = "#15151f";
    palette = ["#6366f1", "#a78bfa", "#f8fafc", "#312e81", "#7c3aed", "#e0e7ff"];
    buildingHeight = 1.2;
  } else if (includesAny(combined, ["tower", "skyscraper", "downtown", "metro"])) {
    theme = "city";
    label = "Tall city";
    buildingHeight = 1.45;
  } else if (includesAny(combined, ["village", "town", "small"])) {
    label = "Town";
    buildingHeight = 0.55;
    density = 0.65;
  }

  if (prompt.trim() && !includesAny(prompt.toLowerCase(), [theme])) {
    const first = prompt.trim().split(/[,.]/)[0]?.trim();
    if (first && first.length < 36) label = first;
  }

  return {
    theme,
    seed,
    sky,
    fog,
    ground,
    road,
    palette,
    buildingHeight,
    density,
    label,
  };
}

/** Combine optional look prompts with the spoken script for a full look pack. */
export function resolveStoryLook(opts: {
  characterPrompt?: string;
  worldPrompt?: string;
  script?: string;
  accent?: string;
  brandColor?: string;
}): StoryLook {
  const script = opts.script ?? "";
  const characterPrompt =
    opts.characterPrompt?.trim() ||
    (includesAny(script.toLowerCase(), ["guide", "character", "host", "robot"])
      ? script
      : "friendly cartoon guide");
  const worldPrompt =
    opts.worldPrompt?.trim() ||
    (includesAny(script.toLowerCase(), [
      "city",
      "tower",
      "desert",
      "forest",
      "ocean",
      "night",
      "neon",
      "space",
      "snow",
    ])
      ? script
      : "modern city with towers");

  return {
    character: resolveCharacterLook(characterPrompt, {
      accent: opts.accent,
      brandColor: opts.brandColor,
    }),
    map: resolveMapLook(worldPrompt, script),
  };
}
