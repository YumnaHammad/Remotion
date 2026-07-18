export type AudioCategory =
  | "corporate"
  | "cinematic"
  | "social"
  | "podcast"
  | "sfx";

export interface AudioTrack {
  id: string;
  name: string;
  category: AudioCategory;
  duration: string;
  /** CDN URL — must work in browser preview and Remotion render */
  previewUrl: string;
  premium?: boolean;
}

/** Remotion-hosted assets — reliable for preview + MP4 export. */
const R = "https://remotion.media";

export const AUDIO_CATEGORIES: { id: AudioCategory; label: string }[] = [
  { id: "corporate", label: "Corporate music" },
  { id: "cinematic", label: "Cinematic music" },
  { id: "social", label: "Social media music" },
  { id: "podcast", label: "Podcast background" },
  { id: "sfx", label: "Sound effects" },
];

export const AUDIO_LIBRARY: AudioTrack[] = [
  {
    id: "corp-focus",
    name: "Focus Forward",
    category: "corporate",
    duration: "2:30",
    previewUrl: `${R}/lofi.mp3`,
  },
  {
    id: "corp-rise",
    name: "Steady Rise",
    category: "corporate",
    duration: "3:00",
    previewUrl: `${R}/audio.mp3`,
    premium: true,
  },
  {
    id: "cin-epic",
    name: "Epic Horizon",
    category: "cinematic",
    duration: "2:45",
    previewUrl: `${R}/audio.flac`,
    premium: true,
  },
  {
    id: "cin-soft",
    name: "Soft Reveal",
    category: "cinematic",
    duration: "2:10",
    previewUrl: `${R}/dialogue.wav`,
  },
  {
    id: "social-upbeat",
    name: "Upbeat Pop",
    category: "social",
    duration: "1:30",
    previewUrl: `${R}/lofi.mp3`,
  },
  {
    id: "social-lofi",
    name: "Lo-fi Groove",
    category: "social",
    duration: "2:00",
    previewUrl: `${R}/lofi.mp3`,
  },
  {
    id: "pod-calm",
    name: "Calm Conversation",
    category: "podcast",
    duration: "4:00",
    previewUrl: `${R}/dialogue.wav`,
  },
  {
    id: "pod-warm",
    name: "Warm Studio",
    category: "podcast",
    duration: "3:30",
    previewUrl: `${R}/audio.mp3`,
    premium: true,
  },
  {
    id: "sfx-whoosh",
    name: "Whoosh transition",
    category: "sfx",
    duration: "0:02",
    previewUrl: `${R}/whoosh.wav`,
  },
  {
    id: "sfx-pop",
    name: "Pop accent",
    category: "sfx",
    duration: "0:01",
    previewUrl: `${R}/mouse-click.wav`,
  },
  {
    id: "sfx-ding",
    name: "Ding",
    category: "sfx",
    duration: "0:03",
    previewUrl: `${R}/ding.wav`,
  },
  {
    id: "sfx-page",
    name: "Page turn",
    category: "sfx",
    duration: "0:02",
    previewUrl: `${R}/page-turn.wav`,
  },
];

export function getAudioTrack(id: string): AudioTrack | undefined {
  return AUDIO_LIBRARY.find((t) => t.id === id);
}

export function getAudioTrackByUrl(url: string): AudioTrack | undefined {
  return AUDIO_LIBRARY.find((t) => t.previewUrl === url);
}
