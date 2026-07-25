/**
 * Local (no API key) stock visuals for Script → Video.
 * Uses themed Unsplash stills so previews never fall back to Remotion’s color-bar sample.
 */

export type LocalStockKind = "image" | "video";

export interface LocalStockClip {
  id: string;
  name: string;
  url: string;
  kind: LocalStockKind;
  durationSec: number;
  /** Match against scene stock keywords / script text */
  tags: string[];
}

const u = (id: string, w = 1920) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Curated stills — distinct looks per theme. */
export const LOCAL_STOCK_LIBRARY: LocalStockClip[] = [
  {
    id: "stock-playground",
    name: "Playground & kids",
    url: u("photo-1503454537195-1dcabb73ffb9"),
    kind: "image",
    durationSec: 6,
    tags: [
      "playground",
      "children",
      "kids",
      "child",
      "play",
      "park",
      "swing",
      "family",
      "school",
      "toddler",
    ],
  },
  {
    id: "stock-park",
    name: "Park outdoor",
    url: u("photo-1470229722913-7c0e2dbbafd3"),
    kind: "image",
    durationSec: 6,
    tags: ["park", "outdoor", "grass", "picnic", "nature", "green"],
  },
  {
    id: "stock-city",
    name: "City skyline",
    url: u("photo-1480714378408-67cf0d13bc1b"),
    kind: "image",
    durationSec: 8,
    tags: ["city", "urban", "skyline", "downtown", "tower", "building", "metro"],
  },
  {
    id: "stock-night-city",
    name: "Night city",
    url: u("photo-1514565131-fce0801e5785"),
    kind: "image",
    durationSec: 8,
    tags: ["night", "neon", "evening", "lights", "cyber"],
  },
  {
    id: "stock-nature",
    name: "Nature landscape",
    url: u("photo-1506905925346-21bda4d32df4"),
    kind: "image",
    durationSec: 6,
    tags: ["nature", "mountain", "aerial", "landscape", "outdoor", "calm", "forest"],
  },
  {
    id: "stock-office",
    name: "Office team",
    url: u("photo-1522071820081-009f0129c71c"),
    kind: "image",
    durationSec: 5,
    tags: ["office", "business", "corporate", "team", "meeting", "founder", "company"],
  },
  {
    id: "stock-tech",
    name: "Tech workspace",
    url: u("photo-1518770660439-4636190af475"),
    kind: "image",
    durationSec: 7,
    tags: ["tech", "software", "startup", "saas", "computer", "code", "workspace"],
  },
  {
    id: "stock-food",
    name: "Food close-up",
    url: u("photo-1504674900247-0877df9cc836"),
    kind: "image",
    durationSec: 4,
    tags: ["food", "restaurant", "meal", "cooking", "kitchen", "cafe"],
  },
  {
    id: "stock-fitness",
    name: "Fitness",
    url: u("photo-1571019614242-c5c5dee9f50b"),
    kind: "image",
    durationSec: 5,
    tags: ["fitness", "sport", "workout", "gym", "health", "run"],
  },
  {
    id: "stock-celebration",
    name: "Celebration",
    url: u("photo-1530103862676-de8c9debad1d"),
    kind: "image",
    durationSec: 5,
    tags: ["success", "celebrate", "party", "win", "growth", "confetti"],
  },
  {
    id: "stock-sad",
    name: "Quiet moment",
    url: u("photo-1499209974431-9dddcece7f88"),
    kind: "image",
    durationSec: 5,
    tags: ["sad", "lost", "fail", "rain", "lonely", "quiet"],
  },
  {
    id: "stock-idea",
    name: "Creative idea",
    url: u("photo-1454165804606-c3d57bc86b40"),
    kind: "image",
    durationSec: 5,
    tags: ["idea", "innovation", "lightbulb", "creative", "breakthrough", "plan"],
  },
  {
    id: "stock-beach",
    name: "Beach & ocean",
    url: u("photo-1507525428034-b723cf961d3e"),
    kind: "image",
    durationSec: 6,
    tags: ["beach", "ocean", "sea", "coast", "summer", "water"],
  },
  {
    id: "stock-desert",
    name: "Desert",
    url: u("photo-1509316785289-5078909980e8"),
    kind: "image",
    durationSec: 6,
    tags: ["desert", "sand", "dune", "canyon"],
  },
  {
    id: "stock-space",
    name: "Space",
    url: u("photo-1451187580459-43490279c0fa"),
    kind: "image",
    durationSec: 6,
    tags: ["space", "planet", "galaxy", "3d", "sci-fi", "stars"],
  },
  {
    id: "stock-abstract",
    name: "Abstract motion",
    url: u("photo-1557683316-973673baf926"),
    kind: "image",
    durationSec: 5,
    tags: ["abstract", "motion", "color", "gradient", "art"],
  },
];

/** Score how well a clip matches a free-form keyword / sentence. */
export function scoreLocalStock(
  clip: LocalStockClip,
  query: string
): number {
  const lower = query.toLowerCase();
  const tokens = lower.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  let score = 0;
  for (const tag of clip.tags) {
    if (lower.includes(tag)) score += 3;
    for (const t of tokens) {
      if (tag.includes(t) || t.includes(tag)) score += 1;
    }
  }
  const name = clip.name.toLowerCase();
  for (const t of tokens) {
    if (name.includes(t)) score += 2;
  }
  return score;
}

export function pickLocalStockUrl(
  keyword: string,
  sceneIndex = 0
): string {
  let best = LOCAL_STOCK_LIBRARY[0]!;
  let bestScore = -1;
  for (const clip of LOCAL_STOCK_LIBRARY) {
    const s = scoreLocalStock(clip, keyword);
    if (s > bestScore) {
      bestScore = s;
      best = clip;
    }
  }
  if (bestScore <= 0) {
    return LOCAL_STOCK_LIBRARY[sceneIndex % LOCAL_STOCK_LIBRARY.length]!.url;
  }
  return best.url;
}

export function isStockImageUrl(url: string): boolean {
  if (!url) return false;
  if (/images\.unsplash\.com/i.test(url)) return true;
  if (/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(url)) return true;
  return false;
}
